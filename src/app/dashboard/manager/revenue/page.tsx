"use client";

import { TrendingUp, DollarSign, Building2, FileDown, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Donut } from "@/components/ui/chart";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery } from "@/hooks";
import { analyticsService, bookingsService, expensesService, hotelsService } from "@/services";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

const DONUT_COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#34d399", "#fb7185", "#fb923c"];

export default function ManagerRevenuePage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);

  const revenue = useQuery(() => analyticsService.revenueByMonth(ownerId), [ownerId]);
  const bookings = useQuery(() => analyticsService.bookingsByMonth(ownerId), [ownerId]);
  const byHotel = useQuery(() => analyticsService.revenueByHotel(ownerId), [ownerId]);
  const stats = useQuery(() => bookingsService.stats({ owner_id: ownerId }), [ownerId]);
  const hotels = useQuery(() => hotelsService.list({ filters: { owner_id: ownerId }, limit: 50 }), [ownerId]);
  const expenses = useQuery(() => expensesService.totals(ownerId), [ownerId]);

  const totalRevenue = revenue.data?.reduce((s, r) => s + r.value, 0) ?? 0;
  const totalBookings = stats.data?.total ?? 0;
  const aov = totalBookings === 0 ? 0 : Math.round((stats.data?.revenue ?? 0) / totalBookings);
  const totalExpenses = expenses.data?.total ?? 0;
  const net = totalRevenue - totalExpenses;
  const expenseSegments = Object.entries(expenses.data?.by_category ?? {}).map(([label, value], i) => ({
    label,
    value,
    color: DONUT_COLORS[i % DONUT_COLORS.length]!,
  }));

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Revenue
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Performance across your portfolio.</p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Report exported")}>
            <FileDown className="size-4" /> Export PDF
          </Button>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard label="MRR" value={revenue.data?.[revenue.data.length - 1]?.value ?? 0} icon={DollarSign} format={(n) => formatCurrency(n)} loading={revenue.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Avg order" value={aov} icon={TrendingUp} format={(n) => formatCurrency(n)} loading={stats.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Active hotels" value={hotels.data?.meta.total ?? 0} icon={Building2} loading={hotels.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Net (6mo)" value={net} icon={Wallet} format={(n) => formatCurrency(n)} loading={revenue.loading || expenses.loading} delta={{ label: net >= 0 ? "+ profit" : "− loss", positive: net >= 0 }} />
        </StaggerItem>
      </Stagger>

      <FadeIn>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-end justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="size-3" /> Trailing 6 months
              </p>
              <p className="mt-1 text-display text-3xl font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
            <Badge className="bg-secondary text-foreground hover:bg-secondary">+9.4%</Badge>
          </div>
          {revenue.loading ? (
            <Skeleton className="mt-8 h-56 w-full" />
          ) : (
            <BarChart
              data={revenue.data ?? []}
              format={(v) => formatCurrency(v)}
              className="mt-8 h-56"
            />
          )}
        </section>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold text-foreground">Bookings · monthly</h2>
            <p className="text-sm text-muted-foreground">Volume by month.</p>
            {bookings.loading ? (
              <Skeleton className="mt-6 h-44 w-full" />
            ) : (
              <BarChart data={bookings.data ?? []} className="mt-6 h-44" />
            )}
          </section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold text-foreground">Expenses · by category</h2>
            <p className="text-sm text-muted-foreground">Current month spend.</p>
            {expenses.loading ? (
              <Skeleton className="mt-6 h-44 w-full" />
            ) : expenseSegments.length === 0 ? (
              <EmptyState title="No expenses yet" className="mt-4 border-0 bg-transparent" />
            ) : (
              <div className="mt-6 flex flex-wrap items-center gap-8">
                <Donut segments={expenseSegments} />
                <div className="space-y-2 text-xs">
                  {expenseSegments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                      <span className="text-foreground">{s.label}</span>
                      <span className="ml-auto text-muted-foreground">{formatCurrency(s.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </FadeIn>
      </div>

      <FadeIn>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            By property
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Monthly revenue and occupancy.</p>

          {byHotel.loading ? (
            <div className="mt-5 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (byHotel.data ?? []).length === 0 ? (
            <EmptyState title="No properties to report" className="mt-5 border-0 bg-transparent" />
          ) : (
            <div className="mt-5 space-y-4">
              {(byHotel.data ?? []).map((row, i) => {
                const max = byHotel.data?.[0]?.value || 1;
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl bg-secondary/40 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{row.label}</p>
                      <p className="text-base font-semibold text-foreground">{formatCurrency(row.value)}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(row.value / max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
    </div>
  );
}
