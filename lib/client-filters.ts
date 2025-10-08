import { Product } from "./api";

/**
 * Client-side filtering utilities
 * Backend doesn't support filtering - all filtering done on FE
 */

/**
 * Parse price range string to min/max values
 * Examples: "", "0-50", "50-100", "100-200", "200-"
 */
export function parsePriceRange(priceRange: string): { min: number; max: number | null } {
  if (!priceRange || !priceRange.trim()) {
    return { min: 0, max: null }; // No filter = show all
  }

  const [minStr, maxStr] = priceRange.split("-");
  const min = minStr && minStr.trim() ? Number(minStr) : 0;
  const max = maxStr && maxStr.trim() ? Number(maxStr) : null;

  return { min, max };
}

/**
 * Filter products by price range
 */
export function filterByPrice(products: Product[], priceRange: string): Product[] {
  const { min, max } = parsePriceRange(priceRange);

  return products.filter((product) => {
    const price = product.price;
    
    // No max = show products >= min (e.g., "200-" = $200+)
    if (max === null) {
      return price >= min;
    }
    
    // Has max = show products in range (e.g., "50-100")
    return price >= min && price <= max;
  });
}

/**
 * Search products by query string (name or description)
 * Case-insensitive search
 */
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query || !query.trim()) {
    return products; // No search = show all
  }

  const searchLower = query.toLowerCase().trim();

  return products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const descMatch = product.description.toLowerCase().includes(searchLower);
    return nameMatch || descMatch;
  });
}

/**
 * Apply all filters: search + price
 */
export function applyFilters(
  products: Product[],
  query: string,
  priceRange: string
): Product[] {
  console.log("🔍 [ClientFilter] Applying filters:", { query, priceRange, totalProducts: products.length });

  // Step 1: Search by query
  let filtered = searchProducts(products, query);
  console.log("📝 [ClientFilter] After search:", filtered.length);

  // Step 2: Filter by price
  filtered = filterByPrice(filtered, priceRange);
  console.log("💰 [ClientFilter] After price filter:", filtered.length);

  return filtered;
}

/**
 * Paginate array of items
 */
export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): {
  items: T[];
  total: number;
  page: number;
  pages: number;
  from: number;
  to: number;
} {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), pages);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  const from = total === 0 ? 0 : startIndex + 1;
  const to = total === 0 ? 0 : Math.min(endIndex, total);

  console.log("📄 [Pagination]", { total, pages, currentPage, from, to, showing: paginatedItems.length });

  return {
    items: paginatedItems,
    total,
    page: currentPage,
    pages,
    from,
    to,
  };
}
