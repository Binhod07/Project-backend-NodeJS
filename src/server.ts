import dotenv from "dotenv";
import path from "path";

// Load environment variables
const env = process.env.NODE_ENV || "development";
const envPath = path.resolve(__dirname, `../src/configs/.env.${env}`);
dotenv.config({ path: envPath });

// Log the environment variables to verify they are loaded
console.log("Loaded environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  AWS_REGION: process.env.AWS_REGION,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  COGNITO_USER_POOL_DOMAIN: process.env.COGNITO_USER_POOL_DOMAIN,
});

// Ensure all necessary environment variables are defined
if (!process.env.MONGODB_URL) {
  console.error("MONGODB_URL is a required field");
  process.exit(1);
}
if (!process.env.PORT) {
  console.error("PORT is a required field");
  process.exit(1);
}
if (!process.env.COGNITO_USER_POOL_ID) {
  console.error("COGNITO_USER_POOL_ID is a required field");
  process.exit(1);
}
if (!process.env.COGNITO_CLIENT_SECRET) {
  console.error("COGNITO_CLIENT_SECRET is a required field");
  process.exit(1);
}
if (!process.env.COGNITO_CLIENT_ID) {
  console.error("COGNITO_CLIENT_ID is a required field");
  process.exit(1);
}
if (!process.env.AWS_REGION) {
  console.error("AWS_REGION is a required field");
  process.exit(1);
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("GOOGLE_CLIENT_ID is a required field");
  process.exit(1);
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("GOOGLE_CLIENT_SECRET is a required field");
  process.exit(1);
}
if (!process.env.REDIRECT_URI) {
  console.error("REDIRECT_URI is a required field");
  process.exit(1);
}
if (!process.env.COGNITO_USER_POOL_DOMAIN) {
  console.error("COGNITO_USER_POOL_DOMAIN is a required field");
  process.exit(1);
}

import app from "./app";
import configs from "./utils/config";
import { connectDB } from "./database";

connectDB();

function run() {
  app.listen(configs.port, () => {
    console.log(`User Service running on Port: ${configs.port}`);
  });
}

run();
