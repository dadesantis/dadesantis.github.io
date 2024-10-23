export const PHYSICS_CONSTANTS = {
    // Basic physics
    MAX_SPEED: 8,
    MAX_GRAVITY: 10,
    MIN_DISTANCE: 1,
    MAX_DISTANCE: 1000,

    // Physics Behavior Controls
    BEHAVIORS: {
        ALLOW_MERGING: true,
        ALLOW_COLLISIONS: true,
        ALLOW_WRAPPING: true,
        USE_REPULSION: true,
        USE_TIDAL_FORCES: false,
        CONSERVE_MOMENTUM: true
    },

    // Physics Parameters
    PARAMETERS: {
        COLLISION_THRESHOLD: 0.8,
        ELASTIC_COLLISION: 0.8,      // 1 = perfectly elastic, 0 = perfectly inelastic
        REPULSION_FACTOR: 10,
        REPULSION_FALLOFF: 2,
        DAMPING_FACTOR: 0.95,
        MIN_SEPARATION_SCALE: 1.2,
        TIDAL_FORCE_FACTOR: 0.1,
        GRAVITATIONAL_SOFTENING: 0.1,
        MERGER_THRESHOLD: 0.4
    },
    RESTITUTION: 0.8,

    // Barnes-Hut algorithm parameters
    QUADTREE_CAPACITY: 4,
    BARNES_HUT_THETA: 0.5,
    OPTIMIZATION_THRESHOLD: 50, // number of bodies before optimization kicks in
    
    // Simulation limits
    MIN_BODIES: 2,
    MAX_BODIES: 100,
    MIN_SEPARATION_SCALE: 1.2, // Multiplier for minimum separation distance

    // Debug visualization
    DEBUG_FORCE_SCALE: 50,       // Scale factor for force vectors in debug mode
    DEBUG_REPULSION_COLOR: 'rgba(255,0,0,0.5)',
    DEBUG_GRAVITY_COLOR: 'rgba(0,255,0,0.5)',
    DEBUG_VELOCITY_COLOR: 'rgba(0,0,255,0.5)',

    // Performance settings
    UPDATE_RATE: 60,
};
