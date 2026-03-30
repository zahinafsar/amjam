import { NextResponse } from "next/server";
import { networkInterfaces } from "os";
import { PORT } from "@/lib/constants";

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

export async function GET() {
  return NextResponse.json({
    ip: getLocalIP(),
    port: PORT,
  });
}
