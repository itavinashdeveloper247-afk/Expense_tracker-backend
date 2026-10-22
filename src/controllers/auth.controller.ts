import type { Request, Response, NextFunction } from "express";
import { register as registerUser } from "../services/auth.service.js";
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message:
        user.verificationEmailStatus === "submitted"
          ? "Account created. Please check your email to verify it."
          : "Account created, but we could not confirm verification email submission. Please request a new verification email.",
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
}
