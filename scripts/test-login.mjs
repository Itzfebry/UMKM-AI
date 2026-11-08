import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { adminSignIn } from "@/admin-auth";

async function main() {
  try {
    // Coba login tanpa kode MFA (karena mfaEnabled: false)
    const result = await adminSignIn("credentials", {
      email: "admin@umkm-ai.local",
      password: "Admin123!",
      code: undefined,
      redirectTo: "/panel",
    });
    console.log("Login result type:", result?.type);
    if (result?.error) console.error("Error:", result.error);
    else console.log("Login berhasil, user:", result?.user);
  } catch (err) {
    console.error("Exception:", err);
  }
}

main();