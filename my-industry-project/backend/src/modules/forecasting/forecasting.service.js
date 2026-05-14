import { pool, query } from "../../config/database.js";
import forecastRepo from "./forecasting.repository.js";
import weatherService from "../weather/weather.service.js";

//weather impact logic
const getWeatherImpact = (product, forecasts) => {
  //if no forecast history return
  if (!forecasts || forecasts.length === 0) return 0;

  let impact = 0;
  for (const f of forecasts) {
    const { condition, temperature } = f;
    //Rain products
    if (
      product.category === "Rain Gear" &&
      (condition === "Rain" || f.probability_of_rain > 0.5)
    ) {
      impact += 20;
    }

    //Summer Products
    if (product.category === "Beverages" && temperature >= 30) {
      impact += 15;
    }
    //Winter Products
    if (product.category === "Winter Wear" && temperature <= 15) {
      impact += 15;
    }
    //General Goods
    if (product.category === "General") {
      impact += 5;
    }
    //Festival/High Priority Products
    if (product.priority_level >= 4) {
      impact += 10;
    }
    return impact;
  }
  // if (weatherService.isRainExpected(forecasts))
  //   return 20; //Increase demand based on weather condition
  // else return 0;
};

const generateForecast = async (warehouseId) => {
  //check if warehouse exists
  const warehouseCheck = await query(`SELECT id FROM warehouses WHERE id=$1`, [
    warehouseId,
  ]);

  if (warehouseCheck.rows.length === 0) {
    const error = new Error("Warehouse not found");
    error.statusCode = 404;
    throw error;
  }

  //Get inventory data
  const inventoryRes = await pool.query(
    `SELECT warehouse_id,product_id,quantity FROM inventory where warehouse_id=$1`,
    [warehouseId],
  );

  const inventory = await inventoryRes.rows;

  if (!inventory.length) {
    throw new Error("No inventory data found");
  }

  //Get weather forecast data
  const weatherRes = await pool.query(
    `SELECT * from weather_forecast where warehouse_id=$1 ORDER BY forecast_time ASC`,
    [warehouseId],
  );

  const forecasts = weatherRes.rows;

  //forecast Calculation

  const results = [];
  for (const item of inventory) {
    //fetch the product details
    const productRes = await query(
      `SELECT category,priority_level FROM products WHERE id=$1`,
      [item.product_id],
    );

    //extract the product information
    const product = productRes.rows[0];

    const baseConsumption = Math.ceil(item.quantity * 0.2);
    //Assume 20% Daily consumption

    //get weather impact based on warehouse location
    const weatherImpact = getWeatherImpact(product, forecasts);

    //based on the weather impact adjust the demand
    const predictedDemand = baseConsumption + weatherImpact;

    const saved = await forecastRepo.saveForecast(
      item.warehouse_id,
      item.product_id,
      predictedDemand,
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
