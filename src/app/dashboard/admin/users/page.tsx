"use client";

import { useState } from "react";
import { Search, ShieldCheck, Briefcase, User as UserIcon, MoreVertical, Pause, Play, Trash2, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { Avatar } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FadeIn } from "@/components/motion/Motion";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { usersService } from "@/services";
import type { ApiUser } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

const TABS = [
  { id: "all", label: "All" },
  { id: "user", label: "Guests" },
  { id: "manager", label: "Managers" },
  { id: "admin", label: "Admins" },
];

const ROLE_ICON: Record<ApiUser["role"], typeof UserIcon> = {
  admin: ShieldCheck,
  manager: Briefcase,
  user: UserIcon,
};

export default function AdminUsersPage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({ key: "joined_at", order: "desc" });
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [detail, setDetail] = useState<ApiUser | null>(null);
  const dq = useDebounced(q, 250);

  const { data, loading, error, refetch } = useQuery(
    () =>
      usersService.list({
        page,
        limit: 10,
        search: dq,
        filters: { role: tab === "all" ? undefined : tab },
        sort: sort.key,
        order: sort.order,
      }),
    [page, dq, tab, sort.key, sort.order]
  );

  const suspend = useMutation((id: string) => usersService.suspend(id), {
    onSuccess: () => {
      toast.success("User suspended");
      refetch();
    },
  });
  const activate = useMutation((id: string) => usersService.activate(id), {
    onSuccess: () => {
      toast.success("User activated");
      refetch();
    },
  });
  const verifyKyc = useMutation((id: string) => usersService.verifyKyc(id), {
    onSuccess: () => {
      toast.success("KYC verified");
      refetch();
    },
  });
  const removeMut = useMutation((id: string) => usersService.remove(id), {
    onSuccess: () => {
      toast.success("User removed");
      refetch();
    },
  });

  const columns: Array<Column<ApiUser>> = [
    {
      key: "full_name",
      header: "User",
      sortable: true,
      sortAccessor: "full_name",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar src={u.avatar} alt={u.full_name} size="md" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{u.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      sortAccessor: "role",
      cell: (u) => {
        const Icon = ROLE_ICON[u.role];
        return (
          <Badge className="capitalize bg-secondary text-foreground hover:bg-secondary">
            <Icon className="size-3" />
            {u.role}
          </Badge>
        );
      },
    },
    {
      key: "joined_at",
      header: "Joined",
      sortable: true,
      sortAccessor: "joined_at",
      cell: (u) => <span className="text-xs text-muted-foreground">{formatDate(u.joined_at)}</span>,
    },
    {
      key: "bookings_count",
      header: "Bookings",
      sortable: true,
      sortAccessor: "bookings_count",
      align: "right",
      cell: (u) => <span className="text-foreground">{u.bookings_count}</span>,
    },
    {
      key: "total_spend",
      header: "Spend",
      sortable: true,
      sortAccessor: "total_spend",
      align: "right",
      cell: (u) => <span className="font-medium text-foreground">{formatCurrency(u.total_spend)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortAccessor: "status",
      cell: (u) => <StatusPill value={u.status} />,
    },
    {
      key: "actions",
      header: "",
      width: "minmax(0, 0.4fr)",
      align: "right",
      cell: (u) => (
        <Popover>
          <PopoverTrigger
            render={(props) => (
              <Button {...props} variant="ghost" size="icon" aria-label="Actions">
                <MoreVertical className="size-4" />
              </Button>
            )}
          />
          <PopoverContent align="end" className="w-52 p-1">
            <button
              type="button"
              onClick={() => setDetail(u)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <UserIcon className="size-3.5" />
              View profile
            </button>
            {u.kyc_status !== "verified" && (
              <button
                type="button"
                onClick={() => verifyKyc.mutate(u.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                <BadgeCheck className="size-3.5" /> Verify KYC
              </button>
            )}
            {u.status === "active" ? (
              <button
                type="button"
                onClick={() => suspend.mutate(u.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                <Pause className="size-3.5" /> Suspend
              </button>
            ) : (
              <button
                type="button"
                onClick={() => activate.mutate(u.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary"
              >
                <Play className="size-3.5" /> Activate
              </button>
            )}
            <button
              type="button"
              onClick={() => setRemoveTarget(u.id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </PopoverContent>
        </Popover>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Users
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data?.meta.total ?? 0} accounts on the platform.
          </p>
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
              placeholder="Search name or email"
              className="h-11 rounded-xl pl-10"
            />
          </div>
          <Tabs items={TABS} value={tab} onChange={(id) => { setTab(id); setPage(1); }} layoutId="admin-users-tabs" />
        </div>
      </FadeIn>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(u) => u.id}
        loading={loading}
        error={error}
        sortKey={sort.key}
        sortOrder={sort.order}
        onSort={(key, order) => setSort({ key, order })}
        empty={{ title: "No users match your filters" }}
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
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Delete this user?"
        description="This is irreversible. Bookings and reviews remain in history."
        destructive
        confirmLabel="Delete user"
        loading={removeMut.loading}
        onConfirm={() => removeMut.mutate(removeTarget!)}
      />

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{detail?.full_name}</DialogTitle>
            <DialogDescription>{detail?.email}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar src={detail.avatar} alt={detail.full_name} size="lg" />
                <div>
                  <Badge className="capitalize bg-secondary text-foreground hover:bg-secondary">
                    {detail.role}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">Joined {formatDate(detail.joined_at)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{detail.phone ?? "—"}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusPill value={detail.status} />
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">KYC</p>
                  <StatusPill value={detail.kyc_status} />
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">2FA</p>
                  <p className="font-medium text-foreground">{detail.two_factor_enabled ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="font-medium text-foreground">{detail.bookings_count}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-xs text-muted-foreground">Lifetime spend</p>
                  <p className="font-medium text-foreground">{formatCurrency(detail.total_spend)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
