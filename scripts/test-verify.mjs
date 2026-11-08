import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../src/server/db";
import { users, platformAdmins } from "../src/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const [u] = await db.select().from(users).where(eq(users.email, "admin@umkm-ai.local")).limit(1);
  const [p] = await db.select().from(platformAdmins).where(eq(platformAdmins.userId, u.id)).limit(1);
  console.log("User:", { email: u.email, name: u.name });
  console.log("Platform Admin:", { mfaEnabled: p.mfaEnabled, hasSecret: !!p.mfaSecret });
}

main().catch(console.error);