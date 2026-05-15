import { jest } from "@jest/globals";
import { sendResponse } from "../../src/utils/response.js";

describe("sendResponse Utility", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(), // allows chaining
      json: jest.fn(),
    };
  });

  // Default Success Response
  test("should send default success response", () => {
    sendResponse(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Success",
    });
  });

  //Success Response with Data
  test("should include data in response when provided", () => {
    const data = { name: "Product A" };

    sendResponse(res, 200, "Data fetched", data);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Data fetched",
      data: data,
    });
  });

  //Error Response
  test("should send error response with status >= 400", () => {
    sendResponse(res, 400, "Bad Request");

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bad Request",
    });
  });

  //Error Response with Error Object
  test("should include error field when error is provided", () => {
    const error = "Invalid input";

    sendResponse(res, 500, "Error occurred", null, error);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error occurred",
      error: error,
    });
  });

  //Both Data and Error (edge case)
  test("should include both data and error if both provided", () => {
    const data = { id: 1 };
    const error = "Warning";

    sendResponse(res, 200, "Partial response", data, error);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Partial response",
      data,
      error,
    });
  });
});
