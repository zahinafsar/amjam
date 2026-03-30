import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, ClientGameState, PlayerInfo, SeatingInfo, WinnerInfo } from "../types";
import { getRoom } from "../state/room-store";
import { registerRoomHandlers } from "./room-handler";
import { registerSeatingHandlers } from "./seating-handler";
import { registerGameHandlers } from "./game-handler";

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function initSocket(httpServer: HttpServer) {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);
    registerRoomHandlers(io, socket);
    registerSeatingHandlers(io, socket);
    registerGameHandlers(io, socket);
  });

  return io;
}

export function broadcastGameState(ioServer: Server<ClientToServerEvents, ServerToClientEvents>, roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) return;

  // Build player info (visible to all)
  const players: PlayerInfo[] = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
    connected: p.connected,
    cardCount: room.hands.get(p.id)?.length ?? 0,
  }));

  // Seating info
  const seating: SeatingInfo[] = room.seating.map((s) => ({
    playerId: s.playerId,
    playerName: room.players.get(s.playerId)?.name || "Unknown",
    leftId: s.leftId,
    rightId: s.rightId,
  }));

  // Winners
  const winners: WinnerInfo[] = room.winners.map((id, i) => ({
    id,
    name: room.players.get(id)?.name || "Unknown",
    rank: i + 1,
  }));

  // Send personalized state to each player (keyed by persistent playerId)
  for (const [playerId, player] of room.players) {
    if (!player.connected) continue;
    const state: ClientGameState = {
      roomCode,
      phase: room.phase,
      players,
      myHand: room.hands.get(playerId) ?? [],
      currentTurnId: room.currentTurnId,
      winners,
      seating,
      myId: playerId,
      hostId: room.hostId,
    };

    ioServer.to(player.socketId).emit("game:state", state);
  }
}
