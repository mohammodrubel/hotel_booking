"use client";

import { useState } from "react";
import { Bell, Globe, Lock, ShieldCheck, Mail, KeyRound, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FadeIn } from "@/components/motion/Motion";
import { useAuthUser, logout, setUser } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Prefs {
  email_bookings: boolean;
  email_marketing: boolean;
  email_security: boolean;
  push_bookings: boolean;
  push_messages: boolean;
  push_marketing: boolean;
  language: string;
  currency: string;
  two_factor: boolean;
}

const PREFS_KEY = "stayhaus.prefs.v1";

function loadPrefs(): Prefs {
  if (typeof window === "undefined")
    return { email_bookings: true, email_marketing: false, email_security: true, push_bookings: true, push_messages: true, push_marketing: false, language: "en", currency: "USD", two_factor: false };
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) return { ...JSON.parse(raw) };
  } catch {}
  return { email_bookings: true, email_marketing: false, email_security: true, push_bookings: true, push_messages: true, push_marketing: false, language: "en", currency: "USD", two_factor: false };
}

function savePrefs(p: Prefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

export default function SettingsPage() {
  const user = useAuthUser();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [pwOpen, setPwOpen] = useState(false);
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pw, setPw] = useState({ old: "", next: "", confirm: "" });

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
    toast.success("Preferences saved");
  };

  const onChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
    setPwOpen(false);
    setPw({ old: "", next: "", confirm: "" });
    toast.success("Password changed");
  };

  const onToggle2FA = () => {
    setTwoFaOpen(false);
    update({ two_factor: !prefs.two_factor });
    if (user) dispatch(setUser({ user: { ...user }, token: null })); // no-op refresh
  };

  const onDelete = () => {
    setDeleteOpen(false);
    dispatch(logout());
    if (typeof window !== "undefined") window.localStorage.removeItem(PREFS_KEY);
    toast.success("Account scheduled for deletion");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Account, security, and notification preferences.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Choose how we keep you informed.</p>
          <Separator className="my-5 bg-border" />
          <div className="space-y-3">
            {[
              { key: "email_bookings" as const, label: "Email · booking updates", desc: "Confirmations, changes, reminders" },
              { key: "email_security" as const, label: "Email · security", desc: "Sign-ins from new devices" },
              { key: "email_marketing" as const, label: "Email · marketing", desc: "Promotions and partner deals" },
              { key: "push_bookings" as const, label: "Push · booking updates", desc: "Real-time travel alerts" },
              { key: "push_messages" as const, label: "Push · messages", desc: "New messages from hotels" },
              { key: "push_marketing" as const, label: "Push · marketing", desc: "Curated picks weekly" },
            ].map((row) => (
              <motion.div
                key={row.key}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Switch
                  checked={prefs[row.key]}
                  onCheckedChange={(v) => update({ [row.key]: v } as Partial<Prefs>)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Locale</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Language and currency for displays.</p>
          <Separator className="my-5 bg-border" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Language</Label>
              <Select
                value={prefs.language}
                onChange={(e) => update({ language: e.target.value })}
                options={[
                  { value: "en", label: "English" },
                  { value: "ar", label: "العربية (Arabic)" },
                  { value: "fr", label: "Français" },
                  { value: "es", label: "Español" },
                ]}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Currency</Label>
              <Select
                value={prefs.currency}
                onChange={(e) => update({ currency: e.target.value })}
                options={[
                  { value: "USD", label: "USD · US Dollar" },
                  { value: "EUR", label: "EUR · Euro" },
                  { value: "GBP", label: "GBP · British Pound" },
                  { value: "AED", label: "AED · UAE Dirham" },
                  { value: "JPY", label: "JPY · Japanese Yen" },
                ]}
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Keep your account safe.</p>
          <Separator className="my-5 bg-border" />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => setPwOpen(true)}>Change</Button>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">
                  {prefs.two_factor ? "Enabled · authenticator app" : "Add an extra layer of protection"}
                </p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => setTwoFaOpen(true)}>
                {prefs.two_factor ? "Disable" : "Enable"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-secondary/40 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Email address</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => toast.info("Visit your profile to change email")}>
                Change
              </Button>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.12}>
        <section className="rounded-3xl border-2 border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Danger zone</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Delete your account permanently.</p>
          <div className="mt-5 flex justify-end">
            <Button
              variant="outline"
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </section>
      </FadeIn>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <form onSubmit={onChangePw} className="space-y-3">
            <div>
              <Label>Current password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" required value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            <div>
              <Label>New password</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            <div>
              <Label>Confirm new password</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" required minLength={6} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={(props) => <Button {...props} type="button" variant="outline" className="rounded-xl">Cancel</Button>} />
              <Button type="submit" className="rounded-xl bg-foreground text-background hover:bg-foreground/85">Update password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={twoFaOpen} onOpenChange={setTwoFaOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{prefs.two_factor ? "Disable two-factor" : "Enable two-factor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {prefs.two_factor ? (
              <p className="text-muted-foreground">Turning off 2FA reduces your account security.</p>
            ) : (
              <>
                <p className="text-muted-foreground">Scan the QR with your authenticator app, then enter the 6-digit code.</p>
                <div className="grid h-44 w-44 mx-auto place-items-center rounded-2xl bg-secondary">
                  <div className="grid grid-cols-7 grid-rows-7 gap-0.5 h-32 w-32">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-sm ${(i * 7 + (i % 5)) % 3 === 0 ? "bg-foreground" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <Input placeholder="123 456" className="h-11 rounded-xl text-center font-mono" />
              </>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={(props) => <Button {...props} variant="outline" className="rounded-xl">Cancel</Button>} />
            <Button onClick={onToggle2FA} className="rounded-xl bg-foreground text-background hover:bg-foreground/85">
              {prefs.two_factor ? "Disable" : "Enable"}
            </Button>
          </DialogFooter>
          <Mail className="hidden" />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete your account?"
        description="This permanently removes your bookings, wishlist, and reviews."
        confirmLabel="Delete forever"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
