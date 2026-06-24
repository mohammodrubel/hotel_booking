"use client";

import { useState } from "react";
import { Search, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { FadeIn } from "@/components/motion/Motion";
import { useQuery, useDebounced } from "@/hooks";
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
];

export default function AdminBookingsPage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "booked_at", order: "desc" });
  const dq = useDebounced(q, 250);

  const { data, loading, error } = useQuery(
    () =>
      bookingsService.list({
        page,
        limit: 10,
        search: dq,
        filters: { status: tab === "all" ? undefined : tab },
        sort: sort.key,
        order: sort.order,
      }),
    [page, dq, tab, sort.key, sort.order]
  );

  const columns: Array<Column<ApiBooking>> = [
    {
      key: "guest",
      header: "Guest",
      sortable: true,
      sortAccessor: "guest_name",
      cell: (b) => (
        <div className="flex items-center gap-3">
          <Avatar src={b.guest_avatar} alt={b.guest_name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{b.guest_name}</p>
            <p className="truncate text-xs text-muted-foreground">#{b.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "hotel",
      header: "Hotel",
      sortable: true,
      sortAccessor: "hotel_name",
      cell: (b) => (
        <div className="min-w-0">
          <p className="truncate text-foreground">{b.hotel_name}</p>
          <p className="truncate text-xs text-muted-foreground">{b.room_name}</p>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      cell: (b) => (
        <p className="text-xs text-muted-foreground">
          {formatDate(b.check_in)} → {formatDate(b.check_out)}
        </p>
      ),
    },
    {
      key: "nights",
      header: "Nights",
      sortable: true,
      sortAccessor: "nights",
      align: "right",
      width: "minmax(0, 0.6fr)",
      cell: (b) => <span className="text-foreground">{b.nights}</span>,
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      sortAccessor: "total",
      align: "right",
      cell: (b) => <span className="font-semibold text-foreground">{formatCurrency(b.total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: "status",
      cell: (b) => <StatusPill value={b.status} />,
    },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Bookings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data?.meta.total ?? 0} reservations across all properties.
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Export started")}>
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
              placeholder="Search guest, hotel, ID"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="admin-bookings-tabs" />
        </div>
      </FadeIn>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(b) => b.id}
        loading={loading}
        error={error}
        sortKey={sort.key}
        sortOrder={sort.order}
        onSort={(key, order) => setSort({ key, order })}
        empty={{ title: "No bookings match" }}
      />

      {data && data.meta.total_pages > 1 && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.total_pages}
          total={data.meta.total}
          limit={data.meta.limit}
          onChange={setPage}
        />
      )}
    </div>
  );
}
