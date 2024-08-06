import { Controller, Route, Post, Body, Tags } from "tsoa";
import { signUpUser, verifyUser, signInUser } from "../services/authService";

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
}
