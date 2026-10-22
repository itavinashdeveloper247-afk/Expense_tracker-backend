import { Router } from "express";
import { userLoginController } from "../controllers/user.controller.js";
import { validateUserLogin } from "../middleware/validate-middleware.js";

const userRouter = Router();

userRouter.post("/login", validateUserLogin, userLoginController);
