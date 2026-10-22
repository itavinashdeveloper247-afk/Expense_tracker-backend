import { Router } from "express";
import { resendVerificationEmailController, verifyEmailController } from "../controllers/email.controller.js";

const emailRouter = Router()

emailRouter.get("/verify-email", verifyEmailController);
emailRouter.get("/resend-verification-link", resendVerificationEmailController);
export default emailRouter