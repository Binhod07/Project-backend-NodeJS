// src/app.ts
import express from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "../src/routes/v1/routes";
import fs from "fs";
import path from "path";
import { errorHandler } from "../src/middlewares/errorHandler";
import callbackRoutes from "./routes/v1/callbackRoutes";

// Dynamically load swagger.json
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "docs/swagger.json"), "utf8")
);

// Initialize App Express
const app = express();

// Global Middleware
app.use(express.json()); // Help to get the json from request body

// Register Routes
RegisterRoutes(app);

// Register Callback Routes
app.use("/api/v1/auth/google", callbackRoutes);

// API Documentations
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handler
app.use(errorHandler);

export default app;
