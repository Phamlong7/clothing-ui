"use client";

import LinkButton from "@/components/LinkButton";
import DeleteButton from "@/components/DeleteButton";
import { useAuth } from "@/components/AuthProvider";
import { UI_TEXT } from "@/lib/constants";

type Props = { id: string; name: string };

export default function ProductActionButtons({ id, name }: Props) {
  const { isAuthenticated } = useAuth();
  const disabled = !isAuthenticated;
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-6">
      <LinkButton
        href={`/products/${id}/edit`}
        size="lg"
        disabled={disabled}
        className={`flex-1 w-full !h-[56px] !px-8 !py-4 !text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {UI_TEXT.actions.edit}
        </div>
      </LinkButton>
      <DeleteButton id={id} productName={name} disabled={disabled} />
    </div>
  );
}


