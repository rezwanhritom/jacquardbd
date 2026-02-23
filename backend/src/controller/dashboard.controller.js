import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { PAYMENT_STATUS } from "../models/Order.js";

const PAID_MATCH = { $or: [{ paymentStatus: PAYMENT_STATUS.PAID }, { status: "paid" }] };

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * GET /api/dashboard
 * Returns dashboard stats: KPIs, sales overview (last 12 months), top selling products, recent orders.
 * Admin only.
 */
export async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // KPIs: use all orders for totalOrders; only paid orders for revenue
    const [totalOrders, paidRevenueResult, totalCustomers, totalProducts, recentOrdersList] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: PAID_MATCH },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]).then((r) => r[0] || { totalRevenue: 0 }),
      User.countDocuments(),
      Product.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),
    ]);

    const totalRevenue = paidRevenueResult.totalRevenue ?? 0;

    // Sales overview: last 12 months (from paid orders)
    const salesByMonth = await Order.aggregate([
      { $match: { ...PAID_MATCH, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          amount: 1,
          itemsQuantity: { $sum: "$items.quantity" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalIncome: { $sum: "$amount" },
          totalProductsSold: { $sum: "$itemsQuantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build 12 months array: latest month first (current, then previous 11 months)
    const salesOverview = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = `${MONTH_NAMES[d.getMonth()]} ${year}`;
      const found = salesByMonth.find((s) => s._id.year === year && s._id.month === month);
      salesOverview.push({
        monthYear: label,
        totalIncome: found ? found.totalIncome : 0,
        totalProductsSold: found ? found.totalProductsSold : 0,
      });
    }

    // Top selling products: from paid orders
    const topByQuantity = await Order.aggregate([
      { $match: PAID_MATCH },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    const productIds = topByQuantity.map((t) => t._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));

    const topSellingProducts = topByQuantity.map((t) => {
      const product = productMap[String(t._id)];
      return {
        productId: t._id,
        name: product?.name ?? "Unknown",
        images: product?.images ?? [],
        quantitySold: t.quantitySold,
        revenue: t.revenue ?? 0,
        stock: product?.stockQuantity ?? 0,
      };
    });

    // Recent orders: format for frontend
    const recentOrders = recentOrdersList.map((o) => ({
      id: o._id,
      orderId: `ORD-${String(o._id).slice(-10).toUpperCase()}`,
      customer: o.user?.name ?? "Guest",
      email: o.user?.email ?? "",
      date: o.createdAt,
      status: o.status,
      total: o.amount,
      items: (o.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0),
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        salesOverview,
        topSellingProducts,
        recentOrders,
      },
    });
  } catch (err) {
    next(err);
  }
}
