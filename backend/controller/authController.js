import { z } from "zod";
import { createUser, findUserByEmail, findUserById } from "../model/userModel.js";
import { createToken, hashPassword, verifyPassword } from "../utils/security.js";

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(30).optional(),
});

const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export async function register(req, res) {
  const input = registerSchema.parse(req.body);
  if (await findUserByEmail(input.email)) {
    return res.status(409).json({ message: "An account already exists for this email" });
  }
  const passwordHash = await hashPassword(input.password);
  const user = await createUser({ ...input, passwordHash });
  return res.status(201).json({ user, token: createToken(user) });
}

export async function login(req, res) {
  const input = loginSchema.parse(req.body);
  const user = await findUserByEmail(input.email);
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
  const { passwordHash, ...publicUser } = user;
  return res.json({ user: publicUser, token: createToken(publicUser) });
}

export async function me(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: "Account not found" });
  return res.json({ user });
}
