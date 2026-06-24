"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { setUser } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";
import type { DecodedUser } from "@/lib/jwtDecoder";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2) {
      toast.error("Enter your full name");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    const user: DecodedUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: "user",
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      iat: Math.floor(Date.now() / 1000),
    };
    const token = `mock.${btoa(JSON.stringify(user))}.signature`;

    dispatch(setUser({ user, token }));
    toast.success(`Account created. Welcome, ${user.name}.`);
    setSubmitting(false);
    router.push(redirectTo || "/dashboard");
  };

  return (
    <div>
      <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Save trips, sync wishlists, and book in a tap.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <div className="group relative">
            <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl pl-10 text-sm"
              required
            />
          </div>
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
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
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm</Label>
            <div className="group relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 rounded-xl pl-10 text-sm"
                required
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <a href="#" className="underline-offset-2 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline-offset-2 hover:underline">
            Privacy Policy
          </a>
          .
        </p>

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
                Creating…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      <Separator className="my-7 bg-border" />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
          className="font-medium text-foreground transition-colors hover:text-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
