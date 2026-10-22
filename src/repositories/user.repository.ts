import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { pool } from "../config/database.js";

// Normal application calls use the pool.
// The verification script supplies its transaction connection.
type DatabaseExecutor = Pool | PoolConnection;

interface UserLookupRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export async function findUserByEmail(
  email: string,
  db: DatabaseExecutor = pool,
): Promise<UserLookupRow | null> {
  const [rows] = await db.execute<UserLookupRow[]>(
    `
      SELECT id, name, email, password_hash as password
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

export async function createUser(
  input: CreateUserInput,
  db: DatabaseExecutor = pool,
): Promise<number> {
  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `,
    [input.name, input.email, input.passwordHash],
  );

  return result.insertId;
}

// ----------------- LOGIN API -----------------
// export async function
