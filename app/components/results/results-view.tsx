"use client";

import { ClientGameState } from "@/lib/types";
import { Button } from "../ui/button";
import { BackButton } from "../ui/back-button";
import { useSocket } from "../socket-provider";

interface ResultsViewProps {
  state: ClientGameState;
}

const rankEmoji = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"];

export function ResultsView({ state }: ResultsViewProps) {
  const { leaveRoom } = useSocket();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackButton onClick={() => { leaveRoom(); window.location.href = "/"; }} />
      <div className="glass rounded-3xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-3xl font-black text-gray-800">Game Over!</h2>
        </div>

        <div className="space-y-3 mb-8">
          {state.winners.map((winner, i) => {
            const isLast = i === state.winners.length - 1 && state.winners.length > 1;
            return (
              <div
                key={winner.id}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl
                  ${i === 0
                    ? "bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 shadow-md"
                    : isLast
                    ? "bg-gray-100/80 border-2 border-gray-200"
                    : "bg-white/60 border-2 border-transparent shadow-sm"
                  }
                `}
              >
                <span className="text-2xl">{rankEmoji[i] || `#${i + 1}`}</span>
                <div>
                  <p className={`font-black ${i === 0 ? "text-yellow-700" : "text-gray-700"}`}>
                    {winner.name}
                    {winner.id === state.myId && " (You)"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {i === 0 ? "Winner!" : isLast ? "Last standing" : `#${winner.rank}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <a href="/">
          <Button variant="primary" size="lg" className="w-full">
            Play Again
          </Button>
        </a>
      </div>
    </div>
  );
}
