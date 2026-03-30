import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../types";
import { getPlayerBySocketId } from "../state/room-store";
import { broadcastGameState } from "./index";
import { isWinningHand } from "../game-engine";
import { MIN_PLAYERS } from "../constants";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerGameHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>, socket: GameSocket) {
  socket.on("game:start", () => {
    const result = getPlayerBySocketId(socket.id);
    if (!result) return;
    const { room, player } = result;
    if (room.hostId !== player.id) return;
    if (room.phase !== "lobby") return;
    if (room.players.size < MIN_PLAYERS) {
      socket.emit("room:error", { message: `Need at least ${MIN_PLAYERS} players` });
      return;
    }

    room.phase = "seating";

    const playerIds = Array.from(room.players.keys());
    room.seating = playerIds.map((pid, i) => ({
      playerId: pid,
      leftId: playerIds[(i + 1) % playerIds.length],
      rightId: playerIds[(i - 1 + playerIds.length) % playerIds.length],
    }));

    broadcastGameState(io, room.code);
  });

  socket.on("game:pass-card", (data) => {
    const result = getPlayerBySocketId(socket.id);
    if (!result) return;
    const { room, player } = result;
    const playerId = player.id;

    if (room.phase !== "playing") return;
    if (room.currentTurnId !== playerId) return;

    const hand = room.hands.get(playerId);
    if (!hand) return;

    const cardIndex = hand.findIndex((c) => c.id === data.cardId);
    if (cardIndex === -1) return;

    const mySeat = room.seating.find((s) => s.playerId === playerId);
    if (!mySeat || !mySeat.leftId) return;

    const [card] = hand.splice(cardIndex, 1);

    const leftHand = room.hands.get(mySeat.leftId);
    if (!leftHand) return;
    leftHand.push(card);

    if (isWinningHand(hand, room.cardsPerColor)) {
      handleWinner(io, room, playerId);
    }

    if (room.phase === "playing") {
      const activeSeat = room.seating.find((s) => s.playerId === mySeat.leftId);
      if (activeSeat) {
        room.currentTurnId = mySeat.leftId;
      }
    }

    broadcastGameState(io, room.code);
  });
}

function handleWinner(io: Server<ClientToServerEvents, ServerToClientEvents>, room: any, winnerId: string) {
  const winner = room.players.get(winnerId);
  if (!winner) return;

  room.winners.push(winnerId);

  io.to(room.code).emit("game:winner", {
    id: winnerId,
    name: winner.name,
    rank: room.winners.length,
  });

  const winnerSeat = room.seating.find((s: any) => s.playerId === winnerId);
  if (winnerSeat) {
    const leftSeat = room.seating.find((s: any) => s.playerId === winnerSeat.leftId);
    const rightSeat = room.seating.find((s: any) => s.playerId === winnerSeat.rightId);

    if (leftSeat) leftSeat.rightId = winnerSeat.rightId;
    if (rightSeat) rightSeat.leftId = winnerSeat.leftId;

    room.seating = room.seating.filter((s: any) => s.playerId !== winnerId);
  }

  room.hands.delete(winnerId);

  const activePlayers = room.seating.length;
  if (activePlayers <= 1) {
    room.phase = "finished";

    if (activePlayers === 1) {
      const lastPlayer = room.seating[0];
      room.winners.push(lastPlayer.playerId);
    }

    const winnersInfo = room.winners.map((id: string, i: number) => ({
      id,
      name: room.players.get(id)?.name || "Unknown",
      rank: i + 1,
    }));

    io.to(room.code).emit("game:over", { winners: winnersInfo });
  } else {
    if (room.currentTurnId === winnerId) {
      room.currentTurnId = winnerSeat?.leftId || room.seating[0]?.playerId;
    }
  }
}
