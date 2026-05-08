import express from "express";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehousesById,
  updateWarehouse,
  deleteWarehouse,
} from "./warehouse.controller.js";
import { validateCreateWarehouse } from "./warehouse.validation.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, validateCreateWarehouse, createWarehouse);
router.get("/", authMiddleware, getAllWarehouses);
router.get("/:id", authMiddleware, getWarehousesById);
router.put("/:id", authMiddleware, updateWarehouse);
router.delete("/:id", authMiddleware, deleteWarehouse);

export default router;
