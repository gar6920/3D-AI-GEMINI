/**
 * NetworkManager.ts - Handles network communication with the Colyseus game server
 * 
 * Prerequisites:
 * 1. Add colyseus.js to your PlayCanvas project as an external script
 * 2. Ensure it loads before this script
 * 3. Configure the serverAddress attribute in the PlayCanvas editor
 */

// Reference Colyseus globally since it's loaded via external script
declare var colyseus: any;
declare var pc: any;

class NetworkManager extends pc.ScriptType {
    // Script attributes that can be modified in PlayCanvas editor
    static attributes = {
        serverAddress: { 
            type: 'string', 
            default: 'ws://localhost:3000', 
            title: 'Server Address',
            description: 'WebSocket address of the Colyseus server'
        },
        roomName: { 
            type: 'string', 
            default: 'game', 
            title: 'Room Name',
            description: 'Name of the room to join'
        },
        debug: {
            type: 'boolean',
            default: true,
            title: 'Debug Mode',
            description: 'Enable detailed logging'
        }
    };

    // Properties
    client: any = null;  // Colyseus client instance
    room: any = null;    // Current room instance
    isConnecting: boolean = false;

    // Initialize runs when the script instance is loaded
    initialize() {
        this.log("Initializing NetworkManager...");
        
        // Verify Colyseus is available
        if (!colyseus) {
            console.error("Colyseus client library not found! Add it as an external script in your PlayCanvas project.");
            return;
        }

        // Connect to server
        this.connect();
    }

    // Attempt to connect to the server and join a room
    async connect() {
        if (this.isConnecting || this.room) return;
        
        this.isConnecting = true;
        
        try {
            this.log(`Connecting to server: ${this.serverAddress}`);
            this.client = new colyseus.Client(this.serverAddress);

            this.room = await this.client.joinOrCreate(this.roomName, {
                // Add any player data here if needed
                // name: "Player",
                // customData: {}
            });

            this.log(`Successfully joined room: ${this.room.roomId}`);
            this.setupRoomListeners();
            
            // Notify other components of successful connection
            this.app.fire('network:connected', this.room);
            
        } catch (error) {
            console.error("Failed to connect:", error);
            this.app.fire('network:error', error);
        } finally {
            this.isConnecting = false;
        }
    }

    // Set up all room event listeners
    setupRoomListeners() {
        if (!this.room) return;

        // Initial state received
        this.room.onStateChange.once((state: any) => {
            this.log("Initial room state:", state);
            this.app.fire('network:initialState', state);
        });

        // Subsequent state changes
        this.room.onStateChange((state: any) => {
            if (this.debug) {
                this.log("State updated:", state);
            }
            this.app.fire('network:stateChanged', state);
        });

        // Room error
        this.room.onError((code: number, message: string) => {
            console.error(`Room error - Code: ${code}, Message: ${message}`);
            this.app.fire('network:error', { code, message });
        });

        // Disconnection
        this.room.onLeave((code: number) => {
            this.log(`Left room - Code: ${code}`);
            this.room = null;
            this.app.fire('network:disconnected', code);
        });

        // Game-specific message handlers
        this.setupGameMessageHandlers();
    }

    // Set up handlers for game-specific messages
    setupGameMessageHandlers() {
        if (!this.room) return;

        // Player actions
        this.room.onMessage("actionResult", (message: any) => {
            this.log("Action result:", message);
            this.app.fire('game:actionResult', message);
        });

        // Game phase changes
        this.room.onMessage("phaseChange", (message: any) => {
            this.log(`Phase changed to ${message.phase} (Duration: ${message.duration}s)`);
            this.app.fire('game:phaseChanged', message);
        });

        // Enemy spawns
        this.room.onMessage("enemySpawned", (message: any) => {
            this.log("Enemy spawned:", message);
            this.app.fire('game:enemySpawned', message);
        });

        // Resource updates
        this.room.onMessage("resourceUpdate", (message: any) => {
            this.log("Resources updated:", message);
            this.app.fire('game:resourceUpdate', message);
        });
    }

    // Helper method to send messages to the server
    sendMessage(type: string, data: any = {}) {
        if (!this.room) {
            console.warn("Cannot send message - not connected to room:", type, data);
            return;
        }

        try {
            this.room.send(type, data);
            if (this.debug) {
                this.log(`Sent message: ${type}`, data);
            }
        } catch (error) {
            console.error(`Failed to send message ${type}:`, error);
        }
    }

    // Convenience methods for common game actions
    movePlayer(position: { x: number, y: number, z: number }) {
        this.sendMessage("move", position);
    }

    buildTroop(type: string, position: { x: number, y: number, z: number }) {
        this.sendMessage("buildTroop", { type, position });
    }

    upgradeCommandPost(postId: string) {
        this.sendMessage("upgradePost", { postId });
    }

    // Helper method for conditional logging
    private log(...args: any[]) {
        if (this.debug) {
            console.log("[NetworkManager]", ...args);
        }
    }

    // Clean up when script is destroyed
    destroy() {
        if (this.room) {
            this.room.leave();
            this.room = null;
        }
        if (this.client) {
            this.client.close();
            this.client = null;
        }
    }
}

// Register the script with PlayCanvas
pc.registerScript(NetworkManager, 'networkManager');
