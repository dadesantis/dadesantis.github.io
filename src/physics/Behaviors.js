import { SPECIAL_BEHAVIORS } from '../constants/celestialTypes.js';
import { PHYSICS_CONSTANTS } from '../constants/physicsConstants.js';

function applySolarWind(source, bodies, p5) {
    if (!source || !source.position || !source.type) return;
    const behavior = SPECIAL_BEHAVIORS.SOLAR_WIND;
    
    for (const target of bodies) {
        if (!target || !target.position || target === source) continue;
        if (!behavior.affectedTypes.includes(target.type?.name)) continue;

        try {
            const distance = p5.Vector.dist(source.position, target.position);
            if (distance < source.type.effectRadius) {
                const force = p5.Vector.sub(target.position, source.position);
                force.setMag(behavior.pushForce * (1 - distance / source.type.effectRadius));
                target.applyForce(force);
            }
        } catch (error) {
            console.error('Error in solar wind calculation:', error);
        }
    }
}

function applyExtremeGravity(source, bodies, p5) {
    if (!source || !source.position || !source.type) return;
    const behavior = SPECIAL_BEHAVIORS.EXTREME_GRAVITY;
    
    bodies.forEach(target => {
        if (target === source || !target || !target.position) return;
        if (behavior.affectedTypes !== 'all' && !behavior.affectedTypes.includes(target.type.name)) return;

        try {
            const force = p5.Vector.sub(source.position, target.position);
            const distance = force.mag();
            // Prevent division by zero or very small numbers
            if (distance < PHYSICS_CONSTANTS.MIN_DISTANCE) return;
            const strength = (PHYSICS_CONSTANTS.MAX_GRAVITY * source.mass * target.mass * behavior.pullMultiplier) / 
                            (distance * distance);
            force.setMag(strength);
            target.applyForce(force);
        } catch (error) {
            console.error('Error in extreme gravity calculation:', error);
        }
    });
}

function applyEventHorizon(source, bodies, p5) {
    const behavior = SPECIAL_BEHAVIORS.EVENT_HORIZON;
    
    bodies.forEach(target => {
        if (target === source || !target || !target.position) return;
        if (behavior.affectedTypes !== 'all' && !behavior.affectedTypes.includes(target.type.name)) return;

        try {
            const distance = p5.Vector.dist(source.position, target.position);
            if (distance < behavior.captureThreshold) {
                target.markForRemoval = true;
                source.mass += target.mass * 0.5;
                if (source.capturedBodies) {
                    source.capturedBodies.push({
                        position: target.position.copy(),
                        time: p5.millis()
                    });
                }
            }
        } catch (e) {
            console.error('Error in event horizon calculation:', error);
        }
    });
}

function applyCometBehavior(comet, bodies, p5) {
    // Early return checks
    if (!comet || !comet.position) return;
    if (!comet.tailParticles) comet.tailParticles = [];
    
    const behavior = SPECIAL_BEHAVIORS.COMET_TAIL;
    
    // Find nearest star
    let nearestStar = null;
    let minDistance = Infinity;
    
    for (const body of bodies) {
        if (!body || !body.position || !body.type) continue;
        if (body === comet) continue;
        
        if (body.type.name === 'Star' || body.type.name === 'Neutron Star') {
            try {
                const distance = p5.Vector.dist(comet.position, body.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStar = body;
                }
            } catch (error) {
                console.error('Error calculating distance:', error);
                continue;
            }
        }
    }

    if (nearestStar) {
        try {
            // Create base vector for tail direction
            const awayFromStar = p5.createVector(
                comet.position.x - nearestStar.position.x,
                comet.position.y - nearestStar.position.y
            );
            
            // Add new particles
            if (comet.tailParticles.length < behavior.particleCount) {
                // Add random spread to particles
                const angle = awayFromStar.heading() + p5.random(-0.2, 0.2);
                const speed = p5.random(1, 3);
                
                const particle = {
                    position: p5.createVector(comet.position.x, comet.position.y),
                    velocity: p5.createVector(
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed
                    ),
                    life: 255,
                    maxLife: p5.random(20, 40),
                    size: p5.random(2, 5)
                };
                
                comet.tailParticles.push(particle);
            }

            // Update existing particles
            for (let i = comet.tailParticles.length - 1; i >= 0; i--) {
                const particle = comet.tailParticles[i];
                if (!particle || !particle.position || !particle.velocity) {
                    comet.tailParticles.splice(i, 1);
                    continue;
                }
                
                try {
                    // Update particle position
                    particle.position.add(particle.velocity);
                    particle.life -= 5;
                    
                    // Remove dead particles
                    if (particle.life <= 0) {
                        comet.tailParticles.splice(i, 1);
                    }
                } catch (error) {
                    console.error('Error updating particle:', error);
                    comet.tailParticles.splice(i, 1);
                }
            }
        } catch (error) {
            console.error('Error in comet tail calculation:', error);
        }
    }
}

export function applyBehaviors(bodies, p5) {
    if (!bodies || !Array.isArray(bodies) || !p5) return;
    
    for (const body of bodies) {
        if (!body || !body.type || !body.type.specialBehavior) continue;
        
        try {
            switch (body.type.specialBehavior) {
                case 'SOLAR_WIND':
                    applySolarWind(body, bodies, p5);
                    break;
                case 'EXTREME_GRAVITY':
                    applyExtremeGravity(body, bodies, p5);
                    break;
                case 'EVENT_HORIZON':
                    applyEventHorizon(body, bodies, p5);
                    break;
                case 'COMET_TAIL':
                    applyCometBehavior(body, bodies, p5);
                    break;
            }
        } catch (error) {
            console.error(`Error applying behavior ${body.type.specialBehavior}:`, error);
        }
    }
}
