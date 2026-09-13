/* PLASYCLE – animations.js */
/* Scroll reveals, counters, loading screen, interactions */

/* ============ LOADING SCREEN ============ */
function initLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if (!screen) return;
  const barFill = screen.querySelector(".loading-bar-fill");

  let progress = 0;
  const interval = setInterval(() => {
    progress += 15;
    if (barFill) barFill.style.width = Math.min(progress, 100) + "%";
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        screen.classList.add("hidden");
        setTimeout(() => screen.remove(), 600);
      }, 400);
    }
  }, 150);
}

/* ============ SCROLL REVEALS ============ */
function initScrollReveals() {
  const elements = document.querySelectorAll(".reveal, .reveal-scale, .reveal-left, .reveal-right");
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach((el) => observer.observe(el));
}

/* ============ NUMBER COUNTERS ============ */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target.toFixed(decimals) + suffix;
  }

  requestAnimationFrame(update);
}

/* ============ SCROLL PROGRESS (top bar) ============ */
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + "%";
  });
}

/* ============ SMOOTH ANCHORS ============ */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ============ INIT ============ */
document.addEventListener("DOMContentLoaded", () => {
  initLoadingScreen();
  initScrollReveals();
  initCounters();
  initScrollProgress();
  initSmoothAnchors();
});