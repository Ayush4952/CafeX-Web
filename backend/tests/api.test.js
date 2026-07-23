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

test("serves backend information at the root endpoint", async () => {
  await withServer(async (origin) => {
    const response = await fetch(origin);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "CafeX API");
    assert.equal(body.message, "CafeX backend is running.");
    assert.equal(body.health, "/api/health");
  });
});

test("allows both local frontend development origins", async () => {
  await withServer(async (origin) => {
    for (const frontendOrigin of ["http://localhost:3000", "http://127.0.0.1:3000"]) {
      const response = await fetch(`${origin}/api/health`, {
        headers: { Origin: frontendOrigin },
      });

      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), frontendOrigin);
    }

    const preflight = await fetch(`${origin}/api/auth/register`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://127.0.0.1:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

    assert.equal(preflight.status, 204);
    assert.equal(
      preflight.headers.get("access-control-allow-origin"),
      "http://127.0.0.1:3000",
    );
  });
});

test("returns structured JSON for unknown routes", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/not-a-route`);
    assert.equal(response.status, 404);
    assert.match((await response.json()).message, /Route not found/);
  });
});

test("protects the order-history clear route", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/orders`, { method: "DELETE" });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).message, "Authentication required");
  });
});
