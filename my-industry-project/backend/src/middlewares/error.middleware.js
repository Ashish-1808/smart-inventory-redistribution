import logger from "../utils/logger.js";
import { sendResponse } from "../utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error({
    type: "ERROR",
    message: err.message,
    // stack: err.stack,
    url: req.originalUrl,
  });

  return sendResponse(
    res,
    err.statusCode || 500,
    err.message || "Internal Server Error",
  );
};

export default errorMiddleware;
