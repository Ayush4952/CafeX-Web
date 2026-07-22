import { pool } from "../database/db.js";

const publicFields = `id, full_name AS fullName, email, phone, role,
  avatar_url AS avatarUrl, created_at AS createdAt`;

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, full_name AS fullName, email, phone, role, avatar_url AS avatarUrl,
      password_hash AS passwordHash, created_at AS createdAt
     FROM users WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT ${publicFields} FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser({ fullName, email, passwordHash, phone }) {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, password_hash, phone)
     VALUES (?, ?, ?, ?)`,
    [fullName, email, passwordHash, phone || null],
  );
  return findUserById(result.insertId);
}

export async function listUsers() {
  const [rows] = await pool.query(
    `SELECT ${publicFields} FROM users ORDER BY created_at DESC`,
  );
  return rows;
}

export async function updateUserRole(id, role) {
  await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return findUserById(id);
}
