"use client";

import { useState } from "react";
import { CreditCard, Download, ReceiptText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { KpiCard } from "@/components/ui/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useDebounced } from "@/hooks";
import { paymentsService } from "@/services";
import type { ApiPayment } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function UserPaymentsPage() {
  const user = useAuthUser();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({
    key: "created_at",
    order: "desc",
  });
  const dq = useDebounced(q, 250);

  const { data, loading, error, refetch } = useQuery(
    () =>
      paymentsService.list({
        page,
        limit: 10,
        search: dq,
        filters: { user_id: user?.id, status: status === "all" ? undefined : status },
        sort: sort.key,
        order: sort.order,
      }),
    [user?.id, dq, status, page, sort.key, sort.order]
  );

  const allPayments = useQuery(
    () =>
      user
        ? paymentsService.list({ filters: { user_id: user.id }, limit: 1000 })
        : Promise.resolve(null),
    [user?.id]
  );

  const totalPaid = (allPayments.data?.data ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const totalRefunded = (allPayments.data?.data ?? [])
    .filter((p) => p.status === "refunded")
    .reduce((s, p) => s + p.amount, 0);
  const txCount = allPayments.data?.meta.total ?? 0;

  const columns: Array<Column<ApiPayment>> = [
    {
      key: "reference",
      header: "Reference",
      sortable: true,
      sortAccessor: "reference",
      cell: (r) => (
        <div>
          <p className="font-mono text-xs text-foreground">{r.reference}</p>
          <p className="text-[11px] text-muted-foreground">#{r.id}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      sortAccessor: "type",
      cell: (r) => <span className="text-sm capitalize text-foreground">{r.type}</span>,
    },
    {
      key: "method",
      header: "Method",
      cell: (r) => <span className="text-sm capitalize text-muted-foreground">{r.method.replace(/_/g, " ")}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      sortAccessor: "amount",
      align: "right",
      cell: (r) => <span className="font-semibold text-foreground">{formatCurrency(r.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: "status",
      cell: (r) => <StatusPill value={r.status} />,
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      sortAccessor: "created_at",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>,
    },
    {
      key: "actions",
      header: "",
      width: "minmax(0, 0.5fr)",
      align: "right",
      cell: () => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-lg"
          onClick={() => toast.success("Receipt downloaded")}
        >
          <Download className="size-3.5" /> PDF
        </Button>
      ),
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
            <p className="mt-2 text-sm text-muted-foreground">Transactions and receipts.</p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Export started")}>
            <Download className="size-4" /> Export
          </Button>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <KpiCard label="Lifetime paid" value={totalPaid} icon={CreditCard} format={(n) => formatCurrency(n)} loading={allPayments.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Refunded" value={totalRefunded} icon={ReceiptText} format={(n) => formatCurrency(n)} loading={allPayments.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Transactions" value={txCount} icon={ReceiptText} loading={allPayments.loading} />
        </StaggerItem>
      </Stagger>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search reference"
            className="h-11 max-w-md rounded-xl"
          />
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
            className="h-11 max-w-xs rounded-xl"
          />
        </div>
      </FadeIn>

      {!loading && (data?.data ?? []).length === 0 ? (
        <EmptyState
          icon={<CreditCard className="size-7" />}
          title="No payments yet"
          description="Your transactions will appear here once you complete a booking."
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.data ?? []}
            rowKey={(r) => r.id}
            loading={loading}
            error={error}
            sortKey={sort.key}
            sortOrder={sort.order}
            onSort={(key, order) => setSort({ key, order })}
            empty={{ title: "No payments found" }}
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
        </>
      )}
      <button hidden onClick={refetch} />
    </div>
  );
}
