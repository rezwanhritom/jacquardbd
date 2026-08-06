import { Router } from "express";
import { getProductFeed } from "../controller/feed.controller.js";

const router = Router();

router.get("/products.xml", getProductFeed);
router.get("/products", getProductFeed);

export default router;
