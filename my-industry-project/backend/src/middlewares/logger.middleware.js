import { param } from "express-validator";
import logger from "../utils/logger.js";

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  //log request
  logger.info({
    type: "REQUEST",
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  //capture response
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      type: "RESPONSE",
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
};

export default loggerMiddleware;
