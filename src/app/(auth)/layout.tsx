"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/images/manuelajaeger-hotel-1749602.jpg"
          alt="Stayhaus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/85 via-foreground/55 to-foreground/30" />

        <div className="relative flex h-full flex-col justify-between p-12 text-background">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-background text-foreground">
                <span className="text-sm font-bold">S</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Stay<span className="text-accent">haus</span>
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="size-3 text-accent" />
              Curated stays · 96 countries
            </div>
            <p className="mt-6 text-3xl font-semibold leading-snug">
              &ldquo;Booked the Emerald Grand in 90 seconds. Lit a candle.
              Sunset arrived right on schedule.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/80?u=mia"
                alt="Mia R."
                className="h-10 w-10 rounded-full object-cover ring-2 ring-background/30"
              />
              <div>
                <p className="text-sm font-medium">Mia R.</p>
                <div className="flex items-center gap-0.5 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-3 fill-accent" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
