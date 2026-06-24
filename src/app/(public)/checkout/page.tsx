"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Lock, Loader2, ShieldCheck, Wallet, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { FadeIn } from "@/components/motion/Motion";
import { clearCart, useCartItems, useCartTotal } from "@/redux/fetchers/cart/cartSlice";
import { useAuthUser } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { bookingsService, paymentsService } from "@/services";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PayMethod = "card" | "paypal" | "bank_transfer" | "wallet";

export default function CheckoutPage() {
  const items = useCartItems();
  const subtotal = useCartTotal();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAuthUser();

  const [method, setMethod] = useState<PayMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login?redirect=/checkout");
  }, [user, router]);

  const taxes = useMemo(() => Math.round(subtotal * 0.12), [subtotal]);
  const total = subtotal + taxes;

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={<CreditCard className="size-7" />}
          title="Your cart is empty"
          description="Add a room before checking out."
          action={
            <Link href="/hotels">
              <Button size="lg" className="rounded-xl">Browse hotels</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "card") {
      if (!cardName || cardNumber.replace(/\s/g, "").length < 12 || !expiry || cvc.length < 3) {
        toast.error("Enter valid card details");
        return;
      }
    }
    setSubmitting(true);

    try {
      let lastBookingId = "";
      for (const item of items) {
        const booking = await bookingsService.create({
          hotel_id: item.hotelId,
          hotel_name: item.hotelName,
          room_id: item.roomId,
          room_name: item.roomName,
          image: item.image,
          guest_id: user.id,
          guest_name: user.name,
          guest_email: user.email,
          guest_avatar: user.avatar ?? `https://i.pravatar.cc/150?u=${user.id}`,
          check_in: item.checkIn,
          check_out: item.checkOut,
          nights: item.nights,
          guests: item.guests,
          subtotal: item.pricePerNight * item.nights,
          taxes: Math.round(item.pricePerNight * item.nights * 0.12),
          total: item.pricePerNight * item.nights + Math.round(item.pricePerNight * item.nights * 0.12),
          status: "upcoming",
          source: "direct",
        });
        lastBookingId = booking.id;

        await paymentsService.create({
          booking_id: booking.id,
          user_id: user.id,
          user_name: user.name,
          type: "booking",
          method,
          amount: booking.total,
          currency: "USD",
          status: "paid",
        });
      }

      dispatch(clearCart());
      toast.success("Payment successful");
      router.push(`/booking-confirmed/${lastBookingId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <FadeIn>
        <Link
          href="/dashboard/cart"
          className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          Back to cart
        </Link>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Checkout
        </h1>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="size-3" />
          Secure payment · all transactions are encrypted.
        </p>
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={pay} className="space-y-6">
          <FadeIn delay={0.1}>
            <section className="rounded-3xl bg-card p-7 ring-1 ring-foreground/10">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                <CreditCard className="size-4 text-accent" />
                Payment method
              </h2>
              <p className="text-sm text-muted-foreground">Pick how you&apos;d like to pay.</p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "paypal", label: "PayPal", icon: Wallet },
                  { id: "bank_transfer", label: "Bank", icon: Wallet },
                  { id: "wallet", label: "Wallet", icon: ShieldCheck },
                ] as const).map((m) => {
                  const active = method === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                        active
                          ? "border-foreground bg-secondary"
                          : "border-border bg-card hover:border-foreground/40"
                      )}
                    >
                      <Icon className="size-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {method === "card" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="cardName">Name on card</Label>
                    <Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="cardNumber">Card number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM / YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" inputMode="numeric" maxLength={4} value={cvc} onChange={(e) => setCvc(e.target.value)} required className="h-11 rounded-xl" />
                  </div>
                </div>
              )}
              {method !== "card" && (
                <div className="mt-5 rounded-2xl bg-secondary/40 p-5 text-sm text-muted-foreground">
                  You&apos;ll be redirected to your provider to complete payment securely.
                </div>
              )}
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Your details are never stored.
              </p>
            </section>
          </FadeIn>

          <motion.div whileHover={!submitting ? { scale: 1.01 } : {}} whileTap={!submitting ? { scale: 0.99 } : {}}>
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing payment…
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Pay {formatCurrency(total)}
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10 shadow-soft"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Order summary</h3>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.roomName} className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground">{item.roomName}</p>
                    <p className="text-xs text-muted-foreground">{item.hotelName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(item.checkIn)} – {formatDate(item.checkOut)} · {item.nights} night{item.nights > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(item.pricePerNight * item.nights)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-5 bg-border" />

            <div className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & fees</span>
                <span className="font-medium text-foreground">{formatCurrency(taxes)}</span>
              </div>
            </div>

            <Separator className="my-5 bg-border" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-2xl font-semibold text-foreground">{formatCurrency(total)}</span>
            </div>
          </motion.div>
          <button hidden><ShoppingBag /></button>
        </aside>
      </div>
    </div>
  );
}
