import { db } from "./db";
import type { ApiAnnouncement, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const announcementsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiAnnouncement>> {
    await delay();
    const all = db.read("announcements");
    const filters: Array<(a: ApiAnnouncement) => boolean> = [];
    const audience = params.filters?.audience as string | undefined;
    if (audience && audience !== "all") filters.push((a) => a.audience === audience || a.audience === "all");
    const type = params.filters?.type as string | undefined;
    if (type && type !== "all") filters.push((a) => a.type === type);
    return applyQuery(all, {
      ...paramsToOptions<ApiAnnouncement>(params, ["title", "body"]),
      sort: { key: "created_at", order: "desc" },
      filters,
    });
  },

  async create(input: Omit<ApiAnnouncement, "id" | "created_at">): Promise<ApiAnnouncement> {
    await delay();
    const a: ApiAnnouncement = { ...input, id: uid("ann"), created_at: nowIso() };
    db.mutate("announcements", (list) => [a, ...list]);
    return a;
  },

  async update(id: string, patch: Partial<ApiAnnouncement>): Promise<ApiAnnouncement> {
    await delay();
    let updated: ApiAnnouncement | null = null;
    db.mutate("announcements", (list) =>
      list.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("Announcement not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("announcements", (list) => list.filter((a) => a.id !== id));
  },

  async publish(id: string) {
    return this.update(id, { is_published: true });
  },

  async unpublish(id: string) {
    return this.update(id, { is_published: false });
  },
};
