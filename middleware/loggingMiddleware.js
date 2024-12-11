import logger from "../config/logger.js";

export const logRequestDuration = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const status = res.statusCode;

    logger.info(`${method} ${originalUrl} ${status} - ${duration}ms`);
  });

  next();
};
