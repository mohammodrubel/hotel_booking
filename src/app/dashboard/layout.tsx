"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import DashboardSidebar from "@/components/site/DashboardSidebar";
import { useAuthToken, useAuthUser } from "@/redux/fetchers/auth/authSlice";

const USER_ONLY_PREFIXES = [
  "/dashboard/bookings",
  "/dashboard/wishlist",
  "/dashboard/cart",
  "/dashboard/support",
];

const MANAGER_ONLY_PREFIX = "/dashboard/manager";
const ADMIN_ONLY_PREFIX = "/dashboard/admin";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const token = useAuthToken();
  const user = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) return;

    const role = user.role;

    if (pathname === "/dashboard") {
      if (role === "admin") router.replace("/dashboard/admin");
      else if (role === "manager") router.replace("/dashboard/manager");
      return;
    }

    if (pathname.startsWith(ADMIN_ONLY_PREFIX) && role !== "admin") {
      router.replace(role === "manager" ? "/dashboard/manager" : "/dashboard");
      return;
    }
    if (pathname.startsWith(MANAGER_ONLY_PREFIX) && role !== "manager") {
      router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard");
      return;
    }
    if (USER_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) && role !== "user") {
      router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/manager");
    }
  }, [token, user, pathname, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <div className="container flex-1 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <DashboardSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
