"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-2xl
            bg-white/90 backdrop-blur-sm
            border-2 border-white/60
            text-gray-800 font-medium placeholder-gray-400
            shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_2px_0_rgba(255,255,255,0.8)]
            focus:outline-none focus:border-green-400 focus:shadow-[0_4px_16px_rgba(74,222,128,0.3),inset_0_2px_0_rgba(255,255,255,0.8)]
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
