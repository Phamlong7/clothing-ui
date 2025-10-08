// App Configuration
export const APP_NAME = "Clothing Shop";
export const APP_DESCRIPTION = "Discover the latest trends in premium clothing. Quality, style, and comfort in every piece.";

// Pagination
export const DEFAULT_PAGE_SIZE = 6; // 6 products per page
export const DEFAULT_PAGE = 1;

// Toast Configuration
export const TOAST_DURATION = 3000; // milliseconds

// UI Text
export const UI_TEXT = {
  hero: {
    title: "Premium",
    subtitle: "Fashion",
    description: APP_DESCRIPTION,
    addProductButton: "Add New Product",
    viewCollectionButton: "View Collection",
  },
  nav: {
    addProductButton: "Add Product",
  },
  products: {
    listTitle: "All Products",
    noProductsYet: "No products yet",
    noProductsMessage: "Start by adding some products to your store",
    noResultsFound: (query: string) => `No products found for "${query}"`,
    noResultsMessage: "Try searching for something else",
    showingResults: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total} items`,
    clearFilters: "Clear filters",
    searchLabel: "Search:",
    priceLabel: "Price:",
  },
  search: {
    placeholder: "Search for clothing, brands, styles...",
    submitButton: "Search",
  },
  loading: {
    default: "Loading...",
    products: "Loading products...",
    product: "Loading product...",
  },
  actions: {
    edit: "Edit Product",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    create: "Create",
    update: "Update",
    back: "Back to Home",
    backToProduct: "Back to Product",
  },
  form: {
    productName: "Product Name",
    description: "Description",
    price: "Price (USD)",
    imageUrl: "Image URL",
    optional: "(Optional)",
    required: "*",
  },
  validation: {
    nameRequired: "Product name is required",
    descriptionRequired: "Description is required",
    priceRequired: "Valid price is required",
    imageInvalid: "Please paste a direct image URL (ending with .png, .jpg, .webp, etc.). Avoid Google redirect links.",
    imageUrlInvalid: "Paste a valid image URL",
  },
  toast: {
    success: "Success",
    error: "Error",
    deleteSuccess: "Deleted successfully",
    deleteFailed: "Delete failed",
    updateSuccess: "Updated successfully",
    updateFailed: "Failed to update product",
    createSuccess: "Created successfully",
    createFailed: "Failed to create product",
    uploadSuccess: "Image uploaded successfully",
    uploadFailed: "Image upload failed. Please try again.",
  },
} as const;

// Image validation
export const IMAGE_EXTENSIONS = /\.(avif|webp|png|jpe?g|gif|svg)$/i;

// Cloudinary
export const CLOUDINARY = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  uploadUrl: (cloudName: string) =>
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
} as const;
