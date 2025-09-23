import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center space-y-4 bg-white/80 p-8 rounded-lg border">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-slate-600">The page you’re looking for doesn’t exist or has been moved.</p>
      <Link href="/" className="inline-block px-4 py-2 rounded-md bg-black text-white">Go Home</Link>
    </div>
  );
}
