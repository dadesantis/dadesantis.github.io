import { PHYSICS_CONSTANTS } from '../constants/physicsConstants.js';
import { InfoPanel } from './InfoPanel.js';

export class UIController {
    constructor(gravitySystem, p5Instance) {
        this.gravitySystem = gravitySystem;
        this.p5 = p5Instance;
        this.infoPanel = new InfoPanel(p5Instance);
        this.selectedBody = null;
        this.isDragging = false;
    }

    initialize() {
        this.setupControls();
    }

    setupControls() {
        const padding = 20;
        const bottomPadding = 100;
        
        // Bottom controls container
        const controlsContainer = this.p5.createDiv();
        controlsContainer.class('controls-container');
        controlsContainer.position(padding, this.p5.height - bottomPadding);

        // Left side - sliders
        const slidersContainer = this.p5.createDiv();
        slidersContainer.parent(controlsContainer);
        slidersContainer.class('sliders-container');

        // Gravity control
        const gravityContainer = this.p5.createDiv();
        gravityContainer.parent(slidersContainer);
        gravityContainer.class('slider-group');
        
        const gravityLabel = this.p5.createSpan('Gravity');
        gravityLabel.parent(gravityContainer);
        gravityLabel.class('control-label');

        this.gravitySlider = this.p5.createSlider(
            0,
            PHYSICS_CONSTANTS.MAX_GRAVITY,
            PHYSICS_CONSTANTS.MAX_GRAVITY / 2,
            0.1
        );
        this.gravitySlider.parent(gravityContainer);
        this.gravitySlider.class('control-slider');
        this.gravitySlider.input(() => {
            this.gravitySystem.gravitationalConstant = this.gravitySlider.value();
        });

        // View scale control
        const viewScaleContainer = this.p5.createDiv();
        viewScaleContainer.parent(slidersContainer);
        viewScaleContainer.class('slider-group');

        const viewScaleLabel = this.p5.createSpan('View Scale');
        viewScaleLabel.parent(viewScaleContainer);
        viewScaleLabel.class('control-label');

        this.viewScaleSlider = this.p5.createSlider(0.1, 2, 1, 0.1);
        this.viewScaleSlider.parent(viewScaleContainer);
        this.viewScaleSlider.class('control-slider');
        this.viewScaleSlider.input(() => {
            this.gravitySystem.setViewScale(this.viewScaleSlider.value());
        });

        // Right side - buttons
        const buttonsContainer = this.p5.createDiv();
        buttonsContainer.parent(controlsContainer);
        buttonsContainer.class('buttons-container');

        // Pause button
        this.pauseButton = this.p5.createButton('Pause');
        this.pauseButton.parent(buttonsContainer);
        this.pauseButton.class('control-button');
        this.pauseButton.mousePressed(() => {
            this.gravitySystem.togglePause();
            this.pauseButton.html(this.gravitySystem.paused ? 'Resume' : 'Pause');
        });

        // Debug button
        this.debugButton = this.p5.createButton('Debug View');
        this.debugButton.parent(buttonsContainer);
        this.debugButton.class('control-button');
        this.debugButton.mousePressed(() => {
            this.gravitySystem.toggleDebug();
            this.debugButton.html(this.gravitySystem.debugMode ? 'Hide Debug' : 'Debug View');
        });

        // Clear button
        this.clearButton = this.p5.createButton('Clear All');
        this.clearButton.parent(buttonsContainer);
        this.clearButton.class('control-button');
        this.clearButton.mousePressed(() => {
            if (confirm('Are you sure you want to clear all bodies?')) {
                this.gravitySystem.clear();
                this.selectedBody = null;
            }
        });
    }

    createControlButtons() {
        const buttonY = height - 90;
        let buttonX = 20;
        const buttonSpacing = 110;

        // Pause/Resume
        this.pauseButton = this.p5.createButton('Pause');
        this.pauseButton.position(buttonX, buttonY);
        this.pauseButton.mousePressed(() => {
            this.gravitySystem.togglePause();
            this.pauseButton.html(this.gravitySystem.paused ? 'Resume' : 'Pause');
        });

        // Debug Mode
        buttonX += buttonSpacing;
        this.debugButton = this.p5.createButton('Debug View');
        this.debugButton.position(buttonX, buttonY);
        this.debugButton.mousePressed(() => {
            this.gravitySystem.toggleDebug();
            this.debugButton.html(this.gravitySystem.debugMode ? 'Hide Debug' : 'Debug View');
        });

        // Clear All
        buttonX += buttonSpacing;
        this.clearButton = this.p5.createButton('Clear All');
        this.clearButton.position(buttonX, buttonY);
        this.clearButton.mousePressed(() => {
            if (confirm('Are you sure you want to clear all bodies?')) {
                this.gravitySystem.clear();
                this.selectedBody = null;
            }
        });
    }

    handleMousePressed() {
        // Fix: Use p5 instance for mouse coordinates
        for (const body of this.gravitySystem.bodies) {
            if (body.containsPoint(this.p5.mouseX, this.p5.mouseY)) {
                this.selectedBody = body;
                this.isDragging = true;
                body.isSelected = true;
                body.velocity.mult(0);
                return;
            }
        }

        if (this.selectedBody) {
            this.selectedBody.isSelected = false;
            this.selectedBody = null;
        }
    }

    handleMouseDragged() {
        if (this.isDragging && this.selectedBody) {
            this.selectedBody.position.x = this.p5.mouseX;
            this.selectedBody.position.y = this.p5.mouseY;
        }
    }

    handleMouseReleased() {
        if (this.isDragging && this.selectedBody) {
            const mouseVelocity = this.p5.createVector(
                this.p5.mouseX - this.p5.pmouseX,
                this.p5.mouseY - this.p5.pmouseY
            );
            this.selectedBody.velocity = mouseVelocity;
            this.isDragging = false;
        }
    }

    update() {
        this.infoPanel.update({
            bodyCount: this.gravitySystem.bodies.length,
            maxBodies: PHYSICS_CONSTANTS.MAX_BODIES,
            gravity: this.gravitySystem.gravitationalConstant,
            viewScale: this.viewScaleSlider.value(),
            selectedBody: this.selectedBody,
            fps: Math.floor(this.p5.frameRate())
        });
    }

    destroy() {
        // Clean up DOM elements when needed
        this.gravitySlider.remove();
        this.pauseButton.remove();
        this.debugButton.remove();
        this.clearButton.remove();
    }
}
