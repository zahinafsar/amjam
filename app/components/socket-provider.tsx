"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, ClientGameState } from "@/lib/types";
import { v4 as uuid } from "uuid";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("amjam_player_id");
  if (!id) {
    id = uuid();
    sessionStorage.setItem("amjam_player_id", id);
  }
  return id;
}

interface SocketContextValue {
  socket: GameSocket | null;
  connected: boolean;
  gameState: ClientGameState | null;
  playerId: string;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  gameState: null,
  playerId: "",
  leaveRoom: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const socketRef = useRef<GameSocket | null>(null);
  const [playerId] = useState(getPlayerId);

  useEffect(() => {
    const socket: GameSocket = io({
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // Attempt to reconnect to existing room
      socket.emit("room:reconnect", { playerId }, (res) => {
        if (res.success && res.roomCode) {
          // State will come via game:state event
          console.log(`[Socket] Reconnected to room ${res.roomCode}`);
        }
      });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("game:state", (state) => setGameState(state));

    return () => {
      socket.disconnect();
    };
  }, [playerId]);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("room:leave");
    setGameState(null);
    // Reset playerId so reconnect won't find old room
    const newId = uuid();
    sessionStorage.setItem("amjam_player_id", newId);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, gameState, playerId, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
