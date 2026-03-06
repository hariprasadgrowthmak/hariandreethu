/* ============================================
   animations.js — Scroll & Animation System
   Birthday Wishes for Love
   ============================================ */

const AnimationSystem = (() => {
    let observer = null;
    let parallaxElements = [];
    let scrollProgress = null;
    let typewriterQueue = [];
    let isTypewriting = false;

    function init() {
        setupScrollObserver();
        setupParallax();
        setupScrollProgress();
    }

    // ---- Scroll Observer ----
    function setupScrollObserver() {
        const options = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.dataset.delay) || 0;
                    const animation = el.dataset.animation || 'fadeInUp';

                    setTimeout(() => {
                        el.classList.add('revealed', animation);
                        el.style.animationPlayState = 'running';
                    }, delay);

                    // Stagger children if parent has data-stagger
                    if (el.dataset.stagger) {
                        const staggerDelay = parseInt(el.dataset.stagger) || 100;
                        const children = el.children;
                        Array.from(children).forEach((child, i) => {
                            child.style.animationDelay = `${delay + (i * staggerDelay)}ms`;
                            setTimeout(() => {
                                child.classList.add('revealed', 'fadeInUp');
                            }, delay + (i * staggerDelay));
                        });
                    }

                    observer.unobserve(el);
                }
            });
        }, options);

        // Observe all animated elements
        Utils.$$('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    function observe(element) {
        if (observer && element) {
            observer.observe(element);
        }
    }

    // ---- Parallax ----
    function setupParallax() {
        parallaxElements = Utils.$$('[data-parallax]');
        if (parallaxElements.length === 0) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    function updateParallax() {
        const scrollY = window.pageYOffset;
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.4;
            const rect = el.getBoundingClientRect();
            const offset = (scrollY - (rect.top + scrollY - window.innerHeight)) * speed;
            el.style.transform = `translateY(${offset}px)`;
        });
    }

    // ---- Scroll Progress Bar ----
    function setupScrollProgress() {
        scrollProgress = Utils.$('.scroll-progress-bar');
        if (!scrollProgress) return;

        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = `${progress}%`;
        }, 16), { passive: true });
    }

    // ---- Typewriter Effect ----
    function typewriter(element, text, speed = 40, cursor = true) {
        return new Promise((resolve) => {
            if (!element) { resolve(); return; }

            element.textContent = '';
            element.classList.add('typewriter-active');
            if (cursor) element.classList.add('typewriter-cursor');

            let i = 0;
            const type = () => {
                if (i < text.length) {
                    element.textContent += text[i];
                    i++;
                    setTimeout(type, speed + Utils.randomBetween(-10, 20));
                } else {
                    if (cursor) {
                        setTimeout(() => {
                            element.classList.remove('typewriter-cursor');
                            element.classList.add('typewriter-done');
                        }, 1000);
                    }
                    resolve();
                }
            };
            type();
        });
    }

    // ---- Hero Title Animation ----
    function animateTitle(element, options = {}) {
        return new Promise((resolve) => {
            if (!element) { resolve(); return; }

            const text = element.textContent || element.dataset.text || '';
            element.textContent = '';
            element.style.opacity = '1';

            const chars = text.split('');
            const delay = options.delay || 80;
            const stagger = options.stagger || 60;

            chars.forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.className = 'hero-char';
                span.style.animationDelay = `${delay + (i * stagger)}ms`;
                element.appendChild(span);
            });

            // Resolve after all characters have appeared
            setTimeout(resolve, delay + (chars.length * stagger) + 500);
        });
    }

    // ---- Counter Animation ----
    function animateCounter(element, target, duration = 2000) {
        if (!element) return;
        const start = performance.now();

        function step(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = Utils.easeOutCubic(progress);
            const current = Math.floor(eased * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(step);
    }

    // ---- Reveal Section ----
    function revealSection(sectionEl) {
        if (!sectionEl) return;
        sectionEl.classList.add('section-visible');

        // Trigger any children animations
        const animChildren = sectionEl.querySelectorAll('.animate-on-scroll');
        animChildren.forEach((child, i) => {
            setTimeout(() => {
                child.classList.add('revealed', child.dataset.animation || 'fadeInUp');
            }, i * 100);
        });
    }

    // ---- Magnetic Effect (for buttons) ----
    function magneticEffect(element, strength = 0.3) {
        if (!element || Utils.isMobile()) return;

        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
            element.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        element.addEventListener('mouseenter', () => {
            element.style.transition = 'none';
        });
    }

    // ---- Floating Animation (CSS driven, JS triggered) ----
    function startFloating(elements) {
        elements.forEach((el, i) => {
            el.style.animationDelay = `${i * 0.3}s`;
            el.classList.add('floating');
        });
    }

    return {
        init,
        observe,
        typewriter,
        animateTitle,
        animateCounter,
        revealSection,
        magneticEffect,
        startFloating
    };
})();

window.AnimationSystem = AnimationSystem;
