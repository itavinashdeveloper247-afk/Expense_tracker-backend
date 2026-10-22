import { z } from "zod";

const result = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
}).safeParse(process.env);

if (!result.success) {
  const fields = result.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");

  throw new Error(`Invalid migration settings: ${fields}`);
}

const env = result.data;

export default {
  client: "mysql2",

  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },

  pool: {
    min: 0,
    max: 2,
  },

  migrations: {
    directory: "./database/migrations",
    extension: "mjs",
    loadExtensions: [".mjs"],
    tableName: "knex_migrations",
    disableTransactions: true,
  },
};