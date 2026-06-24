import { db } from "./db";
import type { ApiReview, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const reviewsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiReview>> {
    await delay();
    const all = db.read("reviews");
    const filters: Array<(r: ApiReview) => boolean> = [];
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((r) => r.status === status);
    const user = params.filters?.user_id as string | undefined;
    if (user) filters.push((r) => r.user_id === user);
    const hotel = params.filters?.hotel_id as string | undefined;
    if (hotel) filters.push((r) => r.hotel_id === hotel);
    const owner = params.filters?.owner_id as string | undefined;
    if (owner) {
      const ownedIds = new Set(db.read("hotels").filter((h) => h.owner_id === owner).map((h) => h.id));
      filters.push((r) => ownedIds.has(r.hotel_id));
    }
    return applyQuery(all, {
      ...paramsToOptions<ApiReview>(params, ["user_name", "hotel_name", "title", "body"]),
      filters,
    });
  },

  async create(input: Omit<ApiReview, "id" | "created_at" | "status">): Promise<ApiReview> {
    await delay();
    const review: ApiReview = { ...input, id: uid("rev"), status: "published", created_at: nowIso() };
    db.mutate("reviews", (list) => [review, ...list]);
    return review;
  },

  async update(id: string, patch: Partial<ApiReview>): Promise<ApiReview> {
    await delay();
    let updated: ApiReview | null = null;
    db.mutate("reviews", (list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("Review not found");
    return updated;
  },

  async reply(id: string, reply: string): Promise<ApiReview> {
    return this.update(id, { reply, reply_at: nowIso() });
  },

  async approve(id: string) {
    return this.update(id, { status: "published" });
  },

  async reject(id: string) {
    return this.update(id, { status: "rejected" });
  },

  async flag(id: string) {
    return this.update(id, { status: "flagged" });
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("reviews", (list) => list.filter((r) => r.id !== id));
  },
};
