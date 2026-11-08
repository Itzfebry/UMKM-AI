import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("DIRECT_URL:", process.env.DIRECT_URL ? "SET" : "MISSING");
console.log("FULL DATABASE_URL:", process.env.DATABASE_URL);
