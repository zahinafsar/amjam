"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative rounded-3xl p-6 max-w-md w-full shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
        {title && (
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
