import { imageFor, localImages } from "@/lib/localImages";
import type {
  ApiAnnouncement,
  ApiAuditLog,
  ApiAvailability,
  ApiBooking,
  ApiDocument,
  ApiExpense,
  ApiHotel,
  ApiMessage,
  ApiMessageThread,
  ApiNotification,
  ApiPayment,
  ApiPricingRule,
  ApiReview,
  ApiRoom,
  ApiServiceRequest,
  ApiUser,
} from "./types";

const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 86400000).toISOString();
const pravatar = (seed: string) => `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;

export const seedUsers: ApiUser[] = [
  { id: "u-001", full_name: "Mia Rivera", email: "mia.rivera@stayhaus.app", phone: "+1 415 555 0101", role: "user", avatar: pravatar("mia.rivera"), status: "active", kyc_status: "verified", language: "en", bookings_count: 8, total_spend: 6420, joined_at: "2024-08-12", last_login_at: daysAgo(2), two_factor_enabled: false },
  { id: "u-002", full_name: "Daniel Koh", email: "daniel.koh@stayhaus.app", phone: "+61 2 5550 0114", role: "user", avatar: pravatar("daniel.koh"), status: "active", kyc_status: "verified", language: "en", bookings_count: 14, total_spend: 11280, joined_at: "2023-11-04", last_login_at: daysAgo(1), two_factor_enabled: true },
  { id: "u-003", full_name: "Priya Mehta", email: "priya.mehta@stayhaus.app", phone: "+91 22 5550 0130", role: "user", avatar: pravatar("priya.mehta"), status: "active", kyc_status: "verified", language: "en", bookings_count: 3, total_spend: 1890, joined_at: "2025-01-22", last_login_at: daysAgo(5), two_factor_enabled: false },
  { id: "u-004", full_name: "Lars Nilsson", email: "lars.nilsson@stayhaus.app", phone: "+46 8 5550 0140", role: "user", avatar: pravatar("lars.nilsson"), status: "pending", kyc_status: "pending", language: "en", bookings_count: 1, total_spend: 540, joined_at: "2025-04-18", last_login_at: daysAgo(20), two_factor_enabled: false },
  { id: "u-005", full_name: "Camille Aubert", email: "camille.aubert@stayhaus.app", phone: "+33 1 5550 0152", role: "user", avatar: pravatar("camille.aubert"), status: "active", kyc_status: "verified", language: "en", bookings_count: 11, total_spend: 8720, joined_at: "2024-02-09", last_login_at: daysAgo(3), two_factor_enabled: false },
  { id: "u-006", full_name: "Owen Park", email: "owen.park@stayhaus.app", phone: "+82 2 5550 0165", role: "user", avatar: pravatar("owen.park"), status: "active", kyc_status: "verified", language: "en", bookings_count: 19, total_spend: 14310, joined_at: "2023-06-15", last_login_at: daysAgo(0), two_factor_enabled: true },
  { id: "u-007", full_name: "Yuki Tanaka", email: "yuki.tanaka@stayhaus.app", phone: "+81 3 5550 0177", role: "user", avatar: pravatar("yuki.tanaka"), status: "suspended", kyc_status: "rejected", language: "en", bookings_count: 4, total_spend: 2410, joined_at: "2024-12-01", last_login_at: daysAgo(45), two_factor_enabled: false },
  { id: "m-001", full_name: "Sara Okafor", email: "manager@stayhaus.app", phone: "+44 20 5550 0188", role: "manager", avatar: pravatar("manager"), status: "active", kyc_status: "verified", language: "en", bookings_count: 0, total_spend: 0, joined_at: "2023-03-20", last_login_at: daysAgo(0), two_factor_enabled: true },
  { id: "m-002", full_name: "Marco Bianchi", email: "marco.bianchi@stayhaus.app", phone: "+39 02 5550 0199", role: "manager", avatar: pravatar("marco.bianchi"), status: "active", kyc_status: "verified", language: "en", bookings_count: 0, total_spend: 0, joined_at: "2024-05-11", last_login_at: daysAgo(1), two_factor_enabled: false },
  { id: "a-001", full_name: "Admin", email: "admin@stayhaus.app", phone: "+1 415 555 0100", role: "admin", avatar: pravatar("admin"), status: "active", kyc_status: "verified", language: "en", bookings_count: 0, total_spend: 0, joined_at: "2022-01-01", last_login_at: daysAgo(0), two_factor_enabled: true },
];

const AMENITIES_HOTEL = ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Beach access", "Concierge", "Parking", "Airport shuttle", "Pet friendly", "Business center"];

const HOTEL_DEFS: Array<Partial<ApiHotel> & { id: string; name: string; city: string; country: string; description: string; rating: number; reviews: number; price_per_night: number; badge?: ApiHotel["badge"]; owner_id: string; status: ApiHotel["status"]; occupancy: number; monthly_revenue: number; amenities_count: number }> = [
  { id: "emerald-grand", name: "The Emerald Grand", city: "Maafushi", country: "Maldives", description: "Overwater sanctuary on a private lagoon. Sunrise yoga, candlelit dinners on the reef, butler service across forty private villas.", rating: 4.9, reviews: 1248, price_per_night: 480, badge: "Premium", owner_id: "m-001", status: "live", occupancy: 92, monthly_revenue: 184320, amenities_count: 9 },
  { id: "aurum-skyline", name: "Aurum Skyline Suites", city: "Dubai", country: "United Arab Emirates", description: "Sky-high boutique stay above the city's golden hour. Glass-walled suites, infinity pool on the 48th floor, Michelin tasting menu.", rating: 4.8, reviews: 902, price_per_night: 320, badge: "Top Rated", owner_id: "m-001", status: "live", occupancy: 78, monthly_revenue: 142060, amenities_count: 8 },
  { id: "verdant-pines", name: "Verdant Pines Lodge", city: "Aspen", country: "United States", description: "Quiet alpine retreat carved into the pines. Heated stone floors, fireside reading nooks, ski-in/ski-out access to the back bowls.", rating: 4.7, reviews: 671, price_per_night: 275, badge: "Trending", owner_id: "m-002", status: "live", occupancy: 64, monthly_revenue: 88940, amenities_count: 7 },
  { id: "azure-cove", name: "Azure Cove Resort", city: "Positano", country: "Italy", description: "Pastel cliffside terraces tumbling toward the Mediterranean. Lemon groves, Vespa rentals, afternoon limoncello on the rocks.", rating: 4.9, reviews: 1583, price_per_night: 540, badge: "Premium", owner_id: "m-001", status: "live", occupancy: 88, monthly_revenue: 212800, amenities_count: 12 },
  { id: "sakura-ryokan", name: "Sakura Ryokan", city: "Kyoto", country: "Japan", description: "Century-old tea house turned modern ryokan. Tatami floors, private onsen, kaiseki dinners under cherry blossoms.", rating: 4.8, reviews: 412, price_per_night: 360, badge: "New", owner_id: "m-002", status: "live", occupancy: 71, monthly_revenue: 95200, amenities_count: 8 },
  { id: "savanna-lights", name: "Savanna Lights Camp", city: "Maasai Mara", country: "Kenya", description: "Luxury tented camp on the great migration route. Dawn game drives, sundowners by acacia trees, starlit dinners on the plains.", rating: 4.9, reviews: 298, price_per_night: 620, badge: "Trending", owner_id: "m-002", status: "pending", occupancy: 0, monthly_revenue: 0, amenities_count: 8 },
  { id: "patagonia-fjord", name: "Patagonia Fjord Lodge", city: "Puerto Natales", country: "Chile", description: "Glass-walled lodge perched above a glacial fjord. Heated outdoor baths, guided trekking, panoramic windows facing the Cuernos.", rating: 4.7, reviews: 184, price_per_night: 410, badge: "Top Rated", owner_id: "m-001", status: "live", occupancy: 55, monthly_revenue: 67320, amenities_count: 7 },
  { id: "marrakech-riad", name: "Riad Noor", city: "Marrakech", country: "Morocco", description: "Hand-tiled riad behind a quiet medina door. Rooftop hammam, mint tea at sunset, courtyard pool framed in jasmine.", rating: 4.8, reviews: 524, price_per_night: 240, badge: "New", owner_id: "m-002", status: "draft", occupancy: 0, monthly_revenue: 0, amenities_count: 7 },
];

export const seedHotels: ApiHotel[] = HOTEL_DEFS.map((h, idx) => ({
  id: h.id,
  name: h.name,
  description: h.description,
  city: h.city,
  country: h.country,
  location: `${h.city}, ${h.country}`,
  address: `${100 + idx} Coastal Road`,
  rating: h.rating,
  reviews: h.reviews,
  price_per_night: h.price_per_night,
  image: imageFor(`${h.id}-main`),
  gallery: [1, 2, 3, 4, 5].map((i) => imageFor(`${h.id}-${i}`)),
  amenities: AMENITIES_HOTEL.slice(0, h.amenities_count),
  badge: h.badge,
  status: h.status,
  owner_id: h.owner_id,
  occupancy: h.occupancy,
  monthly_revenue: h.monthly_revenue,
  created_at: daysAgo(180 - idx * 12),
  updated_at: daysAgo(5),
}));

const AMENITIES_ROOM = ["King bed", "Ocean view", "Balcony", "Smart TV", "Mini bar", "Nespresso", "Bathtub", "Rain shower", "Air conditioning", "Workspace"];

export const seedRooms: ApiRoom[] = seedHotels.flatMap((h) => {
  const types: ApiRoom["type"][] = ["standard", "deluxe", "suite", "penthouse"];
  return types.map((type, i) => ({
    id: `${h.id}-room-${i + 1}`,
    hotel_id: h.id,
    name: `${type[0]!.toUpperCase() + type.slice(1)} ${
      type === "standard" ? "Room" : type === "penthouse" ? "Residence" : "Suite"
    }`,
    type,
    price_per_night: h.price_per_night + i * 120,
    capacity: 2 + i,
    beds: type === "standard" ? 1 : 2,
    size: 32 + i * 18,
    image: imageFor(`${h.id}-room-${i}`),
    amenities: AMENITIES_ROOM.slice(0, 5 + i),
    description:
      type === "penthouse"
        ? "Top-floor sanctuary with private terrace and panoramic views."
        : type === "suite"
          ? "Spacious suite with separate living area and premium furnishings."
          : type === "deluxe"
            ? "Refined room with elevated finishes and a generous layout."
            : "Comfortable room with everything you need for a restful stay.",
    status: "available",
    created_at: daysAgo(120),
  }));
});

const SAMPLE_GUESTS: Array<{ id: string; name: string; email: string }> = [
  { id: "u-001", name: "Mia Rivera", email: "mia.rivera@stayhaus.app" },
  { id: "u-002", name: "Daniel Koh", email: "daniel.koh@stayhaus.app" },
  { id: "u-003", name: "Priya Mehta", email: "priya.mehta@stayhaus.app" },
  { id: "u-004", name: "Lars Nilsson", email: "lars.nilsson@stayhaus.app" },
  { id: "u-005", name: "Camille Aubert", email: "camille.aubert@stayhaus.app" },
  { id: "u-006", name: "Owen Park", email: "owen.park@stayhaus.app" },
  { id: "u-007", name: "Yuki Tanaka", email: "yuki.tanaka@stayhaus.app" },
];

let bookingCounter = 2100;
function mkBooking(
  hotelIdx: number,
  roomIdx: number,
  guestIdx: number,
  daysFromNow: number,
  nights: number,
  status: ApiBooking["status"],
  source: ApiBooking["source"] = "direct"
): ApiBooking {
  bookingCounter += 1;
  const hotel = seedHotels[hotelIdx]!;
  const room = seedRooms.find((r) => r.hotel_id === hotel.id && r.id.endsWith(`-room-${roomIdx + 1}`))!;
  const guest = SAMPLE_GUESTS[guestIdx]!;
  const checkIn = new Date(Date.now() + daysFromNow * 86400000);
  const checkOut = new Date(checkIn.getTime() + nights * 86400000);
  const subtotal = room.price_per_night * nights;
  const taxes = Math.round(subtotal * 0.12);
  return {
    id: `bk-${bookingCounter}`,
    hotel_id: hotel.id,
    hotel_name: hotel.name,
    room_id: room.id,
    room_name: room.name,
    image: room.image,
    guest_id: guest.id,
    guest_name: guest.name,
    guest_email: guest.email,
    guest_avatar: pravatar(guest.id),
    check_in: checkIn.toISOString().split("T")[0]!,
    check_out: checkOut.toISOString().split("T")[0]!,
    nights,
    guests: 2 + (guestIdx % 3),
    subtotal,
    taxes,
    total: subtotal + taxes,
    status,
    source,
    booked_at: daysAgo(daysFromNow > 0 ? 30 : Math.abs(daysFromNow) + 14),
  };
}

export const seedBookings: ApiBooking[] = [
  mkBooking(0, 1, 0, 18, 6, "upcoming", "direct"),
  mkBooking(0, 3, 6, -10, 6, "completed", "direct"),
  mkBooking(1, 0, 1, 5, 3, "upcoming", "ota"),
  mkBooking(2, 1, 4, 28, 4, "upcoming", "direct"),
  mkBooking(3, 2, 4, 14, 6, "upcoming", "partner"),
  mkBooking(4, 0, 5, 22, 4, "upcoming", "direct"),
  mkBooking(5, 2, 1, -25, 5, "completed", "direct"),
  mkBooking(6, 1, 3, -45, 4, "completed", "ota"),
  mkBooking(7, 0, 0, -60, 3, "cancelled", "direct"),
  mkBooking(0, 2, 2, -90, 5, "completed", "walk_in"),
  mkBooking(2, 0, 0, 2, 2, "upcoming", "direct"),
  mkBooking(4, 1, 2, 9, 4, "upcoming", "direct"),
  mkBooking(1, 2, 5, -5, 3, "checked_in", "ota"),
  mkBooking(3, 3, 6, 35, 7, "upcoming", "partner"),
  mkBooking(6, 0, 4, -120, 4, "completed", "direct"),
];

export const seedPayments: ApiPayment[] = seedBookings.flatMap((b, i) => {
  const status: ApiPayment["status"] =
    b.status === "cancelled" ? "refunded" : b.status === "upcoming" ? "paid" : "paid";
  return [
    {
      id: `pay-${1000 + i}`,
      booking_id: b.id,
      user_id: b.guest_id,
      user_name: b.guest_name,
      type: "booking" as const,
      method: (["card", "paypal", "bank_transfer", "wallet"] as const)[i % 4]!,
      amount: b.total,
      currency: "USD",
      status,
      reference: `txn_${(Math.random().toString(36).slice(2, 10))}`,
      created_at: b.booked_at,
    },
  ];
});

export const seedExpenses: ApiExpense[] = seedHotels.flatMap((h, i) => [
  { id: `exp-${i}-1`, hotel_id: h.id, hotel_name: h.name, category: "Maintenance", amount: 4200 + i * 320, year: new Date().getFullYear(), month: new Date().getMonth() + 1, note: "HVAC servicing", created_at: daysAgo(8) },
  { id: `exp-${i}-2`, hotel_id: h.id, hotel_name: h.name, category: "Staff payroll", amount: 18400 + i * 520, year: new Date().getFullYear(), month: new Date().getMonth() + 1, created_at: daysAgo(4) },
  { id: `exp-${i}-3`, hotel_id: h.id, hotel_name: h.name, category: "Marketing", amount: 2200 + i * 110, year: new Date().getFullYear(), month: new Date().getMonth() + 1, note: "Q3 campaign", created_at: daysAgo(2) },
]);

export const seedReviews: ApiReview[] = seedBookings
  .filter((b) => b.status === "completed")
  .map((b, i) => ({
    id: `rev-${100 + i}`,
    hotel_id: b.hotel_id,
    hotel_name: b.hotel_name,
    room_id: b.room_id,
    booking_id: b.id,
    user_id: b.guest_id,
    user_name: b.guest_name,
    user_avatar: b.guest_avatar,
    rating: [5, 4, 5, 4, 3, 5, 4][i % 7]!,
    title: ["Magical stay", "Loved every minute", "Spectacular service", "Would book again", "A few rough edges", "Quiet, intimate, perfect", "Solid value"][i % 7]!,
    body: "The room was exactly as advertised. Staff were attentive without being intrusive. Breakfast had more pastries than I could possibly eat, which is the right amount of pastries.",
    status: (i % 8 === 0 ? "flagged" : i % 6 === 0 ? "pending" : "published") as ApiReview["status"],
    reply: i % 3 === 0 ? "Thank you for staying with us — we are thrilled you enjoyed your visit." : undefined,
    reply_at: i % 3 === 0 ? daysAgo(i + 1) : undefined,
    created_at: daysAgo(20 + i * 3),
  }));

export const seedNotifications: ApiNotification[] = [
  { id: "n-1", user_id: "u-001", type: "booking", title: "Booking confirmed", body: "Your stay at The Emerald Grand is confirmed.", link: "/dashboard/bookings", is_read: false, created_at: daysAgo(0) },
  { id: "n-2", user_id: "u-001", type: "payment", title: "Payment received", body: "$2,880 charged to Visa ending 4242.", is_read: false, created_at: daysAgo(0) },
  { id: "n-3", user_id: "u-001", type: "review", title: "Leave a review", body: "Share how your last stay went.", link: "/dashboard/reviews", is_read: true, created_at: daysAgo(3) },
  { id: "n-4", user_id: "u-001", type: "system", title: "Profile updated", body: "Your profile changes were saved.", is_read: true, created_at: daysAgo(7) },
  { id: "n-5", user_id: "m-001", type: "booking", title: "New reservation", body: "Mia Rivera booked The Emerald Grand.", link: "/dashboard/manager/reservations", is_read: false, created_at: daysAgo(0) },
  { id: "n-6", user_id: "m-001", type: "review", title: "New review", body: "4★ review on Aurum Skyline Suites.", is_read: false, created_at: daysAgo(1) },
  { id: "n-7", user_id: "m-001", type: "system", title: "Payout scheduled", body: "$28,450 payout will arrive in 3 days.", is_read: true, created_at: daysAgo(2) },
  { id: "n-8", user_id: "a-001", type: "system", title: "Pending hotel", body: "Savanna Lights Camp awaits review.", link: "/dashboard/admin/hotels", is_read: false, created_at: daysAgo(0) },
  { id: "n-9", user_id: "a-001", type: "review", title: "Review flagged", body: "A review needs moderation.", link: "/dashboard/admin/reviews", is_read: false, created_at: daysAgo(0) },
  { id: "n-10", user_id: "a-001", type: "announcement", title: "Quarterly report ready", body: "Q3 platform analytics available.", is_read: true, created_at: daysAgo(5) },
];

export const seedThreads: ApiMessageThread[] = [
  { id: "th-1", participants: ["u-001", "m-001"], participant_names: ["Mia Rivera", "Sara Okafor"], participant_avatars: [pravatar("mia.rivera"), pravatar("manager")], last_message: "We can arrange airport pickup. What time does your flight land?", last_message_at: daysAgo(0), unread_count: 1, related_booking_id: "bk-2101" },
  { id: "th-2", participants: ["u-002", "m-002"], participant_names: ["Daniel Koh", "Marco Bianchi"], participant_avatars: [pravatar("daniel.koh"), pravatar("marco.bianchi")], last_message: "Late checkout confirmed for 2pm.", last_message_at: daysAgo(1), unread_count: 0 },
  { id: "th-3", participants: ["u-003", "a-001"], participant_names: ["Priya Mehta", "Admin"], participant_avatars: [pravatar("priya.mehta"), pravatar("admin")], last_message: "Your refund has been processed.", last_message_at: daysAgo(3), unread_count: 0 },
  { id: "th-4", participants: ["m-001", "a-001"], participant_names: ["Sara Okafor", "Admin"], participant_avatars: [pravatar("manager"), pravatar("admin")], last_message: "Q3 occupancy looks great. Let's review pricing.", last_message_at: daysAgo(0), unread_count: 2 },
];

export const seedMessages: ApiMessage[] = [
  { id: "msg-1", thread_id: "th-1", sender_id: "u-001", sender_name: "Mia Rivera", sender_avatar: pravatar("mia.rivera"), body: "Hi! Quick question about my upcoming stay.", created_at: daysAgo(1), read: true },
  { id: "msg-2", thread_id: "th-1", sender_id: "m-001", sender_name: "Sara Okafor", sender_avatar: pravatar("manager"), body: "Of course — happy to help.", created_at: daysAgo(1), read: true },
  { id: "msg-3", thread_id: "th-1", sender_id: "u-001", sender_name: "Mia Rivera", sender_avatar: pravatar("mia.rivera"), body: "Is the spa open on Sundays?", created_at: daysAgo(0), read: true },
  { id: "msg-4", thread_id: "th-1", sender_id: "m-001", sender_name: "Sara Okafor", sender_avatar: pravatar("manager"), body: "Yes, 9am-9pm. We can arrange airport pickup. What time does your flight land?", created_at: daysAgo(0), read: false },
  { id: "msg-5", thread_id: "th-2", sender_id: "u-002", sender_name: "Daniel Koh", sender_avatar: pravatar("daniel.koh"), body: "Any chance of a late checkout?", created_at: daysAgo(2), read: true },
  { id: "msg-6", thread_id: "th-2", sender_id: "m-002", sender_name: "Marco Bianchi", sender_avatar: pravatar("marco.bianchi"), body: "Late checkout confirmed for 2pm.", created_at: daysAgo(1), read: true },
  { id: "msg-7", thread_id: "th-3", sender_id: "u-003", sender_name: "Priya Mehta", sender_avatar: pravatar("priya.mehta"), body: "I need help with a refund.", created_at: daysAgo(4), read: true },
  { id: "msg-8", thread_id: "th-3", sender_id: "a-001", sender_name: "Admin", sender_avatar: pravatar("admin"), body: "Your refund has been processed.", created_at: daysAgo(3), read: true },
  { id: "msg-9", thread_id: "th-4", sender_id: "m-001", sender_name: "Sara Okafor", sender_avatar: pravatar("manager"), body: "Heads-up: occupancy is trending up.", created_at: daysAgo(1), read: true },
  { id: "msg-10", thread_id: "th-4", sender_id: "a-001", sender_name: "Admin", sender_avatar: pravatar("admin"), body: "Q3 occupancy looks great. Let's review pricing.", created_at: daysAgo(0), read: false },
];

export const seedAnnouncements: ApiAnnouncement[] = [
  { id: "ann-1", title: "Scheduled maintenance window", body: "Platform updates on Saturday 2-4 AM UTC. Booking flows remain available.", type: "maintenance", audience: "all", created_by: "a-001", created_by_name: "Admin", is_published: true, created_at: daysAgo(3) },
  { id: "ann-2", title: "Q3 partner meeting", body: "Live virtual session for all hotel managers — Thursday 4 PM UTC.", type: "meeting", audience: "managers", created_by: "a-001", created_by_name: "Admin", is_published: true, created_at: daysAgo(1) },
  { id: "ann-3", title: "Holiday season promo guidelines", body: "New rules around early-bird discounts. See marketing docs.", type: "general", audience: "managers", created_by: "a-001", created_by_name: "Admin", is_published: true, created_at: daysAgo(7) },
  { id: "ann-4", title: "Security alert", body: "Several phishing attempts reported. Verify all financial requests via the official channel.", type: "alert", audience: "all", created_by: "a-001", created_by_name: "Admin", is_published: true, created_at: daysAgo(0) },
];

export const seedAuditLogs: ApiAuditLog[] = Array.from({ length: 30 }).map((_, i) => {
  const actions = ["user.login", "user.logout", "hotel.create", "hotel.update", "hotel.approve", "booking.create", "booking.cancel", "payment.refund", "user.suspend", "review.flag"];
  const entities = ["User", "Hotel", "Booking", "Payment", "Review"];
  const users = [seedUsers[7]!, seedUsers[8]!, seedUsers[9]!, seedUsers[0]!, seedUsers[1]!];
  const u = users[i % users.length]!;
  return {
    id: `audit-${1000 + i}`,
    user_id: u.id,
    user_name: u.full_name,
    action: actions[i % actions.length]!,
    entity: entities[i % entities.length]!,
    entity_id: `${entities[i % entities.length]!.toLowerCase()}-${1000 + i}`,
    ip: `192.168.${10 + (i % 200)}.${20 + (i % 100)}`,
    created_at: daysAgo(Math.floor(i / 2)),
  };
});

export const seedServiceRequests: ApiServiceRequest[] = [
  { id: "sr-1", hotel_id: "emerald-grand", hotel_name: "The Emerald Grand", room_id: "emerald-grand-room-2", room_name: "Deluxe Suite", requester_id: "u-001", requester_name: "Mia Rivera", category: "housekeeping", priority: "medium", status: "open", description: "Extra towels and pillows needed.", created_at: daysAgo(0), updated_at: daysAgo(0) },
  { id: "sr-2", hotel_id: "aurum-skyline", hotel_name: "Aurum Skyline Suites", requester_id: "u-002", requester_name: "Daniel Koh", category: "concierge", priority: "low", status: "in_progress", description: "Restaurant reservation for tonight 8pm.", created_at: daysAgo(1), updated_at: daysAgo(0) },
  { id: "sr-3", hotel_id: "azure-cove", hotel_name: "Azure Cove Resort", requester_id: "u-005", requester_name: "Camille Aubert", category: "maintenance", priority: "high", status: "open", description: "AC not cooling in suite 401.", created_at: daysAgo(0), updated_at: daysAgo(0) },
  { id: "sr-4", hotel_id: "verdant-pines", hotel_name: "Verdant Pines Lodge", requester_id: "u-006", requester_name: "Owen Park", category: "billing", priority: "medium", status: "done", description: "Receipt for company expense report.", created_at: daysAgo(5), updated_at: daysAgo(4) },
  { id: "sr-5", hotel_id: "emerald-grand", hotel_name: "The Emerald Grand", requester_id: "u-003", requester_name: "Priya Mehta", category: "housekeeping", priority: "low", status: "done", description: "Turndown service requested for 9pm.", created_at: daysAgo(7), updated_at: daysAgo(6) },
];

export const seedDocuments: ApiDocument[] = [
  { id: "doc-1", owner_id: "m-001", hotel_id: "emerald-grand", name: "Property License 2026.pdf", type: "license", size_kb: 412, url: "/documents/property-license-2026.pdf", uploaded_at: daysAgo(45) },
  { id: "doc-2", owner_id: "m-001", hotel_id: "aurum-skyline", name: "Operating Contract.pdf", type: "contract", size_kb: 880, url: "/documents/operating-contract.pdf", uploaded_at: daysAgo(80) },
  { id: "doc-3", owner_id: "m-002", hotel_id: "verdant-pines", name: "Tax Filing Q2.pdf", type: "tax", size_kb: 340, url: "/documents/tax-q2.pdf", uploaded_at: daysAgo(60) },
  { id: "doc-4", owner_id: "u-001", name: "ID Verification.png", type: "id", size_kb: 1240, url: "/documents/id-verification.png", uploaded_at: daysAgo(120) },
];

export const seedAvailability: ApiAvailability[] = (() => {
  const out: ApiAvailability[] = [];
  const days = 60;
  for (const r of seedRooms.slice(0, 12)) {
    for (let d = 0; d < days; d++) {
      const date = new Date(Date.now() + d * 86400000).toISOString().split("T")[0]!;
      const blocked = (d % 17 === 0) || (d % 11 === 0);
      const weekend = [0, 6].includes(new Date(date).getDay());
      out.push({
        id: `av-${r.id}-${date}`,
        room_id: r.id,
        date,
        available: !blocked,
        price_override: weekend ? Math.round(r.price_per_night * 1.15) : undefined,
      });
    }
  }
  return out;
})();

export const seedPricingRules: ApiPricingRule[] = [
  { id: "pr-1", hotel_id: "emerald-grand", name: "Peak season uplift", type: "seasonal", adjustment_percent: 25, start_date: daysAhead(30).split("T")[0]!, end_date: daysAhead(90).split("T")[0]!, active: true },
  { id: "pr-2", hotel_id: "emerald-grand", name: "Weekend premium", type: "weekend", adjustment_percent: 15, active: true },
  { id: "pr-3", hotel_id: "aurum-skyline", name: "Stay 7+ nights", type: "long_stay", adjustment_percent: -10, active: true },
  { id: "pr-4", hotel_id: "azure-cove", name: "Off-season discount", type: "discount", adjustment_percent: -20, start_date: daysAhead(120).split("T")[0]!, end_date: daysAhead(180).split("T")[0]!, active: false },
];

export const SEED = {
  users: seedUsers,
  hotels: seedHotels,
  rooms: seedRooms,
  bookings: seedBookings,
  payments: seedPayments,
  expenses: seedExpenses,
  reviews: seedReviews,
  notifications: seedNotifications,
  threads: seedThreads,
  messages: seedMessages,
  announcements: seedAnnouncements,
  audit_logs: seedAuditLogs,
  service_requests: seedServiceRequests,
  documents: seedDocuments,
  availability: seedAvailability,
  pricing_rules: seedPricingRules,
};
export type SeedDB = typeof SEED;

export const SEED_VERSION = 4;
export { now, daysAgo, daysAhead, pravatar, localImages };
