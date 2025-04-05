/**
 * PlayerMovement.js - Handles player movement based on input, with network synchronization
 */
var PlayerMovement = pc.createScript('playerMovement');

// Define script attributes
PlayerMovement.attributes.add('speed', { type: 'number', default: 5, title: 'Movement Speed' });
PlayerMovement.attributes.add('rotationSpeed', { type: 'number', default: 10, title: 'Rotation Speed' });
PlayerMovement.attributes.add('inputSendRate', { type: 'number', default: 0.1, title: 'Input Send Rate (s)' });
PlayerMovement.attributes.add('gamepadDeadzone', { type: 'number', default: 0.2, title: 'Gamepad Deadzone' });
PlayerMovement.attributes.add('debug', { type: 'boolean', default: true, title: 'Debug Mode' });
PlayerMovement.attributes.add('shouldRotate', { type: 'boolean', default: true, title: 'Should Rotate' });

// initialize code called once per entity
PlayerMovement.prototype.initialize = function() {
    console.log('[PlayerMovement] Script initializing...');
    
    // Private fields
    this.networkManager = null;
    this.inputAccumulator = 0;
    this.lastSentState = null;
    
    // Log attributes loaded
    console.log(`[PlayerMovement] Attributes loaded - speed: ${this.speed}, rotationSpeed: ${this.rotationSpeed}`);

    // --- Dump scene hierarchy for debugging ---
    if (this.debug) {
        console.log('[PlayerMovement] Listing all entities in scene with scripts:');
        this._dumpSceneHierarchy(this.app.root);
    }

    // --- More Robust Network Manager Finding ---
    console.log('[PlayerMovement] Searching for NetworkManager...');
    
    // 1. First check common entity names
    const commonNames = ['NetworkManager', 'NetworkManagerEntity', 'Network'];
    for (const name of commonNames) {
        console.log(`[PlayerMovement] Checking for entity named: ${name}`);
        const entity = this.app.root.findByName(name);
        if (entity) {
            console.log(`[PlayerMovement] Found entity named ${name}, checking for script...`);
            if (entity.script && entity.script.networkManager) {
                this.networkManager = entity.script.networkManager;
                console.log(`[PlayerMovement] Found NetworkManager on entity named: ${name}`);
                break;
            } else {
                console.log(`[PlayerMovement] Entity ${name} exists but has no networkManager script`);
            }
        }
    }
    
    // 2. If not found by name, look for any entity with networkManager script
    if (!this.networkManager) {
        console.log('[PlayerMovement] Searching all script components for networkManager...');
        const entities = this.app.root.findComponents('script');
        console.log(`[PlayerMovement] Found ${entities.length} script components`);
        
        for (let i = 0; i < entities.length; i++) {
            console.log(`[PlayerMovement] Checking script component #${i}:`, entities[i]);
            if (entities[i].networkManager) {
                this.networkManager = entities[i].networkManager;
                console.log('[PlayerMovement] Found NetworkManager by script component search');
                break;
            }
        }
    }
    
    // 3. If still not found, try root entity (common in simple scenes)
    if (!this.networkManager && this.app.root.script) {
        console.log('[PlayerMovement] Checking root entity for networkManager script');
        if (this.app.root.script.networkManager) {
            this.networkManager = this.app.root.script.networkManager;
            console.log('[PlayerMovement] Found NetworkManager on root entity');
        }
    }
    
    // Log if still not found
    if (!this.networkManager) {
        console.warn('[PlayerMovement] NetworkManager script not found! Movement will not be synchronized.');
    } else {
        console.log('[PlayerMovement] NetworkManager found successfully!', this.networkManager);
    }

    // --- Initialize lastSentState AFTER potential entity setup ---
    // Ensure entity's rotation is valid before cloning
    const initialRotation = this.entity.getRotation()?.clone();
    if (initialRotation && !isNaN(initialRotation.x)) {
         this.lastSentState = {
            moving: false,
            rotation: initialRotation
        };
    } else {
        // Fallback if initial rotation is somehow invalid
        console.error("[PlayerMovement] Initial entity rotation is invalid!", this.entity.getRotation());
        this.lastSentState = { moving: false, rotation: new pc.Quat() };
    }

    if (this.debug) {
        console.log('===== PLAYER MOVEMENT INITIALIZED =====');
        const initialPos = this.entity.getPosition();
        console.log(`Initial position: x=${initialPos.x?.toFixed(2)}, y=${initialPos.y?.toFixed(2)}, z=${initialPos.z?.toFixed(2)}`);
        if(isNaN(initialPos.x)) { console.error("!!! POSITION IS NaN AT END OF INITIALIZE"); }
    }
};

// Helper function to dump scene hierarchy for debugging
PlayerMovement.prototype._dumpSceneHierarchy = function(entity, depth) {
    depth = depth || 0;
    if (!entity) return;
    
    const indent = '  '.repeat(depth);
    let info = `${indent}Entity: ${entity.name}`;
    
    // Check if it has scripts
    if (entity.script) {
        const scriptNames = Object.keys(entity.script);
        info += ` (Scripts: ${scriptNames.join(', ')})`;
    }
    
    console.log(info);
    
    // Process children
    const children = entity.children;
    for (let i = 0; i < children.length; i++) {
        this._dumpSceneHierarchy(children[i], depth + 1);
    }
};

// update code called every frame
PlayerMovement.prototype.update = function(dt) {
    if (isNaN(dt) || dt <= 0) {
         if(this.debug) console.warn("Invalid deltaTime:", dt);
         return; // Avoid calculations with invalid dt
    }

    // --- Log Position at Start of Update ---
    if (this.debug) {
        const pos = this.entity.getPosition();
         if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
            console.error(`!!! NaN POSITION DETECTED AT START OF UPDATE! Pos: x=${pos.x}, y=${pos.y}, z=${pos.z}`);
            // Possibly stop further processing this frame if position is NaN
            // return;
        } else {
             // console.log(`Position at start of update: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`);
        }
    }

    // Read input
    const direction = this.getInputDirection();
    if (this.debug && (isNaN(direction[0]) || isNaN(direction[1]))) { console.error("!!! NaN DETECTED IN RAW INPUT DIRECTION:", direction); return; }
    const isMoving = direction[0] !== 0 || direction[1] !== 0;

    // --- Client-Side Prediction ---
    if (isMoving) {
        // Normalize direction vector
        const length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
        if (this.debug && isNaN(length)) { console.error("!!! NaN DETECTED IN LENGTH CALCULATION:", direction); return; }

        if (length > 1e-6) { // Avoid division by zero
            direction[0] /= length;
            direction[1] /= length;
            if (this.debug && (isNaN(direction[0]) || isNaN(direction[1]))) { console.error("!!! NaN DETECTED AFTER NORMALIZATION:", direction, length); return; }
        } else {
             direction[0] = 0; direction[1] = 0; // Safety check
        }

        // --- CORRECTED MOVEMENT: Use world space translation ---
        const distance = this.speed * dt;
        if (this.debug && isNaN(distance)) { console.error("!!! NaN DETECTED IN DISTANCE CALCULATION:", this.speed, dt); return; }

        // Log before moving
         if (this.debug) {
             const currentPos = this.entity.getPosition();
             console.log(`[DEBUG] Before Move: dt=${dt.toFixed(4)}, speed=${this.speed}, direction=[${direction[0].toFixed(4)}, ${direction[1].toFixed(4)}], distance=${distance.toFixed(4)}, currentPos=(${currentPos.x.toFixed(4)}, ${currentPos.y.toFixed(4)}, ${currentPos.z.toFixed(4)})`);
         }

        // Apply movement - direction[0] is X (left/right), direction[1] is Z (forward/backward)
        const worldDir = new pc.Vec3(direction[0] * distance, 0, direction[1] * distance);
        this.entity.translate(worldDir);

        // Log after moving
         if (this.debug) {
             const newPos = this.entity.getPosition();
             console.log(`[DEBUG] After Move: newPos=(${newPos.x.toFixed(4)}, ${newPos.y.toFixed(4)}, ${newPos.z.toFixed(4)})`);
             if (isNaN(newPos.x)) { console.error("!!! NaN DETECTED IN POSITION AFTER translateLocal"); }
         }

        // Apply local rotation (optional - only if you want character to face movement direction)
        if (this.shouldRotate) {
            this.rotateToFaceDirection(direction, dt);
        }
    }
    // --- End Client-Side Prediction ---

    // --- Send Input State Periodically (if changed significantly) ---
    this.inputAccumulator += dt;
    if (this.inputAccumulator >= this.inputSendRate) {
        this.inputAccumulator = 0; // Reset timer

        const currentRotation = this.entity.getRotation();
        if (isNaN(currentRotation.x)) {
             if(this.debug) console.error("!!! Skipping network send because currentRotation is NaN");
             return; // Don't proceed if rotation is already NaN
        }
        const rotationData = {
            x: currentRotation.x,
            y: currentRotation.y,
            z: currentRotation.z,
            w: currentRotation.w
        };

        // Check if moving status changed OR rotation changed significantly
        let rotationChangedSignificantly = false;
        if (this.lastSentState?.rotation) { // Check if lastSentState and its rotation exist
             rotationChangedSignificantly =
                Math.abs(this.lastSentState.rotation.x - rotationData.x) > 0.01 ||
                Math.abs(this.lastSentState.rotation.y - rotationData.y) > 0.01 ||
                Math.abs(this.lastSentState.rotation.z - rotationData.z) > 0.01 ||
                Math.abs(this.lastSentState.rotation.w - rotationData.w) > 0.01;
        } else {
            // If no previous state, consider it changed if moving or rotation is not identity
            rotationChangedSignificantly = isMoving || rotationData.y !== 0 || rotationData.w !== 1;
        }

        // Send only if moving status changed OR rotation changed significantly
        if (!this.lastSentState || this.lastSentState.moving !== isMoving || rotationChangedSignificantly) {
             const moveData = {
                moving: isMoving,
                direction: direction, // Send current calculated direction
                rotation: rotationData // Send current calculated rotation
            };
            this.sendMovementToServer(moveData);
            // Update last *sent* state only when a message is sent
            this.lastSentState = { moving: isMoving, rotation: currentRotation.clone() }; // Clone rotation
        }
    }
};

// Read input from keyboard or gamepad and return direction vector [dx, dz]
PlayerMovement.prototype.getInputDirection = function() {
    const keyboard = this.app.keyboard;
    let x = 0;
    let z = 0; // Use Z for forward/backward to match translateLocal

    // Keyboard (WASD + Arrows)
    // In PlayCanvas: -Z is forward (towards screen), +Z is backward (away from screen)
    // +X is right, -X is left
    if (keyboard.isPressed(pc.KEY_W) || keyboard.isPressed(pc.KEY_UP)) z -= 1; // Forward (into screen)
    if (keyboard.isPressed(pc.KEY_S) || keyboard.isPressed(pc.KEY_DOWN)) z += 1; // Backward (away from screen)
    if (keyboard.isPressed(pc.KEY_A) || keyboard.isPressed(pc.KEY_LEFT)) x -= 1; // Left
    if (keyboard.isPressed(pc.KEY_D) || keyboard.isPressed(pc.KEY_RIGHT)) x += 1; // Right

    // Gamepad (Left Stick) - Using PlayCanvas API
    try {
        // More robust check for gamepads
        if (pc.platform.gamepads && pc.platform.gamepads.poll && pc.platform.gamepads.current) {
            const gamepad = pc.platform.gamepads.current;
            // Only access properties if gamepad exists and has axes
            if (gamepad && gamepad.axes && gamepad.axes.length >= 2) {
                const leftX = gamepad.axes[0] ?? 0;
                // Invert Y-axis for gamepad to match keyboard controls
                // Typically gamepad Y+ is down, but we want forward (like W key)
                const leftY = -(gamepad.axes[1] ?? 0); 
                if (Math.abs(leftX) > this.gamepadDeadzone) x += leftX;
                if (Math.abs(leftY) > this.gamepadDeadzone) z += leftY;
            }
        }
    } catch (e) {
        if (this.debug) console.warn("Gamepad input error:", e);
    }

    // Debug movement direction
    if (this.debug && (x !== 0 || z !== 0)) {
        console.log(`Movement direction: x=${x.toFixed(2)}, z=${z.toFixed(2)}`);
    }

    // Clamp magnitude
    const lengthSq = x * x + z * z;
    if (lengthSq > 1) {
        const length = Math.sqrt(lengthSq);
        if (length > 1e-6) { // Avoid division by zero
             x /= length;
             z /= length;
        } else {
            x = 0;
            z = 0; // Extra safety
        }
    }

    return [x, z];
};

// Rotation with direction vector & deltaTime
PlayerMovement.prototype.rotateToFaceDirection = function(direction, dt) {
    if (direction[0] === 0 && direction[1] === 0) return;

    try {
        // Set up meaningful names for clarity
        const dirX = direction[0];
        const dirZ = direction[1];
        
        // Calculate angle using atan2 - this gives us the angle in radians counter-clockwise from positive X axis
        const targetAngleRad = Math.atan2(dirX, -dirZ);
        
        if (isNaN(targetAngleRad)) {
            if (this.debug) console.error("NaN in target angle calculation:", dirX, dirZ);
            return;
        }
        
        // Convert to degrees for PlayCanvas Euler angles
        const targetAngleDeg = targetAngleRad * 180 / Math.PI;
        
        // Get current rotation as Euler angles
        const currentEuler = this.entity.getEulerAngles();
        const currentYaw = currentEuler.y;
        
        // Calculate shortest rotation distance
        let angleDiff = targetAngleDeg - currentYaw;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;
        
        // Apply smooth rotation (interpolate directly with Euler angles)
        const rotationAmount = Math.min(Math.abs(angleDiff), this.rotationSpeed * dt * 100);
        const newYaw = currentYaw + (angleDiff > 0 ? rotationAmount : -rotationAmount);
        
        // Apply rotation to entity
        this.entity.setEulerAngles(0, newYaw, 0);
        
        if (this.debug) {
            // Log rotation details for debugging
            console.log(`Rotation: target=${targetAngleDeg.toFixed(2)}°, current=${currentYaw.toFixed(2)}°, diff=${angleDiff.toFixed(2)}°, new=${newYaw.toFixed(2)}°`);
        }
    } catch (e) {
        if (this.debug) console.error("Error in rotation:", e);
    }
};

// Send movement data to server if NetworkManager is available
PlayerMovement.prototype.sendMovementToServer = function(moveData) {
    if (!this.networkManager || !this.networkManager.room) return;
    
    try {
        this.networkManager.sendMessage("moveInput", moveData);
        
        if (this.debug) {
            // console.log("Sent movement to server:", moveData);
        }
    } catch (e) {
        console.error("Error sending movement to server:", e);
    }
};