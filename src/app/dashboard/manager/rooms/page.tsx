"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, Users, Maximize, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { StatusPill } from "@/components/ui/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useQuery, useMutation } from "@/hooks";
import { hotelsService, roomsService } from "@/services";
import type { ApiRoom } from "@/services";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function resolveOwnerId(user: ReturnType<typeof useAuthUser>): string {
  if (!user) return "m-001";
  if (user.id === "m-001" || user.id === "m-002") return user.id;
  return "m-001";
}

interface RoomDraft {
  id?: string;
  hotel_id: string;
  name: string;
  type: ApiRoom["type"];
  price_per_night: number;
  capacity: number;
  beds: number;
  size: number;
  description: string;
}

export default function ManagerRoomsPage() {
  const user = useAuthUser();
  const ownerId = resolveOwnerId(user);
  const [draft, setDraft] = useState<RoomDraft | null>(null);

  const hotels = useQuery(
    () => hotelsService.list({ filters: { owner_id: ownerId }, limit: 50 }),
    [ownerId]
  );
  const rooms = useQuery(
    () => roomsService.list(undefined, { limit: 200 }),
    [ownerId, hotels.data?.meta.total]
  );

  const upsert = useMutation(
    async (d: RoomDraft) => {
      if (d.id) {
        return roomsService.update(d.id, {
          name: d.name,
          type: d.type,
          price_per_night: d.price_per_night,
          capacity: d.capacity,
          beds: d.beds,
          size: d.size,
          description: d.description,
        });
      }
      return roomsService.create({
        hotel_id: d.hotel_id,
        name: d.name,
        type: d.type,
        price_per_night: d.price_per_night,
        capacity: d.capacity,
        beds: d.beds,
        size: d.size,
        image: "/images/pexels-bed-1846251.jpg",
        amenities: ["Air conditioning", "Smart TV", "Workspace"],
        description: d.description,
        status: "available",
      });
    },
    {
      onSuccess: () => {
        toast.success("Room saved");
        setDraft(null);
        rooms.refetch();
      },
    }
  );

  const toggleVisibility = useMutation(
    async (r: ApiRoom) =>
      r.status === "hidden" ? roomsService.show(r.id) : roomsService.hide(r.id),
    {
      onSuccess: (_, r) => {
        toast.success(r.status === "hidden" ? "Room is visible" : "Room hidden");
        rooms.refetch();
      },
    }
  );

  const ownerHotels = hotels.data?.data ?? [];

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Rooms
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Inventory across {ownerHotels.length} {ownerHotels.length === 1 ? "property" : "properties"}.
            </p>
          </div>
          <Button
            disabled={ownerHotels.length === 0}
            onClick={() =>
              setDraft({
                hotel_id: ownerHotels[0]?.id ?? "",
                name: "Garden Room",
                type: "standard",
                price_per_night: 220,
                capacity: 2,
                beds: 1,
                size: 32,
                description: "New room",
              })
            }
            className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
          >
            <Plus className="size-4" />
            Add room
          </Button>
        </div>
      </FadeIn>

      {hotels.loading || rooms.loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-3xl" />
          ))}
        </div>
      ) : ownerHotels.length === 0 ? (
        <EmptyState title="No properties yet" description="Ask an admin to assign you a hotel." />
      ) : (
        ownerHotels.map((hotel, hi) => {
          const hotelRooms = (rooms.data?.data ?? []).filter((r) => r.hotel_id === hotel.id);
          return (
            <FadeIn key={hotel.id} delay={hi * 0.05}>
              <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
                  <div className="flex items-center gap-3">
                    <img src={hotel.image} alt={hotel.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-base font-semibold text-foreground">{hotel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hotel.location} · {hotelRooms.length} rooms
                      </p>
                    </div>
                  </div>
                  <StatusPill value={hotel.status} />
                </div>

                {hotelRooms.length === 0 ? (
                  <EmptyState
                    title="No rooms here yet"
                    action={
                      <Button
                        onClick={() =>
                          setDraft({
                            hotel_id: hotel.id,
                            name: "New room",
                            type: "standard",
                            price_per_night: 220,
                            capacity: 2,
                            beds: 1,
                            size: 32,
                            description: "",
                          })
                        }
                        className="rounded-xl"
                      >
                        Add room
                      </Button>
                    }
                    className="mt-5 border-0 bg-transparent"
                  />
                ) : (
                  <Stagger className="mt-5 grid gap-4 md:grid-cols-2" stagger={0.05}>
                    {hotelRooms.map((r) => (
                      <StaggerItem key={r.id}>
                        <motion.div
                          whileHover={{ y: -3 }}
                          className={cn(
                            "overflow-hidden rounded-2xl bg-secondary/30 ring-1 ring-foreground/10",
                            r.status === "hidden" && "opacity-60"
                          )}
                        >
                          <div className="grid grid-cols-[120px_1fr]">
                            <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                            <div className="flex flex-col gap-2 p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <Badge className="bg-background text-foreground hover:bg-background capitalize">
                                      {r.type}
                                    </Badge>
                                    <StatusPill value={r.status} />
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatCurrency(r.price_per_night)}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Users className="size-3" /> {r.capacity}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <BedDouble className="size-3" /> {r.beds}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Maximize className="size-3" /> {r.size} m²
                                </span>
                              </div>
                              <div className="mt-auto flex gap-2 pt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 rounded-full"
                                  onClick={() =>
                                    setDraft({
                                      id: r.id,
                                      hotel_id: r.hotel_id,
                                      name: r.name,
                                      type: r.type,
                                      price_per_night: r.price_per_night,
                                      capacity: r.capacity,
                                      beds: r.beds,
                                      size: r.size,
                                      description: r.description,
                                    })
                                  }
                                >
                                  <Pencil className="size-3" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 rounded-full text-muted-foreground"
                                  onClick={() => toggleVisibility.mutate(r)}
                                >
                                  {r.status === "hidden" ? (
                                    <>
                                      <Eye className="size-3" /> Show
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="size-3" /> Hide
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}
              </section>
            </FadeIn>
          );
        })
      )}

      <Dialog open={!!draft} onOpenChange={(v) => !v && setDraft(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit room" : "Add room"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Property</Label>
                <Select
                  value={draft.hotel_id}
                  onChange={(e) => setDraft({ ...draft, hotel_id: e.target.value })}
                  disabled={!!draft.id}
                  options={ownerHotels.map((h) => ({ value: h.id, label: h.name }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Type</Label>
                <Select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as ApiRoom["type"] })}
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "deluxe", label: "Deluxe" },
                    { value: "suite", label: "Suite" },
                    { value: "penthouse", label: "Penthouse" },
                  ]}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Price / night ($)</Label>
                <Input
                  type="number"
                  value={draft.price_per_night}
                  onChange={(e) => setDraft({ ...draft, price_per_night: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Capacity</Label>
                <Input
                  type="number"
                  value={draft.capacity}
                  onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Beds</Label>
                <Input
                  type="number"
                  value={draft.beds}
                  onChange={(e) => setDraft({ ...draft, beds: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Size (m²)</Label>
                <Input
                  type="number"
                  value={draft.size}
                  onChange={(e) => setDraft({ ...draft, size: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Description</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button
              disabled={upsert.loading || !draft?.name}
              onClick={() => draft && upsert.mutate(draft)}
              className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
            >
              {upsert.loading ? "Saving…" : draft?.id ? "Save changes" : "Add room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
