import * as argon2 from "argon2";

import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";
import { issueVerificationEmailLink } from "../repositories/email-verification.repository.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  verificationEmailStatus: string;
}

export class EmailAlreadyExistsError extends Error {
  readonly statusCode = 409;

  constructor() {
    super("An account with this email already exists.");
    this.name = "EmailAlreadyExistsError";
  }
}

function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

export async function register(input: RegisterInput): Promise<RegisteredUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  // 1. Apply the registration rule.
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new EmailAlreadyExistsError();
  }

  // 2. Hash the password before sending it to the repository.
  // Do not trim or lowercase passwords.
  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  // 3. Persist the user.
  let userId: number;

  try {
    userId = await createUser({
      name,
      email,
      passwordHash,
    });
  } catch (error: unknown) {
    // Two simultaneous requests might both pass the lookup.
    // The database's UNIQUE email constraint is the final guard.
    if (isDuplicateEntryError(error)) {
      throw new EmailAlreadyExistsError();
    }

    throw error;
  }

  // 4. User creation succeeded. Save the token and send the email.
  let verificationEmailStatus: "submitted" | "failed" = "submitted";
  try {
    let ip = await issueVerificationEmailLink(userId, email);
  } catch (error: unknown) {
    console.log(error);

    verificationEmailStatus = "failed";
    // Record the failure using your server-side logger.
  }

  // 5. Return only safe fields.
  return {
    id: userId,
    name,
    email,
    verificationEmailStatus,
  };
}
