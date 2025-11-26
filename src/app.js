import express from "express";
import cookieParser from "cookie-parser";

import { setupErrorHandling } from "./config/errorHandling.js";
import { setupRoutes } from "./config/routes.js";
import { version } from "./constants.js";
import { rateLimiters } from "./config/rateLimiting.js";

const app = express();
const { PORT, NODE_ENV } = process.env;

// Body parsing
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply Rate limiting
app.use(`/api/${version}/`, rateLimiters.general);
app.use(`/api/${version}/users/login`, rateLimiters.general);

setupRoutes(app, version);

// Health check endpoints (must be before error handling)
app.get(`/api/${version}/health`, (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: version,
  });
});

setupErrorHandling(app);

app.listen(PORT, () => {
  console.log(`Server Running at ${process.env.PORT}`);
});

export default app;
