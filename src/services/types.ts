export type ID = string;
export type ISODate = string;

export type Role = "user" | "manager" | "admin";

export type UserStatus = "active" | "suspended" | "pending";
export type KycStatus = "pending" | "verified" | "rejected";

export interface ApiUser {
  id: ID;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  status: UserStatus;
  kyc_status: KycStatus;
  language?: "en" | "ar";
  bookings_count: number;
  total_spend: number;
  joined_at: ISODate;
  last_login_at?: ISODate;
  two_factor_enabled: boolean;
}

export type HotelStatus = "live" | "pending" | "draft" | "archived";
export type HotelBadge = "Premium" | "Top Rated" | "Trending" | "New";

export interface ApiHotel {
  id: ID;
  name: string;
  description: string;
  city: string;
  country: string;
  location: string;
  address?: string;
  rating: number;
  reviews: number;
  price_per_night: number;
  image: string;
  gallery: string[];
  amenities: string[];
  badge?: HotelBadge;
  status: HotelStatus;
  owner_id: ID;
  occupancy: number;
  monthly_revenue: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export type RoomType = "standard" | "deluxe" | "suite" | "penthouse";
export type RoomStatus = "available" | "hidden" | "maintenance";

export interface ApiRoom {
  id: ID;
  hotel_id: ID;
  name: string;
  type: RoomType;
  price_per_night: number;
  capacity: number;
  beds: number;
  size: number;
  image: string;
  amenities: string[];
  description: string;
  status: RoomStatus;
  created_at: ISODate;
}

export type BookingStatus = "upcoming" | "checked_in" | "completed" | "cancelled";
export type BookingSource = "direct" | "ota" | "walk_in" | "partner";

export interface ApiBooking {
  id: ID;
  hotel_id: ID;
  hotel_name: string;
  room_id: ID;
  room_name: string;
  image: string;
  guest_id: ID;
  guest_name: string;
  guest_email: string;
  guest_avatar: string;
  check_in: ISODate;
  check_out: ISODate;
  nights: number;
  guests: number;
  subtotal: number;
  taxes: number;
  total: number;
  status: BookingStatus;
  source: BookingSource;
  notes?: string;
  booked_at: ISODate;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "card" | "paypal" | "bank_transfer" | "wallet";
export type PaymentType = "booking" | "fee" | "refund" | "payout";

export interface ApiPayment {
  id: ID;
  booking_id?: ID;
  user_id: ID;
  user_name: string;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference: string;
  created_at: ISODate;
}

export interface ApiExpense {
  id: ID;
  hotel_id: ID;
  hotel_name: string;
  category: string;
  amount: number;
  year: number;
  month: number;
  note?: string;
  created_at: ISODate;
}

export type ReviewStatus = "published" | "pending" | "flagged" | "rejected";

export interface ApiReview {
  id: ID;
  hotel_id: ID;
  hotel_name: string;
  room_id?: ID;
  booking_id?: ID;
  user_id: ID;
  user_name: string;
  user_avatar: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  reply?: string;
  reply_at?: ISODate;
  created_at: ISODate;
}

export type NotificationType =
  | "booking"
  | "payment"
  | "system"
  | "review"
  | "message"
  | "announcement";

export interface ApiNotification {
  id: ID;
  user_id: ID;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: ISODate;
}

export interface ApiMessageThread {
  id: ID;
  participants: ID[];
  participant_names: string[];
  participant_avatars: string[];
  last_message: string;
  last_message_at: ISODate;
  unread_count: number;
  related_booking_id?: ID;
}

export interface ApiMessage {
  id: ID;
  thread_id: ID;
  sender_id: ID;
  sender_name: string;
  sender_avatar: string;
  body: string;
  created_at: ISODate;
  read: boolean;
}

export type AnnouncementType = "maintenance" | "meeting" | "general" | "alert";

export interface ApiAnnouncement {
  id: ID;
  title: string;
  body: string;
  type: AnnouncementType;
  audience: "all" | "managers" | "users" | "admins";
  created_by: ID;
  created_by_name: string;
  is_published: boolean;
  created_at: ISODate;
}

export interface ApiAuditLog {
  id: ID;
  user_id: ID;
  user_name: string;
  action: string;
  entity: string;
  entity_id?: ID;
  ip: string;
  metadata?: Record<string, unknown>;
  created_at: ISODate;
}

export type ServiceRequestStatus = "open" | "in_progress" | "done" | "cancelled";
export type ServiceRequestPriority = "low" | "medium" | "high" | "urgent";

export interface ApiServiceRequest {
  id: ID;
  hotel_id: ID;
  hotel_name: string;
  room_id?: ID;
  room_name?: string;
  requester_id: ID;
  requester_name: string;
  category: "housekeeping" | "maintenance" | "concierge" | "billing" | "other";
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  description: string;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ApiDocument {
  id: ID;
  owner_id: ID;
  hotel_id?: ID;
  name: string;
  type: "contract" | "id" | "tax" | "license" | "other";
  size_kb: number;
  url: string;
  uploaded_at: ISODate;
}

export interface ApiAvailability {
  id: ID;
  room_id: ID;
  date: ISODate;
  available: boolean;
  price_override?: number;
}

export interface ApiPricingRule {
  id: ID;
  hotel_id: ID;
  name: string;
  type: "seasonal" | "weekend" | "discount" | "long_stay";
  adjustment_percent: number;
  start_date?: ISODate;
  end_date?: ISODate;
  active: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | undefined>;
}
