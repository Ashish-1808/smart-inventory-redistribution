import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error({
    type: "ERROR",
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
  });

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorMiddleware;
