import { RoomState } from "../types";

const rooms = new Map<string, RoomState>();

export function getRoom(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function setRoom(code: string, room: RoomState): void {
  rooms.set(code, room);
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
}

export function getRoomBySocketId(socketId: string): RoomState | undefined {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.socketId === socketId) return room;
    }
  }
  return undefined;
}

export function getPlayerBySocketId(socketId: string): { room: RoomState; player: import("../types").Player } | undefined {
  for (const room of rooms.values()) {
    for (const player of room.players.values()) {
      if (player.socketId === socketId) return { room, player };
    }
  }
  return undefined;
}

export function getRoomByPlayerId(playerId: string): RoomState | undefined {
  for (const room of rooms.values()) {
    if (room.players.has(playerId)) return room;
  }
  return undefined;
}

export function generateRoomCode(): string {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  if (rooms.has(code)) return generateRoomCode();
  return code;
}
