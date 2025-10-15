"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { APP_NAME, UI_TEXT } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";

export default function Nav() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/cart">
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Cart
                </Button>
              </Link>
              <Link href="/orders">
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  Orders
                </Button>
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
