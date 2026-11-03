export interface CategoryMeta {
  id: string;
  label: string;
  blurb: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "tech",
    label: "Tech & Gadgets",
    blurb: "The small upgrades that make everyday tech feel new.",
  },
  {
    id: "home",
    label: "Home & Living",
    blurb: "Useful, good-looking things for the space you actually live in.",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    blurb: "Prep, store and serve with less friction.",
  },
  {
    id: "fitness",
    label: "Fitness & Outdoors",
    blurb: "Gear for the gym, the trail and the early run.",
  },
  {
    id: "beauty",
    label: "Beauty & Wellness",
    blurb: "Small rituals with a visible payoff.",
  },
  {
    id: "fashion",
    label: "Fashion & Accessories",
    blurb: "Details that lift the whole look.",
  },
  {
    id: "pets",
    label: "Pets",
    blurb: "For the small creatures running the house.",
  },
  {
    id: "auto",
    label: "Car & Travel",
    blurb: "Better commutes, easier road trips.",
  },
  {
    id: "office",
    label: "Desk & Office",
    blurb: "A workspace that works harder.",
  },
  {
    id: "kids",
    label: "Kids & Baby",
    blurb: "Play, learn and survive the mess.",
  },
  {
    id: "lifestyle",
    label: "Trending",
    blurb: "The products behind the conversation.",
  },
];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? "Trending";
}

export function categoryMeta(id: string): CategoryMeta {
  return (
    CATEGORIES.find((category) => category.id === id) ?? {
      id: "lifestyle",
      label: "Trending",
      blurb: "The products behind the conversation.",
    }
  );
}
