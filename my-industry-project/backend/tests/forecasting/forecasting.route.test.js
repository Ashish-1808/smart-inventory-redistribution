import { jest } from "@jest/globals";

//mock the service
jest.unstable_mockModule(
  "../../src/modules/forecasting/forecasting.service.js",
  () => ({
    default: {
      generateForecast: jest.fn(),
    },
  }),
);

//Import after mock

const app = (await import("../../src/app.js")).default;

const forecastingService = (
  await import("../../src/modules/forecasting/forecasting.service.js")
).default;

const request = (await import("supertest")).default;

//Test cases

describe("Forecasting Route - GET /:warehouseId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return forecast successfully", async () => {
    const mockData = [
      {
        product_id: "aaaaaaa1",
        predicted_demand: 30,
        weather_factor: 20,
        base_Consumption: 10,
      },
    ];

    forecastingService.generateForecast.mockResolvedValue(mockData);

    const res = await request(app).get(
      "/api/forecast/11111111-1111-1111-1111-111111111111",
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockData);
  });

  it("should handle service error", async () => {
    forecastingService.generateForecast.mockRejectedValue(
      new Error("Test error"),
    );

    const res = await request(app).get(
      "/api/forecast/11111111-1111-1111-1111-111111111111",
    );

    expect(res.statusCode).toBe(500);
  });
});
