"use client";

import { useEffect, useState } from "react";

export interface ErrorAlertProps {
  errors: string | string[];
  title?: string;
  onClose?: () => void;
  autoClose?: number; // milliseconds, 0 = don't auto-close
}

export default function ErrorAlert({ errors, title = "Error", onClose, autoClose = 0 }: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const errorList = Array.isArray(errors) ? errors : [errors];
  const hasMultiple = errorList.length > 1;

  return (
    <div className="w-full bg-red-500/20 border border-red-500/30 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-200">{title}</h3>
            {hasMultiple && <p className="text-xs text-red-300/80 mt-1">{errorList.length} issues found</p>}
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
          aria-label="Close alert"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error Messages */}
      {hasMultiple ? (
        <ul className="space-y-1.5 mt-3 ml-8">
          {errorList.map((error, idx) => (
            <li key={idx} className="text-sm text-red-200 flex items-start gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-red-200 ml-8">{errorList[0]}</p>
      )}

      {/* Helper text */}
      <p className="text-xs text-red-300/60 mt-3 ml-8">Please check the information above and try again.</p>
    </div>
  );
}
