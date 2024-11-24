// Framer
//
// Displays current Frequency
//
export class Framer {
	constructor() {
		this.countTicks = 140
		this.frequencyData = []
		this.tickSize = 10
		this.maxTickSize = this.tickSize * 10
		this.tickWidth = 2
		this.amplitude = 12
		this.PI = 360
		this.loadingAngle = 0
		this.tickColor = ["#5f9ea0", "#5f9ea0", "#F5F5F5"]
	}

	init(scene) {
		console.log('[Framer]Init');
		this.scene = scene;
		this.canvas = document.querySelector('canvas');
		this.context = this.scene.context;
	}

	setFrequencies(frequencies) {
		this.frequencyData = frequencies
	}

	drawTicks() {
		this.context.save();
		this.context.beginPath();
		this.context.lineWidth = 1;
		this.getTicks(this.countTicks)
			.forEach(tick => this.drawTick(tick))
		this.context.restore();
	}

	drawTick(tick) {
		const dx1 = parseInt(this.scene.cx + tick.start.x);
		const dy1 = parseInt(this.scene.cy + tick.start.y);

		const dx2 = parseInt(this.scene.cx + tick.end.x);
		const dy2 = parseInt(this.scene.cy + tick.end.y);

		const gradient = this.context.createLinearGradient(dx1, dy1, dx2, dy2);
		gradient.addColorStop(0, this.tickColor[0]);
		gradient.addColorStop(0.6, this.tickColor[1]);
		gradient.addColorStop(1, this.tickColor[2]);
		this.context.beginPath();
		this.context.strokeStyle = gradient;
		this.context.lineWidth = this.tickWidth;
		this.context.moveTo(this.scene.cx + tick.start.x, this.scene.cx + tick.start.y);
		this.context.lineTo(this.scene.cx + tick.end.x, this.scene.cx + tick.end.y);
		this.context.stroke();
	}

	getTicks(count) {
		const lesser = 1600 / this.amplitude;
		return this.getTickPoints(count).map((point, i, { length }) => {
			const coef = 1 - i / (length * 2.5);
			const delta = Math.max(0, ((this.frequencyData[i] || 0) - lesser * coef));

			const k = this.scene.radius / (this.scene.radius - (this.tickSize + delta));

			const start = new Point(
				point.x * (this.scene.radius - this.tickSize),
				point.y * (this.scene.radius - this.tickSize)
			)
			const end = new Point(start.x * k, start.y * k)
			return new Tick(start, end);
		})
	}

	getTickPoints(count) {
		const coords = [],
			step = this.PI / count;
		for (let deg = 0; deg < this.PI; deg += step) {
			const rad = deg * Math.PI / (this.PI / 2);
			coords.push(new Point(Math.cos(rad), Math.sin(rad)))
		}
		return coords;
	}
}

class Tick {
	constructor(startPoint, endPoint) {
		this.start = startPoint
		this.end = endPoint
	}
}

class Point {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
}

export class Scene {
	constructor() {
		this.padding = 120
		this.minSize = 600
		this.optimiseHeight = 982
		this._inProcess = false
	}

	/**
	 * @param {Framer} framer
	 * @param {Tracker} tracker
	 */
	init(framer, tracker) {
		console.log('[Scene]Init');
		this.framer = framer
		this.tracker = tracker
		this.canvasConfigure();
		this.initHandlers();
	}

	canvasConfigure() {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');
		this.context.strokeStyle = '#FE4365';
		this.configureSize();
	}

	configureSize() {
		const size = Math.max(this.minSize, $('canvas').height());
		this.canvas.setAttribute('width', size);
		this.canvas.setAttribute('height', size);

		this.width = size;
		this.height = size;

		this.radius = (size - this.padding * 2) / 2;
		this.cx = size / 2;
		this.cy = size / 2;
		this.coord = this.canvas.getBoundingClientRect();
	}

	initHandlers() {
		window.onresize = () => {
			this.canvasConfigure();
			this.render();
		};
	}

	render() {
		requestAnimationFrame(() => {
			this.clear()
			this.draw()
			if (this.inProcess()) {
				this.render()
			}
		});
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	draw() {
		this.framer.drawTicks();
		this.tracker.draw();
	}

	startRender() {
		this._inProcess = true;
		this.render();
	}

	stopRender() {
		this._inProcess = false;
	}

	inProcess() {
		return this._inProcess;
	}
}

// Tracker
//
// Shows time and dot
//
export class Tracker {
	constructor() {
		this.innerDelta = 20
		this.lineWidth = 6
		this.prevAngle = 0.5
		this.angle = 0
		this.animationCount = 10
		this.pressButton = false
		this.currentTime = 0
		this.duration = 0

		this.arcColor = 'rgba(0,255,255,0.5)'
		this.dotColor = 'rgb(0, 102, 102)'
	}

	init(scene) {
		console.log('[Tracker]Init')
		this.scene = scene
		this.context = this.scene.context
	}

	setTime(seconds) {
		this.currentTime = seconds
	}

	setDuration(seconds) {
		this.duration = seconds
	}

	draw() {
		if (this.duration !== 0) {
			if (!this.pressButton) {
				this.angle = (this.currentTime / this.duration) * 2 * Math.PI || 0;
			}
			this.drawArc();
			this.drawDot();
		}
	}

	drawArc() {
		this.context.save();
		this.context.strokeStyle = this.arcColor;
		this.context.beginPath();
		this.context.lineWidth = this.lineWidth;

		this.r = this.scene.radius - (this.innerDelta + this.lineWidth / 2);
		this.context.arc(
			this.scene.radius + this.scene.padding,
			this.scene.radius + this.scene.padding,
			this.r, 0, this.angle, false
		);
		this.context.stroke();
		this.context.restore();
	}

	drawDot() {
		this.context.save();
		this.context.beginPath();
		this.context.fillStyle = this.dotColor;
		this.context.lineWidth = 1;
		let x = this.r / Math.sqrt(Math.pow(Math.tan(this.angle), 2) + 1);
		let y = Math.sqrt(this.r * this.r - x * x);
		switch (this.getDotQuadrant()) {
			case 2:
				x = -x;
				break;
			case 3:
				x = -x;
				y = -y;
				break;
			case 4:
				y = -y;
				break;
		}

		this.context.arc(this.scene.radius + this.scene.padding + x, this.scene.radius + this.scene.padding + y, 10, 0, Math.PI * 2, false);
		this.context.fill();
		this.context.restore();
	}

	getDotQuadrant() {
		if (0 <= this.angle && this.angle < Math.PI / 2) {
			return 1;
		}
		if (Math.PI / 2 <= this.angle && this.angle < Math.PI) {
			return 2;
		}
		if (Math.PI < this.angle && this.angle < Math.PI * 3 / 2) {
			return 3;
		}
		if (Math.PI * 3 / 2 <= this.angle && this.angle <= Math.PI * 2) {
			return 4;
		}
	}

	calculateAngle(e, animatedInProgress) {
		this.animatedInProgress = animatedInProgress;
		this.mx = e.pageX;
		this.my = e.pageY;
		this.angle = Math.atan((this.my - this.scene.cy - this.scene.coord.top) / (this.mx - this.scene.cx - this.scene.coord.left));
		if (this.mx < this.scene.cx + this.scene.coord.left) {
			this.angle = Math.PI + this.angle;
		}
		if (this.angle < 0) {
			this.angle += 2 * Math.PI;
		}
		if (animatedInProgress) {
			this.startAnimation();
		} else {
			this.prevAngle = this.angle;
		}
	}

	startAnimation() {
		const angle = this.angle;
		const l = Math.abs(this.angle) - Math.abs(this.prevAngle);
		const step = l / this.animationCount,
			i = 0;
		const f = () => {
			this.angle += step;
			if (++i == this.animationCount) {
				this.angle = angle;
				this.prevAngle = angle;
				this.animatedInProgress = false;
			} else {
				this.animateId = setTimeout(f, 20);
			}
		};

		this.angle = this.prevAngle;
		this.animateId = setTimeout(f, 20);
	}

	stopAnimation() {
		clearTimeout(this.animateId)
		this.animatedInProgress = false
	}
}
