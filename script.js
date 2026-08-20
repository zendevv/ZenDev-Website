(() => {
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    const value = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const old = btn.textContent;
    btn.textContent = 'Скопировано ✓';
    showToast('Адрес скопирован');
    setTimeout(() => { btn.textContent = old; }, 1600);
  }));

  const bioToggle = document.getElementById('bioToggle');
  const bioContent = document.getElementById('bioContent');
  bioToggle.addEventListener('click', () => {
    const open = bioToggle.getAttribute('aria-expanded') === 'true';
    bioToggle.setAttribute('aria-expanded', String(!open));
    bioContent.hidden = open;
  });

  // Gentle reveal while scrolling. Initial hero elements already animate from CSS.
  const revealItems = [...document.querySelectorAll('.reveal')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((el) => observer.observe(el));

  // Very subtle horizontal drift of the grid, disabled for reduced-motion users.
  const grid = document.querySelector('.grid-bg');
  if (grid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * 0.018, 16);
        grid.style.setProperty('--scroll-shift', `${y}px`);
        ticking = false;
      });
    }, { passive: true });
  }
})();
