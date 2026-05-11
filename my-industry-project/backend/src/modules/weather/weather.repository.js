import { pool, query } from "../../config/database.js";
const saveWeatherData = async (
  warehouseId,
  temperature,
  condition,
  humidity,
) => {
  const sql = `INSERT INTO weather_data(warehouse_id,temperature,condition,humidity) VALUES ($1,$2,$3) RETURNING *`;
  const { rows } = await query(sql, [
    warehouseId,
    temperature,
    condition,
    humidity,
  ]);
  return rows[0];
};

const saveForecastData = async (warehouseId, forecasts, client = null) => {
  const executor = client || pool;
  const sql = `INSERT INTO weather_forecast(warehouse_id,forecast_time,temperature,condition,probability_of_rain) VALUES($1,$2,$3,$4,$5)`;

  for (const f of forecasts) {
    await executor.query(sql, [
      warehouseId,
      f.forecast_time,
      f.temperature,
      f.condition,
      f.pop,
    ]);
  }
};

const getLatestForecast = async (warehouseId) => {
  const sql = `SELECT warehouse_id,forecast_time,temperature,condition,probability_of_rain FROM weather_forecast WHERE warehouse_id=$1
    ORDER BY forecast_time ASC`;

  const { rows } = await query(sql, [warehouseId]);

  return rows;
};

export default { saveWeatherData, saveForecastData, getLatestForecast };
