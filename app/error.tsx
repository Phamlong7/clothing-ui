"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-4 bg-white/80 p-8 rounded-lg border">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 rounded-md bg-black text-white">Try again</button>
    </div>
  );
}
