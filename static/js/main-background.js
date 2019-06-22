
var canvas, ctx,
    particles = [],
    lastFrameTime = Date.now();

addEventListener('load', function() {

    canvas = document.getElementById('background');
    ctx = canvas.getContext("2d");

    addEventListener('resize', onResize);
    requestAnimationFrame(onAnimationFrame);
    onResize();
    init();

});

var Vec2 = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vec2.prototype.clone = function() {
    return new Vec2(this.x, this.y);
}

Vec2.prototype.add = function(vec) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
}

Vec2.prototype.sub = function(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
}

Vec2.prototype.length = function() {
    return Math.sqrt(
        this.x * this.x +
        this.y * this.y
    )
}

var Particle = function(x, y, vx, vy) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(vx, vy);
}

function init() {

    for (var i = 0; i < 100; i++) {

        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() - 0.5,
            Math.random() - 0.5
        ));

    }

}

function onResize() {

    var width = document.body.clientWidth,
        height = document.body.clientHeight;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

}

function onAnimationFrame() {

    update();
    draw();
    requestAnimationFrame(onAnimationFrame);

}

function update() {

    var now = Date.now(),
        deltaTimeMS = now - lastFrameTime,
        deltaTimeMS = Math.min(deltaTimeMS, 32),
        deltaTimeS = deltaTimeMS / 1000;
    lastFrameTime = now;

    for (var i in particles) {

        var particle = particles[i];
        particle.pos.add(particle.vel);

        if (particle.pos.x > canvas.width) {
            particle.pos.x = canvas.width;
            particle.vel.x *= -Math.abs(particle.vel.x);
        } else if (particle.pos.x < 0) {
            particle.pos.x = 0;
            particle.vel.x = Math.abs(particle.vel.x);
        }

        if (particle.pos.y > canvas.height) {
            particle.pos.y = canvas.height;
            particle.vel.y *= -Math.abs(particle.vel.y);
        } else if (particle.pos.y < 0) {
            particle.pos.y = 0;
            particle.vel.y = Math.abs(particle.vel.y);
        }


    }

}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0, 161, 188, 0.2)";
    ctx.strokeWidth = 1;
    for (var i in particles) {

        var particle = particles[i];

        for (var j in particles) {
            if (i === j) { continue; }

            var other = particles[j],
                deltaPos = other.pos.clone().sub(particle.pos),
                dist = deltaPos.length();

            if (dist > 100) { continue; }

            ctx.beginPath();
            ctx.globalAlpha = (100 - dist) / 100;
            ctx.moveTo(particle.pos.x, particle.pos.y);
            ctx.lineTo(other.pos.x, other.pos.y);
            ctx.stroke();

        }




    }

}
