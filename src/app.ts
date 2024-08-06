import express from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "../src/routes/v1/routes";
import fs from "fs";
import path from "path";
import { errorHandler } from "../src/middlewares/errorHandler";
// import session from "express-session";
// const { randomBytes } = require("crypto");

// Dynamically load swagger.json
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "docs/swagger.json"), "utf8")
);

// ========================
// Initialize App Express
// ========================
const app = express();
// app.use(
//   session({
//     secret: randomBytes(64).toString("hex"),
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // Set to false for local development without HTTPS
//   })
// );

// ========================
// Global Middleware
// ========================
app.use(express.json()); // Help to get the json from request body

// ========================
// Global API V1
// ========================
RegisterRoutes(app);

// ========================
// API Documentations
// ========================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ========================
// ERROR Handler
// ========================
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

export default app;
app.use(errorHandler);
