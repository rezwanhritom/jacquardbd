import express from "express";
import {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
} from "../controller/payment.controller.js";
import { isSSLCommerzConfigured } from "../config/sslcommerz.js";

function ensurePaymentConfig(req, res, next) {
  if (!isSSLCommerzConfigured()) {
    return res.status(503).json({ success: false, message: "Payment gateway not configured" });
  }
  next();
}
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/init", ensurePaymentConfig, protect, initiatePayment);

router.get("/success", ensurePaymentConfig, paymentSuccess);
router.get("/fail", ensurePaymentConfig, paymentFail);
router.get("/cancel", ensurePaymentConfig, paymentCancel);
router.post("/ipn", ensurePaymentConfig, express.json(), paymentIpn);

export default router;
