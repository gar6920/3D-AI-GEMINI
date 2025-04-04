import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT) || 3000;
const app = express();

const gameServer = new Server({
  server: createServer(app),
});

// Register GameRoom as "game"
gameServer.define("game", GameRoom);

gameServer.listen(port);
console.log(`🎮 Game server is running on http://localhost:${port}`);
