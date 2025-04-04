// NetworkManager.js - Handles network communication with the Colyseus game server
var NetworkManager = pc.createScript('networkManager');

// Add script attributes
NetworkManager.attributes.add('serverAddress', {
    type: 'string',
    default: 'ws://localhost:3000',
    title: 'Server Address',
    description: 'WebSocket address of the Colyseus server'
});

NetworkManager.attributes.add('roomName', {
    type: 'string',
    default: 'gameRoom',
    title: 'Room Name',
    description: 'Name of the room to join'
});

NetworkManager.attributes.add('debug', {
    type: 'boolean',
    default: true,
    title: 'Debug Mode',
    description: 'Enable detailed logging'
});

// Initialize client and room references
NetworkManager.prototype.initialize = function() {
    this.client = null;
    this.room = null;
    this.isConnected = false;
    
    // Initialize Colyseus client when script loads
    this.initializeClient();
};

NetworkManager.prototype.initializeClient = function() {
    try {
        // Check different possible global names for Colyseus
        var colyseusLib = null;
        
        if (typeof Colyseus !== 'undefined') {
            colyseusLib = Colyseus;
            if (this.debug) console.log("Found Colyseus global with uppercase");
        } else if (typeof colyseus !== 'undefined') {
            colyseusLib = colyseus;
            if (this.debug) console.log("Found Colyseus global with lowercase");
        } else if (typeof window.Colyseus !== 'undefined') {
            colyseusLib = window.Colyseus;
            if (this.debug) console.log("Found Colyseus on window with uppercase");
        } else if (typeof window.colyseus !== 'undefined') {
            colyseusLib = window.colyseus;
            if (this.debug) console.log("Found Colyseus on window with lowercase");
        }
        
        if (!colyseusLib) {
            console.error("Colyseus client library not found! Make sure colyseus.js is added as an external script in your PlayCanvas project.");
            console.log("Available globals:", Object.keys(window).filter(key => 
                key.toLowerCase().includes('coly') || 
                (typeof window[key] === 'object' && window[key] && typeof window[key].Client === 'function')
            ));
            return;
        }

        // Create Colyseus client
        this.client = new colyseusLib.Client(this.serverAddress);
        if (this.debug) {
            console.log("Colyseus client initialized successfully");
        }

        // Try to join room
        this.joinRoom();
    } catch (error) {
        console.error("Error initializing Colyseus client:", error);
    }
};

NetworkManager.prototype.joinRoom = function() {
    if (!this.client) {
        console.error("Client not initialized");
        return;
    }

    // Join or create room
    this.client.joinOrCreate(this.roomName).then(room => {
        this.room = room;
        this.isConnected = true;

        if (this.debug) {
            console.log("Joined room:", this.roomName);
        }

        // Set up room event handlers
        this.setupRoomHandlers();
    }).catch(error => {
        console.error("Error joining room:", error);
    });
};

NetworkManager.prototype.setupRoomHandlers = function() {
    if (!this.room) return;

    // Handle state changes
    this.room.onStateChange((state) => {
        if (this.debug) {
            console.log("Room state updated:", state);
        }
        this.fire('stateChanged', state);
    });

    // Handle room messages
    this.room.onMessage("*", (type, message) => {
        if (this.debug) {
            console.log("Received message:", type, message);
        }
        this.fire('messageReceived', {type: type, message: message});
    });

    // Handle errors
    this.room.onError((code, message) => {
        console.error("Room error:", code, message);
        this.fire('roomError', {code: code, message: message});
    });

    // Handle connection close
    this.room.onLeave((code) => {
        this.isConnected = false;
        console.log("Left room:", code);
        this.fire('roomLeft', code);
    });
};

// Send message to room
NetworkManager.prototype.sendMessage = function(type, message) {
    if (!this.room || !this.isConnected) {
        console.error("Not connected to room");
        return;
    }

    try {
        this.room.send(type, message);
        if (this.debug) {
            console.log("Sent message:", type, message);
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

// Clean up when script is removed
NetworkManager.prototype.destroy = function() {
    if (this.room) {
        this.room.leave();
    }
    if (this.client) {
        this.client.close();
    }
};
