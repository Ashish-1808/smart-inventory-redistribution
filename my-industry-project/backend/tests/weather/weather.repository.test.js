import { jest } from "@jest/globals";

// Mock FIRST
jest.mock("../../src/config/database.js", () => ({
  query: jest.fn(),
  pool: {
    query: jest.fn(),
  },
}));

// Import AFTER mock
import weatherRepo from "../../src/modules/weather/weather.repository.js";
import { query, pool } from "../../src/config/database.js";

describe("Weather Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should insert weather data", async () => {
    const mockRow = { warehouse_id: "w1", temperature: 30 };

    query.mockResolvedValue({ rows: [mockRow] });

    const result = await weatherRepo.saveWeatherData("w1", 30, "Clear", 50);

    expect(result).toEqual(mockRow);
    expect(query).toHaveBeenCalledWith(expect.any(String), [
      "w1",
      30,
      "Clear",
      50,
    ]);
  });

  it("should insert multiple forecast records", async () => {
    const forecasts = [
      { forecast_time: "2026", temperature: 30, condition: "Rain", pop: 0.7 },
      { forecast_time: "2027", temperature: 31, condition: "Clear", pop: 0.2 },
    ];

    pool.query.mockResolvedValue();

    await weatherRepo.saveForecastData("w1", forecasts);

    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  it("should fetch forecast data", async () => {
    const mockRows = [{ warehouse_id: "w1" }];

    query.mockResolvedValue({ rows: mockRows });

    const result = await weatherRepo.getLatestForecast("w1");

    expect(result).toEqual(mockRows);
  });
});
``;
