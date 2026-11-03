import { tokenize } from "./text";

export interface CategoryRule {
  id: string;
  label: string;
  keywords: string[];
  queryHints: string[];
  bullets: string[];
  hashtags: string[];
  /** Typical landed supplier cost range in ZAR. */
  costRange: [number, number];
}

export const CATEGORIES: CategoryRule[] = [
  {
    id: "tech",
    label: "Tech & Gadgets",
    keywords: ["phone", "charger", "earbuds", "headphones", "speaker", "smartwatch", "camera", "drone", "gadget", "usb", "bluetooth", "power bank", "projector", "keyboard", "mouse", "monitor", "console", "gaming", "tablet", "laptop", "tech", "wireless", "led", "smart"],
    queryHints: ["wireless gadget", "smart accessory"],
    bullets: [
      "Pairs with your phone in seconds — no fiddly setup",
      "Built for everyday carry, not just the box",
      "Long battery life for load-shedding days",
      "Compact enough for a backpack or desk drawer",
      "Quality-checked before it leaves our warehouse",
    ],
    hashtags: ["#tech", "#gadgets", "#techaustralia", "#southafrica", "#giftidea"],
    costRange: [90, 420],
  },
  {
    id: "home",
    label: "Home & Living",
    keywords: ["lamp", "light", "organizer", "storage", "decor", "cushion", "blanket", "curtain", "rug", "vase", "shelf", "portable fan", "misting fan", "desk fan", "standing fan", "humidifier", "diffuser", "home", "kitchen", "air fryer", "load shedding", "loadshedding", "eskom", "braai", "garden", "beach", "umbrella"],
    queryHints: ["home organisation gadget", "useful home accessory"],
    bullets: [
      "Makes the everyday a little easier",
      "Looks good enough to leave on display",
      "Sturdy build that survives real life",
      "Easy to clean and store",
      "A small upgrade with an instant payoff",
    ],
    hashtags: ["#homeliving", "#homehacks", "#southafricanhome", "#loadshedding", "#interiors"],
    costRange: [80, 380],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    keywords: ["bottle", "mug", "blender", "cookware", "knife", "coffee", "kettle", "lunch", "food", "recipe", "cake", "ice cream", "creami", "juicer", "toaster", "kitchen", "drink", "hydration"],
    queryHints: ["kitchen gadget", "food prep accessory"],
    bullets: [
      "Saves time on the daily prep grind",
      "Easy to rinse, dishwasher-friendly parts",
      "Compact footprint for small kitchens",
      "Built for real weeknight cooking",
      "A practical upgrade you will actually use",
    ],
    hashtags: ["#kitchengadgets", "#foodie", "#homecooking", "#southafrica", "#kitchenhacks"],
    costRange: [70, 450],
  },
  {
    id: "fitness",
    label: "Fitness & Outdoors",
    keywords: ["gym", "fitness", "yoga", "running", "dumbbell", "resistance", "bike", "cycling", "sport", "workout", "massage gun", "tracker", "hiking", "camping", "tent", "trail", "marathon", "comrades", "parkrun"],
    queryHints: ["fitness accessory", "outdoor gear"],
    bullets: [
      "Built to keep up with your training",
      "Fits in a gym bag or backpack",
      "Grippy, durable materials that last",
      "Easy to use without a personal trainer",
      "A simple way to level up your routine",
    ],
    hashtags: ["#fitness", "#gymtok", "#running", "#outdoors", "#southafrica"],
    costRange: [90, 500],
  },
  {
    id: "beauty",
    label: "Beauty & Wellness",
    keywords: ["skincare", "serum", "makeup", "hair", "beauty", "facial", "gua sha", "lash", "nail", "skin", "acne", "led mask", "massage", "sleep", "pillow", "posture", "wellness", "supplement"],
    queryHints: ["beauty tool", "self care accessory"],
    bullets: [
      "A spa-level ritual at home",
      "Gentle enough for regular use",
      "Compact, travel-friendly design",
      "Easy to follow in a few minutes a day",
      "A thoughtful gift that actually gets used",
    ],
    hashtags: ["#skincare", "#beautyhacks", "#selfcare", "#glowup", "#southafrica"],
    costRange: [60, 380],
  },
  {
    id: "fashion",
    label: "Fashion & Accessories",
    keywords: ["shoe", "sneaker", "bag", "backpack", "jacket", "hoodie", "dress", "shirt", "sunglasses", "jewelry", "ring", "necklace", "hat", "cap", "watch", "formal", "matric dance", "springboks", "bokke", "rugby"],
    queryHints: ["fashion accessory", "everyday carry"],
    bullets: [
      "Easy to style with what you already own",
      "Comfortable enough for all-day wear",
      "Durable materials and clean finishing",
      "A small detail that lifts the whole look",
      "Sized and quality-checked before dispatch",
    ],
    hashtags: ["#fashion", "#ootd", "#styleinspo", "#southafricanfashion", "#accessories"],
    costRange: [80, 420],
  },
  {
    id: "pets",
    label: "Pets",
    keywords: ["pet", "dog", "cat", "puppy", "kitten", "aquarium", "leash", "litter"],
    queryHints: ["pet accessory", "dog gadget"],
    bullets: [
      "Made for everyday pet chaos",
      "Easy to clean after muddy adventures",
      "Safe, pet-friendly materials",
      "Keeps treats, toys, or gear tidy",
      "A small upgrade your pet will notice",
    ],
    hashtags: ["#petsoftiktok", "#dogsofinstagram", "#catsofinstagram", "#petcare", "#southafrica"],
    costRange: [60, 300],
  },
  {
    id: "auto",
    label: "Car & Travel",
    keywords: ["car", "vehicle", "dashcam", "tyre", "tire", "gps", "motorcycle", "commute", "road trip", "travel", "luggage", "suitcase"],
    queryHints: ["car accessory", "travel gadget"],
    bullets: [
      "Fits most cars and everyday setups",
      "Installs in minutes, no tools needed",
      "Built for South African roads",
      "Keeps your cabin cleaner and calmer",
      "Compact, tough, and easy to store",
    ],
    hashtags: ["#caraccessories", "#roadtrip", "#travelgear", "#southafrica", "#carlife"],
    costRange: [80, 450],
  },
  {
    id: "office",
    label: "Desk & Office",
    keywords: ["desk", "office", "laptop stand", "mouse pad", "chair", "stationery", "planner", "notebook", "school", "study", "back to school"],
    queryHints: ["desk accessory", "study gadget"],
    bullets: [
      "Makes your workspace work harder",
      "Simple, clutter-free design",
      "Sturdy enough for daily use",
      "Fits a home desk or open-plan office",
      "A practical upgrade for focus",
    ],
    hashtags: ["#desksetup", "#officehacks", "#studygram", "#southafrica", "#productivity"],
    costRange: [60, 350],
  },
  {
    id: "kids",
    label: "Kids & Baby",
    keywords: ["kids", "baby", "toy", "lego", "puzzle", "stroller", "nursery", "toddler", "child"],
    queryHints: ["kids toy", "baby accessory"],
    bullets: [
      "Built for small hands and big energy",
      "Easy to wipe down and pack away",
      "Safe, non-toxic materials",
      "Keeps little ones busy without a screen",
      "A gift parents will thank you for",
    ],
    hashtags: ["#kidsactivities", "#toddlertoys", "#momsofinstagram", "#southafrica", "#giftideas"],
    costRange: [60, 350],
  },
  {
    id: "lifestyle",
    label: "Trending",
    keywords: [],
    queryHints: ["trending product", "viral gadget"],
    bullets: [
      "The product behind the trend",
      "Simple to use, straight out of the box",
      "Compact and easy to store",
      "Quality-checked before dispatch",
      "Delivered anywhere in South Africa",
    ],
    hashtags: ["#trending", "#viral", "#southafrica", "#musthave", "#online shopping"],
    costRange: [80, 400],
  },
];

const EVENT_RULES: Array<{
  match: RegExp;
  query: string;
  category: string;
  angle: string;
}> = [
  {
    match: /load[\s-]?shedding|loadshedding|power\s?(outage|cut)|blackout|eskom|stage\s?[1-8]/i,
    query: "rechargeable led emergency light",
    category: "home",
    angle: "keep the lights on",
  },
  {
    match: /heat\s?wave|heatwave|hot\s?(weather|day)|scorching/i,
    query: "portable misting fan",
    category: "home",
    angle: "beat the heat",
  },
  {
    match: /cold\s?(front|snap|wave)|snow|freezing|winter\s?storm/i,
    query: "heated blanket throw",
    category: "home",
    angle: "stay warm",
  },
  {
    match: /springboks|bokke|rugby\s?(world\s?cup|final|match)|bafana\s?bafana|proteas/i,
    query: "supporter scarf and fan gear",
    category: "fashion",
    angle: "show your colours",
  },
  {
    match: /comrades|marathon|two\s?oceans|parkrun|ultra\s?run/i,
    query: "running hydration belt",
    category: "fitness",
    angle: "go the distance",
  },
  {
    match: /festival|concert|coachella|afropunk|rocking the daisies/i,
    query: "festival accessories set",
    category: "fashion",
    angle: "get festival ready",
  },
  {
    match: /valentine/i,
    query: "valentines gift set",
    category: "beauty",
    angle: "gift something they will remember",
  },
  {
    match: /mother'?s?\s?day/i,
    query: "mothers day gift set",
    category: "beauty",
    angle: "spoil her properly",
  },
  {
    match: /father'?s?\s?day/i,
    query: "fathers day gadget gift",
    category: "tech",
    angle: "a gift he will actually use",
  },
  {
    match: /black\s?friday|cyber\s?monday/i,
    query: "best tech deals",
    category: "tech",
    angle: "grab the deal before it goes",
  },
  {
    match: /christmas|festive\s?season|secret\s?santa/i,
    query: "christmas decor and gift set",
    category: "home",
    angle: "make it feel like Christmas",
  },
  {
    match: /back\s?to\s?school|school\s?(shoes|supplies|season)/i,
    query: "school supplies bundle",
    category: "office",
    angle: "start the term sorted",
  },
  {
    match: /matric\s?(dance|ball)|matric\s?farewell/i,
    query: "formal accessories set",
    category: "fashion",
    angle: "be the best dressed",
  },
  {
    match: /braai\s?day|heritage\s?day|national\s?braai/i,
    query: "braai accessories set",
    category: "home",
    angle: "braai like a pro",
  },
];

const BLOCKLIST = [
  "murder",
  "killed",
  "kill",
  "death",
  "died",
  "dead",
  "rape",
  "shooting",
  "shot",
  "stab",
  "crash",
  "accident",
  "war",
  "terror",
  "kidnap",
  "abuse",
  "suicide",
  "corruption",
  "arrest",
  "court",
  "trial",
  "jail",
  "prison",
  "election",
  "vote",
  "parliament",
  "zuma",
  "ramaphosa",
  "malema",
  "trump",
  "biden",
  "putin",
  "gaza",
  "israel",
  "ukraine",
  "crime",
  "hijack",
  "robbery",
  "protest",
  "strike",
  "xenophobia",
  "racism",
  "load shedding stage",
  "flood",
  "fire",
  "drought",
];

const COMMERCIAL_WORDS = [
  "buy",
  "price",
  "best",
  "deal",
  "sale",
  "gift",
  "review",
  "under",
  "cheap",
  "worth",
  "launch",
  "trending",
  "viral",
  "tiktok",
  "amazon",
  "takealot",
  "aliexpress",
  "must-have",
  "gadget",
  "hack",
];

const PRODUCT_NOUNS = [
  "phone",
  "charger",
  "earbuds",
  "headphones",
  "speaker",
  "watch",
  "camera",
  "drone",
  "lamp",
  "light",
  "fan",
  "bottle",
  "blender",
  "air fryer",
  "bag",
  "shoe",
  "sneaker",
  "jacket",
  "pillow",
  "massager",
  "toy",
  "lego",
  "gadget",
  "device",
  "tool",
  "kit",
  "set",
  "machine",
  "cleaner",
  "organizer",
  "stand",
  "tracker",
  "projector",
  "diffuser",
  "humidifier",
  "kettle",
  "mug",
  "backpack",
  "sunglasses",
  "serum",
  "mask",
];

export function isBlocked(text: string): boolean {
  const haystack = text.toLowerCase();
  return BLOCKLIST.some((word) => haystack.includes(word));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word/phrase match so "cap" does not match "cape" and "led" does not match "knowledge". */
export function containsKeyword(haystack: string, keyword: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword.toLowerCase())}([^a-z0-9]|$)`, "i");
  return pattern.test(haystack);
}

const INFO_PATTERNS: RegExp[] = [
  /\bweather\b/,
  /\bforecast\b/,
  /\btempo\b/,
  /\bclima\b/,
  /\bm[eé]t[eé]o\b/,
  /\bvs\b/,
  /\bvs\./,
  /\bbest bets?\b/,
  /\bodds\b/,
  /\bfixtures?\b/,
  /\bline-?up\b/,
  /\blive score\b/,
  /\bresults?\b/,
  /\bstandings?\b/,
  /\bleague\b/,
  /\btransfer news\b/,
  /\binjur(y|ies)\b/,
  /\bexchange rate\b/,
  /\brand\s*(to|vs|versus)?\s*dollar\b/,
  /\bhoroscope\b/,
  /\blottery\b/,
  /\blotto\b/,
  /\bprayer times?\b/,
  /\bpublic holidays?\b/,
  /\bschool calendar\b/,
  /\bload shedding schedule\b/,
  /\binterest rate\b/,
  /\binflation\b/,
  /\bgdp\b/,
  /\bjse\b/,
  /\bshares?\b/,
  /\bholdings?\b/,
  /\bmarket cap\b/,
  /\bbreaking news\b/,
  /\blive updates?\b/,
  /\bhighlights?\b/,
  /\brecap\b/,
];

/** Reject informational queries (weather, fixtures, markets) that are not product opportunities. */
export function isProductCandidate(text: string): boolean {
  const lower = text.toLowerCase();
  if (INFO_PATTERNS.some((pattern) => pattern.test(lower))) return false;
  if (matchEvent(text)) return true;

  const category = inferCategory(text);
  if (category.id !== "lifestyle") return true;
  return commercialScore(text) >= 2;
}

export function inferCategory(text: string): CategoryRule {
  const haystack = ` ${text.toLowerCase()} `;
  let best = CATEGORIES[CATEGORIES.length - 1] as CategoryRule;
  let bestHits = 0;

  for (const category of CATEGORIES) {
    const hits = category.keywords.filter((keyword) => containsKeyword(haystack, keyword)).length;
    if (hits > bestHits) {
      best = category;
      bestHits = hits;
    }
  }

  return best;
}

export function matchEvent(text: string): { query: string; category: string; angle: string } | null {
  for (const rule of EVENT_RULES) {
    if (rule.match.test(text)) {
      return { query: rule.query, category: rule.category, angle: rule.angle };
    }
  }
  return null;
}

export function commercialScore(text: string): number {
  const haystack = text.toLowerCase();
  let score = 0;
  for (const word of COMMERCIAL_WORDS) if (containsKeyword(haystack, word)) score += 2;
  for (const noun of PRODUCT_NOUNS) if (containsKeyword(haystack, noun)) score += 3;
  return Math.min(score, 14);
}

export function deriveQuery(title: string, category: CategoryRule): string {
  const event = matchEvent(title);
  if (event) return event.query;

  const cleaned = title
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s+[-|–]\s+.*$/, "")
    .replace(/\?+$/, "")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 0 && words.length <= 6) return cleaned;

  const tokens = tokenize(cleaned).slice(0, 4);
  if (tokens.length >= 2) return tokens.join(" ");
  return category.queryHints[0] ?? cleaned;
}

export function categoryRule(id: string): CategoryRule {
  return CATEGORIES.find((category) => category.id === id) ?? (CATEGORIES[CATEGORIES.length - 1] as CategoryRule);
}

export function hashtagsFor(category: CategoryRule): string {
  return category.hashtags.join(" ");
}
