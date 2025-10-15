import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 text-center text-white max-w-lg">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
        <p className="text-white/80 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>
        <Link href="/orders" className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">View Orders</Link>
      </div>
    </div>
  );
}


