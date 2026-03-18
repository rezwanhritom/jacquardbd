import { jsPDF } from "jspdf";

function formatStatus(status) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getPaymentStatusDisplay(order) {
  const ps =
    order.paymentStatus ||
    (order.status === "paid" ? "paid" : order.status === "cancelled" ? "cancelled" : "pending");
  return formatStatus(ps);
}

/**
 * Download order invoice as PDF (same layout as Account → Order details).
 * @param {object} order — items, shippingAddress, amount or total, orderId, _id, status, currency, date/createdAt
 * @param {{ guest?: boolean }} [opts]
 */
export function downloadOrderInvoice(order, opts = {}) {
  const addr = order.shippingAddress || {};
  const items = order.items || [];
  const orderId = String(order.orderId || order._id || "—");
  const rawDate = order.date ?? order.createdAt ?? order.created_at;
  const dateStr = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const orderStatus = formatStatus(order.status);
  const paymentStatus = getPaymentStatusDisplay(order);
  const total = Number(order.total ?? order.amount ?? 0).toFixed(2);
  const currency = order.currency || "BDT";

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 20;
  const lineH = 7;
  const smallH = 5;

  doc.setFontSize(18);
  doc.text(opts.guest ? "Invoice (guest)" : "Invoice", 20, y);
  y += lineH + 2;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Order ID: ${orderId}  |  Date: ${dateStr}`, 20, y);
  y += lineH + 4;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("Order status", 20, y);
  doc.setFont(undefined, "normal");
  doc.text(orderStatus, 20, y + smallH);
  y += smallH + lineH;
  doc.setFont(undefined, "bold");
  doc.text("Payment status", 20, y);
  doc.setFont(undefined, "normal");
  doc.text(paymentStatus, 20, y + smallH);
  y += smallH + lineH + 2;

  doc.setFont(undefined, "bold");
  doc.text("Shipping address", 20, y);
  doc.setFont(undefined, "normal");
  y += smallH;
  const addrLines = [
    addr.name,
    addr.address,
    [addr.city, addr.state, addr.zip].filter(Boolean).join(", "),
    addr.phone,
  ].filter(Boolean);
  addrLines.forEach((line) => {
    doc.text(line || "—", 20, y);
    y += smallH;
  });
  if (!addrLines.length) {
    doc.text("—", 20, y);
    y += smallH;
  }
  y += 4;

  doc.setFont(undefined, "bold");
  doc.text("Order items", 20, y);
  y += smallH + 2;
  const colW = [80, 20, 30, 35];
  const startX = 20;
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.text("Item", startX, y);
  doc.text("Qty", startX + colW[0], y);
  doc.text(`Unit (${currency})`, startX + colW[0] + colW[1], y);
  doc.text(`Total (${currency})`, startX + colW[0] + colW[1] + colW[2], y);
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(startX, y, startX + colW[0] + colW[1] + colW[2] + colW[3], y);
  y += 5;

  items.forEach((item) => {
    const name = (item.name ?? "Item").slice(0, 35);
    const qty = item.quantity ?? 0;
    const price = (item.price ?? 0).toFixed(2);
    const lineTotal = ((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2);
    doc.text(name, startX, y);
    doc.text(String(qty), startX + colW[0], y);
    doc.text(price, startX + colW[0] + colW[1], y);
    doc.text(lineTotal, startX + colW[0] + colW[1] + colW[2], y);
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  y += 4;
  doc.setDrawColor(0, 0, 0);
  doc.line(startX, y, startX + colW[0] + colW[1] + colW[2] + colW[3], y);
  y += lineH;
  if (order.couponCode && Number(order.couponDiscount) > 0) {
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Coupon ${order.couponCode}: −${currency} ${Number(order.couponDiscount).toFixed(2)}`, startX, y);
    y += lineH;
  }
  doc.setFont(undefined, "bold");
  doc.setFontSize(11);
  doc.text(`Order total: ${currency} ${total}`, startX, y);
  doc.setFont(undefined, "normal");

  doc.save(`Invoice-${orderId.replace(/\s/g, "-")}.pdf`);
}
