# ZenDev — personal landing page

Статический сайт для GitHub Pages. Никакого backend, базы данных или build step.

## Файлы
- `index.html` — разметка и контент
- `style.css` — дизайн, адаптивность и анимации
- `script.js` — копирование крипто-адресов, раскрываемая биография, лёгкий Matrix-фон и попытка подтянуть данные Dreadshot из Steam Store API

## GitHub Pages
1. Создай публичный репозиторий.
2. Загрузи эти три файла в корень репозитория.
3. GitHub → Settings → Pages → Deploy from a branch → `main` / `/root`.

Steam API используется как enhancement: если браузер/Steam не разрешит запрос с GitHub Pages, сайт автоматически остаётся на статических данных и Steam-изображении.
