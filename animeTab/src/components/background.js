// Background now relies on themed CSS. We add an additional dynamic subtle gradient layer
// without external image calls to keep performance high and avoid layout shift.

export async function initBackground() {
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden','true');
  layer.style.position='fixed';
  layer.style.inset='0';
  layer.style.pointerEvents='none';
  layer.style.background='radial-gradient(circle at 70% 65%, rgba(61,220,132,0.12), transparent 60%), radial-gradient(circle at 25% 35%, rgba(61,220,132,0.08), transparent 55%)';
  layer.style.opacity='0';
  layer.style.transition='opacity 1.2s ease';
  document.body.appendChild(layer);
  requestAnimationFrame(()=>{ layer.style.opacity='1'; });
}
