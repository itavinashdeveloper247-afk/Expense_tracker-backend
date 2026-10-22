import { pool } from "../config/database.js";

async function checkDatabase(): Promise<void> {
  try {
    const [rows] = await pool.query("SELECT 1 AS connection_ok");

    console.log("MySQL connection successful.");
    console.log(rows);
  } finally {
    await pool.end();
  }
}

checkDatabase().catch((error: unknown) => {
  console.error(
    "Database check failed:",
    error instanceof Error ? error.message : "Unknown error"
  );

  process.exitCode = 1;
});