export default function LoadingProduct() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-72 bg-slate-200 rounded" />
      <div className="h-6 w-1/3 bg-slate-200 rounded" />
      <div className="h-4 w-2/3 bg-slate-200 rounded" />
      <div className="h-5 w-24 bg-slate-200 rounded" />
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-slate-200 rounded" />
        <div className="h-10 w-24 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
