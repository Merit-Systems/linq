import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set — skipping prisma migrate deploy");
  process.exit(0);
}

execSync("npx prisma migrate deploy", {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
