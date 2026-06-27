"use client";

import Link from "next/link";
import { Heart, MapPin, Star, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  toggleWishlist,
  useIsWishlisted,
} from "@/redux/fetchers/wishlist/wishlistSlice";
import { useAppDispatch } from "@/redux/hooks";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Hotel } from "@/lib/mockData";
import { toast } from "sonner";

export default function HotelCard({
  hotel,
  index = 0,
}: {
  hotel: Hotel;
  index?: number;
}) {
  const dispatch = useAppDispatch();
  const wishlisted = useIsWishlisted(hotel.id);

  const onWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      toggleWishlist({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        image: hotel.image,
        pricePerNight: hotel.pricePerNight,
        rating: hotel.rating,
      })
    );
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.06, 0.36),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link href={`/hotels/${hotel.id}`} className="block">
        <article className="relative overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-all duration-500 group-hover:shadow-lift group-hover:ring-primary/40">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <motion.img
              src={hotel.image}
              alt={hotel.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/0 to-foreground/0 opacity-90" />

            <div className="absolute left-3 top-3 flex gap-1.5">
              {hotel.badge && (
                <Badge className="bg-background/95 text-foreground backdrop-blur hover:bg-background">
                  {hotel.badge}
                </Badge>
              )}
            </div>

            <motion.button
              onClick={onWishlist}
              whileTap={{ scale: 0.85 }}
              animate={
                wishlisted
                  ? { scale: [1, 1.25, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.35 }}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-background"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  wishlisted && "fill-accent text-accent"
                )}
              />
            </motion.button>

            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between text-background">
              <div className="flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                <Star className="size-3 fill-accent text-accent" />
                {hotel.rating}
                <span className="text-muted-foreground">
                  · {hotel.reviews}
                </span>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <Button
                  size="sm"
                  className="gap-1 rounded-full bg-background text-foreground hover:bg-background/90"
                >
                  View
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
                  {hotel.name}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {hotel.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  from
                </p>
                <p className="text-base font-semibold">
                  <span className="text-primary">{formatCurrency(hotel.pricePerNight)}</span>
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    /night
                  </span>
                </p>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
