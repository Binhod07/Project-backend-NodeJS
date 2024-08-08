// callbackRoutes.ts
import { Router } from "express";
import { AuthController } from "../../controllers/authController";

const router = Router();

router.get("/callback_authorisation", async (req, res) => {
  const controller = new AuthController();
  const code = req.query.code as string;
  const state = req.query.state as string; // Retrieve the state parameter

  try {
    const tokens = await controller.googleCallback(code, state);
    res.json(tokens);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
