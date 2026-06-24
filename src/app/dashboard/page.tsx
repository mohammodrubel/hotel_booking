"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Heart,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { KpiCard } from "@/components/ui/kpi-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useCartItems } from "@/redux/fetchers/cart/cartSlice";
import { useWishlistItems } from "@/redux/fetchers/wishlist/wishlistSlice";
import { useQuery } from "@/hooks";
import { analyticsService, bookingsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";

export default function DashboardOverview() {
  const user = useAuthUser();
  const cart = useCartItems();
  const wishlist = useWishlistItems();

  const spend = useQuery(
    () => (user ? analyticsService.userSpend(user.id) : Promise.resolve(null)),
    [user?.id]
  );

  const bookings = useQuery(
    () =>
      bookingsService.list({
        page: 1,
        limit: 4,
        filters: { guest_id: user?.id, status: "upcoming" },
        sort: "check_in",
        order: "asc",
      }),
    [user?.id]
  );

  const kpis = [
    {
      label: "Upcoming stays",
      value: spend.data?.upcoming_stays ?? 0,
      icon: CalendarCheck,
    },
    {
      label: "Wishlist",
      value: wishlist.length,
      icon: Heart,
    },
    {
      label: "Cart items",
      value: cart.length,
      icon: ShoppingBag,
    },
    {
      label: "Lifetime spend",
      value: spend.data?.lifetime_spend ?? 0,
      icon: TrendingUp,
      currency: true,
    },
  ];

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background ring-1 ring-foreground/10 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/40 blob" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-[#93c5fd]/25 blob blob-2" />
          <Badge className="border border-background/20 bg-background/10 text-background hover:bg-background/10">
            <Sparkles className="size-3 text-accent" />
            Dashboard
          </Badge>
          <h1 className="mt-4 text-display text-4xl font-semibold tracking-tight md:text-5xl">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 max-w-lg text-base text-background/70">
            Here&apos;s what&apos;s on your itinerary.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <StaggerItem key={k.label}>
            <KpiCard
              label={k.label}
              value={k.value}
              icon={k.icon}
              loading={spend.loading}
              format={k.currency ? (n) => formatCurrency(n) : undefined}
            />
          </StaggerItem>
        ))}
      </Stagger>

      <section>
        <FadeIn>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Upcoming stays
              </h2>
              <p className="text-sm text-muted-foreground">Reservations on your calendar</p>
            </div>
            <Link href="/dashboard/bookings">
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                View all <ArrowRight className="size-4" />
              </motion.span>
            </Link>
          </div>
        </FadeIn>

        {bookings.loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        ) : (bookings.data?.data ?? []).length === 0 ? (
          <EmptyState
            icon={<CalendarCheck className="size-7" />}
            title="No upcoming stays"
            description="Plan your next escape."
            action={
              <Link href="/hotels">
                <Button className="rounded-xl">Book your next trip</Button>
              </Link>
            }
          />
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2" stagger={0.08}>
            {(bookings.data?.data ?? []).map((b) => (
              <StaggerItem key={b.id}>
                <motion.div
                  whileHover={{ y: -3 }}
                  className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
                >
                  <div className="grid grid-cols-[120px_1fr]">
                    <img src={b.image} alt={b.hotel_name} className="h-full w-full object-cover" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{b.hotel_name}</p>
                          <p className="text-xs text-muted-foreground">{b.room_name}</p>
                        </div>
                        <StatusPill value={b.status} />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.nights} night
                        {b.nights > 1 ? "s" : ""}
                      </p>
                      <p className="mt-3 text-base font-semibold text-foreground">
                        {formatCurrency(b.total)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <FadeIn delay={0.1}>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Star className="size-4 text-accent" /> Quick actions
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link href="/dashboard/bookings" className="group rounded-2xl bg-secondary/40 p-4 transition-colors hover:bg-secondary">
              <CalendarCheck className="size-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-foreground">Bookings</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Upcoming + history</p>
            </Link>
            <Link href="/dashboard/reviews" className="group rounded-2xl bg-secondary/40 p-4 transition-colors hover:bg-secondary">
              <Star className="size-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-foreground">Reviews</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Rate completed stays</p>
            </Link>
            <Link href="/dashboard/payments" className="group rounded-2xl bg-secondary/40 p-4 transition-colors hover:bg-secondary">
              <TrendingUp className="size-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-foreground">Payments</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Transaction history</p>
            </Link>
            <Link href="/dashboard/support" className="group rounded-2xl bg-secondary/40 p-4 transition-colors hover:bg-secondary">
              <HelpCircle className="size-5 text-accent" />
              <p className="mt-3 text-sm font-semibold text-foreground">Support</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Help center</p>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
