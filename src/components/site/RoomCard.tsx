"use client";

import Link from "next/link";
import { Bed, Maximize, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Room } from "@/lib/mockData";

export default function RoomCard({
  room,
  index = 0,
}: {
  room: Room;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3 }}
      className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
    >
      <div className="grid gap-0 md:grid-cols-[280px_1fr]">
        <div className="relative h-56 overflow-hidden md:h-full">
          <motion.img
            src={room.image}
            alt={room.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur hover:bg-background capitalize">
            {room.type}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {room.name}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {room.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
              <Users className="size-3" />
              Up to {room.capacity}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
              <Bed className="size-3" />
              {room.beds} bed{room.beds > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
              <Maximize className="size-3" />
              {room.size} m²
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 5).map((a) => (
              <span
                key={a}
                className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Per night
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(room.pricePerNight)}
              </p>
            </div>
            <Link href={`/booking/${room.id}`}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex"
              >
                <Button className="gap-1.5 bg-foreground text-background hover:bg-foreground/85">
                  Book this room
                  <ArrowRight className="size-3.5" />
                </Button>
              </motion.span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
