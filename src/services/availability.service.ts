import { db } from "./db";
import type { ApiAvailability, ApiPricingRule } from "./types";
import { delay, nowIso, uid } from "./util";

export const availabilityService = {
  async forRoom(roomId: string, fromDate?: string, toDate?: string): Promise<ApiAvailability[]> {
    await delay();
    return db
      .read("availability")
      .filter((a) => a.room_id === roomId)
      .filter((a) => (!fromDate || a.date >= fromDate) && (!toDate || a.date <= toDate))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async setDay(roomId: string, date: string, patch: Partial<ApiAvailability>): Promise<ApiAvailability> {
    await delay();
    let updated: ApiAvailability | null = null;
    db.mutate("availability", (list) => {
      const idx = list.findIndex((a) => a.room_id === roomId && a.date === date);
      if (idx >= 0) {
        updated = { ...list[idx]!, ...patch };
        const next = list.slice();
        next[idx] = updated;
        return next;
      }
      updated = {
        id: uid("av"),
        room_id: roomId,
        date,
        available: true,
        ...patch,
      };
      return [...list, updated];
    });
    return updated!;
  },

  async toggleDay(roomId: string, date: string) {
    const current = db.read("availability").find((a) => a.room_id === roomId && a.date === date);
    return this.setDay(roomId, date, { available: !current?.available });
  },
};

export const pricingService = {
  async list(hotelId?: string): Promise<ApiPricingRule[]> {
    await delay();
    let list = db.read("pricing_rules");
    if (hotelId) list = list.filter((p) => p.hotel_id === hotelId);
    return list;
  },

  async create(input: Omit<ApiPricingRule, "id">): Promise<ApiPricingRule> {
    await delay();
    const p: ApiPricingRule = { ...input, id: uid("pr") };
    db.mutate("pricing_rules", (list) => [p, ...list]);
    void nowIso();
    return p;
  },

  async update(id: string, patch: Partial<ApiPricingRule>): Promise<ApiPricingRule> {
    await delay();
    let updated: ApiPricingRule | null = null;
    db.mutate("pricing_rules", (list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch };
        return updated;
      })
    );
    if (!updated) throw new Error("Pricing rule not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    db.mutate("pricing_rules", (list) => list.filter((p) => p.id !== id));
  },

  async toggle(id: string) {
    const rule = db.read("pricing_rules").find((r) => r.id === id);
    return this.update(id, { active: !rule?.active });
  },
};
