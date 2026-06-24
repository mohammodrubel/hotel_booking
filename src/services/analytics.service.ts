import { db } from "./db";
import { delay } from "./util";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function lastNMonths(n: number) {
  const now = new Date();
  const labels: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(MONTHS[d.getMonth()]!);
  }
  return labels;
}

export const analyticsService = {
  async platformOverview() {
    await delay();
    const users = db.read("users");
    const hotels = db.read("hotels");
    const bookings = db.read("bookings");
    const payments = db.read("payments");
    const reviews = db.read("reviews");
    const revenue = payments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);
    return {
      total_users: users.filter((u) => u.role === "user").length,
      total_managers: users.filter((u) => u.role === "manager").length,
      total_hotels: hotels.length,
      live_hotels: hotels.filter((h) => h.status === "live").length,
      pending_hotels: hotels.filter((h) => h.status === "pending").length,
      total_bookings: bookings.length,
      upcoming_bookings: bookings.filter((b) => b.status === "upcoming").length,
      total_revenue: revenue,
      avg_review: reviews.length === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
      monthly_revenue: hotels.reduce((s, h) => s + h.monthly_revenue, 0),
    };
  },

  async revenueByMonth(ownerId?: string) {
    await delay();
    const hotels = db.read("hotels");
    const scope = ownerId ? hotels.filter((h) => h.owner_id === ownerId) : hotels;
    const base = scope.reduce((s, h) => s + h.monthly_revenue, 0);
    const factors = [0.58, 0.66, 0.74, 0.82, 0.91, 1];
    return lastNMonths(6).map((label, i) => ({
      label,
      value: Math.round(base * (factors[i] ?? 1)),
    }));
  },

  async bookingsByMonth(ownerId?: string) {
    await delay();
    const all = db.read("bookings");
    const ownedIds = ownerId
      ? new Set(db.read("hotels").filter((h) => h.owner_id === ownerId).map((h) => h.id))
      : null;
    const scope = ownedIds ? all.filter((b) => ownedIds.has(b.hotel_id)) : all;
    const labels = lastNMonths(6);
    return labels.map((label, i) => ({
      label,
      value: Math.max(2, Math.round((scope.length / 6) * (0.6 + i * 0.12))),
    }));
  },

  async occupancyByHotel(ownerId?: string) {
    await delay();
    const hotels = db.read("hotels");
    const scope = ownerId ? hotels.filter((h) => h.owner_id === ownerId) : hotels;
    return scope.map((h) => ({ id: h.id, label: h.name, value: h.occupancy }));
  },

  async revenueByHotel(ownerId?: string) {
    await delay();
    const hotels = db.read("hotels");
    const scope = ownerId ? hotels.filter((h) => h.owner_id === ownerId) : hotels;
    return scope
      .map((h) => ({ id: h.id, label: h.name, value: h.monthly_revenue }))
      .sort((a, b) => b.value - a.value);
  },

  async userSpend(userId: string) {
    await delay();
    const bookings = db.read("bookings").filter((b) => b.guest_id === userId);
    const upcoming = bookings.filter((b) => b.status === "upcoming");
    const completed = bookings.filter((b) => b.status === "completed");
    return {
      upcoming_stays: upcoming.length,
      completed_stays: completed.length,
      lifetime_spend: completed.reduce((s, b) => s + b.total, 0),
      bookings_count: bookings.length,
    };
  },
};
