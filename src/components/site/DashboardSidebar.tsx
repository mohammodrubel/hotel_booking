"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Heart,
  LayoutDashboard,
  ShoppingBag,
  User,
  Users,
  Building2,
  BedDouble,
  LineChart,
  ShieldCheck,
  Briefcase,
  ClipboardList,
  Layout,
  Star,
  CreditCard,
  Settings,
  Megaphone,
  History,
  Wallet,
  Tag,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";

type Role = "user" | "manager" | "admin";

interface NavGroup {
  label: string;
  items: Array<{ href: string; label: string; icon: typeof User }>;
}

const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  user: [
    {
      label: "Overview",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      ],
    },
    {
      label: "Travel",
      items: [
        { href: "/dashboard/bookings", label: "My bookings", icon: CalendarCheck },
        { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
        { href: "/dashboard/cart", label: "Cart", icon: ShoppingBag },
        { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
        { href: "/dashboard/reviews", label: "Reviews", icon: Star },
      ],
    },
    {
      label: "Help",
      items: [
        { href: "/dashboard/support", label: "Support", icon: HelpCircle },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/dashboard/profile", label: "Profile", icon: User },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
  manager: [
    {
      label: "Overview",
      items: [{ href: "/dashboard/manager", label: "Overview", icon: LayoutDashboard }],
    },
    {
      label: "Operations",
      items: [
        { href: "/dashboard/manager/reservations", label: "Reservations", icon: ClipboardList },
        { href: "/dashboard/manager/rooms", label: "Rooms", icon: BedDouble },
        { href: "/dashboard/manager/pricing", label: "Pricing", icon: Tag },
        { href: "/dashboard/manager/services", label: "Service desk", icon: Wrench },
      ],
    },
    {
      label: "Finance",
      items: [
        { href: "/dashboard/manager/revenue", label: "Revenue", icon: LineChart },
        { href: "/dashboard/manager/expenses", label: "Expenses", icon: Wallet },
        { href: "/dashboard/manager/reviews", label: "Reviews", icon: Star },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/dashboard/profile", label: "Profile", icon: User },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
  admin: [
    {
      label: "Overview",
      items: [{ href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard }],
    },
    {
      label: "Platform",
      items: [
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
        { href: "/dashboard/admin/hotels", label: "Hotels", icon: Building2 },
        { href: "/dashboard/admin/bookings", label: "Bookings", icon: CalendarCheck },
        { href: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/dashboard/admin/homepage", label: "Homepage", icon: Layout },
        { href: "/dashboard/admin/announcements", label: "Announcements", icon: Megaphone },
      ],
    },
    {
      label: "Reports",
      items: [
        { href: "/dashboard/admin/analytics", label: "Analytics", icon: LineChart },
        { href: "/dashboard/admin/audit", label: "Audit log", icon: History },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/dashboard/profile", label: "Profile", icon: User },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ],
    },
  ],
};

const ROLE_META: Record<Role, { label: string; icon: typeof User; tone: string }> = {
  user: { label: "Guest", icon: User, tone: "bg-secondary text-foreground" },
  manager: { label: "Manager", icon: Briefcase, tone: "bg-accent text-accent-foreground" },
  admin: { label: "Admin", icon: ShieldCheck, tone: "bg-foreground text-background" },
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuthUser();
  const role: Role = (user?.role as Role) ?? "user";
  const groups = NAV_BY_ROLE[role];
  const roleMeta = ROLE_META[role];
  const RoleIcon = roleMeta.icon;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
      >
        <div className="relative flex items-center gap-3">
          <motion.img
            whileHover={{ scale: 1.06 }}
            src={user?.avatar ?? `https://i.pravatar.cc/100?u=guest`}
            alt={user?.name ?? "Guest"}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-background"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.name ?? "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "Not signed in"}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "relative mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
            roleMeta.tone
          )}
        >
          <RoleIcon className="size-3" />
          {roleMeta.label}
        </div>
      </motion.div>

      <nav className="space-y-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item, i) => {
                const exact = item.href === "/dashboard" || item.href === "/dashboard/manager" || item.href === "/dashboard/admin";
                const active = exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl bg-secondary"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 grid h-7 w-7 place-items-center">
                        <Icon
                          className={cn(
                            "size-4 transition-transform group-hover:scale-110",
                            active && "text-accent"
                          )}
                        />
                      </span>
                      <span className="relative z-10 flex-1 truncate font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
