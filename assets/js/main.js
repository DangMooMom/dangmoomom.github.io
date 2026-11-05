// Carousel: swipe or arrow buttons, one slide at a time
document.querySelectorAll('[data-carousel]').forEach((root) => {
  const track = root.querySelector('.carousel__track');
  const slides = track.children;
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const count = root.querySelector('[data-count]');
  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  const update = () => {
    const i = index();
    count.textContent = `${i + 1} / ${slides.length}`;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  };
  const go = (d) => track.scrollTo({ left: (index() + d) * track.clientWidth, behavior: 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });
  update();
});
