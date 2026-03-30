"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/app/components/socket-provider";
import { LobbyView } from "@/app/components/lobby/lobby-view";
import { SeatingView } from "@/app/components/seating/seating-view";
import { GameView } from "@/app/components/game/game-view";
import { ResultsView } from "@/app/components/results/results-view";

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const { gameState, connected } = useSocket();
  const [waitingForState, setWaitingForState] = useState(true);

  useEffect(() => {
    // Give reconnect a moment to restore state
    const timer = setTimeout(() => setWaitingForState(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gameState && gameState.roomCode === code) {
      setWaitingForState(false);
    }
  }, [gameState, code]);

  if (!connected || waitingForState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-bold text-gray-600">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!gameState || gameState.roomCode !== code) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 text-center">
          <p className="font-bold text-gray-600 mb-2">Room not found or not joined</p>
          <a href="/" className="text-green-600 font-bold hover:underline">Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {gameState.phase === "lobby" && <LobbyView state={gameState} />}
      {gameState.phase === "seating" && <SeatingView state={gameState} />}
      {gameState.phase === "playing" && <GameView state={gameState} />}
      {gameState.phase === "finished" && <ResultsView state={gameState} />}
    </div>
  );
}
