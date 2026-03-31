// Card variants — fruit-themed, up to 10 for max players
export const CARD_COLORS = [
  { name: "Mango", hex: "#E0952B", bg: "bg-amber-500", image: "/cards/mango.png" },
  { name: "Apple", hex: "#C0504D", bg: "bg-red-400", image: "/cards/apple.png" },
  { name: "Watermelon", hex: "#C0392B", bg: "bg-red-600", image: "/cards/watermelon.png" },
  { name: "Banana", hex: "#C8B833", bg: "bg-yellow-500", image: "/cards/banana.png" },
  { name: "Pomegranate", hex: "#9B2C2C", bg: "bg-red-800", image: "/cards/pomegranate.png" },
  { name: "Peach", hex: "#D97A2B", bg: "bg-orange-400", image: "/cards/peach.png" },
  { name: "Lemon", hex: "#D4C84A", bg: "bg-yellow-400", image: "/cards/lemon.png" },
  { name: "Avocado", hex: "#4A7A3D", bg: "bg-green-600", image: "/cards/avocado.png" },
  { name: "Plum", hex: "#7B5EA7", bg: "bg-purple-500", image: "/cards/plum.png" },
  { name: "Papaya", hex: "#C77830", bg: "bg-orange-600", image: "/cards/papaya.png" },
];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 10;
export const DISCONNECT_TIMEOUT_MS = 30_000;
export const PORT = 3456;
