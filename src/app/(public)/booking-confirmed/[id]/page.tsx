"use client";

import { use } from "react";
import Link from "next/link";
import { Check, CalendarCheck, Mail, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";
import { useQuery } from "@/hooks";
import { bookingsService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/format";

export default function BookingConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: booking, loading } = useQuery(() => bookingsService.get(id), [id]);

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden px-6 py-20 text-center">
      <div className="relative mx-auto h-24 w-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          className="grid h-full w-full place-items-center rounded-full bg-accent text-accent-foreground shadow-lift"
        >
          <motion.span
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 280 }}
          >
            <Check className="size-12" strokeWidth={3} />
          </motion.span>
        </motion.div>
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.6],
              x: Math.cos((i / 8) * Math.PI * 2) * 70,
              y: Math.sin((i / 8) * Math.PI * 2) * 70,
            }}
            transition={{ duration: 1.2, delay: 0.6 + i * 0.04 }}
            className="absolute left-1/2 top-1/2 -ml-1 -mt-1"
          >
            <Sparkles className="size-3 text-accent" />
          </motion.span>
        ))}
      </div>

      <FadeIn delay={0.6}>
        <h1 className="mt-8 text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Your stay is booked
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Confirmation{" "}
          <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-foreground">
            #{id.toUpperCase()}
          </span>{" "}
          · we&apos;ve sent the details to your inbox.
        </p>
      </FadeIn>

      <FadeIn delay={0.8}>
        <div className="mt-10 rounded-3xl bg-card p-7 text-left ring-1 ring-foreground/10 shadow-soft">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : booking ? (
            <>
              <div className="flex items-center gap-3">
                <img src={booking.image} alt={booking.hotel_name} className="h-16 w-16 rounded-xl object-cover" />
                <div>
                  <p className="text-base font-semibold text-foreground">{booking.hotel_name}</p>
                  <p className="text-xs text-muted-foreground">{booking.room_name}</p>
                </div>
              </div>
              <Separator className="my-5 bg-border" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Check in</p>
                  <p className="font-medium text-foreground">{formatDate(booking.check_in)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check out</p>
                  <p className="font-medium text-foreground">{formatDate(booking.check_out)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guests</p>
                  <p className="font-medium text-foreground">{booking.guests}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-foreground">{formatCurrency(booking.total)}</p>
                </div>
              </div>
            </>
          ) : null}
          <Separator className="my-5 bg-border" />
          <Stagger className="space-y-5" stagger={0.1}>
            <StaggerItem>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                  <CalendarCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">What happens next</p>
                  <p className="text-sm text-muted-foreground">You&apos;ll receive a check-in guide 48 hours before arrival.</p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Receipt by email</p>
                  <p className="text-sm text-muted-foreground">Open your confirmation email to download or share your booking.</p>
                </div>
              </div>
            </StaggerItem>
            {booking && (
              <StaggerItem>
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Getting there</p>
                    <Link href={`/hotels/${booking.hotel_id}`} className="text-sm text-accent">
                      View hotel directions →
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            )}
          </Stagger>
        </div>
      </FadeIn>

      <FadeIn delay={1.0}>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard/bookings">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex">
              <Button size="lg" className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85">
                View my bookings
                <ArrowRight className="size-4" />
              </Button>
            </motion.span>
          </Link>
          <Link href="/hotels">
            <Button variant="outline" size="lg" className="rounded-xl">Continue browsing</Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
