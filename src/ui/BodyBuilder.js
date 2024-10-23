import { CELESTIAL_TYPES } from '../constants/celestialTypes.js';
import { PHYSICS_CONSTANTS } from '../constants/physicsConstants.js';
import { Body } from '../models/Body.js';

export class BodyBuilder {
    constructor(gravitySystem, p5Instance) {
        this.gravitySystem = gravitySystem;
        this.p5 = p5Instance;
        this.typeSelect = null;
        this.massSlider = null;
        this.diameterSlider = null;
        this.colorDiv = null;
        this.previewDiv = null;
        this.selectedColor = null;
    }

    initialize() {
        this.setupBuilder();
    }

    setupBuilder() {
        const container = this.p5.createDiv();
        container.class('builder-container');
        container.position(this.p5.width - 320, 20);

        // Type selector
        this.typeSelect = this.p5.createSelect();
        this.typeSelect.parent(container);
        Object.entries(CELESTIAL_TYPES).forEach(([key, type]) => {
            this.typeSelect.option(type.name, key);
        });

        // Mass slider
        const massGroup = this.p5.createDiv();
        massGroup.parent(container);
        massGroup.class('slider-group');
        
        this.p5.createSpan('Mass').parent(massGroup);
        this.massSlider = this.p5.createSlider(100, 50000, 1000);
        this.massSlider.parent(massGroup);
        this.massSlider.id('massSlider');
        this.massSlider.input(() => this.updatePreview());

        // Diameter slider
        const diameterGroup = this.p5.createDiv();
        diameterGroup.parent(container);
        diameterGroup.class('slider-group');
        
        this.p5.createSpan('Diameter').parent(diameterGroup);
        this.diameterSlider = this.p5.createSlider(20, 400, 100);
        this.diameterSlider.parent(diameterGroup);
        this.diameterSlider.id('diameterSlider');
        this.diameterSlider.input(() => this.updatePreview());

        // Color picker
        this.colorDiv = this.p5.createDiv();
        this.colorDiv.parent(container);
        this.colorDiv.class('color-picker');

        // Preview
        this.previewDiv = this.p5.createDiv();
        this.previewDiv.parent(container);
        this.previewDiv.class('preview-container');

        // Create button
        const createButton = this.p5.createButton('Create Body');
        createButton.parent(container);
        createButton.class('control-button');
        createButton.mousePressed(() => this.createBody());

        // Add event listeners
        this.typeSelect.changed(() => this.handleTypeChange());
        
        // Initialize with default type
        this.handleTypeChange();
    }

    createSliderGroup(parent, label, id, min, max) {
        const group = this.p5.createDiv();
        group.parent(parent);
        group.class('slider-group');

        this.p5.createSpan(label).parent(group);
        const slider = this.p5.createSlider(min, max, (min + max) / 2);
        slider.parent(group);
        slider.id(id);
        slider.input(() => this.updatePreview());

        return slider;
    }

    createColorPicker(parent) {
        this.colorDiv = this.p5.createDiv();
        this.colorDiv.parent(parent);
        this.colorDiv.class('color-picker');
        this.updateColorOptions();

        this.typeSelect.changed(() => this.updateColorOptions());
    }

    updateColorOptions() {
        if (!this.colorDiv) return;
        
        this.colorDiv.html('');
        const type = CELESTIAL_TYPES[this.typeSelect.value()];
        
        type.colors.forEach(color => {
            const colorButton = this.p5.createButton('');
            colorButton.parent(this.colorDiv);
            colorButton.class('color-option');
            colorButton.style('background-color', color);
            colorButton.mousePressed(() => {
                this.colorDiv.elt.querySelectorAll('.color-option').forEach(btn => 
                    btn.classList.remove('selected')
                );
                colorButton.elt.classList.add('selected');
                this.selectedColor = color;
                this.updatePreview();
            });
        });
        
        // Select first color by default
        this.selectedColor = type.colors[0];
        if (this.colorDiv.elt.querySelector('.color-option')) {
            this.colorDiv.elt.querySelector('.color-option').classList.add('selected');
        }
    }

    handleTypeChange() {
        const type = CELESTIAL_TYPES[this.typeSelect.value()];
        
        // Update sliders with type-specific ranges
        this.massSlider.elt.min = type.massRange.min;
        this.massSlider.elt.max = type.massRange.max;
        this.massSlider.value((type.massRange.min + type.massRange.max) / 2);

        this.diameterSlider.elt.min = type.diameterRange.min;
        this.diameterSlider.elt.max = type.diameterRange.max;
        this.diameterSlider.value((type.diameterRange.min + type.diameterRange.max) / 2);

        // Update color options
        this.updateColorOptions();
        
        // Update preview
        this.updatePreview();
    }

    updatePreview() {
        if (!this.previewDiv) return;

        const type = CELESTIAL_TYPES[this.typeSelect.value()];
        const mass = this.massSlider.value();
        const diameter = this.diameterSlider.value();

        // Update preview visualization
        this.previewDiv.html('');
        const previewCanvas = this.p5.createGraphics(100, 100);
        previewCanvas.background(20);
        previewCanvas.fill(this.selectedColor);
        previewCanvas.noStroke();
        previewCanvas.ellipse(50, 50, diameter * 0.2);
        this.previewDiv.child(previewCanvas);

        // Update info text
        const infoText = `
            <div class="preview-info">
                <p>${type.name}</p>
                <p>Mass: ${mass}</p>
                <p>Diameter: ${diameter}</p>
            </div>
        `;
        this.p5.createDiv(infoText).parent(this.previewDiv);
    }


    createBody() {
        if (this.gravitySystem.bodies.length >= PHYSICS_CONSTANTS.MAX_BODIES) {
            alert('Maximum number of bodies reached!');
            return;
        }

        const typeKey = this.typeSelect.value();
        const type = CELESTIAL_TYPES[typeKey];
        const mass = this.massSlider.value();
        const diameter = this.diameterSlider.value();

        try {
            const body = new Body({
                position: this.p5.createVector(
                    this.p5.random(this.p5.width * 0.2, this.p5.width * 0.8),
                    this.p5.random(this.p5.height * 0.2, this.p5.height * 0.8)
                ),
                type: type,
                mass: mass,
                diameter: diameter,
                color: this.selectedColor,
                velocity: this.p5.createVector(this.p5.random(-1, 1), this.p5.random(-1, 1))
            }, this.p5);

            this.gravitySystem.addBody(body);
            
            console.log('Created body:', {
                type: type.name,
                mass,
                diameter,
                color: this.selectedColor
            });
        } catch (error) {
            console.error('Error creating body:', error);
        }
    }

    destroy() {
        // Clean up DOM elements when needed
        this.typeSelect.remove();
        this.colorDiv.remove();
        this.previewDiv.remove();
    }
}
