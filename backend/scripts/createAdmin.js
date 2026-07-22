import "dotenv/config";
import { pool } from "../database/db.js";
import { hashPassword } from "../utils/security.js";

const [email, password, fullName = "CafeX Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- admin@example.com StrongPassword \"Admin Name\"");
  process.exit(1);
}

const passwordHash = await hashPassword(password);
await pool.execute(
  `INSERT INTO users (full_name, email, password_hash, role)
   VALUES (?, ?, ?, 'admin')
   ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role = 'admin'`,
  [fullName, email.toLowerCase(), passwordHash],
);
console.log(`Admin account ready: ${email.toLowerCase()}`);
await pool.end();
