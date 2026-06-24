import { db } from "./db";
import type { ApiBooking, ListParams, PaginatedResult } from "./types";
import { applyQuery, delay, nowIso, paramsToOptions, uid } from "./util";

export const bookingsService = {
  async list(params: ListParams = {}): Promise<PaginatedResult<ApiBooking>> {
    await delay();
    const all = db.read("bookings");
    const filters: Array<(b: ApiBooking) => boolean> = [];
    const status = params.filters?.status as string | undefined;
    if (status && status !== "all") filters.push((b) => b.status === status);
    const guest = params.filters?.guest_id as string | undefined;
    if (guest) filters.push((b) => b.guest_id === guest);
    const hotel = params.filters?.hotel_id as string | undefined;
    if (hotel) filters.push((b) => b.hotel_id === hotel);
    const owner = params.filters?.owner_id as string | undefined;
    if (owner) {
      const ownedIds = new Set(db.read("hotels").filter((h) => h.owner_id === owner).map((h) => h.id));
      filters.push((b) => ownedIds.has(b.hotel_id));
    }
    return applyQuery(all, {
      ...paramsToOptions<ApiBooking>(params, ["guest_name", "guest_email", "hotel_name", "id"]),
      filters,
    });
  },

  async get(id: string): Promise<ApiBooking | null> {
    await delay(80, 200);
    return db.read("bookings").find((b) => b.id === id) ?? null;
  },

  async create(input: Omit<ApiBooking, "id" | "booked_at">): Promise<ApiBooking> {
    await delay();
    const booking: ApiBooking = {
      ...input,
      id: uid("bk"),
      booked_at: nowIso(),
    };
    db.mutate("bookings", (list) => [booking, ...list]);
    return booking;
  },

  async update(id: string, patch: Partial<ApiBooking>): Promise<ApiBooking> {
    await delay();
    let updated: ApiBooking | null = null;
    db.mutate("bookings", (list) =>
      list.map((b) => {
        if (b.id !== id) return b;
        updated = { ...b, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("Booking not found");
    return updated;
  },

  async cancel(id: string) {
    return this.update(id, { status: "cancelled" });
  },

  async checkIn(id: string) {
    return this.update(id, { status: "checked_in" });
  },

  async complete(id: string) {
    return this.update(id, { status: "completed" });
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("bookings", (list) => list.filter((b) => b.id !== id));
  },

  async stats(scope?: { owner_id?: string; guest_id?: string }) {
    await delay(80, 200);
    let bookings = db.read("bookings");
    if (scope?.owner_id) {
      const ownedIds = new Set(db.read("hotels").filter((h) => h.owner_id === scope.owner_id).map((h) => h.id));
      bookings = bookings.filter((b) => ownedIds.has(b.hotel_id));
    }
    if (scope?.guest_id) bookings = bookings.filter((b) => b.guest_id === scope.guest_id);
    return {
      total: bookings.length,
      upcoming: bookings.filter((b) => b.status === "upcoming").length,
      checked_in: bookings.filter((b) => b.status === "checked_in").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      revenue: bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0),
    };
  },
};
