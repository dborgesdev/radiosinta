import { test } from "node:test";
import assert from "node:assert/strict";
import { IntegrationCache } from "../src/lib/services/cache.ts";
import type { CacheStore, Policy } from "../src/lib/services/cache.ts";

class SharedTestStore implements CacheStore {
  entries = new Map<string, Response>();
  async match(key: Request) {
    return this.entries.get(key.url)?.clone();
  }
  async put(key: Request, response: Response) {
    this.entries.set(key.url, response.clone());
  }
}
const key = new Request("https://radiosinta.com.br/__integration-cache/v1/api/nowplaying");
const policy: Policy = { ttl: 15, retention: 3600, retry: 15, swr: false };

test("100 concurrent visitors use one origin request, then another cache instance reuses shared data", async () => {
  const store = new SharedTestStore();
  let now = 100_000;
  let calls = 0;
  const load = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 5));
    return { data: { title: "A" } };
  };
  const cache = new IntegrationCache(store, () => now);
  const values = await Promise.all(Array.from({ length: 100 }, () => cache.get(key, policy, load)));
  assert.equal(calls, 1);
  assert.ok(values.every((v) => v.data?.title === "A"));
  const otherIsolate = new IntegrationCache(store, () => now);
  await otherIsolate.get(key, policy, load);
  assert.equal(calls, 1);
  now += 14999;
  await otherIsolate.get(key, policy, load);
  assert.equal(calls, 1);
  now += 1;
  await otherIsolate.get(key, policy, load);
  assert.equal(calls, 2);
});
test("failures preserve valid data and share retry cooldown, even with a new instance", async () => {
  const store = new SharedTestStore();
  let now = 100_000;
  let calls = 0;
  const cache = new IntegrationCache(store, () => now);
  await cache.get(key, policy, async () => ({ data: "last valid" }));
  now += 15000;
  const failed = async () => {
    calls++;
    throw new Error("timeout");
  };
  const stale = await cache.get(key, policy, failed);
  assert.equal(stale.data, "last valid");
  assert.equal(stale.stale, true);
  await new IntegrationCache(store, () => now).get(key, policy, failed);
  assert.equal(calls, 1);
  now += 15000;
  await cache.get(key, policy, failed);
  assert.equal(calls, 2);
  now += 3_600_001;
  const expired = await cache.get(key, policy, failed);
  assert.equal(expired.data, null);
});
test("cold failures are negatively cached and a later successful request recovers", async () => {
  const store = new SharedTestStore();
  let now = 100_000;
  let calls = 0;
  const failed = async () => {
    calls++;
    throw new Error("offline");
  };
  await new IntegrationCache(store, () => now).get(key, policy, failed);
  await new IntegrationCache(store, () => now).get(key, policy, failed);
  assert.equal(calls, 1);
  now += 15_001;
  const result = await new IntegrationCache(store, () => now).get(key, policy, async () => ({
    data: "recovered",
  }));
  assert.equal(result.data, "recovered");
  assert.equal(result.stale, false);
});
test("RSS stale-while-revalidate uses waitUntil and a 304 reuses already parsed JSON", async () => {
  const store = new SharedTestStore();
  let now = 100_000;
  let parses = 0;
  let calls = 0;
  const cache = new IntegrationCache(store, () => now);
  const rss = { ttl: 900, retention: 86400, retry: 60, swr: true };
  await cache.get(key, rss, async () => {
    parses++;
    return { data: ["news"], etag: '"v1"', modified: "Thu, 12 Nov 2026 12:00:00 GMT" };
  });
  now += 900_000;
  const tasks: Promise<unknown>[] = [];
  const result = await cache.get(
    key,
    rss,
    async (previous) => {
      calls++;
      assert.equal(previous?.etag, '"v1"');
      assert.ok(previous?.modified);
      return { notModified: true };
    },
    (task) => tasks.push(task),
  );
  assert.deepEqual(result.data, ["news"]);
  assert.equal(result.stale, true);
  await Promise.all(tasks);
  const other = await new IntegrationCache(store, () => now).get(key, rss, async () => {
    throw new Error("must not load");
  });
  assert.equal(other.stale, false);
  assert.equal(parses, 1);
  assert.equal(calls, 1);
});
test("RSS uses synchronous refresh when a background lifetime is unavailable", async () => {
  const store = new SharedTestStore();
  let now = 100_000;
  const cache = new IntegrationCache(store, () => now);
  const rss = { ...policy, swr: true };
  await cache.get(key, rss, async () => ({ data: "old" }));
  now += 15000;
  assert.equal((await cache.get(key, rss, async () => ({ data: "new" }))).data, "new");
});
test("cache write failure does not discard successfully fetched data", async () => {
  const store: CacheStore = {
    match: async () => undefined,
    put: async () => {
      throw new Error("eviction");
    },
  };
  assert.equal(
    (await new IntegrationCache(store).get(key, policy, async () => ({ data: "valid" }))).data,
    "valid",
  );
});
