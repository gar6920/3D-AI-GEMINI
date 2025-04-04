"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const colyseus_1 = require("colyseus");
const GameState_1 = require("./schema/GameState");
class GameRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 4;
    }
    onCreate(options) {
        this.setState(new GameState_1.GameState());
        // Handle game logic messages
        this.onMessage("player-move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                // Update player position
                player.x = data.x;
                player.y = data.y;
            }
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        // Create a player for this client
        this.state.createPlayer(client.sessionId);
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
        // Remove the player from the game state
        this.state.removePlayer(client.sessionId);
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.GameRoom = GameRoom;
