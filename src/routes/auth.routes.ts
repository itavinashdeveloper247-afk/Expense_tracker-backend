import { Router } from "express";
import { register as registerController } from "../controllers/auth.controller.js";
import { validateRegistration } from "../middleware/validate-middleware.js";
import { RegisterRateLimit } from "../middleware/register-rate-limit.middleware.js";

const authRouter = Router();

authRouter.post("/register", RegisterRateLimit, validateRegistration, registerController);

export default authRouter;
