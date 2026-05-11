import express from "express";
import controller from "./weather.controller.js";

const router = express.Router();

router.get("/forecast/:warehouseId", controller.getForecast);

export default router;
