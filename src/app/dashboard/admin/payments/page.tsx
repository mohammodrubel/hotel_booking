"use client";

import { useState } from "react";
import { Search, FileDown, RotateCcw, CreditCard, Wallet, RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { KpiCard } from "@/components/ui/kpi-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { paymentsService } from "@/services";
import type { ApiPayment } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "created_at", order: "desc" });
  const [refundTarget, setRefundTarget] = useState<string | null>(null);
  const dq = useDebounced(q, 250);

  const { data, loading, error, refetch } = useQuery(
    () =>
      paymentsService.list({
        page,
        limit: 12,
        search: dq,
        filters: { status: status === "all" ? undefined : status, type: type === "all" ? undefined : type },
        sort: sort.key,
        order: sort.order,
      }),
    [page, dq, status, type, sort.key, sort.order]
  );

  const stats = useQuery(() => paymentsService.stats(), []);

  const refund = useMutation((id: string) => paymentsService.refund(id), {
    onSuccess: () => {
      toast.success("Payment refunded");
      refetch();
      stats.refetch();
    },
  });

  const columns: Array<Column<ApiPayment>> = [
    {
      key: "reference",
      header: "Reference",
      sortable: true,
      sortAccessor: "reference",
      cell: (p) => <span className="font-mono text-xs text-foreground">{p.reference}</span>,
    },
    {
      key: "user_name",
      header: "User",
      sortable: true,
      sortAccessor: "user_name",
      cell: (p) => <span className="text-foreground">{p.user_name}</span>,
    },
    {
      key: "type",
      header: "Type",
      cell: (p) => <span className="text-sm capitalize text-foreground">{p.type}</span>,
    },
    {
      key: "method",
      header: "Method",
      cell: (p) => <span className="text-sm capitalize text-muted-foreground">{p.method.replace(/_/g, " ")}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      sortAccessor: "amount",
      align: "right",
      cell: (p) => <span className="font-semibold text-foreground">{formatCurrency(p.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => <StatusPill value={p.status} />,
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      sortAccessor: "created_at",
      cell: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "minmax(0, 0.5fr)",
      align: "right",
      cell: (p) =>
        p.status === "paid" ? (
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-lg" onClick={() => setRefundTarget(p.id)}>
            <RotateCcw className="size-3.5" /> Refund
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Payments
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">All transactions on the platform.</p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Export started")}>
            <FileDown className="size-4" /> Export
          </Button>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard label="Total paid" value={stats.data?.paid ?? 0} icon={CreditCard} format={(n) => formatCurrency(n)} loading={stats.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Pending" value={stats.data?.pending ?? 0} icon={Wallet} format={(n) => formatCurrency(n)} loading={stats.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Refunded" value={stats.data?.refunded ?? 0} icon={RefreshCcw} format={(n) => formatCurrency(n)} loading={stats.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Failed" value={stats.data?.failed ?? 0} icon={AlertTriangle} loading={stats.loading} />
        </StaggerItem>
      </Stagger>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference or user"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All statuses" },
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "refunded", label: "Refunded" },
              { value: "failed", label: "Failed" },
            ]}
            className="h-11 max-w-[180px] rounded-xl"
          />
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All types" },
              { value: "booking", label: "Booking" },
              { value: "fee", label: "Fee" },
              { value: "refund", label: "Refund" },
              { value: "payout", label: "Payout" },
            ]}
            className="h-11 max-w-[180px] rounded-xl"
          />
        </div>
      </FadeIn>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(p) => p.id}
        loading={loading}
        error={error}
        sortKey={sort.key}
        sortOrder={sort.order}
        onSort={(key, order) => setSort({ key, order })}
        empty={{ title: "No payments match" }}
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

      <ConfirmDialog
        open={!!refundTarget}
        onOpenChange={(v) => !v && setRefundTarget(null)}
        title="Refund this payment?"
        description="Refunds typically arrive within 5-10 business days."
        confirmLabel="Refund"
        loading={refund.loading}
        onConfirm={() => refund.mutate(refundTarget!)}
      />
    </div>
  );
}
