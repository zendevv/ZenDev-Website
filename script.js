(() => {
  const toast = document.getElementById('toast'); let toastTimer;
  const showToast = (msg) => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1800); };
  document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const value = btn.dataset.copy;
    try { await navigator.clipboard.writeText(value); } catch { const ta=document.createElement('textarea'); ta.value=value; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    const old=btn.textContent; btn.textContent='Скопировано ✓'; showToast('Адрес скопирован'); setTimeout(()=>btn.textContent=old,1600);
  }));
  const bioToggle=document.getElementById('bioToggle'), bioContent=document.getElementById('bioContent');
  bioToggle.addEventListener('click',()=>{ const open=bioToggle.getAttribute('aria-expanded')==='true'; bioToggle.setAttribute('aria-expanded',String(!open)); bioContent.hidden=open; });
  const steamUrl='https://store.steampowered.com/api/appdetails?appids=2782640&l=russian&cc=us';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  async function loadSteam(){try{const r=await fetch(steamUrl,{mode:'cors'});if(!r.ok)throw new Error();const data=(await r.json())?.['2782640']?.data;if(!data)return;if(data.name)document.getElementById('steamTitle').textContent=data.name;if(data.short_description)document.getElementById('steamDescription').textContent=data.short_description;if(data.header_image)document.getElementById('steamHeroImage').src=data.header_image;const tags=(data.genres||[]).map(x=>x.description).slice(0,4);if(tags.length)document.getElementById('steamTags').innerHTML=tags.map(x=>`<span>${esc(x)}</span>`).join('');const shots=(data.screenshots||[]).slice(0,3);if(shots.length)document.getElementById('steamGallery').innerHTML=shots.map((x,i)=>`<a class="steam-thumb" href="${x.path_full}" target="_blank" rel="noopener"><img src="${x.path_thumbnail||x.path_full}" alt="Скриншот Dreadshot ${i+1}" loading="lazy"><span>Screenshot 0${i+1}</span></a>`).join('');}catch{}}
  loadSteam();
})();
