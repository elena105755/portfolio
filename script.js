(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const sections = Array.from(document.querySelectorAll(".hero, .section"));
  sections.forEach((el) => el.classList.add("reveal"));
  const dataFlowSection = document.querySelector(".data-flow-section");
  const storySteps = Array.from(document.querySelectorAll(".story-step"));
  const layerCards = Array.from(document.querySelectorAll(".layer-card"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  sections.forEach((el) => observer.observe(el));

  let flowActive = false;
  if (dataFlowSection) {
    const flowObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          flowActive = entry.isIntersecting;
        });
      },
      { threshold: 0.35 }
    );
    flowObserver.observe(dataFlowSection);
  }

  const packetEls = Array.from(document.querySelectorAll(".packet"));
  const graphPaths = [
    "M18,20 C30,24 40,32 50,42 C60,34 69,32 82,40",
    "M18,20 C30,24 40,32 50,42 C54,50 56,58 57,66 C65,68 75,56 82,40",
    "M50,42 C54,50 56,58 57,66 C65,68 75,56 82,40",
  ];
  const routes = [
    graphPaths[0],
    graphPaths[1],
    graphPaths[2],
  ];
  const svgNs = "http://www.w3.org/2000/svg";
  const routeGeometry = routes.map((d) => {
    const path = document.createElementNS(svgNs, "path");
    path.setAttribute("d", d);
    return {
      path,
      len: path.getTotalLength(),
    };
  });
  const packetState = packetEls.map((_, i) => ({
    route: routeGeometry[i % routeGeometry.length],
    t: i * 0.22,
    speed: 0.0028 + i * 0.0007,
  }));

  if (prefersReducedMotion) {
    return;
  }

  const canvas = document.getElementById("data-canvas");
  const ctx = canvas.getContext("2d");
  const particles = [];
  const PARTICLE_COUNT = 60;
  const LINK_DISTANCE = 110;
  let width = 0;
  let height = 0;
  let scrollRatio = 0;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2 + 1.2,
    };
  }

  function buildParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      particles.push(createParticle());
    }
  }

  function updateScrollRatio() {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    scrollRatio = window.scrollY / maxScroll;
  }

  function pointOnPath(route, t) {
    const p = route.path.getPointAtLength((t % 1) * route.len);
    return [p.x, p.y];
  }

  function animatePackets() {
    if (!flowActive) return;
    packetState.forEach((state, i) => {
      state.t = (state.t + state.speed) % 1;
      const [x, y] = pointOnPath(state.route, state.t);
      const node = packetEls[i];
      node.style.left = `${x}%`;
      node.style.top = `${y}%`;
    });
  }

  if (storySteps.length) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const layer = entry.target.dataset.layer;
          storySteps.forEach((s) => s.classList.toggle("is-active", s === entry.target));
          layerCards.forEach((l) => l.classList.toggle("is-focus", l.dataset.layer === layer));
        });
      },
      { threshold: 0.6 }
    );
    storySteps.forEach((step) => stepObserver.observe(step));
  }

  function tick() {
    const waveOffset = scrollRatio * Math.PI * 3;
    ctx.clearRect(0, 0, width, height);
    animatePackets();

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy + Math.sin((p.x + waveOffset * 130) * 0.004) * 0.03;

      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;
      if (p.y < -8) p.y = height + 8;
      if (p.y > height + 8) p.y = -8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(75, 125, 45, 0.55)";
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);

        if (dist < LINK_DISTANCE) {
          const alpha = (1 - dist / LINK_DISTANCE) * (0.12 + scrollRatio * 0.14);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(53, 91, 31, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    window.requestAnimationFrame(tick);
  }

  resizeCanvas();
  buildParticles();
  updateScrollRatio();
  tick();

  window.addEventListener("resize", () => {
    resizeCanvas();
    buildParticles();
  });

  window.addEventListener("scroll", updateScrollRatio, { passive: true });
})();
