import Campaign from "../models/Campaign.js";
import Product from "../models/Product.js";
import { syncCampaignProducts, removeCampaignFromAllProducts } from "../utils/campaignProductSync.js";

/**
 * GET /api/campaigns/active
 * Public. Returns campaigns that are currently active (status Active, now between startDate and endDate) with their products.
 */
export async function getActiveCampaigns(req, res, next) {
  try {
    const now = new Date();
    const campaigns = await Campaign.find({
      status: "Active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .lean()
      .sort({ startDate: -1 });
    const productIds = [...new Set(campaigns.flatMap((c) => (c.products || []).map((id) => id?.toString?.()).filter(Boolean)))];
    const productsMap = {};
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds }, status: "active" }).lean();
      products.forEach((p) => {
        productsMap[p._id.toString()] = p;
      });
    }
    const list = campaigns.map((c) => ({
      _id: c._id,
      name: c.name,
      type: c.type,
      discount: c.discount ?? 0,
      startDate: c.startDate,
      endDate: c.endDate,
      products: (c.products || [])
        .map((id) => productsMap[id?.toString?.()])
        .filter(Boolean),
    }));
    res.json({ success: true, campaigns: list });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/campaigns
 * Admin only. Returns all campaigns, newest first.
 */
export async function getCampaigns(req, res, next) {
  try {
    const campaigns = await Campaign.find({}).lean().sort({ createdAt: -1 });
    const list = campaigns.map((c) => ({
      _id: c._id,
      name: c.name,
      type: c.type,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      discount: c.discount ?? 0,
      targetAudience: c.targetAudience,
      products: (c.products || []).map((id) => id?.toString?.() || id).filter(Boolean),
      conversions: c.conversions ?? 0,
      revenue: c.revenue ?? 0,
      createdAt: c.createdAt,
    }));
    res.json({ success: true, campaigns: list });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/campaigns
 * Admin only. Create a campaign.
 */
export async function createCampaign(req, res, next) {
  try {
    const body = req.body || {};
    const name = (body.name || "").trim();
    if (!name) {
      return res.status(400).json({ success: false, message: "Campaign name is required" });
    }

    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;
    if (!startDate || Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ success: false, message: "Valid start date is required" });
    }
    if (!endDate || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: "Valid end date is required" });
    }

    const productIds = Array.isArray(body.products)
      ? body.products.filter((id) => id && String(id).match(/^[a-fA-F0-9]{24}$/))
      : [];

    const campaign = new Campaign({
      name,
      type: body.type || "Discount",
      status: body.status || "Scheduled",
      startDate,
      endDate,
      discount: Math.min(100, Math.max(0, Number(body.discount) || 0)),
      targetAudience: body.targetAudience || "All Customers",
      products: productIds,
      conversions: Math.max(0, Number(body.conversions) || 0),
      revenue: Math.max(0, Number(body.revenue) || 0),
    });
    await campaign.save();
    await syncCampaignProducts(campaign._id.toString(), campaign.discount ?? 0, productIds);

    const saved = await Campaign.findById(campaign._id).lean();
    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign: {
        _id: saved._id,
        name: saved.name,
        type: saved.type,
        status: saved.status,
        startDate: saved.startDate,
        endDate: saved.endDate,
        discount: saved.discount ?? 0,
        targetAudience: saved.targetAudience,
        products: (saved.products || []).map((id) => id?.toString?.() || id),
        conversions: saved.conversions ?? 0,
        revenue: saved.revenue ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/campaigns/:id
 * Admin only. Update a campaign.
 */
export async function updateCampaign(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (body.name !== undefined) {
      const name = (body.name || "").trim();
      if (!name) return res.status(400).json({ success: false, message: "Campaign name cannot be empty" });
      campaign.name = name;
    }
    if (body.type !== undefined) campaign.type = body.type;
    if (body.status !== undefined) campaign.status = body.status;
    if (body.startDate !== undefined) {
      const d = new Date(body.startDate);
      if (!Number.isNaN(d.getTime())) campaign.startDate = d;
    }
    if (body.endDate !== undefined) {
      const d = new Date(body.endDate);
      if (!Number.isNaN(d.getTime())) campaign.endDate = d;
    }
    if (body.discount !== undefined) campaign.discount = Math.min(100, Math.max(0, Number(body.discount) || 0));
    if (body.targetAudience !== undefined) campaign.targetAudience = body.targetAudience;
    const previousProductIds = (campaign.products || []).map((pid) => pid?.toString?.() || pid).filter(Boolean);
    if (body.products !== undefined) {
      campaign.products = Array.isArray(body.products)
        ? body.products.filter((id) => id && String(id).match(/^[a-fA-F0-9]{24}$/))
        : [];
    }
    if (body.conversions !== undefined) campaign.conversions = Math.max(0, Number(body.conversions) || 0);
    if (body.revenue !== undefined) campaign.revenue = Math.max(0, Number(body.revenue) || 0);

    await campaign.save();
    if (body.products !== undefined) {
      await syncCampaignProducts(
        id,
        campaign.discount ?? 0,
        (campaign.products || []).map((pid) => pid?.toString?.() || pid),
        previousProductIds
      );
    }
    const updated = await Campaign.findById(id).lean();
    res.json({
      success: true,
      message: "Campaign updated successfully",
      campaign: {
        _id: updated._id,
        name: updated.name,
        type: updated.type,
        status: updated.status,
        startDate: updated.startDate,
        endDate: updated.endDate,
        discount: updated.discount ?? 0,
        targetAudience: updated.targetAudience,
        products: (updated.products || []).map((id) => id?.toString?.() || id),
        conversions: updated.conversions ?? 0,
        revenue: updated.revenue ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/campaigns/:id
 * Admin only. Delete a campaign.
 */
export async function deleteCampaign(req, res, next) {
  try {
    const { id } = req.params;
    await removeCampaignFromAllProducts(id);
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.json({ success: true, message: "Campaign deleted successfully" });
  } catch (err) {
    next(err);
  }
}
