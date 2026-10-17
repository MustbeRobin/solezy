(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const light = document.createElement('div');
  light.className = 'soezy-pointer-light';
  light.setAttribute('aria-hidden', 'true');
  document.body.append(light);
  let frame = 0, x = 0, y = 0;
  const card = document.querySelector('.login-card');
  function reset() {
    light.classList.remove('is-active');
    card?.style.removeProperty('--tilt-x');
    card?.style.removeProperty('--tilt-y');
  }
  document.addEventListener('pointermove', event => {
    if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
    x = event.clientX; y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      light.style.setProperty('--pointer-x', `${x}px`);
      light.style.setProperty('--pointer-y', `${y}px`);
      light.classList.add('is-active');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      card.style.setProperty('--tilt-x', inside ? `${-((y-rect.top)/rect.height-.5)*4}deg` : '0deg');
      card.style.setProperty('--tilt-y', inside ? `${((x-rect.left)/rect.width-.5)*4}deg` : '0deg');
    });
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  motion.addEventListener('change', reset);
})();
