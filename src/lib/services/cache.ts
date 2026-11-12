import type { ServiceResult } from "../radio/types.ts";

export interface CacheStore {
  match(key: Request): Promise<Response | undefined>;
  put(key: Request, value: Response): Promise<void>;
}
export type Entry<T> = {
  data: T | null;
  updatedAt: number | null;
  checkedAt: number;
  retryAt: number;
  etag?: string;
  modified?: string;
};
export type Policy = { ttl: number; retention: number; retry: number; swr: boolean };
export type LoadResult<T> =
  | { data: T; etag?: string; modified?: string }
  | { notModified: true; etag?: string; modified?: string };
export type WaitUntil = (promise: Promise<unknown>) => void;

/** CacheStore is Cloudflare's shared per-POP Cache API, NOT a process map. */
export class IntegrationCache {
  private pending = new Map<string, Promise<Entry<unknown>>>();
  constructor(
    private store: CacheStore,
    private now = Date.now,
  ) {}

  async get<T>(
    key: Request,
    policy: Policy,
    load: (previous?: Entry<T>) => Promise<LoadResult<T>>,
    waitUntil?: WaitUntil,
  ): Promise<ServiceResult<T>> {
    let previous: Entry<T> | undefined;
    try {
      previous = (await (await this.store.match(key))?.json()) as Entry<T> | undefined;
    } catch {
      /* evicted or unavailable */
    }
    const now = this.now();
    if (previous?.updatedAt != null && now - previous.updatedAt > policy.retention * 1000)
      previous = undefined;
    const result = (entry: Entry<T>): ServiceResult<T> => ({
      data: entry.data,
      updatedAt: entry.updatedAt,
      stale:
        entry.data !== null &&
        (entry.retryAt > this.now() || this.now() - entry.checkedAt >= policy.ttl * 1000),
    });
    if (previous && (now - previous.checkedAt < policy.ttl * 1000 || now < previous.retryAt))
      return result(previous);
    const refresh = (): Promise<Entry<T>> => {
      const pending = this.pending.get(key.url);
      if (pending) return pending as Promise<Entry<T>>;
      const job = (async () => {
        // Another isolate may have filled the shared cache since our first read.
        try {
          const latest = (await (await this.store.match(key))?.json()) as Entry<T> | undefined;
          if (
            latest &&
            (this.now() - latest.checkedAt < policy.ttl * 1000 || this.now() < latest.retryAt)
          )
            return latest;
          if (
            latest &&
            latest.updatedAt != null &&
            this.now() - latest.updatedAt <= policy.retention * 1000
          )
            previous = latest;
        } catch {
          /* fall back to origin */
        }
        let entry: Entry<T>;
        try {
          const loaded = await load(previous);
          if ("notModified" in loaded && !previous?.data)
            throw new Error("304 sem conteúdo anterior");
          entry = {
            data: "notModified" in loaded ? previous!.data : loaded.data,
            updatedAt: this.now(),
            checkedAt: this.now(),
            retryAt: 0,
            etag: loaded.etag ?? ("notModified" in loaded ? previous?.etag : undefined),
            modified: loaded.modified ?? ("notModified" in loaded ? previous?.modified : undefined),
          };
        } catch {
          entry = {
            data: previous?.data ?? null,
            updatedAt: previous?.updatedAt ?? null,
            checkedAt: previous?.checkedAt ?? 0,
            retryAt: this.now() + policy.retry * 1000,
            etag: previous?.etag,
            modified: previous?.modified,
          };
        }
        const remaining =
          entry.data && entry.updatedAt != null
            ? Math.max(1, policy.retention - Math.floor((this.now() - entry.updatedAt) / 1000))
            : policy.retry;
        try {
          await this.store.put(
            key,
            Response.json(entry, { headers: { "Cache-Control": `public, max-age=${remaining}` } }),
          );
        } catch {
          /* cache is best effort; never discard valid origin data */
        }
        return entry;
      })();
      this.pending.set(key.url, job);
      void job.finally(() => {
        if (this.pending.get(key.url) === job) this.pending.delete(key.url);
      });
      return job;
    };
    if (previous?.data && policy.swr && waitUntil) {
      waitUntil(refresh());
      return result(previous);
    }
    return result(await refresh());
  }
}

/** Development fallback only. It does not offer cross-instance sharing. */
export class DevelopmentCache implements CacheStore {
  private entries = new Map<string, { body: string; until: number }>();
  async match(key: Request) {
    const entry = this.entries.get(key.url);
    return entry && entry.until > Date.now() ? new Response(entry.body) : undefined;
  }
  async put(key: Request, response: Response) {
    const ttl = Number(response.headers.get("Cache-Control")?.match(/max-age=(\d+)/)?.[1] ?? 0);
    this.entries.set(key.url, { body: await response.text(), until: Date.now() + ttl * 1000 });
  }
}
