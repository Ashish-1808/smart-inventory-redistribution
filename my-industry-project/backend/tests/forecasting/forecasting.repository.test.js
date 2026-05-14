import { jest } from "@jest/globals";

//mock database only

jest.unstable_mockModule("../../src/config/database.js", () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Import after mock

const db = await import("../../src/config/database.js");
const pool = db.pool;

const forecastRepo = (
  await import("../../src/modules/forecasting/forecasting.repository.js")
).default;

// test saveForecast
describe("Forecasting Repository - saveForecast", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should insert new forecast successfully", async () => {
    const mockRow = {
      id: "uuid-123",
      warehouse_id: "11111111-1111-1111-1111-111111111111",
      product_id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      predicted_demand: 30,
      weather_factor: 20,
    };

    //  Mock DB response
    pool.query.mockResolvedValueOnce({
      rows: [mockRow],
    });

    const result = await forecastRepo.saveForecast(
      mockRow.warehouse_id,
      mockRow.product_id,
      mockRow.predicted_demand,
      mockRow.weather_factor,
    );

    // Assertions
    expect(pool.query).toHaveBeenCalledTimes(1);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO demand_forecast"),
      [
        mockRow.warehouse_id,
        mockRow.product_id,
        mockRow.predicted_demand,
        mockRow.weather_factor,
      ],
    );

    expect(result).toEqual(mockRow);
  });

  //Test UPSERT

  test("should update forecast if record already exists (ON CONFLICT)", async () => {
    const updatedRow = {
      id: "uuid-123",
      warehouse_id: "11111111-1111-1111-1111-111111111111",
      product_id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      predicted_demand: 50,
      weather_factor: 30,
    };

    pool.query.mockResolvedValueOnce({
      rows: [updatedRow],
    });

    const result = await forecastRepo.saveForecast(
      updatedRow.warehouse_id,
      updatedRow.product_id,
      updatedRow.predicted_demand,
      updatedRow.weather_factor,
    );

    // Ensure query was called
    expect(pool.query).toHaveBeenCalled();

    // Ensure ON CONFLICT logic present
    const queryString = pool.query.mock.calls[0][0];

    expect(queryString).toContain("ON CONFLICT");
    expect(queryString).toContain("DO UPDATE");

    expect(result).toEqual(updatedRow);
  });

  //Test Error Handling
  test("should throw error when database query fails", async () => {
    pool.query.mockRejectedValueOnce(new Error("DB Error"));

    await expect(forecastRepo.saveForecast("w1", "p1", 10, 5)).rejects.toThrow(
      "DB Error",
    );

    expect(pool.query).toHaveBeenCalled();
  });
});
