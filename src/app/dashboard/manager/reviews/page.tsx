"use client";

import { useState } from "react";
import { Star, MessageSquare, Flag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { KpiCard } from "@/components/ui/kpi-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { reviewsService } from "@/services";
import type { ApiReview } from "@/services";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

const TABS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "pending", label: "Pending" },
  { id: "flagged", label: "Flagged" },
];

export default function ManagerReviewsPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q, 250);
  const [replyTarget, setReplyTarget] = useState<ApiReview | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const { data, loading, refetch } = useQuery(
    () =>
      reviewsService.list({
        page,
        limit: 8,
        search: dq,
        filters: { owner_id: ownerId, status: tab === "all" ? undefined : tab },
      }),
    [ownerId, page, dq, tab]
  );

  const all = useQuery(
    () => reviewsService.list({ filters: { owner_id: ownerId, status: "published" }, limit: 500 }),
    [ownerId]
  );

  const replyMut = useMutation(({ id, reply }: { id: string; reply: string }) => reviewsService.reply(id, reply), {
    onSuccess: () => {
      toast.success("Reply posted");
      setReplyTarget(null);
      setReplyDraft("");
      refetch();
    },
  });

  const flagMut = useMutation((id: string) => reviewsService.flag(id), {
    onSuccess: () => {
      toast.success("Review flagged for review");
      refetch();
    },
  });

  const rows = data?.data ?? [];
  const allRev = all.data?.data ?? [];
  const avg = allRev.length ? (allRev.reduce((s, r) => s + r.rating, 0) / allRev.length) : 0;
  const fiveStar = allRev.filter((r) => r.rating === 5).length;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Reviews
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Listen, respond, and grow your reputation.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <KpiCard label="Average rating" value={Number(avg.toFixed(2))} icon={Star} loading={all.loading} format={(n) => `${n.toFixed(1)} / 5`} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="5-star reviews" value={fiveStar} icon={Star} loading={all.loading} />
        </StaggerItem>
        <StaggerItem>
          <KpiCard label="Total reviews" value={all.data?.meta.total ?? 0} icon={Star} loading={all.loading} />
        </StaggerItem>
      </Stagger>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by guest or hotel"
            className="h-11 max-w-md rounded-xl"
          />
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="mgr-rev-tabs" />
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
              {r.reply && (
                <div className="mt-4 rounded-2xl bg-secondary/40 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Your reply</p>
                  <p className="mt-1 text-sm text-foreground">{r.reply}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {!r.reply && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={() => {
                      setReplyTarget(r);
                      setReplyDraft("");
                    }}
                  >
                    <MessageSquare className="size-3.5" /> Reply
                  </Button>
                )}
                {r.status !== "flagged" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    onClick={() => flagMut.mutate(r.id)}
                  >
                    <Flag className="size-3.5" /> Flag
                  </Button>
                )}
                {r.status === "flagged" && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/10 px-3 py-1.5 text-xs text-amber-700">
                    <CheckCircle2 className="size-3.5" /> Awaiting admin review
                  </span>
                )}
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

      <Dialog open={!!replyTarget} onOpenChange={(v) => !v && setReplyTarget(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Reply to {replyTarget?.user_name}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            rows={5}
            placeholder="Thanks for your kind words…"
            className="rounded-xl"
          />
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              onClick={() => replyTarget && replyMut.mutate({ id: replyTarget.id, reply: replyDraft })}
              disabled={!replyDraft.trim() || replyMut.loading}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {replyMut.loading ? "Posting…" : "Post reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
