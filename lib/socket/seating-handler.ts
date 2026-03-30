import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, SeatingPlayer } from "../types";
import { getPlayerBySocketId } from "../state/room-store";
import { broadcastGameState } from "./index";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSeatingHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: GameSocket) {
  // Host arranges seating order
  socket.on("seating:arrange", (data) => {
    const result = getPlayerBySocketId(socket.id);
    if (!result) return;
    const { room } = result;
    if (room.hostId !== result.player.id) return;
    if (room.phase !== "seating") return;

    const { order } = data; // array of playerIds in circular order
    const seating: SeatingPlayer[] = order.map((playerId, i) => ({
      playerId,
      leftId: order[(i + 1) % order.length],
      rightId: order[(i - 1 + order.length) % order.length],
    }));

    room.seating = seating;
    broadcastGameState(io, room.code);
  });

  // Host confirms seating and starts game
  socket.on("seating:confirm", () => {
    const result = getPlayerBySocketId(socket.id);
    if (!result) return;
    const { room } = result;
    if (room.hostId !== result.player.id) return;
    if (room.phase !== "seating") return;
    if (room.seating.length < 2) return;

    room.phase = "playing";

    // Import and setup game
    const { setupGame } = require("../game-engine");
    const playerIds = room.seating.map((s) => s.playerId);
    room.hands = setupGame(playerIds);
    room.cardsPerColor = playerIds.length;
    room.currentTurnId = playerIds[0];

    broadcastGameState(io, room.code);
  });
}
