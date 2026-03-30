"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "./components/socket-provider";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { BackButton } from "./components/ui/back-button";

type Screen = "home" | "join";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { socket, connected, playerId, gameState } = useSocket();
  const router = useRouter();

  // Auto-redirect if already in a room (e.g. reconnected after refresh)
  useEffect(() => {
    if (gameState?.roomCode) {
      router.push(`/room/${gameState.roomCode}`);
    }
  }, [gameState, router]);

  const handleCreate = () => {
    if (!socket || !playerName.trim()) return;
    setLoading(true);
    setError("");

    socket.emit("room:create", { playerName: playerName.trim(), playerId }, (res) => {
      setLoading(false);
      if (res.success && res.roomCode) {
        router.push(`/room/${res.roomCode}`);
      } else {
        setError(res.error || "Failed to create room");
      }
    });
  };

  const handleJoin = () => {
    if (!socket || !playerName.trim() || !roomCode.trim()) return;
    setLoading(true);
    setError("");

    socket.emit("room:join", { roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim(), playerId }, (res) => {
      setLoading(false);
      if (res.success) {
        router.push(`/room/${roomCode.trim().toUpperCase()}`);
      } else {
        setError(res.error || "Failed to join room");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {screen === "join" && <BackButton onClick={() => { setScreen("home"); setError(""); }} />}
      <div className="glass rounded-3xl p-8 max-w-sm w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-green-500" style={{
            filter: "drop-shadow(0 2px 3px rgba(22, 163, 74, 0.2))",
          }}>
            AmJam
          </h1>
          <p className="text-gray-500 font-medium mt-2 text-sm">Local WiFi Card Game</p>
          <div className="mt-2">
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${connected ? "bg-green-500" : "bg-red-400"}`} />
            <span className="text-xs text-gray-500">{connected ? "Connected" : "Connecting..."}</span>
          </div>
        </div>

        {screen === "home" && (
          <div className="space-y-4">
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
            {error && screen === "home" && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <div className="pt-2 space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCreate}
                disabled={!playerName.trim() || !connected || loading}
              >
                Create Room
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => setScreen("join")}
                disabled={!playerName.trim() || !connected}
              >
                Join Room
              </Button>
            </div>
          </div>
        )}

        {screen === "join" && (
          <div className="space-y-4">
            <Input
              label="Room Code"
              placeholder="e.g. 1234"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ""))}
              maxLength={4}
              inputMode="numeric"
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={!roomCode.trim() || loading}
            >
              {loading ? "Joining..." : "Join"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
