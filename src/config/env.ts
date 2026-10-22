import { z } from "zod";
import "dotenv/config";
const envSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),

  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),

  DB_NAME: z.string().min(1),

  FRONTEND_URL: z.string().min(1),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),

  SMTP_FROM_ADDRESS: z.string().min(1),
  SMTP_FROM_NAME: z.string().min(1),

  MAIL_FROM: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const invalidFields = result.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");

  throw new Error(`Missing or invalid environment settings: ${invalidFields}`);
}

export const env = result.data;
