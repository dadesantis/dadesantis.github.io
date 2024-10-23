import { PhysicsController } from "./PhysicsController.js";

export class CollisionSystem {
    constructor(p5Instance) {
        this.p5 = p5Instance;
        this.physics = new PhysicsController(this.p5);
    }

    handleCollision(bodyA, bodyB) {
        if (!bodyA || !bodyB || !bodyA.position || !bodyB.position) return;

        // Check if collisions are enabled
        if (!this.physics.isEnabled('ALLOW_COLLISIONS')) return;

        const relativeVelocity = bodyA.velocity.copy().sub(bodyB.velocity);
        const collisionNormal = bodyA.position.copy().sub(bodyB.position).normalize();
        const normalVelocity = relativeVelocity.dot(collisionNormal);
        
        if (normalVelocity > 0) return;

        // Check for merger
        const distance = bodyA.position.copy().sub(bodyB.position).mag();
        const mergeThreshold = (bodyA.diameter + bodyB.diameter) * 
                             this.physics.getParameter('MERGER_THRESHOLD');

        if (this.physics.isEnabled('ALLOW_MERGING') && distance < mergeThreshold) {
            this.mergeBodies(bodyA, bodyB);
            return;
        }

        // Handle elastic collision
        if (this.physics.isEnabled('CONSERVE_MOMENTUM')) {
            const restitution = this.physics.getParameter('ELASTIC_COLLISION');
            const totalMass = bodyA.mass + bodyB.mass;
            const impulse = -(1 + restitution) * normalVelocity;
            const impulseScalar = impulse / totalMass;

            const impulseVectorA = collisionNormal.copy().mult(impulseScalar * bodyB.mass);
            const impulseVectorB = collisionNormal.copy().mult(-impulseScalar * bodyA.mass);

            bodyA.velocity.add(impulseVectorA);
            bodyB.velocity.add(impulseVectorB);
        }

        // Apply repulsion if enabled
        if (this.physics.isEnabled('USE_REPULSION')) {
            const repulsionStrength = this.physics.getParameter('REPULSION_FACTOR');
            const repulsion = collisionNormal.copy().mult(repulsionStrength);
            bodyA.applyForce(repulsion);
            bodyB.applyForce(repulsion.mult(-1));
        }
    }

    mergeBodies(bodyA, bodyB) {
        // Calculate new properties for merged body
        const totalMass = bodyA.mass + bodyB.mass;
        const newPosition = this.p5.createVector(
            (bodyA.position.x * bodyA.mass + bodyB.position.x * bodyB.mass) / totalMass,
            (bodyA.position.y * bodyA.mass + bodyB.position.y * bodyB.mass) / totalMass
        );
        
        // Conserve momentum
        const newVelocity = this.p5.createVector(
            (bodyA.velocity.x * bodyA.mass + bodyB.velocity.x * bodyB.mass) / totalMass,
            (bodyA.velocity.y * bodyA.mass + bodyB.velocity.y * bodyB.mass) / totalMass
        );

        // Calculate new diameter based on conservation of volume
        const newDiameter = Math.pow(
            Math.pow(bodyA.diameter, 3) + Math.pow(bodyB.diameter, 3),
            1/3
        );

        // Update the larger body with new properties
        if (bodyA.mass > bodyB.mass) {
            bodyA.mass = totalMass;
            bodyA.diameter = newDiameter;
            bodyA.position = newPosition;
            bodyA.velocity = newVelocity;
            bodyB.markForRemoval = true;
        } else {
            bodyB.mass = totalMass;
            bodyB.diameter = newDiameter;
            bodyB.position = newPosition;
            bodyB.velocity = newVelocity;
            bodyA.markForRemoval = true;
        }
    }

    createMergerEffect(position, diameter) {
        // Create particle effect for merger
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * this.p5.TWO_PI;
            particles.push({
                position: position.copy(),
                velocity: this.p5.Vector.fromAngle(angle).mult(2),
                life: 255
            });
        }
        
        return particles;
    }
}
