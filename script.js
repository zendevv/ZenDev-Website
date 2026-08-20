(() => {
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      const original = button.textContent;
      button.textContent = 'Скопировано ✓';
      showToast('Адрес скопирован');
      setTimeout(() => { button.textContent = original; }, 1600);
    });
  });

  const bioToggle = document.getElementById('bioToggle');
  const bioContent = document.getElementById('bioContent');
  bioToggle.addEventListener('click', () => {
    const expanded = bioToggle.getAttribute('aria-expanded') === 'true';
    bioToggle.setAttribute('aria-expanded', String(!expanded));
    bioContent.hidden = expanded;
  });

  // Gentle matrix background: deliberately slow and low-contrast.
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, columns = 0, drops = [];
  const chars = '01ZXENDEV<>[]{}/*+-';
  const fontSize = 14;

  function resizeMatrix() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.floor(window.innerWidth * dpr);
    height = Math.floor(window.innerHeight * dpr);
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    columns = Math.ceil(window.innerWidth / fontSize);
    drops = Array.from({ length: columns }, (_, i) => -Math.random() * 20 - (i % 9));
    ctx.font = `${fontSize}px monospace`;
  }

  function drawMatrix() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scale = width / Math.max(window.innerWidth, 1);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = 'rgba(4,9,6,.095)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = 0; i < drops.length; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const brightness = 34 + Math.floor(Math.random() * 18);
      ctx.fillStyle = `rgba(98, 227, 145, ${brightness / 255})`;
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, x, y);
      if (y > window.innerHeight && Math.random() > 0.975) drops[i] = -Math.random() * 8;
      drops[i] += 0.22 + Math.random() * 0.08;
    }
    requestAnimationFrame(drawMatrix);
  }
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix, { passive: true });
  requestAnimationFrame(drawMatrix);

  // Steam Store API enhancement. GitHub Pages remains functional if the API is unavailable.
  const steamUrl = 'https://store.steampowered.com/api/appdetails?appids=2782640&l=russian&cc=us';
  async function loadSteam() {
    try {
      const response = await fetch(steamUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Steam API unavailable');
      const json = await response.json();
      const data = json?.['2782640']?.data;
      if (!data) return;
      document.getElementById('steamTitle').textContent = data.name || 'Dreadshot';
      document.getElementById('steamDescription').textContent = data.short_description || document.getElementById('steamDescription').textContent;
      if (data.header_image) document.getElementById('steamHeroImage').src = data.header_image;
      const tags = (data.genres || []).map(g => g.description).slice(0, 4);
      if (tags.length) document.getElementById('steamTags').innerHTML = tags.map(t => `<span>${escapeHtml(t)}</span>`).join('');
      const gallery = document.getElementById('steamGallery');
      const shots = (data.screenshots || []).slice(0, 3);
      if (shots.length) {
        gallery.innerHTML = shots.map((s, i) => `<a class="steam-thumb" href="${s.path_full}" target="_blank" rel="noopener noreferrer"><img src="${s.path_thumbnail || s.path_full}" alt="Скриншот Dreadshot ${i + 1}" loading="lazy"><span>Screenshot 0${i + 1}</span></a>`).join('');
      }
    } catch {
      // Static fallback remains in place. Steam's store page is still linked directly.
    }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }
  loadSteam();
})();
