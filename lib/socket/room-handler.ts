import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, Player } from "../types";
import { getRoom, setRoom, generateRoomCode, getRoomByPlayerId, deleteRoom, getPlayerBySocketId } from "../state/room-store";
import { broadcastGameState } from "./index";
import { MAX_PLAYERS } from "../constants";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerRoomHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: GameSocket) {
  socket.on("room:create", (data, cb) => {
    const code = generateRoomCode();
    const player: Player = {
      id: data.playerId,
      socketId: socket.id,
      name: data.playerName,
      isHost: true,
      connected: true,
    };

    const room = {
      code,
      hostId: data.playerId,
      phase: "lobby" as const,
      players: new Map([[data.playerId, player]]),
      seating: [],
      hands: new Map(),
      currentTurnId: null,
      winners: [],
      colors: [],
      cardsPerColor: 0,
    };

    setRoom(code, room);
    socket.join(code);
    cb({ success: true, roomCode: code });
    broadcastGameState(io, code);
  });

  socket.on("room:join", (data, cb) => {
    const room = getRoom(data.roomCode);
    if (!room) {
      cb({ success: false, error: "Room not found" });
      return;
    }
    if (room.phase !== "lobby") {
      cb({ success: false, error: "Game already in progress" });
      return;
    }
    if (room.players.size >= MAX_PLAYERS) {
      cb({ success: false, error: `Room is full (max ${MAX_PLAYERS})` });
      return;
    }

    const player: Player = {
      id: data.playerId,
      socketId: socket.id,
      name: data.playerName,
      isHost: false,
      connected: true,
    };

    room.players.set(data.playerId, player);
    socket.join(data.roomCode);
    cb({ success: true });
    broadcastGameState(io, data.roomCode);
  });

  socket.on("room:reconnect", (data, cb) => {
    const room = getRoomByPlayerId(data.playerId);
    if (!room) {
      cb({ success: false, error: "No active room found" });
      return;
    }

    const player = room.players.get(data.playerId);
    if (!player) {
      cb({ success: false, error: "Player not found" });
      return;
    }

    // Update socket mapping
    player.socketId = socket.id;
    player.connected = true;
    socket.join(room.code);

    cb({ success: true, roomCode: room.code });
    broadcastGameState(io, room.code);
  });

  socket.on("room:leave", () => {
    leaveCurrentRoom(io, socket);
  });

  socket.on("disconnect", () => {
    const result = getPlayerBySocketId(socket.id);
    if (!result) return;
    const { room, player } = result;

    if (room.phase === "lobby") {
      room.players.delete(player.id);
      if (room.players.size === 0) {
        deleteRoom(room.code);
        return;
      }
      if (room.hostId === player.id) {
        const newHost = room.players.values().next().value!;
        newHost.isHost = true;
        room.hostId = newHost.id;
      }
    } else {
      // During game, mark disconnected but keep in room
      player.connected = false;
    }

    broadcastGameState(io, room.code);
  });
}

function leaveCurrentRoom(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: GameSocket) {
  const result = getPlayerBySocketId(socket.id);
  if (!result) return;
  const { room, player } = result;

  room.players.delete(player.id);
  socket.leave(room.code);

  if (room.players.size === 0) {
    deleteRoom(room.code);
    return;
  }

  if (room.hostId === player.id) {
    const newHost = room.players.values().next().value!;
    newHost.isHost = true;
    room.hostId = newHost.id;
  }

  broadcastGameState(io, room.code);
}
