"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createProduct, getProduct, updateProduct } from "@/lib/api";
import type { Product } from "@/lib/api";

export default function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name:"", description:"", price:"", image:"" });
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isValid = useMemo(() => {
    if (!form.name.trim()) return false;
    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0) return false;
    return true;
  }, [form]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getProduct(id);
        setForm({ name:p.name, description:p.description, price:String(p.price), image:p.image ?? "" });
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setError(null);
    const body: Omit<Product, "id"> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim() || null,
    };
    try {
      if (id) await updateProduct(id, body);
      else await createProduct(body);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm">Loading...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg bg-white/80 p-4 rounded-lg border">
      {error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      ) : null}

      <div className="space-y-1">
        <label className="text-sm font-medium">Name</label>
        <input className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50" placeholder="Name"
               value={form.name} onChange={e=>setForm(s=>({...s,name:e.target.value}))}/>
        {!form.name.trim() ? <p className="text-xs text-red-600">Name is required.</p> : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <textarea className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50" placeholder="Short description"
                  rows={4}
                  value={form.description} onChange={e=>setForm(s=>({...s,description:e.target.value}))}/>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Price</label>
        <input className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50" placeholder="Price" type="number" step="0.01" min="0"
               value={form.price} onChange={e=>setForm(s=>({...s,price:e.target.value}))}/>
        {(Number.isNaN(Number(form.price)) || Number(form.price) < 0) ? <p className="text-xs text-red-600">Price must be a positive number.</p> : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Image URL (optional)</label>
        <input className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-black/50" placeholder="https://..."
               value={form.image} onChange={e=>setForm(s=>({...s,image:e.target.value}))}/>
      </div>

      <div className="flex gap-2">
        <button disabled={!isValid || saving} className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" type="submit">
          {saving ? "Saving..." : id ? "Update" : "Create"}
        </button>
        <button className="px-4 py-2 border rounded bg-white" type="button" onClick={()=>history.back()}>Cancel</button>
      </div>
    </form>
  );
}
