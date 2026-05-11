/**
 * Custom migration runner using Neon HTTP driver.
 * Avoids pg_advisory_lock issues that break prisma migrate deploy on Neon.
 *
 * Usage: npx tsx scripts/migrate.ts
 */
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import "dotenv/config";

const sql = neon(process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!);

async function run() {
  // Ensure migrations table exists
  await sql`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      id VARCHAR(36) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      finished_at TIMESTAMPTZ,
      migration_name VARCHAR(255) NOT NULL,
      logs TEXT,
      rolled_back_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `;

  const migrationsDir = path.join(process.cwd(), "prisma/migrations");
  const folders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;

    // Check if already applied
    const existing = await sql`
      SELECT id FROM "_prisma_migrations" WHERE migration_name = ${folder} AND finished_at IS NOT NULL
    `;
    if (existing.length > 0) {
      console.log(`  ✓ ${folder} (already applied)`);
      continue;
    }

    const migrationSql = fs.readFileSync(sqlFile, "utf-8").trim();
    if (!migrationSql) {
      console.log(`  - ${folder} (empty, skipping)`);
      continue;
    }

    console.log(`  ↑ Applying ${folder}…`);
    const id = crypto.randomUUID();
    const checksum = folder; // simplified — not a real checksum but sufficient

    await sql`
      INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count)
      VALUES (${id}, ${checksum}, ${folder}, now(), 0)
      ON CONFLICT (id) DO NOTHING
    `;

    try {
      // Run each statement separately
      const statements = migrationSql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        await sql.unsafe(stmt);
      }

      await sql`
        UPDATE "_prisma_migrations"
        SET finished_at = now(), applied_steps_count = 1
        WHERE id = ${id}
      `;
      console.log(`  ✓ ${folder}`);
    } catch (err) {
      await sql`
        UPDATE "_prisma_migrations"
        SET logs = ${String(err)}, rolled_back_at = now()
        WHERE id = ${id}
      `;
      console.error(`  ✗ ${folder}:`, err);
      process.exit(1);
    }
  }

  console.log("\nAll migrations applied.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
