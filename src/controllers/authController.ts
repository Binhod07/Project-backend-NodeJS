import { Request, Response } from "express";
import { signUp, confirmSignUp, signIn } from "../services/authService";

// Utility function to handle error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

// Sign-up controller
export const signUpController = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  try {
    const response = await signUp(username, password, email);
    res.status(200).json({
      message: "User signed up successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error signing up",
      error: getErrorMessage(error),
    });
  }
};

// Confirm sign-up controller
export const confirmSignUpController = async (req: Request, res: Response) => {
  const { username, code } = req.body;

  try {
    const response = await confirmSignUp(username, code);
    res.status(200).json({
      message: "User confirmed successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error confirming user",
      error: getErrorMessage(error),
    });
  }
};

// Sign-in controller
export const signInController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const response = await signIn(username, password);
    res.status(200).json({
      message: "User signed in successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error signing in",
      error: getErrorMessage(error),
    });
  }
};
