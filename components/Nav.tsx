"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { APP_NAME, UI_TEXT } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState, useCallback } from "react";
import { getCart, listOrders } from "@/lib/api";

export default function Nav() {
  const { isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);

  const refreshBadges = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setOrderCount(0);
      return;
    }
    try {
      const [cart, orders] = await Promise.all([getCart().catch(() => null), listOrders().catch(() => [])]);
      setCartCount(cart?.items?.length ?? 0);
      setOrderCount(orders.length);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    refreshBadges();
    const onCartUpdated = () => refreshBadges();
    window.addEventListener("cart:updated", onCartUpdated);
    return () => window.removeEventListener("cart:updated", onCartUpdated);
  }, [refreshBadges]);

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Liquid glass background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-purple-900/30 to-transparent backdrop-blur-md pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        {/* Main nav container with liquid glass effect */}
        <div className="relative group">
          {/* Animated gradient border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-[24px] opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-500 animate-pulse" />
          
          {/* Glass container */}
          <div className="relative flex items-center justify-between rounded-[22px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.15)] px-6 py-3.5 transition-all duration-300 hover:bg-white/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.2)]">
            
            {/* Logo section */}
            <Link href="/" className="flex items-center space-x-3 group/logo">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-md opacity-75 group-hover/logo:opacity-100 transition-opacity" />
                
                {/* Icon container */}
                <div className="relative w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30 group-hover/logo:ring-white/50 transition-all duration-300 group-hover/logo:scale-110">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(168,85,247,0.4)] group-hover/logo:drop-shadow-[0_2px_12px_rgba(168,85,247,0.6)] transition-all">
                {APP_NAME}
              </span>
            </Link>
            
            {/* Navigation buttons */}
            <div className="flex items-center space-x-2.5">{isAuthenticated ? (
                <>
                  {/* Cart button with glass effect */}
                  <Link href="/cart" className="relative group/btn">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover/btn:opacity-30 blur transition duration-300" />
                    <div className="relative">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl inline-flex items-center gap-2.5 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-white/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9" />
                        </svg>
                        Cart
                      </Button>
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white/40 animate-bounce">
                          {cartCount}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Orders button with glass effect */}
                  <Link href="/orders" className="relative group/btn">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover/btn:opacity-30 blur transition duration-300" />
                    <div className="relative">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl inline-flex items-center gap-2.5 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-white/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                        </svg>
                        Orders
                      </Button>
                      {orderCount > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white/40">
                          {orderCount}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Add Product button - Primary CTA */}
                  <Link href="/products/new" className="relative group/cta">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl blur-md opacity-75 group-hover/cta:opacity-100 transition duration-300 animate-pulse" />
                    <Button 
                      size="sm" 
                      className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-2 ring-white/20 hover:ring-white/40 backdrop-blur-xl"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      {UI_TEXT.nav.addProductButton}
                    </Button>
                  </Link>

                  {/* Logout button */}
                  <div className="relative group/logout">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-500 rounded-xl opacity-0 group-hover/logout:opacity-30 blur transition duration-300" />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={logout}
                      className="relative border-white/30 text-red-100 hover:text-white bg-red-500/10 hover:bg-red-500/20 backdrop-blur-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-red-400/50"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Login button */}
                  <Link href="/auth/login" className="relative group/btn">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover/btn:opacity-30 blur transition duration-300" />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="relative border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-white/50"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </Button>
                  </Link>

                  {/* Register button - Primary CTA */}
                  <Link href="/auth/register" className="relative group/cta">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl blur-md opacity-75 group-hover/cta:opacity-100 transition duration-300 animate-pulse" />
                    <Button 
                      size="sm" 
                      className="relative bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ring-2 ring-white/20 hover:ring-white/40 backdrop-blur-xl"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
