import { GravitySystem } from './physics/GravitySystem.js';
import { UIController } from './ui/UIController.js';
import { BodyBuilder } from './ui/BodyBuilder.js';
import { CELESTIAL_TYPES } from './constants/celestialTypes.js';
import { Body } from './models/Body.js';
const p5 = require('p5')

// Use p5 instance mode
const sketch = (p5) => {
    let gravitySystem;
    let uiController;
    let bodyBuilder;

    p5.setup = () => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        
        gravitySystem = new GravitySystem(p5);
        uiController = new UIController(gravitySystem, p5);
        bodyBuilder = new BodyBuilder(gravitySystem, p5);
        
        uiController.initialize();
        bodyBuilder.initialize();

        // Add initial bodies with guaranteed visibility
        const initialBodies = [
            new Body({
                position: p5.createVector(p5.width * 0.3, p5.height * 0.5),
                mass: 1000,
                diameter: 100,
                type: CELESTIAL_TYPES.STAR,
                velocity: p5.createVector(0, 1)
            }, p5),
            new Body({
                position: p5.createVector(p5.width * 0.7, p5.height * 0.5),
                mass: 800,
                diameter: 80,
                type: CELESTIAL_TYPES.PLANET,
                velocity: p5.createVector(0, -1)
            }, p5)
        ];

        initialBodies.forEach(body => {
            gravitySystem.addBody(body);
            console.log('Created body:', {
                type: body.type.name,
                mass: body.mass,
                diameter: body.diameter,
                position: `(${Math.round(body.position.x)}, ${Math.round(body.position.y)})`,
                velocity: `(${body.velocity.x.toFixed(2)}, ${body.velocity.y.toFixed(2)})`
            });
        });

        p5.background(20);
    };

    p5.draw = () => {
        p5.background(20);
        
        gravitySystem.update();
        gravitySystem.draw();
        uiController.update();

        // Debug overlay
        if (gravitySystem.debugMode) {
            drawDebugOverlay();
        }
    };

    function drawDebugOverlay() {
        p5.push();
        p5.fill(255);
        p5.noStroke();
        p5.textSize(12);
        let y = 120; // Start below the info panel

        gravitySystem.bodies.forEach((body, index) => {
            p5.text(
                `Body ${index}: ${body.type.name} at (${Math.round(body.position.x)}, ${Math.round(body.position.y)}) ` +
                `vel: (${body.velocity.x.toFixed(2)}, ${body.velocity.y.toFixed(2)})`,
                10, y
            );
            y += 20;
        });
        p5.pop();
    }

    p5.mousePressed = () => {
        uiController.handleMousePressed();
    };

    p5.mouseDragged = () => {
        uiController.handleMouseDragged();
    };

    p5.mouseReleased = () => {
        uiController.handleMouseReleased();
    };

    p5.windowResized = () => {
        p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
};

// Create p5 instance
new p5(sketch);