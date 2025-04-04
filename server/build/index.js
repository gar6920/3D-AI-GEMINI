"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_1 = require("colyseus");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const GameRoom_1 = require("./rooms/GameRoom");
const port = Number(process.env.PORT) || 3000;
const app = (0, express_1.default)();
const gameServer = new colyseus_1.Server({
    server: (0, http_1.createServer)(app),
});
// Register GameRoom as "game"
gameServer.define("game", GameRoom_1.GameRoom);
gameServer.listen(port);
console.log(`🎮 Game server is running on http://localhost:${port}`);
