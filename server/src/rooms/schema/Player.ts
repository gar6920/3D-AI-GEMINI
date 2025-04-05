import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type("string")
    sessionId: string = "";

    @type("number")
    x: number = 0;

    @type("number")
    y: number = 0;
    
    @type("number")
    z: number = 0;

    @type("number")
    health: number = 100;
    
    // Movement state properties
    @type("boolean")
    isMoving: boolean = false;
    
    @type("number")
    inputDirectionX: number = 0;
    
    @type("number")
    inputDirectionZ: number = 0;
    
    // Rotation quaternion components
    @type("number")
    rotationX: number = 0;
    
    @type("number")
    rotationY: number = 0;
    
    @type("number")
    rotationZ: number = 0;
    
    @type("number")
    rotationW: number = 1; // Default to identity quaternion
}
