import express from "express";
import controller from "./forecasting.controller.js";
import { validateWarehouseId } from "../../middlewares/validation.middleware.js";

const router = express.Router();

router.get("/:warehouseId", validateWarehouseId, controller.generateForecast);
export default router;
