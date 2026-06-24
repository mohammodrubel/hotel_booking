"use client";

import { useState } from "react";
import { Tag, Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation } from "@/hooks";
import { hotelsService, pricingService } from "@/services";
import type { ApiPricingRule } from "@/services";
import { toast } from "sonner";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

interface RuleDraft extends Omit<ApiPricingRule, "id"> {
  id?: string;
}

export default function ManagerPricingPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const hotels = useQuery(() => hotelsService.list({ filters: { owner_id: ownerId }, limit: 50 }), [ownerId]);
  const ownerHotelIds = new Set((hotels.data?.data ?? []).map((h) => h.id));
  const rules = useQuery(() => pricingService.list(), [ownerHotelIds.size]);
  const filteredRules = (rules.data ?? []).filter((r) => ownerHotelIds.has(r.hotel_id));

  const upsert = useMutation(
    async (d: RuleDraft) => {
      if (d.id) {
        return pricingService.update(d.id, d);
      }
      return pricingService.create(d);
    },
    {
      onSuccess: () => {
        toast.success("Rule saved");
        setDraft(null);
        rules.refetch();
      },
    }
  );

  const removeMut = useMutation((id: string) => pricingService.remove(id), {
    onSuccess: () => {
      toast.success("Rule removed");
      rules.refetch();
    },
  });

  const toggle = useMutation((id: string) => pricingService.toggle(id), {
    onSuccess: () => rules.refetch(),
  });

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Pricing rules
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust nightly rates by season, weekend, or stay length.
            </p>
          </div>
          <Button
            onClick={() =>
              setDraft({
                hotel_id: hotels.data?.data[0]?.id ?? "",
                name: "New rule",
                type: "seasonal",
                adjustment_percent: 10,
                active: true,
              })
            }
            disabled={(hotels.data?.data ?? []).length === 0}
            className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
          >
            <Plus className="size-4" /> Add rule
          </Button>
        </div>
      </FadeIn>

      {rules.loading || hotels.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <EmptyState
          icon={<Tag className="size-7" />}
          title="No pricing rules yet"
          description="Add a seasonal uplift or weekend premium to boost yield."
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredRules.map((r) => {
              const hotel = hotels.data?.data.find((h) => h.id === r.hotel_id);
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl bg-card p-5 ring-1 ring-foreground/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-accent">
                        <Tag className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hotel?.name ?? "—"} · {r.type.replace(/_/g, " ")} ·{" "}
                          {r.adjustment_percent > 0 ? "+" : ""}
                          {r.adjustment_percent}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{r.active ? "Active" : "Paused"}</span>
                      <Switch checked={r.active} onCheckedChange={() => toggle.mutate(r.id)} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDraft({
                            id: r.id,
                            hotel_id: r.hotel_id,
                            name: r.name,
                            type: r.type,
                            adjustment_percent: r.adjustment_percent,
                            start_date: r.start_date,
                            end_date: r.end_date,
                            active: r.active,
                          })
                        }
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveId(r.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {(r.start_date || r.end_date) && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {r.start_date && `From ${r.start_date}`} {r.end_date && `· Until ${r.end_date}`}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(v) => !v && setDraft(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit rule" : "Add pricing rule"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Property</Label>
                <Select
                  value={draft.hotel_id}
                  onChange={(e) => setDraft({ ...draft, hotel_id: e.target.value })}
                  options={(hotels.data?.data ?? []).map((h) => ({ value: h.id, label: h.name }))}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Type</Label>
                <Select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as ApiPricingRule["type"] })}
                  options={[
                    { value: "seasonal", label: "Seasonal" },
                    { value: "weekend", label: "Weekend" },
                    { value: "discount", label: "Discount" },
                    { value: "long_stay", label: "Long stay" },
                  ]}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Adjustment %</Label>
                <Input
                  type="number"
                  value={draft.adjustment_percent}
                  onChange={(e) => setDraft({ ...draft, adjustment_percent: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Active</Label>
                <div className="flex h-11 items-center">
                  <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Start date</Label>
                <Input
                  type="date"
                  value={draft.start_date ?? ""}
                  onChange={(e) => setDraft({ ...draft, start_date: e.target.value || undefined })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">End date</Label>
                <Input
                  type="date"
                  value={draft.end_date ?? ""}
                  onChange={(e) => setDraft({ ...draft, end_date: e.target.value || undefined })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              onClick={() => draft && upsert.mutate(draft)}
              disabled={upsert.loading || !draft?.name}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {upsert.loading ? "Saving…" : draft?.id ? "Save" : "Add rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title="Delete this rule?"
        destructive
        confirmLabel="Delete"
        loading={removeMut.loading}
        onConfirm={() => removeMut.mutate(removeId!)}
      />
    </div>
  );
}
