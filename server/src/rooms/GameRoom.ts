import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";

export class GameRoom extends Room<GameState> {
    maxClients = 4;
    
    // Player movement speed (should match client-side)
    private playerSpeed: number = 5;

    onCreate(options: any) {
        this.setState(new GameState());

        // Set up server-side game simulation loop (runs 20 times per second)
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        
        // Handle player movement input
        this.onMessage("moveInput", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                // Update player movement state based on received input
                player.isMoving = data.moving;
                player.inputDirectionX = data.direction[0];
                player.inputDirectionZ = data.direction[1];
                
                // Update rotation
                player.rotationX = data.rotation.x;
                player.rotationY = data.rotation.y;
                player.rotationZ = data.rotation.z;
                player.rotationW = data.rotation.w;
            }
        });

        // Legacy message handler (can be removed if no longer needed)
        this.onMessage("player-move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                // Update player position directly
                player.x = data.x;
                player.y = data.y;
            }
        });
    }
    
    // Server-side game update loop
    update(deltaTime: number) {
        // Convert delta time from milliseconds to seconds
        const dt = deltaTime / 1000;
        
        // Process movement for all players
        this.state.players.forEach(player => {
            if (player.isMoving) {
                // Calculate position change based on input direction and speed
                const distance = this.playerSpeed * dt;
                
                // Normalize direction if necessary
                let dirX = player.inputDirectionX;
                let dirZ = player.inputDirectionZ;
                const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
                
                if (length > 0) {
                    dirX /= length;
                    dirZ /= length;
                    
                    // Update player position
                    player.x += dirX * distance;
                    player.z += dirZ * distance;
                    
                    // TODO: Add collision detection here
                }
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
