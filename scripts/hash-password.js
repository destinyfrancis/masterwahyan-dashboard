import { createHash } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.js "your strong password"');
  process.exit(1);
}

console.log(createHash("sha256").update(password).digest("hex"));
