// =====================================================
// TechFlow Solutions — Revamped Interactive Behaviors
// =====================================================

(() => {
    'use strict';

    // -------- Helpers --------
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Add3M button initial state: start hidden/offset so it animates with the rest of the UI
    const add3mBtn = document.querySelector('.add3m-button');
    if (add3mBtn) {
        add3mBtn.classList.add('initial');
        // Ensure keyboard activation works consistently
        add3mBtn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                add3mBtn.click();
            }
        });
    }

    // When button is part of header, CSS handles centering (absolute top:50%);
    // no runtime alignment is required.

    // -------- Mobile Navigation --------
    const hamburger = $('#hamburgerBtn');
    const nav = $('#primaryNav');
    const navLinks = $$('.nav-link');

    const closeMenu = () => {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        const isOpen = nav.classList.toggle('active');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    };

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !hamburger.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu on resize past breakpoint
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
            closeMenu();
        }
    });

    // -------- Smooth scrolling with offset --------
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const headerHeight = $('#siteHeader')?.offsetHeight || 70;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

            window.scrollTo({
                top,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    });

    // -------- Header scroll effect --------
    const header = $('#siteHeader');
    let lastScroll = 0;
    let ticking = false;

    const updateHeader = () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 50);
        lastScroll = y;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    // -------- Scroll Progress Bar --------
    const scrollProgress = $('#scrollProgress');
    const updateProgress = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // -------- Scroll to Top Button --------
    const scrollToTopBtn = $('#scrollToTop');
    const updateScrollToTop = () => {
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 400);
    };

    window.addEventListener('scroll', updateScrollToTop, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });

    // -------- Scrollspy — Active Nav Link --------
    const sections = $$('section[id]');
    const setActiveLink = () => {
        const scrollPos = window.scrollY + 120;
        let currentId = sections[0]?.id;

        for (const section of sections) {
            if (section.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + currentId);
        });
    };

    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();

    // -------- IntersectionObserver: Reveal on scroll --------
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        $$('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            revealObserver.observe(el);
        });

        // Section header animated underline
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    headerObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        $$('.section-header, .about-text').forEach(el => headerObserver.observe(el));
    } else {
        $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .section-header, .about-text').forEach(el => {
            el.classList.add('visible');
        });
    }

    // -------- Animated Counters --------
    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;
        const duration = 1800;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toString();
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toString();
            }
        };

        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        $$('.counter').forEach(c => counterObserver.observe(c));
    } else {
        $$('.counter').forEach(c => {
            c.textContent = c.dataset.target;
        });
    }

    // -------- Portfolio 3D Tilt --------
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        $$('[data-tilt]').forEach(card => {
            const img = card.querySelector('img');
            let rafId = null;

            const handleMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateX = (0.5 - y) * 10;
                const rotateY = (x - 0.5) * 10;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.transform =
                        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
                    if (img) {
                        img.style.transform = 'scale(1.12) translate(' + (x - 0.5) * 12 + 'px, ' + (y - 0.5) * 12 + 'px)';
                    }
                });
            };

            const reset = () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = '';
                if (img) img.style.transform = '';
            };

            card.addEventListener('mousemove', handleMove);
            card.addEventListener('mouseleave', reset);
        });
    }

    // -------- Button Ripple --------
    $$('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            btn.style.setProperty('--x', x + 'px');
            btn.style.setProperty('--y', y + 'px');

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (x - size / 2) + 'px';
            ripple.style.top = (y - size / 2) + 'px';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 700);
        });
    });

    // -------- Cursor Glow (desktop only) --------
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const glow = $('#cursorGlow');
        let glowX = window.innerWidth / 2;
        let glowY = window.innerHeight / 2;
        let targetX = glowX;
        let targetY = glowY;
        let glowTicking = false;

        const renderGlow = () => {
            glowX += (targetX - glowX) * 0.18;
            glowY += (targetY - glowY) * 0.18;
            glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
            glowTicking = (Math.abs(targetX - glowX) > 0.1 || Math.abs(targetY - glowY) > 0.1);
            if (glowTicking) requestAnimationFrame(renderGlow);
        };

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!glowTicking) {
                glowTicking = true;
                requestAnimationFrame(renderGlow);
            }
        }, { passive: true });
    }

    // -------- Contact form --------
    const contactForm = $('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(contactForm).entries());
            console.log('Form submitted:', data);

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span><i class="fas fa-check"></i> Sent!</span>';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = '';
            }, 400);
        });
    }

    // -------- Initial state on load --------
    updateHeader();
    updateScrollToTop();
    // Reveal the Add3M button in-line with other initial animations
    if (add3mBtn) {
        if (prefersReducedMotion) {
            add3mBtn.classList.remove('initial');
        } else {
            // match header animation timing (0.8s)
            window.setTimeout(() => {
                add3mBtn.classList.remove('initial');
            }, 820);
        }
    }
})();
