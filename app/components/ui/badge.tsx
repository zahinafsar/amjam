"use client";

interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "blue" | "yellow" | "red" | "gray";
  className?: string;
}

const colors = {
  green: "bg-gradient-to-r from-green-400 to-green-500 text-white",
  blue: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
  yellow: "bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900",
  red: "bg-gradient-to-r from-red-400 to-red-500 text-white",
  gray: "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700",
};

export function Badge({ children, color = "green", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
        shadow-[0_2px_4px_rgba(0,0,0,0.15)]
        ${colors[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
