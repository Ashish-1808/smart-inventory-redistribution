import { query } from "express-validator";
import { pool } from "../../config/database.js";

const saveForecast = async (
  warehouseId,
  productId,
  predictedDemand,
  weatherFactor,
) => {
  const sql = `INSERT INTO demand_forecast(warehouse_id,product_id,predicted_demand,weather_factor) VALUES ($1,$2,$3,$4)ON CONFLICT(warehouse_id,product_id)
  DO UPDATE SET
  predicted_demand=EXCLUDED.predicted_demand,
  weather_factor=EXCLUDED.weather_factor,
  created_at=CURRENT_TIMESTAMP
  RETURNING *`;

  const { rows } = await pool.query(sql, [
    warehouseId,
    productId,
    predictedDemand,
    weatherFactor,
  ]);

  return rows[0];
};

export default { saveForecast };
