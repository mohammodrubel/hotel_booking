"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HelpCircle, Mail, Phone, Plus, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FadeIn } from "@/components/motion/Motion";
import { Label } from "@/components/ui/label";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation } from "@/hooks";
import { serviceRequestsService } from "@/services";
import type { ApiServiceRequest } from "@/services";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FAQ = [
  { q: "How do I cancel a booking?", a: "Open the booking from your dashboard and click Cancel. Free cancellation until 48 hours before check-in." },
  { q: "Can I change my check-in dates?", a: "Yes — message the hotel directly via the Messages page. Most properties allow date changes subject to availability." },
  { q: "Where can I download my receipts?", a: "Go to Payments → click PDF on the relevant transaction." },
  { q: "How do refunds work?", a: "Refunds typically arrive within 5-10 business days, depending on your bank or card issuer." },
  { q: "Is my payment information secure?", a: "Yes. We use industry-standard encryption and never store full card numbers on our servers." },
];

export default function SupportPage() {
  const user = useAuthUser();
  const [open, setOpen] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticket, setTicket] = useState({ category: "concierge", priority: "medium", description: "" });

  const tickets = useQuery(
    () =>
      user
        ? serviceRequestsService.list({ filters: { requester_id: user.id }, limit: 50 })
        : Promise.resolve(null),
    [user?.id]
  );

  const createTicket = useMutation(
    async () => {
      if (!user) throw new Error("Not signed in");
      return serviceRequestsService.create({
        hotel_id: "platform",
        hotel_name: "Platform support",
        requester_id: user.id,
        requester_name: user.name,
        category: ticket.category as ApiServiceRequest["category"],
        priority: ticket.priority as ApiServiceRequest["priority"],
        description: ticket.description,
      });
    },
    {
      onSuccess: () => {
        toast.success("Ticket submitted");
        setTicketOpen(false);
        setTicket({ category: "concierge", priority: "medium", description: "" });
        tickets.refetch();
      },
    }
  );

  const filteredFaq = useMemo(
    () => FAQ.filter((f) => (search ? (f.q + f.a).toLowerCase().includes(search.toLowerCase()) : true)),
    [search]
  );

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/40 blob" />
          <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs">
            <HelpCircle className="size-3 text-accent" />
            Help center
          </div>
          <h1 className="mt-4 text-display text-4xl font-semibold tracking-tight md:text-5xl">
            How can we help?
          </h1>
          <p className="mt-2 max-w-lg text-base text-background/70">
            Browse FAQs, message a hotel, or open a ticket with our concierge.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-background/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the help center"
              className="h-12 rounded-2xl border-background/20 bg-background/10 pl-11 text-background placeholder:text-background/60"
            />
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href="mailto:support@stayhaus.app" className="group rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-soft">
          <Mail className="size-5 text-accent" />
          <p className="mt-3 text-sm font-semibold text-foreground">Email support</p>
          <p className="mt-1 text-xs text-muted-foreground">support@stayhaus.app · 24h response.</p>
        </a>
        <a href="tel:+18005550100" className="group rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-soft">
          <Phone className="size-5 text-accent" />
          <p className="mt-3 text-sm font-semibold text-foreground">Call concierge</p>
          <p className="mt-1 text-xs text-muted-foreground">+1 (800) 555-0100 · 24/7.</p>
        </a>
      </div>

      <FadeIn delay={0.1}>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold text-foreground">Frequently asked questions</h2>
          <div className="mt-4 space-y-2">
            {filteredFaq.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matches.</p>
            ) : (
              filteredFaq.map((f, i) => (
                <div key={f.q} className="overflow-hidden rounded-2xl bg-secondary/40">
                  <button
                    type="button"
                    onClick={() => setOpen(open === i ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground"
                  >
                    <span>{f.q}</span>
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open === i && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Your tickets</h2>
            <Button onClick={() => setTicketOpen(true)} className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85">
              <Plus className="size-4" /> New ticket
            </Button>
          </div>
          <div className="mt-4">
            {tickets.loading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : (tickets.data?.data ?? []).length === 0 ? (
              <EmptyState
                title="No tickets yet"
                description="Open a ticket if you need a hand."
                className="border-0 bg-transparent"
              />
            ) : (
              <div className="space-y-2">
                {(tickets.data?.data ?? []).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {t.category}
                        </p>
                        <StatusPill value={t.priority} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Opened {formatDate(t.created_at)} · #{t.id}
                      </p>
                    </div>
                    <StatusPill value={t.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Open a support ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Category</Label>
              <Select
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                options={[
                  { value: "concierge", label: "Concierge" },
                  { value: "billing", label: "Billing" },
                  { value: "maintenance", label: "Technical" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Priority</Label>
              <Select
                value={ticket.priority}
                onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Textarea
                rows={5}
                value={ticket.description}
                onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                placeholder="Describe the issue in detail"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              onClick={() => createTicket.mutate(undefined)}
              disabled={createTicket.loading || !ticket.description.trim()}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {createTicket.loading ? "Submitting…" : "Submit ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
