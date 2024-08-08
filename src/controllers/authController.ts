import {
  Controller,
  Route,
  Get,
  Tags,
  Post,
  Body,
  Request,
  Res,
  TsoaResponse,
} from "tsoa";
import { signUpUser, verifyUser, signInUser } from "../services/authService";
import { randomBytes } from "crypto";
import querystring from "querystring";
import { Request as ExRequest } from "express";
import axios from "axios";
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import configs from "../utils/config";

console.log("key id", process.env.AWS_ACCESS_KEY_ID);

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: configs.awsAccessKeyId,
    secretAccessKey: configs.awsSecretAccessKey,
  },
});

const clientId = process.env.COGNITO_CLIENT_ID!;
const clientSecret = process.env.COGNITO_CLIENT_SECRET!;
const cognitoOAuthURL = process.env.COGNITO_OAUTH_URL!;
const tokenURL = process.env.COGNITO_TOKEN_URL!;
const redirectURI = process.env.REDIRECT_URI!;

console.log("tokenurl", tokenURL);

interface SignUpBody {
  username: string;
  password: string;
  name: string;
}

interface VerifyBody {
  username: string;
  code: string;
}

interface SignInBody {
  username: string;
  password: string;
}

@Tags("Authentication")
@Route("api/v1/auth")
export class AuthController extends Controller {
  [x: string]: any;
  @Post("signup")
  public async signup(@Body() body: SignUpBody): Promise<any> {
    const { username, password, name } = body;
    const isPhoneNumber = username.startsWith("+");
    const attributes = { name } as any;

    if (isPhoneNumber) {
      attributes.phoneNumber = username;
    } else {
      attributes.email = username;
    }

    try {
      const response = await signUpUser(username, password, attributes);
      return response;
    } catch (error: any) {
      this.setStatus(400);
      return { error: error.message };
    }
  }

  @Post("verify")
  public async verify(@Body() body: VerifyBody): Promise<any> {
    const { username, code } = body;
    try {
      const response = await verifyUser(username, code);
      return response;
    } catch (error: any) {
      this.setStatus(400);
      return { error: error.message };
    }
  }

  @Post("signin")
  public async signIn(@Body() body: SignInBody): Promise<any> {
    const { username, password } = body;
    try {
      const response = await signInUser(username, password);
      return response;
    } catch (error: any) {
      this.setStatus(401);
      return { error: error.message };
    }
  }

  @Get("/signin/google")
  public redirectToGoogleOAuth(
    @Request() _req: ExRequest,
    @Res() redirect: TsoaResponse<302, void>
  ): void {
    const state = randomBytes(16).toString("hex");
    const params = {
      client_id: clientId,
      redirect_uri: redirectURI,
      response_type: "code",
      scope: "email openid profile",
      identity_provider: "Google",
      state: state,
    };
    const url = `${cognitoOAuthURL}?${querystring.stringify(params)}`;
    console.log("OAuth URL:", url);
    redirect(302, undefined, { Location: url });
  }

  @Get("/signin/google/callback_authorisation")
  public async handleGoogleOAuthCallback(
    @Request() req: ExRequest,
    @Res() badRequest: TsoaResponse<400, { message: string }>,
    @Res() internalServerError: TsoaResponse<500, { message: string }>,
    @Res() success: TsoaResponse<200, any>
  ): Promise<void> {
    const { code } = req.query;
    if (!code) {
      return badRequest(400, { message: "Authorization code is missing." });
    }

    try {
      const tokens = await this.exchangeGoogleAuthCodeForTokens(code as string);

      // Call the email verification update function here
      const username = this.extractEmailFromToken(tokens.id_token); // Implemented function
      await this.updateCognitoUserEmailVerification(username);

      return success(200, tokens);
    } catch (error: any) {
      console.error(
        `AuthController - handleGoogleOAuthCallback() error: ${JSON.stringify(
          error,
          null,
          2
        )}`,
        error
      );

      if (error.response) {
        const errorResponse = error.response.data;
        return badRequest(400, {
          message: `Google OAuth error: ${JSON.stringify(
            errorResponse,
            null,
            2
          )}`,
        });
      }

      return internalServerError(500, {
        message: "Internal server error during Google OAuth callback.",
      });
    }
  }

  private async exchangeGoogleAuthCodeForTokens(code: string) {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      redirect_uri: redirectURI,
      grant_type: "authorization_code",
    }).toString();

    const headerAuthorization = `Basic ${Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64")}`;

    try {
      const response = await axios.post(tokenURL, params, {
        headers: {
          Authorization: headerAuthorization,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Error exchanging authorization code:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  private async updateCognitoUserEmailVerification(email: string) {
    const adminUpdateUserAttributesCommand =
      new AdminUpdateUserAttributesCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: email,
        UserAttributes: [
          {
            Name: "email_verified",
            Value: "true",
          },
        ],
      });

    try {
      await client.send(adminUpdateUserAttributesCommand);
    } catch (error: any) {
      console.error(
        "Error updating user email verification status:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  private extractEmailFromToken(idToken: string): string {
    const decoded = jwt.decode(idToken) as { "cognito:username": string };
    console.log("decoded", decoded);
    if (!decoded || !decoded["cognito:username"]) {
      throw new Error("Invalid ID token");
    }
    return decoded["cognito:username"];
  }
}
