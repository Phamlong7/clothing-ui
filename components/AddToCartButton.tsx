"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { addToCart } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import Button from "@/components/ui/Button";

interface AddToCartButtonProps {
  productId: string;
  className?: string;
}

export default function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      show("Please login to add items to cart", "error");
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(productId, 1);
      show("Added to cart!", "success");
      try {
        // Notify any listeners (e.g., Nav) to refresh cart count
        window.dispatchEvent(new CustomEvent("cart:updated"));
      } catch {}
    } catch (error) {
      console.error("Failed to add to cart:", error);
      show("Failed to add to cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className={`border-purple-200 text-purple-700 hover:bg-purple-50 ${className}`}
        onClick={handleAddToCart}
      >
        Login to Add
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 ${className}`}
    >
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}

