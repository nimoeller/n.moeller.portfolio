// Small optional interaction: highlight the navigation item of the visible section.
const links = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('section[id]')];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    links.forEach(link => {
      link.style.color = link.getAttribute('href') === `#${entry.target.id}`
        ? 'var(--accent)'
        : '';
    });
  });
}, { threshold: 0.35 });

sections.forEach(section => observer.observe(section));
