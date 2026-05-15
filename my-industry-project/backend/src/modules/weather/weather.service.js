import axios from "axios";
import weatherRepo from "./weather.repository.js";
import { pool, query } from "../../config/database.js";

const API_KEY = process.env.OPENWEATHER_API_KEY;

//Retry Wrapper: retry hitting api 3 times if api fail
const getForecastWithRetry = async (warehouseId, retries = 3) => {
  try {
    return await getForecast(warehouseId);
  } catch (err) {
    if (retries > 1) {
      console.log(
        `Weather API failed for ${warehouseId},Retrying (${retries})...`,
      );
      return getForecastWithRetry(warehouseId, retries - 1);
    }
    //Log failures after retries exhausted
    await query(
      `INSERT INTO cron_logs (job_name,status,message)
      VALUES($1,$2,$3)`,
      ["WEATHER_API", "FAILED", `Warehouse ${warehouseId}:${err.message}`],
    );
    throw err;
  }
};

const getForecast = async (warehouseId) => {
  //1.fetch warehouse location
  const { rows } = await pool.query(
    `SELECT latitude,longitude,name from warehouses WHERE id=$1`,
    [warehouseId],
  );
  const warehouse = rows[0];
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }
  const { latitude, longitude, name } = warehouse;

  //2.Call Forecast API
  const url = `https://api.openweathermap.org/data/2.5/forecast`;
  const response = await axios.get(url, {
    params: {
      lat: latitude,
      lon: longitude,
      appid: API_KEY,
      units: "metric",
    },
  });

  const forecastsList = response.data.list || [];

  //3.Transform Data
  const forecasts = forecastsList.map((item) => ({
    forecast_time: item.dt_txt,
    temperature: item.main.temp,
    condition: item.weather[0].main,
    pop: item.pop || 0,
  }));

  //4.Save Forecast Data
  await weatherRepo.saveForecastData(warehouseId, forecasts);

  return { warehouse_name: name, forecasts };
};

const isRainExpected = (forecasts) => {
  return forecasts.some((f) => f.condition === "Rain" || f.pop > 0.5);
};

export default { getForecast, isRainExpected, getForecastWithRetry };
