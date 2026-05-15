import { jest } from "@jest/globals";

//Mock pg module
const mockQuery = jest.fn();

const mockOn = jest.fn();
let mockPoolInstance;

jest.unstable_mockModule("pg", () => ({
  default: {
    Pool: jest.fn().mockImplementation(() => {
      mockPoolInstance = {
        query: mockQuery,
        on: mockOn,
      };
      return mockPoolInstance;
    }),
  },
}));

//Import after mock
const db = await import("../../src/config/database.js");

const { query, pool } = db;

// Test Suite

describe("Database Config", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  // Pool Initialization

  test("should create pool instance", () => {
    expect(pool).toBeDefined();
  });

  //Query Function

  test("should call pool.query with correct params", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    await query("SELECT * FROM users", ["1"]);

    expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM users", ["1"]);
  });

  //  Error Listener Registration

  test("should register error handler on pool", () => {
    expect(mockPoolInstance).toBeDefined();
    expect(mockPoolInstance.on).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
  });

  //  Error Handler Behavior

  test("should call process.exit on DB error", () => {
    expect(mockPoolInstance).toBeDefined();

    const mockErrorHandler = mockPoolInstance.on.mock.calls.find(
      (call) => call[0] === "error",
    )[1];

    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockErrorHandler(new Error("DB error"));

    expect(consoleSpy).toHaveBeenCalledWith("PG Error:", expect.any(Error));

    expect(exitSpy).toHaveBeenCalledWith(1);

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
