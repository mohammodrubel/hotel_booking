import type { ListParams, PaginatedResult } from "./types";

const DEFAULT_LATENCY_MIN = 180;
const DEFAULT_LATENCY_MAX = 480;

export function delay(min = DEFAULT_LATENCY_MIN, max = DEFAULT_LATENCY_MAX) {
  const ms = min + Math.random() * Math.max(0, max - min);
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function uid(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export interface QueryOptions<T> {
  search?: { term?: string; fields: (keyof T)[] };
  filters?: Array<(item: T) => boolean>;
  sort?: { key: keyof T; order?: "asc" | "desc" };
  page?: number;
  limit?: number;
}

export function applyQuery<T>(items: T[], opts: QueryOptions<T>): PaginatedResult<T> {
  let list = items.slice();

  const term = opts.search?.term?.toLowerCase().trim();
  if (term && opts.search?.fields?.length) {
    list = list.filter((it) =>
      opts.search!.fields.some((f) => {
        const v = (it as Record<string, unknown>)[f as string];
        if (v == null) return false;
        return String(v).toLowerCase().includes(term);
      })
    );
  }

  if (opts.filters?.length) {
    list = list.filter((it) => opts.filters!.every((p) => p(it)));
  }

  if (opts.sort?.key) {
    const k = opts.sort.key as string;
    const dir = opts.sort.order === "desc" ? -1 : 1;
    list.sort((a, b) => {
      const av = (a as Record<string, unknown>)[k];
      const bv = (b as Record<string, unknown>)[k];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, opts.limit ?? 10);
  const total = list.length;
  const total_pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return { data, meta: { page, limit, total, total_pages } };
}

export function maybeFail(probability = 0): Promise<void> {
  if (Math.random() < probability) {
    return Promise.reject(new Error("Mock network error"));
  }
  return Promise.resolve();
}

export function paramsToOptions<T>(
  params: ListParams,
  searchFields: (keyof T)[]
): QueryOptions<T> {
  return {
    search: { term: params.search, fields: searchFields },
    sort: params.sort
      ? { key: params.sort as keyof T, order: params.order ?? "asc" }
      : undefined,
    page: params.page,
    limit: params.limit,
  };
}

export function asPaginated<T>(items: T[], page = 1, limit = items.length): PaginatedResult<T> {
  return {
    data: items,
    meta: { page, limit, total: items.length, total_pages: Math.max(1, Math.ceil(items.length / limit)) },
  };
}
