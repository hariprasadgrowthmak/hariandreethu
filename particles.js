/* ============================================
   particles.js — Canvas Particle Engine
   Birthday Wishes for Love
   ============================================ */

const ParticleEngine = (() => {
    let canvas, ctx;
    let particles = [];
    let pool = [];
    let animId = null;
    let running = false;
    let currentMode = 'PETAL';

    const TYPES = {
        PETAL: 'petal',
        HEART: 'heart',
        STAR: 'star',
        CONFETTI: 'confetti',
        SPARKLE: 'sparkle',
        FIREFLY: 'firefly'
    };

    const COLORS = {
        petals: ['#FFB6C1', '#FF69B4', '#DB7093', '#FFC0CB', '#E8A0BF', '#C77494'],
        hearts: ['#FF1744', '#E91E63', '#F44336', '#FF5252', '#FF4081', '#C62828'],
        stars: ['#FFD700', '#FFF8DC', '#FFFACD', '#F7E7CE', '#FFE4B5'],
        confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF69B4', '#FFD700'],
        sparkles: ['#FFD700', '#FFFFFF', '#FFF8DC', '#B76E79'],
        fireflies: ['#FFD700', '#FFFF00', '#FFA500', '#FFE4B5']
    };

    const MAX_PARTICLES = {
        low: 30,
        medium: 60,
        high: 100
    };

    function init() {
        canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', Utils.debounce(resize, 200));

        if (!Utils.prefersReducedMotion()) {
            start();
        }
    }

    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function getMaxParticles() {
        const perf = Utils.getDevicePerformance();
        return MAX_PARTICLES[perf] || 60;
    }

    function createParticle(type, x, y, overrides = {}) {
        let p = pool.pop() || {};

        p.alive = true;
        p.type = type;
        p.x = x !== undefined ? x : Utils.randomBetween(0, canvas.width);
        p.y = y !== undefined ? y : -20;
        p.alpha = overrides.alpha || 1;
        p.life = 1;
        p.decay = overrides.decay || Utils.randomBetween(0.001, 0.005);

        switch (type) {
            case TYPES.PETAL:
                p.size = Utils.randomBetween(8, 18);
                p.vx = Utils.randomBetween(-1, 1);
                p.vy = Utils.randomBetween(0.5, 2);
                p.rotation = Utils.randomBetween(0, Math.PI * 2);
                p.rotationSpeed = Utils.randomBetween(-0.03, 0.03);
                p.color = Utils.randomItem(COLORS.petals);
                p.wobble = Utils.randomBetween(0, Math.PI * 2);
                p.wobbleSpeed = Utils.randomBetween(0.02, 0.05);
                p.decay = Utils.randomBetween(0.0005, 0.002);
                break;

            case TYPES.HEART:
                p.size = Utils.randomBetween(8, 16);
                p.vx = Utils.randomBetween(-0.5, 0.5);
                p.vy = Utils.randomBetween(-2, -0.5);
                p.rotation = 0;
                p.rotationSpeed = Utils.randomBetween(-0.02, 0.02);
                p.color = Utils.randomItem(COLORS.hearts);
                p.decay = Utils.randomBetween(0.003, 0.008);
                break;

            case TYPES.STAR:
                p.size = Utils.randomBetween(2, 5);
                p.vx = 0;
                p.vy = 0;
                p.rotation = 0;
                p.rotationSpeed = 0;
                p.color = Utils.randomItem(COLORS.stars);
                p.twinkleSpeed = Utils.randomBetween(0.02, 0.06);
                p.twinklePhase = Utils.randomBetween(0, Math.PI * 2);
                p.decay = 0;
                p.alpha = Utils.randomBetween(0.3, 0.9);
                break;

            case TYPES.CONFETTI:
                p.size = Utils.randomBetween(4, 8);
                p.vx = Utils.randomBetween(-3, 3);
                p.vy = Utils.randomBetween(-8, -2);
                p.rotation = Utils.randomBetween(0, Math.PI * 2);
                p.rotationSpeed = Utils.randomBetween(-0.15, 0.15);
                p.color = Utils.randomItem(COLORS.confetti);
                p.gravity = 0.15;
                p.decay = Utils.randomBetween(0.004, 0.008);
                p.width = Utils.randomBetween(6, 12);
                p.height = Utils.randomBetween(3, 6);
                break;

            case TYPES.SPARKLE:
                p.size = Utils.randomBetween(2, 6);
                p.vx = Utils.randomBetween(-1, 1);
                p.vy = Utils.randomBetween(-1, 1);
                p.rotation = Utils.randomBetween(0, Math.PI * 2);
                p.rotationSpeed = Utils.randomBetween(-0.1, 0.1);
                p.color = Utils.randomItem(COLORS.sparkles);
                p.decay = Utils.randomBetween(0.01, 0.03);
                p.pulse = 0;
                p.pulseSpeed = Utils.randomBetween(0.05, 0.15);
                break;

            case TYPES.FIREFLY:
                p.size = Utils.randomBetween(2, 4);
                p.vx = Utils.randomBetween(-0.3, 0.3);
                p.vy = Utils.randomBetween(-0.3, 0.3);
                p.rotation = 0;
                p.rotationSpeed = 0;
                p.color = Utils.randomItem(COLORS.fireflies);
                p.twinkleSpeed = Utils.randomBetween(0.02, 0.05);
                p.twinklePhase = Utils.randomBetween(0, Math.PI * 2);
                p.decay = 0;
                p.wanderAngle = Utils.randomBetween(0, Math.PI * 2);
                break;
        }

        Object.assign(p, overrides);
        return p;
    }

    function updateParticle(p, dt) {
        if (!p.alive) return;

        switch (p.type) {
            case TYPES.PETAL:
                p.wobble += p.wobbleSpeed;
                p.vx = Math.sin(p.wobble) * 0.8;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.life -= p.decay;
                p.alpha = Math.max(0, p.life * 0.7);
                if (p.y > canvas.height + 20 || p.life <= 0) p.alive = false;
                break;

            case TYPES.HEART:
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.life -= p.decay;
                p.alpha = Math.max(0, p.life);
                if (p.alpha <= 0) p.alive = false;
                break;

            case TYPES.STAR:
                p.twinklePhase += p.twinkleSpeed;
                p.alpha = 0.3 + Math.sin(p.twinklePhase) * 0.4;
                break;

            case TYPES.CONFETTI:
                p.vy += p.gravity || 0.15;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.99;
                p.rotation += p.rotationSpeed;
                p.life -= p.decay;
                p.alpha = Math.max(0, p.life);
                if (p.y > canvas.height + 20 || p.life <= 0) p.alive = false;
                break;

            case TYPES.SPARKLE:
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += p.pulseSpeed;
                p.life -= p.decay;
                p.alpha = Math.max(0, p.life) * (0.5 + Math.sin(p.pulse) * 0.5);
                p.size = p.size * (0.8 + Math.sin(p.pulse) * 0.3);
                if (p.life <= 0) p.alive = false;
                break;

            case TYPES.FIREFLY:
                p.wanderAngle += Utils.randomBetween(-0.3, 0.3);
                p.vx += Math.cos(p.wanderAngle) * 0.05;
                p.vy += Math.sin(p.wanderAngle) * 0.05;
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.x += p.vx;
                p.y += p.vy;
                p.twinklePhase += p.twinkleSpeed;
                p.alpha = 0.2 + Math.abs(Math.sin(p.twinklePhase)) * 0.8;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                break;
        }
    }

    function drawParticle(p) {
        if (!p.alive || p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);

        switch (p.type) {
            case TYPES.PETAL:
                drawPetal(p);
                break;
            case TYPES.HEART:
                drawHeart(p);
                break;
            case TYPES.STAR:
                drawStar(p);
                break;
            case TYPES.CONFETTI:
                drawConfetti(p);
                break;
            case TYPES.SPARKLE:
                drawSparkle(p);
                break;
            case TYPES.FIREFLY:
                drawFirefly(p);
                break;
        }

        ctx.restore();
    }

    function drawPetal(p) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            p.size / 2, -p.size / 2,
            p.size, -p.size / 4,
            p.size, 0
        );
        ctx.bezierCurveTo(
            p.size, p.size / 4,
            p.size / 2, p.size / 2,
            0, 0
        );
        ctx.fill();
    }

    function drawHeart(p) {
        const s = p.size;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, s / 4);
        ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 4);
        ctx.bezierCurveTo(-s / 2, s / 2, 0, s * 0.7, 0, s);
        ctx.bezierCurveTo(0, s * 0.7, s / 2, s / 2, s / 2, s / 4);
        ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 4);
        ctx.fill();
    }

    function drawStar(p) {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawConfetti(p) {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width || p.size, p.height || p.size * 0.5);
    }

    function drawSparkle(p) {
        const s = p.size;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = s * 2;
        ctx.shadowColor = p.color;

        // 4-point star
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function drawFirefly(p) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, Utils.rgbaString(p.color, 0.3));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function update() {
        if (!running) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Auto-spawn based on mode
        const max = getMaxParticles();
        const activeCount = particles.filter(p => p.alive).length;

        if (activeCount < max && currentMode !== 'none') {
            if (currentMode === TYPES.PETAL && Math.random() < 0.08) {
                particles.push(createParticle(TYPES.PETAL));
            }
            if (currentMode === TYPES.FIREFLY && Math.random() < 0.03) {
                particles.push(createParticle(TYPES.FIREFLY,
                    Utils.randomBetween(0, canvas.width),
                    Utils.randomBetween(0, canvas.height)
                ));
            }
        }

        // Update & draw
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            updateParticle(p);
            if (p.alive) {
                drawParticle(p);
            } else {
                pool.push(particles.splice(i, 1)[0]);
            }
        }

        animId = requestAnimationFrame(update);
    }

    function start() {
        if (running) return;
        running = true;
        update();
    }

    function stop() {
        running = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    function pause() {
        running = false;
    }

    function resume() {
        if (!running) {
            running = true;
            update();
        }
    }

    function setMode(mode) {
        currentMode = mode;
    }

    function createBurst(type, x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Utils.randomBetween(-0.3, 0.3);
            const speed = Utils.randomBetween(1, 4);
            const p = createParticle(type, x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                decay: Utils.randomBetween(0.008, 0.02)
            });
            particles.push(p);
        }
    }

    function clear() {
        for (const p of particles) {
            p.alive = false;
            pool.push(p);
        }
        particles = [];
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function createStarField(count = 80) {
        for (let i = 0; i < count; i++) {
            const p = createParticle(TYPES.STAR,
                Utils.randomBetween(0, canvas ? canvas.width : window.innerWidth),
                Utils.randomBetween(0, canvas ? canvas.height : window.innerHeight)
            );
            particles.push(p);
        }
    }

    return {
        TYPES,
        init,
        start,
        stop,
        pause,
        resume,
        setMode,
        createBurst,
        createStarField,
        clear,
        resize
    };
})();

window.ParticleEngine = ParticleEngine;
