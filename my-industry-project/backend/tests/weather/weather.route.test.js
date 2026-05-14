import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../src/modules/weather/weather.service.js",
  () => ({
    default: {
      getForecast: jest.fn(),
    },
  }),
);

const app = (await import("../../src/app.js")).default;
const weatherService = (
  await import("../../src/modules/weather/weather.service.js")
).default;

const request = (await import("supertest")).default;

describe("Weather Route - GET /forecast/:warehouseId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return forecast successfully", async () => {
    const mockData = {
      warehouse_name: "Pune",
      forecasts: [{ temperature: 30 }],
    };

    weatherService.getForecast.mockResolvedValue(mockData);

    const res = await request(app).get("/api/weather/forecast/123");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(mockData);
  });

  it("should handle service error", async () => {
    weatherService.getForecast.mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/api/weather/forecast/123");

    expect(res.statusCode).toBe(500);
  });
});
