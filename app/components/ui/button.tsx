"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: {
    bg: "bg-gradient-to-b from-green-400 to-green-600",
    shadow: "#166534",
    text: "text-white",
  },
  secondary: {
    bg: "bg-gradient-to-b from-blue-400 to-blue-600",
    shadow: "#1e3a8a",
    text: "text-white",
  },
  danger: {
    bg: "bg-gradient-to-b from-red-400 to-red-600",
    shadow: "#991b1b",
    text: "text-white",
  },
  accent: {
    bg: "bg-gradient-to-b from-yellow-300 to-yellow-500",
    shadow: "#92400e",
    text: "text-gray-900",
  },
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-base rounded-2xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, disabled, ...props }, ref) => {
    const v = variants[variant];

    return (
      <button
        ref={ref}
        className={`
          btn-3d font-bold tracking-wide
          ${v.bg} ${v.text} ${sizes[size]}
          ${disabled ? "opacity-50 cursor-not-allowed !transform-none !shadow-none" : "cursor-pointer"}
          ${className}
        `}
        style={{ "--btn-shadow-color": v.shadow } as React.CSSProperties}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
