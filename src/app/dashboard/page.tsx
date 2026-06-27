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

  const nextBooking = bookings.data?.data?.[0];
  const daysUntilNext = nextBooking
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextBooking.check_in).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-border shadow-lift">
          <img
            src="/images/manuelajaeger-hotel-1749602.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/75 to-foreground/40" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
          />

          <div className="relative grid gap-8 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="text-background">
              <Badge className="gap-1.5 border border-background/20 bg-background/10 text-background backdrop-blur hover:bg-background/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Dashboard
              </Badge>
              <h1 className="mt-4 text-display text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Welcome back
                {user ? (
                  <>
                    , <span className="text-primary">{user.name.split(" ")[0]}</span>
                  </>
                ) : null}
              </h1>
              <p className="mt-3 max-w-md text-base text-background/80">
                Here&apos;s what&apos;s on your itinerary.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/hotels">
                  <Button className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Plan a trip
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/bookings">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl border-background/30 bg-background/10 text-background backdrop-blur hover:bg-background/20 hover:text-background"
                  >
                    <CalendarCheck className="size-4" />
                    View bookings
                  </Button>
                </Link>
              </div>
            </div>

            {nextBooking ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl bg-background/95 p-5 text-foreground shadow-lift backdrop-blur"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Next stay
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <img
                    src={nextBooking.image}
                    alt={nextBooking.hotel_name}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {nextBooking.hotel_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {nextBooking.room_name}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Check in
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(nextBooking.check_in)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      In
                    </p>
                    <p className="text-display text-2xl font-semibold tracking-tight text-primary">
                      {daysUntilNext}d
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl bg-background/95 p-6 text-foreground shadow-lift backdrop-blur"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <p className="mt-4 font-heading text-base font-semibold">
                  No trips yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Discover curated stays handpicked for you.
                </p>
                <Link href="/hotels" className="mt-4 inline-block">
                  <Button size="sm" className="gap-1.5 rounded-xl">
                    Browse hotels
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
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
