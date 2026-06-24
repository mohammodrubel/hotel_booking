"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { StatusPill } from "@/components/ui/status-pill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation } from "@/hooks";
import { reviewsService, bookingsService } from "@/services";
import type { ApiReview } from "@/services";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DraftReview {
  hotel_id: string;
  hotel_name: string;
  room_id?: string;
  booking_id?: string;
  rating: number;
  title: string;
  body: string;
  id?: string;
}

export default function UserReviewsPage() {
  const user = useAuthUser();
  const [editing, setEditing] = useState<DraftReview | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const myReviews = useQuery(
    () =>
      user
        ? reviewsService.list({ filters: { user_id: user.id }, limit: 100 })
        : Promise.resolve(null),
    [user?.id]
  );

  const completed = useQuery(
    () =>
      user
        ? bookingsService.list({
            filters: { guest_id: user.id, status: "completed" },
            limit: 100,
          })
        : Promise.resolve(null),
    [user?.id]
  );

  const reviewedBookingIds = new Set((myReviews.data?.data ?? []).map((r) => r.booking_id));
  const pendingReview = (completed.data?.data ?? []).filter((b) => !reviewedBookingIds.has(b.id));

  const submit = useMutation(
    async (draft: DraftReview) => {
      if (draft.id) {
        return reviewsService.update(draft.id, {
          rating: draft.rating,
          title: draft.title,
          body: draft.body,
        });
      }
      return reviewsService.create({
        hotel_id: draft.hotel_id,
        hotel_name: draft.hotel_name,
        room_id: draft.room_id,
        booking_id: draft.booking_id,
        user_id: user!.id,
        user_name: user!.name,
        user_avatar: user!.avatar ?? "",
        rating: draft.rating,
        title: draft.title,
        body: draft.body,
      });
    },
    {
      onSuccess: () => {
        toast.success("Review saved");
        setEditing(null);
        myReviews.refetch();
      },
    }
  );

  const removeMut = useMutation((id: string) => reviewsService.remove(id), {
    onSuccess: () => {
      toast.success("Review removed");
      myReviews.refetch();
    },
  });

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            My reviews
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reflections on the places you&apos;ve stayed.
          </p>
        </div>
      </FadeIn>

      {pendingReview.length > 0 && (
        <FadeIn delay={0.05}>
          <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-sm font-semibold text-foreground">
              Ready to review · {pendingReview.length}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingReview.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3"
                >
                  <img src={b.image} alt={b.hotel_name} className="h-12 w-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{b.hotel_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.room_name}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      setEditing({
                        hotel_id: b.hotel_id,
                        hotel_name: b.hotel_name,
                        room_id: b.room_id,
                        booking_id: b.id,
                        rating: 5,
                        title: "",
                        body: "",
                      })
                    }
                    className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
                  >
                    Write
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {myReviews.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : (myReviews.data?.data ?? []).length === 0 ? (
        <EmptyState
          icon={<Star className="size-7" />}
          title="No reviews yet"
          description="Once you complete a stay, leave a review here."
          action={
            <Link href="/dashboard/bookings">
              <Button className="rounded-xl">View bookings</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {(myReviews.data?.data ?? []).map((r: ApiReview) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">{r.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.hotel_name} · {formatDate(r.created_at)}
                    </p>
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
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                {r.reply && (
                  <div className="mt-4 rounded-2xl bg-secondary/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Reply from host
                    </p>
                    <p className="mt-1 text-sm text-foreground">{r.reply}</p>
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-xl"
                    onClick={() =>
                      setEditing({
                        id: r.id,
                        hotel_id: r.hotel_id,
                        hotel_name: r.hotel_name,
                        rating: r.rating,
                        title: r.title,
                        body: r.body,
                      })
                    }
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => setRemoveTarget(r.id)}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit review" : "Write a review"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">{editing.hotel_name}</p>
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditing({ ...editing, rating: i })}
                      className="p-0.5"
                    >
                      <Star
                        className={cn(
                          "size-6 transition-colors",
                          i <= editing.rating ? "fill-accent text-accent" : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Title</p>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">Your review</p>
                <Textarea
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  rows={5}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              onClick={() => editing && submit.mutate(editing)}
              disabled={submit.loading || !editing?.title || !editing?.body}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {submit.loading ? "Saving…" : editing?.id ? "Save changes" : "Post review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Delete this review?"
        description="This cannot be undone."
        destructive
        confirmLabel="Delete"
        loading={removeMut.loading}
        onConfirm={() => removeMut.mutate(removeTarget!)}
      />

      <FadeIn delay={0.1}>
        <div className="hidden">
          <Plus />
        </div>
      </FadeIn>
    </div>
  );
}
