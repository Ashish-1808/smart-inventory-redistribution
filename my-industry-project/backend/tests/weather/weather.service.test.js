import { jest } from "@jest/globals";

// MOCK FIRST (ONLY ONCE, WITH BOTH EXPORTS)
jest.unstable_mockModule("../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
  query: jest.fn(),
}));

jest.unstable_mockModule(
  "../../src/modules/weather/weather.repository.js",
  () => ({
    default: {
      saveForecastData: jest.fn(),
    },
  }),
);

jest.unstable_mockModule("axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

// ✅ IMPORT AFTER MOCK
const axios = (await import("axios")).default;

const weatherService = (
  await import("../../src/modules/weather/weather.service.js")
).default;

const weatherRepo = (
  await import("../../src/modules/weather/weather.repository.js")
).default;

const db = await import("../../src/config/database.js");
const pool = db.pool;
const query = db.query;

describe("Weather Service - getForecast", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // SUCCESS CASE
  it("should fetch and save forecast data successfully", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          latitude: 18.52,
          longitude: 73.85,
          name: "Pune Warehouse",
        },
      ],
    });

    axios.get.mockResolvedValue({
      data: {
        list: [
          {
            dt_txt: "2026-05-14 12:00:00",
            main: { temp: 30 },
            weather: [{ main: "Rain" }],
            pop: 0.7,
          },
        ],
      },
    });

    weatherRepo.saveForecastData.mockResolvedValue();

    const result = await weatherService.getForecast("warehouse-uuid");

    expect(result).toEqual({
      warehouse_name: "Pune Warehouse",
      forecasts: [
        {
          forecast_time: "2026-05-14 12:00:00",
          temperature: 30,
          condition: "Rain",
          pop: 0.7,
        },
      ],
    });
  });

  // WAREHOUSE NOT FOUND
  it("should throw error if warehouse not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await expect(weatherService.getForecast("invalid-id")).rejects.toThrow(
      "Warehouse not found",
    );
  });

  // API FAILURE
  it("should throw error when API fails", async () => {
    pool.query.mockResolvedValue({
      rows: [{ latitude: 18.52, longitude: 73.85, name: "Pune" }],
    });

    axios.get.mockRejectedValue(new Error("API Error"));

    await expect(weatherService.getForecast("warehouse-uuid")).rejects.toThrow(
      "API Error",
    );
  });

  // EMPTY FORECAST LIST
  it("should handle empty forecast list", async () => {
    pool.query.mockResolvedValue({
      rows: [{ latitude: 18.52, longitude: 73.85, name: "Pune" }],
    });

    axios.get.mockResolvedValue({
      data: { list: [] },
    });

    weatherRepo.saveForecastData.mockResolvedValue();

    const result = await weatherService.getForecast("warehouse-uuid");

    expect(result.forecasts).toEqual([]);
  });
});

//  isRainExpected TESTS

describe("Weather Service - isRainExpected", () => {
  it("should return true if rain condition exists", () => {
    const forecasts = [
      { condition: "Clear", pop: 0.1 },
      { condition: "Rain", pop: 0.2 },
    ];

    const result = weatherService.isRainExpected(forecasts);

    expect(result).toBe(true);
  });

  it("should return true if probability > 0.5", () => {
    const forecasts = [{ condition: "Clouds", pop: 0.6 }];

    const result = weatherService.isRainExpected(forecasts);

    expect(result).toBe(true);
  });

  it("should return false if no rain expected", () => {
    const forecasts = [{ condition: "Clear", pop: 0.2 }];

    const result = weatherService.isRainExpected(forecasts);

    expect(result).toBe(false);
  });
});
