import { afterEach, beforeEach, jest } from "@jest/globals";

process.env.ENABLE_CRON_TESTS = "true";

//Mock modules

//Mock Express
jest.unstable_mockModule("express", () => ({
  default: () => ({
    use: jest.fn(),
    listen: jest.fn(),
  }),
}));

jest.unstable_mockModule("node-cron", () => ({
  default: {
    schedule: jest.fn(),
  },
}));

jest.unstable_mockModule(
  "../../src/modules/forecasting/forecasting.service.js",
  () => ({
    default: {
      generateForecast: jest.fn(),
    },
  }),
);

jest.unstable_mockModule(
  "../../src/modules/redistribution/redistribution.service.js",
  () => ({
    default: {
      redistribution: jest.fn(),
    },
  }),
);

jest.unstable_mockModule(
  "../../src/modules/weather/weather.service.js",
  () => ({
    default: {
      getForecast: jest.fn(),
      getForecastWithRetry: jest.fn(),
    },
  }),
);

jest.unstable_mockModule("../../src/config/database.js", () => ({
  query: jest.fn(),
}));

//Import after mock

const cron = (await import("node-cron")).default;
const forecastingService = (
  await import("../../src/modules/forecasting/forecasting.service.js")
).default;

const redistributionService = (
  await import("../../src/modules/redistribution/redistribution.service.js")
).default;

const weatherService = (
  await import("../../src/modules/weather/weather.service.js")
).default;

const db = await import("../../src/config/database.js");
const query = db.query;

const cronJobs = (await import("../../src/jobs/cron.job.js")).default;
import express from "express";

//Test suite

describe("Cron Automation Workflows", () => {
  let scheduledFns = [];
  beforeEach(() => {
    scheduledFns = [];

    //capture cron callbacks
    cron.schedule.mockImplementation((expression, fn) => {
      scheduledFns.push(fn);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //Test 1: Schedular Setup

  test("should schedule all cron jobs", () => {
    cronJobs();

    expect(cron.schedule).toHaveBeenCalledTimes(2); // forecast + redistribution
    expect(scheduledFns.length).toBe(2);
  });

  //Test 2: Forecast Flow (Weather → Forecast)

  test("should execute weather + forecast pipeline", async () => {
    // mock DB warehouses
    query.mockResolvedValue({
      rows: [{ id: "w1" }],
    });

    weatherService.getForecast.mockResolvedValue();
    forecastingService.generateForecast.mockResolvedValue([]);

    cronJobs();

    // first scheduled job = forecast job
    await scheduledFns[0]();

    expect(query).toHaveBeenCalledWith("SELECT id FROM warehouses");

    expect(weatherService.getForecastWithRetry).toHaveBeenCalledWith("w1");

    expect(forecastingService.generateForecast).toHaveBeenCalledWith("w1");
  });

  //  Test 3: Redistribution Flow

  test("should execute redistribution job", async () => {
    redistributionService.redistribution.mockResolvedValue([]);

    cronJobs();

    // second scheduled job = redistribution job
    await scheduledFns[1]();

    expect(redistributionService.redistribution).toHaveBeenCalled();
  });

  // Test 4: Forecast Job Error Handling
  test("should handle forecast job failure gracefully", async () => {
    query.mockRejectedValue(new Error("DB Error"));

    cronJobs();

    await scheduledFns[0]();

    // should not crash → just execute
    expect(query).toHaveBeenCalled();
  });

  //  TEST 5: Redistribution Error Handling

  test("should handle redistribution failure gracefully", async () => {
    redistributionService.redistribution.mockRejectedValue(
      new Error("Redistribution Error"),
    );

    cronJobs();

    await scheduledFns[1]();

    expect(redistributionService.redistribution).toHaveBeenCalled();
  });
});
