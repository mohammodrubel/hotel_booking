import { db } from "./db";
import type { ApiHotel, ApiRoom, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const hotelsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiHotel>> {
    await delay();
    const all = db.read("hotels");
    const filters: Array<(h: ApiHotel) => boolean> = [];
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((h) => h.status === status);
    const owner = params.filters?.owner_id as string | undefined;
    if (owner) filters.push((h) => h.owner_id === owner);
    const minPrice = params.filters?.min_price as number | undefined;
    if (minPrice) filters.push((h) => h.price_per_night >= minPrice);
    const maxPrice = params.filters?.max_price as number | undefined;
    if (maxPrice) filters.push((h) => h.price_per_night <= maxPrice);
    return applyQuery(all, {
      ...paramsToOptions<ApiHotel>(params, ["name", "city", "country", "location"]),
      filters,
    });
  },

  async get(id: string): Promise<ApiHotel | null> {
    await delay(80, 180);
    return db.read("hotels").find((h) => h.id === id) ?? null;
  },

  async create(input: Omit<ApiHotel, "id" | "created_at" | "updated_at" | "reviews" | "occupancy" | "monthly_revenue">): Promise<ApiHotel> {
    await delay();
    const hotel: ApiHotel = {
      ...input,
      id: uid("hotel"),
      reviews: 0,
      occupancy: 0,
      monthly_revenue: 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.mutate("hotels", (list) => [hotel, ...list]);
    return hotel;
  },

  async update(id: string, patch: Partial<ApiHotel>): Promise<ApiHotel> {
    await delay();
    let updated: ApiHotel | null = null;
    db.mutate("hotels", (list) =>
      list.map((h) => {
        if (h.id !== id) return h;
        updated = { ...h, ...patch, updated_at: nowIso() };
        return updated;
      })
    );
    if (!updated) throw new Error("Hotel not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("hotels", (list) => list.filter((h) => h.id !== id));
    db.mutate("rooms", (list) => list.filter((r) => r.hotel_id !== id));
  },

  async approve(id: string): Promise<ApiHotel> {
    return this.update(id, { status: "live" });
  },

  async reject(id: string): Promise<ApiHotel> {
    return this.update(id, { status: "archived" });
  },

  async listRooms(hotelId: string): Promise<ApiRoom[]> {
    await delay(100, 220);
    return db.read("rooms").filter((r) => r.hotel_id === hotelId);
  },

  async stats() {
    await delay(80, 200);
    const hotels = db.read("hotels");
    return {
      total: hotels.length,
      live: hotels.filter((h) => h.status === "live").length,
      pending: hotels.filter((h) => h.status === "pending").length,
      draft: hotels.filter((h) => h.status === "draft").length,
      archived: hotels.filter((h) => h.status === "archived").length,
      avg_occupancy:
        hotels.length === 0
          ? 0
          : Math.round(hotels.reduce((s, h) => s + h.occupancy, 0) / hotels.length),
      monthly_revenue: hotels.reduce((s, h) => s + h.monthly_revenue, 0),
    };
  },
};

export const roomsService = {
  async list(hotelId?: string, params: ListParams = {}): Promise<PaginatedResult<ApiRoom>> {
    await delay();
    const all = db.read("rooms");
    const filters: Array<(r: ApiRoom) => boolean> = [];
    if (hotelId) filters.push((r) => r.hotel_id === hotelId);
    const type = params.filters?.type as string | undefined;
    if (type && type !== "all") filters.push((r) => r.type === type);
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((r) => r.status === status);
    return applyQuery(all, {
      ...paramsToOptions<ApiRoom>(params, ["name", "type", "description"]),
      filters,
    });
  },

  async create(input: Omit<ApiRoom, "id" | "created_at">): Promise<ApiRoom> {
    await delay();
    const room: ApiRoom = { ...input, id: uid("room"), created_at: nowIso() };
    db.mutate("rooms", (list) => [room, ...list]);
    return room;
  },

  async update(id: string, patch: Partial<ApiRoom>): Promise<ApiRoom> {
    await delay();
    let updated: ApiRoom | null = null;
    db.mutate("rooms", (list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("Room not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("rooms", (list) => list.filter((r) => r.id !== id));
  },

  async hide(id: string) {
    return this.update(id, { status: "hidden" });
  },

  async show(id: string) {
    return this.update(id, { status: "available" });
  },
};
