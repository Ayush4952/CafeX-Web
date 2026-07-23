import "dotenv/config";
import { pool } from "../database/db.js";
import { hashPassword } from "../utils/security.js";

const [email, password, fullName = "CafeX Staff"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-staff -- staff@example.com StrongPassword \"Staff Name\"");
  process.exit(1);
}

const passwordHash = await hashPassword(password);
await pool.execute(
  `INSERT INTO users (full_name, email, password_hash, role)
   VALUES (?, ?, ?, 'staff')
   ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = 'staff'`,
  [fullName, email.toLowerCase(), passwordHash],
);
console.log(`Staff account ready: ${email.toLowerCase()}`);
await pool.end();
