(() => {
  document.documentElement.classList.add('js-enabled');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = $('.hero-scene');
  const heroPaper = $('#heroPaper');
  const heroPin = $('#heroPin');
  const heroBackboard = $('#heroBackboard');
  const scrollHint = $('#scrollHint');
  const nav = $('#nav-panel');
  const menuButton = $('.mobile-menu-toggle');

  // Hero intro: the pin lifts first, the parchment tilts forward, then a gust
  // carries it away. The timber behind it is revealed progressively.
  // The timeline is scroll-driven, so reversing the scroll reverses the scene.
  const smoothstep = (a, b, value) => {
    const t = clamp((value - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  let frameRequested = false;
  function updateHero() {
    frameRequested = false;
    if (!hero || !heroPaper) return;
    if (reduceMotion || window.innerWidth <= 900) return;

    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const p = clamp(-hero.getBoundingClientRect().top / travel);
    const unpin = smoothstep(.12, .29, p);
    const tilt = smoothstep(.26, .51, p);
    const gust = smoothstep(.48, .92, p);
    const disappear = smoothstep(.79, .96, p);

    const x = gust * (window.innerWidth * .80 + 230);
    const y = -tilt * 32 - gust * (window.innerHeight * 1.05 + 350);
    const angle = -.4 - tilt * 5 + gust * 37;
    const scale = 1 - tilt * .035 - gust * .22;
    heroPaper.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${angle.toFixed(2)}deg) rotateX(${(tilt * 5).toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    heroPaper.style.opacity = String(1 - disappear);
    heroPaper.style.setProperty('--paper-lift', tilt.toFixed(3));

    if (heroPin) {
      heroPin.style.transform = `translate(-50%,${(-56 * unpin).toFixed(1)}px) rotate(${(-36 * unpin).toFixed(1)}deg) scale(${(1 - .10 * unpin).toFixed(3)})`;
      heroPin.style.opacity = String(1 - smoothstep(.21, .32, p));
    }
    if (heroBackboard) heroBackboard.style.opacity = String(.04 + .80 * smoothstep(.27, .61, p));
    if (scrollHint) scrollHint.style.opacity = String(1 - smoothstep(.035, .19, p));
  }
  function requestHeroFrame() {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateHero);
    }
  }
  window.addEventListener('scroll', requestHeroFrame, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900 && heroPaper) {
      heroPaper.style.transform = '';
      heroPaper.style.opacity = '';
      heroPaper.style.removeProperty('--paper-lift');
      if (heroPin) {
        heroPin.style.transform = '';
        heroPin.style.opacity = '';
      }
      if (heroBackboard) heroBackboard.style.opacity = '';
      if (scrollHint) scrollHint.style.opacity = '';
    } else requestHeroFrame();
  });
  requestHeroFrame();

  // Moving light, not a moving card. The paper stays readable and in place.
  if (hero && heroPaper && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let lightFrame = false;
    let lightX = 50, lightY = 20;
    hero.addEventListener('pointermove', event => {
      const r = heroPaper.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      lightX = clamp((event.clientX - r.left) / r.width) * 100;
      lightY = clamp((event.clientY - r.top) / r.height) * 100;
      if (lightFrame) return;
      lightFrame = true;
      requestAnimationFrame(() => {
        lightFrame = false;
        heroPaper.style.setProperty('--light-x', `${lightX.toFixed(1)}%`);
        heroPaper.style.setProperty('--light-y', `${lightY.toFixed(1)}%`);
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      heroPaper.style.setProperty('--light-x', '50%');
      heroPaper.style.setProperty('--light-y', '20%');
    });
  }

  // Reversible board motion. Papers enter while the board is on-screen,
  // then fly away once the board leaves the viewport in either direction.
  const board = $('#projectNoticeBoard');
  const studentBoard = $('#studentNoticeBoard');
  const boards = [board, studentBoard].filter(Boolean);
  let navigationBoardPending = null;
  let boardFrameQueued = false;

  function updateBoards() {
    boardFrameQueued = false;
    if (reduceMotion) {
      boards.forEach(el => el.classList.add('is-revealed'));
      return;
    }
    const h = window.innerHeight;
    boards.forEach(el => {
      if (navigationBoardPending === el) return;
      const r = el.getBoundingClientRect();
      const showing = r.top < h * .84 && r.bottom > h * .60;
      // Past the bottom of the viewport: next entry should come back from the sides.
      const leavingDown = r.bottom <= h * .60;
      el.classList.toggle('is-departing', leavingDown);
      el.classList.toggle('is-revealed', showing);
    });
  }
  function requestBoardFrame() {
    if (!boardFrameQueued) {
      boardFrameQueued = true;
      requestAnimationFrame(updateBoards);
    }
  }
  window.addEventListener('scroll', requestBoardFrame, {passive: true});
  window.addEventListener('resize', requestBoardFrame);
  requestBoardFrame();

  // Reveal other sections normally. Navigation clicks can replay the reveals.
  const reveals = $$('.reveal-on-scroll');
  let navigationRevealTarget = null;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && (!navigationRevealTarget || !navigationRevealTarget.contains(entry.target))) {
          entry.target.classList.add('in-view');
        }
      }
    }, { threshold: .08, rootMargin: '0px 0px -28px 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }

  // Show images if present, otherwise leave intentional placeholder styling.
  $$('.project-media, .portrait-media').forEach(media => {
    const img = $('img', media);
    if (!img) return;
    const update = () => media.classList.toggle('has-image', img.complete && img.naturalWidth > 0);
    img.addEventListener('load', update);
    img.addEventListener('error', update);
    update();
  });

  // The student showreel is optional until the editor supplies the video file.
  const showreel = $('#studentShowreel');
  const showreelMedia = $('#showreelMedia');
  if (showreel && showreelMedia) {
    const ready = () => showreelMedia.classList.add('has-video');
    const missing = () => showreelMedia.classList.remove('has-video');
    showreel.addEventListener('loadedmetadata', ready);
    showreel.addEventListener('error', missing);
    const source = $('source', showreel);
    source?.addEventListener('error', missing);
    if (showreel.readyState >= 1) ready();
  }

  // Navigation includes a replay of the arrival animation, not just a scroll jump.
  const navLinks = $$('#nav-panel a[href^="#"]');
  const targetIds = navLinks.map(link => link.getAttribute('href').slice(1));
  function updateActiveLink() {
    const marker = window.scrollY + 120 + window.innerHeight * .20;
    let active = 'hero';
    for (const id of targetIds) {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= marker) active = id;
    }
    navLinks.forEach(link => {
      const on = link.getAttribute('href') === `#${active}`;
      link.classList.toggle('active', on);
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();

  function closeMenu() {
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
  menuButton?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open') || false;
    menuButton.setAttribute('aria-expanded', String(open));
  });

  let navigationToken = 0;
  function navigateToSection(id) {
    const section = document.getElementById(id);
    if (!section) return;
    const token = ++navigationToken;
    const sectionBoard = id === 'quest-board' ? board : id === 'earlier-work' ? studentBoard : null;
    const targets = $$('.reveal-on-scroll', section);

    if (!reduceMotion) {
      if (sectionBoard) {
        navigationBoardPending = sectionBoard;
        sectionBoard.classList.remove('is-departing', 'is-revealed');
      } else {
        navigationBoardPending = null;
        navigationRevealTarget = section;
        targets.forEach(el => el.classList.remove('in-view'));
      }
    }

    const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY -
      (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 78) - 18);
    window.scrollTo({top, behavior: reduceMotion ? 'instant' : 'smooth'});

    function onArrival() {
      if (token !== navigationToken) return;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token !== navigationToken) return;
        if (sectionBoard) {
          // Replayed even when clicking the same link twice.
          sectionBoard.classList.add('is-revealed');
          navigationBoardPending = null;
        }
        targets.forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i * 90, 300)}ms`;
          el.classList.add('in-view');
        });
        navigationRevealTarget = null;
      }));
    }

    if (reduceMotion) {
      onArrival();
    } else {
      let frames = 0;
      function checkScroll() {
        if (token !== navigationToken) return;
        if (Math.abs(window.scrollY - top) < 20 || frames++ > 120) onArrival();
        else requestAnimationFrame(checkScroll);
      }
      requestAnimationFrame(checkScroll);
    }
    if (window.history?.replaceState) history.replaceState(null, '', `#${id}`);
  }

  $$('a[href^="#"]').forEach(link => link.addEventListener('click', e => {
    const id = link.getAttribute('href')?.slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    closeMenu();
    navigateToSection(id === 'top' ? 'hero' : id);
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // Natural floating dust: independently phased motes, not repeated texture tiles.
  // The motion uses slow overlapping oscillations and slight drift; each particle
  // has its own size, speed, direction and lifetime. Pauses when hidden.
  const dustCanvas = $('#dustField');
  if (dustCanvas && !reduceMotion) {
    const ctx = dustCanvas.getContext('2d', {alpha: true});
    if (ctx) {
      const rand = (min, max) => min + Math.random() * (max - min);
      let dustW = 0, dustH = 0, lastTime = 0, dustFrame = null;
      let visible = !document.hidden;
      const particles = Array.from({length: window.innerWidth < 700 ? 21 : 39}, () => ({
        x: Math.random(), y: Math.random(),
        seed: rand(0, Math.PI * 2),
        radius: rand(.5, 1.6),
        speed: rand(.0000010, .0000030),
        sway: rand(.006, .028),
        flicker: rand(.13, .38),
        opacity: rand(.10, .31),
        drift: rand(-.000002, .000002),
      }));
      function resizeDust() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        dustW = window.innerWidth;
        dustH = window.innerHeight;
        dustCanvas.width = Math.round(dustW * dpr);
        dustCanvas.height = Math.round(dustH * dpr);
        dustCanvas.style.width = `${dustW}px`;
        dustCanvas.style.height = `${dustH}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function paintDust(t) {
        dustFrame = null;
        if (!visible) return;
        // Approx. 30 FPS. Avoid making the background a main-thread bottleneck.
        if (t - lastTime < 30) {
          dustFrame = requestAnimationFrame(paintDust);
          return;
        }
        const dt = Math.min(70, t - lastTime || 33);
        lastTime = t;
        ctx.clearRect(0, 0, dustW, dustH);
        for (const p of particles) {
          p.y -= p.speed * dt;
          p.x += p.drift * dt;
          if (p.y < -.06) { p.y = 1.06; p.x = Math.random(); }
          if (p.x < -.06) p.x = 1.06;
          if (p.x > 1.06) p.x = -.06;
          const swayX = Math.sin(t * .00028 + p.seed) * p.sway
            + Math.sin(t * .000091 + p.seed * 3.1) * p.sway * .35;
          const swayY = Math.sin(t * .00018 + p.seed * 1.7) * p.sway * .23;
          const alpha = p.opacity * (.82 + p.flicker * Math.sin(t * .00055 + p.seed));
          ctx.fillStyle = `rgba(238,197,138,${Math.max(.015,alpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc((p.x + swayX) * dustW, (p.y + swayY) * dustH, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        dustFrame = requestAnimationFrame(paintDust);
      }
      window.addEventListener('resize', resizeDust, {passive: true});
      document.addEventListener('visibilitychange', () => {
        visible = !document.hidden;
        if (!visible && dustFrame !== null) {
          cancelAnimationFrame(dustFrame);
          dustFrame = null;
        } else if (visible && dustFrame === null) {
          lastTime = 0;
          dustFrame = requestAnimationFrame(paintDust);
        }
      });
      resizeDust();
      dustFrame = requestAnimationFrame(paintDust);
    }
  }
})();
