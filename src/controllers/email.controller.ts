import type { Request, Response, NextFunction } from "express";
import {
  verifyEmailService,
  resendVerificationEmailService,
} from "../services/email.service.js";

export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.query.token;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      res.status(400).json({
        message: "A valid verification token is required.",
      });
      return;
    }

    const result = await verifyEmailService(token);

    const statusCode =
      result.status === "verified"
        ? 200
        : result.status === "already_used"
          ? 409
          : result.status === "expired"
            ? 410
            : 400;

    res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
     const token = req.query.token;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      res.status(400).json({
        message: "A valid verification token is required.",
      });
      return;
    }

    const result = await resendVerificationEmailService(token);
     res.status(200).json(result);
  } catch (error) {
    next(error)
  }
}
