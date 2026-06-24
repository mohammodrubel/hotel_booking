"use client";

import Link from "next/link";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/Motion";
import {
  removeFromWishlist,
  useWishlistItems,
} from "@/redux/fetchers/wishlist/wishlistSlice";
import { useAppDispatch } from "@/redux/hooks";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function WishlistPage() {
  const items = useWishlistItems();
  const dispatch = useAppDispatch();

  const remove = (id: string) => {
    dispatch(removeFromWishlist(id));
    toast.success("Removed from wishlist");
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hotels you&apos;ve saved for later.
          </p>
        </div>
      </FadeIn>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl bg-card p-12 text-center ring-1 ring-foreground/10"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-accent"
            >
              <Heart className="size-7" />
            </motion.div>
            <p className="mt-5 text-base font-semibold text-foreground">
              Your wishlist is empty
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save your favorite stays for easy access later.
            </p>
            <Link href="/hotels" className="mt-5 inline-block">
              <Button size="lg" className="rounded-xl">
                Browse hotels
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -4 }}
                  className="group overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
                >
                  <Link href={`/hotels/${item.id}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </Link>
                  <div className="space-y-2 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/hotels/${item.id}`}>
                        <h3 className="font-heading text-base font-semibold text-foreground transition-colors hover:text-accent">
                          {item.name}
                        </h3>
                      </Link>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                        <Star className="size-3 fill-accent text-accent" />
                        {item.rating}
                      </span>
                    </div>
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {item.location}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          From
                        </p>
                        <p className="text-base font-semibold text-foreground">
                          {formatCurrency(item.pricePerNight)}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            /night
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(item.id)}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
