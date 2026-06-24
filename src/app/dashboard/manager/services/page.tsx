"use client";

import { useState } from "react";
import { Wrench, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { serviceRequestsService } from "@/services";
import type { ApiServiceRequest } from "@/services";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

const TABS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
];

export default function ManagerServicesPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q, 250);

  const { data, loading, refetch } = useQuery(
    () =>
      serviceRequestsService.list({
        page,
        limit: 10,
        search: dq,
        filters: { owner_id: ownerId, status: tab === "all" ? undefined : tab, priority: priority === "all" ? undefined : priority },
      }),
    [ownerId, page, dq, tab, priority]
  );

  const setStatus = useMutation(
    ({ id, status }: { id: string; status: ApiServiceRequest["status"] }) =>
      serviceRequestsService.setStatus(id, status),
    {
      onSuccess: (_, { status }) => {
        toast.success(`Marked ${status.replace(/_/g, " ")}`);
        refetch();
      },
    }
  );

  const rows = data?.data ?? [];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Service desk
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track and resolve guest requests.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search requester or hotel"
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <Select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All priority" },
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              className="h-11 max-w-[180px] rounded-xl"
            />
          </div>
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="mgr-services-tabs" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Wrench className="size-7" />} title="No service requests" description="Inbox zero. Looking good." />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar src={`https://i.pravatar.cc/100?u=${r.requester_id}`} alt={r.requester_name} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground capitalize">{r.category}</p>
                      <StatusPill value={r.priority} />
                      <StatusPill value={r.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.requester_name} · {r.hotel_name} {r.room_name ? `· ${r.room_name}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-foreground">{r.description}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">Opened {formatDate(r.created_at)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status !== "in_progress" && r.status !== "done" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => setStatus.mutate({ id: r.id, status: "in_progress" })}
                    >
                      Start
                    </Button>
                  )}
                  {r.status !== "done" && (
                    <Button
                      size="sm"
                      className="rounded-lg bg-foreground text-background hover:bg-foreground/85"
                      onClick={() => setStatus.mutate({ id: r.id, status: "done" })}
                    >
                      Mark done
                    </Button>
                  )}
                  {r.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg text-destructive hover:bg-destructive/10"
                      onClick={() => setStatus.mutate({ id: r.id, status: "cancelled" })}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
    </div>
  );
}
