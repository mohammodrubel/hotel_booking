import { db } from "./db";
import type { ApiUser, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, paramsToOptions, uid, nowIso } from "./util";

export const usersService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiUser>> {
    await delay();
    const all = db.read("users");
    const filters: Array<(u: ApiUser) => boolean> = [];
    const role = params.filters?.role as string | undefined;
    if (role && role !== "all") filters.push((u) => u.role === role);
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((u) => u.status === status);
    return applyQuery(all, {
      ...paramsToOptions<ApiUser>(params, ["full_name", "email", "phone"]),
      filters,
    });
  },

  async get(id: string): Promise<ApiUser | null> {
    await delay(80, 180);
    return db.read("users").find((u) => u.id === id) ?? null;
  },

  async create(input: Omit<ApiUser, "id" | "joined_at" | "bookings_count" | "total_spend">): Promise<ApiUser> {
    await delay();
    const user: ApiUser = {
      ...input,
      id: uid("u"),
      bookings_count: 0,
      total_spend: 0,
      joined_at: nowIso().split("T")[0]!,
    };
    db.mutate("users", (list) => [user, ...list]);
    return user;
  },

  async update(id: string, patch: Partial<ApiUser>): Promise<ApiUser> {
    await delay();
    let updated: ApiUser | null = null;
    db.mutate("users", (list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("User not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("users", (list) => list.filter((u) => u.id !== id));
  },

  async suspend(id: string): Promise<ApiUser> {
    return this.update(id, { status: "suspended" });
  },

  async activate(id: string): Promise<ApiUser> {
    return this.update(id, { status: "active" });
  },

  async verifyKyc(id: string): Promise<ApiUser> {
    return this.update(id, { kyc_status: "verified" });
  },

  async stats() {
    await delay(80, 200);
    const users = db.read("users");
    return {
      total: users.length,
      guests: users.filter((u) => u.role === "user").length,
      managers: users.filter((u) => u.role === "manager").length,
      admins: users.filter((u) => u.role === "admin").length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      pending: users.filter((u) => u.status === "pending").length,
    };
  },
};
