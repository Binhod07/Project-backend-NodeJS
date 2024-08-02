import { Controller, Route, Post, Body } from "tsoa";
import { signUp, confirmSignUp, signIn } from "../services/authService";

@Route("api/v1/auth")
export class AuthController extends Controller {
  constructor() {
    super();
  }

  @Post("signup")
  public async register(
    @Body() requestBody: { username: string; password: string; email: string }
  ): Promise<any> {
    try {
      const response = await signUp(
        requestBody.username,
        requestBody.password,
        requestBody.email
      );
      this.setStatus(201); // Created
      return response;
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      this.setStatus(500);
      return { error: error.message };
    }
  }

  @Post("confirm")
  public async confirm(
    @Body() requestBody: { username: string; code: string }
  ): Promise<any> {
    try {
      const response = await confirmSignUp(
        requestBody.username,
        requestBody.code
      );
      this.setStatus(200); // OK
      return response;
    } catch (error: any) {
      console.error("Error during confirmation:", error);
      this.setStatus(500);
      return { error: error.message };
    }
  }

  @Post("signin")
  public async login(
    @Body() requestBody: { username: string; password: string }
  ): Promise<any> {
    try {
      const response = await signIn(requestBody.username, requestBody.password);
      this.setStatus(200); // OK
      return response;
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      this.setStatus(500);
      return { error: error.message };
    }
  }
}
