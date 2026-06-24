"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion/Motion";
import { addHotel } from "@/redux/fetchers/hotels/hotelsSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { Hotel, Room } from "@/lib/mockData";
import { platformUsers } from "@/lib/mockData";
import { imageFor, localImages } from "@/lib/localImages";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AMENITY_OPTIONS = [
  "Free WiFi",
  "Pool",
  "Spa",
  "Gym",
  "Restaurant",
  "Bar",
  "Beach access",
  "Concierge",
  "Parking",
  "Airport shuttle",
  "Pet friendly",
  "Business center",
  "Rooftop terrace",
  "Sauna",
];

const BADGES: Hotel["badge"][] = ["Premium", "Top Rated", "Trending", "New"];

const ROOM_TYPES: Room["type"][] = [
  "standard",
  "deluxe",
  "suite",
  "penthouse",
];

interface DraftRoom {
  name: string;
  type: Room["type"];
  pricePerNight: number;
  capacity: number;
  beds: number;
  size: number;
  description: string;
}

const blankRoom = (basePrice: number): DraftRoom => ({
  name: "Standard Room",
  type: "standard",
  pricePerNight: basePrice,
  capacity: 2,
  beds: 1,
  size: 32,
  description: "Comfortable room with everything you need for a restful stay.",
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

const STEPS = ["Basics", "Media", "Rooms", "Review"] as const;
type StepIdx = 0 | 1 | 2 | 3;

const managerOptions = platformUsers.filter((u) => u.role === "manager");

export default function NewHotelPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<StepIdx>(0);
  const [submitting, setSubmitting] = useState(false);

  // basics
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState(250);
  const [rating, setRating] = useState(4.7);
  const [badge, setBadge] = useState<Hotel["badge"] | undefined>("New");
  const [ownerId, setOwnerId] = useState(managerOptions[0]?.id ?? "m-001");
  const [amenities, setAmenities] = useState<string[]>([
    "Free WiFi",
    "Pool",
    "Gym",
    "Restaurant",
  ]);

  // media
  const [image, setImage] = useState("");
  const [galleryRaw, setGalleryRaw] = useState("");

  // rooms
  const [rooms, setRooms] = useState<DraftRoom[]>([blankRoom(250)]);

  const slug = useMemo(() => slugify(name) || "new-hotel", [name]);
  const heroImage = useMemo(
    () => image || imageFor(slug),
    [image, slug]
  );
  const gallery = useMemo(() => {
    const items = galleryRaw
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length > 0) return items.slice(0, 5);
    const start = Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % localImages.length;
    return [0, 1, 2, 3, 4].map((i) => localImages[(start + i + 1) % localImages.length]!);
  }, [galleryRaw, slug]);

  const toggleAmenity = (a: string) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const addRoom = () =>
    setRooms((prev) => [
      ...prev,
      blankRoom(pricePerNight + prev.length * 120),
    ]);

  const updateRoom = (i: number, patch: Partial<DraftRoom>) =>
    setRooms((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const removeRoom = (i: number) =>
    setRooms((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const autoFill = () => {
    setName("Aurora Bay Resort");
    setCity("Reykjavík");
    setCountry("Iceland");
    setDescription(
      "Volcanic-stone lodge above the bay. Hot pools under the northern lights, a tasting menu of cold seafood, and a sauna sequence ending in the ocean."
    );
    setPricePerNight(420);
    setRating(4.8);
    setBadge("New");
    setAmenities([
      "Free WiFi",
      "Spa",
      "Restaurant",
      "Bar",
      "Sauna",
      "Concierge",
    ]);
    setRooms([
      {
        name: "Northern Standard",
        type: "standard",
        pricePerNight: 420,
        capacity: 2,
        beds: 1,
        size: 34,
        description: "Bay-facing room with heated stone floors.",
      },
      {
        name: "Aurora Suite",
        type: "suite",
        pricePerNight: 720,
        capacity: 3,
        beds: 1,
        size: 58,
        description: "Glass ceiling above the bed. Private hot pool on the deck.",
      },
    ]);
    toast.success("Draft filled");
  };

  const canNext: Record<StepIdx, boolean> = {
    0: name.trim().length >= 3 && city.trim().length > 0 && country.trim().length > 0,
    1: true,
    2: rooms.length > 0 && rooms.every((r) => r.name && r.pricePerNight > 0),
    3: true,
  };

  const nextStep = () => {
    if (!canNext[step]) {
      toast.error("Fill required fields first");
      return;
    }
    if (step < 3) setStep((step + 1) as StepIdx);
  };

  const prevStep = () => {
    if (step > 0) setStep((step - 1) as StepIdx);
  };

  const submit = async () => {
    if (!canNext[0] || !canNext[2]) {
      toast.error("Form incomplete");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const hotelId = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const builtRooms: Room[] = rooms.map((r, i) => ({
      id: `${hotelId}-room-${i + 1}`,
      hotelId,
      name: r.name,
      type: r.type,
      pricePerNight: r.pricePerNight,
      capacity: r.capacity,
      beds: r.beds,
      size: r.size,
      image: imageFor(`${hotelId}-room-${i}`),
      amenities: ["King bed", "Smart TV", "Workspace", "Air conditioning"].slice(
        0,
        4
      ),
      description: r.description,
    }));

    const hotel: Hotel = {
      id: hotelId,
      name: name.trim(),
      location: `${city.trim()}, ${country.trim()}`,
      city: city.trim(),
      country: country.trim(),
      description: description.trim(),
      rating,
      reviews: 0,
      pricePerNight,
      image: heroImage,
      gallery,
      amenities,
      badge,
      rooms: builtRooms,
    };

    dispatch(addHotel(hotel));
    toast.success(`${hotel.name} published`);
    setSubmitting(false);
    router.push("/dashboard/admin/hotels");
  };

  const StepDot = ({ i, label }: { i: StepIdx; label: string }) => {
    const active = step === i;
    const done = step > i;
    return (
      <button
        type="button"
        onClick={() => (done || active ? setStep(i) : null)}
        className="group flex items-center gap-2"
      >
        <motion.span
          animate={{
            scale: active ? 1 : 0.95,
            backgroundColor: done
              ? "var(--accent)"
              : active
                ? "var(--foreground)"
                : "var(--secondary)",
            color: done || active ? "var(--background)" : "var(--muted-foreground)",
          }}
          className="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold"
        >
          {done ? <Check className="size-3.5" /> : i + 1}
        </motion.span>
        <span
          className={cn(
            "hidden text-sm font-medium transition-colors sm:inline",
            active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <Link
          href="/dashboard/admin/hotels"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to hotels
        </Link>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              New hotel
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Publish a property to the platform.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={autoFill}
            className="gap-2 rounded-xl"
          >
            <Wand2 className="size-4" />
            Auto-fill demo
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <StepDot i={i as StepIdx} label={s} />
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl bg-card p-7 ring-1 ring-foreground/10"
            >
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Basics
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Identity, location, story.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="name">Hotel name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="The Emerald Grand"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Maafushi"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Maldives"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="One paragraph. What makes this stay worth choosing?"
                        rows={4}
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="price">Starting price per night ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        value={pricePerNight}
                        onChange={(e) =>
                          setPricePerNight(Number(e.target.value) || 0)
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rating">Initial rating (0–5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={rating}
                        onChange={(e) =>
                          setRating(Math.min(5, Math.max(0, Number(e.target.value))))
                        }
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Owner</Label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {managerOptions.map((m) => {
                          const active = ownerId === m.id;
                          return (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => setOwnerId(m.id)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                                active
                                  ? "border-foreground bg-secondary"
                                  : "border-border bg-card hover:border-foreground/40"
                              )}
                            >
                              <img
                                src={m.avatar}
                                alt={m.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {m.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {m.email}
                                </p>
                              </div>
                              {active && (
                                <Check className="ml-auto size-4 text-accent" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Badge</Label>
                      <div className="flex flex-wrap gap-2">
                        {[undefined, ...BADGES].map((b, i) => {
                          const active = badge === b;
                          const txt = b ?? "None";
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setBadge(b)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                active
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                              )}
                            >
                              {txt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Amenities</Label>
                      <div className="flex flex-wrap gap-2">
                        {AMENITY_OPTIONS.map((a) => {
                          const active = amenities.includes(a);
                          return (
                            <motion.button
                              key={a}
                              type="button"
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleAmenity(a)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                active
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                              )}
                            >
                              {active && <Check className="mr-1 inline size-3" />}
                              {a}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Media
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Hero shot + up to 5 gallery images. Leave blank for auto-generated.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="image">Hero image URL</Label>
                    <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gallery">Gallery URLs (one per line)</Label>
                    <textarea
                      id="gallery"
                      value={galleryRaw}
                      onChange={(e) => setGalleryRaw(e.target.value)}
                      placeholder="https://...\nhttps://..."
                      rows={5}
                      className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                  <div>
                    <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <ImageIcon className="size-3" />
                      Preview
                    </p>
                    <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
                      <div className="relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2">
                        <img
                          src={heroImage}
                          alt="hero"
                          className="h-full max-h-[300px] w-full object-cover"
                        />
                      </div>
                      {gallery.slice(0, 4).map((g, i) => (
                        <div
                          key={i}
                          className="overflow-hidden rounded-xl ring-1 ring-foreground/10"
                        >
                          <img src={g} alt={`g-${i}`} className="h-28 w-full object-cover md:h-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Rooms
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        At least one room. Guests book these directly.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addRoom}
                      className="gap-2 rounded-xl"
                    >
                      <Plus className="size-4" />
                      Add room
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {rooms.map((r, i) => (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="rounded-2xl bg-secondary/40 p-5"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              Room {i + 1}
                            </p>
                            {rooms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeRoom(i)}
                              >
                                <Trash2 className="size-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label>Room name</Label>
                              <Input
                                value={r.name}
                                onChange={(e) =>
                                  updateRoom(i, { name: e.target.value })
                                }
                                className="h-10 rounded-xl bg-background"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Type</Label>
                              <div className="flex flex-wrap gap-1">
                                {ROOM_TYPES.map((t) => {
                                  const active = r.type === t;
                                  return (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => updateRoom(i, { type: t })}
                                      className={cn(
                                        "rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                                        active
                                          ? "border-foreground bg-foreground text-background"
                                          : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                                      )}
                                    >
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label>Price / night ($)</Label>
                              <Input
                                type="number"
                                min={0}
                                value={r.pricePerNight}
                                onChange={(e) =>
                                  updateRoom(i, {
                                    pricePerNight: Number(e.target.value) || 0,
                                  })
                                }
                                className="h-10 rounded-xl bg-background"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Capacity</Label>
                              <Input
                                type="number"
                                min={1}
                                value={r.capacity}
                                onChange={(e) =>
                                  updateRoom(i, {
                                    capacity: Number(e.target.value) || 1,
                                  })
                                }
                                className="h-10 rounded-xl bg-background"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Beds</Label>
                              <Input
                                type="number"
                                min={1}
                                value={r.beds}
                                onChange={(e) =>
                                  updateRoom(i, {
                                    beds: Number(e.target.value) || 1,
                                  })
                                }
                                className="h-10 rounded-xl bg-background"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Size (m²)</Label>
                              <Input
                                type="number"
                                min={0}
                                value={r.size}
                                onChange={(e) =>
                                  updateRoom(i, {
                                    size: Number(e.target.value) || 0,
                                  })
                                }
                                className="h-10 rounded-xl bg-background"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label>Description</Label>
                              <Input
                                value={r.description}
                                onChange={(e) =>
                                  updateRoom(i, {
                                    description: e.target.value,
                                  })
                                }
                                className="h-10 rounded-xl bg-background"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Review
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Looks good? Publish to the platform.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={heroImage}
                        alt={name || "preview"}
                        className="h-full w-full object-cover"
                      />
                      {badge && (
                        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur hover:bg-background">
                          {badge}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3 p-5">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {name || "Untitled hotel"}
                        </p>
                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {city || "City"}, {country || "Country"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {description || "No description yet."}
                      </p>
                      <Separator className="bg-border" />
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="rounded-xl bg-secondary/40 p-2.5">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            From
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {formatCurrency(pricePerNight)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-secondary/40 p-2.5">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Rating
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {rating} / 5
                          </p>
                        </div>
                        <div className="rounded-xl bg-secondary/40 p-2.5">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Rooms
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {rooms.length}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Amenities
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {amenities.length === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              None selected.
                            </span>
                          ) : (
                            amenities.map((a) => (
                              <span
                                key={a}
                                className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                              >
                                {a}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Rooms
                        </p>
                        <div className="mt-2 space-y-2">
                          {rooms.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-xl bg-secondary/40 p-2.5"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {r.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground capitalize">
                                  {r.type} · {r.capacity} guests · {r.size} m²
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {formatCurrency(r.pricePerNight)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={step === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {step < 3 ? (
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex"
              >
                <Button
                  type="button"
                  onClick={nextStep}
                  className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </motion.span>
            ) : (
              <motion.span
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                className="inline-flex"
              >
                <Button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Publish hotel
                    </>
                  )}
                </Button>
              </motion.span>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            layout
            className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10"
          >
            <div className="relative h-32 overflow-hidden">
              <img src={heroImage} alt="preview" className="h-full w-full object-cover" />
              {badge && (
                <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur hover:bg-background">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="space-y-3 p-5">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {name || "Hotel name"}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />
                  {city || "City"}
                  {country ? `, ${country}` : ""}
                </p>
              </div>
              <Separator className="bg-border" />
              <div className="text-xs text-muted-foreground">
                <p>From {formatCurrency(pricePerNight)} / night</p>
                <p>{rooms.length} room{rooms.length === 1 ? "" : "s"}</p>
                <p>{amenities.length} amenities</p>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
