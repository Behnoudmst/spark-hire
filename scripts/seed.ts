/**
 * Seeds the database with a default recruiter account.
 * Run with: npx tsx scripts/seed.ts
 *
 * Credentials are read from env vars:
 *   SEED_RECRUITER_EMAIL    (default: recruiter@sparkhire.com)
 *   SEED_RECRUITER_PASSWORD (required)
 */
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaClient } from "../generated/client";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email =
    process.env.SEED_RECRUITER_EMAIL ?? "recruiter@sparkhire.com";
  const rawPassword = process.env.SEED_RECRUITER_PASSWORD;

  if (!rawPassword) {
    console.error(
      "❌ SEED_RECRUITER_PASSWORD env var is required. Add it to your .env file.",
    );
    process.exit(1);
  }

  const password = await bcrypt.hash(rawPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password },
    create: { email, password, role: "RECRUITER" },
  });

  console.log(`✅ Seeded recruiter user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
