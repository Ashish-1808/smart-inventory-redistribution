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
  weatherFactor=EXCLUDED.weatherFactor,
  created_at=CURRENT_TIMESTAMP
  RETURNING *`;

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
