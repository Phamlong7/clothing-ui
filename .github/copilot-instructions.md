# Clothing Shop UI - AI Development Guidelines

This Next.js 15 e-commerce app uses TypeScript, App Router, Tailwind CSS v4, and a RESTful API. Architecture emphasizes client-side state management for search/filters, server-side pagination, and glassmorphism design.

## 🏗️ Architecture Patterns

### Server vs. Client Components
- **Default to Server Components** for pages and static UI (e.g., `app/page.tsx`, `ProductCard.tsx`)
- **Use Client Components** when you need:
  - State hooks (`useState`, `useEffect`, `useCallback`)
  - Browser APIs or event handlers
  - Context providers (`ToastProvider`, `useToast`)
  - Navigation/URL manipulation (`useRouter`, `useSearchParams`)

### API Integration (`lib/api.ts`)
- **Base URL**: `process.env.NEXT_PUBLIC_API_BASE` (required)
- **TLS bypass**: Development-only `ALLOW_INSECURE_TLS=true` for localhost HTTPS
- **Error handling**: All API functions catch errors and return safe fallbacks (e.g., `[]` for listProducts)
- **IMPORTANT**: Backend does NOT support filtering/search/pagination - only returns ALL products
- **Client-side filtering**: All search, price filtering, and pagination done on frontend (see `lib/client-filters.ts`)
- **Cache**: Use `{ cache: "no-store" }` for dynamic data

### State Management & URL Synchronization
- **Search/filter state** lives in URL via `router.replace()` (no page reload)
- **Client-side filtering**: All filtering happens on frontend after fetching ALL products from backend
- **Filter logic**: See `lib/client-filters.ts` for `applyFilters()`, `searchProducts()`, `filterByPrice()`, `paginateItems()`
- **Debouncing**: 300ms for text input, 100ms for clearing, immediate on price filter
- **Scroll behavior**: Use `scroll: false` with `router.replace()` wrapped in `startTransition()` to maintain scroll position
- **Scroll preservation**: Disabled automatic scroll restoration via `ScrollPreserver` component in layout
- **Suspense boundaries**: Use stable `key` prop to prevent unnecessary remounting
- **Pagination**: Client-side pagination after filtering, page state in URL, resets to page 1 on search/filter changes
- **Important**: Always wrap `router.replace()` in `startTransition()` to prevent layout shifts and scroll jumping
- See `SearchBar.tsx`, `Pagination.tsx`, `ScrollPreserver.tsx`, and `lib/client-filters.ts` for reference implementations

## 🎨 Design System & Styling

### Glassmorphism Theme
- **Cards**: `backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl`
- **Gradients**: Purple-to-pink (`from-purple-600 to-pink-600`) for CTAs and hover states
- **Backgrounds**: Dark (`from-slate-900 via-purple-900`) with animated blur orbs
- **Transitions**: `transition-all duration-300` (200ms for buttons, 500ms for cards)
- **Responsive grids**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Typography & Spacing
- **Font**: Inter (loaded via `next/font`)
- **Text hierarchy**: 4xl-5xl for headings, lg-xl for body, sm for metadata
- **Spacing**: 4px grid (`gap-4`, `p-6`, `mb-8`)

## 🔧 Key Features & Workflows

### Search & Filtering
- **Search bar** (`SearchBar.tsx`): Debounced input, price dropdown, hidden submit button for Enter key
- **Price ranges** (`lib/filters.ts`): Pre-defined ranges (Under $50, $50-$100, etc.)
- **Client-side logic** (`lib/client-filters.ts`): 
  - `searchProducts()`: Case-insensitive search by name/description
  - `filterByPrice()`: Filter by price range (e.g., "50-100", "200-" for $200+)
  - `applyFilters()`: Combines search + price filtering
  - `paginateItems()`: Client-side pagination after filtering
- **Filter flow**: Fetch ALL products → Apply search → Apply price filter → Paginate results
- **Filter badges**: Display active filters with "Clear filters" button (`ClearFilters.tsx`)
- **Empty states**: Show different messages for "no products yet" vs. "no results found"

### Pagination
- **Strategy**: Client-side pagination after filtering (backend returns ALL products)
- **Logic**: `paginateItems()` in `lib/client-filters.ts` handles slicing filtered results
- **UI**: Shows max 5 page buttons with ellipsis, always show first/last pages
- **Visibility**: Hide pagination if `pages <= 1`
- **Navigation**: Use `router.replace()` with `scroll: false` + manual smooth scroll

### Image Handling
- **Cloudinary** (`ImageUploader.tsx`): Drag-and-drop upload with progress states
  - Requires `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
  - Fallback to direct URL input if credentials missing
- **Validation**: Check for direct image URLs with extensions (`.jpg`, `.png`, `.webp`), reject Google redirect URLs
- **Next.js Image**: Use `fill` with `sizes` for responsive optimization

### Forms & Validation
- **Inline validation**: Show errors below fields as user types (clear on change)
- **Required fields**: Name, description, price (price must be > 0)
- **Optional image**: Accepts URL or Cloudinary upload
- **Loading states**: Disable buttons and show spinners during submission
- **Toast feedback**: Success/error notifications via `useToast` hook

### Delete Flow
- **Modal confirmation** (`DeleteConfirmModal.tsx`): Glassmorphism modal with backdrop, Escape key to close
- **API call**: `DELETE /api/Products/{id}` in `DeleteButton.tsx`
- **Redirect**: Navigate to homepage on success with toast notification

## 🔍 Code Conventions

### Constants & Text
- **Centralized UI text** in `lib/constants.ts` (use `UI_TEXT.*` instead of hardcoded strings)
- **Config**: `DEFAULT_PAGE_SIZE = 6`, `TOAST_DURATION = 3000`, `IMAGE_EXTENSIONS` regex
- **Client filtering**: `lib/client-filters.ts` contains all search, filter, and pagination logic

### TypeScript
- **Strict mode** enabled
- **API types**: `Product`, `ListResp`, `ListProductsParams` in `lib/api.ts`
- **Props typing**: Explicit interfaces for component props (e.g., `DeleteButtonProps`)

### Utilities
- **`formatPrice()`** (`lib/utils.ts`): Removes unnecessary decimals (e.g., `50` instead of `50.00`)

### Async Params in Next.js 15
- **Page params**: Async by default in Next.js 15, use `await params` in server components
- **Client components**: Use `use(params)` hook from React for async unwrapping
- Example server: `const resolvedParams = await params;`
- Example client: `const resolvedParams = use(params);`

### Package Installation
- **Core packages**: Project uses `next@latest react@latest react-dom@latest`
- **Dev dependencies**: TypeScript, ESLint, Tailwind CSS v4, PostCSS
- **Additional libs**: `clsx` for classnames, `swr` for data fetching, `zod` for validation

## 🚨 Common Pitfalls

1. **Pagination not showing**: Ensure `pages > 1` check in `Pagination.tsx`
2. **Search not triggering**: Verify debounce timer is cleared on submit/price change
3. **Navigation loops**: Use `router.replace()` instead of `router.push()` for filters to avoid history clutter
4. **Page jumping on filter/pagination**: 
   - Always wrap `router.replace()` in `startTransition()` with `scroll: false`
   - Ensure `ScrollPreserver` component is in root layout
   - Use stable Suspense `key` to prevent remounting
   - Check CSS has `overflow-anchor: none` on body
5. **Filter not working**: Remember backend returns ALL products - filtering happens on FE via `lib/client-filters.ts`
6. **Search case-sensitivity**: Use `.toLowerCase()` for case-insensitive matching
7. **Price filter "200+" not working**: Ensure `max: null` is handled (no upper limit)
8. **Image upload fails**: Check Cloudinary env vars, provide fallback URL input
9. **Form validation**: Don't forget to validate image URLs (reject Google redirects, check extensions)

## 🔧 Development Commands

```bash
# Start dev server with Turbopack (Next.js 15+)
npm run dev
# Alternative package managers
yarn dev
pnpm dev
bun dev

# Build for production (uses Turbopack)
npm run build && npm run start

# Lint
npm run lint

# Install dependencies
npm install
yarn install
pnpm install
```

### Quick Project Setup
```bash
# Bootstrap from this example (if creating similar projects)
npx create-next-app@latest --yes my-app
cd my-app
npm run dev
```

## 📦 Environment Variables

```env
# Required
NEXT_PUBLIC_API_BASE=https://your-api-url.com

# Optional (for Cloudinary upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset

# Development only (for localhost HTTPS)
ALLOW_INSECURE_TLS=true
```

## 🎯 When Editing

- **Search/filter logic**: Reference `lib/client-filters.ts` for filtering patterns
- **API calls**: Backend only returns ALL products, no filtering - see `lib/api.ts`
- **New pages**: Server component by default, add `"use client"` only if needed
- **Styling**: Match existing glassmorphism patterns (check `ProductCard.tsx`, `app/products/[id]/page.tsx`)
- **UI text**: Add to `lib/constants.ts` instead of hardcoding
- **Forms**: Use same validation + loading patterns as `app/products/[id]/edit/page.tsx`
- **Client-side filtering**: All search, price filtering, and pagination must be done on FE

## 🧪 Testing & Debugging

### Development Tools
- **Dev server**: Runs with Turbopack for faster HMR in Next.js 15
- **Type checking**: TypeScript strict mode catches errors at compile time
- **ESLint**: Use `npm run lint` to catch code quality issues
- **Browser DevTools**: Use React DevTools for component inspection

### Testing Framework Options
While not currently implemented, Next.js 15 supports:
- **Jest**: `npx create-next-app@latest --example with-jest` for unit tests
- **Cypress**: `npx create-next-app@latest --example with-cypress` for E2E tests
- **Playwright**: `npx create-next-app@latest --example with-playwright` for E2E tests
- **Vitest**: `npx create-next-app@latest --example with-vitest` for unit tests
