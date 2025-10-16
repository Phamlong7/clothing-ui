"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createOrder, Order, PaymentEnvelope } from "@/lib/api";
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
          if (typeof obj.id === "string") return obj.id; // envelope id
          const nestedOrder = obj.order as unknown;
          if (nestedOrder && typeof nestedOrder === "object" && typeof (nestedOrder as { id?: unknown }).id === "string") {
            return (nestedOrder as { id: string }).id;
          }
          if (typeof (res as { id?: unknown }).id === "string") return (res as { id: string }).id; // plain order
        }
        return undefined;
      };
      const orderId = extractOrderId(result);
      
      if (paymentMethod === "simulate") {
        show("Order placed successfully! Payment simulated.", "success");
        if (orderId) {
          window.location.href = `/payment-result?orderId=${encodeURIComponent(orderId)}`;
        } else {
          window.location.href = "/checkout/success";
        }
      } else {
        // PayOS or VNPAY should return an envelope with payment details
        const envelope = result as PaymentEnvelope | Order;
        const hasPayment = (val: unknown): val is PaymentEnvelope =>
          typeof val === "object" && val !== null && "payment" in (val as Record<string, unknown>);
        if (hasPayment(envelope)) {
          const payment = envelope.payment as unknown;
          const getPaymentUrl = (p: unknown): string | undefined => {
            if (p && typeof p === "object" && "url" in (p as Record<string, unknown>)) {
              const u = (p as { url?: unknown }).url;
              return typeof u === "string" ? u : undefined;
            }
            return undefined;
          };
          const vnpUrl = getPaymentUrl(payment);
          if (vnpUrl) {
            show("Redirecting to VNPAY...", "success");
            if (orderId) {
              try { sessionStorage.setItem("payment:lastOrderId", orderId); } catch {}
            }
            window.location.href = vnpUrl;
            return;
          }
          // If no URL provided, still route to result page to check status
          if (orderId) {
            show("Checking payment status...", "success");
            try { sessionStorage.setItem("payment:lastOrderId", orderId); } catch {}
            window.location.href = `/payment-result?orderId=${encodeURIComponent(orderId)}`;
            return;
          }
          show("Redirecting to payment...", "success");
        } else {
          show("Payment created.", "success");
        }
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

