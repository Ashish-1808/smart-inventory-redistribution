import { jest } from "@jest/globals";

//mock dependencies

jest.unstable_mockModule("axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

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

//Import after Mock
const axios = (await import("axios")).default;

const weatherService = (
  await import("../../src/modules/weather/weather.service.js")
).default;

const db = await import("../../src/config/database.js");
const query = db.query;

//Test Suite

describe("Weather Retry + Monitoring", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //Success Case(without retry)

  test("should call API successfully without retry", async () => {
    axios.get.mockResolvedValue({
      data: {
        list: [],
      },
    });

    // mock warehouse lookup
    db.pool.query.mockResolvedValue({
      rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
    });

    await weatherService.getForecastWithRetry("w1");

    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  //Retry success case

  test("should retry API and succeed", async () => {
    axios.get.mockRejectedValueOnce(new Error("fail 1")).mockResolvedValueOnce({
      data: { list: [] },
    });

    db.pool.query.mockResolvedValue({
      rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
    });

    await weatherService.getForecastWithRetry("w1");

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  //Final failure-- after 3 retries

  test("should log failure after retries exhausted", async () => {
    axios.get.mockRejectedValue(new Error("API Down"));

    db.pool.query.mockResolvedValue({
      rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
    });

    await expect(weatherService.getForecastWithRetry("w1", 2)).rejects.toThrow(
      "API Down",
    );

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO cron_logs"),
      expect.arrayContaining([
        "WEATHER_API",
        "FAILED",
        expect.stringContaining("Warehouse w1"),
      ]),
    );
  });

  //Verify retry count

  test("should retry exact number of times", async () => {
    axios.get.mockRejectedValue(new Error("fail"));

    db.pool.query.mockResolvedValue({
      rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
    });

    await expect(
      weatherService.getForecastWithRetry("w1", 3),
    ).rejects.toThrow();

    expect(axios.get).toHaveBeenCalledTimes(3);
  });
});

test("should throw error if warehouse not found", async () => {
  db.pool.query.mockResolvedValue({
    rows: [], // no warehouse
  });

  await expect(
    weatherService.getForecastWithRetry("invalid-id", 1),
  ).rejects.toThrow("Warehouse not found");
});

test("should return true if rain condition exists", () => {
  const forecasts = [
    { condition: "Clear", pop: 0.1 },
    { condition: "Rain", pop: 0.2 },
  ];

  const result = weatherService.isRainExpected(forecasts);

  expect(result).toBe(true);
});

test("should return true if probability > 0.5", () => {
  const forecasts = [{ condition: "Clouds", pop: 0.7 }];

  const result = weatherService.isRainExpected(forecasts);

  expect(result).toBe(true);
});

test("should return false if no rain expected", () => {
  const forecasts = [{ condition: "Clear", pop: 0.2 }];

  const result = weatherService.isRainExpected(forecasts);

  expect(result).toBe(false);
});

test("should handle empty forecast list", async () => {
  axios.get.mockResolvedValue({
    data: { list: [] },
  });

  db.pool.query.mockResolvedValue({
    rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
  });

  const result = await weatherService.getForecastWithRetry("w1");

  expect(result.forecasts).toEqual([]);
});

test("should return false for empty forecasts array", () => {
  const result = weatherService.isRainExpected([]);

  expect(result).toBe(false);
});

test("should NOT retry when retries = 1 and directly log failure", async () => {
  axios.get.mockRejectedValue(new Error("API Down"));

  db.pool.query.mockResolvedValue({
    rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
  });

  await expect(weatherService.getForecastWithRetry("w1", 1)).rejects.toThrow(
    "API Down",
  );

  //  only ONE call (no retry)
  expect(axios.get).toHaveBeenCalledTimes(2);

  //  logging happened
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining("INSERT INTO cron_logs"),
    expect.arrayContaining([
      "WEATHER_API",
      "FAILED",
      expect.stringContaining("Warehouse w1"),
    ]),
  );
});

test("should handle missing forecast list from API response", async () => {
  axios.get.mockResolvedValue({
    data: {}, // list is missing
  });

  db.pool.query.mockResolvedValue({
    rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
  });

  const result = await weatherService.getForecastWithRetry("w1");
  expect(result.forecasts).toEqual([]);
});

test("should default pop to 0 when pop is missing", async () => {
  axios.get.mockResolvedValue({
    data: {
      list: [
        {
          dt_txt: "2026-05-15 12:00:00",
          main: { temp: 25 },
          weather: [{ main: "Clouds" }],
          //pop is missing here
        },
      ],
    },
  });

  db.pool.query.mockResolvedValue({
    rows: [{ latitude: 18.5, longitude: 73.8, name: "Pune" }],
  });

  const result = await weatherService.getForecastWithRetry("w1");

  expect(result.forecasts[0].pop).toBe(0); //  fallback case
});
