var CONSTANTS = {
    'MAX_SPEED': 20,
    'MAX_GRAVITY': 200,
    'MAXED_INFLUENCED': 10,
    'bodyColors': ['brown', 'green', 'magenta',
                    'black', 'red', 'orange']
}

var G = 0;

function calculateAttraction(body_a, body_b) {
    let force = p5.Vector.sub(body_a.pos, body_b.pos);
    let dis = force.mag();
    dis = constrain(dis, body_a.diameter, windowWidth/2);
    force.normalize();

    let F = G * ((body_a.mass * body_b.mass) / Math.pow(dis, 2));
    force.mult(-F);

    return force;
}

function checkCollision(body_a, body_b) {
    let r = Math.sqrt(Math.pow(body_b.pos.x - body_a.pos.x, 2) + Math.pow(body_b.yPos - body_a.yPos, 2));

    if (body_a.diameter > body_b.diameter && r < 0) {
        let newV_b = body_b.velocity.mult(-1);
        body_b.acceleration.add(newV_b);
    } else if (body_b.diameter > body_a.diameter && r < 0) {
        let newV_a = body_a.velocity.mult(-1);
        body_a.acceleration.add(newV_a);
    }
}
