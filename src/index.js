import "../instrument.js";

import express from "express";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import loginRoute from "../routes/login.js";
import usersRoute from "../routes/users.js";
import hostsRoute from "../routes/hosts.js";
import propertiesRoute from "../routes/properties.js";
import amenitiesRoute from "../routes/amenities.js";
import bookingsRoute from "../routes/bookings.js";
import reviewsRoute from "../routes/reviews.js";
import { logRequestDuration } from "../middleware/loggingMiddleware.js";
import helmet from "helmet";
import logger from "../config/logger.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
});

app.use(express.json());

app.use(logRequestDuration);

app.use("/login", loginRoute);
app.use("/users", usersRoute);
app.use("/hosts", hostsRoute);
app.use("/properties", propertiesRoute);
app.use("/amenities", amenitiesRoute);
app.use("/bookings", bookingsRoute);
app.use("/reviews", reviewsRoute);

Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);

  if (err.status === 404) {
    return res.status(404).json({ message: "Resource not found" });
  }

  if (err.status === 400) {
    return res.status(400).json({ message: "Bad request" });
  }

  return res.status(500).json({
    message:
      "An error occurred on the server, please double-check your request!",
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

export default app;
