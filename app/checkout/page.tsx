"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createOrder, payOrder, Order, PaymentEnvelope } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const { show } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"simulate" | "stripe" | "vnpay">("simulate");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-white/70 mb-6">You need to be logged in to checkout.</p>
          <Link href="/auth/login">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const result = await createOrder({ paymentMethod });
      
      const extractOrderId = (res: unknown): string | undefined => {
        if (res && typeof res === "object") {
          const obj = res as Record<string, unknown>;
          
          if (typeof obj.orderId === "string") return obj.orderId;
          if (typeof obj.id === "string") return obj.id;
          
          const nestedOrder = obj.order as unknown;
          if (nestedOrder && typeof nestedOrder === "object" && typeof (nestedOrder as { id?: unknown }).id === "string") {
            return (nestedOrder as { id: string }).id;
          }
        }
        return undefined;
      };
      
      const orderId = extractOrderId(result);
      
      if (paymentMethod === "simulate") {
        if (orderId) {
          await payOrder(orderId, { paymentMethod: "simulate" });
          show("Order placed and paid successfully!", "success");
          window.location.href = `/orders/${encodeURIComponent(orderId)}`;
        } else {
          show("Order created but payment failed.", "error");
        }
      } else {
        const envelope = result as PaymentEnvelope | Order | Record<string, unknown>;
        const extractPaymentSection = (value: unknown): unknown => {
          if (value && typeof value === "object") {
            const obj = value as Record<string, unknown>;
            if ("payment" in obj) return obj.payment;
            if ("Payment" in obj) return obj.Payment;
          }
          return undefined;
        };

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

        const paymentSection = extractPaymentSection(envelope) ?? envelope;
        const paymentUrlValue = extractUrl(paymentSection) ?? extractUrl(envelope);
        
        if (paymentUrlValue && orderId) {
          
            try { 
              sessionStorage.setItem("payment:lastOrderId", orderId); 
              sessionStorage.setItem("payment:redirectTime", Date.now().toString());
            } catch {}
            
            const gateway = paymentMethod === "stripe" ? "Stripe" : "VNPAY";
            show(`Redirecting to ${gateway}...`, "success");
            window.location.href = `/checkout/payment-pending?orderId=${encodeURIComponent(orderId)}&paymentUrl=${encodeURIComponent(paymentUrlValue)}&paymentMethod=${encodeURIComponent(paymentMethod)}`;
            return;
          }

        if (orderId) {
          show("Checking payment status...", "success");
          try { sessionStorage.setItem("payment:lastOrderId", orderId); } catch {}
          window.location.href = `/checkout/payment-pending?orderId=${encodeURIComponent(orderId)}&paymentMethod=${encodeURIComponent(paymentMethod)}`;
          return;
        }

        show("Redirecting to payment...", "success");
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      show("Failed to place order. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="simulate"
                    checked={paymentMethod === "simulate"}
                    onChange={(e) => setPaymentMethod(e.target.value as "simulate" | "stripe" | "vnpay")}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">Simulate Payment (Demo)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={(e) => setPaymentMethod(e.target.value as "simulate" | "stripe" | "vnpay")}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">Stripe Payment</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value as "simulate" | "stripe" | "vnpay")}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">VNPAY Payment</span>
                </label>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-white/80">
                <p>Items will be calculated from your cart</p>
                <p>Shipping: Free</p>
                <p>Tax: Included</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link href="/cart" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-white/30 text-white hover:bg-white/20"
                >
                  Back to Cart
                </Button>
              </Link>
              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold disabled:opacity-50"
              >
                {isLoading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

