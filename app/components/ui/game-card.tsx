"use client";

import { useRef } from "react";
import { motion, useMotionValue, useAnimationControls } from "framer-motion";
import { CARD_COLORS } from "@/lib/constants";

interface GameCardProps {
  color: string;
  selected?: boolean;
  isDraggable?: boolean;
  onDropped?: (point: { x: number; y: number }) => boolean; // return true if dropped on zone
  onPassComplete?: () => void;
  onDragStateChange?: (dragging: boolean) => void;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  delay?: number;
}

const sizeClasses = {
  sm: "w-14 h-20 rounded-xl text-lg",
  md: "w-20 h-28 rounded-2xl text-2xl",
  lg: "w-24 h-36 rounded-2xl text-3xl",
};

export function GameCard({
  color,
  selected,
  isDraggable,
  onDropped,
  onPassComplete,
  onDragStateChange,
  onClick,
  size = "md",
  delay = 0,
}: GameCardProps) {
  const colorDef = CARD_COLORS.find((c) => c.name === color);
  const hex = colorDef?.hex || "#888";
  const controls = useAnimationControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isFlying = useRef(false);

  const handleDragEnd = (event: any, info: any) => {
    const landed = onDropped?.(info.point);
    if (landed) {
      // Emit pass immediately, then animate
      onPassComplete?.();
      isFlying.current = true;
      controls.start({
        x: x.get() - 800,
        opacity: 0,
        scale: 0.4,
        transition: { duration: 0.4, ease: "easeIn" },
      });
    } else {
      // Snap back
      controls.start({
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 500, damping: 30 },
      });
    }
    onDragStateChange?.(false);
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      drag={isDraggable && !isFlying.current}
      dragSnapToOrigin={false}
      dragMomentum={false}
      onDragStart={() => onDragStateChange?.(true)}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, y, background: `linear-gradient(135deg, ${hex}dd, ${hex})` }}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center font-black
        border-3 select-none touch-none
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${selected ? "border-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]" : "border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"}
      `}
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      whileInView={{
        opacity: 1,
        scale: selected ? 1.15 : 1,
        y: selected ? -12 : 0,
        rotateY: 0,
        transition: { delay: delay / 1000, duration: 0.4, ease: "easeOut" },
      }}
      whileHover={isDraggable ? { scale: 1.1, y: -8, transition: { duration: 0.15 } } : undefined}
      whileDrag={{ scale: 1.25, zIndex: 50, boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}
    >
      <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
        {color[0]}
      </span>
    </motion.button>
  );
}

/** Incoming card animation — slides in from the right */
export function IncomingCard({ color }: { color: string }) {
  const colorDef = CARD_COLORS.find((c) => c.name === color);
  const hex = colorDef?.hex || "#888";

  return (
    <motion.div
      className="w-20 h-28 rounded-2xl text-2xl flex items-center justify-center font-black border-3 border-white/50"
      style={{ background: `linear-gradient(135deg, ${hex}dd, ${hex})` }}
      initial={{ x: 300, opacity: 0, scale: 0.5 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
        {color[0]}
      </span>
    </motion.div>
  );
}
