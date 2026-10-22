import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { pool } from "../config/database.js";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

async function main(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    try {
      const email = `repository-check-${randomUUID()}@example.com`;

      // 1. A missing user should return null.
      const missingUser = await findUserByEmail(email, connection);

      assert.equal(missingUser, null);

      // 2. Insert a temporary record in this transaction.
      const userId = await createUser(
        {
          name: "Repository Check",
          email,
          passwordHash: "test-fixture-not-a-real-password-hash",
        },
        connection,
      );

      assert.ok(userId > 0);

      // 3. Read the inserted record using the same connection.
      const createdUser = await findUserByEmail(email, connection);

      assert.ok(createdUser);
      assert.equal(createdUser.id, userId);
      assert.equal(createdUser.name, "Repository Check");
      assert.equal(createdUser.email, email);
    } finally {
      // Undo the insertion, including when an assertion fails.
      await connection.rollback();
    }
  } finally {
    // Return the connection even if the check fails.
    connection.release();
  }
}

async function run(): Promise<void> {
  try {
    await main();
    console.log("User repository checks passed.");
  } finally {
    // This standalone process is finished using the database.
    await pool.end();
  }
}

run().catch((error: unknown) => {
  console.error("User repository checks failed:", error);
  process.exitCode = 1;
});