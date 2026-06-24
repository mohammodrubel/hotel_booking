"use client";

import { useState } from "react";
import { Search, FileDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { FadeIn } from "@/components/motion/Motion";
import { useQuery, useDebounced } from "@/hooks";
import { auditService } from "@/services";
import type { ApiAuditLog } from "@/services";
import { toast } from "sonner";

export default function AdminAuditPage() {
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("all");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q, 250);

  const { data, loading, error } = useQuery(
    () =>
      auditService.list({
        page,
        limit: 15,
        search: dq,
        filters: {
          entity: entity === "all" ? undefined : entity,
          action: action === "all" ? undefined : action,
        },
      }),
    [page, dq, entity, action]
  );

  const columns: Array<Column<ApiAuditLog>> = [
    {
      key: "user",
      header: "Actor",
      cell: (a) => (
        <div className="flex items-center gap-2">
          <Avatar src={`https://i.pravatar.cc/100?u=${a.user_id}`} alt={a.user_name} size="sm" />
          <span className="text-sm text-foreground">{a.user_name}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      cell: (a) => (
        <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-foreground">
          {a.action}
        </span>
      ),
    },
    {
      key: "entity",
      header: "Entity",
      cell: (a) => <span className="text-sm capitalize text-muted-foreground">{a.entity}</span>,
    },
    {
      key: "entity_id",
      header: "Entity ID",
      cell: (a) => <span className="font-mono text-xs text-muted-foreground">{a.entity_id ?? "—"}</span>,
    },
    {
      key: "ip",
      header: "IP",
      cell: (a) => <span className="font-mono text-xs text-muted-foreground">{a.ip}</span>,
    },
    {
      key: "created_at",
      header: "When",
      cell: (a) => <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Audit log
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every sensitive action on the platform.
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Export started")}>
            <FileDown className="size-4" /> Export
          </Button>
        </div>
      </FadeIn>

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
              placeholder="Search user, action, IP"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <Select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All entities" },
              { value: "User", label: "User" },
              { value: "Hotel", label: "Hotel" },
              { value: "Booking", label: "Booking" },
              { value: "Payment", label: "Payment" },
              { value: "Review", label: "Review" },
            ]}
            className="h-11 max-w-[180px] rounded-xl"
          />
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All actions" },
              { value: "user.", label: "User" },
              { value: "hotel.", label: "Hotel" },
              { value: "booking.", label: "Booking" },
              { value: "payment.", label: "Payment" },
              { value: "review.", label: "Review" },
            ]}
            className="h-11 max-w-[180px] rounded-xl"
          />
        </div>
      </FadeIn>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(a) => a.id}
        loading={loading}
        error={error}
        empty={{ title: "No audit entries", description: "Actions will appear here as they happen." }}
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

      <button hidden>
        <History />
      </button>
    </div>
  );
}
