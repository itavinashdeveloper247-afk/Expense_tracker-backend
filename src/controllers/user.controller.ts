import type { Request, Response, NextFunction } from "express";
import { userLoginService } from "../services/user.service.js";

export async function userLoginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userLogin = await userLoginService(req.body);
  } catch (error) {
    console.log(error);
  }
}
