const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.10 }
);

revealItems.forEach(item => observer.observe(item));

// Keep diagram slots clean until the yEd SVG exports are added.
document.querySelectorAll('.media-frame img').forEach(img => {
  const frame = img.closest('.media-frame');
  const markMissing = () => frame?.classList.add('is-missing');
  const markPresent = () => frame?.classList.remove('is-missing');

  img.addEventListener('error', markMissing);
  img.addEventListener('load', markPresent);

  if (img.complete && img.naturalWidth === 0) markMissing();
});
