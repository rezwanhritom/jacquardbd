import SSLCommerzPayment from "sslcommerz-lts";

const storeId = process.env.SSLCOMMERZ_STORE_ID;
const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWD;
const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

let instance = null;

export function getSSLCommerz() {
  if (!storeId || !storePasswd) {
    throw new Error("SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWD must be set");
  }
  if (!instance) {
    instance = new SSLCommerzPayment(storeId, storePasswd, isLive);
  }
  return instance;
}

export function isSSLCommerzConfigured() {
  return Boolean(storeId && storePasswd);
}

export { isLive };
