"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarX, ArrowRight, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusPill } from "@/components/ui/status-pill";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { bookingsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "checked_in", label: "In stay" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export default function BookingsPage() {
  const user = useAuthUser();
  const [tab, setTab] = useState<string>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q, 300);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(
    () =>
      bookingsService.list({
        page,
        limit: 6,
        search: dq,
        filters: { status: tab === "all" ? undefined : tab, guest_id: user?.id },
        sort: "check_in",
        order: "desc",
      }),
    [page, dq, tab, user?.id]
  );

  const cancelMut = useMutation((id: string) => bookingsService.cancel(id), {
    onSuccess: () => {
      toast.success("Booking cancelled");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const rows = data?.data ?? [];

  const counts = useMemo(() => ({} as Record<string, number>), []);

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            My bookings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Past and upcoming reservations.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search hotel, room, booking ID"
            className="h-11 max-w-md rounded-xl"
          />
          <Tabs
            items={TABS.map((t) => ({ ...t, count: counts[t.id] }))}
            value={tab}
            onChange={(id) => {
              setTab(id);
              setPage(1);
            }}
            layoutId="bookings-tab"
          />
        </div>
      </FadeIn>

      {loading && rows.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<CalendarX className="size-7" />}
          title="Could not load bookings"
          description={error.message}
          action={<Button onClick={refetch} className="rounded-xl">Retry</Button>}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarX className="size-7" />}
          title="No bookings in this view"
          description="Plan your next escape."
          action={
            <Link href="/hotels">
              <Button className="rounded-xl">Browse hotels</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {rows.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: Math.min(i * 0.06, 0.3),
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
                <img
                  src={b.image}
                  alt={b.hotel_name}
                  className="h-48 w-full object-cover sm:h-full"
                />
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-foreground">{b.hotel_name}</p>
                      <p className="text-sm text-muted-foreground">{b.room_name}</p>
                    </div>
                    <StatusPill value={b.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    {[
                      { l: "Check in", v: formatDate(b.check_in) },
                      { l: "Check out", v: formatDate(b.check_out) },
                      { l: "Nights", v: b.nights },
                      { l: "Guests", v: b.guests },
                    ].map((d) => (
                      <div key={d.l} className="rounded-xl bg-secondary/40 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {d.l}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">{d.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Booking #{b.id} · placed {formatDate(b.booked_at)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-semibold text-foreground">
                        {formatCurrency(b.total)}
                      </span>
                      <Link href={`/hotels/${b.hotel_id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          View hotel
                        </Button>
                      </Link>
                      <Link href={`/booking-confirmed/${b.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                          <Receipt className="size-3.5" />
                          Receipt
                        </Button>
                      </Link>
                      {(b.status === "upcoming") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => setCancelTarget(b.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {b.status === "completed" && (
                        <Link href="/dashboard/reviews">
                          <Button size="sm" className="gap-1.5 rounded-xl bg-foreground text-background hover:bg-foreground/85">
                            Leave review
                            <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {data && data.meta.total_pages > 1 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.total_pages}
          total={data.meta.total}
          limit={data.meta.limit}
          onChange={setPage}
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancel this booking?"
        description="Cancellation is free until 48 hours before check-in. After that, fees may apply."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        loading={cancelMut.loading}
        onConfirm={() => cancelMut.mutate(cancelTarget!)}
      />
    </div>
  );
}
