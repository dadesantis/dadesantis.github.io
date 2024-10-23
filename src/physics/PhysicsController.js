import { PHYSICS_CONSTANTS } from "../constants/physicsConstants.js";

export class PhysicsController {
    constructor(p5Instance) {
        this.p5 = p5Instance;
        this.settings = { ...PHYSICS_CONSTANTS.BEHAVIORS };
        this.parameters = { ...PHYSICS_CONSTANTS.PARAMETERS };
        this.setupControls();
    }

    setupControls() {
        // Get the builder container to reference its position and size
        const builderContainer = document.querySelector('.builder-container');
        const builderRect = builderContainer?.getBoundingClientRect();

        // Create the physics controls container
        const container = this.p5.createDiv();
        container.class('physics-controls');
        
        // Position it below the builder container with some spacing
        if (builderRect) {
            const topPosition = builderRect.bottom + 20; // 20px spacing
            container.position(this.p5.width - 320, topPosition);
        } else {
            // Fallback positioning if builder container is not found
            container.position(this.p5.width - 320, 400);
        }

        // Add controls header
        const header = this.p5.createDiv('Physics Controls');
        header.parent(container);
        header.class('physics-controls-header');

        // Create sections for better organization
        const behaviorsSection = this.p5.createDiv();
        behaviorsSection.parent(container);
        behaviorsSection.class('physics-controls-section');

        const parametersSection = this.p5.createDiv();
        parametersSection.parent(container);
        parametersSection.class('physics-controls-section');

        // Add toggles to behaviors section
        this.createToggle('ALLOW_MERGING', 'Allow Merging', behaviorsSection);
        this.createToggle('ALLOW_COLLISIONS', 'Allow Collisions', behaviorsSection);
        this.createToggle('ALLOW_WRAPPING', 'Allow Wrapping', behaviorsSection);
        this.createToggle('USE_REPULSION', 'Use Repulsion', behaviorsSection);
        this.createToggle('USE_TIDAL_FORCES', 'Use Tidal Forces', behaviorsSection);
        this.createToggle('CONSERVE_MOMENTUM', 'Conserve Momentum', behaviorsSection);

        // Add sliders to parameters section
        this.createSlider('ELASTIC_COLLISION', 'Elasticity', 0, 1, 0.1, parametersSection);
        this.createSlider('REPULSION_FACTOR', 'Repulsion Strength', 0, 20, 1, parametersSection);
        this.createSlider('MERGER_THRESHOLD', 'Merger Threshold', 0.1, 1, 0.1, parametersSection);
    }

    createToggle(key, label, parent) {
        const div = this.p5.createDiv();
        div.parent(parent);
        div.class('control-row');

        const checkbox = this.p5.createCheckbox(label, this.settings[key]);
        checkbox.parent(div);
        checkbox.changed(() => {
            this.settings[key] = checkbox.checked();
        });
    }

    createSlider(key, label, min, max, step, parent) {
        const div = this.p5.createDiv();
        div.parent(parent);
        div.class('control-row');

        this.p5.createSpan(label).parent(div);
        const slider = this.p5.createSlider(min, max, this.parameters[key], step);
        slider.parent(div);
        slider.input(() => {
            this.parameters[key] = slider.value();
        });
    }

    isEnabled(behavior) {
        return this.settings[behavior];
    }

    getParameter(param) {
        return this.parameters[param];
    }
}
