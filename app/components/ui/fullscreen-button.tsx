"use client";

import { useState, useEffect, useCallback } from "react";
import { Maximize, Minimize } from "lucide-react";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-gray-800 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
    </button>
  );
}
