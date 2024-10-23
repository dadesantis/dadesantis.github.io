import { QuadTree } from './QuadTree.js';
import { CollisionSystem } from './CollisionSystem.js';
import { PhysicsDebugger } from './PhysicsDebugger.js';
import { PhysicsController } from './PhysicsController.js';
import { PHYSICS_CONSTANTS } from '../constants/physicsConstants.js';

export class GravitySystem {
    constructor(p5Instance) {
        this.p5 = p5Instance;
        this.bodies = [];
        this.physicsController = new PhysicsController(p5Instance);
        this.collisionSystem = new CollisionSystem(p5Instance);
        this.debugger = new PhysicsDebugger(p5Instance);
        this.quadTree = null;
        this.debugMode = false;
        this.paused = false;
        this.gravitationalConstant = PHYSICS_CONSTANTS.MAX_GRAVITY / 2;
        this.viewScale = 1;
    }

    draw() {
        // Sort bodies by size for proper layering
        [...this.bodies]
            .sort((a, b) => b.diameter - a.diameter)
            .forEach(body => {
                // Draw the body
                body.draw(this.viewScale);
                
                // Draw debug information if enabled
                if (this.debugMode && body.debugForces) {
                    this.debugger.drawForceVectors(body, body.debugForces);
                    this.debugger.drawInteractionRadius(body);
                }
            });

        // Draw quadtree debug visualization if enabled
        if (this.debugMode && this.quadTree) {
            this.debugger.drawQuadTreeDebug(this.quadTree);
        }
    }

    update() {
        if (this.paused) return;

        try {
            // Only create quadtree if using Barnes-Hut
            if (this.bodies.length >= PHYSICS_CONSTANTS.OPTIMIZATION_THRESHOLD) {
                this.updateQuadTree();
            } else {
                this.quadTree = null;
            }

            this.updateForces();
            this.handleCollisions();
            this.updateBodies();

            // Clean up any bodies marked for removal
            this.bodies = this.bodies.filter(body => !body.markForRemoval);
        } catch (error) {
            console.error('Error in gravity system update:', error);
        }
    }

    updateQuadTree() {
        if (this.bodies.length > PHYSICS_CONSTANTS.OPTIMIZATION_THRESHOLD) {
            const boundary = {
                x: 0,
                y: 0,
                w: this.p5.width,
                h: this.p5.height
            };
            this.quadTree = new QuadTree(boundary, PHYSICS_CONSTANTS.QUADTREE_CAPACITY, this.p5);
            
            // Insert all bodies into quadtree
            for (const body of this.bodies) {
                this.quadTree.insert(body);
            }
        } else {
            this.quadTree = null;
        }
    }

    updateForces() {
        try {
            const useBarnesHut = this.bodies.length >= PHYSICS_CONSTANTS.OPTIMIZATION_THRESHOLD;
            
            for (const body of this.bodies) {
                // Reset forces
                body.acceleration.mult(0);
                body.debugForces = { 
                    gravity: this.p5.createVector(0, 0), 
                    repulsion: this.p5.createVector(0, 0) 
                };

                if (useBarnesHut) {
                    this.calculateForcesBarnesHut(body);
                } else {
                    this.calculateForcesDirect(body);
                }
            }
        } catch (error) {
            console.error('Error updating forces:', error);
        }
    }

    handleCollisions() {
        if (!this.collisionSystem) {
            console.warn('CollisionSystem not initialized');
            return;
        }

        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                if (!bodyA || !bodyB || !bodyA.position || !bodyB.position) continue;

                const distance = bodyA.position.copy().sub(bodyB.position).mag();
                const minDistance = (bodyA.diameter + bodyB.diameter) * 0.5;

                if (distance < minDistance) {
                    this.collisionSystem.handleCollision(bodyA, bodyB);
                }
            }
        }
    }

    updateBodies() {
        for (const body of this.bodies) {
            // Apply velocity limits
            body.velocity.limit(PHYSICS_CONSTANTS.MAX_SPEED);
            
            // Update position
            body.position.add(body.velocity);
            
            // Add velocity from acceleration
            body.velocity.add(body.acceleration);
            
            // Handle screen wrapping
            this.handleBoundaries(body);
            
            // Update any special effects
            if (body.type.specialBehavior) {
                body.updateSpecialEffects();
            }
        }
    }

    handleBoundaries(body) {
        if (!this.physicsController.isEnabled('ALLOW_WRAPPING')) {
            // Bounce off edges instead of wrapping
            if (body.position.x > this.p5.width || body.position.x < 0) {
                body.velocity.x *= -1;
            }
            if (body.position.y > this.p5.height || body.position.y < 0) {
                body.velocity.y *= -1;
            }
            return;
        }

        // Original wrapping behavior
        const margin = body.diameter * 0.5;
        if (body.position.x > this.p5.width + margin) {
            body.position.x = -margin;
        } else if (body.position.x < -margin) {
            body.position.x = this.p5.width + margin;
        }
        
        // Wrap around screen edges
        if (body.position.x > this.p5.width + margin) {
            body.position.x = -margin;
        } else if (body.position.x < -margin) {
            body.position.x = this.p5.width + margin;
        }
        
        if (body.position.y > this.p5.height + margin) {
            body.position.y = -margin;
        } else if (body.position.y < -margin) {
            body.position.y = this.p5.height + margin;
        }
    }

    calculateForcesDirect(body) {
        if (!body || !body.position) return;

        const forces = {
            gravity: this.p5.createVector(0, 0),
            repulsion: this.p5.createVector(0, 0)
        };

        for (const otherBody of this.bodies) {
            if (body === otherBody || !otherBody || !otherBody.position) continue;

            // Fixed method name here - changed from calculateForcesBetweenBodies to calculateForceBetweenBodies
            const bodyForces = this.calculateForceBetweenBodies(body, otherBody);
            if (bodyForces) {
                forces.gravity.add(bodyForces.gravity);
                forces.repulsion.add(bodyForces.repulsion);
            }
        }

        // Apply accumulated forces
        if (forces.gravity.magSq() > 0) {
            body.applyForce(forces.gravity);
        }
        if (forces.repulsion.magSq() > 0) {
            body.applyForce(forces.repulsion);
        }

        // Store forces for debug visualization
        if (this.debugMode) {
            body.debugForces = forces;
        }
    }

    calculateForceBetweenBodies(bodyA, bodyB) {
        if (!bodyA || !bodyB || !bodyA.position || !bodyB.position) {
            return {
                gravity: this.p5.createVector(0, 0),
                repulsion: this.p5.createVector(0, 0)
            };
        }

        const forces = {
            gravity: this.p5.createVector(0, 0),
            repulsion: this.p5.createVector(0, 0)
        };

        const direction = bodyB.position.copy().sub(bodyA.position);
        const distance = direction.mag();

        // Prevent division by zero
        if (distance < PHYSICS_CONSTANTS.GRAVITATIONAL_SOFTENING) {
            return forces;
        }

        direction.normalize();

        // Calculate gravitational force
        const gravityStrength = (this.gravitationalConstant * bodyA.mass * bodyB.mass) / 
                              (distance * distance);
        forces.gravity = direction.copy().mult(gravityStrength);

        // Calculate repulsion if bodies are too close
        const minDistance = (bodyA.diameter + bodyB.diameter) * 0.5 * PHYSICS_CONSTANTS.MIN_SEPARATION_SCALE;
        if (distance < minDistance) {
            const repulsionStrength = PHYSICS_CONSTANTS.REPULSION_FACTOR * 
                                    Math.pow(1 - distance/minDistance, PHYSICS_CONSTANTS.REPULSION_FALLOFF);
            forces.repulsion = direction.copy().mult(-repulsionStrength);
        }

        return forces;
    }

    calculateGravitationalForce(bodyA, bodyB) {
        const force = this.p5.createVector(
            bodyB.position.x - bodyA.position.x,
            bodyB.position.y - bodyA.position.y
        );
        let distance = force.mag();
        // Fix: Use p5 instance's constrain function
        distance = this.p5.constrain(
            distance,
            PHYSICS_CONSTANTS.MIN_DISTANCE,
            PHYSICS_CONSTANTS.MAX_DISTANCE
        );

        const strength = (this.gravitationalConstant * bodyA.mass * bodyB.mass) / 
                        (distance * distance);
        force.normalize().mult(strength);
        
        return force;
    }

    calculateForcesBarnesHut(body) {
        if (!body || !body.position) return;

        try {
            const forces = this.calculateForceFromNode(
                body, 
                this.quadTree, 
                PHYSICS_CONSTANTS.BARNES_HUT_THETA
            );

            if (forces) {
                if (forces.gravity && forces.gravity.magSq() > 0) {
                    body.applyForce(forces.gravity);
                }
                if (forces.repulsion && forces.repulsion.magSq() > 0) {
                    body.applyForce(forces.repulsion);
                }

                // Store forces for debug visualization
                if (this.debugMode) {
                    body.debugForces = forces;
                }
            }
        } catch (error) {
            console.error('Error in Barnes-Hut calculation:', error);
            // Fallback to direct calculation if Barnes-Hut fails
            this.calculateForcesDirect(body);
        }
    }

    calculateForceFromNode(body, node, theta, forces = null) {
        // Early return checks
        if (!node || !body || !node.totalMass || !node.centerOfMass || !body.position) {
            return forces || {
                gravity: this.p5.createVector(0, 0),
                repulsion: this.p5.createVector(0, 0)
            };
        }

        // Initialize forces if not provided
        if (!forces) {
            forces = {
                gravity: this.p5.createVector(0, 0),
                repulsion: this.p5.createVector(0, 0)
            };
        }

        // Calculate direction and distance using instance methods
        const direction = node.centerOfMass.copy().sub(body.position);
        const distance = direction.mag();

        // Prevent division by zero or very small numbers
        if (distance < PHYSICS_CONSTANTS.GRAVITATIONAL_SOFTENING) {
            return forces;
        }

        // If this is a leaf node with a single body
        if (node.bodies.length === 1) {
            const otherBody = node.bodies[0];
            if (otherBody !== body) {
                const bodyForces = this.calculateForceBetweenBodies(body, otherBody);
                if (bodyForces) {
                    forces.gravity.add(bodyForces.gravity);
                    forces.repulsion.add(bodyForces.repulsion);
                }
            }
            return forces;
        }

        // Check if node is far enough to be treated as a single body
        const s = node.boundary.w;
        if (s / distance < theta) {
            // Node is far enough, treat as single body
            direction.normalize();
            const gravityStrength = (this.gravitationalConstant * body.mass * node.totalMass) / 
                                  (distance * distance);
            const gravityForce = direction.copy().mult(gravityStrength);
            forces.gravity.add(gravityForce);
        } else {
            // Node is too close, recurse into children if divided
            if (node.divided) {
                if (node.northwest) this.calculateForceFromNode(body, node.northwest, theta, forces);
                if (node.northeast) this.calculateForceFromNode(body, node.northeast, theta, forces);
                if (node.southwest) this.calculateForceFromNode(body, node.southwest, theta, forces);
                if (node.southeast) this.calculateForceFromNode(body, node.southeast, theta, forces);
            }
        }

        return forces;
    }

    applyGravitationalForce(body, position, mass, distance) {
        // Minimum separation distance based on body diameters
        const minDistance = (body.diameter + mass/100) / 2; // Using mass as a proxy for the other body's diameter
        
        if (distance < PHYSICS_CONSTANTS.MIN_DISTANCE) return;

        const force = this.p5.createVector(
            position.x - body.position.x,
            position.y - body.position.y
        );

        if (distance < minDistance) {
            // Apply repulsion force when too close
            const repulsionStrength = (1 - distance/minDistance) * this.gravitationalConstant * 10;
            force.setMag(-repulsionStrength); // Negative to push away
        } else {
            // Normal gravitational force
            const strength = (this.gravitationalConstant * body.mass * mass) / 
                           (distance * distance);
            force.setMag(strength);
        }
        
        body.applyForce(force);
    }

    drawDebugInfo() {
        if (this.quadTree) {
            this.quadTree.show();
        }

        // Draw velocity vectors
        this.bodies.forEach(body => {
            this.p5.push();
            this.p5.stroke(0, 255, 0);
            this.p5.strokeWeight(2);
            this.p5.line(
                body.position.x,
                body.position.y,
                body.position.x + body.velocity.x * 20,
                body.position.y + body.velocity.y * 20
            );
            this.p5.pop();
        });
    }

    addBody(body) {
        if (this.bodies.length >= PHYSICS_CONSTANTS.MAX_BODIES) {
            throw new Error('Maximum number of bodies reached');
        }
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    setViewScale(scale) {
        this.viewScale = scale;
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        console.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
    }

    togglePause() {
        this.paused = !this.paused;
    }

    clear() {
        this.bodies = [];
    }
}