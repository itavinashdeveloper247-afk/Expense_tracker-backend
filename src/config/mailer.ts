import nodemailer from "nodemailer";

import { env } from "./env.js";

export const transporter = nodemailer.createTransport(
  {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  },
  {
    from: {
      name: env.SMTP_FROM_NAME,
      address: env.SMTP_FROM_ADDRESS,
    },
  },
);
