"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCart, updateCartItem, deleteCartItem } from "@/lib/api";
import { Cart } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const loadCart = useCallback(async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to load cart:", error);
      show("Failed to load cart", "error");
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      show("Failed to update quantity", "error");
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await deleteCartItem(itemId);
      await loadCart();
      show("Item removed from cart", "success");
    } catch (error) {
      console.error("Failed to remove item:", error);
      show("Failed to remove item", "error");
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-white/70 mb-6">You need to be logged in to view your cart.</p>
          <Link href="/auth/login">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading cart...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-white/70 mb-6">Add some items to get started!</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
          
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{item.product.name}</h3>
                    <p className="text-white/70 text-sm mb-2">{item.product.description}</p>
                    <p className="text-lg font-bold text-purple-300">${formatPrice(item.product.price)} each</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItems.has(item.id)}
                        className="border-white/30 text-white hover:bg-white/20"
                      >
                        -
                      </Button>
                      <span className="text-white font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItems.has(item.id)}
                        className="border-white/30 text-white hover:bg-white/20"
                      >
                        +
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">${formatPrice(item.lineTotal)}</p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updatingItems.has(item.id)}
                      className="border-red-300 text-red-300 hover:bg-red-500/20"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/30">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">Total: ${formatPrice(cart.total)}</span>
              <Link href="/checkout">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3 text-lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
