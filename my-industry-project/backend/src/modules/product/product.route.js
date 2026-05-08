import express from "express";
import controller from "./product.controller.js";
import { contentSecurityPolicy } from "helmet";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, controller.createProduct);
router.get("/", authMiddleware, controller.getAllProducts);
router.get("/:id", authMiddleware, controller.getProductById);
router.put("/:id", authMiddleware, controller.updateProduct);
router.delete("/:id", authMiddleware, controller.deleteProduct);

export default router;
