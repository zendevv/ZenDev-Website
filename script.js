(() => {
  const boot = document.getElementById('bootScreen');
  const bootBody = document.getElementById('bootBody');
  const bootBar = document.getElementById('bootBar');
  const bootProgress = document.getElementById('bootProgress');
  const bootStatus = document.getElementById('bootStatus');
  const bootLines = [
    '[  OK  ] secure shell established',
    '[  OK  ] validating runtime environment',
    '[  OK  ] loading typography system',
    '[  OK  ] loading interface modules',
    '[  OK  ] initializing visual layer',
    '[  OK  ] mounting ZEN workspace',
    '[  OK  ] mounting DREADSHOT workspace',
    '[  OK  ] syncing project state',
    '[  OK  ] indexing public channels',
    '[  OK  ] linking Telegram node',
    '[  OK  ] linking media endpoints',
    '[  OK  ] preparing content layer',
    '[  OK  ] initializing background field',
    '[  OK  ] calibrating grid motion',
    '[  OK  ] calibrating particle field',
    '[  OK  ] applying interface depth',
    '[  OK  ] preparing mobile layout',
    '[  OK  ] finalizing navigation',
    '[  OK  ] checking interaction layer',
    '[  OK  ] interface ready'
  ];
  const start = performance.now();
  let bootFinished = false;
  function runBoot(now){
    const elapsed = now - start;
    const progress = Math.min(100, Math.floor((elapsed / 900) * 100));
    const lineCount = Math.min(bootLines.length, Math.max(1, Math.ceil((progress / 100) * bootLines.length)));
    bootBody.innerHTML = bootLines.slice(0, lineCount).map((line,i)=>`<div>${line}</div>`).join('');
    bootBar.style.width = progress + '%';
    bootProgress.textContent = String(progress).padStart(2,'0') + '%';
    bootStatus.textContent = progress < 100 ? ['initializing interface...','loading visual layer...','syncing project...','starting frontend...'][Math.min(3,Math.floor(progress/30))] : 'interface online';
    if(progress < 100){ requestAnimationFrame(runBoot); } else if(!bootFinished){ bootFinished = true; setTimeout(()=>boot.classList.add('done'),120); }
  }
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ boot.classList.add('done'); } else { requestAnimationFrame(runBoot); }

  const toast = document.getElementById('toast'); let toastTimer;
  const showToast = (msg) => { toast.textContent=msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),1800); };
  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
    const value=btn.dataset.copy;
    try{await navigator.clipboard.writeText(value);}catch{const ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
    const old=btn.textContent; btn.textContent='Скопировано ✓'; showToast('Адрес скопирован'); setTimeout(()=>btn.textContent=old,1600);
  }));

  const bioToggle=document.getElementById('bioToggle'), bioContent=document.getElementById('bioContent');
  bioToggle.addEventListener('click',()=>{const open=bioToggle.getAttribute('aria-expanded')==='true';bioToggle.setAttribute('aria-expanded',String(!open));bioContent.hidden=open;});

  const revealItems=[...document.querySelectorAll('.reveal')];
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  revealItems.forEach(el=>observer.observe(el));

  const progressEl=document.querySelector('#scrollProgress i');
  const updateScroll=()=>{const doc=document.documentElement;const max=doc.scrollHeight-window.innerHeight;progressEl.style.width=(max>0?(window.scrollY/max)*100:0)+'%';};
  window.addEventListener('scroll',updateScroll,{passive:true}); updateScroll();

  const parallaxItems=[...document.querySelectorAll('.parallax')];
  const canParallax=!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer:fine)').matches;
  if(canParallax){
    let tx=0,ty=0,cx=0,cy=0,raf=0;
    window.addEventListener('mousemove',e=>{tx=(e.clientX/window.innerWidth-.5);ty=(e.clientY/window.innerHeight-.5);if(!raf)raf=requestAnimationFrame(loop);},{passive:true});
    function loop(){cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;parallaxItems.forEach(el=>{const d=Number(el.dataset.depth||.05);el.style.setProperty('--mx',(cx*d*42).toFixed(2)+'px');el.style.setProperty('--my',(cy*d*34).toFixed(2)+'px');el.style.setProperty('--rx',(cy*d*5.2).toFixed(2)+'deg');el.style.setProperty('--ry',(-cx*d*6.4).toFixed(2)+'deg');});raf=requestAnimationFrame(loop);}
  }

  const grid=document.querySelector('.grid-bg');
  if(grid && canParallax){let ticking=false;window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{grid.style.setProperty('--scroll-shift',Math.min(window.scrollY*.018,16)+'px');ticking=false;});},{passive:true});}
  const particleCanvas=document.getElementById('particleCanvas');
  if(particleCanvas){
    const pctx=particleCanvas.getContext('2d');
    let particles=[],pw=0,ph=0,pdpr=1;
    function resizeParticles(){
      pdpr=Math.min(window.devicePixelRatio||1,1.5); pw=window.innerWidth; ph=window.innerHeight;
      particleCanvas.width=Math.floor(pw*pdpr); particleCanvas.height=Math.floor(ph*pdpr); particleCanvas.style.width=pw+'px'; particleCanvas.style.height=ph+'px';
      const count=Math.min(150,Math.floor(pw/10));
      particles=Array.from({length:count},()=>({x:Math.random()*pw,y:Math.random()*ph,s:Math.random()*1.5+.25,v:Math.random()*.28+.045,a:Math.random()*.35+.08,p:Math.random()*Math.PI*2}));
    }
    function drawParticles(){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      pctx.setTransform(pdpr,0,0,pdpr,0,0); pctx.clearRect(0,0,pw,ph);
      const gx=pw*.52,gy=ph*.42;
      for(const q of particles){q.y-=q.v; q.p+=.014; if(q.y<-4){q.y=ph+4;q.x=Math.random()*pw;}
        q.x += Math.sin(q.p*0.7)*0.012; const pulse=(Math.sin(q.p)+1)/2; const grad=pctx.createRadialGradient(q.x,q.y,0,q.x,q.y,Math.max(5,q.s*5));
        grad.addColorStop(0,`rgba(98,227,145,${(.20+pulse*.20)*q.a})`); grad.addColorStop(.5,`rgba(143,130,255,${(.06+pulse*.08)*q.a})`); grad.addColorStop(1,'rgba(0,0,0,0)');
        pctx.fillStyle=grad;pctx.beginPath();pctx.arc(q.x,q.y,Math.max(4,q.s*5),0,Math.PI*2);pctx.fill();
      }
      requestAnimationFrame(drawParticles);
    }
    resizeParticles(); window.addEventListener('resize',resizeParticles,{passive:true}); requestAnimationFrame(drawParticles);
  }

})();
