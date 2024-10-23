import { CELESTIAL_TYPES } from '../constants/celestialTypes.js';
import { VISUAL_EFFECTS, PARTICLE_SYSTEMS } from '../constants/visualEffects.js';
import { PHYSICS_CONSTANTS } from '../constants/physicsConstants.js';

export class Body {
    constructor(config, p5Instance) {
        this.p5 = p5Instance;
        const {
            position,
            type = this.randomCelestialType(),
            mass = this.randomInRange(type.massRange),
            diameter = this.randomInRange(type.diameterRange),
            color = this.randomColor(type.colors),
            velocity = this.p5.createVector(this.p5.random(-1, 1), this.p5.random(-1, 1)).normalize(),
        } = config;

        this.position = position;
        this.type = type;
        this.mass = mass;
        this.diameter = diameter;
        this.color = color;
        this.velocity = velocity;
        this.acceleration = this.p5.createVector(0, 0);
        this.isSelected = false;
        this.markForRemoval = false;
        
        this.luminosity = this.randomInRange(type.luminosity);
        this.particleSystems = [];
        this.trail = [];
        this.maxTrailLength = 20;
        
        this.initializeSpecialBehaviors();
    }

    randomCelestialType() {
        const random = this.p5.random();
        let probabilitySum = 0;
        
        for (const type of Object.values(CELESTIAL_TYPES)) {
            probabilitySum += type.probability;
            if (random <= probabilitySum) {
                return type;
            }
        }
        return CELESTIAL_TYPES.ASTEROID;
    }

    randomInRange(range) {
        if (!range) return 0;
        return this.p5.random(range.min, range.max);
    }

    randomColor(colors) {
        return this.p5.random(colors);
    }

    initializeSpecialBehaviors() {
        if (this.type.specialBehavior) {
            switch (this.type.specialBehavior) {
                case 'SOLAR_WIND':
                    this.solarWindParticles = [];
                    break;
                case 'EVENT_HORIZON':
                    this.accretionDiskParticles = [];
                    this.capturedBodies = [];
                    break;
                case 'COMET_TAIL':
                    this.tailParticles = [];
                    break;
            }
        }
    }

    applyForce(force) {
        const f = force.copy().div(this.mass);
        this.acceleration.add(f);
    }

    calculateGravitationalForce(otherBody) {
        const force = this.p5.createVector(
            otherBody.position.x - this.position.x,
            otherBody.position.y - this.position.y
        );
        const distance = force.mag();
        const strength = (PHYSICS_CONSTANTS.MAX_GRAVITY * this.mass * otherBody.mass) / 
                        (distance * distance);
        force.normalize().mult(strength);
        return force;
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(PHYSICS_CONSTANTS.MAX_SPEED);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        
        this.updateSpecialEffects();
        this.handleBoundaries();
        this.updateParticleSystems();
    }

    updateSpecialEffects() {
        if (this.type.specialBehavior) {
            switch (this.type.specialBehavior) {
                case 'SOLAR_WIND':
                    this.updateSolarWindEffect();
                    break;
                case 'EVENT_HORIZON':
                    this.updateEventHorizonEffect();
                    break;
                case 'COMET_TAIL':
                    this.updateCometTailEffect();
                    break;
            }
        }
    }

    updateParticleSystems() {
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const system = this.particleSystems[i];
            system.particles = system.particles.filter(p => 
                PARTICLE_SYSTEMS.updateParticle(p, this.p5)
            );
            
            if (system.particles.length === 0) {
                this.particleSystems.splice(i, 1);
            }
        }
    }

    handleBoundaries() {
        const margin = this.diameter / 2;
        
        if (this.position.x > this.p5.width + margin) {
            this.position.x = -margin;
        } else if (this.position.x < -margin) {
            this.position.x = this.p5.width + margin;
        }
        
        if (this.position.y > this.p5.height + margin) {
            this.position.y = -margin;
        } else if (this.position.y < -margin) {
            this.position.y = this.p5.height + margin;
        }
    }

    draw(viewScale) {
        this.p5.push();
        
        // Handle special effects
        if (this.type.specialBehavior === 'EVENT_HORIZON') {
            this.drawEventHorizonEffect(viewScale);
        } else {
            // Draw regular body
            this.p5.fill(this.color);
            this.p5.noStroke();
            this.p5.ellipse(
                this.position.x,
                this.position.y,
                this.diameter * viewScale
            );

            // Draw any other special effects
            if (this.type.specialBehavior === 'SOLAR_WIND') {
                this.drawSolarWindEffect(viewScale);
            } else if (this.type.specialBehavior === 'COMET_TAIL') {
                this.drawCometTailEffect(viewScale);
            }
        }

        // Draw selection indicator if selected
        if (this.isSelected) {
            this.p5.noFill();
            this.p5.stroke('#FFD700');
            this.p5.strokeWeight(2);
            this.p5.ellipse(
                this.position.x,
                this.position.y,
                (this.diameter + 10) * viewScale
            );
        }

        this.p5.pop();
    }

    drawSpecialEffects(viewScale) {
        switch (this.type.specialBehavior) {
            case 'SOLAR_WIND':
                this.drawSolarWind(viewScale);
                break;
            case 'EVENT_HORIZON':
                this.drawAccretionDisk(viewScale);
                break;
            case 'COMET_TAIL':
                this.drawCometTail(viewScale);
                break;
        }
    }

    drawParticleSystem(system, viewScale) {
        system.particles.forEach(particle => {
            this.p5.fill(`rgba(${particle.color}, ${particle.opacity})`);
            this.p5.noStroke();
            this.p5.ellipse(
                particle.position.x,
                particle.position.y,
                particle.size * viewScale
            );
        });
    }

    containsPoint(x, y) {
        return this.p5.dist(this.position.x, this.position.y, x, y) < this.diameter / 2;
    }

    getInfo() {
        return {
            type: this.type.name,
            mass: this.mass.toFixed(0),
            diameter: this.diameter.toFixed(0),
            velocity: this.velocity.mag().toFixed(2),
            momentum: (this.velocity.mag() * this.mass).toFixed(2),
            description: this.type.description
        };
    }

    drawSpecialEffects(viewScale) {
        switch (this.type.specialBehavior) {
            case 'SOLAR_WIND':
                this.drawSolarWind(viewScale);
                break;
            case 'EVENT_HORIZON':
                this.drawAccretionDisk(viewScale);
                break;
            case 'COMET_TAIL':
                this.drawCometTail(viewScale);
                break;
        }
    }
    
    drawSolarWindEffect(viewScale) {
        this.p5.noStroke();
        for (const particle of this.solarWindParticles) {
            this.p5.fill(255, particle.life);
            this.p5.ellipse(
                particle.position.x,
                particle.position.y,
                4 * viewScale
            );
        }
    }

    drawEventHorizonEffect(viewScale) {
        const effect = VISUAL_EFFECTS.BLACK_HOLE;
        
        // Draw accretion disk layers
        for (let i = effect.accretionDisk.layers - 1; i >= 0; i--) {
            this.p5.fill(effect.accretionDisk.colors[i]);
            this.p5.noStroke();
            const radius = (this.diameter * (1.2 + i * 0.1)) * viewScale;
            this.p5.ellipse(this.position.x, this.position.y, radius);
        }

        // Draw the event horizon (black hole itself)
        this.p5.fill(0); // Use pure black as a number instead of string
        this.p5.noStroke();
        this.p5.ellipse(
            this.position.x,
            this.position.y,
            this.diameter * viewScale
        );
    }

    drawCometTailEffect(viewScale) {
        if (!this.trail) return;
        
        this.p5.noFill();
        let alpha = 255;
        for (let i = 0; i < this.trail.length - 1; i++) {
            this.p5.stroke(255, alpha);
            this.p5.strokeWeight(3 * viewScale);
            this.p5.line(
                this.trail[i].x,
                this.trail[i].y,
                this.trail[i + 1].x,
                this.trail[i + 1].y
            );
            alpha *= 0.9;
        }
    }

    updateSolarWindEffect() {
        // Implement solar wind particles
        if (this.solarWindParticles.length < 20) {
            const angle = this.p5.random(this.p5.TWO_PI);
            const radius = this.diameter / 2;
            const particle = {
                position: this.p5.createVector(
                    this.position.x + this.p5.cos(angle) * radius,
                    this.position.y + this.p5.sin(angle) * radius
                ),
                velocity: this.p5.createVector(
                    this.p5.cos(angle),
                    this.p5.sin(angle)
                ).mult(2),
                life: 255
            };
            this.solarWindParticles.push(particle);
        }

        // Update existing particles
        for (let i = this.solarWindParticles.length - 1; i >= 0; i--) {
            const particle = this.solarWindParticles[i];
            particle.position.add(particle.velocity);
            particle.life -= 5;
            if (particle.life <= 0) {
                this.solarWindParticles.splice(i, 1);
            }
        }
    }

    updateEventHorizonEffect() {
        // Update accretion disk rotation
        if (!this.accretionAngle) this.accretionAngle = 0;
        this.accretionAngle += 0.02;
    }

    updateCometTailEffect() {
        if (!this.trail) this.trail = [];
        this.trail.push(this.position.copy());
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

}
