import { SEED, SEED_VERSION, type SeedDB } from "./seed";

const STORAGE_KEY = "stayhaus.mockdb.v" + SEED_VERSION;

let memory: SeedDB | null = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function load(): SeedDB {
  if (memory) return memory;
  if (!isBrowser()) {
    memory = clone(SEED);
    return memory;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      memory = JSON.parse(raw) as SeedDB;
      return memory;
    } catch {
      // fall through to fresh seed
    }
  }
  memory = clone(SEED);
  persist();
  return memory;
}

function persist() {
  if (!isBrowser() || !memory) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // ignore quota errors
  }
}

export const db = {
  read<K extends keyof SeedDB>(key: K): SeedDB[K] {
    return load()[key];
  },
  write<K extends keyof SeedDB>(key: K, value: SeedDB[K]) {
    const data = load();
    data[key] = value;
    persist();
  },
  mutate<K extends keyof SeedDB>(key: K, fn: (current: SeedDB[K]) => SeedDB[K]) {
    const data = load();
    data[key] = fn(data[key]);
    persist();
    return data[key];
  },
  resetAll() {
    memory = clone(SEED);
    persist();
  },
  resetKey<K extends keyof SeedDB>(key: K) {
    const data = load();
    data[key] = clone(SEED[key]);
    persist();
  },
};
