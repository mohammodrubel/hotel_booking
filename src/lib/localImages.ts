export const localImages: readonly string[] = [
  "/images/manuelajaeger-hotel-1749602.jpg",
  "/images/tianya1223-hotel-6878057.jpg",
  "/images/palacioerick-indoors-4234071.jpg",
  "/images/erikawittlieb-living-room-2155376.jpg",
  "/images/amigos3d-living-room-1733750.jpg",
  "/images/vinnyciro-living-room-581073.jpg",
  "/images/jeanvdmeulen-dining-room-3108037_1920.jpg",
  "/images/4787421-interior-2685521.jpg",
  "/images/archhiba_89-apartment-6620407.jpg",
  "/images/keresi72-bedroom-416062_1920.jpg",
  "/images/gregorybutler-bedroom-389254_1920.jpg",
  "/images/637884-bed-913051.jpg",
  "/images/pexels-bed-1846251.jpg",
  "/images/pexels-furniture-1840463.jpg",
  "/images/lequangutc89-bedroom-6577523.jpg",
  "/images/manbob86-bedroom-1872196.jpg",
  "/images/stubaileyphoto-bedroom-5772286.jpg",
  "/images/23555986-bedroom-6778193.jpg",
  "/images/23555986-bedroom-6778193-1.jpg",
];

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function imageFor(seed: string): string {
  return localImages[hash(seed) % localImages.length]!;
}

export const heroImages = {
  auth: "/images/manuelajaeger-hotel-1749602.jpg",
  journal1: "/images/jeanvdmeulen-dining-room-3108037_1920.jpg",
  journal2: "/images/vinnyciro-living-room-581073.jpg",
  journal3: "/images/4787421-interior-2685521.jpg",
} as const;
