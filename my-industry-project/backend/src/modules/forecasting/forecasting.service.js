import { pool, query } from "../../config/database.js";
import forecastRepo from "./forecasting.repository.js";
import weatherService from "../weather/weather.service.js";

//weather impact logic
const getWeatherImpact = (forecasts) => {
  if (weatherService.isRainExpected(forecasts))
    return 20; //Increase demand based on weather condition
  else return 0;
};

const generateForecast = async (warehouseId) => {
  //1.Get inventory data
  const inventoryRes = await pool.query(
    `SELECT warehouse_id,product_id,quantity FROM inventory where warehouse_id=$1`,
    [warehouseId],
  );

  const inventory = await inventoryRes.rows;

  if (!inventory.length) {
    throw new Error("No inventory data found");
  }

  //2.Get weather forecast data
  const weatherRes = await pool.query(
    `SELECT * from weather_forecast where warehouse_id=$1 ORDER BY forecast_time ASC`,
    [warehouseId],
  );

  const forecasts = weatherRes.rows;

  //3.forecast Calculation

  const results = [];
  for (const item of inventory) {
    const baseConsumption = Math.ceil(item.quantity * 0.2);
    //Assume 20% Daily consumption

    //get weather impact based on warehouse location
    const weatherImpact = getWeatherImpact(forecasts);

    //based on the weather impact adjust the demand
    const predictDemand = baseConsumption + weatherImpact;

    const saved = await forecastRepo.saveForecast(
      item.warehouse_id,
      item.product_id,
      predictDemand,
      weatherImpact,
    );

    results.push({
      ...saved,
      base_Consumption: baseConsumption,
    });
  }

  return results;
};
export default { generateForecast };
