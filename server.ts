import { createServer } from "http";
import next from "next";
import { initSocket } from "./lib/socket";
import { PORT as DEFAULT_PORT } from "./lib/constants";

const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
import { networkInterfaces } from "os";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

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

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    const ip = getLocalIP();
    console.log(`\n🎮 AmJam Game Server running!`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://${ip}:${PORT}\n`);
  });
});
