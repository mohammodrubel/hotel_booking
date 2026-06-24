"use client";

import Link from "next/link";
import { ArrowUpRight, Globe, Send, Share2 } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Motion";

const COLUMNS = [
  {
    title: "Explore",
    items: [
      { href: "/hotels", label: "All hotels" },
      { href: "/hotels?sort=rating", label: "Top rated" },
      { href: "/hotels?sort=price", label: "Deals" },
      { href: "/hotels?destination=trending", label: "Destinations" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/bookings", label: "My bookings" },
      { href: "/dashboard/wishlist", label: "Wishlist" },
      { href: "/dashboard/profile", label: "Profile" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "#", label: "About" },
      { href: "#", label: "Press" },
      { href: "#", label: "Careers" },
      { href: "#", label: "Contact" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-secondary/40">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-60" />
      <div className="container pt-16 pb-8">
        <FadeIn>
          <div className="flex flex-col items-start gap-6 pb-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h3 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Quiet rooms. <span className="text-accent">Loud sunsets.</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Join the newsletter for hand-picked stays, member-only rates,
                and one good travel essay a month.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-5 shadow-soft"
            >
              <input
                type="email"
                placeholder="you@somewhere.com"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="group inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-transform hover:scale-[1.03]"
              >
                Subscribe
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </form>
          </div>
        </FadeIn>

        <Stagger className="grid gap-10 border-t border-border pt-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <StaggerItem>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background">
                <span className="text-sm font-bold">S</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Stay<span className="text-accent">haus</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Curated stays from the world&apos;s finest hotels. Booking made
              effortless.
            </p>
            <div className="mt-5 flex gap-2">
              {[Globe, Send, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-accent hover:text-accent hover:-translate-y-0.5"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </StaggerItem>

          {COLUMNS.map((col) => (
            <StaggerItem key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link
                      href={it.href}
                      className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      <span className="relative">
                        {it.label}
                        <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100 origin-left" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Stayhaus. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
