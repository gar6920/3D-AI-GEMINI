/**
 * PlayerMovement.ts - Handles player movement based on input, with network synchronization
 */

declare var pc: any;

class PlayerMovement extends pc.ScriptType {
    // Script attributes that can be modified in PlayCanvas editor
    static attributes = {
        speed: {
            type: 'number',
            default: 5,
            title: 'Movement Speed',
            description: 'Units per second the player moves'
        },
        rotationSpeed: {
            type: 'number',
            default: 10,
            title: 'Rotation Speed',
            description: 'How quickly the player rotates to face movement direction'
        },
        inputSendRate: {
            type: 'number',
            default: 0.1,
            title: 'Input Send Rate',
            description: 'How often to send movement updates to server (in seconds)'
        }
    };

    // Properties
    speed: number = 5;
    rotationSpeed: number = 10;
    inputSendRate: number = 0.1;
    
    // Private fields
    private networkManager: any = null;
    private inputAccumulator: number = 0;
    private lastSentInput: {
        moving: boolean,
        direction: [number, number],
        rotation: { x: number, y: number, z: number, w: number }
    } | null = null;
    
    // Initialize runs when the script instance is loaded
    initialize() {
        // Find network manager in the scene
        this.networkManager = this.app.root.findByName('NetworkManager')?.script?.networkManager;
        
        if (!this.networkManager) {
            console.warn('NetworkManager not found! Movement will not be synchronized.');
        }
    }

    // Update runs every frame
    update(dt: number) {
        // Read input and apply local movement
        const direction = this.getInputDirection();
        
        // Check if we're moving (direction has magnitude)
        const isMoving = direction[0] !== 0 || direction[1] !== 0;
        
        if (isMoving) {
            // Normalize direction vector if moving
            const length = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1]);
            direction[0] /= length;
            direction[1] /= length;
            
            // Apply movement to entity
            const distance = this.speed * dt;
            this.entity.translateLocal(direction[0] * distance, 0, direction[1] * distance);
            
            // Rotate entity to face movement direction
            this.rotateToFaceDirection(direction, dt);
        }
        
        // Send movement updates to server periodically
        this.inputAccumulator += dt;
        if (this.inputAccumulator >= this.inputSendRate) {
            this.inputAccumulator = 0;
            this.sendMovementToServer(isMoving, direction);
        }
    }
    
    // Read input from keyboard or gamepad and return direction vector [dx, dz]
    private getInputDirection(): [number, number] {
        const keyboard = this.app.keyboard;
        let x = 0;
        let z = 0;
        
        // WASD keyboard input
        if (keyboard.isPressed(pc.KEY_W) || keyboard.isPressed(pc.KEY_UP)) {
            z -= 1;
        }
        if (keyboard.isPressed(pc.KEY_S) || keyboard.isPressed(pc.KEY_DOWN)) {
            z += 1;
        }
        if (keyboard.isPressed(pc.KEY_A) || keyboard.isPressed(pc.KEY_LEFT)) {
            x -= 1;
        }
        if (keyboard.isPressed(pc.KEY_D) || keyboard.isPressed(pc.KEY_RIGHT)) {
            x += 1;
        }
        
        // TODO: Add gamepad support if needed
        // const gamepads = navigator.getGamepads?.() || [];
        // if (gamepads[0]) {
        //     const gamepad = gamepads[0];
        //     // Read left stick
        //     if (Math.abs(gamepad.axes[0]) > 0.1) x += gamepad.axes[0];
        //     if (Math.abs(gamepad.axes[1]) > 0.1) z += gamepad.axes[1];
        // }
        
        return [x, z];
    }
    
    // Rotate entity to face the direction of movement
    private rotateToFaceDirection(direction: [number, number], dt: number) {
        if (direction[0] === 0 && direction[1] === 0) return;
        
        // Calculate target rotation
        const targetRotation = new pc.Quat();
        
        // Create a point in front of the entity based on direction
        const lookAtPoint = new pc.Vec3(
            this.entity.getPosition().x + direction[0],
            this.entity.getPosition().y,
            this.entity.getPosition().z + direction[1]
        );
        
        // Get the rotation that would make the entity face that point
        const lookAt = new pc.Vec3().sub2(lookAtPoint, this.entity.getPosition()).normalize();
        targetRotation.lookAt(lookAt, pc.Vec3.UP);
        
        // Smoothly interpolate current rotation to target rotation
        const currentRotation = this.entity.getRotation().clone();
        currentRotation.slerp(currentRotation, targetRotation, this.rotationSpeed * dt);
        this.entity.setRotation(currentRotation);
    }
    
    // Send movement data to server
    private sendMovementToServer(moving: boolean, direction: [number, number]) {
        if (!this.networkManager) return;
        
        const currentRotation = this.entity.getRotation();
        const rotationData = {
            x: currentRotation.x,
            y: currentRotation.y,
            z: currentRotation.z,
            w: currentRotation.w
        };
        
        // Check if input has changed enough to warrant sending
        const inputChanged = !this.lastSentInput || 
            this.lastSentInput.moving !== moving ||
            Math.abs(this.lastSentInput.direction[0] - direction[0]) > 0.1 ||
            Math.abs(this.lastSentInput.direction[1] - direction[1]) > 0.1 ||
            Math.abs(this.lastSentInput.rotation.x - rotationData.x) > 0.1 ||
            Math.abs(this.lastSentInput.rotation.y - rotationData.y) > 0.1 ||
            Math.abs(this.lastSentInput.rotation.z - rotationData.z) > 0.1 ||
            Math.abs(this.lastSentInput.rotation.w - rotationData.w) > 0.1;
        
        if (inputChanged) {
            const moveData = {
                moving: moving,
                direction: direction,
                rotation: rotationData
            };
            
            this.networkManager.sendMessage("moveInput", moveData);
            this.lastSentInput = moveData;
        }
    }
}

// Register the script with PlayCanvas
pc.registerScript(PlayerMovement, 'playerMovement');
