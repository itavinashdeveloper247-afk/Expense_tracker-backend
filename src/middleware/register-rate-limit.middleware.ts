import rateLimit from "express-rate-limit";

export function createRegisterRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    statusCode: 429,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    skipSuccessfulRequests: false,
    skipFailedRequests: false,

    message: {
      message: "Too many registration attempts. Please try again later. ",
    },
  });
}
export const RegisterRateLimit = createRegisterRateLimit();
