import type { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "../validators/validator.js";

export function validateRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(422).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }
  // Pass only the parsed, validated values to later handlers.
  req.body = result.data;

  next();
}
export function validateUserLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(422).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }
  // Pass only the parsed, validated values to later handlers.
  req.body = result.data;

  next();
}

