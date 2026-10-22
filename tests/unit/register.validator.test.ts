import { describe, it, expect } from "vitest";
import { registerSchema } from "../../src/validators/register.validator";

describe("Register Validation ", async () => {
  it("accept valid Registration Data", async () => {
    //Arrange
    const payload = {
      name: "Avinash Kumar",
      email: "invalid-email@gma.com",
      password: "ExampleOnly-Password123!",
    };

    //ACT
    const result = registerSchema.safeParse(payload)

    //Assert
    expect(result.success).toBe(true)
  });
});
