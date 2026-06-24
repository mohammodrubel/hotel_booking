"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, CheckCircle2, XCircle, LogIn, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { bookingsService } from "@/services";
import type { ApiBooking } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "checked_in", label: "In stay" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

export default function ManagerReservationsPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);
  const [tab, setTab] = useState<string>("all");
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ApiBooking | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(
    () =>
      bookingsService.list({
        page,
        limit: 8,
        search: dq,
        filters: { owner_id: ownerId, status: tab === "all" ? undefined : tab },
        sort: "check_in",
        order: "asc",
      }),
    [ownerId, page, dq, tab]
  );

  const checkIn = useMutation((id: string) => bookingsService.checkIn(id), {
    onSuccess: () => {
      toast.success("Guest checked in");
      refetch();
    },
  });
  const complete = useMutation((id: string) => bookingsService.complete(id), {
    onSuccess: () => {
      toast.success("Booking completed");
      refetch();
    },
  });
  const cancel = useMutation((id: string) => bookingsService.cancel(id), {
    onSuccess: () => {
      toast.success("Booking cancelled");
      refetch();
    },
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Reservations
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data?.meta.total ?? 0} bookings across your properties.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={() => toast.success("Export started")}
          >
            <FileDown className="size-4" /> Export CSV
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search guest, email, hotel"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="mgr-res-tabs" />
        </div>
      </FadeIn>

      {loading && rows.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No reservations match" description="Try a different filter or search term." />
      ) : (
        <div className="space-y-3">
          {rows.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(i * 0.04, 0.24),
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -2 }}
              className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
            >
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[auto_1.4fr_1fr_0.7fr_auto] sm:items-center">
                <img src={b.guest_avatar} alt={b.guest_name} className="h-12 w-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{b.guest_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.hotel_name} · {b.room_name}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="text-foreground">
                    {formatDate(b.check_in)} → {formatDate(b.check_out)}
                  </p>
                  <p>
                    {b.nights} night{b.nights > 1 ? "s" : ""} · {b.guests} guest{b.guests > 1 ? "s" : ""} · {b.source.replace(/_/g, " ")}
                  </p>
                </div>
                <p className="text-base font-semibold text-foreground">{formatCurrency(b.total)}</p>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <StatusPill value={b.status} />
                  <Button variant="ghost" size="icon" aria-label="Message" onClick={() => toast.success(`Messaging ${b.guest_name}`)}>
                    <MessageSquare className="size-4" />
                  </Button>
                  {b.status === "upcoming" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-lg"
                      onClick={() => checkIn.mutate(b.id)}
                    >
                      <LogIn className="size-3.5" /> Check in
                    </Button>
                  )}
                  {b.status === "checked_in" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-lg"
                      onClick={() => complete.mutate(b.id)}
                    >
                      <CheckCircle2 className="size-3.5" /> Complete
                    </Button>
                  )}
                  {b.status === "upcoming" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCancelId(b.id)}
                      aria-label="Cancel booking"
                    >
                      <XCircle className="size-4 text-destructive" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setDetail(b)}>
                    View
                  </Button>
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

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Booking #{detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-secondary/40 p-4">
                <p className="text-sm font-semibold text-foreground">{detail.hotel_name}</p>
                <p className="text-xs text-muted-foreground">{detail.room_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Guest</p>
                  <p className="font-medium text-foreground">{detail.guest_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{detail.guest_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check in</p>
                  <p className="font-medium text-foreground">{formatDate(detail.check_in)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check out</p>
                  <p className="font-medium text-foreground">{formatDate(detail.check_out)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nights</p>
                  <p className="font-medium text-foreground">{detail.nights}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guests</p>
                  <p className="font-medium text-foreground">{detail.guests}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium capitalize text-foreground">{detail.source.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium text-foreground">{formatCurrency(detail.total)}</p>
                </div>
              </div>
              {detail.notes && (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 rounded-xl bg-secondary/40 p-3 text-sm text-foreground">{detail.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(v) => !v && setCancelId(null)}
        title="Cancel reservation?"
        description="The guest will be notified and refunded per policy."
        destructive
        confirmLabel="Cancel reservation"
        loading={cancel.loading}
        onConfirm={() => cancel.mutate(cancelId!)}
      />
    </div>
  );
}
