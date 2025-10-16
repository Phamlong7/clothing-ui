"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listOrders, payOrder, Order, PaymentEnvelope } from "@/lib/api";
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
  const [selectedMethods, setSelectedMethods] = useState<Record<string, "simulate" | "stripe" | "vnpay">>({});

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
      const method = selectedMethods[orderId] ?? "simulate";
      
      // For simulate payment, process directly
      if (method === "simulate") {
        await payOrder(orderId, { paymentMethod: "simulate" });
        show("Payment simulated successfully!", "success");
        await loadOrders();
        return;
      }
      
      // For VNPAY/Stripe, get payment URL and redirect
      console.log(`[Orders] Processing ${method} payment for order: ${orderId}`);
      
      const result = await payOrder(orderId, { paymentMethod: method });
      console.log("[Orders] Full response from payOrder:", JSON.stringify(result, null, 2));
      
      const envelope = result as PaymentEnvelope | Order | Record<string, unknown>;
      
      // Extract payment section (might be nested)
      const extractPaymentSection = (value: unknown): unknown => {
        if (value && typeof value === "object") {
          const obj = value as Record<string, unknown>;
          if ("payment" in obj) return obj.payment;
          if ("Payment" in obj) return obj.Payment;
        }
        return undefined;
      };
      
      const paymentSection = extractPaymentSection(envelope) ?? envelope;
      console.log("[Orders] Payment section extracted:", paymentSection);
      
      // Extract URL from various possible field names
      const extractUrl = (source: unknown): string | undefined => {
        if (!source) return undefined;
        if (typeof source === "string") return source;
        if (typeof source === "object") {
          const obj = source as Record<string, unknown>;
          const keys = [
            "url",
            "Url",
            "URL",
            "paymentUrl",
            "paymentURL",
            "PaymentUrl",
            "redirectUrl",
            "RedirectUrl",
            "checkoutUrl",
            "CheckoutUrl",
          ];
          for (const key of keys) {
            const val = obj[key];
            if (typeof val === "string" && val.length > 0) return val;
          }
        }
        return undefined;
      };
      
      const paymentUrl = extractUrl(paymentSection) ?? extractUrl(envelope);
      console.log("[Orders] Payment URL extracted:", paymentUrl);
      
      if (paymentUrl) {
        // Save order ID to sessionStorage for payment-result page
        try { 
          sessionStorage.setItem("payment:lastOrderId", orderId);
          sessionStorage.setItem("payment:redirectTime", Date.now().toString());
        } catch {}
        
        const gateway = method === "stripe" ? "Stripe" : "VNPAY";
        show(`Redirecting to ${gateway}...`, "success");
        
        // Redirect to payment-pending page which will then redirect to payment gateway
        window.location.href = `/checkout/payment-pending?orderId=${encodeURIComponent(orderId)}&paymentUrl=${encodeURIComponent(paymentUrl)}&paymentMethod=${encodeURIComponent(method)}`;
        return;
      }
      
      // If no payment URL found, show error
      console.warn("[Orders] No payment URL found in response");
      show(`Payment gateway not available for ${method}. Please contact support.`, "error");
      
    } catch (e) {
      console.error("[Orders] Pay order failed:", e);
      show("Failed to process payment. Please try again.", "error");
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
                        <span className="flex items-center gap-3">
                          {item.product?.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <span>{item.product?.name ?? item.productId}</span>
                        </span>
                        <span>Qty: {item.quantity} × ${formatPrice(item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
                  <Link href={`/orders/${order.id}`}>
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      View Details
                    </Button>
                  </Link>
                  {order.status === "pending" ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                        <select
                          value={selectedMethods[order.id] ?? "simulate"}
                          onChange={(e) =>
                            setSelectedMethods((prev) => ({
                              ...prev,
                              [order.id]: e.target.value as "simulate" | "stripe" | "vnpay",
                            }))
                          }
                          className="appearance-none pl-9 pr-9 py-2 rounded-xl bg-white/10 border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 backdrop-blur placeholder:text-white/60 hover:bg-white/15 transition-colors"
                        >
                          <option value="simulate" className="text-slate-900">Demo (Simulate)</option>
                          <option value="vnpay" className="text-slate-900">VNPAY</option>
                          <option value="stripe" className="text-slate-900">Stripe</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.7)]"></span>
                      </div>
                      <Button
                        onClick={() => handlePayNow(order.id)}
                        disabled={payingId === order.id}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold disabled:opacity-60"
                      >
                        {payingId === order.id ? "Processing..." : "Pay Now"}
                      </Button>
                    </div>
                  ) : (
                    <Button disabled variant="outline" className="border-white/30 text-white/60">
                      {order.status.toUpperCase()}
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
