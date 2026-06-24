import { db } from "./db";
import type { ApiServiceRequest, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const serviceRequestsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiServiceRequest>> {
    await delay();
    const all = db.read("service_requests");
    const filters: Array<(s: ApiServiceRequest) => boolean> = [];
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((s) => s.status === status);
    const priority = params.filters?.priority as string | undefined;
    if (priority && priority !== "all") filters.push((s) => s.priority === priority);
    const owner = params.filters?.owner_id as string | undefined;
    if (owner) {
      const ownedIds = new Set(db.read("hotels").filter((h) => h.owner_id === owner).map((h) => h.id));
      filters.push((s) => ownedIds.has(s.hotel_id));
    }
    const requester = params.filters?.requester_id as string | undefined;
    if (requester) filters.push((s) => s.requester_id === requester);
    return applyQuery(all, {
      ...paramsToOptions<ApiServiceRequest>(params, ["hotel_name", "requester_name", "description"]),
      filters,
    });
  },

  async create(input: Omit<ApiServiceRequest, "id" | "created_at" | "updated_at" | "status">): Promise<ApiServiceRequest> {
    await delay();
    const s: ApiServiceRequest = {
      ...input,
      id: uid("sr"),
      status: "open",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.mutate("service_requests", (list) => [s, ...list]);
    return s;
  },

  async update(id: string, patch: Partial<ApiServiceRequest>): Promise<ApiServiceRequest> {
    await delay();
    let updated: ApiServiceRequest | null = null;
    db.mutate("service_requests", (list) =>
      list.map((s) => {
        if (s.id !== id) return s;
        updated = { ...s, ...patch, updated_at: nowIso() };
        return updated;
      })
    );
    if (!updated) throw new Error("Service request not found");
    return updated;
  },

  async setStatus(id: string, status: ApiServiceRequest["status"]) {
    return this.update(id, { status });
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("service_requests", (list) => list.filter((s) => s.id !== id));
  },
};
