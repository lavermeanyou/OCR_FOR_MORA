/**
 * Landing Page Scroll Animations (RALPH Cycle 2 - Improved)
 * IntersectionObserver + smooth scroll-linked transitions
 */

(function () {
    'use strict';

    // ===== Utility: IntersectionObserver factory =====
    function observe(selector, onEnter, onLeave, threshold) {
        const el = document.querySelector(selector);
        if (!el) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    onEnter && onEnter(entry.target);
                } else {
                    onLeave && onLeave(entry.target);
                }
            });
        }, { root: null, threshold: threshold || 0.3 });
        obs.observe(el);
    }

    // ===== Section 2: Stack Animation (front card cycles to back) =====
    let stackCycle = 0;
    let stackInterval = null;

    observe('.stack-container', (container) => {
        if (stackInterval) return;

        function cycleStack() {
            stackCycle++;
            const cards = container.querySelectorAll('.stack-card');
            const total = cards.length;

            cards.forEach((card, i) => {
                const shifted = (i - (stackCycle % total) + total) % total;
                card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                card.style.top = `${shifted * 15}px`;
                card.style.left = `${10 - shifted * 5}px`;
                card.style.zIndex = total - shifted;
                card.style.opacity = 1 - shifted * 0.1;
                card.style.transform = `scale(${1 - shifted * 0.03})`;
            });
        }

        cycleStack();
        stackInterval = setInterval(cycleStack, 2200);
    }, (container) => {
        if (stackInterval) {
            clearInterval(stackInterval);
            stackInterval = null;
        }
    }, 0.15);

    // ===== Section 3: Poster Spread (cards fan outward from behind) =====
    observe('.poster-container',
        (el) => el.classList.add('animated'),
        (el) => el.classList.remove('animated'),
        0.25
    );

    // ===== Section 4: Ticket Spread (cards spread upward diagonally) =====
    observe('.ticket-container',
        (el) => el.classList.add('animated'),
        (el) => el.classList.remove('animated'),
        0.25
    );

    // ===== Hero: Auto-pulse card stack =====
    const heroStack = document.querySelector('.hero-cards-stack');
    if (heroStack) {
        setInterval(() => heroStack.classList.toggle('hover-anim'), 3000);

        const style = document.createElement('style');
        style.textContent = `
            .hero-cards-stack.hover-anim .card-1 {
                transform: rotate(-6deg) translateY(-18px) translateX(-18px) !important;
                animation: none;
            }
            .hero-cards-stack.hover-anim .card-2 {
                transform: rotate(4deg) translateY(2px) translateX(18px) !important;
                animation: none;
            }
            .hero-cards-stack.hover-anim .card-3 {
                transform: rotate(1deg) translateY(32px) translateX(0) !important;
                animation: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== Staggered section-header fade in =====
    document.querySelectorAll('.section-header').forEach(header => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.animation = 'fadeInUp 0.7s ease both';
                }
            });
        }, { threshold: 0.5 });
        obs.observe(header);
    });

})();
