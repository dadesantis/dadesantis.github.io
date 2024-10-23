export class InfoPanel {
    constructor(p5Instance) {
        this.p5 = p5Instance;
        this.panel = this.p5.createDiv();
        this.panel.id('info-panel');
        this.setupPanel();
    }

    setupPanel() {
        this.statsDiv = this.p5.createDiv();
        this.statsDiv.parent(this.panel);
        this.statsDiv.class('stats');

        this.selectedBodyDiv = this.p5.createDiv();
        this.selectedBodyDiv.parent(this.panel);
        this.selectedBodyDiv.class('selected-body-info');
    }

    update(data) {
        const { bodyCount, maxBodies, gravity, selectedBody, fps } = data;

        // Update general stats
        this.statsDiv.html(`
            <p>Bodies: ${bodyCount}/${maxBodies}</p>
            <p>Gravity: ${gravity.toFixed(1)}</p>
            <p>FPS: ${fps}</p>
        `);

        // Update selected body info
        if (selectedBody) {
            const info = selectedBody.getInfo();
            this.selectedBodyDiv.html(`
                <h3>Selected Body</h3>
                <p>Type: ${info.type}</p>
                <p>Mass: ${info.mass}</p>
                <p>Diameter: ${info.diameter}</p>
                <p>Velocity: ${info.velocity}</p>
                <p>Momentum: ${info.momentum}</p>
                <p class="description">${info.description}</p>
            `);
            this.selectedBodyDiv.style('display', 'block');
        } else {
            this.selectedBodyDiv.style('display', 'none');
        }
    }
}
