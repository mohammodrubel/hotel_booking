"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/motion/Motion";
import {
  clearCart,
  removeFromCart,
  updateNights,
  useCartItems,
  useCartTotal,
} from "@/redux/fetchers/cart/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function CartPage() {
  const items = useCartItems();
  const subtotal = useCartTotal();
  const dispatch = useAppDispatch();
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Cart
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your selections before booking.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                dispatch(clearCart());
                toast.success("Cart cleared");
              }}
            >
              Clear cart
            </Button>
          )}
        </div>
      </FadeIn>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl bg-card p-12 text-center ring-1 ring-foreground/10"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-accent"
            >
              <ShoppingBag className="size-7" />
            </motion.div>
            <p className="mt-5 text-base font-semibold text-foreground">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a room to start a booking.
            </p>
            <Link href="/hotels" className="mt-5 inline-block">
              <Button size="lg" className="rounded-xl">
                Browse hotels
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
                      <img
                        src={item.image}
                        alt={item.roomName}
                        className="h-44 w-full object-cover sm:h-full"
                      />
                      <div className="flex flex-col gap-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.roomName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.hotelName}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              dispatch(removeFromCart(item.id));
                              toast.success("Removed from cart");
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.checkIn)} →{" "}
                          {formatDate(item.checkOut)} · {item.guests} guest
                          {item.guests > 1 ? "s" : ""}
                        </p>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Nights
                            </span>
                            <div className="inline-flex items-center rounded-full border border-border bg-background">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full"
                                onClick={() =>
                                  dispatch(
                                    updateNights({
                                      id: item.id,
                                      nights: item.nights - 1,
                                    })
                                  )
                                }
                              >
                                <Minus className="size-3" />
                              </Button>
                              <motion.span
                                key={item.nights}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-8 text-center text-sm font-semibold"
                              >
                                {item.nights}
                              </motion.span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-full"
                                onClick={() =>
                                  dispatch(
                                    updateNights({
                                      id: item.id,
                                      nights: item.nights + 1,
                                    })
                                  )
                                }
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-lg font-semibold text-foreground">
                            {formatCurrency(item.pricePerNight * item.nights)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <motion.div
                layout
                className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10 shadow-soft"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Summary
                </h3>
                <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <motion.span
                      key={subtotal}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-medium text-foreground"
                    >
                      {formatCurrency(subtotal)}
                    </motion.span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & fees</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(taxes)}
                    </span>
                  </div>
                </div>
                <Separator className="my-5 bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Total
                  </span>
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-semibold text-foreground"
                  >
                    {formatCurrency(total)}
                  </motion.span>
                </div>
                <Link href="/checkout" className="mt-6 block">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex w-full"
                  >
                    <Button
                      size="lg"
                      className="w-full gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
                    >
                      Proceed to checkout
                      <ArrowRight className="size-4" />
                    </Button>
                  </motion.span>
                </Link>
              </motion.div>
            </aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
