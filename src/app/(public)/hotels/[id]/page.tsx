"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Star, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RoomCard from "@/components/site/RoomCard";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useHotelById } from "@/redux/fetchers/hotels/hotelsSlice";
import {
  toggleWishlist,
  useIsWishlisted,
} from "@/redux/fetchers/wishlist/wishlistSlice";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const hotel = useHotelById(id);
  const dispatch = useAppDispatch();
  const wishlisted = useIsWishlisted(id);
  const [activeImage, setActiveImage] = useState(0);

  if (!hotel) {
    return (
      <div className="container py-32 text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Hotel not found
        </h1>
        <Link href="/hotels" className="mt-6 inline-block">
          <Button variant="outline">Back to hotels</Button>
        </Link>
      </div>
    );
  }

  const gallery = [hotel.image, ...hotel.gallery];

  const onWishlist = () => {
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
    <div className="container py-10">
      <FadeIn>
        <Link
          href="/hotels"
          className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to hotels
        </Link>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              {hotel.badge && (
                <Badge className="bg-secondary text-foreground hover:bg-secondary">
                  {hotel.badge}
                </Badge>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                <Star className="size-3 fill-accent text-accent" />
                {hotel.rating}
                <span className="text-muted-foreground">
                  ({hotel.reviews} reviews)
                </span>
              </span>
            </div>
            <h1 className="mt-3 text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {hotel.name}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {hotel.location}
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              variant="outline"
              onClick={onWishlist}
              className="gap-2 rounded-xl"
            >
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  wishlisted && "fill-accent text-accent"
                )}
              />
              {wishlisted ? "Saved" : "Save"}
            </Button>
          </motion.div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-10 grid gap-3 md:grid-cols-4 md:grid-rows-2">
          <div className="relative overflow-hidden rounded-3xl md:col-span-2 md:row-span-2">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                src={gallery[activeImage]}
                alt={hotel.name}
                className="h-full max-h-[460px] w-full object-cover"
              />
            </AnimatePresence>
          </div>
          {gallery.slice(0, 4).map((g, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveImage(i)}
              className={cn(
                "relative overflow-hidden rounded-2xl ring-2 transition",
                activeImage === i ? "ring-accent" : "ring-transparent"
              )}
            >
              <img
                src={g}
                alt={`${hotel.name} ${i}`}
                className="h-32 w-full object-cover md:h-full"
              />
            </motion.button>
          ))}
        </div>
      </FadeIn>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          <FadeIn>
            <section>
              <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                About this stay
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {hotel.description}
              </p>
            </section>
          </FadeIn>

          <Separator className="bg-border" />

          <section>
            <FadeIn>
              <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Amenities
              </h2>
            </FadeIn>
            <Stagger
              className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
              stagger={0.05}
            >
              {hotel.amenities.map((a) => (
                <StaggerItem key={a}>
                  <div className="flex items-center gap-2.5 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
                    <Check className="size-4 text-accent" />
                    <span className="text-sm text-foreground">{a}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          <Separator className="bg-border" />

          <section>
            <FadeIn>
              <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Available rooms
              </h2>
            </FadeIn>
            <div className="mt-6 space-y-5">
              {hotel.rooms.map((r, i) => (
                <RoomCard key={r.id} room={r} index={i} />
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-hidden rounded-3xl bg-card p-6 ring-1 ring-foreground/10 shadow-soft"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              From
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-display text-4xl font-semibold text-foreground">
                ${hotel.pricePerNight}
              </span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
            <Separator className="my-5 bg-border" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Rating</span>
                <span className="font-medium text-foreground">
                  {hotel.rating} / 5
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Reviews</span>
                <span className="font-medium text-foreground">
                  {hotel.reviews}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Rooms</span>
                <span className="font-medium text-foreground">
                  {hotel.rooms.length}
                </span>
              </div>
            </div>
            <Link
              href={`/booking/${hotel.rooms[0]!.id}`}
              className="mt-6 block"
            >
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex w-full"
              >
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
                >
                  Book a room
                  <ArrowRight className="size-4" />
                </Button>
              </motion.span>
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free cancellation until 48h before check-in
            </p>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
