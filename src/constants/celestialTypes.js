export const CELESTIAL_TYPES = {
    STAR: {
        name: 'Star',
        massRange: { min: 100, max: 800 },
        diameterRange: { min: 400, max: 1000 },
        colors: [
            '#FFD700', // Yellow star
            '#FFA500', // Orange star
            '#FF4500', // Red giant
            '#F0FFF0', // Blue-white star
            '#FF69B4'  // Young star
        ],
        luminosity: { min: 0.8, max: 1 },
        description: 'Massive, luminous spheres of plasma',
        probability: 0.1,
        specialBehavior: 'SOLAR_WIND',
        effectRadius: 500
    },
    
    NEUTRON_STAR: {
        name: 'Neutron Star',
        massRange: { min: 100000, max: 120000 },
        diameterRange: { min: 5, max: 20 },
        colors: [
            '#E0FFFF', // Light cyan
            '#87CEEB', // Sky blue
            '#B0C4DE'  // Light steel blue
        ],
        luminosity: { min: 0.9, max: 1 },
        description: 'Ultra-dense stellar remnants with extreme gravitational pull',
        probability: 0.05,
        specialBehavior: 'EXTREME_GRAVITY',
        effectRadius: 800
    },
    
    BLACK_HOLE: {
        name: 'Black Hole',
        massRange: { min: 25000, max: 50000 },
        diameterRange: { min: 30, max: 60 },
        colors: ['rgb(0,0,0)'], // Use RGB format instead of plain 'black'
        luminosity: { min: 0, max: 0 },
        description: 'Region of spacetime with gravitational pull so strong that nothing can escape',
        probability: 0.02,
        specialBehavior: 'EVENT_HORIZON',
        effectRadius: 1000
    },
    
    PLANET: {
        name: 'Planet',
        massRange: { min: 1000, max: 3000 },
        diameterRange: { min: 100, max: 200 },
        colors: [
            '#4169E1', // Earth-like
            '#8B4513', // Rocky
            '#CD853F', // Desert
            '#20B2AA', // Ice giant
            '#FF6347'  // Hot jupiter
        ],
        luminosity: { min: 0, max: 0 },
        description: 'Rocky or gaseous celestial bodies orbiting stars',
        probability: 0.3
    },
    
    ASTEROID: {
        name: 'Asteroid',
        massRange: { min: 100, max: 400 },
        diameterRange: { min: 20, max: 40 },
        colors: [
            '#696969', // Dim gray
            '#A9A9A9', // Dark gray
            '#8B4513', // Saddle brown
            '#556B2F'  // Dark olive
        ],
        luminosity: { min: 0, max: 0 },
        description: 'Small rocky bodies',
        probability: 0.3
    },
    
    COMET: {
        name: 'Comet',
        massRange: { min: 200, max: 600 },
        diameterRange: { min: 30, max: 60 },
        colors: [
            '#87CEEB', // Sky blue
            '#B0E0E6', // Powder blue
            '#ADD8E6', // Light blue
            '#E0FFFF'  // Light cyan
        ],
        luminosity: { min: 0.1, max: 0.3 },
        description: 'Icy bodies that produce tails when near stars',
        probability: 0.1,
        specialBehavior: 'COMET_TAIL'
    }
};

export const SPECIAL_BEHAVIORS = {
    SOLAR_WIND: {
        pushForce: 0.5,
        affectedTypes: ['ASTEROID', 'COMET']
    },
    EXTREME_GRAVITY: {
        pullMultiplier: 2.5,
        affectedTypes: ['all']
    },
    EVENT_HORIZON: {
        captureThreshold: 50,
        affectedTypes: ['all']
    },
    COMET_TAIL: {
        tailLength: 50,
        particleCount: 20
    }
};
