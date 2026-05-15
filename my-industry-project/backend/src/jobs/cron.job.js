import cron from "node-cron";
import forecastingService from "../modules/forecasting/forecasting.service.js";
import weatherService from "../modules/weather/weather.service.js";
import redistributionService from "../modules/redistribution/redistribution.service.js";
import { query } from "../config/database.js";

//helper to log cron execution
const logCronExecution = async (jobName, status, message) => {
  try {
    await query(
      `INSERT INTO cron_logs(job_name,status,message)VALUES($1,$2,$3)`,
      [jobName, status, message],
    );
  } catch (error) {
    console.error("Log insertion failed", error.message);
  }
};

//Forecast jobs(every 30 minutes)
const startForecastJob = () => {
  cron.schedule("*/10 * * * * *", async () => {
    const jobName = "WEATHER_FORECAST_JOB";
    const start = Date.now();
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

      const time = Date.now() - start;
      //log success
      await logCronExecution(jobName, "SUCCESS", `Job completed in ${time}ms`);
    } catch (error) {
      console.log("Cron Forecast Job Failed", error.message);

      const time = Date.now() - start;
      //log failure
      await logCronExecution(jobName, "FAILED", error.message);
    }
  });
};

//Redistribution Job
const startRedistributionJob = () => {
  cron.schedule("*/15 * * * * *", async () => {
    const jobName = "REDISTRIBUTION_JOB";
    const start = Date.now();
    try {
      console.log("Running Redistribution Job...");
      await redistributionService.redistribution();
      console.log("Redistribution Job Completed...");

      const time = Date.now() - start;
      //log success
      await logCronExecution(jobName, "SUCCESS", `Job completed in ${time}ms`);
    } catch (error) {
      console.error("Redistribution Job Failed");
      const time = Date.now() - start;
      //log failure
      await logCronExecution(jobName, "FAILED", error.message);
    }
  });
};

//Start all jobs
const startCronJobs = () => {
  startForecastJob();
  startRedistributionJob();
};

export default startCronJobs;
