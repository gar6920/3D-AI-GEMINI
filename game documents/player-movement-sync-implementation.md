# Player Movement Synchronization Implementation

## Overview
This document outlines the implementation plan for synchronizing player movement between clients and the server in our multiplayer game using Colyseus.

## Architecture
We'll use client-side prediction with server reconciliation:
1. Client predicts movement locally for responsive gameplay
2. Client sends inputs to server
3. Server validates and updates authoritative state
4. Clients receive updates and reconcile differences

## Client Implementation (PlayerMovement.ts)

### Input Handling
```typescript
// In update() method
update(dt) {
    // Get input from keyboard/gamepad
    const inputDirection = this.getInputDirection();
    
    // Only process if we have input
    if (inputDirection.lengthSq() > 0) {
        // Normalize the direction vector
        inputDirection.normalize();
        
        // Apply local movement (client prediction)
        this.movePlayer(inputDirection, dt);
        
        // Apply rotation to face movement direction
        this.rotatePlayer(inputDirection);
        
        // Send input to server
        this.network.sendMessage('moveInput', {
            isMoving: true,
            directionX: inputDirection.x,
            directionZ: inputDirection.z,
            rotation: this.entity.getRotation().toJSON()
        });
    } else if (this.wasMoving) {
        // Player stopped moving
        this.network.sendMessage('moveInput', {
            isMoving: false,
            directionX: 0,
            directionZ: 0,
            rotation: this.entity.getRotation().toJSON()
        });
        this.wasMoving = false;
    }
}

// Apply movement locally
movePlayer(direction, dt) {
    const speed = this.moveSpeed;
    const distance = speed * dt;
    
    // Calculate new position
    const newPos = this.entity.getPosition().clone();
    newPos.x += direction.x * distance;
    newPos.z += direction.z * distance;
    
    // Update player position
    this.entity.setPosition(newPos);
    this.wasMoving = true;
}

// Rotate player to face direction
rotatePlayer(direction) {
    if (direction.lengthSq() > 0) {
        // Calculate target rotation
        const targetRotation = Math.atan2(direction.x, direction.z);
        
        // Apply rotation to player model
        const quaternion = new pc.Quat();
        quaternion.setFromEulerAngles(0, targetRotation * pc.math.RAD_TO_DEG, 0);
        this.entity.setRotation(quaternion);
    }
}
```

## Server Implementation (GameRoom.ts)

### Schema Definition
```typescript
// PlayerHeroState.ts
import { Schema, type } from "@colyseus/schema";

export class PlayerHeroState extends Schema {
    @type("boolean") isMoving: boolean = false;
    @type("number") inputDirectionX: number = 0;
    @type("number") inputDirectionZ: number = 0;
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
    @type("number") rotationY: number = 0;
    // Other player properties...
}
```

### Message Handling
```typescript
// In GameRoom.ts onCreate method
onCreate() {
    // Set up message handler for player movement
    this.onMessage("moveInput", (client, message) => {
        const player = this.state.players.get(client.sessionId);
        
        if (player) {
            // Update player movement state
            player.isMoving = message.isMoving;
            player.inputDirectionX = message.directionX;
            player.inputDirectionZ = message.directionZ;
            
            // Update rotation
            if (message.rotation) {
                player.rotationY = message.rotation.y;
            }
        }
    });
    
    // Set up simulation interval for server-side movement
    this.setSimulationInterval((deltaTime) => {
        this.state.players.forEach((player) => {
            if (player.isMoving) {
                // Calculate new position based on input and delta time
                const speed = 5; // Units per second
                const distance = speed * (deltaTime / 1000); // Convert to seconds
                
                player.x += player.inputDirectionX * distance;
                player.z += player.inputDirectionZ * distance;
            }
        });
    });
}
```

## Client-Side State Handling
```typescript
// In NetworkManager or PlayerController
onStateChange(state) {
    // Update all players based on server state
    state.players.forEach((playerState, sessionId) => {
        // Get player entity
        const playerEntity = this.players.get(sessionId);
        
        if (playerEntity) {
            // If this is not the local player or server correction is enabled
            if (sessionId !== this.mySessionId || this.applyServerCorrection) {
                // Apply server position
                playerEntity.setPosition(
                    new pc.Vec3(playerState.x, playerState.y, playerState.z)
                );
                
                // Apply server rotation
                const rotation = new pc.Quat();
                rotation.setFromEulerAngles(0, playerState.rotationY, 0);
                playerEntity.setRotation(rotation);
            }
        }
    });
}
```

## Performance Considerations
1. Only send movement updates when input changes (started/stopped moving or direction changed)
2. Consider interpolation between received server positions for smoother corrections
3. Implement a delta compression mechanism for frequent updates
4. Adjust update rate based on game needs (typically 10-20 updates per second)

## Testing
1. Test with artificial network latency (using browser dev tools)
2. Test with multiple clients moving simultaneously
3. Verify server authority works correctly (clients can't cheat)
4. Ensure smooth movement even with intermittent packet loss

## Future Improvements
1. Implement client-side reconciliation to handle server corrections
2. Add position interpolation for other players
3. Add network jitter buffer for smoother playback
4. Implement server-side collision detection/resolution
