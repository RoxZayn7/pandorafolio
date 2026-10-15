// Mobile menu with accessible state.
const menu = document.querySelector(".menu"), nav = document.querySelector(".nav-links");
function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
}

menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!open));
    menu.setAttribute(
        "aria-label",
        open ? "Open navigation" : "Close navigation",
    );
    nav.classList.toggle("open", !open);
    document.body.classList.toggle("menu-open", !open);
});

nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
});

// Reveal each element once when it enters the viewport.
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced && "IntersectionObserver" in window) {
    const items = document.querySelectorAll(".reveal");
    items.forEach((el) => el.classList.add("watching"));
    const reveal = new IntersectionObserver(
        (entries, observer) => entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        }),
        { threshold: 0.08, rootMargin: "0px 0px 80px" },
    );
    items.forEach((el) => reveal.observe(el));
} else
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));

// Mark the current section in the navigation.
const links = [...document.querySelectorAll(".nav-links a")];
const sectionObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) links.forEach((link) =>
        link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id,
    ),
);
    }),
    { rootMargin: "-35% 0px -55% 0px" },
);

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));


// Atokirina (woodsprites) - drifting spirit-seeds inspired by Pandora's forest.
const canvas = document.getElementById("particles"),
ctx = canvas.getContext("2d");
let particles = [];

function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(26, Math.max(10, Math.floor(innerWidth / 55)));
    particles = Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 3 + 2.5,
        vx: (Math.random() -0.5) * 0.5,
        vy: (Math.random() -0.5),
        a: Math.random() * 0.45 + 0.25,
        p: Math.random() * Math.PI * 2,
        sway: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.004,
        rot: Math.random() * Math.PI * 2,
        tendrils: 5 + Math.floor(Math.random() * 3),
    }));
}

function drawSprite (o, time, dark) {
    const pulse = 0.65 + Math.sin(time * 0.0012 + o.p) * 0.35;
    const alpha = o.a * pulse;
    const coreColor = dark ? "150,255,240" : "0,140,150";
    const glowColor = dark ? "#65f3f1" : "#00aabd";

    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot);

    // Soft halo
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, o.r * 6);
    halo.addColorStop(0, `rgba(${coreColor},${0.3 * alpha})`);
    halo.addColorStop(1, `rgba(${coreColor},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, o.r * 6, 0, Math.PI * 2);
    ctx.fill();

    // Tendrils fanning upwards like a fountain
    const n = o.tendrils;
    const spread = Math.PI * 0.95;
    ctx.lineCap = "round";
    for (let i = 0; i < n; i++) {
        const f = n === 1 ? 0.5 : i / (n - 1); // 0 = left edge, 1 = right edge
        const sway = Math.sin(time * 0.0016 + o.sway + i * 1.7) * 0.35;
        const ang = -Math.PI / 2 + (f - 0.5) * spread + sway * 0.3;
        const len = o.r * (5 - Math.abs(f - 0.5) * 2.4); // middle tendrils longest
        const sx = 0, sy = -o.r * 0.4;
        const ex = Math.cos(ang) * len;
        const ey = Math.sin(ang) * len;
        const cx = (sx + ex) / 2 + Math.cos(ang + Math.PI / 2) * len * 0.35 * (f - 0.5) * 2;
        const cy = (sy + ey) / 2 + Math.sin(ang + Math.PI / 2) * len * 0.35 * (f - 0.5) * 2;

        ctx.strokeStyle = `rgba(${coreColor},${0.5 * alpha})`;
        ctx.lineWidth = Math.max(0.6, o.r * 0.14);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();

        // Feathery side filaments along each tendril
        ctx.strokeStyle = `rgba(${coreColor},${0.35 * alpha})`;
        ctx.lineWidth = Math.max(0.5, o.r * 0.1);
        for (const t of [0.35, 0.55, 0.75]) {
            const mt = 1 - t;
            const px = mt * mt * sx + 2 * mt * t * cx + + t * t * ex;
            const py = mt * mt * sy + 2 * mt * t * cy + + t * t * ey;
            const tx = 2 * mt * (cx - sx) + 2 * t * (ex -cx);
            const ty = 2 * mt * (cy - sy) + 2 * t * (ey -cy);
            const tl = Math.hypot(tx, ty) || 1;
            const nx = -ty / tl, ny = tx / tl;
            const fl = o.r * 0.8 * (1 - t * 0.4);
            ctx.beginPath();
            ctx.moveTo(px - nx * fl, py - ny * fl);
            ctx.lineTo(px + nx * fl, py + ny * fl);
            ctx.stroke();
        }

        // Glowing tuft at the tendril tip
        const tuft = ctx.createRadialGradient(ex, ey, 0, ex, ey, o.r * 1.1);
        tuft.addColorStop(0, `rgba(255,255,255,${0.8 * alpha})`);
        tuft.addColorStop(0.5, `rgba(${coreColor},${0.5 * alpha})`);
        tuft.addColorStop(1, `rgba(${coreColor},0)`);
        ctx.fillStyle = tuft;
        ctx.beginPath();
        ctx.arc(ex, ey, o.r * 1.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Elongated seed body hanging below the fan
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    const seed = ctx.createRadialGradient(0, o.r * 0.9, 0, 0, o.r * 0.9, o.r * 1.4);
    seed.addColorStop(0, `rgba(255,255,255,${0.9 * alpha})`);
    seed.addColorStop(0.5, `rgba(${coreColor},${0.8 * alpha})`);
    seed.addColorStop(1, `rgba(${coreColor},0)`);
    ctx.fillStyle = seed;
    ctx.beginPath();
    ctx.ellipse(0, o.r * 0.9, o.r * 0.55, o.r * 1.25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function draw(time = 0) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    particles.forEach((o) => {
        o.x += o.vx + Math.sin(time * 0.0009 + o.sway) * 0.35;
        o.y += o.vy + Math.cos(time * 0.0007 + o.sway * 1.3) * 0.3;
        o.rot += o.spin;
        if (o.y < -40) { o.y = innerHeight + 40; o.x = Math.random() * innerWidth; }
        if (o.y > innerHeight + 40) { o.y = -40; o.x = Math.random() * innerWidth; }
        if (o.x < -40) o.x = innerWidth + 40;
        if (o.x > innerWidth + 40) o.x = -40;
        drawSprite(o, time, dark);
    });
    requestAnimationFrame(draw);
}

resize();
if (!reduced) draw();
addEventListener("resize", resize, { passive: true });