import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const signUp = async (
  username: string,
  password: string,
  email: string
) => {
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID!,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  };

  try {
    const command = new SignUpCommand(params);
    return await client.send(command);
  } catch (error: any) {
    console.error("Error during sign-up:", error);
    throw error;
  }
};

export const confirmSignUp = async (username: string, code: string) => {
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID!,
    Username: username,
    ConfirmationCode: code,
  };

  try {
    const command = new ConfirmSignUpCommand(params);
    return await client.send(command);
  } catch (error: any) {
    console.error("Error during confirmation:", error);
    throw error;
  }
};

export const signIn = async (username: string, password: string) => {
  const params = {
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: process.env.COGNITO_CLIENT_ID!,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    return await client.send(command);
  } catch (error: any) {
    console.error("Error during sign-in:", error);
    throw error;
  }
};
