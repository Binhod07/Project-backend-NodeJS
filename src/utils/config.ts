import dotenv from "dotenv";
import path from "path";
import * as yup from "yup";

// Load environment variables
const env = process.env.NODE_ENV || "development";
const envPath = path.resolve(__dirname, `../configs/.env.${env}`);
dotenv.config({ path: envPath });

// Log the current environment variables
console.log("Loaded environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
  AWS_REGION: process.env.AWS_REGION,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
});

// Define a schema for the environment variables using yup
const envVarsSchema = yup.object().shape({
  NODE_ENV: yup
    .string()
    .oneOf(["development", "production", "test"])
    .default("development"),
  PORT: yup.number().default(3000),
  MONGODB_URL: yup.string().required("MONGODB_URL is a required field"),
  COGNITO_USER_POOL_ID: yup
    .string()
    .required("COGNITO_USER_POOL_ID is a required field"),
  COGNITO_CLIENT_ID: yup
    .string()
    .required("COGNITO_CLIENT_ID is a required field"),
  COGNITO_CLIENT_SECRET: yup
    .string()
    .required("COGNITO_CLIENT_SECRET is a required field"),
  AWS_REGION: yup.string().required("AWS_REGION is a required field"),
  GOOGLE_CLIENT_ID: yup
    .string()
    .required("GOOGLE_CLIENT_ID is a required field"),
  GOOGLE_CLIENT_SECRET: yup
    .string()
    .required("GOOGLE_CLIENT_SECRET is a required field"),
  REDIRECT_URI: yup.string().required("REDIRECT_URI is a required field"),
});

// Validate the environment variables
let envVars;
try {
  envVars = envVarsSchema.validateSync(process.env, { stripUnknown: true });
  console.log("Validated environment variables:", envVars);
} catch (error) {
  console.error("Config validation error:", error);
  throw new Error(`Config validation error: ${error}`);
}

const configs = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongodbUrl: envVars.MONGODB_URL,
  awsRegion: envVars.AWS_REGION,
  cognitoClientId: envVars.COGNITO_CLIENT_ID,
  cognitoClientSecret: envVars.COGNITO_CLIENT_SECRET,
  cognitoUserPoolId: envVars.COGNITO_USER_POOL_ID,
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  redirectUri: envVars.REDIRECT_URI,
  googleClientSecret: envVars.GOOGLE_CLIENT_SECRET,
};

export default configs;
