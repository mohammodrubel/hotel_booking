"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion/Motion";
import {
  setUser,
  useAuthUser,
  useAuthToken,
} from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { toast } from "sonner";

export default function ProfilePage() {
  const user = useAuthUser();
  const token = useAuthToken();
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar ?? "");
    }
  }, [user]);

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      setUser({
        user: { ...user, name, email, avatar },
        token,
      })
    );
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your personal details and preferences.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
          <form onSubmit={save} className="space-y-6 p-7">
            <div className="flex items-center gap-5">
              <motion.div
                whileHover={{ scale: 1.04, rotate: 2 }}
                transition={{ type: "spring", stiffness: 220 }}
                className="relative"
              >
                <img
                  src={avatar || `https://i.pravatar.cc/100?u=${email}`}
                  alt={name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-background"
                />
                <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground ring-2 ring-background">
                  <ShieldCheck className="size-3.5" />
                </span>
              </motion.div>
              <div>
                <p className="text-lg font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.role} · {email}
                </p>
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex"
              >
                <Button
                  type="submit"
                  className="rounded-xl bg-foreground text-background hover:bg-foreground/85"
                >
                  Save changes
                </Button>
              </motion.span>
            </div>
          </form>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="rounded-3xl bg-card p-7 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your account safe.
          </p>
          <div className="mt-5 space-y-3">
            {[
              {
                title: "Password",
                desc: "Last changed 3 months ago",
                action: "Change",
              },
              {
                title: "Two-factor authentication",
                desc: "Add an extra layer of protection",
                action: "Enable",
              },
            ].map((row) => (
              <motion.div
                key={row.title}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {row.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  {row.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
