/* ============================================
   fireworks.js — Canvas Fireworks Engine
   Birthday Wishes for Love
   ============================================ */

const FireworksEngine = (() => {
    let canvas, ctx;
    let rockets = [];
    let sparks = [];
    let running = false;
    let animId = null;

    const COLORS = [
        '#FF6B9D', '#C44569', '#FFD700', '#FF69B4', '#E91E63',
        '#F44336', '#FF5252', '#FF4081', '#B76E79', '#FFC0CB',
        '#DDA0DD', '#EE82EE', '#FFB6C1', '#FF1493', '#FFDAB9'
    ];

    function init() {
        canvas = document.getElementById('fireworks-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', Utils.debounce(resize, 200));
    }

    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createRocket(x, y) {
        const targetX = x || Utils.randomBetween(canvas.width * 0.2, canvas.width * 0.8);
        const targetY = y || Utils.randomBetween(canvas.height * 0.1, canvas.height * 0.4);

        return {
            x: Utils.randomBetween(canvas.width * 0.3, canvas.width * 0.7),
            y: canvas.height,
            targetX,
            targetY,
            vx: 0,
            vy: -Utils.randomBetween(8, 14),
            alpha: 1,
            trail: [],
            exploded: false,
            color: Utils.randomItem(COLORS)
        };
    }

    function createSpark(x, y, color) {
        const angle = Utils.randomBetween(0, Math.PI * 2);
        const speed = Utils.randomBetween(1, 7);
        const sparkType = Utils.randomItem(['circle', 'trail', 'glitter']);

        return {
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            decay: Utils.randomBetween(0.01, 0.03),
            color: color || Utils.randomItem(COLORS),
            size: Utils.randomBetween(1.5, 3.5),
            gravity: 0.06,
            trail: [],
            type: sparkType,
            twinkle: Utils.randomBetween(0, Math.PI * 2)
        };
    }

    function explodeRocket(rocket) {
        const sparkCount = Utils.randomBetween(40, 80);
        const color1 = rocket.color;
        const color2 = Utils.randomItem(COLORS);

        for (let i = 0; i < sparkCount; i++) {
            const color = Math.random() > 0.5 ? color1 : color2;
            sparks.push(createSpark(rocket.x, rocket.y, color));
        }

        // Inner burst - smaller, brighter sparks
        for (let i = 0; i < 15; i++) {
            const spark = createSpark(rocket.x, rocket.y, '#FFFFFF');
            spark.vx *= 0.3;
            spark.vy *= 0.3;
            spark.size = Utils.randomBetween(1, 2);
            spark.decay = Utils.randomBetween(0.02, 0.04);
            sparks.push(spark);
        }
    }

    function update() {
        if (!running) return;

        // Fade effect instead of clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update rockets
        for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i];

            // Trail
            r.trail.push({ x: r.x, y: r.y, alpha: 0.8 });
            if (r.trail.length > 8) r.trail.shift();

            r.x += r.vx;
            r.y += r.vy;
            r.vy += 0.05; // slight gravity on rocket

            // Draw rocket trail
            for (let t = 0; t < r.trail.length; t++) {
                const tp = r.trail[t];
                ctx.save();
                ctx.globalAlpha = (t / r.trail.length) * 0.6;
                ctx.fillStyle = r.color;
                ctx.beginPath();
                ctx.arc(tp.x, tp.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Draw rocket
            ctx.save();
            ctx.globalAlpha = r.alpha;
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 10;
            ctx.shadowColor = r.color;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Check if reached target height
            if (r.y <= r.targetY || r.vy >= 0) {
                explodeRocket(r);
                rockets.splice(i, 1);
            }
        }

        // Update sparks
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];

            s.trail.push({ x: s.x, y: s.y, alpha: s.alpha });
            if (s.trail.length > 5) s.trail.shift();

            s.vy += s.gravity;
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.98;
            s.alpha -= s.decay;
            s.twinkle += 0.1;

            if (s.alpha <= 0) {
                sparks.splice(i, 1);
                continue;
            }

            // Draw trail
            if (s.type === 'trail') {
                for (let t = 0; t < s.trail.length; t++) {
                    const tp = s.trail[t];
                    ctx.save();
                    ctx.globalAlpha = (t / s.trail.length) * s.alpha * 0.4;
                    ctx.fillStyle = s.color;
                    ctx.beginPath();
                    ctx.arc(tp.x, tp.y, s.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            // Draw spark
            ctx.save();
            let drawAlpha = s.alpha;
            if (s.type === 'glitter') {
                drawAlpha *= (0.5 + Math.sin(s.twinkle) * 0.5);
            }
            ctx.globalAlpha = drawAlpha;
            ctx.fillStyle = s.color;
            ctx.shadowBlur = s.size * 3;
            ctx.shadowColor = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Auto-stop when nothing is happening
        if (rockets.length === 0 && sparks.length === 0) {
            stop();
            if (canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        animId = requestAnimationFrame(update);
    }

    function start() {
        if (running) return;
        running = true;
        if (canvas) {
            canvas.style.display = 'block';
        }
        update();
    }

    function stop() {
        running = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    function launchRocket(x, y) {
        if (!running) start();
        rockets.push(createRocket(x, y));
    }

    function launchSequence(count = 8, interval = 400) {
        if (!running) start();
        let launched = 0;
        const timer = setInterval(() => {
            launchRocket();
            launched++;
            if (launched >= count) {
                clearInterval(timer);
            }
        }, interval);
    }

    function grandFinale() {
        if (!running) start();
        // Wave 1 - spread
        for (let i = 0; i < 5; i++) {
            setTimeout(() => launchRocket(), i * 200);
        }
        // Wave 2 - burst
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => launchRocket(), i * 100);
            }
        }, 1200);
        // Wave 3 - finale
        setTimeout(() => {
            for (let i = 0; i < 12; i++) {
                setTimeout(() => launchRocket(), i * 80);
            }
        }, 2500);
    }

    function hide() {
        stop();
        rockets = [];
        sparks = [];
        if (canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
        }
    }

    return {
        init,
        start,
        stop,
        launchRocket,
        launchSequence,
        grandFinale,
        hide,
        resize
    };
})();

window.FireworksEngine = FireworksEngine;
