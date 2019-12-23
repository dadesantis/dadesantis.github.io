/* Objects */
// TODO: Make bodies and array list
// Make option to create a custom body
var body_1;
var body_2;
var bodies = [];
var num_bodies = 2;
var selected_body = 0;

/* Canvas Variables */
var viewScale = 1.0;
var canvasWidth = 1900;
var canvasHeight = 850;
var maxPlanetSize = 200;

var planet_count_scale = 25;
var planet_slider_scale = 2;

function setup() {

	/* Create world and info canvases*/
	info = createGraphics(windowWidth, windowHeight*.35);
	info.background('white');
	info.style('margin', 'auto');
	info.style('display', 'block');

	/* Sliders */
	gravSlider = createSlider(0, CONSTANTS['MAX_GRAVITY'], 0, CONSTANTS['MAX_GRAVITY']*.1);
	gravSlider.position(info.width/planet_slider_scale, 175);
	/* -------------------------------------- */
	viewScaleSlier = createSlider(.1, 1, 1, .01);
	viewScaleSlier.position(info.width/planet_slider_scale, 225);
	/* -------------------------------------- */
	maxInfluenceSlider = createSlider(0, CONSTANTS['MAXED_INFLUENCED'], num_bodies-1, 1);
	maxInfluenceSlider.position(info.width/planet_slider_scale, 275);

	/* Button controls */
	increment_button = createButton('Increment');
	increment_button.position(info.width/planet_slider_scale, 100);
	increment_button.mousePressed(function() {
		bodies.push(new Body(random(maxPlanetSize, (canvasWidth-maxPlanetSize)), random(maxPlanetSize, (canvasHeight-maxPlanetSize)), floor(random(50, 500)), floor(random(50, 500))));
		selected_body = bodies.length-1;
		return;
	});
	/* -------------------------------------- */
	decrement_button = createButton('Decrement');
	decrement_button.position(info.width/planet_slider_scale, 125);
	decrement_button.mousePressed(function() {
		bodies.pop();
		/**
		 * If there's at least one body, set selected to the last element
		 * Otherwise, set it to the first
		 */ 
		if (bodies.length > 1) {
			selected_body = bodies.length-1;
		} else  {
			selected_body = 0;
			getLiveStats(bodies[selected_body]);
		}
		return;
	});
	/* -------------------------------------- */
	next_selected_button = createButton('Next');
	next_selected_button.position(info.width/planet_count_scale + 50, 175);
	next_selected_button.mousePressed(function() {
		if (selected_body < bodies.length-1) {
			selected_body += 1;
		} else {
			selected_body = 0;
		}
	});
	/* -------------------------------------- */
	prev_selected_button = createButton('Prev');
	prev_selected_button.position(info.width/planet_count_scale, 175);
	prev_selected_button.mousePressed(function() {
		if (selected_body > 0) {
			selected_body -= 1;
		} else {
			selected_body = bodies.length-1;
		}
	});
	
	world = createCanvas(windowWidth, windowHeight);
	world.background('navy');
	world.style('margin', 'auto');
	world.style('display', 'block');
	
	/**
	 * Scene objects
	 * Draw objects smallest to largest  
	 */
	for (let i = 0; i < num_bodies; i++) {
		bodies.push(new Body(random(maxPlanetSize, (canvasWidth-maxPlanetSize)), random(maxPlanetSize, (canvasHeight-maxPlanetSize)), floor(random(50, 500)), floor(random(50, 500))));
	}
	
	getLiveStats(bodies[selected_body]);
	console.log(bodies);

}

function draw() {
	draw_world();
}

function draw_world() {
	world.background('navy');

	G = gravSlider.value();
	viewScale = viewScaleSlier.value();

	if (bodies.length < 1) {
		fill('white');
		textSize(50*viewScale);
		world.text('No planets to be drawn (⌣́_⌣̀)', width/3, height/2);
	} else if (bodies.length === 1) {
		bodies[0].draw(viewScale);
		bodies[0].update();
		getLiveStats(bodies[selected_body]);
	} else  {
		let temp = [...bodies];
		temp.sort((a, b) => (a.diameter < b.diameter) ? 1 : -1);
		for (let i = 0; i < temp.length; i++) {
			for (let j = 0; j < temp.length; j++) {
				if (i !== j && i < maxInfluenceSlider.value()) {
					temp[i].applyForce(calculateAttraction(temp[i], temp[j]));
					temp[i].update();
					temp[i].draw(viewScale);
				}
			}
			temp[i].update();
			temp[i].draw(viewScale);
		}

		getLiveStats(bodies[selected_body]);
	} 
	
}

/**
 * Show the live stats of a body
 * TODO: Make this more efficient (stop constantly overwriting the text)
 * 		 move the numbers into a seperate graphic and draw independently
 */
function getLiveStats(body) {
	info.background('white');
	info.fill('black');
	info.text('Planet Count: ' + bodies.length, info.width / planet_slider_scale, 25);
	info.text('Gravity', info.width/planet_slider_scale - 8, 105);
	info.text('View Scale', info.width/planet_slider_scale - 8, 155);
	info.text('Max Influenced:' + maxInfluenceSlider.value(), info.width/planet_slider_scale - 8, 205);
	info.textSize(24);
	if ( bodies.length < 1) {
		info.text('No planet \nto display', info.width/planet_count_scale, info.height/planet_count_scale*4);
	} else {
		info.fill('black');
		info.text('Info ['+selected_body+']', info.width / planet_count_scale, 25);
		info.text('Diameter:' + body.diameter, info.width / planet_count_scale, 50);
		info.text('Mass:' + body.mass, info.width / planet_count_scale, 75);
		info.text('Momentum:' + body.calcMomentum(), info.width / planet_count_scale, 100);
		show_body(body);
	}
}

function show_body(body) {
	view_scale = .25;
	info.fill(body.color);
	info.ellipse(info.width/planet_count_scale/view_scale, info.height/1.5, body.diameter*viewScaleSlier.value()*view_scale);
}

function clicked(body) {
	d = floor(dist(body.pos.x, body.pos.y, mouseX, mouseY));
	if (d < body.diameter / 2) {
		console.debug(body + " was clicked!");
		return true;
	} else {
		return false;
	}
}