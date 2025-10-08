"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { UI_TEXT } from "@/lib/constants";

interface DeleteButtonProps {
  id: string;
  productName: string;
  className?: string;
}

export default function DeleteButton({ id, productName, className }: DeleteButtonProps) {
  const router = useRouter();
  const { show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Match Edit button sizing and rhythm (softened transitions)
  const defaultClassName =
    "flex-1 w-full !h-[56px] inline-flex items-center justify-center gap-2 border-2 border-red-400/30 text-red-200 hover:bg-red-500/15 backdrop-blur-sm font-bold !text-lg !px-8 !py-0 rounded-2xl transition-all duration-200 hover:border-red-400/50 shadow-lg hover:shadow-xl";
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/Products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      show(UI_TEXT.toast.deleteSuccess, "success");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete product:", error);
      show(UI_TEXT.toast.deleteFailed, "error");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className || defaultClassName}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className="leading-none">{UI_TEXT.actions.delete}</span>
      </button>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        productName={productName}
        onClose={() => {
          if (!isDeleting) setIsModalOpen(false);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
