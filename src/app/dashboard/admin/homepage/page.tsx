"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ExternalLink,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Sparkles,
  Layout,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/motion/Motion";
import { imageFor } from "@/lib/localImages";
import {
  resetHomepage,
  updateCta,
  updateDestinationsIntro,
  updateFeatured,
  updateHero,
  updateHowItWorks,
  updateJournal,
  updatePerks,
  updateStats,
  updateTestimonials,
  updateTrustLogos,
  useHomepage,
  type HeroContent,
  type HowItWorksContent,
  type JournalContent,
  type PerkItem,
  type PerksContent,
  type StatItem,
  type TestimonialsContent,
  type CtaContent,
  type SectionIntro,
  type Testimonial,
  type HowItWorksStep,
  type JournalArticle,
} from "@/redux/fetchers/cms/cmsSlice";
import { useAppDispatch } from "@/redux/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "trust", label: "Trust logos" },
  { id: "stats", label: "Stats" },
  { id: "featured", label: "Featured" },
  { id: "perks", label: "Perks" },
  { id: "howItWorks", label: "How it works" },
  { id: "destinations", label: "Destinations" },
  { id: "testimonials", label: "Testimonials" },
  { id: "journal", label: "Journal" },
  { id: "cta", label: "Call to action" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

const ICON_OPTIONS: PerkItem["icon"][] = [
  "sparkles",
  "shield",
  "headphones",
  "heart",
  "compass",
  "globe",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        props.className
      )}
    />
  );
}

function SectionShell({
  title,
  description,
  onSave,
  onReset,
  children,
  saved,
}: {
  title: string;
  description: string;
  onSave?: () => void;
  onReset?: () => void;
  saved?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          {onReset && (
            <Button
              variant="outline"
              onClick={onReset}
              className="gap-2 rounded-xl"
            >
              <RotateCcw className="size-3.5" />
              Reset section
            </Button>
          )}
          {onSave && (
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex"
            >
              <Button
                onClick={onSave}
                className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/85"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {saved ? (
                    <motion.span
                      key="saved"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check className="size-3.5" />
                      Saved
                    </motion.span>
                  ) : (
                    <motion.span
                      key="save"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Save className="size-3.5" />
                      Save changes
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function HomepageEditorPage() {
  const cms = useHomepage();
  const dispatch = useAppDispatch();
  const [section, setSection] = useState<SectionId>("hero");
  const [savedFlag, setSavedFlag] = useState(false);

  const flashSaved = () => {
    setSavedFlag(true);
    toast.success("Saved");
    setTimeout(() => setSavedFlag(false), 1400);
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge className="border border-border bg-secondary text-foreground hover:bg-secondary">
              <Sparkles className="size-3 text-accent" />
              Content editor
            </Badge>
            <h1 className="mt-3 text-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Homepage
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Edit every section. Changes persist instantly across the site.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" target="_blank">
              <Button variant="outline" className="gap-2 rounded-xl">
                Open homepage
                <ExternalLink className="size-3.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => {
                if (confirm("Reset entire homepage to defaults?")) {
                  dispatch(resetHomepage());
                  toast.success("Homepage reset to defaults");
                }
              }}
            >
              <RotateCcw className="size-3.5" />
              Reset all
            </Button>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex flex-row flex-wrap gap-1 rounded-2xl bg-card p-2 ring-1 ring-foreground/10 lg:flex-col">
            {SECTIONS.map((s) => {
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "relative rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="cms-active"
                      className="absolute inset-0 rounded-xl bg-secondary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative inline-flex items-center gap-2">
                    <Layout className="size-3.5" />
                    {s.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 rounded-3xl bg-card p-7 ring-1 ring-foreground/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {section === "hero" && (
                <HeroEditor
                  value={cms.hero}
                  onSave={(v) => {
                    dispatch(updateHero(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "trust" && (
                <TrustEditor
                  value={cms.trustLogos}
                  onSave={(v) => {
                    dispatch(updateTrustLogos(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "stats" && (
                <StatsEditor
                  value={cms.stats}
                  onSave={(v) => {
                    dispatch(updateStats(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "featured" && (
                <IntroEditor
                  title="Featured hotels"
                  description="Section above the featured carousel."
                  value={cms.featured}
                  onSave={(v) => {
                    dispatch(updateFeatured(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "perks" && (
                <PerksEditor
                  value={cms.perks}
                  onSave={(v) => {
                    dispatch(updatePerks(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "howItWorks" && (
                <HowItWorksEditor
                  value={cms.howItWorks}
                  onSave={(v) => {
                    dispatch(updateHowItWorks(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "destinations" && (
                <IntroEditor
                  title="Destinations"
                  description="Intro above the destinations grid."
                  value={cms.destinationsIntro}
                  onSave={(v) => {
                    dispatch(updateDestinationsIntro(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "testimonials" && (
                <TestimonialsEditor
                  value={cms.testimonials}
                  onSave={(v) => {
                    dispatch(updateTestimonials(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "journal" && (
                <JournalEditor
                  value={cms.journal}
                  onSave={(v) => {
                    dispatch(updateJournal(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
              {section === "cta" && (
                <CtaEditor
                  value={cms.cta}
                  onSave={(v) => {
                    dispatch(updateCta(v));
                    flashSaved();
                  }}
                  saved={savedFlag}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Per-section editors
// ----------------------------------------------------------------------------

function useMirror<T>(value: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [s, set] = useState<T>(value);
  useEffect(() => {
    set(value);
  }, [value]);
  return [s, set];
}

function HeroEditor({
  value,
  onSave,
  saved,
}: {
  value: HeroContent;
  onSave: (v: HeroContent) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  return (
    <SectionShell
      title="Hero"
      description="Top-of-page headline, subtitle, social proof."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Badge text">
          <Input
            value={v.badge}
            onChange={(e) => set({ ...v, badge: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Social proof line">
          <Input
            value={v.socialProofText}
            onChange={(e) => set({ ...v, socialProofText: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Title line 1">
          <Input
            value={v.titleLine1}
            onChange={(e) => set({ ...v, titleLine1: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Title line 2">
          <Input
            value={v.titleLine2}
            onChange={(e) => set({ ...v, titleLine2: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Title accent (shimmer)">
          <Input
            value={v.titleAccent}
            onChange={(e) => set({ ...v, titleAccent: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Avatar IDs (comma-separated, 1–70)">
          <Input
            value={v.socialProofAvatars.join(", ")}
            onChange={(e) =>
              set({
                ...v,
                socialProofAvatars: e.target.value
                  .split(",")
                  .map((s) => Number(s.trim()))
                  .filter((n) => Number.isFinite(n) && n > 0),
              })
            }
            className="h-11 rounded-xl"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Subtitle">
            <TextArea
              value={v.subtitle}
              onChange={(e) => set({ ...v, subtitle: e.target.value })}
              rows={3}
            />
          </Field>
        </div>
      </div>
    </SectionShell>
  );
}

function TrustEditor({
  value,
  onSave,
  saved,
}: {
  value: string[];
  onSave: (v: string[]) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value.join("\n"));
  return (
    <SectionShell
      title="Trust logos"
      description="One name per line. Shown in the marquee strip."
      onSave={() =>
        onSave(
          v
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      }
      saved={saved}
    >
      <Field label="Logos">
        <TextArea
          value={v}
          onChange={(e) => set(e.target.value)}
          rows={8}
          placeholder="Condé Nast\nTravel + Leisure\n..."
        />
      </Field>
    </SectionShell>
  );
}

function StatsEditor({
  value,
  onSave,
  saved,
}: {
  value: StatItem[];
  onSave: (v: StatItem[]) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  const update = (i: number, patch: Partial<StatItem>) =>
    set(v.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <SectionShell
      title="Stats strip"
      description="Four animated counter cards."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <div className="space-y-4">
        {v.map((s, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-2xl bg-secondary/40 p-4 sm:grid-cols-[1fr_0.8fr_1.4fr_0.8fr]"
          >
            <Field label="Value">
              <Input
                type="number"
                value={s.value}
                step="0.1"
                onChange={(e) =>
                  update(i, { value: Number(e.target.value) || 0 })
                }
                className="h-11 rounded-xl bg-background"
              />
            </Field>
            <Field label="Suffix">
              <Input
                value={s.suffix}
                onChange={(e) => update(i, { suffix: e.target.value })}
                className="h-11 rounded-xl bg-background"
              />
            </Field>
            <Field label="Label">
              <Input
                value={s.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="h-11 rounded-xl bg-background"
              />
            </Field>
            <Field label="Decimals">
              <Input
                type="number"
                min={0}
                max={4}
                value={s.decimals ?? 0}
                onChange={(e) =>
                  update(i, {
                    decimals: Number(e.target.value) || 0,
                  })
                }
                className="h-11 rounded-xl bg-background"
              />
            </Field>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function PerksEditor({
  value,
  onSave,
  saved,
}: {
  value: PerksContent;
  onSave: (v: PerksContent) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  const updateItem = (i: number, patch: Partial<PerkItem>) =>
    set({
      ...v,
      items: v.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  return (
    <SectionShell
      title="Perks"
      description="Three feature cards on the dark band."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <IntroFields
        value={v}
        onChange={(patch) => set({ ...v, ...patch } as PerksContent)}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Items</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() =>
            set({
              ...v,
              items: [
                ...v.items,
                { icon: "sparkles", title: "New perk", body: "Describe it." },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add perk
        </Button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {v.items.map((it, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-2xl bg-secondary/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Perk {i + 1}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    set({
                      ...v,
                      items: v.items.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Icon">
                  <div className="flex flex-wrap gap-1.5">
                    {ICON_OPTIONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => updateItem(i, { icon: ic })}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                          it.icon === ic
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/40"
                        )}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Title">
                  <Input
                    value={it.title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                    className="h-11 rounded-xl bg-background"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Body">
                    <TextArea
                      rows={2}
                      value={it.body}
                      onChange={(e) => updateItem(i, { body: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

function HowItWorksEditor({
  value,
  onSave,
  saved,
}: {
  value: HowItWorksContent;
  onSave: (v: HowItWorksContent) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  const updateStep = (i: number, patch: Partial<HowItWorksStep>) =>
    set({
      ...v,
      steps: v.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  return (
    <SectionShell
      title="How it works"
      description="Three numbered steps that explain the booking flow."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <IntroFields
        value={v}
        onChange={(patch) => set({ ...v, ...patch } as HowItWorksContent)}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Steps</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() =>
            set({
              ...v,
              steps: [
                ...v.steps,
                { title: "New step", body: "Explain what happens here." },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add step
        </Button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {v.steps.map((s, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-2xl bg-secondary/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Step {i + 1}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    set({
                      ...v,
                      steps: v.steps.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
              <div className="mt-3 grid gap-3">
                <Field label="Title">
                  <Input
                    value={s.title}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    className="h-11 rounded-xl bg-background"
                  />
                </Field>
                <Field label="Body">
                  <TextArea
                    rows={2}
                    value={s.body}
                    onChange={(e) => updateStep(i, { body: e.target.value })}
                  />
                </Field>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

function IntroEditor({
  title,
  description,
  value,
  onSave,
  saved,
}: {
  title: string;
  description: string;
  value: SectionIntro;
  onSave: (v: SectionIntro) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  return (
    <SectionShell
      title={title}
      description={description}
      onSave={() => onSave(v)}
      saved={saved}
    >
      <IntroFields value={v} onChange={(patch) => set({ ...v, ...patch })} />
    </SectionShell>
  );
}

function IntroFields<T extends SectionIntro>({
  value,
  onChange,
}: {
  value: T;
  onChange: (patch: Partial<SectionIntro>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Badge">
        <Input
          value={value.badge}
          onChange={(e) => onChange({ badge: e.target.value })}
          className="h-11 rounded-xl"
        />
      </Field>
      <Field label="Title">
        <Input
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-11 rounded-xl"
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Subtitle">
          <TextArea
            rows={2}
            value={value.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

function TestimonialsEditor({
  value,
  onSave,
  saved,
}: {
  value: TestimonialsContent;
  onSave: (v: TestimonialsContent) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  const updateItem = (i: number, patch: Partial<Testimonial>) =>
    set({
      ...v,
      items: v.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  return (
    <SectionShell
      title="Testimonials"
      description="Three quotes from happy guests."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <IntroFields
        value={v}
        onChange={(patch) => set({ ...v, ...patch } as TestimonialsContent)}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Items</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() =>
            set({
              ...v,
              items: [
                ...v.items,
                { quote: "New quote.", name: "Guest", location: "Earth" },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add testimonial
        </Button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {v.items.map((it, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-2xl bg-secondary/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Testimonial {i + 1}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    set({
                      ...v,
                      items: v.items.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <Input
                    value={it.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    className="h-11 rounded-xl bg-background"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={it.location}
                    onChange={(e) => updateItem(i, { location: e.target.value })}
                    className="h-11 rounded-xl bg-background"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Quote">
                    <TextArea
                      rows={3}
                      value={it.quote}
                      onChange={(e) => updateItem(i, { quote: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

function JournalEditor({
  value,
  onSave,
  saved,
}: {
  value: JournalContent;
  onSave: (v: JournalContent) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  const updateArticle = (i: number, patch: Partial<JournalArticle>) =>
    set({
      ...v,
      articles: v.articles.map((a, idx) =>
        idx === i ? { ...a, ...patch } : a
      ),
    });
  return (
    <SectionShell
      title="Journal"
      description="Editorial articles featured on the homepage."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <IntroFields
        value={v}
        onChange={(patch) => set({ ...v, ...patch } as JournalContent)}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Articles</p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() =>
            set({
              ...v,
              articles: [
                ...v.articles,
                {
                  title: "New article",
                  excerpt: "One line about it.",
                  category: "Field notes",
                  readTime: "5 min read",
                  image: imageFor(`journal-${Date.now()}`),
                },
              ],
            })
          }
        >
          <Plus className="size-3.5" />
          Add article
        </Button>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {v.articles.map((a, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="grid gap-3 rounded-2xl bg-secondary/40 p-4 sm:grid-cols-[120px_1fr]"
            >
              <div>
                <img
                  src={a.image}
                  alt={a.title}
                  className="h-24 w-full rounded-xl object-cover"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Article {i + 1}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      set({
                        ...v,
                        articles: v.articles.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title">
                    <Input
                      value={a.title}
                      onChange={(e) =>
                        updateArticle(i, { title: e.target.value })
                      }
                      className="h-10 rounded-xl bg-background"
                    />
                  </Field>
                  <Field label="Category">
                    <Input
                      value={a.category}
                      onChange={(e) =>
                        updateArticle(i, { category: e.target.value })
                      }
                      className="h-10 rounded-xl bg-background"
                    />
                  </Field>
                  <Field label="Read time">
                    <Input
                      value={a.readTime}
                      onChange={(e) =>
                        updateArticle(i, { readTime: e.target.value })
                      }
                      className="h-10 rounded-xl bg-background"
                    />
                  </Field>
                  <Field label="Image URL">
                    <Input
                      value={a.image}
                      onChange={(e) =>
                        updateArticle(i, { image: e.target.value })
                      }
                      className="h-10 rounded-xl bg-background"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Excerpt">
                      <TextArea
                        rows={2}
                        value={a.excerpt}
                        onChange={(e) =>
                          updateArticle(i, { excerpt: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}

function CtaEditor({
  value,
  onSave,
  saved,
}: {
  value: CtaContent;
  onSave: (v: CtaContent) => void;
  saved: boolean;
}) {
  const [v, set] = useMirror(value);
  return (
    <SectionShell
      title="Call to action"
      description="The dark conversion card at the bottom."
      onSave={() => onSave(v)}
      saved={saved}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title">
            <Input
              value={v.title}
              onChange={(e) => set({ ...v, title: e.target.value })}
              className="h-11 rounded-xl"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Body">
            <TextArea
              rows={3}
              value={v.body}
              onChange={(e) => set({ ...v, body: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Primary button label">
          <Input
            value={v.primaryLabel}
            onChange={(e) => set({ ...v, primaryLabel: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Primary button link">
          <Input
            value={v.primaryHref}
            onChange={(e) => set({ ...v, primaryHref: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Secondary button label">
          <Input
            value={v.secondaryLabel}
            onChange={(e) => set({ ...v, secondaryLabel: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Secondary button link">
          <Input
            value={v.secondaryHref}
            onChange={(e) => set({ ...v, secondaryHref: e.target.value })}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowUpRight className="size-3" />
        Hint: use `/hotels`, `/register`, or external URLs.
      </div>
    </SectionShell>
  );
}
