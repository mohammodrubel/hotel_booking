"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, User, LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthUser, logout } from "@/redux/fetchers/auth/authSlice";
import { useCartCount } from "@/redux/fetchers/cart/cartSlice";
import { useWishlistCount } from "@/redux/fetchers/wishlist/wishlistSlice";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/hotels", label: "Hotels" },
  { href: "/hotels?destination=trending", label: "Destinations" },
  { href: "/hotels?sort=price", label: "Deals" },
  { href: "/dashboard", label: "My account" },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Signed out");
    router.push("/");
  };

  return (
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
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-foreground text-background"
          >
            <span className="text-sm font-bold">S</span>
            <motion.span
              className="absolute inset-0 -translate-x-full bg-accent"
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Stay<span className="text-accent">haus</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active =
              pathname === l.href ||
              (l.href === "/hotels" && pathname.startsWith("/hotels")) ||
              (l.href === "/dashboard" && pathname.startsWith("/dashboard"));
            return (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  "group relative rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
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
                    className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground"
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
                    className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground"
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
                  <Button className="bg-foreground text-background hover:bg-foreground/85">
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                {user ? (
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/hotels">
                      <Button className="w-full">Book now</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
