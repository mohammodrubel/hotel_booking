import { db } from "./db";
import type { ApiExpense, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const expensesService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiExpense>> {
    await delay();
    const all = db.read("expenses");
    const filters: Array<(e: ApiExpense) => boolean> = [];
    const owner = params.filters?.owner_id as string | undefined;
    if (owner) {
      const ownedIds = new Set(db.read("hotels").filter((h) => h.owner_id === owner).map((h) => h.id));
      filters.push((e) => ownedIds.has(e.hotel_id));
    }
    const hotel = params.filters?.hotel_id as string | undefined;
    if (hotel) filters.push((e) => e.hotel_id === hotel);
    const category = params.filters?.category as string | undefined;
    if (category && category !== "all") filters.push((e) => e.category === category);
    return applyQuery(all, {
      ...paramsToOptions<ApiExpense>(params, ["hotel_name", "category", "note"]),
      filters,
    });
  },

  async create(input: Omit<ApiExpense, "id" | "created_at">): Promise<ApiExpense> {
    await delay();
    const expense: ApiExpense = { ...input, id: uid("exp"), created_at: nowIso() };
    db.mutate("expenses", (list) => [expense, ...list]);
    return expense;
  },

  async update(id: string, patch: Partial<ApiExpense>): Promise<ApiExpense> {
    await delay();
    let updated: ApiExpense | null = null;
    db.mutate("expenses", (list) =>
      list.map((e) => {
        if (e.id !== id) return e;
        updated = { ...e, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("Expense not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("expenses", (list) => list.filter((e) => e.id !== id));
  },

  async totals(ownerId?: string) {
    await delay(80, 200);
    let list = db.read("expenses");
    if (ownerId) {
      const ownedIds = new Set(db.read("hotels").filter((h) => h.owner_id === ownerId).map((h) => h.id));
      list = list.filter((e) => ownedIds.has(e.hotel_id));
    }
    const byCategory = list.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});
    return {
      total: list.reduce((s, e) => s + e.amount, 0),
      by_category: byCategory,
    };
  },
};
