export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="w-32 h-6 bg-white/20 rounded-lg animate-pulse mb-6"></div>
        </div>

        {/* Product Container */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Product Image Skeleton */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="aspect-square bg-white/20 rounded-2xl animate-pulse"></div>
            </div>

            {/* Product Info Skeleton */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12 shadow-2xl">
              <div className="space-y-8">
                {/* Product Name */}
                <div>
                  <div className="w-3/4 h-12 bg-white/20 rounded-lg animate-pulse mb-4"></div>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>

                {/* Price */}
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                  <div className="w-16 h-6 bg-white/20 rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-10 bg-white/20 rounded animate-pulse"></div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="w-32 h-6 bg-white/20 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-white/20 rounded animate-pulse"></div>
                    <div className="w-5/6 h-4 bg-white/20 rounded animate-pulse"></div>
                    <div className="w-4/6 h-4 bg-white/20 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                  <div className="w-full h-14 bg-white/20 rounded-2xl animate-pulse"></div>
                  <div className="w-full h-14 bg-white/20 rounded-2xl animate-pulse"></div>
                </div>

                {/* Additional Info */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-4 bg-white/20 rounded animate-pulse mx-auto mb-1"></div>
                      <div className="w-12 h-5 bg-white/20 rounded animate-pulse mx-auto"></div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-4 bg-white/20 rounded animate-pulse mx-auto mb-1"></div>
                      <div className="w-16 h-5 bg-white/20 rounded animate-pulse mx-auto"></div>
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