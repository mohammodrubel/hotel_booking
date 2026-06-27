"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Headphones,
  Star,
  ArrowRight,
  MapPin,
  Heart,
  Compass,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HotelCard from "@/components/site/HotelCard";
import {
  FadeIn,
  RevealText,
  Stagger,
  StaggerItem,
  AnimatedCounter,
  Tilt,
  ScrollProgress,
} from "@/components/motion/Motion";
import { destinations } from "@/lib/mockData";
import { todayPlus } from "@/lib/format";
import { useAllHotels } from "@/redux/fetchers/hotels/hotelsSlice";
import { useHomepage, type PerkItem } from "@/redux/fetchers/cms/cmsSlice";

const PERK_ICONS: Record<PerkItem["icon"], typeof Sparkles> = {
  sparkles: Sparkles,
  shield: ShieldCheck,
  headphones: Headphones,
  heart: Heart,
  compass: Compass,
  globe: Globe,
};

export default function Home() {
  const router = useRouter();
  const cms = useHomepage();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(todayPlus(7));
  const [checkOut, setCheckOut] = useState(todayPlus(10));
  const [guests, setGuests] = useState(2);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (destination) q.set("q", destination);
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);
    q.set("guests", String(guests));
    router.push(`/hotels?${q.toString()}`);
  };

  const hotels = useAllHotels();
  const featured = hotels.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollProgress />
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-20 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-40" />

        <div className="container relative grid items-center gap-12 pt-16 pb-12 md:pt-24 md:pb-20 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT — copy + search */}
          <div className="relative">
            <FadeIn delay={0.1}>
              <Badge className="gap-1.5 border border-primary/20 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {cms.hero.badge}
              </Badge>
            </FadeIn>

            <h1 className="mt-6 text-display text-5xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              <RevealText>{cms.hero.titleLine1}</RevealText>
              <br />
              <RevealText delay={0.15}>{cms.hero.titleLine2}</RevealText>{" "}
              <span className="text-primary">{cms.hero.titleAccent}</span>
            </h1>

            <FadeIn delay={0.5}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {cms.hero.subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.7}>
              <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {cms.hero.socialProofAvatars.map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/64?img=${i}`}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-background object-cover ring-1 ring-border"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-3.5 fill-primary text-primary" />
                  ))}
                  <span className="ml-1 font-medium text-foreground">
                    {cms.hero.socialProofText}
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT — image mosaic */}
          <FadeIn delay={0.3}>
            <div className="relative mx-auto grid h-[480px] w-full max-w-[560px] grid-cols-6 grid-rows-6 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative col-span-4 row-span-4 overflow-hidden rounded-3xl shadow-lift"
              >
                <img
                  src="/images/manuelajaeger-hotel-1749602.jpg"
                  alt="Featured stay"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-background">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-background/80">
                      Featured
                    </p>
                    <p className="font-heading text-lg font-semibold">
                      Emerald Grand
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold text-foreground">
                    <Star className="size-3 fill-primary text-primary" />
                    4.9
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl shadow-soft"
              >
                <img
                  src="/images/tianya1223-hotel-6878057.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative col-span-2 row-span-3 overflow-hidden rounded-3xl shadow-soft"
              >
                <img
                  src="/images/4787421-interior-2685521.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="relative col-span-4 row-span-2 overflow-hidden rounded-3xl shadow-soft"
              >
                <img
                  src="/images/erikawittlieb-living-room-2155376.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>

              {/* floating stat pills */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="float-y-slow absolute -left-6 top-10 flex items-center gap-3 rounded-2xl bg-card p-3 pr-4 shadow-lift ring-1 ring-border"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Free cancel</p>
                  <p className="text-sm font-semibold text-foreground">
                    Up to 24h
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.05 }}
                className="float-y absolute -right-4 bottom-10 flex items-center gap-3 rounded-2xl bg-card p-3 pr-4 shadow-lift ring-1 ring-border"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trusted by</p>
                  <p className="text-sm font-semibold text-foreground">
                    12,000+ guests
                  </p>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        {/* SEARCH CARD — full width below */}
        <div className="container relative -mt-2 pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <Tilt max={2}>
              <form
                onSubmit={onSearch}
                className="relative rounded-3xl bg-card p-2 shadow-lift ring-1 ring-border"
              >
                <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]">
                  <div className="group flex flex-col gap-1 rounded-2xl px-4 py-3 transition-colors hover:bg-secondary/40 focus-within:bg-secondary/40">
                    <Label htmlFor="dest" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Where to
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-0 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="dest"
                        placeholder="Paris, Bali, NYC"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="h-7 border-0 bg-transparent pl-5 px-0 text-base font-medium focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 rounded-2xl px-4 py-3 transition-colors hover:bg-secondary/40 focus-within:bg-secondary/40">
                    <Label htmlFor="checkin" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Check in
                    </Label>
                    <DatePicker
                      id="checkin"
                      value={checkIn}
                      onChange={setCheckIn}
                      variant="ghost"
                      placeholder="Add date"
                      format="MMM d"
                    />
                  </div>
                  <div className="flex flex-col gap-1 rounded-2xl px-4 py-3 transition-colors hover:bg-secondary/40 focus-within:bg-secondary/40">
                    <Label htmlFor="checkout" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Check out
                    </Label>
                    <DatePicker
                      id="checkout"
                      value={checkOut}
                      onChange={setCheckOut}
                      variant="ghost"
                      placeholder="Add date"
                      format="MMM d"
                      minDate={checkIn ? new Date(checkIn) : undefined}
                    />
                  </div>
                  <div className="flex flex-col gap-1 rounded-2xl px-4 py-3 transition-colors hover:bg-secondary/40 focus-within:bg-secondary/40">
                    <Label htmlFor="guests" className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Guests
                    </Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="h-7 border-0 bg-transparent px-0 text-sm font-medium focus-visible:ring-0"
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center"
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="h-full w-full gap-2 rounded-2xl bg-primary px-6 text-primary-foreground shadow-lift hover:bg-primary/90 md:min-h-14"
                    >
                      <Search className="size-4" />
                      Search
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Tilt>
          </motion.div>

          {/* TRUST LOGOS */}
          {cms.trustLogos.length > 0 && (
            <FadeIn delay={0.9}>
              <div className="mt-16 overflow-hidden">
                <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Trusted and featured by
                </p>
                <div
                  className="mt-5 flex overflow-hidden mask-fade-b"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
                  }}
                >
                  <div className="marquee-track flex shrink-0 items-center gap-12 pr-12">
                    {[...cms.trustLogos, ...cms.trustLogos].map((logo, i) => (
                      <span
                        key={i}
                        className="whitespace-nowrap font-heading text-lg font-medium text-muted-foreground/70"
                      >
                        {logo}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-border bg-card/40">
        <div className="container py-12">
          <Stagger className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {cms.stats.map((s) => (
              <StaggerItem key={s.label}>
                <div>
                  <p className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                    <AnimatedCounter
                      value={s.value}
                      format={(n) =>
                        s.decimals
                          ? n.toFixed(s.decimals)
                          : new Intl.NumberFormat("en-US").format(n)
                      }
                    />
                    <span className="text-accent">{s.suffix}</span>
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* FEATURED HOTELS */}
      <section className="container py-20 md:py-28">
        <FadeIn>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border border-border bg-secondary text-foreground hover:bg-secondary">
                {cms.featured.badge}
              </Badge>
              <h2 className="mt-3 text-balance text-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {cms.featured.title}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
                {cms.featured.subtitle}
              </p>
            </div>
            <Link href="/hotels">
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                View all hotels <ArrowRight className="size-4" />
              </motion.span>
            </Link>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((h, i) => (
            <HotelCard key={h.id} hotel={h} index={i} />
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container py-24">
          <FadeIn>
            <div className="max-w-2xl">
              <Badge className="border border-background/20 bg-background/10 text-background hover:bg-background/10">
                {cms.perks.badge}
              </Badge>
              <h2 className="mt-3 text-balance text-display text-3xl font-semibold tracking-tight md:text-5xl">
                {cms.perks.title}
              </h2>
              <p className="mt-3 text-base text-background/70">
                {cms.perks.subtitle}
              </p>
            </div>
          </FadeIn>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {cms.perks.items.map((p) => {
              const Icon = PERK_ICONS[p.icon] ?? Sparkles;
              return (
                <StaggerItem key={p.title}>
                  <div className="group h-full rounded-3xl border border-background/10 bg-background/5 p-7 backdrop-blur transition-all hover:border-accent/40 hover:bg-background/10">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 font-heading text-xl font-semibold">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-background/70">
                      {p.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* HOW IT WORKS — NEW */}
      <section className="container relative py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-50" />
        <FadeIn>
          <div className="mb-14 max-w-2xl">
            <Badge className="border border-border bg-secondary text-foreground hover:bg-secondary">
              {cms.howItWorks.badge}
            </Badge>
            <h2 className="mt-3 text-balance text-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {cms.howItWorks.title}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {cms.howItWorks.subtitle}
            </p>
          </div>
        </FadeIn>

        <Stagger
          className="grid gap-6 md:grid-cols-3"
          stagger={0.12}
        >
          {cms.howItWorks.steps.map((s, i) => (
            <StaggerItem key={i}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-card p-7 ring-1 ring-foreground/10 transition-all hover:shadow-soft hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <span className="text-display text-7xl font-semibold tracking-tight text-foreground/10 transition-colors group-hover:text-accent/30">
                    0{i + 1}
                  </span>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
                <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* DESTINATIONS */}
      <section className="container py-20 md:py-28">
        <FadeIn>
          <div className="mb-10 flex flex-col gap-2">
            <Badge className="w-fit border border-border bg-secondary text-foreground hover:bg-secondary">
              {cms.destinationsIntro.badge}
            </Badge>
            <h2 className="text-balance text-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {cms.destinationsIntro.title}
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              {cms.destinationsIntro.subtitle}
            </p>
          </div>
        </FadeIn>

        <Stagger
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          stagger={0.05}
        >
          {destinations.map((d) => (
            <StaggerItem key={d.name}>
              <Link
                href={`/hotels?q=${encodeURIComponent(d.name)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
              >
                <motion.img
                  src={d.image}
                  alt={d.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-background">
                  <p className="font-heading text-base font-semibold">{d.name}</p>
                  <p className="text-xs text-background/80">{d.count} stays</p>
                </div>
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container py-24">
          <FadeIn>
            <div className="text-center">
              <Badge className="border border-border bg-background text-foreground hover:bg-background">
                {cms.testimonials.badge}
              </Badge>
              <h2 className="mx-auto mt-3 max-w-2xl text-balance text-display text-3xl font-semibold tracking-tight md:text-5xl">
                {cms.testimonials.title}
              </h2>
              {cms.testimonials.subtitle && (
                <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                  {cms.testimonials.subtitle}
                </p>
              )}
            </div>
          </FadeIn>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {cms.testimonials.items.map((t) => (
              <StaggerItem key={t.name + t.quote.slice(0, 16)}>
                <motion.figure
                  whileHover={{ y: -4 }}
                  className="h-full rounded-3xl bg-card p-7 ring-1 ring-foreground/10 shadow-soft"
                >
                  <div className="flex gap-0.5 text-accent">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-4 fill-accent" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-base leading-relaxed text-foreground">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <img
                      src={`https://i.pravatar.cc/80?u=${t.name}`}
                      alt={t.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.location}
                      </p>
                    </div>
                  </figcaption>
                </motion.figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* JOURNAL — NEW */}
      <section className="container py-20 md:py-28">
        <FadeIn>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="border border-border bg-secondary text-foreground hover:bg-secondary">
                {cms.journal.badge}
              </Badge>
              <h2 className="mt-3 text-balance text-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                {cms.journal.title}
              </h2>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
                {cms.journal.subtitle}
              </p>
            </div>
            <Link href="#">
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                Read all <ArrowRight className="size-4" />
              </motion.span>
            </Link>
          </div>
        </FadeIn>

        <Stagger className="grid gap-6 md:grid-cols-3" stagger={0.1}>
          {cms.journal.articles.map((a, i) => (
            <StaggerItem key={i}>
              <motion.article
                whileHover={{ y: -4 }}
                className="group h-full overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-soft"
              >
                <Link href="#" className="block">
                  <div className="relative aspect-[5/3] w-full overflow-hidden">
                    <motion.img
                      src={a.image}
                      alt={a.title}
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.07 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-foreground">
                        {a.category}
                      </span>
                      <span>{a.readTime}</span>
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {a.excerpt}
                    </p>
                  </div>
                </Link>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-12 text-primary-foreground md:p-20">
            <div className="relative max-w-2xl">
              <h2 className="text-balance text-display text-4xl font-semibold tracking-tight md:text-6xl">
                {cms.cta.title}
              </h2>
              <p className="mt-4 text-base text-background/70 md:text-lg">
                {cms.cta.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={cms.cta.primaryHref}>
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex"
                  >
                    <Button
                      size="lg"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {cms.cta.primaryLabel}
                      <ArrowRight className="size-4" />
                    </Button>
                  </motion.span>
                </Link>
                <Link href={cms.cta.secondaryHref}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                  >
                    {cms.cta.secondaryLabel}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
