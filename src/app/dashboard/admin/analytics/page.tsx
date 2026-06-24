"use client";

import { TrendingUp, Building2, Users, CalendarCheck, FileDown, Star, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Donut } from "@/components/ui/chart";
import { KpiCard } from "@/components/ui/kpi-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { motion } from "framer-motion";
import { useQuery } from "@/hooks";
import { analyticsService, paymentsService } from "@/services";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

const DONUT_COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#34d399", "#fb7185", "#fb923c", "#94a3b8", "#22d3ee"];

export default function AdminAnalyticsPage() {
  const overview = useQuery(() => analyticsService.platformOverview(), []);
  const revenue = useQuery(() => analyticsService.revenueByMonth(), []);
  const bookings = useQuery(() => analyticsService.bookingsByMonth(), []);
  const byHotel = useQuery(() => analyticsService.revenueByHotel(), []);
  const occupancy = useQuery(() => analyticsService.occupancyByHotel(), []);
  const payments = useQuery(() => paymentsService.stats(), []);

  const occSegs = (occupancy.data ?? []).map((o, i) => ({
    label: o.label,
    value: o.value,
    color: DONUT_COLORS[i % DONUT_COLORS.length]!,
  }));

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Platform-wide growth, performance, and trends.
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Report exported")}>
            <FileDown className="size-4" /> Export
          </Button>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard label="Users" value={overview.data?.total_users ?? 0} icon={Users} loading={overview.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Live hotels" value={overview.data?.live_hotels ?? 0} icon={Building2} loading={overview.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Bookings" value={overview.data?.total_bookings ?? 0} icon={CalendarCheck} loading={overview.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Revenue" value={overview.data?.total_revenue ?? 0} icon={DollarSign} format={(n) => formatCurrency(n)} loading={overview.loading} />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex items-end justify-between">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-3" /> Revenue · 6 months
                </p>
                <p className="mt-1 text-display text-3xl font-semibold text-foreground">
                  {formatCurrency(revenue.data?.reduce((s, r) => s + r.value, 0) ?? 0)}
                </p>
              </div>
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
            <p className="text-sm font-semibold text-foreground">Bookings · 6 months</p>
            {bookings.loading ? (
              <Skeleton className="mt-6 h-44 w-full" />
            ) : (
              <BarChart data={bookings.data ?? []} className="mt-6 h-44" />
            )}
          </section>
        </FadeIn>
      </div>

      <FadeIn>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <p className="text-sm font-semibold text-foreground">Revenue · by hotel</p>
          {byHotel.loading ? (
            <Skeleton className="mt-5 h-64 w-full" />
          ) : (
            <div className="mt-5 space-y-3">
              {(byHotel.data ?? []).map((row, i) => {
                const max = byHotel.data?.[0]?.value || 1;
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-2xl bg-secondary/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{row.label}</p>
                      <p className="text-base font-semibold text-foreground">{formatCurrency(row.value)}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(row.value / max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full bg-foreground"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-sm font-semibold text-foreground">Occupancy · by property</p>
            {occupancy.loading ? (
              <Skeleton className="mt-5 h-44 w-full" />
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-6">
                <Donut segments={occSegs} />
                <div className="space-y-1 text-xs">
                  {occSegs.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                      <span className="text-foreground">{s.label}</span>
                      <span className="ml-auto text-muted-foreground">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-sm font-semibold text-foreground">Payment health</p>
            {payments.loading ? (
              <Skeleton className="mt-5 h-44 w-full" />
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-4">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(payments.data?.paid ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-amber-400/10 p-4">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(payments.data?.pending ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-purple-500/10 p-4">
                  <p className="text-xs text-muted-foreground">Refunded</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(payments.data?.refunded ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-4">
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{payments.data?.failed ?? 0}</p>
                </div>
              </div>
            )}
          </section>
        </FadeIn>
      </div>

      <FadeIn>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Average review</p>
          </div>
          {overview.loading ? (
            <Skeleton className="mt-3 h-12 w-32" />
          ) : (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-display text-5xl font-semibold text-foreground">
                {(overview.data?.avg_review ?? 0).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">/ 5 across all properties</span>
            </div>
          )}
        </section>
      </FadeIn>
    </div>
  );
}
