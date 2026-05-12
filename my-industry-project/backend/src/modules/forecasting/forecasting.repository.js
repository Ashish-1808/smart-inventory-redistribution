import { query } from "express-validator";
import { pool } from "../../config/database.js";

const saveForecast = async (
  warehouseId,
  productId,
  predictDemand,
  weatherFactor,
) => {
  const sql = `INSERT INTO demand_forecast(warehouse_id,product_id,predicted_demand,weather_factor) VALUES ($1,$2,$3,$4) RETURNING *`;

  //   console.log("warehouseId : ", warehouseId);
  //   console.log("warehouseId : ", typeof warehouseId);
  //   console.log("predict Demand", predictDemand);
  //   console.log("Weather factor", weatherFactor);

  const { rows } = await pool.query(sql, [
    warehouseId,
    productId,
    predictDemand,
    weatherFactor,
  ]);

  return rows[0];
};

export default { saveForecast };
