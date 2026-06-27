"use client";

import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  BedDouble,
  DollarSign,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { BarChart } from "@/components/ui/chart";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery } from "@/hooks";
import { analyticsService, bookingsService, hotelsService, reviewsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

export default function ManagerOverviewPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);

  const hotels = useQuery(
    () => hotelsService.list({ filters: { owner_id: ownerId }, limit: 50 }),
    [ownerId]
  );
  const bookings = useQuery(
    () => bookingsService.list({ filters: { owner_id: ownerId, status: "upcoming" }, limit: 5, sort: "check_in", order: "asc" }),
    [ownerId]
  );
  const stats = useQuery(() => bookingsService.stats({ owner_id: ownerId }), [ownerId]);
  const revenue = useQuery(() => analyticsService.revenueByMonth(ownerId), [ownerId]);
  const reviews = useQuery(
    () => reviewsService.list({ filters: { owner_id: ownerId, status: "published" }, limit: 100 }),
    [ownerId]
  );

  const ownerHotels = hotels.data?.data ?? [];
  const avgOccupancy =
    ownerHotels.length === 0
      ? 0
      : Math.round(ownerHotels.reduce((s, h) => s + h.occupancy, 0) / ownerHotels.length);
  const rooms = ownerHotels.length * 4;
  const monthlyRev = revenue.data?.[revenue.data.length - 1]?.value ?? 0;
  const avgReview =
    reviews.data && reviews.data.data.length
      ? (reviews.data.data.reduce((s, r) => s + r.rating, 0) / reviews.data.data.length).toFixed(1)
      : "—";

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background ring-1 ring-foreground/10 md:p-10">
          <Badge className="border border-background/20 bg-background/10 text-background hover:bg-background/10">
            <Briefcase className="size-3 text-accent" />
            Manager workspace
          </Badge>
          <h1 className="mt-4 text-display text-4xl font-semibold tracking-tight md:text-5xl">
            Good morning{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 max-w-lg text-base text-background/70">
            Average occupancy {avgOccupancy}% across your portfolio.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard label="Properties" value={ownerHotels.length} icon={Building2} loading={hotels.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Total rooms" value={rooms} icon={BedDouble} loading={hotels.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Upcoming" value={stats.data?.upcoming ?? 0} icon={CalendarCheck} loading={stats.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="MRR" value={monthlyRev} icon={DollarSign} format={(n) => formatCurrency(n)} loading={revenue.loading} />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <FadeIn>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex items-end justify-between">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-3" /> Revenue · last 6 months
                </p>
                <p className="mt-1 text-display text-3xl font-semibold text-foreground">
                  {formatCurrency(revenue.data?.reduce((s, r) => s + r.value, 0) ?? 0)}
                </p>
              </div>
              <Badge className="bg-secondary text-foreground hover:bg-secondary">+9.4%</Badge>
            </div>
            <div className="mt-8">
              {revenue.loading ? (
                <Skeleton className="h-44 w-full" />
              ) : (
                <BarChart data={revenue.data ?? []} className="h-44" />
              )}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Your hotels
              </p>
              <Link href="/dashboard/manager/rooms" className="text-xs text-muted-foreground hover:text-foreground">
                Manage rooms
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {hotels.loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : ownerHotels.length === 0 ? (
                <EmptyState title="No hotels yet" description="Ask an admin to assign you a property." className="border-0 bg-transparent" />
              ) : (
                ownerHotels.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3">
                    <img src={h.image} alt={h.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{h.occupancy}% occupancy</p>
                    </div>
                    <StatusPill value={h.status} />
                  </div>
                ))
              )}
            </div>
          </section>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <FadeIn>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                  Upcoming arrivals
                </h2>
                <p className="text-sm text-muted-foreground">Guests checking in soon</p>
              </div>
              <Link href="/dashboard/manager/reservations">
                <motion.span
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  All reservations <ArrowRight className="size-4" />
                </motion.span>
              </Link>
            </div>
          </FadeIn>
          {bookings.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : (bookings.data?.data ?? []).length === 0 ? (
            <EmptyState title="No arrivals on the horizon." description="" />
          ) : (
            <Stagger className="space-y-3" stagger={0.06}>
              {(bookings.data?.data ?? []).map((b) => (
                <StaggerItem key={b.id}>
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                    <img src={b.guest_avatar} alt={b.guest_name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {b.guest_name}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          · {b.hotel_name} · {b.room_name}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check-in {formatDate(b.check_in)} · {b.nights} night
                        {b.nights > 1 ? "s" : ""} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(b.total)}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>

        <FadeIn delay={0.1}>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Star className="size-4 text-accent" /> Review snapshot
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-display text-4xl font-semibold text-foreground">{avgReview}</span>
              <span className="text-sm text-muted-foreground">/ 5 across {reviews.data?.meta.total ?? 0} reviews</span>
            </div>
            <Link href="/dashboard/manager/reviews">
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Manage reviews <ArrowRight className="size-4" />
              </span>
            </Link>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
