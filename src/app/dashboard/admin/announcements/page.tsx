"use client";

import { useState } from "react";
import { Megaphone, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/status-pill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation } from "@/hooks";
import { announcementsService } from "@/services";
import type { ApiAnnouncement } from "@/services";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

interface AnnDraft {
  id?: string;
  title: string;
  body: string;
  type: ApiAnnouncement["type"];
  audience: ApiAnnouncement["audience"];
  is_published: boolean;
}

export default function AdminAnnouncementsPage() {
  const user = useAuthUser();
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<AnnDraft | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(
    () => announcementsService.list({ page, limit: 10 }),
    [page]
  );

  const upsert = useMutation(
    async (d: AnnDraft) => {
      if (d.id) {
        return announcementsService.update(d.id, {
          title: d.title,
          body: d.body,
          type: d.type,
          audience: d.audience,
          is_published: d.is_published,
        });
      }
      return announcementsService.create({
        title: d.title,
        body: d.body,
        type: d.type,
        audience: d.audience,
        created_by: user?.id ?? "a-001",
        created_by_name: user?.name ?? "Admin",
        is_published: d.is_published,
      });
    },
    {
      onSuccess: () => {
        toast.success("Announcement saved");
        setDraft(null);
        refetch();
      },
    }
  );

  const togglePub = useMutation(
    (a: ApiAnnouncement) => a.is_published ? announcementsService.unpublish(a.id) : announcementsService.publish(a.id),
    { onSuccess: () => refetch() }
  );

  const removeMut = useMutation((id: string) => announcementsService.remove(id), {
    onSuccess: () => {
      toast.success("Removed");
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
              Announcements
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Platform-wide messages for users, managers, and staff.
            </p>
          </div>
          <Button
            onClick={() =>
              setDraft({
                title: "",
                body: "",
                type: "general",
                audience: "all",
                is_published: true,
              })
            }
            className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
          >
            <Plus className="size-4" /> New announcement
          </Button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Megaphone className="size-7" />} title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {rows.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-foreground">{a.title}</p>
                      <StatusPill value={a.type} />
                      <span className="text-xs text-muted-foreground capitalize">to {a.audience}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(a.created_at)} · by {a.created_by_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{a.is_published ? "Published" : "Draft"}</span>
                    <Switch checked={a.is_published} onCheckedChange={() => togglePub.mutate(a)} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDraft({
                          id: a.id,
                          title: a.title,
                          body: a.body,
                          type: a.type,
                          audience: a.audience,
                          is_published: a.is_published,
                        })
                      }
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setRemoveId(a.id)} aria-label="Delete">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{a.body}</p>
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

      <Dialog open={!!draft} onOpenChange={(v) => !v && setDraft(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit announcement" : "New announcement"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block">Title</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Body</Label>
                <Textarea
                  rows={5}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Type</Label>
                  <Select
                    value={draft.type}
                    onChange={(e) => setDraft({ ...draft, type: e.target.value as ApiAnnouncement["type"] })}
                    options={[
                      { value: "general", label: "General" },
                      { value: "maintenance", label: "Maintenance" },
                      { value: "meeting", label: "Meeting" },
                      { value: "alert", label: "Alert" },
                    ]}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">Audience</Label>
                  <Select
                    value={draft.audience}
                    onChange={(e) => setDraft({ ...draft, audience: e.target.value as ApiAnnouncement["audience"] })}
                    options={[
                      { value: "all", label: "Everyone" },
                      { value: "users", label: "Guests" },
                      { value: "managers", label: "Hotel managers" },
                      { value: "admins", label: "Admins" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3">
                <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />
                <span className="text-sm text-foreground">{draft.is_published ? "Publish immediately" : "Save as draft"}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              onClick={() => draft && upsert.mutate(draft)}
              disabled={upsert.loading || !draft?.title || !draft.body}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {upsert.loading ? "Saving…" : draft?.id ? "Save" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title="Delete announcement?"
        destructive
        confirmLabel="Delete"
        loading={removeMut.loading}
        onConfirm={() => removeMut.mutate(removeId!)}
      />

      <span hidden><Eye /><EyeOff /></span>
    </div>
  );
}
