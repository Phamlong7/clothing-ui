"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useToast } from "@/components/ToastProvider";

type ImageUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  label?: string;
  helperText?: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUploader({
  value,
  onChange,
  onClear,
  label = "Product image",
  helperText = "Upload a high-quality image to showcase your product."
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { show } = useToast();

  const canUpload = Boolean(CLOUD_NAME && UPLOAD_PRESET);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      show("Please choose an image file", "error");
      return;
    }

    if (!canUpload) {
      show("Cloudinary is not configured. Paste an image URL instead.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET as string);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      if (data.secure_url) {
        onChange(data.secure_url as string);
        show("Image uploaded successfully", "success");
      } else {
        throw new Error("Upload failed - missing secure URL");
      }
    } catch (error) {
      console.error("Image upload failed", error);
      show("Image upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  }, [canUpload, onChange, show]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const activeHint = useMemo(() => {
    if (!canUpload) {
      return "Cloudinary credentials are missing. Paste a direct image URL instead.";
    }
    if (isUploading) {
      return "Uploading image…";
    }
    return helperText;
  }, [canUpload, helperText, isUploading]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-white font-semibold text-lg">
          {label}
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className="text-sm font-semibold text-red-200 hover:text-red-100 transition"
          >
            Remove image
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-purple-200 hover:text-purple-100 transition"
            disabled={!canUpload}
          >
            Browse files
          </button>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!canUpload) return;
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "relative rounded-3xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur-xl p-6 transition-all duration-300",
          isDragging && "border-purple-400 bg-purple-500/10",
          isUploading && "opacity-70"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSelect}
        />

        {value ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src={value}
              alt="Uploaded product image"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-white/80 py-8 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Drag & drop your image</p>
              <p className="text-sm text-white/60">Supports PNG, JPG, SVG, GIF, and WebP up to 5MB.</p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition"
              disabled={!canUpload || isUploading}
            >
              {isUploading ? "Uploading…" : "Select file"}
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-white/70">{activeHint}</p>
    </div>
  );
}


