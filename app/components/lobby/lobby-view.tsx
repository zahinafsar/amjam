"use client";

import { ClientGameState } from "@/lib/types";
import { useSocket } from "../socket-provider";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { BackButton } from "../ui/back-button";
import { MIN_PLAYERS } from "@/lib/constants";

interface LobbyViewProps {
  state: ClientGameState;
}

export function LobbyView({ state }: LobbyViewProps) {
  const { socket, leaveRoom } = useSocket();
  const isHost = state.myId === state.hostId;

  const handleStart = () => {
    socket?.emit("game:start");
  };

  const handleLeave = () => {
    leaveRoom();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackButton onClick={handleLeave} />
      <div className="glass rounded-3xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-800">Room Lobby</h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-sm text-gray-500">Room Code:</span>
            <span className="text-2xl font-black tracking-widest text-green-600">{state.roomCode}</span>
          </div>
        </div>

        {/* Players */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Players ({state.players.length})
          </h3>
          <div className="space-y-2">
            {state.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white/60 rounded-2xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${p.connected ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="font-bold text-gray-700">
                    {p.name}
                    {p.id === state.myId && " (You)"}
                  </span>
                </div>
                {p.isHost && <Badge color="yellow">Host</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* Start button (host only) */}
        {isHost && (
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={state.players.length < MIN_PLAYERS}
          >
            {state.players.length < MIN_PLAYERS
              ? `Need ${MIN_PLAYERS - state.players.length} more player(s)`
              : "Start Game"}
          </Button>
        )}

        {!isHost && (
          <p className="text-center text-gray-500 font-medium text-sm">
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
