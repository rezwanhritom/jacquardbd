import Order from "../models/Order.js";
import { getSSLCommerz } from "../config/sslcommerz.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../models/Order.js";

const isOrderPaid = (order) => order?.paymentStatus === PAYMENT_STATUS.PAID || order?.status === "paid";
import crypto from "crypto";

const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL || "http://localhost:5001";

/**
 * POST /api/payments/init
 * Body: { amount, currency?, items?, shippingAddress?, productName?, productCategory? }
 * Creates order (pending), initiates SSLCOMMERZ, returns { GatewayPageURL, orderId, tranId }.
 */
export async function initiatePayment(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      amount,
      currency = "BDT",
      items = [],
      shippingAddress = {},
      productName = "Order",
      productCategory = "general",
      productProfile = "general",
    } = req.body;

    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount required" });
    }

    const tranId = `TXN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const order = await Order.create({
      user: userId,
      amount: numAmount,
      currency: currency.toUpperCase(),
      status: ORDER_STATUS.PENDING,
      items: Array.isArray(items) ? items : [],
      shippingAddress,
      sslcommerz: { tran_id: tranId },
    });

    const sslcz = getSSLCommerz();
    const cusName = req.user.name || "Customer";
    const cusEmail = req.user.email || "customer@example.com";
    const data = {
      total_amount: numAmount,
      currency: currency.toUpperCase(),
      tran_id: tranId,
      success_url: `${BASE_URL}/api/payments/success`,
      fail_url: `${BASE_URL}/api/payments/fail`,
      cancel_url: `${BASE_URL}/api/payments/cancel`,
      ipn_url: `${BASE_URL}/api/payments/ipn`,
      shipping_method: "NO",
      product_name: productName,
      product_category: productCategory,
      product_profile: productProfile,
      cus_name: cusName,
      cus_email: cusEmail,
      cus_add1: shippingAddress.address || "N/A",
      cus_add2: shippingAddress.address2 || "",
      cus_city: shippingAddress.city || "N/A",
      cus_state: shippingAddress.state || "",
      cus_postcode: shippingAddress.zip || "1000",
      cus_country: shippingAddress.country || "Bangladesh",
      cus_phone: shippingAddress.phone || "01700000000",
      ship_name: cusName,
      ship_add1: shippingAddress.address || "N/A",
      ship_city: shippingAddress.city || "N/A",
      ship_country: shippingAddress.country || "Bangladesh",
    };

    const apiResponse = await sslcz.init(data);
    const gatewayUrl = apiResponse?.GatewayPageURL;
    if (!gatewayUrl) {
      await Order.updateOne({ _id: order._id }, { $set: { status: ORDER_STATUS.FAILED } });
      return res.status(502).json({ success: false, message: "Payment gateway error" });
    }

    res.json({
      success: true,
      GatewayPageURL: gatewayUrl,
      orderId: order._id,
      tranId,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/payments/success?tran_id=...&val_id=... (redirect from SSLCOMMERZ)
 * Validate with val_id, update order to paid (idempotent), redirect to frontend success URL.
 */
export async function paymentSuccess(req, res, next) {
  try {
    const { tran_id, val_id } = req.query;
    if (!tran_id || !val_id) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=fail&reason=missing_params`);
    }
    const order = await Order.findOne({ "sslcommerz.tran_id": tran_id }).lean();
    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=fail&reason=order_not_found`);
    }
    if (isOrderPaid(order)) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?orderId=${order._id}&tran_id=${tran_id}`);
    }
    const sslcz = getSSLCommerz();
    const validateRes = await sslcz.validate({ val_id });
    const status = validateRes?.status;
    if (status !== "VALID" && status !== "VALIDATED") {
      await Order.updateOne({ _id: order._id }, { $set: { status: ORDER_STATUS.FAILED } });
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=fail&reason=validation_failed`);
    }
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          status: ORDER_STATUS.CONFIRMED,
          paymentStatus: PAYMENT_STATUS.PAID,
          "sslcommerz.val_id": validateRes?.val_id,
          "sslcommerz.card_type": validateRes?.card_type,
          "sslcommerz.card_no": validateRes?.card_no,
          "sslcommerz.bank_tran_id": validateRes?.bank_tran_id,
          "sslcommerz.card_issuer": validateRes?.card_issuer,
          "sslcommerz.card_brand": validateRes?.card_brand,
          "sslcommerz.currency_type": validateRes?.currency_type,
          "sslcommerz.currency_amount": validateRes?.currency_amount,
          "sslcommerz.risk_level": validateRes?.risk_level,
          "sslcommerz.risk_title": validateRes?.risk_title,
        },
      }
    );
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?orderId=${order._id}&tran_id=${tran_id}`);
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/payment?status=fail&reason=error`);
  }
}

/**
 * GET /api/payments/fail (redirect from SSLCOMMERZ)
 */
export async function paymentFail(req, res, next) {
  try {
    const { tran_id } = req.query;
    if (tran_id) {
      await Order.updateOne(
        { "sslcommerz.tran_id": tran_id, status: ORDER_STATUS.PENDING },
        { $set: { status: ORDER_STATUS.FAILED } }
      );
    }
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=fail&tran_id=${tran_id || ""}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=fail`);
  }
}

/**
 * GET /api/payments/cancel (redirect from SSLCOMMERZ)
 */
export async function paymentCancel(req, res, next) {
  try {
    const { tran_id } = req.query;
    if (tran_id) {
      await Order.updateOne({ "sslcommerz.tran_id": tran_id, status: ORDER_STATUS.PENDING }, { $set: { status: ORDER_STATUS.CANCELLED } });
    }
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=cancelled&tran_id=${tran_id || ""}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=cancelled`);
  }
}

/**
 * POST /api/payments/ipn (Instant Payment Notification - server-to-server from SSLCOMMERZ)
 * Validate and update order to paid; idempotent (do not double-confirm).
 */
export async function paymentIpn(req, res, next) {
  try {
    const body = req.body || {};
    const { val_id, tran_id, status } = body;
    if (!tran_id) {
      return res.status(400).json({ success: false, message: "tran_id required" });
    }
    const order = await Order.findOne({ "sslcommerz.tran_id": tran_id }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (isOrderPaid(order)) {
      return res.json({ success: true, message: "Already confirmed" });
    }
    if (status !== "VALID" && status !== "VALIDATED") {
      await Order.updateOne({ _id: order._id }, { $set: { status: ORDER_STATUS.FAILED } });
      return res.json({ success: true, message: "Order updated to failed" });
    }
    if (val_id) {
      const sslcz = getSSLCommerz();
      const validateRes = await sslcz.validate({ val_id });
      const vStatus = validateRes?.status;
      if (vStatus !== "VALID" && vStatus !== "VALIDATED") {
        await Order.updateOne({ _id: order._id }, { $set: { status: ORDER_STATUS.FAILED } });
        return res.json({ success: true, message: "Validation failed" });
      }
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            status: ORDER_STATUS.CONFIRMED,
            paymentStatus: PAYMENT_STATUS.PAID,
            "sslcommerz.val_id": validateRes?.val_id,
            "sslcommerz.bank_tran_id": validateRes?.bank_tran_id,
            "sslcommerz.card_type": validateRes?.card_type,
            "sslcommerz.card_no": validateRes?.card_no,
            "sslcommerz.card_issuer": validateRes?.card_issuer,
            "sslcommerz.card_brand": validateRes?.card_brand,
            "sslcommerz.currency_type": validateRes?.currency_type,
            "sslcommerz.currency_amount": validateRes?.currency_amount,
          },
        }
      );
    } else {
      await Order.updateOne(
        { _id: order._id },
        { $set: { status: ORDER_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.PAID } }
      );
    }
    res.json({ success: true, message: "IPN processed" });
  } catch (err) {
    next(err);
  }
}

