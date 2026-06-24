"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, MapPin, Search, Plus, Trash2, Sparkles, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FadeIn } from "@/components/motion/Motion";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { hotelsService } from "@/services";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "pending", label: "Pending" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

export default function AdminHotelsPage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const dq = useDebounced(q, 250);

  const { data, loading, refetch } = useQuery(
    () =>
      hotelsService.list({
        page,
        limit: 9,
        search: dq,
        filters: { status: tab === "all" ? undefined : tab },
      }),
    [page, dq, tab]
  );

  const approve = useMutation((id: string) => hotelsService.approve(id), {
    onSuccess: () => {
      toast.success("Hotel approved");
      refetch();
    },
  });
  const reject = useMutation((id: string) => hotelsService.reject(id), {
    onSuccess: () => {
      toast.success("Hotel rejected");
      refetch();
    },
  });
  const removeMut = useMutation((id: string) => hotelsService.remove(id), {
    onSuccess: () => {
      toast.success("Hotel removed");
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
              Hotels
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data?.meta.total ?? 0} properties on the platform.
            </p>
          </div>
          <Link href="/dashboard/admin/hotels/new">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex">
              <Button className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85">
                <Plus className="size-4" />
                Add hotel
              </Button>
            </motion.span>
          </Link>
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
              placeholder="Search hotel or location"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="admin-hotels-tabs" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No hotels match" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {rows.map((h, i) => (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.24), ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
                  <div className="absolute left-3 top-3">
                    <StatusPill value={h.status} />
                  </div>
                  {h.badge && (
                    <Badge className="absolute right-3 top-3 gap-1 bg-accent text-accent-foreground hover:bg-accent">
                      <Sparkles className="size-3" />
                      {h.badge}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <Link href={`/hotels/${h.id}`}>
                      <h3 className="font-heading text-base font-semibold text-foreground hover:text-accent">
                        {h.name}
                      </h3>
                    </Link>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {h.location}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-secondary/40 p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Owner</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{h.owner_id}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/40 p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Occupancy</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{h.occupancy}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">MRR</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(h.monthly_revenue)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {h.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => reject.mutate(h.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className={cn(
                              "gap-1 rounded-full bg-foreground text-background hover:bg-foreground/85"
                            )}
                            onClick={() => approve.mutate(h.id)}
                          >
                            <Check className="size-3.5" />
                            Approve
                          </Button>
                        </>
                      )}
                      {h.status !== "pending" && (
                        <>
                          <Link href={`/hotels/${h.id}`}>
                            <Button variant="outline" size="sm" className="rounded-full">
                              <Pencil className="size-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => setRemoveId(h.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
        title="Remove this hotel?"
        description="All rooms attached will also be removed."
        destructive
        confirmLabel="Remove"
        loading={removeMut.loading}
        onConfirm={() => removeMut.mutate(removeId!)}
      />
    </div>
  );
}
