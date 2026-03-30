import { Card } from "./types";
import { CARD_COLORS } from "./constants";
import { v4 as uuid } from "uuid";

/**
 * Generate a deck for N players: N colors, N cards of each color = N² cards
 */
export function generateDeck(playerCount: number): Card[] {
  const colors = CARD_COLORS.slice(0, playerCount);
  const deck: Card[] = [];
  for (const color of colors) {
    for (let i = 0; i < playerCount; i++) {
      deck.push({ id: uuid(), color: color.name });
    }
  }
  return deck;
}

/**
 * Fisher-Yates shuffle
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Deal cards equally to players
 */
export function deal(deck: Card[], playerIds: string[]): Map<string, Card[]> {
  const hands = new Map<string, Card[]>();
  const cardsPerPlayer = deck.length / playerIds.length;

  for (const id of playerIds) {
    hands.set(id, []);
  }

  for (let i = 0; i < deck.length; i++) {
    const playerIndex = i % playerIds.length;
    hands.get(playerIds[playerIndex])!.push(deck[i]);
  }

  return hands;
}

/**
 * Check if a hand is a winning hand (exactly expectedCount cards, all same color)
 */
export function isWinningHand(hand: Card[], expectedCount: number): boolean {
  if (hand.length !== expectedCount) return false;
  const firstColor = hand[0].color;
  return hand.every((card) => card.color === firstColor);
}

/**
 * Check if any player was dealt a winning hand
 */
export function hasImmediateWinner(hands: Map<string, Card[]>, expectedCount: number): boolean {
  for (const hand of hands.values()) {
    if (isWinningHand(hand, expectedCount)) return true;
  }
  return false;
}

/**
 * Generate deck, shuffle, and deal. Re-shuffle if immediate winner.
 */
export function setupGame(playerIds: string[]): Map<string, Card[]> {
  const n = playerIds.length;
  let deck = generateDeck(n);
  let hands: Map<string, Card[]>;

  let attempts = 0;
  do {
    deck = shuffle(deck);
    hands = deal(deck, playerIds);
    attempts++;
  } while (hasImmediateWinner(hands, n) && attempts < 100);

  return hands;
}
