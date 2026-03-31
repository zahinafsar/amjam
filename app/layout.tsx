import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "./components/socket-provider";
import { FullscreenButton } from "./components/ui/fullscreen-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmJam - Local WiFi Card Game",
  description:
    "Play AmJam with friends on the same WiFi. A fast-paced multiplayer card game — create a room, invite players, and start the fun.",
  keywords: ["amjam", "card game", "multiplayer", "local wifi", "party game"],
  openGraph: {
    title: "AmJam - Local WiFi Card Game",
    description:
      "Play AmJam with friends on the same WiFi. A fast-paced multiplayer card game.",
    type: "website",
    siteName: "AmJam",
  },
  twitter: {
    card: "summary",
    title: "AmJam - Local WiFi Card Game",
    description:
      "Play AmJam with friends on the same WiFi. A fast-paced multiplayer card game.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketProvider>
          <FullscreenButton />
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
