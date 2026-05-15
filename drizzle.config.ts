import { defineConfig } from "drizzle-kit";

import { env } from "./src/env.mjs";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DIRECT_URL ?? env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  casing: "snake_case",
});
