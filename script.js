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

  const gallery = {
    images: [],
    index: 0,
  };
  const screenshot = document.getElementById('steamScreenshot');
  const galleryStrip = document.getElementById('galleryStrip');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryFrame = document.querySelector('.gallery-frame');

  function renderGallery() {
    if (!gallery.images.length) {
      galleryCounter.textContent = '0 / 0';
      return;
    }
    const item = gallery.images[gallery.index];
    galleryFrame.classList.add('is-changing');
    window.setTimeout(() => {
      screenshot.src = item.full;
      screenshot.alt = `Dreadshot — скриншот ${gallery.index + 1}`;
      galleryCounter.textContent = `${gallery.index + 1} / ${gallery.images.length}`;
      galleryFrame.classList.remove('is-changing');
      document.querySelectorAll('.gallery-thumb').forEach((el, i) => {
        el.classList.toggle('active', i === gallery.index);
      });
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

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  }

  function applySteamData(data) {
    if (!data) throw new Error('Steam returned no app data');

    document.getElementById('steamTitle').textContent = data.name || 'Dreadshot';
    document.getElementById('steamDescription').textContent = data.short_description || document.getElementById('steamDescription').textContent;
    if (data.header_image) document.getElementById('steamHeroImage').src = data.header_image;

    const tags = (data.genres || []).map((genre) => genre.description).filter(Boolean).slice(0, 4);
    if (tags.length) {
      document.getElementById('steamTags').innerHTML = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    }

    const shots = (data.screenshots || [])
      .map((item) => ({
        full: item.path_full,
        thumb: item.path_thumbnail || item.path_full,
      }))
      .filter((item) => item.full);

    if (!shots.length) throw new Error('Steam returned no screenshots');

    gallery.images = shots;
    gallery.index = 0;
    galleryStrip.innerHTML = shots.map((item, i) => `
      <button class="gallery-thumb${i === 0 ? ' active' : ''}" type="button" aria-label="Открыть скриншот ${i + 1}">
        <img src="${item.thumb}" alt="" loading="lazy">
      </button>
    `).join('');

    galleryStrip.querySelectorAll('.gallery-thumb').forEach((button, i) => {
      button.addEventListener('click', () => setGalleryIndex(i));
    });
    renderGallery();
  }

  // Steam's Store API does not reliably expose CORS headers to GitHub Pages.
  // AllOrigins is used only as a browser-side CORS bridge; the Steam URLs themselves
  // remain the source of the screenshots and metadata.
  async function fetchSteamViaProxy() {
    const steamApi = 'https://store.steampowered.com/api/appdetails?appids=2782640&l=russian&cc=us';
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(steamApi)}`;
    const response = await fetch(proxyUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Proxy HTTP ${response.status}`);
    const wrapper = await response.json();
    if (!wrapper.contents) throw new Error('Proxy returned empty contents');
    const payload = JSON.parse(wrapper.contents);
    const app = payload?.['2782640'];
    if (!app?.success || !app.data) throw new Error('Steam API returned no data');
    return app.data;
  }

  async function fetchSteamDirect() {
    const response = await fetch('https://store.steampowered.com/api/appdetails?appids=2782640&l=russian&cc=us', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Steam API HTTP ${response.status}`);
    const payload = await response.json();
    const app = payload?.['2782640'];
    if (!app?.success || !app.data) throw new Error('Steam API returned no data');
    return app.data;
  }

  async function loadSteam() {
    try {
      let data;
      try {
        data = await fetchSteamViaProxy();
      } catch {
        data = await fetchSteamDirect();
      }
      applySteamData(data);
    } catch (error) {
      console.warn('Dreadshot Steam data could not be loaded:', error);
      // Static fallback: keep the store header visible and make the gallery usable.
      gallery.images = [{
        full: screenshot.src,
        thumb: screenshot.src,
      }];
      gallery.index = 0;
      galleryCounter.textContent = '1 / 1';
      galleryStrip.innerHTML = '<button class="gallery-thumb active" type="button" aria-label="Текущий скриншот"><img src="' + screenshot.src + '" alt="" loading="lazy"></button>';
      galleryStrip.querySelector('.gallery-thumb').addEventListener('click', () => setGalleryIndex(0));
    }
  }

  // Smooth entrance + scroll reveal.
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
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

  loadSteam();
})();
