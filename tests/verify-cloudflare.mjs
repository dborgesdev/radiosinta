import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
import { Miniflare } from "miniflare";
const source = readFileSync("src/lib/services/cache.ts", "utf8");
const compiled = ts
  .transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace(/export /g, "");
const script =
  compiled +
  `
export default { async fetch(request) {
  let clock = 100000; let calls = 0;
  const key = new Request('https://radiosinta.com.br/test-native-' + crypto.randomUUID());
  const policy = {ttl:15,retention:3600,retry:15,swr:false};
  const first = new IntegrationCache(caches.default, () => clock);
  const load = async () => { calls++; return {data:{title:'native cache'}}; };
  const concurrent = await Promise.all(Array.from({length:100}, () => first.get(key,policy,load)));
  const second = new IntegrationCache(caches.default, () => clock);
  await second.get(key,policy,load);
  const before = calls; clock += 15000;
  await second.get(key,policy,load);
  await caches.default.delete(key);
  return Response.json({before,after:calls,count:concurrent.length,data:concurrent[0].data.title,native:typeof caches.default.match});
}};`;
const mf = new Miniflare({
  modules: true,
  script,
  compatibilityDate: "2026-07-01",
  cachePersist: false,
});
try {
  const response = await mf.dispatchFetch("https://radiosinta.com.br/verify");
  const result = await response.json();
  assert.deepEqual(result, {
    before: 1,
    after: 2,
    count: 100,
    data: "native cache",
    native: "function",
  });
  console.log(
    "PASS native Cloudflare Cache API (workerd): 100 concurrent calls, shared reuse, TTL expiry",
    result,
  );
} finally {
  await mf.dispose();
}
