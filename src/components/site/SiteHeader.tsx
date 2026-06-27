"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  MapPin,
  Tag,
  BookOpen,
  Sparkles,
  Compass,
  Building2,
  Palmtree,
  Mountain,
  Waves,
  ArrowRight,
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthUser, logout } from "@/redux/fetchers/auth/authSlice";
import { useCartCount } from "@/redux/fetchers/cart/cartSlice";
import { useWishlistCount } from "@/redux/fetchers/wishlist/wishlistSlice";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof MapPin;
  description?: string;
};

const PRIMARY_LINKS: NavLink[] = [
  { href: "/hotels", label: "Hotels", icon: Building2, description: "Browse all stays" },
  { href: "/hotels?sort=price", label: "Deals", icon: Tag, description: "Best prices today" },
  { href: "/dashboard", label: "My account", icon: LayoutDashboard, description: "Bookings, wishlist, cart" },
];

const DESTINATION_FEATURED = [
  { name: "Paris", image: "/images/4787421-interior-2685521.jpg", icon: Palmtree },
  { name: "Bali", image: "/images/tianya1223-hotel-6878057.jpg", icon: Waves },
  { name: "New York", image: "/images/erikawittlieb-living-room-2155376.jpg", icon: Building2 },
  { name: "Aspen", image: "/images/manuelajaeger-hotel-1749602.jpg", icon: Mountain },
];

const STAY_CATEGORIES = [
  { label: "Boutique", icon: Sparkles },
  { label: "Resorts", icon: Palmtree },
  { label: "Villas", icon: Building2 },
  { label: "Mountain", icon: Mountain },
  { label: "Beach", icon: Waves },
  { label: "City", icon: Compass },
];

const MOBILE_ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/cart", label: "Cart", icon: ShoppingBag },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
];

export default function SiteHeader() {
  const user = useAuthUser();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out");
    router.push("/");
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileSearch.trim()) return;
    router.push(`/hotels?q=${encodeURIComponent(mobileSearch.trim())}`);
    setMobileOpen(false);
  };

  const isActive = (href: string) =>
    pathname === href ||
    (href === "/hotels" && pathname.startsWith("/hotels")) ||
    (href === "/dashboard" && pathname.startsWith("/dashboard"));

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          scrolled
            ? "border-b border-border/60 glass-strong shadow-soft"
            : "border-b border-transparent bg-background/40 backdrop-blur"
        )}
      >
        <div
          className={cn(
            "container flex items-center justify-between transition-all duration-500",
            scrolled ? "py-3" : "py-5"
          )}
        >
          <Link href="/" className="group relative flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-soft"
            >
              <span className="text-sm font-bold">S</span>
            </motion.div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Stay<span className="text-primary">haus</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            onMouseLeave={() => setExploreOpen(false)}
          >
            <Link
              href="/hotels"
              className={cn(
                "group relative rounded-lg px-3 py-2 text-sm transition-colors",
                isActive("/hotels")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onMouseEnter={() => setExploreOpen(false)}
            >
              Hotels
              {isActive("/hotels") && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            <button
              type="button"
              onMouseEnter={() => setExploreOpen(true)}
              onClick={() => setExploreOpen((v) => !v)}
              className={cn(
                "group relative inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
                exploreOpen
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Explore
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  exploreOpen && "rotate-180"
                )}
              />
            </button>

            <Link
              href="/hotels?sort=price"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onMouseEnter={() => setExploreOpen(false)}
            >
              Deals
            </Link>
            <Link
              href="/#journal"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onMouseEnter={() => setExploreOpen(false)}
            >
              Journal
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "group relative rounded-lg px-3 py-2 text-sm transition-colors",
                isActive("/dashboard")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onMouseEnter={() => setExploreOpen(false)}
            >
              My account
              {isActive("/dashboard") && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/dashboard/wishlist" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="size-4" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 480, damping: 22 }}
                      className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
            <Link href="/dashboard/cart" className="hidden sm:inline-flex">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="size-4" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 480, damping: 22 }}
                      className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </Link>

            {user ? (
              <div className="hidden items-center gap-1 md:flex">
                <Link href="/dashboard">
                  <Button variant="ghost" className="gap-2">
                    <User className="size-4" />
                    <span className="hidden lg:inline">
                      {user.name.split(" ")[0]}
                    </span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden items-center gap-1.5 md:flex">
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground">
                    Sign in
                  </Button>
                </Link>
                <Link href="/hotels">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex"
                  >
                    <Button className="bg-primary text-primary-foreground shadow-soft hover:bg-primary/90">
                      Book now
                    </Button>
                  </motion.span>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* DESKTOP MEGA MENU */}
        <AnimatePresence>
          {exploreOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setExploreOpen(true)}
              onMouseLeave={() => setExploreOpen(false)}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-card/95 shadow-lift backdrop-blur md:block"
            >
              <div className="container grid gap-8 py-8 lg:grid-cols-[1.4fr_1fr]">
                {/* destinations */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Trending destinations
                    </p>
                    <Link
                      href="/hotels"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      View all <ArrowRight className="size-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {DESTINATION_FEATURED.map((d) => {
                      const Icon = d.icon;
                      return (
                        <Link
                          key={d.name}
                          href={`/hotels?q=${encodeURIComponent(d.name)}`}
                          className="group relative block aspect-[4/5] overflow-hidden rounded-2xl"
                        >
                          <img
                            src={d.image}
                            alt={d.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
                          <div className="absolute inset-x-3 bottom-3 text-background">
                            <Icon className="size-4 opacity-80" />
                            <p className="mt-1 font-heading text-sm font-semibold">
                              {d.name}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* categories + quick links */}
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stay categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STAY_CATEGORIES.map((c) => {
                      const Icon = c.icon;
                      return (
                        <Link
                          key={c.label}
                          href={`/hotels?q=${encodeURIComponent(c.label)}`}
                          className="group flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5 transition-colors hover:bg-secondary"
                        >
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-background text-primary ring-1 ring-border transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Icon className="size-3.5" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {c.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl bg-primary p-5 text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4" />
                      <p className="text-xs font-semibold uppercase tracking-wider">
                        Member offer
                      </p>
                    </div>
                    <p className="mt-2 font-heading text-base font-semibold">
                      15% off your next stay
                    </p>
                    <Link href="/hotels?sort=price">
                      <Button
                        size="sm"
                        className="mt-3 gap-1.5 rounded-lg bg-background text-foreground hover:bg-background/90"
                      >
                        Claim offer
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* MOBILE FULL-SCREEN MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-lift md:hidden"
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                    <span className="text-sm font-bold">S</span>
                  </div>
                  <span className="text-base font-semibold tracking-tight text-foreground">
                    Stay<span className="text-primary">haus</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* search */}
              <form onSubmit={handleMobileSearch} className="border-b border-border p-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    placeholder="Search hotels, destinations"
                    className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
                  />
                </div>
              </form>

              {/* scrollable content */}
              <div className="flex-1 overflow-y-auto px-4 py-5">
                {/* user profile */}
                {user && (
                  <Link
                    href="/dashboard"
                    className="mb-5 flex items-center gap-3 rounded-2xl bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                  >
                    <img
                      src={user.avatar ?? `https://i.pravatar.cc/80?u=${user.id}`}
                      alt={user.name}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-background"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                )}

                {/* primary nav */}
                <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Navigate
                </p>
                <motion.nav
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.04 } },
                  }}
                  className="mt-2 space-y-1"
                >
                  {PRIMARY_LINKS.map((l) => {
                    const Icon = l.icon;
                    const active = isActive(l.href);
                    return (
                      <motion.div
                        key={l.label}
                        variants={{
                          hidden: { opacity: 0, x: 16 },
                          show: { opacity: 1, x: 0 },
                        }}
                      >
                        <Link
                          href={l.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-secondary"
                          )}
                        >
                          <div
                            className={cn(
                              "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground group-hover:bg-background"
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{l.label}</p>
                            {l.description && (
                              <p className="truncate text-xs text-muted-foreground">
                                {l.description}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                {/* destinations */}
                <p className="mt-6 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Trending destinations
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DESTINATION_FEATURED.map((d) => (
                    <Link
                      key={d.name}
                      href={`/hotels?q=${encodeURIComponent(d.name)}`}
                      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
                    >
                      <img
                        src={d.image}
                        alt={d.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                      <p className="absolute bottom-2 left-3 font-heading text-sm font-semibold text-background">
                        {d.name}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* account links */}
                {user && (
                  <>
                    <p className="mt-6 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Account
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {MOBILE_ACCOUNT_LINKS.map((l) => {
                        const Icon = l.icon;
                        return (
                          <Link
                            key={l.label}
                            href={l.href}
                            className="group flex flex-col items-center gap-1.5 rounded-xl bg-secondary/50 px-2 py-3 text-center transition-colors hover:bg-secondary"
                          >
                            <div className="grid h-8 w-8 place-items-center rounded-lg bg-background text-primary ring-1 ring-border transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <Icon className="size-3.5" />
                            </div>
                            <span className="text-[11px] font-medium text-foreground">
                              {l.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* member offer */}
                <div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider">
                      Member offer
                    </p>
                  </div>
                  <p className="mt-2 font-heading text-base font-semibold">
                    15% off your next stay
                  </p>
                  <Link href="/hotels?sort=price">
                    <Button
                      size="sm"
                      className="mt-3 w-full gap-1.5 rounded-lg bg-background text-foreground hover:bg-background/90"
                    >
                      Claim offer
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* footer cta */}
              <div className="border-t border-border bg-card p-4">
                {user ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full gap-2 rounded-xl"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full rounded-xl">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
