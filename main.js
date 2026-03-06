/* ============================================
   main.js — App Init & Section Orchestration
   Birthday Wishes for Love
   ============================================ */

const BirthdayApp = (() => {
    let hasEntered = false;
    let candlesLit = 5;
    const totalCandles = 5;

    // ---- Theme System ----
    const themes = {
        'midnight-rose': {
            '--bg-primary': '#0D0D1A',
            '--bg-secondary': '#1A0A14',
            '--accent-primary': '#FF6B9D',
            '--accent-secondary': '#C44569',
            '--gold': '#FFD700',
            '--rose-gold': '#B76E79',
            '--text-primary': '#FFF5EE',
            '--text-secondary': '#E8A0BF',
            '--glass-bg': 'rgba(139, 0, 54, 0.15)',
            '--glass-border': 'rgba(255, 182, 193, 0.2)'
        },
        'golden-hour': {
            '--bg-primary': '#1A1008',
            '--bg-secondary': '#2A1A0A',
            '--accent-primary': '#F7E7CE',
            '--accent-secondary': '#D4A574',
            '--gold': '#FFD700',
            '--rose-gold': '#DAA520',
            '--text-primary': '#FFF8F0',
            '--text-secondary': '#F7E7CE',
            '--glass-bg': 'rgba(218, 165, 32, 0.15)',
            '--glass-border': 'rgba(247, 231, 206, 0.2)'
        },
        'ocean-dream': {
            '--bg-primary': '#0A0D1A',
            '--bg-secondary': '#0D1525',
            '--accent-primary': '#4ECDC4',
            '--accent-secondary': '#45B7D1',
            '--gold': '#F7E7CE',
            '--rose-gold': '#7EC8E3',
            '--text-primary': '#F0F8FF',
            '--text-secondary': '#B0D4E8',
            '--glass-bg': 'rgba(78, 205, 196, 0.12)',
            '--glass-border': 'rgba(78, 205, 196, 0.2)'
        },
        'enchanted-forest': {
            '--bg-primary': '#0A1A0D',
            '--bg-secondary': '#0D2210',
            '--accent-primary': '#43E97B',
            '--accent-secondary': '#38F9D7',
            '--gold': '#F7E7CE',
            '--rose-gold': '#8FBC8F',
            '--text-primary': '#F0FFF0',
            '--text-secondary': '#98FB98',
            '--glass-bg': 'rgba(67, 233, 123, 0.1)',
            '--glass-border': 'rgba(67, 233, 123, 0.2)'
        },
        'royal-purple': {
            '--bg-primary': '#0D0A1A',
            '--bg-secondary': '#160D25',
            '--accent-primary': '#A18CD1',
            '--accent-secondary': '#FBC2EB',
            '--gold': '#F7E7CE',
            '--rose-gold': '#C9A0DC',
            '--text-primary': '#F5F0FF',
            '--text-secondary': '#D7BDE2',
            '--glass-bg': 'rgba(161, 140, 209, 0.12)',
            '--glass-border': 'rgba(161, 140, 209, 0.2)'
        }
    };

    function setTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        Object.entries(theme).forEach(([prop, value]) => {
            root.style.setProperty(prop, value);
        });

        // Update active state in theme selector
        Utils.$$('.theme-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.theme === themeName);
        });
    }

    // ---- Birthday Check ----
    function checkBirthday() {
        const badge = Utils.$('#birthday-badge');
        if (!badge) return;

        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        // Default birthday - can be customized
        const bMonth = parseInt(badge.dataset.month) || 3;
        const bDay = parseInt(badge.dataset.day) || 14;

        if (month === bMonth && day === bDay) {
            badge.classList.add('visible');
            badge.textContent = "🎂 It's Your Special Day! 🎂";
        }
    }

    // ---- Countdown Timer ----
    function initCountdown() {
        const countdownEl = Utils.$('#countdown');
        if (!countdownEl) return;

        const now = new Date();
        let birthday = new Date(now.getFullYear(), 2, 14); // March 14

        if (now > birthday) {
            birthday = new Date(now.getFullYear() + 1, 2, 14);
        }

        function updateCountdown() {
            const diff = birthday - new Date();
            if (diff <= 0) {
                countdownEl.innerHTML = '<span class="countdown-label">🎉 Today is the Day! 🎉</span>';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            countdownEl.innerHTML = `
        <div class="countdown-unit"><span class="countdown-number">${days}</span><span class="countdown-label">Days</span></div>
        <div class="countdown-separator">:</div>
        <div class="countdown-unit"><span class="countdown-number">${hours}</span><span class="countdown-label">Hours</span></div>
        <div class="countdown-separator">:</div>
        <div class="countdown-unit"><span class="countdown-number">${mins}</span><span class="countdown-label">Minutes</span></div>
        <div class="countdown-separator">:</div>
        <div class="countdown-unit"><span class="countdown-number">${secs}</span><span class="countdown-label">Seconds</span></div>
      `;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ---- Candle Interaction ----
    function initCandles() {
        const candles = Utils.$$('.candle');
        candlesLit = candles.length;

        candles.forEach((candle, i) => {
            candle.addEventListener('click', () => blowCandle(candle, i));
            candle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                blowCandle(candle, i);
            });
        });
    }

    function blowCandle(candle, index) {
        if (!candle.classList.contains('lit')) return;

        candle.classList.remove('lit');
        candle.classList.add('blown');
        candlesLit--;

        // Smoke effect
        const smoke = candle.querySelector('.candle-smoke');
        if (smoke) {
            smoke.classList.add('visible');
            setTimeout(() => smoke.classList.remove('visible'), 2000);
        }

        // All candles blown!
        if (candlesLit <= 0) {
            setTimeout(() => {
                // Trigger fireworks!
                FireworksEngine.grandFinale();

                // Show wish text
                const wishText = Utils.$('#wish-text');
                if (wishText) {
                    wishText.classList.add('visible');
                    AnimationSystem.typewriter(
                        wishText.querySelector('.wish-message'),
                        'Make a wish, my love! ✨',
                        60
                    );
                }

                // Confetti burst
                ParticleEngine.createBurst(ParticleEngine.TYPES.CONFETTI,
                    window.innerWidth / 2, window.innerHeight / 2, 50);

                setTimeout(() => {
                    ParticleEngine.createBurst(ParticleEngine.TYPES.HEART,
                        window.innerWidth / 2, window.innerHeight / 2, 30);
                }, 1000);
            }, 500);
        }
    }

    // ---- Enter World CTA ----
    function handleEnterWorld() {
        if (hasEntered) return;
        hasEntered = true;

        const heroScreen = Utils.$('#hero-screen');
        const mainContent = Utils.$('#main-content');
        const ctaBtn = Utils.$('#enter-btn');

        if (ctaBtn) ctaBtn.classList.add('clicked');

        // Start music on interaction
        AudioPlayer.play();

        // Transition hero out
        setTimeout(() => {
            if (heroScreen) {
                heroScreen.classList.add('exit');
            }

            // Switch particle mode
            ParticleEngine.setMode(ParticleEngine.TYPES.FIREFLY);

            // Show main content
            setTimeout(() => {
                if (mainContent) {
                    mainContent.classList.add('visible');
                    mainContent.style.display = 'block';
                }
                if (heroScreen) {
                    heroScreen.style.display = 'none';
                }

                // Initialize scroll-dependent features
                AnimationSystem.init();

                // Start love message typewriter after a delay
                setTimeout(() => {
                    const loveMsg = Utils.$('#love-message-text');
                    if (loveMsg) {
                        const text = loveMsg.dataset.text || loveMsg.textContent;
                        AnimationSystem.typewriter(loveMsg, text, 40);
                    }
                }, 1500);
            }, 1200);
        }, 300);
    }

    // ---- Envelope Animation ----
    function initEnvelope() {
        const envelope = Utils.$('#envelope');
        if (!envelope) return;

        envelope.addEventListener('click', () => {
            envelope.classList.toggle('opened');

            if (envelope.classList.contains('opened')) {
                ParticleEngine.createBurst(ParticleEngine.TYPES.HEART,
                    envelope.getBoundingClientRect().left + envelope.offsetWidth / 2,
                    envelope.getBoundingClientRect().top,
                    15
                );
            }
        });
    }

    // ---- Theme Selector ----
    function initThemeSelector() {
        Utils.$$('.theme-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                setTheme(dot.dataset.theme);
            });
        });
    }

    // ---- Mobile Nav ----
    function initMobileNav() {
        Utils.$$('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = Utils.$(item.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }

                Utils.$$('.mobile-nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Update active nav on scroll
        if (Utils.isMobile()) {
            window.addEventListener('scroll', Utils.throttle(() => {
                const sections = Utils.$$('section[id]');
                const scrollY = window.pageYOffset + window.innerHeight / 2;

                sections.forEach(section => {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;
                    const id = section.getAttribute('id');

                    if (scrollY >= top && scrollY < top + height) {
                        Utils.$$('.mobile-nav-item').forEach(i => i.classList.remove('active'));
                        const activeNav = Utils.$(`.mobile-nav-item[href="#${id}"]`);
                        if (activeNav) activeNav.classList.add('active');
                    }
                });
            }, 100), { passive: true });
        }
    }

    // ---- Interactive Hearts on Click ----
    function initClickHearts() {
        document.addEventListener('click', (e) => {
            if (!hasEntered) return;
            // Don't trigger on buttons/links/interactive elements
            if (e.target.closest('button, a, .polaroid-card, .candle, .lightbox, .envelope, nav')) return;

            ParticleEngine.createBurst(ParticleEngine.TYPES.HEART, e.clientX, e.clientY, 5);
        });
    }

    // ---- Scroll Progress ----
    function initScrollProgress() {
        const progressBar = Utils.$('.scroll-progress-bar');
        if (!progressBar) return;

        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }, 16), { passive: true });
    }

    // ---- Init Everything ----
    function init() {
        // Set default theme
        setTheme('midnight-rose');

        // Initialize particle engine
        ParticleEngine.init();
        ParticleEngine.setMode(ParticleEngine.TYPES.PETAL);

        // Create star field for hero
        ParticleEngine.createStarField(Utils.isMobile() ? 40 : 80);

        // Hero title animation
        const heroTitle = Utils.$('#hero-title');
        if (heroTitle) {
            setTimeout(() => {
                AnimationSystem.animateTitle(heroTitle, { delay: 500, stagger: 70 });
            }, 800);
        }

        // Hero subtitle
        const heroSubtitle = Utils.$('#hero-subtitle');
        if (heroSubtitle) {
            setTimeout(() => {
                heroSubtitle.classList.add('visible');
            }, 3000);
        }

        // CTA button appearance
        const enterBtn = Utils.$('#enter-btn');
        if (enterBtn) {
            setTimeout(() => {
                enterBtn.classList.add('visible');
                AnimationSystem.magneticEffect(enterBtn, 0.2);
            }, 4000);

            enterBtn.addEventListener('click', handleEnterWorld);
        }

        // Init other systems
        FireworksEngine.init();
        Gallery.init();
        AudioPlayer.init();

        // Init interactive features
        initCandles();
        initEnvelope();
        initThemeSelector();
        initMobileNav();
        initClickHearts();
        initScrollProgress();
        initCountdown();
        checkBirthday();

        // Prefers reduced motion
        if (Utils.prefersReducedMotion()) {
            document.body.classList.add('reduced-motion');
            ParticleEngine.stop();
        }

        console.log('💝 Birthday Wishes for Love — Initialized');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        setTheme,
        handleEnterWorld,
        themes: Object.keys(themes)
    };
})();

window.BirthdayApp = BirthdayApp;
