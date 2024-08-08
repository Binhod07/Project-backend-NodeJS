import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import * as crypto from "crypto";
import axios from "axios";
import configs from "../utils/config";
// import { storeState } from "../utils/stateStore";

const client = new CognitoIdentityProviderClient({
  region: configs.awsRegion,
  credentials: {
    accessKeyId: configs.awsAccessKeyId,
    secretAccessKey: configs.awsSecretAccessKey,
  },
});

const generateSecretHash = (username: string): string => {
  return crypto
    .createHmac("SHA256", configs.cognitoClientSecret)
    .update(username + configs.cognitoClientId)
    .digest("base64");
};

const stateStore: { [key: string]: string } = {};

export const getGoogleAuthURL = (): string => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const state = Math.random().toString(36).substring(7); // Generate a random state
  stateStore[state] = "valid"; // Store the state

  console.log(`Storing state: ${state} with value: ${stateStore[state]}`); // Log the state for debugging

  const options = {
    redirect_uri: configs.cognitoRedirectUri,
    client_id: configs.googleClientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state, // Include the state parameter
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

export const getGoogleTokens = async (code: string): Promise<any> => {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: configs.googleClientId,
    client_secret: configs.googleClientSecret,
    redirect_uri: configs.cognitoRedirectUri,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post(url, values, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Google tokens", error);
    throw new Error("Failed to fetch Google tokens");
  }
};

export const verifyState = (state: string): boolean => {
  console.log(`Verifying state: ${state}, found value: ${stateStore[state]}`);
  return stateStore[state] === "valid";
};

export const signUpUser = async (
  username: string,
  password: string,
  attributes: { name: string; phoneNumber?: string; email?: string }
) => {
  const secretHash = generateSecretHash(username);
  const userAttributes = [{ Name: "name", Value: attributes.name }];

  if (attributes.phoneNumber) {
    userAttributes.push({
      Name: "phone_number",
      Value: attributes.phoneNumber,
    });
  }

  if (attributes.email) {
    userAttributes.push({ Name: "email", Value: attributes.email });
  }

  const command = new SignUpCommand({
    ClientId: configs.cognitoClientId,
    Username: username,
    Password: password,
    SecretHash: secretHash,
    UserAttributes: userAttributes,
  });

  try {
    const response = await client.send(command);
    return {
      message:
        "Sign up successful. Please check your phone or email for verification.",
      userSub: response.UserSub,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const verifyUser = async (username: string, code: string) => {
  const secretHash = generateSecretHash(username);
  const command = new ConfirmSignUpCommand({
    ClientId: configs.cognitoClientId,
    Username: username,
    ConfirmationCode: code,
    SecretHash: secretHash,
  });

  try {
    const response = await client.send(command);
    return { message: "User verified successfully.", response };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInUser = async (username: string, password: string) => {
  const secretHash = generateSecretHash(username);
  const command = new InitiateAuthCommand({
    ClientId: configs.cognitoClientId,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  });

  try {
    const response = await client.send(command);
    const authResult = response.AuthenticationResult;
    return { message: "Sign-in successful!", authResult };
  } catch (error: any) {
    if (error.name === "NotAuthorizedException") {
      throw new Error("The username or password is incorrect.");
    } else if (error.name === "UserNotConfirmedException") {
      throw new Error("The user has not been confirmed.");
    } else if (error.name === "PasswordResetRequiredException") {
      throw new Error("A password reset is required.");
    } else {
      throw new Error(error.message);
    }
  }
};
