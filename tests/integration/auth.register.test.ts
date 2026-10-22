import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("POST /register", async () => {
  it("returns 422 when the email is invalid", async () => {
    // ARRANGE: only the email is invalid.
    const payload = {
      name: "Avinash Kumar",
      email: "invalid-email",
      password: "ExampleOnly-Password123!",
    };

    // ACT: send a request to our Express application.
    const response = await request(app).post("/register").send(payload);

      // console.log(response,"payload");
    // ASSERT: check the status and field error.
    expect(response.status).toBe(422);

    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "email",
          message: "Enter a valid email address",
        }),
      ]),
    );
  });
});
