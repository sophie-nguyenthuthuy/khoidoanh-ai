import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { VSIC_LEVEL_4_SEED } from "../src/lib/business-codes/data/vsic-level4";
import { env } from "../src/env.mjs";
import * as schema from "../src/lib/db/schema";

const sql = postgres(env.DIRECT_URL ?? env.DATABASE_URL, { max: 1 });
const db = drizzle(sql, { schema, casing: "snake_case" });

async function seedBusinessCodes() {
  console.log(`Seeding ${VSIC_LEVEL_4_SEED.length} VSIC level-4 codes...`);
  await db
    .insert(schema.businessCodes)
    .values(
      VSIC_LEVEL_4_SEED.map((c) => ({
        code: c.code,
        name: c.name,
        description: c.description,
        level: 4,
        parentCode: c.parentCode,
        isConditional: c.isConditional ?? false,
        conditionalNote: c.conditionalNote,
        excludedItems: c.excludedItems,
        legalVersion: "QD-27-2018",
      })),
    )
    .onConflictDoNothing({ target: schema.businessCodes.code });
}

async function seedLegalVersions() {
  console.log("Seeding legal versions...");
  await db
    .insert(schema.legalVersions)
    .values({
      version: "v2026.01",
      effectiveFrom: new Date("2026-01-01"),
      summary:
        "Phiên bản gốc — tham chiếu Luật DN 2020, NĐ 01/2021, TT 01/2021, QĐ 27/2018 (VSIC).",
      references: [
        { type: "Luật", number: "59/2020/QH14", date: "2020-06-17" },
        { type: "Nghị định", number: "01/2021/NĐ-CP", date: "2021-01-04" },
        { type: "Thông tư", number: "01/2021/TT-BKHĐT", date: "2021-03-16" },
        { type: "Quyết định", number: "27/2018/QĐ-TTg", date: "2018-07-06" },
        { type: "Luật QL Thuế", number: "38/2019/QH14", date: "2019-06-13" },
      ],
    })
    .onConflictDoNothing();
}

async function main() {
  try {
    await seedBusinessCodes();
    await seedLegalVersions();
    console.log("Seed complete.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
