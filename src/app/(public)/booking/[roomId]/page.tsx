"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion/Motion";
import { useGetRoom } from "@/redux/fetchers/hotels/hotelsSlice";
import { formatCurrency, nightsBetween, todayPlus } from "@/lib/format";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart } from "@/redux/fetchers/cart/cartSlice";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { toast } from "sonner";

export default function BookingPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const found = useGetRoom(roomId);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAuthUser();

  useEffect(() => {
    if (!user) {
      const redirect = encodeURIComponent(`/booking/${roomId}`);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [user, roomId, router]);

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Redirecting to sign in…
        </div>
      </div>
    );
  }

  const [checkIn, setCheckIn] = useState(todayPlus(7));
  const [checkOut, setCheckOut] = useState(todayPlus(10));
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut]
  );

  if (!found) {
    return (
      <div className="container py-32 text-center">
        <h1 className="text-3xl font-semibold text-foreground">
          Room not found
        </h1>
        <Link href="/hotels" className="mt-6 inline-block">
          <Button variant="outline">Browse hotels</Button>
        </Link>
      </div>
    );
  }

  const { hotel, room } = found;
  const subtotal = room.pricePerNight * nights;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const addCart = () => {
    dispatch(
      addToCart({
        id: `${room.id}-${Date.now()}`,
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomId: room.id,
        roomName: room.name,
        image: room.image,
        pricePerNight: room.pricePerNight,
        nights,
        checkIn,
        checkOut,
        guests,
      })
    );
    toast.success("Added to cart");
  };

  const checkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please enter your name and email");
      return;
    }
    addCart();
    router.push("/checkout");
  };

  return (
    <div className="container py-10">
      <FadeIn>
        <Link
          href={`/hotels/${hotel.id}`}
          className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to {hotel.name}
        </Link>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Reserve your stay
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {room.name} · {hotel.name}
        </p>
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={checkout} className="space-y-6">
          <FadeIn delay={0.1}>
            <section className="rounded-3xl bg-card p-7 ring-1 ring-foreground/10">
              <h2 className="text-lg font-semibold text-foreground">
                Trip details
              </h2>
              <p className="text-sm text-muted-foreground">
                Dates and guests for your reservation.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="checkIn">Check in</Label>
                  <DatePicker
                    id="checkIn"
                    value={checkIn}
                    onChange={setCheckIn}
                    placeholder="Pick a date"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkOut">Check out</Label>
                  <DatePicker
                    id="checkOut"
                    value={checkOut}
                    onChange={setCheckOut}
                    placeholder="Pick a date"
                    minDate={checkIn ? new Date(checkIn) : undefined}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Maximum {room.capacity} guests for this room.
              </p>
            </section>
          </FadeIn>

          <FadeIn delay={0.15}>
            <section className="rounded-3xl bg-card p-7 ring-1 ring-foreground/10">
              <h2 className="text-lg font-semibold text-foreground">
                Guest information
              </h2>
              <p className="text-sm text-muted-foreground">
                Used for confirmation and check-in.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={addCart}
              >
                <ShoppingBag className="size-4" />
                Add to cart
              </Button>
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="sm:ml-auto inline-flex"
              >
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
                >
                  Continue to checkout
                  <ArrowRight className="size-4" />
                </Button>
              </motion.span>
            </div>
          </FadeIn>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 shadow-soft"
          >
            <img
              src={room.image}
              alt={room.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {room.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hotel.location}
                  </p>
                </div>
                <Badge className="bg-secondary text-foreground hover:bg-secondary capitalize">
                  {room.type}
                </Badge>
              </div>

              <Separator className="my-5 bg-border" />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {formatCurrency(room.pricePerNight)} × {nights} night
                    {nights > 1 ? "s" : ""}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes & fees</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(taxes)}
                  </span>
                </div>
              </div>

              <Separator className="my-5 bg-border" />

              <motion.div
                key={total}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-semibold text-foreground">
                  Total
                </span>
                <span className="text-2xl font-semibold text-foreground">
                  {formatCurrency(total)}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
