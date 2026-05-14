import express from "express";
import cors from "cors";

import warehouseRoutes from "./modules/warehouse/warehouse.route.js";
import productRoutes from "./modules/product/product.route.js";
import authRoutes from "./modules/auth/auth.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.route.js";
import weatherRoutes from "./modules/weather/weather.route.js";
import forecastRoutes from "./modules/forecasting/forecasting.routes.js";
import redistributionRoutes from "./modules/redistribution/redistribution.routes.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import startCronJobs from "./jobs/cron.job.js";
const app = express();

app.use(cors());
app.use(express.json());

//logger middleware
app.use(loggerMiddleware);
startCronJobs();
app.use("/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/redistribution", redistributionRoutes);

//Error
app.use(errorMiddleware);

//health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Application is healthy and running",
    uptime: process.uptime(),
    // timestamp: new Date().toISOString,
  });
});

export default app;
