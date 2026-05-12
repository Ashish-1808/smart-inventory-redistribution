import express from "express";
import controller from "./forecasting.controller.js";

const router = express.Router();

router.get("/:warehouseId", controller.generateForecast);
export default router;
