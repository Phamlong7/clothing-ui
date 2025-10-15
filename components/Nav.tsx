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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between rounded-3xl border border-white/20 bg-gradient-to-r from-white/30 via-white/20 to-white/30 backdrop-blur-2xl shadow-[inset_0_0_40px_rgba(255,255,255,0.35)]">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/40">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            {APP_NAME}
          </span>
        </Link>
        
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Link href="/cart" className="relative">
                <Button size="sm" variant="outline" className="border-white/40 text-slate-800 bg-white/40 hover:bg-white/60 pr-3 backdrop-blur inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9" /></svg>
                  Cart
                </Button>
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {cartCount}
                </span>
              </Link>
              <Link href="/orders" className="relative">
                <Button size="sm" variant="outline" className="border-white/40 text-slate-800 bg-white/40 hover:bg-white/60 pr-3 backdrop-blur inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                  Orders
                </Button>
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {orderCount}
                </span>
              </Link>
              <Link href="/products/new">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  {UI_TEXT.nav.addProductButton}
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={logout}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
