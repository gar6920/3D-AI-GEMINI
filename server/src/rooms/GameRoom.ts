import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";

export class GameRoom extends Room<GameState> {
    maxClients = 4;

    onCreate(options: any) {
        this.setState(new GameState());

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

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
        
        // Create a player for this client
        this.state.createPlayer(client.sessionId);
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
        
        // Remove the player from the game state
        this.state.removePlayer(client.sessionId);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
