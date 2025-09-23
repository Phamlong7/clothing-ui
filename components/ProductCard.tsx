import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 hover:border-white/30 group-hover:scale-[1.02] transform">
        <div className="relative h-72 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="p-6 rounded-2xl bg-slate-100">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Price tag with glassmorphism */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-2 text-lg font-bold text-slate-900 shadow-lg border border-white/30">
            ${Number(product.price).toFixed(2)}
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-purple-600 transition-colors duration-300 leading-tight">
            {product.name}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
            {product.description}
          </p>
          
          {/* Action indicator */}
          <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            View Details
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
