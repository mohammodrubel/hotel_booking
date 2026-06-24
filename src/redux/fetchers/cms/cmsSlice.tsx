import { RootState } from "@/redux/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

export interface HeroContent {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  titleAccent: string;
  subtitle: string;
  socialProofText: string;
  socialProofAvatars: number[];
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}

export interface PerkItem {
  icon: "sparkles" | "shield" | "headphones" | "heart" | "compass" | "globe";
  title: string;
  body: string;
}

export interface PerksContent {
  badge: string;
  title: string;
  subtitle: string;
  items: PerkItem[];
}

export interface HowItWorksStep {
  title: string;
  body: string;
}

export interface HowItWorksContent {
  badge: string;
  title: string;
  subtitle: string;
  steps: HowItWorksStep[];
}

export interface SectionIntro {
  badge: string;
  title: string;
  subtitle: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

export interface TestimonialsContent extends SectionIntro {
  items: Testimonial[];
}

export interface JournalArticle {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
}

export interface JournalContent extends SectionIntro {
  articles: JournalArticle[];
}

export interface CtaContent {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface Homepage {
  hero: HeroContent;
  trustLogos: string[];
  stats: StatItem[];
  perks: PerksContent;
  howItWorks: HowItWorksContent;
  featured: SectionIntro;
  destinationsIntro: SectionIntro;
  testimonials: TestimonialsContent;
  journal: JournalContent;
  cta: CtaContent;
}

export const defaultHomepage: Homepage = {
  hero: {
    badge: "Curated stays · Summer 2026",
    titleLine1: "Reserve calm.",
    titleLine2: "Discover the world's",
    titleAccent: "finest hotels.",
    subtitle:
      "Hand-picked emerald escapes, golden city suites, and quiet mountain retreats — all in one place.",
    socialProofText: "4.9 · 12k+ happy travelers",
    socialProofAvatars: [11, 12, 13, 14],
  },
  trustLogos: [
    "Condé Nast",
    "Travel + Leisure",
    "The Times",
    "Monocle",
    "AFAR",
    "Wallpaper*",
  ],
  stats: [
    { value: 1200, suffix: "+", label: "Curated hotels" },
    { value: 96, suffix: "", label: "Countries" },
    { value: 4.9, suffix: "/5", label: "Guest rating", decimals: 1 },
    { value: 24, suffix: "/7", label: "Concierge" },
  ],
  perks: {
    badge: "Why Stayhaus",
    title: "Booking, the way it should feel.",
    subtitle:
      "We do the digging so you don't end up in a hotel with a bathroom that has its own bathroom.",
    items: [
      {
        icon: "sparkles",
        title: "Hand-picked stays",
        body: "Every property reviewed by our editors. No filler, no fluff.",
      },
      {
        icon: "shield",
        title: "Best rate guarantee",
        body: "Find a lower price elsewhere — we refund the difference.",
      },
      {
        icon: "headphones",
        title: "Concierge on demand",
        body: "A real person, 24/7. Itineraries, upgrades, last-minute swaps.",
      },
    ],
  },
  howItWorks: {
    badge: "How it works",
    title: "Three steps to a real holiday.",
    subtitle:
      "From browsing tabs to checking in, in under five minutes.",
    steps: [
      {
        title: "Pick a place",
        body: "Browse curated stays by destination, mood, or season. Save what you love to your wishlist.",
      },
      {
        title: "Reserve in seconds",
        body: "Choose your dates, pick a room, pay securely. Instant confirmation in your inbox.",
      },
      {
        title: "Show up. Exhale.",
        body: "Get a check-in guide 48 hours before arrival. The concierge handles the rest.",
      },
    ],
  },
  featured: {
    badge: "Featured",
    title: "Stays our editors are obsessing over",
    subtitle: "Premium picks rated 4.7+ by our guests. Updated weekly.",
  },
  destinationsIntro: {
    badge: "Where to next",
    title: "Cities and corners worth packing for",
    subtitle: "Where our guests are heading next",
  },
  testimonials: {
    badge: "Loved by travelers",
    title: "Words from people who actually checked out",
    subtitle: "",
    items: [
      {
        quote:
          "Booked the Emerald Grand in 90 seconds. Lit a candle. Sunset arrived right on schedule.",
        name: "Mia R.",
        location: "Berlin",
      },
      {
        quote:
          "The concierge fixed our flight, our table at Osteria, and our flat tire by 8 AM.",
        name: "Daniel K.",
        location: "Sydney",
      },
      {
        quote:
          "I have stopped using every other booking site. Stayhaus is the only tab now.",
        name: "Priya M.",
        location: "Mumbai",
      },
    ],
  },
  journal: {
    badge: "Stayhaus journal",
    title: "Slow travel, told well.",
    subtitle:
      "Field notes, room reports, and the occasional argument about hotel breakfast.",
    articles: [
      {
        title: "Why the best hotels still answer the phone",
        excerpt:
          "On the quiet luxury of being recognized, and the small staffs who pull it off.",
        category: "Field notes",
        readTime: "6 min read",
        image: "/images/jeanvdmeulen-dining-room-3108037_1920.jpg",
      },
      {
        title: "A weekend in Lisbon, planned by no one in particular",
        excerpt:
          "Three days, two trams, one extremely good pastéis de nata. Itinerary inside.",
        category: "Itineraries",
        readTime: "8 min read",
        image: "/images/vinnyciro-living-room-581073.jpg",
      },
      {
        title: "The case for the small hotel breakfast",
        excerpt:
          "A short manifesto against buffets, and a long love letter to the soft-boiled egg.",
        category: "Room reports",
        readTime: "4 min read",
        image: "/images/4787421-interior-2685521.jpg",
      },
    ],
  },
  cta: {
    title: "Your next stay is one tap away.",
    body: "Skip the tabs. Skip the upsells. Pick a place. Show up. Exhale.",
    primaryLabel: "Find your stay",
    primaryHref: "/hotels",
    secondaryLabel: "Create account",
    secondaryHref: "/register",
  },
};

interface CmsState {
  homepage: Homepage;
}

const initialState: CmsState = {
  homepage: defaultHomepage,
};

const cmsSlice = createSlice({
  name: "cms",
  initialState,
  reducers: {
    updateHero: (state, action: PayloadAction<Partial<HeroContent>>) => {
      state.homepage.hero = { ...state.homepage.hero, ...action.payload };
    },
    updateTrustLogos: (state, action: PayloadAction<string[]>) => {
      state.homepage.trustLogos = action.payload;
    },
    updateStats: (state, action: PayloadAction<StatItem[]>) => {
      state.homepage.stats = action.payload;
    },
    updatePerks: (state, action: PayloadAction<Partial<PerksContent>>) => {
      state.homepage.perks = { ...state.homepage.perks, ...action.payload };
    },
    updateHowItWorks: (
      state,
      action: PayloadAction<Partial<HowItWorksContent>>
    ) => {
      state.homepage.howItWorks = {
        ...state.homepage.howItWorks,
        ...action.payload,
      };
    },
    updateFeatured: (state, action: PayloadAction<Partial<SectionIntro>>) => {
      state.homepage.featured = {
        ...state.homepage.featured,
        ...action.payload,
      };
    },
    updateDestinationsIntro: (
      state,
      action: PayloadAction<Partial<SectionIntro>>
    ) => {
      state.homepage.destinationsIntro = {
        ...state.homepage.destinationsIntro,
        ...action.payload,
      };
    },
    updateTestimonials: (
      state,
      action: PayloadAction<Partial<TestimonialsContent>>
    ) => {
      state.homepage.testimonials = {
        ...state.homepage.testimonials,
        ...action.payload,
      };
    },
    updateJournal: (state, action: PayloadAction<Partial<JournalContent>>) => {
      state.homepage.journal = {
        ...state.homepage.journal,
        ...action.payload,
      };
    },
    updateCta: (state, action: PayloadAction<Partial<CtaContent>>) => {
      state.homepage.cta = { ...state.homepage.cta, ...action.payload };
    },
    resetHomepage: (state) => {
      state.homepage = defaultHomepage;
    },
  },
});

export const {
  updateHero,
  updateTrustLogos,
  updateStats,
  updatePerks,
  updateHowItWorks,
  updateFeatured,
  updateDestinationsIntro,
  updateTestimonials,
  updateJournal,
  updateCta,
  resetHomepage,
} = cmsSlice.actions;

export default cmsSlice.reducer;

export const useHomepage = (): Homepage =>
  useSelector((s: RootState) => s.cms.homepage);
