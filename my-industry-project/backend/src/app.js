import express from "express";
import cors from "cors";

import warehouseRoutes from "./modules/warehouse/warehouse.route.js";
import productRoutes from "./modules/product/product.route.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);

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
