/**
 * Format price to display without unnecessary decimals
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  // If price is a whole number, don't show decimals
  if (price % 1 === 0) {
    return price.toString();
  }
  // Otherwise show 2 decimal places
  return price.toFixed(2);
}

