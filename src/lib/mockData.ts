export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: "standard" | "deluxe" | "suite" | "penthouse";
  pricePerNight: number;
  capacity: number;
  beds: number;
  size: number;
  image: string;
  amenities: string[];
  description: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  description: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  gallery: string[];
  amenities: string[];
  badge?: "Premium" | "Top Rated" | "Trending" | "New";
  rooms: Room[];
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomName: string;
  image: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  status: "upcoming" | "completed" | "cancelled";
  bookedAt: string;
}

import { imageFor } from "./localImages";

const img = (seed: string, _w = 1200, _h = 800) => imageFor(seed);

const AMENITIES_HOTEL = [
  "Free WiFi",
  "Pool",
  "Spa",
  "Gym",
  "Restaurant",
  "Bar",
  "Beach access",
  "Concierge",
  "Parking",
  "Airport shuttle",
  "Pet friendly",
  "Business center",
];

const AMENITIES_ROOM = [
  "King bed",
  "Ocean view",
  "Balcony",
  "Smart TV",
  "Mini bar",
  "Nespresso",
  "Bathtub",
  "Rain shower",
  "Air conditioning",
  "Workspace",
];

function buildRooms(hotelId: string, basePrice: number): Room[] {
  const types: Room["type"][] = ["standard", "deluxe", "suite", "penthouse"];
  return types.map((type, i) => ({
    id: `${hotelId}-room-${i + 1}`,
    hotelId,
    name: `${type[0]!.toUpperCase() + type.slice(1)} ${
      type === "standard" ? "Room" : type === "deluxe" ? "Suite" : type === "suite" ? "Suite" : "Residence"
    }`,
    type,
    pricePerNight: basePrice + i * 120,
    capacity: 2 + i,
    beds: type === "standard" ? 1 : 2,
    size: 32 + i * 18,
    image: img(`${hotelId}-room-${i}`, 1200, 800),
    amenities: AMENITIES_ROOM.slice(0, 5 + i),
    description:
      type === "penthouse"
        ? "Top-floor sanctuary with private terrace and panoramic views."
        : type === "suite"
          ? "Spacious suite with separate living area and premium furnishings."
          : type === "deluxe"
            ? "Refined room with elevated finishes and a generous layout."
            : "Comfortable room with everything you need for a restful stay.",
  }));
}

export const hotels: Hotel[] = [
  {
    id: "emerald-grand",
    name: "The Emerald Grand",
    location: "Maafushi, Maldives",
    city: "Maafushi",
    country: "Maldives",
    description:
      "An overwater sanctuary set on a private lagoon. Sunrise yoga, candlelit dinners on the reef, and butler service across forty private villas.",
    rating: 4.9,
    reviews: 1248,
    pricePerNight: 480,
    image: img("emerald-grand-main"),
    gallery: [
      img("emerald-grand-1"),
      img("emerald-grand-2"),
      img("emerald-grand-3"),
      img("emerald-grand-4"),
      img("emerald-grand-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 9),
    badge: "Premium",
    rooms: buildRooms("emerald-grand", 480),
  },
  {
    id: "aurum-skyline",
    name: "Aurum Skyline Suites",
    location: "Downtown, Dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    description:
      "A sky-high boutique stay above the city's golden hour. Glass-walled suites, infinity pool on the 48th floor, and a Michelin tasting menu.",
    rating: 4.8,
    reviews: 902,
    pricePerNight: 320,
    image: img("aurum-skyline-main"),
    gallery: [
      img("aurum-skyline-1"),
      img("aurum-skyline-2"),
      img("aurum-skyline-3"),
      img("aurum-skyline-4"),
      img("aurum-skyline-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 8),
    badge: "Top Rated",
    rooms: buildRooms("aurum-skyline", 320),
  },
  {
    id: "verdant-pines",
    name: "Verdant Pines Lodge",
    location: "Aspen, Colorado",
    city: "Aspen",
    country: "United States",
    description:
      "A quiet alpine retreat carved into the pines. Heated stone floors, fireside reading nooks, and ski-in/ski-out access to the back bowls.",
    rating: 4.7,
    reviews: 671,
    pricePerNight: 275,
    image: img("verdant-pines-main"),
    gallery: [
      img("verdant-pines-1"),
      img("verdant-pines-2"),
      img("verdant-pines-3"),
      img("verdant-pines-4"),
      img("verdant-pines-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 7),
    badge: "Trending",
    rooms: buildRooms("verdant-pines", 275),
  },
  {
    id: "azure-cove",
    name: "Azure Cove Resort",
    location: "Amalfi Coast, Italy",
    city: "Positano",
    country: "Italy",
    description:
      "Pastel cliffside terraces tumbling toward the Mediterranean. Lemon groves, Vespa rentals, and afternoon limoncello on the rocks.",
    rating: 4.9,
    reviews: 1583,
    pricePerNight: 540,
    image: img("azure-cove-main"),
    gallery: [
      img("azure-cove-1"),
      img("azure-cove-2"),
      img("azure-cove-3"),
      img("azure-cove-4"),
      img("azure-cove-5"),
    ],
    amenities: AMENITIES_HOTEL,
    badge: "Premium",
    rooms: buildRooms("azure-cove", 540),
  },
  {
    id: "sakura-ryokan",
    name: "Sakura Ryokan",
    location: "Kyoto, Japan",
    city: "Kyoto",
    country: "Japan",
    description:
      "A century-old tea house turned modern ryokan. Tatami floors, private onsen, and kaiseki dinners under cherry blossoms.",
    rating: 4.8,
    reviews: 412,
    pricePerNight: 360,
    image: img("sakura-ryokan-main"),
    gallery: [
      img("sakura-ryokan-1"),
      img("sakura-ryokan-2"),
      img("sakura-ryokan-3"),
      img("sakura-ryokan-4"),
      img("sakura-ryokan-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 8),
    badge: "New",
    rooms: buildRooms("sakura-ryokan", 360),
  },
  {
    id: "savanna-lights",
    name: "Savanna Lights Camp",
    location: "Maasai Mara, Kenya",
    city: "Maasai Mara",
    country: "Kenya",
    description:
      "Luxury tented camp on the great migration route. Dawn game drives, sundowners by acacia trees, and starlit dinners on the plains.",
    rating: 4.9,
    reviews: 298,
    pricePerNight: 620,
    image: img("savanna-lights-main"),
    gallery: [
      img("savanna-lights-1"),
      img("savanna-lights-2"),
      img("savanna-lights-3"),
      img("savanna-lights-4"),
      img("savanna-lights-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 8),
    badge: "Trending",
    rooms: buildRooms("savanna-lights", 620),
  },
  {
    id: "patagonia-fjord",
    name: "Patagonia Fjord Lodge",
    location: "Torres del Paine, Chile",
    city: "Puerto Natales",
    country: "Chile",
    description:
      "Glass-walled lodge perched above a glacial fjord. Heated outdoor baths, guided trekking, and panoramic windows facing the Cuernos.",
    rating: 4.7,
    reviews: 184,
    pricePerNight: 410,
    image: img("patagonia-fjord-main"),
    gallery: [
      img("patagonia-fjord-1"),
      img("patagonia-fjord-2"),
      img("patagonia-fjord-3"),
      img("patagonia-fjord-4"),
      img("patagonia-fjord-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 7),
    badge: "Top Rated",
    rooms: buildRooms("patagonia-fjord", 410),
  },
  {
    id: "marrakech-riad",
    name: "Riad Noor",
    location: "Medina, Marrakech",
    city: "Marrakech",
    country: "Morocco",
    description:
      "Hand-tiled riad behind a quiet medina door. Rooftop hammam, mint tea at sunset, and a courtyard pool framed in jasmine.",
    rating: 4.8,
    reviews: 524,
    pricePerNight: 240,
    image: img("marrakech-riad-main"),
    gallery: [
      img("marrakech-riad-1"),
      img("marrakech-riad-2"),
      img("marrakech-riad-3"),
      img("marrakech-riad-4"),
      img("marrakech-riad-5"),
    ],
    amenities: AMENITIES_HOTEL.slice(0, 7),
    badge: "New",
    rooms: buildRooms("marrakech-riad", 240),
  },
];

export function getHotel(id: string): Hotel | undefined {
  return hotels.find((h) => h.id === id);
}

export function getRoom(roomId: string): { hotel: Hotel; room: Room } | null {
  for (const h of hotels) {
    const r = h.rooms.find((rr) => rr.id === roomId);
    if (r) return { hotel: h, room: r };
  }
  return null;
}

export const mockBookings: Booking[] = [
  {
    id: "bk-1001",
    hotelId: "emerald-grand",
    hotelName: "The Emerald Grand",
    roomName: "Overwater Suite",
    image: img("emerald-grand-1"),
    checkIn: "2026-07-12",
    checkOut: "2026-07-18",
    nights: 6,
    guests: 2,
    total: 2880,
    status: "upcoming",
    bookedAt: "2026-04-02",
  },
  {
    id: "bk-1002",
    hotelId: "aurum-skyline",
    hotelName: "Aurum Skyline Suites",
    roomName: "Skyline Deluxe",
    image: img("aurum-skyline-1"),
    checkIn: "2026-09-04",
    checkOut: "2026-09-07",
    nights: 3,
    guests: 2,
    total: 960,
    status: "upcoming",
    bookedAt: "2026-05-19",
  },
  {
    id: "bk-0997",
    hotelId: "verdant-pines",
    hotelName: "Verdant Pines Lodge",
    roomName: "Pine Deluxe Suite",
    image: img("verdant-pines-1"),
    checkIn: "2026-01-20",
    checkOut: "2026-01-25",
    nights: 5,
    guests: 4,
    total: 1375,
    status: "completed",
    bookedAt: "2025-11-08",
  },
  {
    id: "bk-0982",
    hotelId: "marrakech-riad",
    hotelName: "Riad Noor",
    roomName: "Jasmine Standard",
    image: img("marrakech-riad-1"),
    checkIn: "2025-11-02",
    checkOut: "2025-11-05",
    nights: 3,
    guests: 2,
    total: 720,
    status: "cancelled",
    bookedAt: "2025-09-28",
  },
];

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "manager" | "admin";
  avatar: string;
  joinedAt: string;
  bookings: number;
  spend: number;
  status: "active" | "suspended" | "pending";
}

export const platformUsers: PlatformUser[] = [
  { id: "u-001", name: "Mia Rivera", email: "mia.rivera@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=mia.rivera", joinedAt: "2024-08-12", bookings: 8, spend: 6420, status: "active" },
  { id: "u-002", name: "Daniel Koh", email: "daniel.koh@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=daniel.koh", joinedAt: "2023-11-04", bookings: 14, spend: 11280, status: "active" },
  { id: "u-003", name: "Priya Mehta", email: "priya.mehta@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=priya.mehta", joinedAt: "2025-01-22", bookings: 3, spend: 1890, status: "active" },
  { id: "u-004", name: "Lars Nilsson", email: "lars.nilsson@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=lars.nilsson", joinedAt: "2025-04-18", bookings: 1, spend: 540, status: "pending" },
  { id: "u-005", name: "Camille Aubert", email: "camille.aubert@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=camille.aubert", joinedAt: "2024-02-09", bookings: 11, spend: 8720, status: "active" },
  { id: "u-006", name: "Owen Park", email: "owen.park@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=owen.park", joinedAt: "2023-06-15", bookings: 19, spend: 14310, status: "active" },
  { id: "u-007", name: "Yuki Tanaka", email: "yuki.tanaka@stayhaus.app", role: "user", avatar: "https://i.pravatar.cc/100?u=yuki.tanaka", joinedAt: "2024-12-01", bookings: 4, spend: 2410, status: "suspended" },
  { id: "m-001", name: "Sara Okafor", email: "manager@stayhaus.app", role: "manager", avatar: "https://i.pravatar.cc/100?u=manager", joinedAt: "2023-03-20", bookings: 0, spend: 0, status: "active" },
  { id: "m-002", name: "Marco Bianchi", email: "marco.bianchi@stayhaus.app", role: "manager", avatar: "https://i.pravatar.cc/100?u=marco.bianchi", joinedAt: "2024-05-11", bookings: 0, spend: 0, status: "active" },
  { id: "a-001", name: "Admin", email: "admin@stayhaus.app", role: "admin", avatar: "https://i.pravatar.cc/100?u=admin", joinedAt: "2022-01-01", bookings: 0, spend: 0, status: "active" },
];

export const hotelOwnership: Record<string, string> = {
  "emerald-grand": "m-001",
  "aurum-skyline": "m-001",
  "azure-cove": "m-001",
  "sakura-ryokan": "m-002",
  "savanna-lights": "m-002",
  "verdant-pines": "m-002",
  "patagonia-fjord": "m-001",
  "marrakech-riad": "m-002",
};

export interface HotelStatus {
  id: string;
  status: "live" | "pending" | "draft";
  occupancy: number;
  monthlyRevenue: number;
}

export const hotelStatusMap: Record<string, HotelStatus> = {
  "emerald-grand": { id: "emerald-grand", status: "live", occupancy: 92, monthlyRevenue: 184320 },
  "aurum-skyline": { id: "aurum-skyline", status: "live", occupancy: 78, monthlyRevenue: 142060 },
  "verdant-pines": { id: "verdant-pines", status: "live", occupancy: 64, monthlyRevenue: 88940 },
  "azure-cove": { id: "azure-cove", status: "live", occupancy: 88, monthlyRevenue: 212800 },
  "sakura-ryokan": { id: "sakura-ryokan", status: "live", occupancy: 71, monthlyRevenue: 95200 },
  "savanna-lights": { id: "savanna-lights", status: "pending", occupancy: 0, monthlyRevenue: 0 },
  "patagonia-fjord": { id: "patagonia-fjord", status: "live", occupancy: 55, monthlyRevenue: 67320 },
  "marrakech-riad": { id: "marrakech-riad", status: "draft", occupancy: 0, monthlyRevenue: 0 },
};

export interface PlatformBooking extends Booking {
  guestName: string;
  guestEmail: string;
  guestAvatar: string;
}

export const platformBookings: PlatformBooking[] = [
  { id: "bk-2101", hotelId: "emerald-grand", hotelName: "The Emerald Grand", roomName: "Overwater Suite", image: img("emerald-grand-1"), checkIn: "2026-06-25", checkOut: "2026-06-29", nights: 4, guests: 2, total: 2240, status: "upcoming", bookedAt: "2026-05-12", guestName: "Mia Rivera", guestEmail: "mia.rivera@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=mia.rivera" },
  { id: "bk-2102", hotelId: "aurum-skyline", hotelName: "Aurum Skyline Suites", roomName: "Skyline Deluxe", image: img("aurum-skyline-1"), checkIn: "2026-06-26", checkOut: "2026-06-28", nights: 2, guests: 2, total: 880, status: "upcoming", bookedAt: "2026-06-01", guestName: "Daniel Koh", guestEmail: "daniel.koh@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=daniel.koh" },
  { id: "bk-2103", hotelId: "azure-cove", hotelName: "Azure Cove Resort", roomName: "Cliff Suite", image: img("azure-cove-1"), checkIn: "2026-07-02", checkOut: "2026-07-08", nights: 6, guests: 4, total: 4320, status: "upcoming", bookedAt: "2026-04-29", guestName: "Camille Aubert", guestEmail: "camille.aubert@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=camille.aubert" },
  { id: "bk-2104", hotelId: "sakura-ryokan", hotelName: "Sakura Ryokan", roomName: "Tatami Standard", image: img("sakura-ryokan-1"), checkIn: "2026-07-10", checkOut: "2026-07-14", nights: 4, guests: 2, total: 1840, status: "upcoming", bookedAt: "2026-05-30", guestName: "Owen Park", guestEmail: "owen.park@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=owen.park" },
  { id: "bk-2105", hotelId: "verdant-pines", hotelName: "Verdant Pines Lodge", roomName: "Pine Deluxe", image: img("verdant-pines-1"), checkIn: "2026-06-22", checkOut: "2026-06-24", nights: 2, guests: 3, total: 790, status: "upcoming", bookedAt: "2026-06-10", guestName: "Priya Mehta", guestEmail: "priya.mehta@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=priya.mehta" },
  { id: "bk-2098", hotelId: "patagonia-fjord", hotelName: "Patagonia Fjord Lodge", roomName: "Glacier Suite", image: img("patagonia-fjord-1"), checkIn: "2026-05-18", checkOut: "2026-05-22", nights: 4, guests: 2, total: 1980, status: "completed", bookedAt: "2026-03-08", guestName: "Lars Nilsson", guestEmail: "lars.nilsson@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=lars.nilsson" },
  { id: "bk-2099", hotelId: "emerald-grand", hotelName: "The Emerald Grand", roomName: "Penthouse Residence", image: img("emerald-grand-2"), checkIn: "2026-05-30", checkOut: "2026-06-05", nights: 6, guests: 4, total: 5640, status: "completed", bookedAt: "2026-04-02", guestName: "Yuki Tanaka", guestEmail: "yuki.tanaka@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=yuki.tanaka" },
  { id: "bk-2095", hotelId: "marrakech-riad", hotelName: "Riad Noor", roomName: "Jasmine Standard", image: img("marrakech-riad-1"), checkIn: "2026-04-12", checkOut: "2026-04-15", nights: 3, guests: 2, total: 720, status: "cancelled", bookedAt: "2026-02-20", guestName: "Mia Rivera", guestEmail: "mia.rivera@stayhaus.app", guestAvatar: "https://i.pravatar.cc/100?u=mia.rivera" },
];

export function getHotelsForOwner(ownerId: string): Hotel[] {
  return hotels.filter((h) => hotelOwnership[h.id] === ownerId);
}

export function getBookingsForOwner(ownerId: string): PlatformBooking[] {
  const owned = new Set(
    Object.entries(hotelOwnership)
      .filter(([, oid]) => oid === ownerId)
      .map(([hid]) => hid)
  );
  return platformBookings.filter((b) => owned.has(b.hotelId));
}

export interface RevenueBucket {
  label: string;
  value: number;
}

export function ownerRevenueLast6Months(ownerId: string): RevenueBucket[] {
  const hotelsForOwner = getHotelsForOwner(ownerId);
  const base = hotelsForOwner.reduce(
    (s, h) => s + (hotelStatusMap[h.id]?.monthlyRevenue ?? 0),
    0
  );
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const factors = [0.62, 0.71, 0.78, 0.85, 0.93, 1];
  return months.map((label, i) => ({
    label,
    value: Math.round(base * factors[i]!),
  }));
}

export function adminRevenueLast6Months(): RevenueBucket[] {
  const total = Object.values(hotelStatusMap).reduce(
    (s, h) => s + h.monthlyRevenue,
    0
  );
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const factors = [0.58, 0.66, 0.74, 0.82, 0.91, 1];
  return months.map((label, i) => ({
    label,
    value: Math.round(total * factors[i]!),
  }));
}

export const destinations = [
  { name: "Maldives", count: 24, image: img("dest-maldives", 600, 400) },
  { name: "Dubai", count: 31, image: img("dest-dubai", 600, 400) },
  { name: "Italy", count: 42, image: img("dest-italy", 600, 400) },
  { name: "Japan", count: 28, image: img("dest-japan", 600, 400) },
  { name: "Kenya", count: 12, image: img("dest-kenya", 600, 400) },
  { name: "Chile", count: 9, image: img("dest-chile", 600, 400) },
];
