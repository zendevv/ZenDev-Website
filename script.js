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
  const STEAM_API = 'https://store.steampowered.com/api/appdetails?appids=2782640&l=russian&cc=us';
  const STEAM_SCREENSHOTS_PAGE = 'https://steamdb.info/app/2782640/screenshots/';

  async function fetchJsonFrom(url, init = {}) {
    const response = await fetch(url, { ...init, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function fetchSteamApiThroughProxy() {
    const urls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(STEAM_API)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(STEAM_API)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(STEAM_API)}`,
    ];
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) continue;
        const payload = await response.json();
        const app = payload?.['2782640'];
        if (app?.success && app.data) return app.data;
      } catch {}
    }
    throw new Error('Steam API unavailable through browser proxies');
  }

  async function fetchSteamScreenshotsThroughProxy() {
    const urls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(STEAM_SCREENSHOTS_PAGE)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(STEAM_SCREENSHOTS_PAGE)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(STEAM_SCREENSHOTS_PAGE)}`,
    ];
    const patterns = [
      /https?:\/\/[^"\'\s<>]*(?:steamstatic\.com)[^"\'\s<>]*2782640[^"\'\s<>]*\.jpe?g(?:\?[^"\'\s<>]*)?/gi,
      /https?:\/\/[^"\'\s<>]*steamstatic[^"\'\s<>]*\.jpe?g(?:\?[^"\'\s<>]*)?/gi,
      /(?:store_item_assets|steam\/apps)[^"\'\s<>]*2782640[^"\'\s<>]*\.jpe?g(?:\?[^"\'\s<>]*)?/gi,
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) continue;
        const html = await response.text();
        const candidates = new Set();
        for (const pattern of patterns) {
          for (const match of html.matchAll(pattern)) {
            let raw = match[0].replace(/\\u0026/g, '&').replace(/\\\//g, '/').replace(/&amp;/g, '&');
            if (raw.startsWith('store_item_assets')) {
              raw = `https://shared.fastly.steamstatic.com/${raw}`;
            }
            if (/2782640/.test(raw) && /\.jpe?g(?:\?|$)/i.test(raw) && /(?:ss_|screenshot)/i.test(raw)) {
              candidates.add(raw);
            }
          }
        }
        if (candidates.size) {
          return [...candidates].map((full) => ({ full, thumb: full }));
        }
      } catch {}
    }
    throw new Error('Could not extract screenshot URLs');
  }

  async function loadSteam() {
    let apiData = null;
    try {
      apiData = await fetchSteamApiThroughProxy();
      applySteamData(apiData);
    } catch (error) {
      console.warn('Steam API unavailable:', error);
    }

    // The Store API is not required for the gallery. Get the actual current screenshot URLs from SteamDB's screenshot page.
    try {
      const images = await fetchSteamScreenshotsThroughProxy();
      gallery.images = images;
      gallery.index = 0;
      galleryStrip.innerHTML = images.map((item, i) => `
        <button class="gallery-thumb${i === 0 ? ' active' : ''}" type="button" aria-label="Открыть скриншот ${i + 1}">
          <img src="${item.thumb}" alt="" loading="lazy">
        </button>
      `).join('');
      galleryStrip.querySelectorAll('.gallery-thumb').forEach((button, i) => {
        button.addEventListener('click', () => setGalleryIndex(i));
      });
      renderGallery();
    } catch (error) {
      console.warn('Steam screenshots could not be loaded:', error);
      // Never point at a fake screenshot URL. Use the real Steam header as a visible fallback.
      gallery.images = [{
        full: document.getElementById('steamHeroImage').src,
        thumb: document.getElementById('steamHeroImage').src,
      }];
      gallery.index = 0;
      galleryCounter.textContent = '1 / 1';
      galleryStrip.innerHTML = '<button class="gallery-thumb active" type="button" aria-label="Открыть изображение Dreadshot"><img src="' + gallery.images[0].thumb + '" alt="" loading="lazy"></button>';
      galleryStrip.querySelector('.gallery-thumb').addEventListener('click', () => setGalleryIndex(0));
      screenshot.src = gallery.images[0].full;
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
