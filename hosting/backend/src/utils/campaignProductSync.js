/**
 * Sync product documents when they are added to or removed from a campaign.
 * When a product is in a campaign: set campaign ref, originalPrice = current price, discount from campaign, finalPrice, price = finalPrice, collection = "campaigns".
 * When a product is removed: clear campaign, restore price from originalPrice, clear discount/finalPrice/originalPrice, collection = "regular".
 */

import Product from "../models/Product.js";
import Campaign from "../models/Campaign.js";

/**
 * Apply campaign to a product: set campaign ref, discount, originalPrice, finalPrice, price, collection.
 * @param {string} productId - MongoDB _id
 * @param {string} campaignId - MongoDB _id
 * @param {number} discountPercent - 0-100
 */
export async function applyCampaignToProduct(productId, campaignId, discountPercent) {
  const product = await Product.findById(productId);
  if (!product) return;
  const discount = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  const currentPrice = product.price ?? 0;
  const originalPrice = product.originalPrice ?? currentPrice;
  const finalPrice = originalPrice * (1 - discount / 100);
  product.campaign = campaignId;
  product.originalPrice = originalPrice;
  product.discount = discount;
  product.finalPrice = finalPrice;
  product.price = finalPrice;
  product.collection = "campaigns";
  await product.save();
}

/**
 * Remove campaign from a product: restore price, clear campaign fields, set collection to regular.
 * @param {string} productId - MongoDB _id
 */
export async function removeCampaignFromProduct(productId) {
  const product = await Product.findById(productId);
  if (!product) return;
  const restorePrice = product.originalPrice ?? product.price ?? 0;
  product.campaign = undefined;
  product.originalPrice = null;
  product.discount = 0;
  product.finalPrice = null;
  product.price = restorePrice;
  product.collection = "regular";
  await product.save();
}

/**
 * Sync all products for a campaign: apply campaign to productIds, remove campaign from previous product ids not in productIds.
 * @param {string} campaignId
 * @param {number} discountPercent
 * @param {string[]} newProductIds - new list of product _ids in this campaign
 * @param {string[]} [previousProductIds] - optional; if not provided, read from campaign
 */
export async function syncCampaignProducts(campaignId, discountPercent, newProductIds, previousProductIds) {
  const newIds = [...new Set(newProductIds.filter((id) => id && String(id).match(/^[a-fA-F0-9]{24}$/)))];
  let previousIds = previousProductIds;
  if (previousIds == null) {
    const campaign = await Campaign.findById(campaignId).lean();
    previousIds = (campaign?.products || []).map((id) => String(id));
  }
  const toAdd = newIds.filter((id) => !previousIds.includes(id));
  const toRemove = previousIds.filter((id) => !newIds.includes(id));
  for (const id of toAdd) {
    await applyCampaignToProduct(id, campaignId, discountPercent);
  }
  for (const id of toRemove) {
    await removeCampaignFromProduct(id);
  }
}

/**
 * Remove campaign from all products that were in this campaign (e.g. when campaign is deleted).
 * @param {string} campaignId
 */
export async function removeCampaignFromAllProducts(campaignId) {
  const products = await Product.find({ campaign: campaignId });
  for (const p of products) {
    await removeCampaignFromProduct(p._id.toString());
  }
}
