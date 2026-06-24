"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  CalendarCheck,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Star,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart } from "@/components/ui/chart";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useQuery } from "@/hooks";
import { analyticsService, bookingsService, hotelsService, paymentsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AdminOverviewPage() {
  const overview = useQuery(() => analyticsService.platformOverview(), []);
  const revenue = useQuery(() => analyticsService.revenueByMonth(), []);
  const recent = useQuery(
    () => bookingsService.list({ limit: 5, sort: "booked_at", order: "desc" }),
    []
  );
  const pending = useQuery(
    () => hotelsService.list({ filters: { status: "pending" }, limit: 6 }),
    []
  );
  const payments = useQuery(() => paymentsService.stats(), []);

  const kpis = [
    { label: "Total users", value: overview.data?.total_users ?? 0, icon: Users },
    { label: "Live hotels", value: overview.data?.live_hotels ?? 0, icon: Building2 },
    { label: "Bookings", value: overview.data?.total_bookings ?? 0, icon: CalendarCheck },
    { label: "MRR", value: overview.data?.monthly_revenue ?? 0, icon: DollarSign, currency: true },
  ];

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background ring-1 ring-foreground/10 md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/40 blob" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-[#93c5fd]/25 blob blob-2" />
          <Badge className="border border-background/20 bg-background/10 text-background hover:bg-background/10">
            <ShieldCheck className="size-3 text-accent" />
            Admin console
          </Badge>
          <h1 className="mt-4 text-display text-4xl font-semibold tracking-tight md:text-5xl">
            Platform pulse
          </h1>
          <p className="mt-2 max-w-lg text-base text-background/70">
            {overview.data?.total_managers ?? 0} managers · {overview.data?.pending_hotels ?? 0} hotels awaiting review.
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
              loading={overview.loading}
              format={k.currency ? (n) => formatCurrency(n) : undefined}
            />
          </StaggerItem>
        ))}
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
              <Badge className="bg-secondary text-foreground hover:bg-secondary">+14.2%</Badge>
            </div>
            {revenue.loading ? (
              <Skeleton className="mt-8 h-44 w-full" />
            ) : (
              <BarChart data={revenue.data ?? []} format={(v) => formatCurrency(v)} className="mt-8 h-44" />
            )}
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Needs review
              </p>
              <Link
                href="/dashboard/admin/hotels"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                All hotels
              </Link>
            </div>
            {pending.loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (pending.data?.data ?? []).length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Nothing pending. Inbox zero.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {(pending.data?.data ?? []).map((h) => (
                  <div key={h.id} className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3">
                    <img src={h.image} alt={h.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{h.location}</p>
                    </div>
                    <StatusPill value={h.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CreditCard className="size-4 text-accent" /> Payment summary
            </p>
            {payments.loading ? (
              <Skeleton className="mt-4 h-24 w-full" />
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-secondary/40 p-4">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(payments.data?.paid ?? 0)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/40 p-4">
                  <p className="text-xs text-muted-foreground">Refunded</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(payments.data?.refunded ?? 0)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/40 p-4">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(payments.data?.pending ?? 0)}</p>
                </div>
                <div className="rounded-2xl bg-secondary/40 p-4">
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{payments.data?.failed ?? 0}</p>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Star className="size-4 text-accent" /> Platform quality
            </p>
            {overview.loading ? (
              <Skeleton className="mt-4 h-24 w-full" />
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-4xl font-semibold text-foreground">
                    {(overview.data?.avg_review ?? 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 5 average review</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {overview.data?.upcoming_bookings ?? 0} upcoming reservations · {overview.data?.live_hotels ?? 0} live properties
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      <section>
        <FadeIn>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Recent bookings
              </h2>
              <p className="text-sm text-muted-foreground">Across all properties</p>
            </div>
            <Link href="/dashboard/admin/bookings">
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                View all <ArrowRight className="size-4" />
              </motion.span>
            </Link>
          </div>
        </FadeIn>
        {recent.loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : (recent.data?.data ?? []).length === 0 ? (
          <EmptyState title="No bookings yet" />
        ) : (
          <Stagger className="space-y-3" stagger={0.06}>
            {(recent.data?.data ?? []).map((b) => (
              <StaggerItem key={b.id}>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                  <Avatar src={b.guest_avatar} alt={b.guest_name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {b.guest_name}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">booked</span>{" "}
                      <span className="text-sm font-medium">{b.hotel_name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(b.check_in)} · {b.nights} night{b.nights > 1 ? "s" : ""} · #{b.id}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(b.total)}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}
