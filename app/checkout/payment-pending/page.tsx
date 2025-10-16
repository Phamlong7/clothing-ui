"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { waitForPayment, PaymentStatus } from "@/lib/utils";
import { Order } from "@/lib/api";
import Button from "@/components/ui/Button";
import Link from "next/link";

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const paymentUrl = searchParams.get("paymentUrl");
  const paymentMethod = searchParams.get("paymentMethod") || "vnpay";
  
  const [status, setStatus] = useState<PaymentStatus | "polling" | "redirecting">("redirecting");
  const [order, setOrder] = useState<Order | null>(null);
  const [pollingStarted, setPollingStarted] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (paymentUrl && !redirectedRef.current && orderId) {
      redirectedRef.current = true;
      setStatus("redirecting");
      
      const timer = setTimeout(() => {
        window.location.href = paymentUrl;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [paymentUrl, orderId]);

  useEffect(() => {
    if (!orderId) return;
    if (paymentUrl) return;
    if (pollingStarted) return;

    setPollingStarted(true);
    setStatus("polling");
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startPolling = async () => {
      try {
        const result = await waitForPayment(orderId, abortController.signal, 60, 3000);
        
        if (!abortController.signal.aborted) {
          setStatus(result.status);
          setOrder(result.order);
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (!abortController.signal.aborted) {
          setStatus("failed");
        }
      }
    };

    startPolling();

    return () => {
      abortController.abort();
    };
  }, [orderId, paymentUrl, pollingStarted]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Missing Order Information</h1>
          <p className="text-white/80 mb-6">No order ID was provided.</p>
          <Link href="/orders">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              View Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "redirecting") {
    const gatewayName = paymentMethod === "stripe" ? "Stripe" : "VNPAY";
    const gatewayColor = paymentMethod === "stripe" ? "purple" : "blue";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
          <div className={`mx-auto mb-6 w-20 h-20 rounded-full bg-${gatewayColor}-500/20 border border-${gatewayColor}-400/30 flex items-center justify-center`}>
            <svg className={`w-10 h-10 text-${gatewayColor}-300 animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Redirecting to {gatewayName}</h1>
          <p className="text-white/80 mb-2">Please wait while we redirect you to the payment gateway...</p>
          <p className="text-white/60 text-sm mb-4">Order #{orderId.slice(-8)}</p>
          {paymentMethod === "stripe" && (
            <div className="text-white/70 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="font-semibold mb-1">💳 Secure Payment with Stripe</p>
              <p className="text-xs text-white/60">You&apos;ll be redirected to Stripe&apos;s secure checkout page</p>
            </div>
          )}
          {paymentMethod === "vnpay" && (
            <div className="text-white/70 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="font-semibold mb-1">🏦 VNPAY Payment Gateway</p>
              <p className="text-xs text-white/60">Redirecting to VNPAY for secure payment</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === "polling") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Pending</h1>
          <p className="text-white/80 mb-2">Waiting for payment confirmation...</p>
          <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>
          <div className="flex items-center justify-center space-x-2 text-white/70 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
            <span>Checking payment status...</span>
          </div>
          <p className="text-white/50 text-xs mt-4">This page will automatically update when payment is confirmed.</p>
        </div>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-white/80 mb-2">Your payment has been confirmed.</p>
          <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/orders/${orderId}`}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
                View Order Details
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                View All Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Status Timeout</h1>
          <p className="text-white/80 mb-2">We&apos;re still waiting for payment confirmation.</p>
          <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>
          <p className="text-white/70 text-sm mb-6">
            Don&apos;t worry! Your payment may still be processing. Please check your order status in a few minutes.
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => {
                setPollingStarted(false);
                setStatus("polling");
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              Check Again
            </Button>
            <Link href={`/orders/${orderId}`}>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                View Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failed or cancelled
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
        <p className="text-white/80 mb-2">We couldn&apos;t process your payment.</p>
        <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>
        {order && (
          <p className="text-white/70 text-sm mb-6">Status: {order.status}</p>
        )}
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
              Try Again
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
              View Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
