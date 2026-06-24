import { db } from "./db";
import type { ApiPayment, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const paymentsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiPayment>> {
    await delay();
    const all = db.read("payments");
    const filters: Array<(p: ApiPayment) => boolean> = [];
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((p) => p.status === status);
    const type = params.filters?.type as string | undefined;
    if (type && type !== "all") filters.push((p) => p.type === type);
    const user = params.filters?.user_id as string | undefined;
    if (user) filters.push((p) => p.user_id === user);
    return applyQuery(all, {
      ...paramsToOptions<ApiPayment>(params, ["user_name", "reference", "id"]),
      filters,
    });
  },

  async get(id: string): Promise<ApiPayment | null> {
    await delay(80, 180);
    return db.read("payments").find((p) => p.id === id) ?? null;
  },

  async create(input: Omit<ApiPayment, "id" | "created_at" | "reference">): Promise<ApiPayment> {
    await delay();
    const payment: ApiPayment = {
      ...input,
      id: uid("pay"),
      reference: `txn_${Math.random().toString(36).slice(2, 10)}`,
      created_at: nowIso(),
    };
    db.mutate("payments", (list) => [payment, ...list]);
    return payment;
  },

  async refund(id: string): Promise<ApiPayment> {
    await delay();
    let updated: ApiPayment | null = null;
    db.mutate("payments", (list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, status: "refunded" };
        return updated;
      })
    );
    if (!updated) throw new Error("Payment not found");
    return updated;
  },

  async stats() {
    await delay(80, 200);
    const payments = db.read("payments");
    return {
      total: payments.length,
      paid: payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
      pending: payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0),
      refunded: payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0),
      failed: payments.filter((p) => p.status === "failed").length,
    };
  },
};
