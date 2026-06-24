import { db } from "./db";
import type { ApiAuditLog, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const auditService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiAuditLog>> {
    await delay();
    const all = db.read("audit_logs");
    const filters: Array<(a: ApiAuditLog) => boolean> = [];
    const action = params.filters?.action as string | undefined;
    if (action && action !== "all") filters.push((a) => a.action.startsWith(action));
    const entity = params.filters?.entity as string | undefined;
    if (entity && entity !== "all") filters.push((a) => a.entity === entity);
    return applyQuery(all, {
      ...paramsToOptions<ApiAuditLog>(params, ["user_name", "action", "entity", "ip"]),
      sort: { key: "created_at", order: "desc" },
      filters,
    });
  },

  async log(input: Omit<ApiAuditLog, "id" | "created_at" | "ip">): Promise<ApiAuditLog> {
    const a: ApiAuditLog = {
      ...input,
      id: uid("audit"),
      ip: "127.0.0.1",
      created_at: nowIso(),
    };
    db.mutate("audit_logs", (list) => [a, ...list]);
    return a;
  },
};
