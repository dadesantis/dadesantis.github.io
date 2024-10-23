import { PHYSICS_CONSTANTS } from '../constants/physicsConstants.js';

export class PhysicsDebugger {
    constructor(p5Instance) {
        this.p5 = p5Instance;
    }

    drawForceVectors(body, forces) {
        if (!body || !forces) return;
        
        this.p5.push();
        
        // Draw velocity vector if it exists
        if (body.velocity) {
            this.p5.stroke(PHYSICS_CONSTANTS.DEBUG_VELOCITY_COLOR);
            this.p5.strokeWeight(2);
            this.drawVector(
                body.position,
                body.velocity,
                PHYSICS_CONSTANTS.DEBUG_FORCE_SCALE
            );
        }

        // Draw gravitational force
        if (forces.gravity) {
            this.p5.stroke(PHYSICS_CONSTANTS.DEBUG_GRAVITY_COLOR);
            this.drawVector(
                body.position,
                forces.gravity,
                PHYSICS_CONSTANTS.DEBUG_FORCE_SCALE
            );
        }

        // Draw repulsion force
        if (forces.repulsion) {
            this.p5.stroke(PHYSICS_CONSTANTS.DEBUG_REPULSION_COLOR);
            this.drawVector(
                body.position,
                forces.repulsion,
                PHYSICS_CONSTANTS.DEBUG_FORCE_SCALE
            );
        }

        this.p5.pop();
    }

    drawVector(start, vector, scale) {
        if (!start || !vector || !scale) return;

        // Calculate end point
        const end = this.p5.createVector(
            start.x + vector.x * scale,
            start.y + vector.y * scale
        );

        // Draw line
        this.p5.line(start.x, start.y, end.x, end.y);
        
        // Draw arrowhead
        const arrowSize = 7;
        const angle = vector.heading();
        
        this.p5.push();
        this.p5.translate(end.x, end.y);
        this.p5.rotate(angle);
        this.p5.line(0, 0, -arrowSize, -arrowSize/2);
        this.p5.line(0, 0, -arrowSize, arrowSize/2);
        this.p5.pop();
    }

    drawInteractionRadius(body) {
        if (!body || !body.position) return;

        this.p5.push();
        this.p5.noFill();
        this.p5.stroke(255, 100);
        this.p5.strokeWeight(1);
        
        // Draw influence radius
        const influenceRadius = body.diameter * 2;
        this.p5.circle(body.position.x, body.position.y, influenceRadius);
        
        // Draw collision radius
        this.p5.stroke(255, 0, 0, 100);
        this.p5.circle(body.position.x, body.position.y, body.diameter);
        
        this.p5.pop();
    }

    drawQuadTreeDebug(quadTree) {
        if (!quadTree || !quadTree.boundary) return;

        this.p5.push();
        this.p5.noFill();
        this.p5.stroke(255, 50);
        this.p5.rect(
            quadTree.boundary.x,
            quadTree.boundary.y,
            quadTree.boundary.w,
            quadTree.boundary.h
        );

        if (quadTree.divided) {
            if (quadTree.northwest) this.drawQuadTreeDebug(quadTree.northwest);
            if (quadTree.northeast) this.drawQuadTreeDebug(quadTree.northeast);
            if (quadTree.southwest) this.drawQuadTreeDebug(quadTree.southwest);
            if (quadTree.southeast) this.drawQuadTreeDebug(quadTree.southeast);
        }

        // Draw center of mass
        if (quadTree.totalMass > 0 && quadTree.centerOfMass) {
            this.p5.fill(255, 0, 0);
            this.p5.noStroke();
            this.p5.circle(quadTree.centerOfMass.x, quadTree.centerOfMass.y, 4);
        }
        
        this.p5.pop();
    }
}
