"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  type ReactNode,
  type ElementType,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT: Transition["ease"] = [0.65, 0, 0.35, 1];

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  y,
  x,
  direction = "up",
  once = true,
  amount = 0.2,
  className,
  ...rest
}: FadeInProps) {
  const offsetY =
    y !== undefined ? y : direction === "up" ? 24 : direction === "down" ? -24 : 0;
  const offsetX =
    x !== undefined ? x : direction === "left" ? 24 : direction === "right" ? -24 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: offsetY, x: offsetX }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE_OUT }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
  as?: ElementType;
}

export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  once = true,
  amount = 0.15,
  as,
}: StaggerProps) {
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const MotionTag = motion[(as as keyof typeof motion) ?? "div"] as typeof motion.div;

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "ref" | "variants"> {
  y?: number;
}

export function StaggerItem({ children, className, y = 18, ...rest }: StaggerItemProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: EASE_OUT },
    },
  };
  return (
    <motion.div variants={variants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function RevealText({
  children,
  className,
  delay = 0,
  stagger = 0.05,
}: RevealTextProps) {
  const words = children.split(" ");
  return (
    <motion.span
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={cn("inline-flex flex-wrap", className)}
    >
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden pb-[0.12em] mr-[0.25em]">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.7, ease: EASE_OUT },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.4,
  format,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (!ref.current) return;
      const rounded = Math.round(latest);
      ref.current.textContent = format ? format(rounded) : String(rounded);
    });
  }, [spring, format]);

  return (
    <span ref={ref} className={className}>
      {format ? format(0) : "0"}
    </span>
  );
}

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 18, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14 });
  const sy = useSpring(y, { stiffness: 180, damping: 14 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * strength;
    x.set(dx);
    y.set(dy);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

interface TiltProps {
  children: ReactNode;
  max?: number;
  className?: string;
}

export function Tilt({ children, max = 6, className }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * (max * 2));
    rx.set((0.5 - py) * (max * 2));
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  className?: string;
  style?: CSSProperties;
}

export function Parallax({ children, offset = 60, className, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  );
}

export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
  lift = -4,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: lift }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className={cn(
        "fixed inset-x-0 top-0 z-[60] h-[2px] bg-accent",
        className
      )}
    />
  );
}

export const ease = { out: EASE_OUT, inOut: EASE_IN_OUT };
