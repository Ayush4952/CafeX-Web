import assert from "node:assert/strict";
import test from "node:test";
import { createToken, hashPassword, verifyPassword, verifyToken } from "../utils/security.js";

process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-tests";

test("hashes and verifies passwords", async () => {
  const hash = await hashPassword("CafeX-test-123");
  assert.notEqual(hash, "CafeX-test-123");
  assert.equal(await verifyPassword("CafeX-test-123", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("creates verifiable user tokens", () => {
  const token = createToken({ id: 7, role: "customer", email: "guest@cafex.test" });
  const payload = verifyToken(token);
  assert.equal(payload.sub, "7");
  assert.equal(payload.role, "customer");
});
