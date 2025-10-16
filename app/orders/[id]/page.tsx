"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getOrder } from "@/lib/api";
import { Order } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      const resolvedParams = await params;
      const orderData = await getOrder(resolvedParams.id);
      setOrder(orderData);
    } catch (error) {
      console.error("Failed to load order:", error);
      show("Failed to load order", "error");
    } finally {
      setIsLoading(false);
    }
  }, [params, show]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrder();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-white/70 mb-6">You need to be logged in to view order details.</p>
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
        <div className="text-white text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-white/70 mb-6">{"The order you're looking for doesn't exist."}</p>
          <Link href="/orders">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Back to Orders
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Order Details</h1>
              <p className="text-white/70 mt-2">Order #{order.id.slice(-8)}</p>
            </div>
            <Link href="/orders">
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/20"
              >
                Back to Orders
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Order ID:</span>
                    <span className="text-white font-mono">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Amount:</span>
                    <span className="text-white font-bold text-lg">${formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Created:</span>
                    <span className="text-white">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <h2 className="text-xl font-semibold text-white mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/20">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          {item.product?.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-slate-400 ${item.product?.image ? 'hidden' : ''}`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {item.product?.name || `Product ${item.productId.slice(-8)}`}
                        </h3>
                        <p className="text-white/70 text-sm">
                          Unit Price: ${formatPrice(item.unitPrice)}
                        </p>
                        {!item.product && (
                          <p className="text-yellow-300/70 text-xs mt-1">
                            Product details not available
                          </p>
                        )}
                      </div>
                      
                      {/* Quantity & Total */}
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">
                          Qty: {item.quantity}
                        </div>
                        <div className="text-white/70 text-sm">
                          ${formatPrice(item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
