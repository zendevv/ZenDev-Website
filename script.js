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


  const steamUrl = 'https://store.steampowered.com/api/appdetails?appids=2782640&l=russian&cc=us';
  const gallery = { images: [], index: 0 };
  const screenshot = document.getElementById('steamScreenshot');
  const galleryStrip = document.getElementById('galleryStrip');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryFrame = document.querySelector('.gallery-frame');

  function renderGallery() {
    if (!gallery.images.length) { galleryCounter.textContent = '0 / 0'; return; }
    const item = gallery.images[gallery.index];
    galleryFrame.classList.add('is-changing');
    setTimeout(() => {
      screenshot.src = item.full;
      screenshot.alt = `Dreadshot — скриншот ${gallery.index + 1}`;
      galleryCounter.textContent = `${gallery.index + 1} / ${gallery.images.length}`;
      galleryFrame.classList.remove('is-changing');
      document.querySelectorAll('.gallery-thumb').forEach((el, i) => el.classList.toggle('active', i === gallery.index));
    }, 90);
  }
  function setGalleryIndex(index) {
    if (!gallery.images.length) return;
    gallery.index = (index + gallery.images.length) % gallery.images.length;
    renderGallery();
  }
  document.getElementById('galleryPrev').addEventListener('click', () => setGalleryIndex(gallery.index - 1));
  document.getElementById('galleryNext').addEventListener('click', () => setGalleryIndex(gallery.index + 1));
  galleryFrame.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') setGalleryIndex(gallery.index - 1);
    if (event.key === 'ArrowRight') setGalleryIndex(gallery.index + 1);
  });

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
      const shots = (data.screenshots || []).map(s => ({ full: s.path_full, thumb: s.path_thumbnail || s.path_full }));
      if (shots.length) {
        gallery.images = shots;
        galleryStrip.innerHTML = shots.map((s, i) => `<button class="gallery-thumb${i === 0 ? ' active' : ''}" type="button" aria-label="Открыть скриншот ${i + 1}"><img src="${s.thumb}" alt="" loading="lazy"></button>`).join('');
        galleryStrip.querySelectorAll('.gallery-thumb').forEach((button, i) => button.addEventListener('click', () => setGalleryIndex(i)));
        renderGallery();
      }
    } catch {
      gallery.images = [{ full: screenshot.src, thumb: screenshot.src }];
      galleryCounter.textContent = '1 / 1';
    }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }
  loadSteam();

  // Smooth reveal on scroll; initial hero enters independently.
  document.documentElement.classList.add('js');
  requestAnimationFrame(() => document.body.classList.add('page-enter'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();
