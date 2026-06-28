(function () {
  "use strict";

  /* ── Mobile nav ── */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const navLinks = siteNav.querySelectorAll("a");

  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ── Active nav on scroll ── */
  const sections = [...navLinks]
    .map((link) => {
      const href = link.getAttribute("href");
      return href.startsWith("#") ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ── Scroll reveal ── */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ── Screenshot carousel ── */
  const track = document.getElementById("carousel-track");
  const slides = track.querySelectorAll(".carousel-slide");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  const dotsContainer = document.getElementById("carousel-dots");

  let currentIndex = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to screenshot ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".carousel-dot");

  function getSlideStep() {
    const slide = slides[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return slide.offsetWidth + gap;
  }

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    const offset = currentIndex * getSlideStep();
    track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  window.addEventListener("resize", () => goTo(currentIndex));

  /* Touch swipe for carousel */
  let touchStartX = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(currentIndex + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });
})();


/* ── GA4 CTA + Outbound Click Tracker ── */
(function () {
  'use strict';

  function track(eventName, props) {
    try {
      if (window.gtag) window.gtag('event', eventName, props || {});
    } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.href || '';

    if (href.includes('apps.apple.com') || href.includes('itunes.apple.com')) {
      track('CTA Click', {
        page_hostname: window.location.hostname,
        cta: link.getAttribute('data-cta') || 'app_store',
        link_url: href,
        link_text: link.textContent.trim().substring(0, 50),
        page_path: window.location.pathname,
        page_url: window.location.href
      });
    }

    if (link.hostname && link.hostname !== window.location.hostname) {
      track('Outbound Link: Click', {
        link_url: href,
        link_domain: link.hostname,
        page_path: window.location.pathname,
        page_url: window.location.href
      });
    }
  });

  var scrollMarks = [25, 50, 75, 100];
  var scrollFired = {};
  var scrollTimer;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var percent = Math.round((scrollTop / docHeight) * 100);
      scrollMarks.forEach(function (mark) {
        if (percent >= mark && !scrollFired[mark]) {
          scrollFired[mark] = true;
          track('scroll_depth', { percent: mark });
        }
      });
    }, 150);
  }, { passive: true });
})();
