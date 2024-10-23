export class QuadTree {
    constructor(boundary, capacity, p5Instance) {
        this.p5 = p5Instance;
        this.boundary = boundary;
        this.capacity = capacity;
        this.bodies = [];
        this.divided = false;
        
        // Center of mass properties
        this.totalMass = 0;
        this.centerOfMass = this.p5.createVector(0, 0);
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        const nw = { x: x, y: y, w: w, h: h };
        const ne = { x: x + w, y: y, w: w, h: h };
        const sw = { x: x, y: y + h, w: w, h: h };
        const se = { x: x + w, y: y + h, w: w, h: h };

        this.northwest = new QuadTree(nw, this.capacity, this.p5);
        this.northeast = new QuadTree(ne, this.capacity, this.p5);
        this.southwest = new QuadTree(sw, this.capacity, this.p5);
        this.southeast = new QuadTree(se, this.capacity, this.p5);

        this.divided = true;

        // Redistribute existing bodies
        for (const body of this.bodies) {
            this.insertIntoChild(body);
        }
        this.bodies = [];
    }

    insertIntoChild(body) {
        if (this.northwest.contains(body.position)) {
            this.northwest.insert(body);
        } else if (this.northeast.contains(body.position)) {
            this.northeast.insert(body);
        } else if (this.southwest.contains(body.position)) {
            this.southwest.insert(body);
        } else if (this.southeast.contains(body.position)) {
            this.southeast.insert(body);
        }
    }

    contains(point) {
        return point.x >= this.boundary.x &&
               point.x < this.boundary.x + this.boundary.w &&
               point.y >= this.boundary.y &&
               point.y < this.boundary.y + this.boundary.h;
    }

    insert(body) {
        if (!this.contains(body.position)) {
            return false;
        }

        this.updateCenterOfMass(body);

        if (!this.divided) {
            if (this.bodies.length < this.capacity) {
                this.bodies.push(body);
                return true;
            }
            this.subdivide();
        }

        return this.insertIntoChild(body);
    }

    updateCenterOfMass(body) {
        const totalMass = this.totalMass + body.mass;
        const newX = (this.centerOfMass.x * this.totalMass + body.position.x * body.mass) / totalMass;
        const newY = (this.centerOfMass.y * this.totalMass + body.position.y * body.mass) / totalMass;
        
        this.centerOfMass.set(newX, newY);
        this.totalMass = totalMass;
    }

    show() {
        // Draw node boundary
        this.p5.stroke(VISUAL_EFFECTS.DEBUG.quadtree.nodeColor);
        this.p5.strokeWeight(VISUAL_EFFECTS.DEBUG.quadtree.lineWeight);
        this.p5.noFill();
        this.p5.rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);

        // Draw subdivisions
        if (this.divided) {
            this.northwest.show();
            this.northeast.show();
            this.southwest.show();
            this.southeast.show();
        }

        // Draw center of mass
        if (this.totalMass > 0) {
            this.p5.fill(VISUAL_EFFECTS.DEBUG.quadtree.centerOfMassColor);
            this.p5.noStroke();
            this.p5.ellipse(this.centerOfMass.x, this.centerOfMass.y, 4);
        }
    }
}
