import { createHash } from "crypto";
import { pool } from "../config/database.js";
import {
  findVerificationToken,
  issueVerificationEmailLink,
  markEmailVerified,
  markTokenUsed,
  replaceVerificationToken,
  tokenRowDetails,
} from "../repositories/email-verification.repository.js";

export async function verifyEmailService(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch the matching row
    const tokenRow = await findVerificationToken(connection, tokenHash);
    console.log(tokenRow, "findVerificationToken");

    if (!tokenRow) {
      await connection.rollback();
      return {
        status: "Invalid",
        message: "Invalid verification token.",
      };
    }

    // 2. Check whether it has already has been used
    if (!!tokenRow.used_at) {
      await connection.rollback();
      return {
        status: "already_used",
        message: "This verification token has already been used",
      };
    }

    // 3. Check whether token  has been expired
    if (Date.now() >= tokenRow.expires_at.getTime()) {
      await connection.rollback();
      return {
        status: "expired",
        message: "This verification has been expired",
      };
    }

    //4. Verify the user and consume the token
    await markEmailVerified(connection, tokenRow.user_id);
    await markTokenUsed(connection, tokenRow.id);

    await connection.commit();
    return {
      status: "verified",
      message: "Your email has been verified successfully.",
    };
  } catch (error) {
    await connection.rollback();
    console.log(error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function resendVerificationEmailService(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // 1. Fetch the matching row
    const tokenRow = await tokenRowDetails(connection, tokenHash);

    if (tokenRow) {
      let ip = await replaceVerificationToken(connection, tokenRow);
    }
  } catch (error) {
    await connection.rollback();
    console.log(error);
  } finally {
    connection.release();
  }
}
