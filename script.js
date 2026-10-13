const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in-view');
    }
  });
}, {
  threshold: 0.18
});

revealItems.forEach(item => revealObserver.observe(item));

const mobileToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.nav');

if (mobileToggle && nav) {
  mobileToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const heroSheet = document.querySelector('.hero-sheet');
const heroStage = document.querySelector('.hero-stage');

const onScroll = () => {
  if (!heroSheet || !heroStage || window.matchMedia('(max-width: 920px)').matches) return;

  const rect = heroStage.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, -rect.top / (heroStage.offsetHeight - window.innerHeight)));
  const translate = progress * -24;
  const rotate = -0.6 + progress * 0.45;
  heroSheet.style.transform = `translateY(${translate}px) rotate(${rotate}deg)`;
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
