import assert from "node:assert/strict";

// Run against the local production build: wrangler dev --local --config dist/server/wrangler.json
const base = process.argv[2] ?? "http://127.0.0.1:8787";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw new Error("Local Worker only");
for (const path of ["/api/nowplaying", "/api/news", "/api/news/gospel"]) {
  const results = await Promise.all(
    Array.from({ length: 100 }, async (_, i) => {
      const response = await fetch(`${base}${path}?visitor=${i}`, {
        signal: AbortSignal.timeout(20000),
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("X-Integration-Cache"), "cloudflare-pop");
      return response.json();
    }),
  );
  const timestamps = new Set(results.map((result) => result.updatedAt));
  assert.equal(timestamps.size, 1, "100 visitors must reuse the same normalized cache entry");
  assert.ok(results.every((result) => result.data));
  assert.equal(new Set(results.map((result) => JSON.stringify(result))).size, 1);
  if (path === "/api/news") assert.ok(results[0].data.length <= 10);
  if (path === "/api/news/gospel") {
    assert.ok(results[0].data.length <= 4);
    assert.ok(results[0].data.every((item) => item.image));
  }
  console.log(
    `PASS built Worker ${path}: 100 visitors, one cached normalized version (${results[0].stale ? "last valid during origin failure" : "fresh"})`,
  );
}
const html = await (await fetch(base)).text();
assert.equal((html.match(/<audio\b/g) ?? []).length, 1);
assert.ok(html.includes("Uma Palavra"));
console.log("PASS production SSR: one audio element and local daily verse");
