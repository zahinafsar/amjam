export interface Player {
  id: string; // persistent playerId
  socketId: string; // current socket connection
  name: string;
  isHost: boolean;
  connected: boolean;
}

export interface Card {
  id: string;
  color: string;
}

export interface SeatingPlayer {
  playerId: string;
  leftId: string | null;
  rightId: string | null;
}

export type RoomPhase = "lobby" | "seating" | "playing" | "finished";

export interface RoomState {
  code: string;
  hostId: string;
  phase: RoomPhase;
  players: Map<string, Player>;
  // Seating: circular linked list via left/right
  seating: SeatingPlayer[];
  // Game state
  hands: Map<string, Card[]>; // playerId -> their cards
  currentTurnId: string | null;
  winners: string[]; // ordered list of winner playerIds
  colors: string[];
  cardsPerColor: number; // N — the number needed to win
}

// What the client receives (no other players' hands)
export interface ClientGameState {
  roomCode: string;
  phase: RoomPhase;
  players: PlayerInfo[];
  myHand: Card[];
  currentTurnId: string | null;
  winners: WinnerInfo[];
  seating: SeatingInfo[];
  myId: string;
  hostId: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
  cardCount: number;
}

export interface WinnerInfo {
  id: string;
  name: string;
  rank: number;
}

export interface SeatingInfo {
  playerId: string;
  playerName: string;
  leftId: string | null;
  rightId: string | null;
}

// Socket event maps
export interface ClientToServerEvents {
  "room:create": (data: { playerName: string; playerId: string }, cb: (res: { success: boolean; roomCode?: string; error?: string }) => void) => void;
  "room:join": (data: { roomCode: string; playerName: string; playerId: string }, cb: (res: { success: boolean; error?: string }) => void) => void;
  "room:leave": () => void;
  "room:reconnect": (data: { playerId: string }, cb: (res: { success: boolean; roomCode?: string; error?: string }) => void) => void;
  "seating:arrange": (data: { order: string[] }) => void;
  "seating:confirm": () => void;
  "game:start": () => void;
  "game:pass-card": (data: { cardId: string }) => void;
}

export interface ServerToClientEvents {
  "game:state": (state: ClientGameState) => void;
  "game:winner": (data: WinnerInfo) => void;
  "game:over": (data: { winners: WinnerInfo[] }) => void;
  "room:error": (data: { message: string }) => void;
}
