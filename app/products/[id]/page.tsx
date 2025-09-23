/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import Image from "next/image";
import { getProduct } from "@/lib/api";
import DeleteButton from "@/components/DeleteButton";
import { notFound } from "next/navigation";
import LinkButton from "@/components/LinkButton";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";

async function ProductContent({ id }: { id: string }) {
  let p: any;
  try { 
    p = await getProduct(id); 
  } catch { 
    return notFound(); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <LinkButton href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6 !min-h-0 !px-0">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </LinkButton>
        </div>

        {/* Product Container */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Product Image */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="relative aspect-square bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl overflow-hidden">
                {(() => {
                  const isValidImage = (url?: string) => {
                    if (!url) return false;
                    try {
                      const u = new URL(url);
                      if (u.hostname.endsWith("google.com") && u.pathname.startsWith("/url")) return false;
                      return /(\.avif|\.webp|\.png|\.jpe?g|\.gif|\.svg)$/i.test(u.pathname);
                    } catch {
                      return false;
                    }
                  };
                  if (isValidImage(p.image)) {
                    return (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                  return (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="p-12 rounded-3xl bg-slate-100 text-center">
                        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-3 text-slate-500 text-sm">No valid image. Paste a direct image URL (e.g. https://domain.com/photo.jpg)</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 shadow-2xl">
              <div className="space-y-8">
                {/* Product Name */}
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                    {p.name}
                  </h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>

                {/* Price */}
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                  <div className="text-white/80 text-lg font-semibold mb-2">Price</div>
                  <div className="text-4xl font-black text-white">
                    ${Number(p.price).toFixed(2)}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Description</h3>
                  <p className="text-slate-200 text-lg leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <LinkButton href={`/products/${p.id}/edit`} className="flex-1 w-full min-h-[56px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Product
                    </div>
                  </LinkButton>
                  
                  <DeleteButton 
                    id={p.id} 
                    productName={p.name}
                  />
                </div>

                {/* Additional Info */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-white/60 text-sm font-semibold mb-1">Category</div>
                      <div className="text-white font-bold">Fashion</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-sm font-semibold mb-1">Stock</div>
                      <div className="text-green-400 font-bold">In Stock</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent id={resolvedParams.id} />
    </Suspense>
  );
}
