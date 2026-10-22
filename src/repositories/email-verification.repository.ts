import { pool } from "../config/database.js";
import { transporter } from "../config/mailer.js";
import { randomBytes, createHash } from "node:crypto";

import type { PoolConnection, RowDataPacket } from "mysql2/promise";

interface VerificationTokenRow extends RowDataPacket {
  id: number;
  user_id: number;
  used_at: Date | null;
  expires_at: Date;
}

async function createVerificationToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  try {
    await pool.execute(
      `INSERT INTO email_verification_tokens
       (user_id, token_hash, expires_at, used_at)
     VALUES (?, ?, ?, NULL)`,
      [userId, tokenHash, expiresAt],
    );
  } catch (error) {
    console.log("createVerificationToken", error);
  }
}

async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
): Promise<void> {
  try {
    const from = process.env.MAIL_FROM;

    if (!from) {
      throw new Error("MAIL_FROM is missing");
    }

    await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your email Address",
      text: [
        "Welcome to Expense Tracker!",
        "",
        "Verify your email address using this link:",
        verificationUrl,
        "",
        "This link expires in 30 minutes.",
        "If you did not create this account, ignore this email.",
      ].join("\n"),
    });
  } catch (error) {
    console.log("sendVerificationEmail", error);
  }
}

export async function issueVerificationEmailLink(
  userId: number,
  email: string,
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is missing");
  }

  // Original secret: goes in the email link.
  const token = randomBytes(32).toString("hex");

  // Hash: goes in the database.
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Example policy: verification expires after 30 minutes.
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const verificationUrl = new URL("/verify-email", frontendUrl);
  verificationUrl.searchParams.set("token", token);

  // Save first. If this fails, execution stops before sending.
  await createVerificationToken(userId, tokenHash, expiresAt);

  await sendVerificationEmail(email, verificationUrl.toString());
}

export async function findVerificationToken(
  connection: PoolConnection,
  tokenHash: string,
): Promise<VerificationTokenRow | null> {
  const [rows] = await connection.execute<VerificationTokenRow[]>(
    `
      SELECT id, user_id, used_at, expires_at
      FROM email_verification_tokens
      WHERE token_hash = ?
      LIMIT 1
      FOR UPDATE
    `,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function markTokenUsed(
  connection: PoolConnection,
  tokenId: number,
): Promise<void> {
  await connection.execute(
    `
      UPDATE email_verification_tokens
      SET used_at = NOW()
      WHERE id = ?
    `,
    [tokenId],
  );
}

export async function markEmailVerified(
  connection: PoolConnection,
  userId: number,
): Promise<void> {
  await connection.execute(
    `
      UPDATE users
      SET email_verified_at = NOW()
      WHERE id = ?
      AND email_verified_at IS NULL
    `,
    [userId],
  );
}

interface TokenRowDetails extends RowDataPacket {
  token_id: number;
  user_id: number;
  used_at: Date | null;
  email: string;
  email_verified_at: Date | null;
}
export async function tokenRowDetails(
  connection: PoolConnection,
  tokenHash: string,
): Promise<TokenRowDetails | null> {
  const [rows] = await connection.execute<TokenRowDetails[]>(
    `
      SELECT
      evt.id AS token_id,
      evt.user_id,
      evt.used_at,
      u.email,
      u.email_verified_at
      FROM email_verification_tokens AS evt
      INNER JOIN users AS u
      ON u.id = evt.user_id
      WHERE evt.token_hash = ?;
    `,
    [tokenHash],
  );
  return rows[0] ?? null;
}
export async function replaceVerificationToken(
  connection: PoolConnection,
  tokenDetails: TokenRowDetails,
) {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is missing");
  }

  // Original secret: goes in the email link.
  const token = randomBytes(32).toString("hex");

  // Hash: goes in the database.
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Example policy: verification expires after 30 minutes.
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const verificationUrl = new URL("/verify-email", frontendUrl);
  verificationUrl.searchParams.set("token", token);

  await pool.execute(
    `
      UPDATE email_verification_tokens
      SET token_hash = ?, expires_at = ?
      WHERE id = ? 
    `,
    [tokenHash, expiresAt, tokenDetails.token_id],
  );
  await sendVerificationEmail(tokenDetails.email, verificationUrl.toString());
}
