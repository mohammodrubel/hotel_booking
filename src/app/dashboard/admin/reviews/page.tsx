"use client";

import { useState } from "react";
import { Star, Check, X, Flag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FadeIn } from "@/components/motion/Motion";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { reviewsService } from "@/services";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "pending", label: "Pending" },
  { id: "flagged", label: "Flagged" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminReviewsPage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q, 250);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(
    () =>
      reviewsService.list({
        page,
        limit: 8,
        search: dq,
        filters: { status: tab === "all" ? undefined : tab },
      }),
    [tab, dq, page]
  );

  const approve = useMutation((id: string) => reviewsService.approve(id), {
    onSuccess: () => { toast.success("Review approved"); refetch(); },
  });
  const reject = useMutation((id: string) => reviewsService.reject(id), {
    onSuccess: () => { toast.success("Review rejected"); refetch(); },
  });
  const flag = useMutation((id: string) => reviewsService.flag(id), {
    onSuccess: () => { toast.success("Review flagged"); refetch(); },
  });
  const remove = useMutation((id: string) => reviewsService.remove(id), {
    onSuccess: () => { toast.success("Review removed"); refetch(); },
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Reviews
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Moderate guest feedback across the platform.</p>
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
            placeholder="Search user, hotel, content"
            className="h-11 max-w-md rounded-xl"
          />
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="admin-rev-tabs" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Star className="size-7" />} title="No reviews match" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar src={r.user_avatar} alt={r.user_name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.user_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.hotel_name} · {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill value={r.status} />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn("size-3.5", i <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/30")}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">{r.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {r.status !== "published" && (
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => approve.mutate(r.id)}>
                    <Check className="size-3.5" /> Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => reject.mutate(r.id)}>
                    <X className="size-3.5" /> Reject
                  </Button>
                )}
                {r.status !== "flagged" && (
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => flag.mutate(r.id)}>
                    <Flag className="size-3.5" /> Flag
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setRemoveId(r.id)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
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

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title="Delete this review?"
        destructive
        confirmLabel="Delete"
        loading={remove.loading}
        onConfirm={() => remove.mutate(removeId!)}
      />
    </div>
  );
}
