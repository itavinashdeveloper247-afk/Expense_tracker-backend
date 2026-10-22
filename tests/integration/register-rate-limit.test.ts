import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";

import { createRegisterRateLimit } from "../../src/middleware/register-rate-limit.middleware.js";
import { validateRegistration } from "../../src/middleware/validate-middleware.js";
import { register } from "../../src/controllers/auth.controller.js";
import app from "../../src/app.js";

describe("Registration rate Limiting", async () => {
  it("block the sixth request, including invalid attempts", async () => {
    //Arrange: a fresh app and limiter for the test
    // ARRANGE: a fresh app and limiter for this test.
    const app = express();

    app.use(express.json());

    app.post(
      "/register",
      createRegisterRateLimit(),
      validateRegistration,
      register,
    );

    const payload = {
      name: "Avinash Kumar",
      email: "invalid-email",
      password: "ExampleOnly-Password123!",
    };

    // ACT + ASSERT: THE first five reach validation.
    for (let attempt = 0; attempt < 5; attempt++) {
      const response: any = await request(app).post("/register").send(payload);

     
      expect(response.status).toBe(422);
      expect(response.body.message).toBe("Validation failed");
    }

    // The sixth must be blocked before validation.
    const blockedResponse = await request(app).post("/register").send(payload);

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body.message).toBe(
      "Too many registration attempts. Please try again later.",
    );
  });
});
