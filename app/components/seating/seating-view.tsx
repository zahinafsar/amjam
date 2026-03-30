"use client";

import { useState, useEffect } from "react";
import { ClientGameState } from "@/lib/types";
import { useSocket } from "../socket-provider";
import { Button } from "../ui/button";
import { BackButton } from "../ui/back-button";

interface SeatingViewProps {
  state: ClientGameState;
}

export function SeatingView({ state }: SeatingViewProps) {
  const { socket, leaveRoom } = useSocket();
  const isHost = state.myId === state.hostId;
  const [order, setOrder] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    // Initialize order from seating
    if (state.seating.length > 0) {
      setOrder(state.seating.map((s) => s.playerId));
    }
  }, [state.seating]);

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    const newOrder = [...order];
    const [dragged] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, dragged);
    setOrder(newOrder);
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    if (isHost) {
      socket?.emit("seating:arrange", { order });
    }
  };

  const handleConfirm = () => {
    socket?.emit("seating:arrange", { order });
    socket?.emit("seating:confirm");
  };

  const getPlayerName = (id: string) => {
    return state.players.find((p) => p.id === id)?.name || "Unknown";
  };

  // Calculate circular seating display
  const angleStep = (2 * Math.PI) / order.length;
  const radius = 120;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackButton onClick={() => { leaveRoom(); window.location.href = "/"; }} />
      <div className="glass rounded-3xl p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-800">Arrange Seating</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isHost ? "Drag to reorder players in a circle" : "Host is arranging seats..."}
          </p>
        </div>

        {/* Circular preview */}
        <div className="relative mx-auto mb-6" style={{ width: 280, height: 280 }}>
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300" />
          {order.map((playerId, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const x = 140 + radius * Math.cos(angle) - 36;
            const y = 140 + radius * Math.sin(angle) - 20;
            const isMe = playerId === state.myId;
            return (
              <div
                key={playerId}
                className={`absolute px-3 py-2 rounded-xl text-xs font-bold text-center min-w-[72px] transition-all duration-200 ${
                  isMe
                    ? "bg-gradient-to-b from-green-400 to-green-500 text-white shadow-lg"
                    : "bg-white/80 text-gray-700 shadow-md"
                }`}
                style={{ left: x, top: y }}
              >
                {getPlayerName(playerId)}
                {isMe && " (You)"}
              </div>
            );
          })}
          {/* Arrows showing direction */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
            Pass Left
          </div>
        </div>

        {/* Drag list (host only) */}
        {isHost && (
          <>
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Drag to reorder:</p>
              {order.map((playerId, idx) => (
                <div
                  key={playerId}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl cursor-grab active:cursor-grabbing
                    transition-all duration-150
                    ${dragIdx === idx
                      ? "bg-green-100 border-2 border-green-400 scale-105"
                      : "bg-white/60 border-2 border-transparent shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  <span className="text-gray-400 font-bold text-sm">{idx + 1}</span>
                  <span className="font-bold text-gray-700">{getPlayerName(playerId)}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    L: {getPlayerName(order[(idx + 1) % order.length])} | R: {getPlayerName(order[(idx - 1 + order.length) % order.length])}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="accent" size="lg" className="w-full" onClick={handleConfirm}>
              Confirm & Deal Cards
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
