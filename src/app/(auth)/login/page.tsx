"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { setUser } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import type { DecodedUser } from "@/lib/jwtDecoder";
import { cn } from "@/lib/utils";

type Role = "user" | "manager" | "admin";

interface DemoAccount {
  role: Role;
  email: string;
  password: string;
  label: string;
  desc: string;
  icon: typeof UserIcon;
  landing: string;
}

const DEMOS: DemoAccount[] = [
  {
    role: "user",
    email: "guest@stayhaus.app",
    password: "demo1234",
    label: "Guest",
    desc: "Book stays, manage trips",
    icon: UserIcon,
    landing: "/dashboard",
  },
  {
    role: "manager",
    email: "manager@stayhaus.app",
    password: "demo1234",
    label: "Hotel manager",
    desc: "Run your properties",
    icon: Briefcase,
    landing: "/dashboard/manager",
  },
  {
    role: "admin",
    email: "admin@stayhaus.app",
    password: "demo1234",
    label: "Admin",
    desc: "Platform-wide control",
    icon: ShieldCheck,
    landing: "/dashboard/admin",
  },
];

function inferRole(email: string): Role {
  const lower = email.toLowerCase();
  if (lower.startsWith("admin@")) return "admin";
  if (lower.startsWith("manager@")) return "manager";
  return "user";
}

function landingFor(role: Role): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "manager") return "/dashboard/manager";
  return "/dashboard";
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [email, setEmail] = useState("guest@stayhaus.app");
  const [password, setPassword] = useState("demo1234");
  const [selectedRole, setSelectedRole] = useState<Role>("user");
  const [submitting, setSubmitting] = useState(false);

  const pickDemo = (d: DemoAccount) => {
    setEmail(d.email);
    setPassword(d.password);
    setSelectedRole(d.role);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and password");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const role = inferRole(email) || selectedRole;
    const namePart = email.split("@")[0] ?? "Guest";
    const niceName =
      role === "admin"
        ? "Admin"
        : role === "manager"
          ? "Sara Okafor"
          : namePart
              .replace(/[._]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());

    const user: DecodedUser = {
      id: `${role}-${namePart}`,
      email,
      name: niceName,
      role,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      iat: Math.floor(Date.now() / 1000),
    };
    const token = `mock.${btoa(JSON.stringify(user))}.signature`;

    dispatch(setUser({ user, token }));
    toast.success(`Welcome, ${user.name}`);
    setSubmitting(false);
    router.push(redirectTo || landingFor(role));
  };

  return (
    <div>
      <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to manage your stays, properties, or platform.
      </p>

      <div className="mt-7">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Try a demo role
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {DEMOS.map((d) => {
            const Icon = d.icon;
            const active = selectedRole === d.role;
            return (
              <motion.button
                type="button"
                key={d.role}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => pickDemo(d)}
                className={cn(
                  "group relative rounded-2xl border p-3 text-left transition-colors",
                  active
                    ? "border-foreground bg-secondary"
                    : "border-border bg-card hover:border-foreground/40"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="role-pick"
                    className="absolute inset-0 rounded-2xl ring-2 ring-accent"
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  />
                )}
                <span className="relative">
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <p className="mt-2 text-xs font-semibold text-foreground">
                    {d.label}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {d.desc}
                  </p>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="group relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl pl-10 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot?
            </Link>
          </div>
          <div className="group relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl pl-10 text-sm"
              required
            />
          </div>
        </div>

        <motion.div
          whileHover={!submitting ? { scale: 1.01 } : {}}
          whileTap={!submitting ? { scale: 0.99 } : {}}
        >
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      <Separator className="my-7 bg-border" />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
          className="font-medium text-foreground transition-colors hover:text-accent"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
