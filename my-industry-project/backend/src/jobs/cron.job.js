import cron from "node-cron";
import forecastingService from "../modules/forecasting/forecasting.service.js";
import weatherService from "../modules/weather/weather.service.js";
import redistributionService from "../modules/redistribution/redistribution.service.js";
import { query } from "../config/database.js";

//Forecast jobs(every 30 minutes)
const startForecastJob = () => {
  cron.schedule("*/10 * * * * *", async () => {
    try {
      console.log("Running Weather + Forecast Job....");

      //1.get the warehouses
      const res = await query(`SELECT id FROM warehouses`);
      const warehouses = res.rows;

      for (const warehouse of warehouses) {
        //2.Fetch the latest weather from API
        await weatherService.getForecast(warehouse.id);
        //3.Generate Forecast using updated data
        await forecastingService.generateForecast(warehouse.id);
      }
      console.log("Weather + Forecast Job Completed");
    } catch (error) {
      console.log("Cron Forecast Job Failed", error.message);
    }
  });
};

//Redistribution Job
const startRedistributionJob = () => {
  cron.schedule("*/15 * * * * *", async () => {
    try {
      console.log("Running Redistribution Job...");
      await redistributionService.redistribution();
      console.log("Redistribution Job Completed...");
    } catch (error) {
      console.error("Redistribution Job Failed");
    }
  });
};

//Start all jobs
const startCronJobs = () => {
  startForecastJob();
  startRedistributionJob();
};

export default startCronJobs;
