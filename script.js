const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.hero-progress button')];
let currentSlide = 0;
let heroTimer;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentSlide));
  dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentSlide));
}

function startHeroTimer() {
  clearInterval(heroTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  heroTimer = setInterval(() => showSlide(currentSlide + 1), 6500);
}

document.querySelector('.hero-next')?.addEventListener('click', () => {
  showSlide(currentSlide + 1);
  startHeroTimer();
});

document.querySelector('.hero-prev')?.addEventListener('click', () => {
  showSlide(currentSlide - 1);
  startHeroTimer();
});

dots.forEach((dot, index) => dot.addEventListener('click', () => {
  showSlide(index);
  startHeroTimer();
}));

const searchPanel = document.querySelector('.search-panel');
const searchInput = document.querySelector('.search-form input');

document.querySelector('.search-toggle')?.addEventListener('click', () => {
  searchPanel.classList.add('is-open');
  searchPanel.setAttribute('aria-hidden', 'false');
  setTimeout(() => searchInput?.focus(), 250);
});

document.querySelector('.search-close')?.addEventListener('click', () => {
  searchPanel.classList.remove('is-open');
  searchPanel.setAttribute('aria-hidden', 'true');
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

menuButton?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

const productTabs = [...document.querySelectorAll('.product-tabs button')];
const productCards = [...document.querySelectorAll('.product-card')];

productTabs.forEach(tab => tab.addEventListener('click', () => {
  productTabs.forEach(item => item.classList.toggle('is-active', item === tab));
  const key = tab.dataset.tab;
  productCards.forEach(card => {
    const groups = card.dataset.group.split(' ');
    card.classList.toggle('is-hidden', key !== 'featured' && !groups.includes(key));
  });
}));

document.querySelectorAll('.add-button').forEach(button => button.addEventListener('click', () => {
  const original = button.textContent;
  button.textContent = 'Added to bag';
  button.style.background = '#006b3f';
  button.style.borderColor = '#006b3f';
  setTimeout(() => {
    button.textContent = original;
    button.style.background = '';
    button.style.borderColor = '';
  }, 1600);
}));

startHeroTimer();
window.lucide?.createIcons();

const revealTargets = [...document.querySelectorAll('main > section:not(.hero):not(.trust-strip)')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && 'IntersectionObserver' in window) {
  revealTargets.forEach(target => target.classList.add('reveal-ready'));
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(target => revealObserver.observe(target));
}
