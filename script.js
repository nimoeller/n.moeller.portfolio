(() => {
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

  const heroScene = document.querySelector('.hero-scene');
  const heroPaper = document.getElementById('heroPaper');
  const scrollHint = document.getElementById('scrollHint');

  const boardScene = document.querySelector('.board-scene');
  const boardHeading = document.getElementById('boardHeading');
  const questMain = document.getElementById('questMain');
  const questSide = document.getElementById('questSide');
  const questContract = document.getElementById('questContract');
  const chapterMark = document.getElementById('chapterMark');

  const scribeScene = document.querySelector('.scribe-scene');
  const scribeTitle = document.getElementById('scribeTitle');
  const portraitCard = document.getElementById('portraitCard');
  const dossier = document.getElementById('dossier');

  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');

  let ticking = false;

  function sceneProgress(scene) {
    const rect = scene.getBoundingClientRect();
    const scrollable = scene.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp(-rect.top / scrollable);
  }

  function range(p, start, end) {
    return clamp((p - start) / (end - start));
  }

  function setTransform(el, x, y, scale, rotate) {
    el.style.transform =
      `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
  }

  function renderHero() {
    if (!heroScene || !heroPaper) return;

    const p = sceneProgress(heroScene);
    const retreat = easeInOut(range(p, .18, .82));

    const y = lerp(0, -105, retreat);
    const scale = lerp(1, .72, retreat);
    const rotate = lerp(-.65, .35, retreat);
    const opacity = lerp(1, .14, range(p, .66, .94));
    const blur = lerp(0, 2.5, range(p, .74, .95));

    setTransform(heroPaper, 0, y, scale, rotate);
    heroPaper.style.opacity = opacity;
    heroPaper.style.filter = `blur(${blur}px)`;

    if (scrollHint) {
      scrollHint.style.opacity = lerp(1, 0, range(p, .05, .28));
      scrollHint.style.transform = `translateX(-50%) translateY(${lerp(0, 15, p)}px)`;
    }
  }

  function renderBoard() {
    if (!boardScene) return;

    const p = sceneProgress(boardScene);

    const introP = easeOut(range(p, .02, .20));
    boardHeading.style.opacity = introP;
    boardHeading.style.transform =
      `translateX(-50%) translateY(${lerp(38, 0, introP)}px)`;

    // Main quest arrives first
    const a = easeOut(range(p, .16, .38));
    questMain.style.opacity = a;
    setTransform(
      questMain,
      lerp(-340, 0, a),
      lerp(80, 0, a),
      lerp(.92, 1, a),
      lerp(-8, -1.1, a)
    );

    // Side quest arrives from the opposite side
    const b = easeOut(range(p, .34, .56));
    questSide.style.opacity = b;
    setTransform(
      questSide,
      lerp(340, 0, b),
      lerp(35, 0, b),
      lerp(.94, 1, b),
      lerp(7, .9, b)
    );

    // Contract rises in last
    const c = easeOut(range(p, .52, .72));
    questContract.style.opacity = c;
    setTransform(
      questContract,
      lerp(220, 0, c),
      lerp(260, 0, c),
      lerp(.90, 1, c),
      lerp(5, -1.2, c)
    );

    // Whole board breathes slightly after assembly
    const settle = range(p, .74, .96);
    const cards = [
      [questMain, -1.1, -1.0],
      [questSide, .9, .75],
      [questContract, -1.2, -1.0]
    ];

    cards.forEach(([el, r0, r1]) => {
      if (!el) return;
      const current = el.style.transform;
      if (settle > 0) {
        el.style.filter = `drop-shadow(0 ${lerp(0, 10, settle)}px ${lerp(0, 15, settle)}px rgba(0,0,0,.08))`;
      }
    });

    if (chapterMark) {
      const m = easeOut(range(p, .68, .88));
      chapterMark.style.opacity = m;
      chapterMark.style.transform = `translateY(${lerp(28, 0, m)}px)`;
    }
  }

  function renderScribe() {
    if (!scribeScene) return;

    const p = sceneProgress(scribeScene);

    const titleP = easeOut(range(p, .04, .22));
    scribeTitle.style.opacity = titleP;
    scribeTitle.style.transform =
      `translateX(-50%) translateY(${lerp(28, 0, titleP)}px)`;

    const portraitP = easeOut(range(p, .22, .48));
    portraitCard.style.opacity = portraitP;
    setTransform(
      portraitCard,
      lerp(-260, 0, portraitP),
      lerp(90, 0, portraitP),
      lerp(.88, 1, portraitP),
      lerp(-8, -2.2, portraitP)
    );

    const dossierP = easeOut(range(p, .36, .68));
    dossier.style.opacity = dossierP;
    setTransform(
      dossier,
      lerp(260, 0, dossierP),
      lerp(120, 0, dossierP),
      lerp(.94, 1, dossierP),
      lerp(5, .4, dossierP)
    );

    const settle = easeInOut(range(p, .72, .96));
    if (settle > 0) {
      dossier.style.filter = `drop-shadow(0 ${lerp(0, 18, settle)}px ${lerp(0, 25, settle)}px rgba(0,0,0,.10))`;
    }
  }

  function render() {
    ticking = false;

    if (window.matchMedia('(max-width: 900px)').matches) {
      [
        heroPaper, scrollHint, boardHeading, questMain, questSide,
        questContract, chapterMark, scribeTitle, portraitCard, dossier
      ].forEach(el => {
        if (!el) return;
        el.style.transform = '';
        el.style.opacity = '';
        el.style.filter = '';
      });
      return;
    }

    renderHero();
    renderBoard();
    renderScribe();
  }

  function requestRender() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  requestRender();

  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
