import { jest } from "@jest/globals";

//mock the dependencies

jest.unstable_mockModule("../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
  query: jest.fn(),
}));

jest.unstable_mockModule(
  "../../src/modules/forecasting/forecasting.repository.js",
  () => ({
    default: {
      saveForecast: jest.fn(),
    },
  }),
);

//Import after mock
const db = await import("../../src/config/database.js");
const pool = db.pool;
const query = db.query;

const forecastRepo = (
  await import("../../src/modules/forecasting/forecasting.repository.js")
).default;

const forecastService = (
  await import("../../src/modules/forecasting/forecasting.service.js")
).default;

const forecastingModule =
  await import("../../src/modules/forecasting/forecasting.service.js");

const { getWeatherImpact } = forecastingModule.default;

//test getWeatherImpact
describe("Forecasting Service - getWeatherImpact", () => {
  test("should return 0 when no forecasts", () => {
    const product = { category: "Rain Gear", priority_level: 5 };

    const result = getWeatherImpact(product, []);

    expect(result).toBe(0);
  });

  test("should increase demand for rain gear", () => {
    const product = { category: "Rain Gear", priority_level: 5 };

    const forecasts = [
      {
        condition: "Rain",
        probability_of_rain: 0.8,
        temperature: 28,
      },
    ];

    const result = getWeatherImpact(product, forecasts);

    // rain + priority
    expect(result).toBe(30);
  });

  test("should increase demand for beverages in summer", () => {
    const product = { category: "Beverages", priority_level: 2 };

    const forecasts = [
      {
        condition: "Clear",
        temperature: 35,
      },
    ];

    const result = getWeatherImpact(product, forecasts);

    expect(result).toBe(15);
  });

  test("should increase demand for winter wear", () => {
    const product = { category: "Winter Wear", priority_level: 4 };

    const forecasts = [
      {
        condition: "Clear",
        temperature: 10,
      },
    ];

    const result = getWeatherImpact(product, forecasts);

    // winter + priority
    expect(result).toBe(25);
  });

  test("should apply general category impact", () => {
    const product = { category: "General", priority_level: 1 };

    const forecasts = [
      {
        condition: "Clear",
        temperature: 25,
      },
    ];

    const result = getWeatherImpact(product, forecasts);

    expect(result).toBe(5);
  });
});

//test generateForecast function
describe("Forecasting Service - generateForecast", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should generate forecast successfully", async () => {
    //  1. Warehouse exists
    query.mockResolvedValueOnce({
      rows: [{ id: "warehouse-uuid" }],
    });

    //  2. Inventory data
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            warehouse_id: "warehouse-uuid",
            product_id: "product-uuid",
            quantity: 50,
          },
        ],
      })

      // 3. Weather forecast
      .mockResolvedValueOnce({
        rows: [
          {
            condition: "Rain",
            temperature: 28,
            probability_of_rain: 0.8,
          },
        ],
      });

    // 4. Product data
    query.mockResolvedValueOnce({
      rows: [
        {
          category: "Rain Gear",
          priority_level: 5,
        },
      ],
    });

    // 5. Save forecast
    forecastRepo.saveForecast.mockResolvedValue({
      warehouse_id: "warehouse-uuid",
      product_id: "product-uuid",
      predicted_demand: 31,
      weather_factor: 30,
    });

    const result = await forecastService.generateForecast("warehouse-uuid");

    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty("predicted_demand");
    expect(result[0]).toHaveProperty("base_Consumption");
  });

  test("should throw error if warehouse not found", async () => {
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(
      forecastService.generateForecast("invalid-id"),
    ).rejects.toThrow("Warehouse not found");
  });

  test("should throw error if no inventory data", async () => {
    // warehouse exists
    query.mockResolvedValueOnce({
      rows: [{ id: "warehouse-uuid" }],
    });

    // empty inventory
    pool.query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(
      forecastService.generateForecast("warehouse-uuid"),
    ).rejects.toThrow("No inventory data found");
  });

  test("should handle empty weather data", async () => {
    // warehouse exists
    query.mockResolvedValueOnce({
      rows: [{ id: "warehouse-uuid" }],
    });

    // inventory
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            warehouse_id: "warehouse-uuid",
            product_id: "product-uuid",
            quantity: 50,
          },
        ],
      })

      // empty forecasts
      .mockResolvedValueOnce({
        rows: [],
      });

    // product
    query.mockResolvedValueOnce({
      rows: [
        {
          category: "Rain Gear",
          priority_level: 3,
        },
      ],
    });

    // save
    forecastRepo.saveForecast.mockResolvedValue({
      predicted_demand: 10,
      weather_factor: 0,
    });

    const result = await forecastService.generateForecast("warehouse-uuid");

    expect(result[0].weather_factor).toBeDefined();
  });
});
