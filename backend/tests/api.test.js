import assert from "node:assert/strict";
import test from "node:test";
import { app } from "../app.js";

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("serves the CafeX API health endpoint", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "CafeX API" });
  });
});

test("returns structured JSON for unknown routes", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/not-a-route`);
    assert.equal(response.status, 404);
    assert.match((await response.json()).message, /Route not found/);
  });
});
