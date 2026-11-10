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
  { threshold: 0.12 }
);

revealItems.forEach(item => observer.observe(item));

// Show clean placeholders instead of broken-image icons until screenshots/flowcharts are added.
document.querySelectorAll('.media-frame img').forEach(img => {
  const frame = img.closest('.media-frame');

  const markMissing = () => frame?.classList.add('is-missing');
  const markPresent = () => frame?.classList.remove('is-missing');

  img.addEventListener('error', markMissing);
  img.addEventListener('load', markPresent);

  if (img.complete && img.naturalWidth === 0) markMissing();
});


// In-page magnifier for the pacing graph and large quest flowcharts.
// The source SVG is cloned, preserving its original text, curves and colors.
const diagramModal = document.getElementById('diagramModal');
const diagramCanvas = document.getElementById('diagramModalCanvas');
const diagramViewport = document.getElementById('diagramModalViewport');
const zoomInButton = document.getElementById('diagramZoomIn');
const zoomOutButton = document.getElementById('diagramZoomOut');
const diagramZoomSteps = [0.7, 0.85, 1, 1.25, 1.5, 2];
let diagramZoomIndex = 2;
let diagramBaseWidth = 940;
let lastDiagramTrigger = null;

function setDiagramZoom(index) {
  diagramZoomIndex = Math.max(0, Math.min(diagramZoomSteps.length - 1, index));
  diagramCanvas.style.setProperty('--diagram-full-width',
    `${Math.round(diagramBaseWidth * diagramZoomSteps[diagramZoomIndex])}px`);
  zoomOutButton.disabled = diagramZoomIndex === 0;
  zoomInButton.disabled = diagramZoomIndex === diagramZoomSteps.length - 1;
}

if (diagramModal && typeof diagramModal.showModal === 'function') {
  document.querySelectorAll('.diagram-open').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const source = trigger.querySelector('svg, img');
      if (!source) return;
      diagramCanvas.replaceChildren(source.cloneNode(true));
      diagramCanvas.dataset.diagramKind = source.tagName.toLowerCase();
      diagramBaseWidth = source.tagName.toLowerCase() === 'svg' ? 940 : 1000;
      document.getElementById('diagramModalTitle').textContent = trigger.dataset.diagramTitle || 'Diagram';
      lastDiagramTrigger = trigger;
      setDiagramZoom(2);
      diagramModal.showModal();
      diagramViewport.scrollLeft = 0;
      diagramViewport.scrollTop = 0;
      document.getElementById('diagramModalClose').focus();
    });
  });
  zoomInButton.addEventListener('click', () => setDiagramZoom(diagramZoomIndex + 1));
  zoomOutButton.addEventListener('click', () => setDiagramZoom(diagramZoomIndex - 1));
  document.getElementById('diagramModalClose').addEventListener('click', () => diagramModal.close());
  diagramModal.addEventListener('click', event => {
    if (event.target === diagramModal) diagramModal.close();
  });
  diagramModal.addEventListener('close', () => lastDiagramTrigger?.focus({ preventScroll: true }));
}
