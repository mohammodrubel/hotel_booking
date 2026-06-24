"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import HotelCard from "@/components/site/HotelCard";
import { FadeIn } from "@/components/motion/Motion";
import { useAllHotels } from "@/redux/fetchers/hotels/hotelsSlice";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "price", label: "Price · low to high" },
  { id: "rating", label: "Top rated" },
  { id: "reviews", label: "Most reviewed" },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]["id"];

export default function HotelsPage() {
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortId>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hotels = useAllHotels();

  const items = useMemo(() => {
    let list = hotels.filter((h) => {
      if (q) {
        const hay = (h.name + h.location + h.country + h.city).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (minPrice && h.pricePerNight < Number(minPrice)) return false;
      if (maxPrice && h.pricePerNight > Number(maxPrice)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price") return a.pricePerNight - b.pricePerNight;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "reviews") return b.reviews - a.reviews;
      return 0;
    });

    return list;
  }, [hotels, q, minPrice, maxPrice, sort]);

  const reset = () => {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setSort("recommended");
  };

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search" className="text-muted-foreground">
          Search
        </Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hotel or city"
            className="h-10 rounded-xl pl-9"
          />
        </div>
      </div>

      <Separator className="bg-border" />

      <div>
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-3.5" />
          Price per night
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10 rounded-xl"
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      <Separator className="bg-border" />

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Sort by</p>
        <div className="flex flex-col gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={cn(
                "group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                sort === opt.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <span>{opt.label}</span>
              <input
                type="radio"
                name="sort"
                value={opt.id}
                checked={sort === opt.id}
                onChange={() => setSort(opt.id)}
                className="size-3.5 accent-[color:var(--accent)]"
              />
            </label>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full rounded-xl" onClick={reset}>
        Reset filters
      </Button>
    </div>
  );

  return (
    <div className="container py-12">
      <FadeIn>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Browse hotels
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{items.length}</span>{" "}
              stays match your criteria
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-xl lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-3xl bg-card p-6 ring-1 ring-foreground/10 lg:block lg:sticky lg:top-24 lg:self-start">
          {Filters}
        </aside>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setFiltersOpen(false)}
            >
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="h-full w-[85%] max-w-sm overflow-y-auto bg-background p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-base font-semibold">Filters</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFiltersOpen(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                {Filters}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="col-span-full rounded-3xl border border-dashed border-border bg-card p-16 text-center"
              >
                <p className="text-base font-semibold text-foreground">
                  No hotels found
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try widening your filters or searching another destination.
                </p>
                <Button onClick={reset} className="mt-5 rounded-xl">
                  Reset filters
                </Button>
              </motion.div>
            ) : (
              items.map((h, i) => (
                <motion.div
                  key={h.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <HotelCard hotel={h} index={i} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
