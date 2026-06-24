"use client";

import { useState } from "react";
import { Wallet, Plus, Trash2, Pencil, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { KpiCard } from "@/components/ui/kpi-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation, useDebounced } from "@/hooks";
import { expensesService, hotelsService } from "@/services";
import type { ApiExpense } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

const CATEGORIES = ["Maintenance", "Staff payroll", "Marketing", "Utilities", "Supplies", "Other"];

interface ExpenseDraft {
  id?: string;
  hotel_id: string;
  hotel_name: string;
  category: string;
  amount: number;
  year: number;
  month: number;
  note: string;
}

export default function ManagerExpensesPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" }>({
    key: "created_at",
    order: "desc",
  });
  const [draft, setDraft] = useState<ExpenseDraft | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const dq = useDebounced(q, 250);

  const hotels = useQuery(() => hotelsService.list({ filters: { owner_id: ownerId }, limit: 50 }), [ownerId]);
  const totals = useQuery(() => expensesService.totals(ownerId), [ownerId]);

  const { data, loading, error, refetch } = useQuery(
    () =>
      expensesService.list({
        page,
        limit: 10,
        search: dq,
        filters: { owner_id: ownerId, category: category === "all" ? undefined : category },
        sort: sort.key,
        order: sort.order,
      }),
    [ownerId, page, dq, category, sort.key, sort.order]
  );

  const upsert = useMutation(
    async (d: ExpenseDraft) => {
      if (d.id) {
        return expensesService.update(d.id, {
          hotel_id: d.hotel_id,
          hotel_name: d.hotel_name,
          category: d.category,
          amount: d.amount,
          year: d.year,
          month: d.month,
          note: d.note,
        });
      }
      return expensesService.create({
        hotel_id: d.hotel_id,
        hotel_name: d.hotel_name,
        category: d.category,
        amount: d.amount,
        year: d.year,
        month: d.month,
        note: d.note,
      });
    },
    {
      onSuccess: () => {
        toast.success("Expense saved");
        setDraft(null);
        refetch();
        totals.refetch();
      },
    }
  );

  const removeMut = useMutation((id: string) => expensesService.remove(id), {
    onSuccess: () => {
      toast.success("Expense removed");
      refetch();
      totals.refetch();
    },
  });

  const columns: Array<Column<ApiExpense>> = [
    { key: "category", header: "Category", sortable: true, sortAccessor: "category", cell: (r) => <span className="font-medium text-foreground">{r.category}</span> },
    { key: "hotel_name", header: "Property", sortable: true, sortAccessor: "hotel_name", cell: (r) => <span className="text-muted-foreground">{r.hotel_name}</span> },
    { key: "amount", header: "Amount", sortable: true, sortAccessor: "amount", align: "right", cell: (r) => <span className="font-semibold text-foreground">{formatCurrency(r.amount)}</span> },
    { key: "note", header: "Note", cell: (r) => <span className="truncate text-xs text-muted-foreground">{r.note ?? "—"}</span> },
    { key: "created_at", header: "Date", sortable: true, sortAccessor: "created_at", cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span> },
    {
      key: "actions",
      header: "",
      width: "minmax(0, 0.6fr)",
      align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setDraft({
                id: r.id,
                hotel_id: r.hotel_id,
                hotel_name: r.hotel_name,
                category: r.category,
                amount: r.amount,
                year: r.year,
                month: r.month,
                note: r.note ?? "",
              })
            }
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRemoveId(r.id)}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const cur = new Date();

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Expenses
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Operating costs across your properties.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => toast.success("Export started")}>
              <FileDown className="size-4" /> Export
            </Button>
            <Button
              onClick={() =>
                setDraft({
                  hotel_id: hotels.data?.data[0]?.id ?? "",
                  hotel_name: hotels.data?.data[0]?.name ?? "",
                  category: "Maintenance",
                  amount: 0,
                  year: cur.getFullYear(),
                  month: cur.getMonth() + 1,
                  note: "",
                })
              }
              className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              <Plus className="size-4" /> Add expense
            </Button>
          </div>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <KpiCard
            label="Total this month"
            value={totals.data?.total ?? 0}
            icon={Wallet}
            format={(n) => formatCurrency(n)}
            loading={totals.loading}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Categories"
            value={Object.keys(totals.data?.by_category ?? {}).length}
            icon={Wallet}
            loading={totals.loading}
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            label="Entries"
            value={data?.meta.total ?? 0}
            icon={Wallet}
            loading={loading}
          />
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
            placeholder="Search note or property"
            className="h-11 max-w-md rounded-xl"
          />
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All categories" },
              ...CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
            className="h-11 max-w-xs rounded-xl"
          />
        </div>
      </FadeIn>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        sortKey={sort.key}
        sortOrder={sort.order}
        onSort={(key, order) => setSort({ key, order })}
        empty={{ title: "No expenses recorded", description: "Add one to start tracking spend." }}
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

      <Dialog open={!!draft} onOpenChange={(v) => !v && setDraft(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit expense" : "Add expense"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Property</Label>
                <Select
                  value={draft.hotel_id}
                  onChange={(e) => {
                    const h = hotels.data?.data.find((x) => x.id === e.target.value);
                    setDraft({ ...draft, hotel_id: e.target.value, hotel_name: h?.name ?? "" });
                  }}
                  options={(hotels.data?.data ?? []).map((h) => ({ value: h.id, label: h.name }))}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <Select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Amount ($)</Label>
                <Input
                  type="number"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Month</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={draft.month}
                  onChange={(e) => setDraft({ ...draft, month: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Year</Label>
                <Input
                  type="number"
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Note</Label>
                <Input
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              onClick={() => draft && upsert.mutate(draft)}
              disabled={upsert.loading || !draft?.hotel_id || !draft.amount}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {upsert.loading ? "Saving…" : draft?.id ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeId}
        onOpenChange={(v) => !v && setRemoveId(null)}
        title="Delete this expense?"
        destructive
        confirmLabel="Delete"
        loading={removeMut.loading}
        onConfirm={() => removeMut.mutate(removeId!)}
      />
    </div>
  );
}
