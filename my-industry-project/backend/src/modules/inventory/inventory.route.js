import express from "express";
import controller from "./inventory.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { validateAddRemove, validateTransfer } from "./inventory.validation.js";
const router = express.Router();

router.post(
  "/add-stock",
  authMiddleware,
  validateAddRemove,
  controller.addStock,
);

router.post(
  "/remove-stock",
  authMiddleware,
  validateAddRemove,
  controller.removeStock,
);

router.post(
  "/transfer",
  authMiddleware,
  validateTransfer,
  controller.transferStock,
);

router.get("/", authMiddleware, controller.getInventory);

router.get(
  "/warehouse/:warehouseId",
  authMiddleware,
  controller.getInventoryByWarehouse,
);

router.get("/low-stock", controller.getLowStock);

export default router;
