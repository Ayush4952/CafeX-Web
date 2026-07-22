import assert from "node:assert/strict";
import test from "node:test";
import { requireRole } from "../middleware/authMiddleware.js";
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

test("staff order controls reject customers but allow staff and admins", () => {
  const middleware = requireRole("staff", "admin");
  let statusCode;
  let responseBody;
  let nextCalls = 0;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  middleware({ user: { role: "customer" } }, response, () => { nextCalls += 1; });
  assert.equal(statusCode, 403);
  assert.deepEqual(responseBody, { message: "You do not have permission" });
  assert.equal(nextCalls, 0);

  middleware({ user: { role: "staff" } }, response, () => { nextCalls += 1; });
  middleware({ user: { role: "admin" } }, response, () => { nextCalls += 1; });
  assert.equal(nextCalls, 2);
});
