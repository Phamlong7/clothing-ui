"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { waitForPayment, PaymentStatus } from "@/lib/utils";
import { Order } from "@/lib/api";
import Link from "next/link";
import Button from "@/components/ui/Button";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = useMemo(() => {
    const byQuery = searchParams.get("orderId") || searchParams.get("vnp_TxnRef");
    if (byQuery) return byQuery;
    try {
      const cached = sessionStorage.getItem("payment:lastOrderId");
      if (cached) return cached;
    } catch {}
    return "";
  }, [searchParams]);
  
  const [status, setStatus] = useState<PaymentStatus | "loading">("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [pollingStarted, setPollingStarted] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }
    if (pollingStarted) return;

    setPollingStarted(true);
    setStatus("loading");
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
  }, [orderId, pollingStarted]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const isPaid = status === "paid";
  const isPending = status === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
        {isPending ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Checking Payment Status</h1>
            <p className="text-white/80 mb-6">Please wait...</p>
            <div className="flex items-center justify-center space-x-2 text-white/70 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              <span>Verifying payment...</span>
            </div>
          </>
        ) : status === "failed" || status === "cancelled" ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-white/80 mb-2">We couldn&apos;t process your payment.</p>
            {orderId && <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>}
            {order && (
              <p className="text-white/70 text-sm mb-6">Status: {order.status}</p>
            )}
          </>
        ) : status === "timeout" ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Status Timeout</h1>
            <p className="text-white/80 mb-2">We&apos;re still waiting for payment confirmation.</p>
            {orderId && <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>}
            <p className="text-white/70 text-sm mb-6">
              Your payment may still be processing. Please check your order status later.
            </p>
          </>
        ) : isPaid ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-white/80 mb-2">Your payment has been confirmed.</p>
            {orderId && <p className="text-white/60 text-sm mb-6">Order #{orderId.slice(-8)}</p>}
          </>
        ) : null}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">View Orders</Button>
          </Link>
          {orderId && (
            <Link href={`/orders/${orderId}`}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">View This Order</Button>
            </Link>
          )}
          {status === "timeout" && (
            <Button 
              onClick={() => {
                setPollingStarted(false);
                setStatus("loading");
              }} 
              className="bg-white/10 text-white border border-white/30 hover:bg-white/20"
            >
              Check Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}



