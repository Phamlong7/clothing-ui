"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listOrders, payOrder } from "@/lib/api";
import { Order } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const ordersData = await listOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      show("Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadOrders]);

  const handlePayNow = async (orderId: string) => {
    try {
      setPayingId(orderId);
      await payOrder(orderId);
      show("Payment successful", "success");
      await loadOrders();
    } catch (e) {
      console.error("Pay order failed", e);
      show("Failed to process payment", "error");
    } finally {
      setPayingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "cancelled":
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
          <p className="text-white/70 mb-6">You need to be logged in to view your orders.</p>
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
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
          <p className="text-white/70 mb-6">Start shopping to see your orders here!</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Start Shopping
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
          <h1 className="text-3xl font-bold text-white mb-8">Your Orders</h1>
          
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Order #{order.id.slice(-8)}</h3>
                    <p className="text-white/70 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <p className="text-xl font-bold text-white mt-2">${formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-white/80">
                        <span>Product ID: {item.productId}</span>
                        <span>Qty: {item.quantity} × ${formatPrice(item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Link href={`/orders/${order.id}`}>
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      View Details
                    </Button>
                  </Link>
                  {order.status === "pending" && (
                    <Button
                      onClick={() => handlePayNow(order.id)}
                      disabled={payingId === order.id}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold disabled:opacity-60"
                    >
                      {payingId === order.id ? "Processing..." : "Pay Now"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
