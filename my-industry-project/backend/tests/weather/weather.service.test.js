import axios from "axios";
import weatherService from "../../src/modules/weather/weather.service.js";
import weatherRepo from "../../src/modules/weather/weather.repository.js";
import { pool } from "../../src/config/database.js";

// Mock dependencies
jest.mock("axios");
jest.mock("../../src/modules/weather/weather.repository.js");
jest.mock("../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("Weather Service - getForecast", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1. SUCCESS CASE
  it("should fetch and save forecast data successfully", async () => {
    // Mock DB response
    pool.query.mockResolvedValue({
      rows: [
        {
          latitude: 18.52,
          longitude: 73.85,
          name: "Pune Warehouse",
        },
      ],
    });

    // Mock API response
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

    expect(pool.query).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();
    expect(weatherRepo.saveForecastData).toHaveBeenCalled();

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

  //  2. WAREHOUSE NOT FOUND
  it("should throw error if warehouse not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await expect(weatherService.getForecast("invalid-id")).rejects.toThrow(
      "Warehouse not found",
    );
  });

  //  3. API FAILURE
  it("should throw error when API fails", async () => {
    pool.query.mockResolvedValue({
      rows: [{ latitude: 18.52, longitude: 73.85, name: "Pune" }],
    });

    axios.get.mockRejectedValue(new Error("API Error"));

    await expect(weatherService.getForecast("warehouse-uuid")).rejects.toThrow(
      "API Error",
    );
  });

  // 4. EMPTY FORECAST LIST
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

// TEST isRainExpected FUNCTION

describe("Weather Service - isRainExpected", () => {
  it("should return true if rain condition exists", () => {
    const forecasts = [
      { condition: "Clear", pop: 0.1 },
      { condition: "Rain", pop: 0.2 },
    ];

    const result = weatherService.isRainExpected(forecasts);

    expect(result).toBe(true);
  });

  it("should return true if probability of rain > 0.5", () => {
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
