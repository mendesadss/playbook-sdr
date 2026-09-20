(() => {
  const key='playbook-navigation-v1';
  let state={tab:'abertura',subs:{trilhaA:'a0',trilhaB:'b0'},positions:{},scenario:''};
  try {const saved=JSON.parse(localStorage.getItem(key));if(saved)state={...state,...saved,subs:{...state.subs,...saved.subs},positions:saved.positions||{}};}catch{}
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
  const positionKey=()=>state.tab+':'+(state.subs[state.tab]||'')+':'+(state.tab==='trilhaB'&&state.subs.trilhaB==='b1'?state.scenario:'');
  const remember=()=>{state.positions[positionKey()]=scrollY;save();};
  const restore=()=>requestAnimationFrame(()=>scrollTo({top:state.positions[positionKey()]||0,behavior:'instant'}));
  // Replace old listeners with a single navigation owner.
  document.querySelectorAll('.tab,.subtab,.bbl-copy').forEach(el=>el.replaceWith(el.cloneNode(true)));
  const labels={abertura:'Início',trilhaA:'Trilha A',trilhaB:'Trilha B',rapidas:'Respostas',regras:'Regras'};
  document.querySelectorAll('.tab').forEach(button=>{button.textContent=labels[button.dataset.tab];button.addEventListener('click',()=>window.goTab(button.dataset.tab));});
  function showSub(tab,sub){
    const panel=document.getElementById('panel-'+tab);if(!panel?.querySelector('#sub-'+sub))return;
    state.subs[tab]=sub;
    panel.querySelectorAll('.subpanel').forEach(el=>el.classList.toggle('active',el.id==='sub-'+sub));
    panel.querySelectorAll('.subtab').forEach(el=>{el.classList.toggle('active',el.dataset.sub===sub);el.setAttribute('aria-pressed',el.dataset.sub===sub);});
    const select=panel.querySelector('.mobile-picker select');if(select)select.value=sub;
  }
  window.goTab=tab=>{if(!document.getElementById('panel-'+tab))return;remember();state.tab=tab;render();save();restore();};
  function render(){
    document.querySelectorAll('.tab').forEach(el=>{el.classList.toggle('active',el.dataset.tab===state.tab);el.setAttribute('aria-pressed',el.dataset.tab===state.tab);});
    document.querySelectorAll('.panel').forEach(el=>el.classList.toggle('active',el.id==='panel-'+state.tab));
    Object.entries(state.subs).forEach(([tab,sub])=>showSub(tab,sub));
  }
  for(const tab of ['trilhaA','trilhaB']){
    const panel=document.getElementById('panel-'+tab),tabs=panel.querySelector('.subtabs');
    const label=document.createElement('label');label.className='route-picker mobile-picker';label.textContent='Etapa da conversa';
    const select=document.createElement('select');label.append(select);tabs.after(label);
    tabs.querySelectorAll('.subtab').forEach(button=>{const option=new Option(button.textContent,button.dataset.sub);select.add(option);button.addEventListener('click',()=>{remember();showSub(tab,button.dataset.sub);save();restore();});});
    select.addEventListener('change',()=>{remember();showSub(tab,select.value);save();restore();});
  }
  const b1=document.getElementById('sub-b1'),cards=[...b1.children].filter(el=>el.classList.contains('card')),routes=cards.slice(2);
  const picker=document.createElement('label');picker.className='route-picker';picker.textContent='Depois das respostas, escolha um cenário';
  const select=document.createElement('select');select.add(new Option('Selecione o cenário do lead',''));
  routes.forEach((card,i)=>select.add(new Option(card.querySelector('.card-tag').textContent.replace('B1 · ',''),String(i))));
  picker.append(select);cards[1].after(picker);
  const routeHelp=routes.at(-1)?.querySelector('.whybody')?.parentElement;
  // Keep the shared explanation available even when its original scenario is hidden.
  if(routeHelp){const why=routeHelp.querySelector('.whybody'),toggle=routeHelp.querySelector('.whytoggle');if(toggle&&why){const box=document.createElement('div');box.className='card';box.append(toggle,why);b1.append(box);}}
  function scenario(){routes.forEach((card,i)=>card.classList.toggle('route-hidden',state.scenario!==String(i)));select.value=state.scenario;}
  select.addEventListener('change',()=>{remember();state.scenario=select.value;scenario();save();});scenario();
  for(const sub of ['b1','b2','b3','b4']){
    const button=document.createElement('button');button.className='next-step';button.textContent='Continuar para B5 · Situação de renda';
    button.addEventListener('click',()=>{remember();showSub('trilhaB','bf');save();restore();});document.getElementById('sub-'+sub).append(button);
  }
  document.querySelectorAll('.fk').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
  const toast=document.createElement('div');toast.className='app-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);let timer;
  const notify=text=>{clearTimeout(timer);toast.textContent=text;timer=setTimeout(()=>toast.textContent='',3500);};
  document.querySelectorAll('.bbl-copy').forEach(btn=>{
    btn.setAttribute('aria-label','Copiar mensagem');
    btn.addEventListener('click',async()=>{let ok=false;const text=btn.dataset.copy;
      try{await navigator.clipboard.writeText(text);ok=true;}catch{ok=fallbackCopy(text);}
      if(ok){btn.classList.add('copied');notify('Mensagem copiada');setTimeout(()=>btn.classList.remove('copied'),1500);}else notify('Não foi possível copiar. Selecione o texto e copie manualmente.');
    });
  });
  let scrollTimer;addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(remember,200);},{passive:true});
  addEventListener('pagehide',remember);document.addEventListener('visibilitychange',()=>{if(document.hidden)remember();});
  if(!document.getElementById('panel-'+state.tab))state.tab='abertura';render();restore();
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
