export const VISUAL_EFFECTS = {
    STAR_GLOW: {
        layers: 3,
        maxRadius: 1.5,
        colors: [
            'rgba(255,255,0,0.1)',
            'rgba(255,165,0,0.1)',
            'rgba(255,69,0,0.1)'
        ]
    },
    
    BLACK_HOLE: {
        accretionDisk: {
            layers: 5,
            colors: [
                'rgba(255,69,0,0.2)',
                'rgba(255,140,0,0.2)',
                'rgba(255,215,0,0.2)',
                'rgba(255,165,0,0.2)',
                'rgba(255,140,0,0.2)'
            ]
        },
        eventHorizon: {
            color: 'rgb(0,0,0)', // Use RGB format
            distortionFactor: 1.2
        }
    },
    
    NEUTRON_STAR: {
        pulsar: {
            beamWidth: 20,
            beamLength: 100,
            rotationSpeed: 0.1,
            colors: [
                'rgba(255,255,255,0.3)',
                'rgba(200,200,255,0.2)'
            ]
        }
    },
    
    COMET_TAIL: {
        particles: {
            count: 20,
            lifetime: 60,
            colors: [
                'rgba(255,255,255,0.2)',
                'rgba(135,206,235,0.1)'
            ]
        },
        trail: {
            length: 30,
            fade: 0.95
        }
    },
    
    COLLISION: {
        particles: {
            count: 50,
            speedRange: { min: 1, max: 3 },
            lifetimeRange: { min: 30, max: 60 },
            sizeRange: { min: 2, max: 5 }
        },
        flash: {
            duration: 15,
            maxRadius: 2, // relative to combined radii
            color: 'rgba(255,255,255,0.8)'
        }
    },
    
    DEBUG: {
        quadtree: {
            nodeColor: 'rgba(255,255,255,0.3)',
            centerOfMassColor: 'rgba(255,0,0,0.5)',
            lineWeight: 1
        },
        forces: {
            color: 'rgba(0,255,0,0.3)',
            multiplier: 50, // visual scale of force vectors
            lineWeight: 1
        }
    }
};

export const PARTICLE_SYSTEMS = {
    createParticleSystem(type, position, options = {}) {
        return {
            particles: [],
            position: position.copy(),
            type,
            options,
            lifetime: 0,
            maxLifetime: options.lifetime || 60
        };
    },
    
    updateParticle(particle) {
        particle.position.add(particle.velocity);
        particle.lifetime++;
        particle.opacity *= particle.fade;
        return particle.lifetime < particle.maxLifetime;
    }
};
