import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  schemaFilter: ["umkm_ai"],
  migrations: { table: "__drizzle_migrations", schema: "umkm_ai" },
  dbCredentials: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
});