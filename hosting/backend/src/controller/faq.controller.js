import Faq from "../models/Faq.js";

/**
 * GET /api/faq
 * Public. Returns all FAQs that have a reply (answered), newest first.
 */
export async function getAnsweredFaqs(req, res, next) {
  try {
    const list = await Faq.find({ reply: { $exists: true, $ne: null, $ne: "" } })
      .select("question reply repliedAt")
      .lean()
      .sort({ repliedAt: -1 });
    res.json({ success: true, faqs: list });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/faq
 * Public. Submit a new question (optional auth: can attach user; body can have email for guests).
 */
export async function submitQuestion(req, res, next) {
  try {
    const question = (req.body?.question || "").trim();
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }
    const doc = new Faq({
      question,
      user: req.user?._id || null,
      email: (req.body?.email || "").trim() || null,
    });
    await doc.save();
    res.status(201).json({
      success: true,
      message: "Your question has been submitted. An admin will reply soon.",
      faq: { _id: doc._id, question: doc.question },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/faq/admin
 * Admin only. Returns all FAQs (including unanswered), newest first.
 */
export async function adminGetAll(req, res, next) {
  try {
    const list = await Faq.find({})
      .populate("user", "name email")
      .lean()
      .sort({ createdAt: -1 });
    res.json({ success: true, faqs: list });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/faq/:id
 * Admin only. Update question text, reply text, or delete reply (set reply to null).
 */
export async function adminUpdate(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ success: false, message: "FAQ id required" });
    const faq = await Faq.findById(id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });

    if (req.body?.question !== undefined) faq.question = String(req.body.question).trim();
    if (req.body?.reply !== undefined) {
      const reply = String(req.body.reply).trim();
      faq.reply = reply || null;
      faq.repliedAt = reply ? new Date() : null;
    }
    await faq.save();

    const updated = await Faq.findById(faq._id).populate("user", "name email").lean();
    res.json({ success: true, faq: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/faq/:id
 * Admin only. Delete a FAQ entry.
 */
export async function adminDelete(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ success: false, message: "FAQ id required" });
    const faq = await Faq.findByIdAndDelete(id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ deleted" });
  } catch (err) {
    next(err);
  }
}
