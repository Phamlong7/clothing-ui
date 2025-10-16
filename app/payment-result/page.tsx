"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrder, Order } from "@/lib/api";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = useMemo(() => searchParams.get("orderId") || "", [searchParams]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!orderId) {
        setError("Missing orderId");
        setLoading(false);
        return;
      }
      try {
        const o = await getOrder(orderId);
        if (!cancelled) {
          setOrder(o);
        }
      } catch {
        if (!cancelled) setError("Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isPaid = order?.status === "paid";
  const isPending = order?.status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center text-white max-w-xl w-full">
        {loading ? (
          <div className="text-white/80 text-lg">Checking payment...</div>
        ) : error ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Error</h1>
            <p className="text-white/80 mb-6">{error}</p>
          </>
        ) : isPaid ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
            <p className="text-white/80 mb-6">Order #{order?.id.slice(-8)} is paid.</p>
          </>
        ) : isPending ? (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Pending</h1>
            <p className="text-white/80 mb-6">{"We haven't received confirmation yet for order #"}{order?.id.slice(-8)}{"."}</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-white/80 mb-6">Order status: {order?.status ?? "unknown"}</p>
          </>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">View Orders</Button>
          </Link>
          {orderId && (
            <Link href={`/orders/${orderId}`}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">View This Order</Button>
            </Link>
          )}
          {!loading && isPending && (
            <Button onClick={() => router.refresh()} className="bg-white/10 text-white border border-white/30 hover:bg-white/20">Refresh</Button>
          )}
        </div>
      </div>
    </div>
  );
}


