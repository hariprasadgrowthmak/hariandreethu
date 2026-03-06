/* ============================================
   gallery.js — Photo Gallery & Lightbox
   Birthday Wishes for Love
   ============================================ */

const Gallery = (() => {
    let photos = [];
    let currentIndex = 0;
    let lightboxEl = null;
    let carouselEl = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;

    // Demo photos - these will be replaced with actual uploaded photos
    // All real photos — sorted by timestamp from filename
    const demoPhotos = [
        { src: 'WhatsApp Image 2026-03-06 at 6.10.01 PM.jpeg', objPos: 'center center', caption: 'The moment it all began 💕', date: 'September 2023' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.05 PM.jpeg', objPos: 'center center', caption: 'Our first holiday season together ✨', date: 'December 2023' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.05 PM (1).jpeg', objPos: 'center 30%', caption: 'Smiling with you 😊', date: 'December 2023' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.07 PM.jpeg', objPos: 'center top', caption: '6 months of us 🥂', date: 'March 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.07 PM (1).jpeg', objPos: 'center 30%', caption: 'Every moment matters 💖', date: 'March 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.08 PM.jpeg', objPos: 'center top', caption: 'Summer adventures with you 🌞', date: 'June 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.08 PM (1).jpeg', objPos: 'center 30%', caption: 'Golden days together ☀️', date: 'June 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.09 PM.jpeg', objPos: 'center center', caption: '1 year anniversary ❤️', date: 'September 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.09 PM (1).jpeg', objPos: 'center top', caption: 'One whole year of you 🌹', date: 'September 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.09 PM (2).jpeg', objPos: 'center top', caption: 'My favorite person in the world 💕', date: 'September 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.09 PM (3).jpeg', objPos: 'center top', caption: 'Memories I\'ll cherish forever 🌟', date: 'October 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 11.53.16 AM.jpeg', objPos: 'center top', caption: 'Our second Christmas together 🎄', date: 'December 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 11.53.08 AM.jpeg', objPos: 'center top', caption: 'Home is wherever you are 🏡', date: 'December 2024' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.11 PM.jpeg', objPos: 'center center', caption: 'New Year, same love — better than ever 🥂', date: 'January 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.11 PM (1).jpeg', objPos: 'center center', caption: 'Every day is a gift with you 💝', date: 'January 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.11 PM (2).jpeg', objPos: 'center center', caption: 'Your smile is my whole world 😍', date: 'March 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.12 PM.jpeg', objPos: 'center 30%', caption: '2 years of us 🌹', date: 'September 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.12 PM (1).jpeg', objPos: 'center 30%', caption: 'Two years and still falling for you 💞', date: 'September 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.12 PM (2).jpeg', objPos: 'center top', caption: 'Side by side, always ✨', date: 'October 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.13 PM.jpeg', objPos: 'center 30%', caption: 'New Year\'s Eve — new chapter begins 🥂', date: 'December 2025' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.13 PM (1).jpeg', objPos: 'center 30%', caption: 'Ringing in 2026 together 🎆', date: 'January 2026' },
        { src: 'WhatsApp Image 2026-03-06 at 6.55.15 PM.jpeg', objPos: 'center 30%', caption: 'Today & always — 2 years 6 months 💝', date: 'March 2026' },
    ];

    // Generate gradient placeholder images
    function generatePlaceholder(index) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const gradients = [
            ['#FF6B9D', '#C44569'],
            ['#F8B500', '#FF6B6B'],
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140'],
            ['#a18cd1', '#fbc2eb']
        ];

        const [c1, c2] = gradients[index % gradients.length];
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add decorative elements
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const r = Math.random() * 80 + 20;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Heart in center
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '80px serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', 0, 30);
        ctx.restore();

        // Photo number
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '18px Lato, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Memory ${index + 1}`, canvas.width / 2, canvas.height - 30);

        return canvas.toDataURL('image/jpeg', 0.85);
    }

    function init() {
        // Use real photo src if provided, otherwise generate a placeholder
        photos = demoPhotos.map((photo, i) => ({
            ...photo,
            src: photo.src ? photo.src : generatePlaceholder(i)
        }));

        renderCarousel();
        createLightbox();
        setupTouchEvents();
    }

    function renderCarousel() {
        carouselEl = Utils.$('.gallery-carousel');
        if (!carouselEl) return;

        carouselEl.innerHTML = '';

        photos.forEach((photo, index) => {
            const card = document.createElement('div');
            card.className = 'polaroid-card animate-on-scroll';
            card.dataset.animation = 'scaleIn';
            card.dataset.delay = `${index * 150}`;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `View photo: ${photo.caption}`);

            card.innerHTML = `
        <div class="polaroid-inner">
          <div class="polaroid-image-wrap">
            <img src="${photo.src}" alt="${photo.caption}" loading="lazy" style="object-position: ${photo.objPos || 'center center'}" />
          </div>
          <div class="polaroid-caption">
            <p>${photo.caption}</p>
            <span class="polaroid-date">${photo.date}</span>
          </div>
        </div>
      `;

            card.addEventListener('click', () => openLightbox(index));
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') openLightbox(index);
            });

            carouselEl.appendChild(card);
        });

        // Setup observer for cards
        Utils.$$('.polaroid-card').forEach(card => {
            AnimationSystem.observe(card);
        });
    }

    function createLightbox() {
        lightboxEl = document.createElement('div');
        lightboxEl.className = 'lightbox';
        lightboxEl.id = 'lightbox';
        lightboxEl.setAttribute('role', 'dialog');
        lightboxEl.setAttribute('aria-label', 'Photo lightbox');
        lightboxEl.innerHTML = `
      <div class="lightbox-overlay" id="lightbox-overlay"></div>
      <div class="lightbox-content">
        <button class="lightbox-close" id="lightbox-close" aria-label="Close lightbox">&times;</button>
        <button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Previous photo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="lightbox-image-wrap">
          <img class="lightbox-image" id="lightbox-image" alt="" />
        </div>
        <button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Next photo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div class="lightbox-caption" id="lightbox-caption"></div>
        <div class="lightbox-dots" id="lightbox-dots"></div>
      </div>
    `;

        document.body.appendChild(lightboxEl);

        // Event listeners
        Utils.$('#lightbox-close').addEventListener('click', closeLightbox);
        Utils.$('#lightbox-overlay').addEventListener('click', closeLightbox);
        Utils.$('#lightbox-prev').addEventListener('click', () => navigate(-1));
        Utils.$('#lightbox-next').addEventListener('click', () => navigate(1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightboxEl.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        // Render dots
        renderDots();
    }

    function renderDots() {
        const dotsContainer = Utils.$('#lightbox-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';

        photos.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `lightbox-dot${i === currentIndex ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
    }

    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightboxEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigate(dir) {
        currentIndex = (currentIndex + dir + photos.length) % photos.length;
        updateLightbox();
    }

    function goTo(index) {
        currentIndex = index;
        updateLightbox();
    }

    function updateLightbox() {
        const photo = photos[currentIndex];
        const img = Utils.$('#lightbox-image');
        const caption = Utils.$('#lightbox-caption');

        // Fade transition
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = photo.src;
            img.alt = photo.caption;
            caption.innerHTML = `<p>${photo.caption}</p><span>${photo.date}</span>`;
            img.style.opacity = '1';
        }, 200);

        // Update dots
        Utils.$$('.lightbox-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // Touch/Swipe for lightbox
    function setupTouchEvents() {
        document.addEventListener('touchstart', (e) => {
            if (!lightboxEl || !lightboxEl.classList.contains('active')) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isDragging = true;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!isDragging || !lightboxEl.classList.contains('active')) return;
            isDragging = false;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) navigate(-1);
                else navigate(1);
            }
        }, { passive: true });
    }

    function getPhotos() {
        return photos;
    }

    function setPhotos(newPhotos) {
        photos = newPhotos.map((photo, i) => ({
            ...photo,
            src: photo.src || generatePlaceholder(i)
        }));
        renderCarousel();
        renderDots();
    }

    return {
        init,
        openLightbox,
        closeLightbox,
        getPhotos,
        setPhotos
    };
})();

window.Gallery = Gallery;
