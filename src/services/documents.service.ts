import { db } from "./db";
import type { ApiDocument, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const documentsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiDocument>> {
    await delay();
    const all = db.read("documents");
    const filters: Array<(d: ApiDocument) => boolean> = [];
    const owner = params.filters?.owner_id as string | undefined;
    if (owner) filters.push((d) => d.owner_id === owner);
    const type = params.filters?.type as string | undefined;
    if (type && type !== "all") filters.push((d) => d.type === type);
    return applyQuery(all, {
      ...paramsToOptions<ApiDocument>(params, ["name", "type"]),
      sort: { key: "uploaded_at", order: "desc" },
      filters,
    });
  },

  async create(input: Omit<ApiDocument, "id" | "uploaded_at">): Promise<ApiDocument> {
    await delay(220, 480);
    const d: ApiDocument = { ...input, id: uid("doc"), uploaded_at: nowIso() };
    db.mutate("documents", (list) => [d, ...list]);
    return d;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("documents", (list) => list.filter((d) => d.id !== id));
  },
};
