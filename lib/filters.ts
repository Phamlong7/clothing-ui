export const PRICE_RANGES = [
  { label: "Any price", value: "" },
  { label: "Under $50", value: "0-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $200", value: "100-200" },
  { label: "$200+", value: "200-" },
] as const;

export type PriceRangeValue = (typeof PRICE_RANGES)[number]["value"];

export function getPriceLabel(value: PriceRangeValue | string | null | undefined) {
  if (!value) return undefined;
  return PRICE_RANGES.find((range) => range.value === value)?.label;
}


