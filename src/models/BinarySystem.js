import { Body } from './Body.js';
import { CELESTIAL_TYPES } from '../constants/celestialTypes.js';

export class BinarySystem {
    constructor(centerPosition, type = CELESTIAL_TYPES.STAR) {
        this.centerPosition = centerPosition;
        this.type = type;
        this.orbitRadius = 100;
        this.orbitSpeed = 0.02;
        this.angle = 0;
        
        this.initializeBodies();
    }

    initializeBodies() {
        // Create two stars of similar mass
        const baseMass = random(type.massRange.min, type.massRange.max);
        const massVariation = random(0.8, 1.2);

        this.primary = new Body({
            position: createVector(0, 0),  // Will be updated in update()
            type: this.type,
            mass: baseMass,
            color: this.type.colors[0]
        });

        this.secondary = new Body({
            position: createVector(0, 0),  // Will be updated in update()
            type: this.type,
            mass: baseMass * massVariation,
            color: this.type.colors[1] || this.type.colors[0]
        });

        this.bodies = [this.primary, this.secondary];
    }

    update() {
        // Update positions based on orbital motion
        this.angle += this.orbitSpeed;
        
        const primaryX = this.centerPosition.x + cos(this.angle) * this.orbitRadius;
        const primaryY = this.centerPosition.y + sin(this.angle) * this.orbitRadius;
        this.primary.position.set(primaryX, primaryY);

        const secondaryX = this.centerPosition.x + cos(this.angle + PI) * this.orbitRadius;
        const secondaryY = this.centerPosition.y + sin(this.angle + PI) * this.orbitRadius;
        this.secondary.position.set(secondaryX, secondaryY);

        // Update individual bodies
        this.primary.update();
        this.secondary.update();

        // Draw connection line
        stroke(255, 50);
        strokeWeight(1);
        line(this.primary.position.x, this.primary.position.y,
             this.secondary.position.x, this.secondary.position.y);
    }

    draw(viewScale) {
        // Draw orbit paths
        noFill();
        stroke(255, 30);
        strokeWeight(1);
        ellipse(this.centerPosition.x, this.centerPosition.y, 
                this.orbitRadius * 2 * viewScale);

        // Draw bodies
        this.primary.draw(viewScale);
        this.secondary.draw(viewScale);
    }

    applyForce(force) {
        // Distribute force between both bodies
        const halfForce = p5.Vector.div(force, 2);
        this.primary.applyForce(halfForce);
        this.secondary.applyForce(halfForce);
    }

    containsPoint(x, y) {
        return this.primary.containsPoint(x, y) || 
               this.secondary.containsPoint(x, y);
    }
}
