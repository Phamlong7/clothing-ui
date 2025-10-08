"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getProduct, updateProduct } from "@/lib/api";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/LinkButton";
import { useToast } from "@/components/ToastProvider";
import ImageUploader from "@/components/ImageUploader";
import { UI_TEXT } from "@/lib/constants";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { show } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await getProduct(resolvedParams.id);
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          image: product.image || ""
        });
      } catch (error) {
        console.error("Failed to load product:", error);
        setErrors({ load: "Failed to load product" });
        show("Failed to load product", "error");
      } finally {
        setIsLoadingProduct(false);
      }
    };
    
    loadProduct();
  }, [resolvedParams.id, show]);

  const validateImageUrl = (url: string) => {
    if (!url) return true; // optional field
    try {
      const u = new URL(url);
      // Disallow Google redirect URLs and similar tracking redirectors
      if (u.hostname.endsWith("google.com") && u.pathname.startsWith("/url")) return false;
      // Basic extension check for common image types
      const hasExt = /(\.avif|\.webp|\.png|\.jpe?g|\.gif|\.svg)$/i.test(u.pathname);
      return hasExt;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (formData.image && !validateImageUrl(formData.image)) {
      newErrors.image = "Please paste a direct image URL (ending with .png, .jpg, .webp, etc.). Avoid Google redirect links.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await updateProduct(resolvedParams.id, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image || undefined
      });
      show("Updated successfully", "success");
      router.push(`/products/${resolvedParams.id}`);
    } catch (error) {
      console.error("Failed to update product:", error);
      setErrors({ submit: "Failed to update product. Please try again." });
      show("Failed to update product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Floating Back Button aligned to top-left */}
        <div className="absolute left-4 sm:left-6 top-6">
          <LinkButton 
            href={`/products/${resolvedParams.id}`}
            variant="ghost"
            className="!bg-white/10 hover:!bg-white/20 !border-white/30 hover:!border-white/50 !text-white !font-semibold !px-5 !py-2.5 !rounded-2xl backdrop-blur-xl !shadow-lg hover:!shadow-xl !transition-all !duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {UI_TEXT.actions.backToProduct}
          </LinkButton>
        </div>
        {/* Header - add top padding so it doesn't overlap with the floating back button */}
        <div className="pt-14 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Edit Product
          </h1>
          <p className="text-xl text-white/70">
            Update your product information
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-white font-semibold text-lg">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-lg"
                  placeholder="Enter product name..."
                />
                {errors.name && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-white font-semibold text-lg">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-lg resize-none"
                  placeholder="Describe your product in detail..."
                />
                {errors.description && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-white font-semibold text-lg">
                  Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/80 text-lg font-semibold">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-6 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-lg"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-300 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <ImageUploader
                  value={formData.image}
                  onChange={handleImageChange}
                  onClear={() => handleImageChange("")}
                  helperText="Upload via Cloudinary or paste a direct URL below."
                />
                <div className="space-y-2">
                  <label htmlFor="image" className="block text-white font-semibold text-lg">
                    Image URL <span className="text-white/60 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all text-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image && (
                    <p className="text-red-300 text-sm mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.image}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
                  <p className="text-red-200 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update Product"}
                </Button>
                <LinkButton
                  href={`/products/${resolvedParams.id}`}
                  size="lg"
                  variant="ghost"
                  className="flex-1 w-full border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold rounded-2xl transition-all duration-200 hover:border-white/50"
                >
                  Cancel
                </LinkButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
