import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  return secret;
}

export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role, email: user.email },
    jwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, jwtSecret());
}
