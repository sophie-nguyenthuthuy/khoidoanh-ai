import "server-only";

import pino from "pino";

import { env } from "@/env.mjs";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: { service: "khoidoanh-ai" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.idNumber",
      "*.email",
      "*.phone",
    ],
    censor: "[REDACTED]",
  },
  ...(env.NODE_ENV !== "production" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});
