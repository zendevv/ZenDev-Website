(() => {
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (message) => { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1800); };
  document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try { await navigator.clipboard.writeText(value); }
    catch { const textarea=document.createElement('textarea'); textarea.value=value; textarea.style.position='fixed'; textarea.style.opacity='0'; document.body.appendChild(textarea); textarea.focus(); textarea.select(); document.execCommand('copy'); textarea.remove(); }
    const original=button.textContent; button.textContent='Скопировано ✓'; showToast('Адрес скопирован'); setTimeout(()=>button.textContent=original,1600);
  }));
  const bioToggle=document.getElementById('bioToggle'); const bioContent=document.getElementById('bioContent');
  bioToggle.addEventListener('click',()=>{const expanded=bioToggle.getAttribute('aria-expanded')==='true'; bioToggle.setAttribute('aria-expanded',String(!expanded)); bioContent.hidden=expanded;});
  requestAnimationFrame(()=>document.body.classList.add('page-enter'));
  const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.14,rootMargin:'0px 0px -7% 0px'});
  document.querySelectorAll('.reveal:not(.hero-enter)').forEach((el)=>observer.observe(el));
  document.querySelectorAll('.hero-enter').forEach((el)=>el.classList.add('is-visible'));
})();
