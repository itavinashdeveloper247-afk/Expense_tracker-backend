import { pool } from "../config/database.js";
import * as argon2 from "argon2";
import { findUserByEmail } from "../repositories/user.repository.js";

interface LoginInput {
  email: string;
  password: string;
}
export async function userLoginService(input: LoginInput) {
  const email = input.email.trim();
  const passwordHash = argon2.hash(input.password, {
    type: argon2.argon2id,
  });
  const connection = await pool.getConnection();
  // 1. Apply the registration rule.
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    await connection.rollback();
    return {
      status: "Invalid",
      message: "Invalid email or password.",
    };
  }
  if (passwordHash==existingUser.password) {
    
    await connection.rollback();
    return {
      status: "verify_email",
      message: "Invalid email or password.",
    };
  }
  if (existingUser) {
    await connection.rollback();
    return {
      status: "verify_email",
      message: "Invalid email or password.",
    };
  }
}
