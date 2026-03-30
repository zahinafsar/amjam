"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClientGameState, WinnerInfo, Card } from "@/lib/types";
import { useSocket } from "../socket-provider";
import { GameCard, IncomingCard } from "../ui/game-card";
import { Modal } from "../ui/modal";
import { BackButton } from "../ui/back-button";

interface GameViewProps {
  state: ClientGameState;
}

export function GameView({ state }: GameViewProps) {
  const { socket, leaveRoom } = useSocket();
  const [winnerPopup, setWinnerPopup] = useState<WinnerInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [incomingCard, setIncomingCard] = useState<Card | null>(null);
  const [prevHandSize, setPrevHandSize] = useState(state.myHand.length);
  const dropRef = useRef<HTMLDivElement>(null);

  const isMyTurn = state.currentTurnId === state.myId;
  const amInGame = state.seating.some((s) => s.playerId === state.myId);
  const mySeat = state.seating.find((s) => s.playerId === state.myId);
  const leftPlayer = state.players.find((p) => p.id === mySeat?.leftId);
  const currentTurnPlayer = state.players.find((p) => p.id === state.currentTurnId);

  // Detect incoming card (hand grew)
  useEffect(() => {
    if (state.myHand.length > prevHandSize && prevHandSize > 0) {
      const newCard = state.myHand[state.myHand.length - 1];
      setIncomingCard(newCard);
      setTimeout(() => setIncomingCard(null), 800);
    }
    setPrevHandSize(state.myHand.length);
  }, [state.myHand.length, prevHandSize]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: WinnerInfo) => {
      setWinnerPopup(data);
      setTimeout(() => setWinnerPopup(null), 3000);
    };
    socket.on("game:winner", handler);
    return () => { socket.off("game:winner", handler); };
  }, [socket]);

  const handleDropped = useCallback((cardId: string, point: { x: number; y: number }): boolean => {
    if (!dropRef.current) return false;
    const rect = dropRef.current.getBoundingClientRect();
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  }, []);

  const handlePassComplete = useCallback((cardId: string) => {
    socket?.emit("game:pass-card", { cardId });
    setIsDragging(false);
  }, [socket]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-6 px-4 relative overflow-hidden">
      <BackButton onClick={() => { leaveRoom(); window.location.href = "/"; }} />

      {/* Top: Game info */}
      <div className="glass rounded-2xl px-6 py-3 mb-4 flex items-center gap-4">
        <span className="text-sm font-bold text-gray-500">Room: {state.roomCode}</span>
        <span className="text-sm">|</span>
        <span className={`text-sm font-bold ${isMyTurn ? "text-green-600" : "text-gray-500"}`}>
          {isMyTurn ? "Your Turn!" : `${currentTurnPlayer?.name}'s turn`}
        </span>
        {state.winners.length > 0 && (
          <>
            <span className="text-sm">|</span>
            <span className="text-sm text-gray-500">Winners: {state.winners.length}</span>
          </>
        )}
      </div>

      {/* Middle area */}
      <div className="flex-1 flex items-center justify-between w-full max-w-2xl px-4">
        {/* Left dropzone */}
        <div ref={dropRef} className="min-w-[120px]">
          <AnimatePresence>
            {isDragging && isMyTurn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-28 h-40 rounded-2xl border-3 border-dashed border-green-400 bg-green-400/10 backdrop-blur-sm flex items-center justify-center">
                  <p className="text-xs font-bold text-green-600">Drop here</p>
                </div>
                <p className="text-xs font-bold text-green-600">
                  Pass to {leftPlayer?.name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        {/* Incoming card animation on right */}
        <AnimatePresence>
          {incomingCard && (
            <div className="flex flex-col items-center gap-2">
              <IncomingCard color={incomingCard.color} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-blue-500"
              >
                Received!
              </motion.p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: My hand */}
      {amInGame ? (
        <div className="w-full max-w-2xl">
          <div className="flex justify-center gap-3 flex-wrap mb-4">
            {state.myHand.map((card, i) => (
              <GameCard
                key={card.id}
                color={card.color}
                selected={false}
                isDraggable={isMyTurn}
                onDragStateChange={(d) => setIsDragging(d)}
                onDropped={(point) => handleDropped(card.id, point)}
                onPassComplete={() => handlePassComplete(card.id)}
                size="lg"
                delay={i * 80}
              />
            ))}
          </div>
          <p className="text-center text-gray-500 font-medium text-sm">
            {isMyTurn
              ? "Drag a card to the drop zone on the left"
              : `Waiting for ${currentTurnPlayer?.name} to pass a card...`
            }
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <p className="font-bold text-gray-600">You won! Watching the remaining game...</p>
        </div>
      )}

      {/* Winner popup */}
      <Modal open={!!winnerPopup} onClose={() => setWinnerPopup(null)} title="Winner!">
        {winnerPopup && (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-xl font-black text-gray-800">{winnerPopup.name}</p>
            <p className="text-gray-500 font-medium">Finished #{winnerPopup.rank}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
