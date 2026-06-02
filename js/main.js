document.addEventListener('DOMContentLoaded', () => {

    // ── Globe Animation ──
    const canvas = document.getElementById('globeCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let points = [];
        let rotation = 0;
        let animId;

        function resize() {
            const container = canvas.parentElement;
            const size = Math.min(container.offsetWidth, 420);
            canvas.width = size * window.devicePixelRatio;
            canvas.height = size * window.devicePixelRatio;
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        function generatePoints(count) {
            points = [];
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < count; i++) {
                const y = 1 - (i / (count - 1)) * 2;
                const radius = Math.sqrt(1 - y * y);
                const theta = goldenAngle * i;
                points.push({
                    x: Math.cos(theta) * radius,
                    y: y,
                    z: Math.sin(theta) * radius
                });
            }
        }

        function draw() {
            const w = canvas.width / window.devicePixelRatio;
            const h = canvas.height / window.devicePixelRatio;
            const cx = w / 2;
            const cy = h / 2;
            const globeRadius = Math.min(w, h) * 0.38;

            ctx.clearRect(0, 0, w, h);

            const gradient = ctx.createRadialGradient(cx, cy + globeRadius * 0.3, 0, cx, cy + globeRadius * 0.3, globeRadius * 1.4);
            gradient.addColorStop(0, 'rgba(212, 160, 23, 0.08)');
            gradient.addColorStop(0.5, 'rgba(212, 160, 23, 0.03)');
            gradient.addColorStop(1, 'rgba(212, 160, 23, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            const cosR = Math.cos(rotation);
            const sinR = Math.sin(rotation);

            const projected = points.map(p => {
                const rx = p.x * cosR - p.z * sinR;
                const rz = p.x * sinR + p.z * cosR;
                return { x: rx * globeRadius + cx, y: p.y * globeRadius + cy, z: rz };
            });

            projected.sort((a, b) => a.z - b.z);

            for (let i = 0; i < projected.length; i++) {
                const p = projected[i];
                const depth = (p.z + 1) / 2;
                const alpha = depth * 0.85 + 0.15;
                const size = depth * 1.8 + 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 160, 23, ${alpha})`;
                ctx.fill();
            }
        }

        function animate() {
            rotation += 0.003;
            draw();
            animId = requestAnimationFrame(animate);
        }

        resize();
        generatePoints(700);
        animate();
        window.addEventListener('resize', () => {
            cancelAnimationFrame(animId);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            resize();
            animate();
        });
    }

    // ── Navbar scroll ──
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ── Mobile nav toggle ──
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // ── Scroll reveal ──
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });

    // ── Count-up animation ──
    const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                if (isNaN(target)) return;
                const duration = 1500;
                const start = performance.now();

                function tick(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(target * eased);
                    if (progress < 1) requestAnimationFrame(tick);
                }

                requestAnimationFrame(tick);
                countObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.count-up').forEach(el => countObserver.observe(el));

    // ── Smooth scroll ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
