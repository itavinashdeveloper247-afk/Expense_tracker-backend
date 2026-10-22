import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .max(254, "Email is too long")
    .pipe(z.email({ error: "Enter a valid email address" })),

  password: z
    .string()
    .min(15, "Password must contain at least 15 characters")
    .max(128, "Password must not exceed 128 characters"),
});
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254, "Email is too long")
    .pipe(z.email({ error: "Enter a valid email address" })),
  password: z
    .string()
    .min(15, "Password must contain at least 15 characters")
    .max(128, "Password must not exceed 128 characters"),
});
