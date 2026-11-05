document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nav: hairline once scrolled, hides on scroll down and returns on scroll up
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);
    nav.classList.toggle('is-hidden', y > 200 && y > lastY && !nav.contains(document.activeElement));
    lastY = y;
  };
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();
})();

// Hero: split the headline into words so they rise in one after another
(() => {
  const title = document.querySelector('.intro__title');
  if (!title || reduceMotion) return;
  let n = 0;
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.style.animationDelay = `${n++ * 0.04}s`;
          w.textContent = part;
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrap(child);
      }
    });
  };
  title.setAttribute('aria-label', title.textContent);
  wrap(title);
})();

// Scroll reveal for sections, images and cards
(() => {
  const targets = document.querySelectorAll(
    '.section-label, .card, .about__title, .about__body > *, .p-summary__main, .p-summary__meta, .sec__inner, .media, .others__title, .other, .footer__inner'
  );
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  targets.forEach((el) => {
    el.classList.add('reveal');
    // Stagger siblings that share a grid row (cards, other projects)
    if (el.matches('.card, .other')) {
      const i = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = `${(i % 2) * 0.12}s`;
    }
    io.observe(el);
  });
})();

// Nav link for the section currently on screen
(() => {
  const links = [...document.querySelectorAll('.nav__links a')];
  const map = links
    .map((a) => [a, document.getElementById(a.getAttribute('href').split('#')[1])])
    .filter(([, el]) => el);
  if (!map.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const pair = map.find(([, el]) => el === e.target);
      if (!pair) return;
      if (e.isIntersecting) pair[0].setAttribute('aria-current', 'true');
      else pair[0].removeAttribute('aria-current');
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  map.forEach(([, el]) => io.observe(el));
})();

// Accordion: animate height on open and close
document.querySelectorAll('details.acc').forEach((d) => {
  const summary = d.querySelector('summary');
  const body = d.querySelector('.acc__body');
  let anim = null;
  summary.addEventListener('click', (e) => {
    if (reduceMotion || !body.animate) return;
    e.preventDefault();
    if (anim) anim.cancel();
    const start = d.open ? body.offsetHeight : 0;
    if (d.open) {
      d.classList.add('is-closing');
      anim = body.animate({ height: [`${start}px`, '0px'] }, { duration: 300, easing: 'cubic-bezier(.2,.7,.2,1)' });
      anim.onfinish = () => { d.open = false; d.classList.remove('is-closing'); anim = null; };
    } else {
      d.open = true;
      const end = body.offsetHeight;
      anim = body.animate({ height: ['0px', `${end}px`] }, { duration: 350, easing: 'cubic-bezier(.2,.7,.2,1)' });
      anim.onfinish = () => { anim = null; };
    }
  });
});

// Carousel: arrows, keys, mouse drag, progress bar and dimmed inactive slide
document.querySelectorAll('[data-carousel]').forEach((root) => {
  const track = root.querySelector('.carousel__track');
  const slides = [...track.children];
  const prev = root.querySelector('[data-prev]');
  const next = root.querySelector('[data-next]');
  const count = root.querySelector('[data-count]');
  const bar = document.createElement('div');
  bar.className = 'carousel__bar';
  bar.innerHTML = '<span></span>';
  root.querySelector('.carousel__nav').append(bar);

  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  const update = () => {
    const i = Math.min(slides.length - 1, Math.max(0, index()));
    count.textContent = `${i + 1} / ${slides.length}`;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    bar.firstChild.style.width = `${((i + 1) / slides.length) * 100}%`;
  };
  const goTo = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => goTo(index() - 1));
  next.addEventListener('click', () => goTo(index() + 1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index() - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index() + 1); }
  });

  // Mouse drag (touch already scrolls natively)
  let startX = 0, startLeft = 0, dragging = false, moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; moved = false;
    startX = e.clientX; startLeft = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startLeft - dx;
  });
  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    const dx = e.clientX - startX;
    const base = Math.round(startLeft / track.clientWidth);
    const target = Math.abs(dx) > track.clientWidth * 0.15 ? base + (dx < 0 ? 1 : -1) : base;
    goTo(Math.min(slides.length - 1, Math.max(0, target)));
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  update();
});

// Back to top button
(() => {
  const btn = document.createElement('button');
  btn.className = 'to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '↑';
  document.body.append(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.2);
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();
})();
