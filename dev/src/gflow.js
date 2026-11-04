// ===== DOMINION Play flow: Aircraft -> Loadout -> Launch (linear, iOS glass). Quick Launch remembers last setup =====
{const css=document.createElement('style');css.textContent=`
#menu.ios .dmWrap{animation-fill-mode:none!important}
#menu.ios .flSeg{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:4px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.11);-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);touch-action:pan-x}
#menu.ios .flSeg::-webkit-scrollbar{display:none}
#menu.ios .flTab{flex:none;padding:9px 15px;border-radius:12px;font-size:14px;font-weight:600;color:rgba(230,238,255,.7);white-space:nowrap;cursor:pointer;touch-action:manipulation;transition:background .25s cubic-bezier(.2,.9,.3,1),color .25s,box-shadow .25s,transform .15s}
#menu.ios .flTab.on{background:rgba(255,255,255,.92);color:#0b1220;box-shadow:0 4px 14px rgba(0,0,0,.3)}
#menu.ios .flTab.pr{transform:scale(.95)}
#menu.ios .flCard.flIn{animation:flIn .45s cubic-bezier(.2,.9,.25,1.1)}
@keyframes flIn{0%{opacity:.001;transform:translateX(26px) scale(.97)}100%{opacity:1;transform:none}}
#menu.ios .flHead{display:flex;align-items:center;gap:12px;margin:0 0 4px}
#menu.ios .flBack{width:40px;height:40px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);cursor:pointer;touch-action:manipulation;transition:transform .15s}
#menu.ios .flBack svg{width:18px;height:18px}
#menu.ios .flBack.pr,#menu.ios .flCard.pr,#menu.ios .flChip.pr,#menu.ios .flGo.pr{transform:scale(.96)}
#menu.ios .flT{flex:1;min-width:0}#menu.ios .flT .s{font-size:12px;font-weight:600;letter-spacing:.18em;color:rgba(160,200,255,.8)}
#menu.ios .flT .h{font-size:26px;font-weight:700;letter-spacing:-.01em}
#menu.ios .flDots{display:flex;gap:6px}#menu.ios .flDots i{width:7px;height:7px;border-radius:4px;background:rgba(255,255,255,.22);transition:all .3s}#menu.ios .flDots i.on{width:20px;background:#7fb2ff}
#menu.ios .flRail{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:6px 9% 14px;margin:0 -18px;scrollbar-width:none;touch-action:pan-x pan-y}
#menu.ios .flRail::-webkit-scrollbar{display:none}
#menu.ios .flCard{flex:0 0 82%;max-width:380px;scroll-snap-align:center;border-radius:26px;padding:16px;background:linear-gradient(160deg,rgba(255,255,255,.11),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(24px) saturate(170%);backdrop-filter:blur(24px) saturate(170%);box-shadow:0 18px 40px rgba(0,0,0,.35);cursor:pointer;touch-action:manipulation;transition:transform .2s cubic-bezier(.2,.9,.3,1.2),border-color .2s,background .2s}
#menu.ios .flCard.sel{border-color:rgba(140,190,255,.85);background:linear-gradient(160deg,rgba(90,150,255,.28),rgba(60,110,230,.08));box-shadow:0 18px 44px rgba(40,90,220,.35)}
#menu.ios .flArt{height:132px;border-radius:18px;background:radial-gradient(80% 90% at 50% 100%,rgba(120,180,255,.28),transparent 70%),linear-gradient(180deg,rgba(10,20,40,.6),rgba(20,35,60,.3));display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
#menu.ios .flArt svg{width:82%;height:82%;filter:drop-shadow(0 8px 14px rgba(0,0,0,.55))}
#menu.ios .flArt .tag{position:absolute;left:10px;top:10px;font-size:10px;font-weight:700;letter-spacing:.16em;padding:4px 8px;border-radius:8px;background:rgba(0,0,0,.35);color:rgba(220,235,255,.85)}
#menu.ios .flName{font-size:19px;font-weight:700;margin:12px 2px 4px;letter-spacing:-.01em}
#menu.ios .flDesc{font-size:13px;line-height:1.35;color:rgba(225,235,255,.62);margin:0 2px 10px;min-height:52px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
#menu.ios .flStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
#menu.ios .flStats div{border-radius:12px;background:rgba(0,0,0,.22);padding:7px 8px}#menu.ios .flStats b{display:block;font-size:14px}#menu.ios .flStats span{font-size:10px;letter-spacing:.12em;color:rgba(200,215,240,.55)}
#menu.ios .flSec{font-size:12px;font-weight:600;letter-spacing:.18em;color:rgba(220,232,255,.55);margin:6px 4px 0}
#menu.ios .flChips{display:flex;flex-wrap:wrap;gap:8px}
#menu.ios .flChip{padding:11px 15px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);font-size:15px;font-weight:500;cursor:pointer;touch-action:manipulation;transition:all .18s}
#menu.ios .flChip.on{background:rgba(90,150,255,.35);border-color:rgba(150,200,255,.65)}
#menu.ios .flChip.ro{cursor:default;font-size:13px;font-weight:600;letter-spacing:.04em}
#menu.ios .flSum{display:flex;align-items:center;gap:14px;border-radius:22px;padding:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
#menu.ios .flSum .flArt{width:110px;height:72px;flex:none;border-radius:14px}#menu.ios .flSum b{font-size:17px}#menu.ios .flSum small{display:block;color:rgba(220,232,255,.55);font-size:12px;margin-top:2px}
#menu.ios .flGo{margin-top:10px;padding:22px;border-radius:24px;text-align:center;font-size:22px;font-weight:700;letter-spacing:.12em;background:linear-gradient(135deg,#4f8dff,#2f62e6);box-shadow:0 14px 40px rgba(47,98,230,.55),inset 0 1px 0 rgba(255,255,255,.35);cursor:pointer;touch-action:manipulation;transition:transform .18s cubic-bezier(.2,.9,.3,1.3)}
#menu.ios .flGo small{display:block;font-size:12px;font-weight:500;letter-spacing:.06em;opacity:.75;margin-top:4px}
#menu.ios .flNext{position:sticky;bottom:0}
@media (orientation:landscape) and (max-height:500px){#menu.ios .flArt{height:96px}#menu.ios .flCard{flex-basis:44%}#menu.ios .flDesc{min-height:0;-webkit-line-clamp:2}#menu.ios .flT .h{font-size:22px}#menu.ios .dmWrap{width:min(760px,100%)}#menu.ios .flNext{position:static}#menu.ios .flGo{padding:13px;font-size:18px;margin-top:4px}#menu.ios .flCard{padding:12px}#menu.ios .flName{margin-top:8px}#menu.ios .dmLogo{margin:0 0 6px}#menu.ios .dmLogo .a{font-size:44px}}
`;document.head.appendChild(css);}
{
 const CLS={air:'JET',heli:'ROTOR',ship:'NAVAL',sub:'SUBSEA',silo:'STRATEGIC',rocket:'SPACE',space:'SPACE',orbit:'ORBITAL'};
 const P={ // side/plan silhouettes, viewBox 0 0 200 100
  jet:'<path d="M18 52 L70 46 L96 18 L110 18 L100 46 L150 44 L172 30 L182 30 L176 48 L190 50 L176 54 L182 70 L172 70 L150 56 L100 54 L110 82 L96 82 L70 54 Z"/>',
  air:'<path d="M10 50 Q14 44 30 44 L170 44 Q190 46 194 50 Q190 54 170 56 L30 56 Q14 56 10 50Z M80 46 L120 12 L134 12 L112 46Z M80 54 L120 88 L134 88 L112 54Z M20 46 L30 26 L40 26 L38 46Z"/>',
  heli:'<path d="M20 30 L180 26 L180 30 L20 34Z M96 30 h6 v12 h-6z M60 44 Q60 38 80 38 L130 40 Q150 44 148 56 Q140 66 110 64 L80 62 Q60 60 60 44Z M140 52 L188 48 L190 56 L186 60 L142 58Z M80 66 L74 74 L138 74 L132 66"/>',
  ship:'<path d="M8 58 L192 58 L180 76 L22 76 Z M60 58 L66 40 L110 40 L114 30 L124 30 L128 40 L140 40 L146 58Z M96 30 h4 v-18 h-4z M150 52 h22 v6 h-22z M30 52 h20 v6 h-20z"/>',
  sub:'<path d="M14 56 Q14 44 40 44 L170 44 Q192 46 194 56 Q192 66 170 68 L40 68 Q14 68 14 56Z M80 44 L86 28 L112 28 L114 44Z M180 40 L190 34 L192 46Z M180 72 L190 78 L192 66Z"/>',
  rocket:'<path d="M94 8 Q100 0 106 8 L110 22 L110 84 L120 96 L80 96 L90 84 L90 22Z M74 54 Q80 46 86 54 L86 92 L74 92Z M114 54 Q120 46 126 54 L126 92 L114 92Z"/>',
  silo:'<path d="M20 86 L180 86 L180 96 L20 96Z M70 86 L74 30 Q100 6 126 30 L130 86Z M94 30 Q100 18 106 30 L106 86 L94 86Z"/>',
  sat:'<path d="M84 38 h32 v24 h-32z M20 42 h56 v16 h-56z M124 42 h56 v16 h-56z M98 62 h4 v24 h-4z M94 86 h12 l-6 10z"/>'};
 const art=(k,d)=>{let s='jet';if(d.cls==='heli')s='heli';else if(d.cls==='ship')s='ship';else if(d.cls==='sub')s='sub';else if(d.cls==='rocket'||/shuttle|rocket|falcon|starship/i.test(k))s='rocket';else if(k==='rods'||/orbit|sat/i.test(d.cls||''))s='sat';else if(d.cls==='silo'&&k!=='ac130')s='silo';else if(/b7|a3|ac130|airliner/i.test(k))s='air';
  return `<svg viewBox="0 0 200 100"><defs><linearGradient id="fg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="1" stop-color="#8ea6cc"/></linearGradient></defs><g fill="url(#fg${k})">${P[s]}</g></svg>`;};
 const stats=d=>{const w=(d.weapons||[]).length;const sp=d.cls==='rocket'?'7.8 km/s':d.vstall?('M'+Math.max(.8,Math.min(10,(d.thrust||30)/10)).toFixed(1)):d.maxSpd?(Math.round(d.maxSpd*1.94)+' kt'):'—';
  return [[CLS[d.cls]||String(d.cls||'—').toUpperCase(),'CLASS'],[sp,'SPEED'],[w?w+'':'—','WEAPONS']];};
 const guard=()=>performance.now()-(window.__tapT||-1e9)<700;
 const tap=(el,f)=>{let sx=0,sy=0,t0=0;
  el.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;t0=performance.now();el.classList.add('pr');},{passive:true});
  el.addEventListener('pointercancel',()=>el.classList.remove('pr'),{passive:true});el.addEventListener('pointerleave',()=>el.classList.remove('pr'),{passive:true});
  el.addEventListener('pointerup',e=>{el.classList.remove('pr');if(e.pointerType==='mouse')return;if(Math.hypot(e.clientX-sx,e.clientY-sy)>12||performance.now()-t0>1500||guard())return;window.__tapT=performance.now();try{sfx&&sfx('ui');f(e);}catch(err){showErr(err);}});
  el.onclick=e=>{if(guard())return;sfx&&sfx('ui');f(e);};return el;};
 const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
 const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';

 const CATS=[['fighter','Fighters'],['bomber','Bombers'],['airliner','Airliners'],['heli','Helicopters'],['drone','Drones'],['space','Space & Experimental'],['naval','Ships & Subs'],['strategic','Strategic'],['airdef','Air Defense']];
 const catOf=k=>{if(String(k).startsWith('ad_'))return'airdef';const d=DEFS[k]||{};if(/^(b7|a3|airliner)/.test(k))return'airliner';if(/^(b2|b52|b1|b21|ac130|bomber)/.test(k)||/bomber|gunship/i.test(d.name||''))return'bomber';
  if(/drone|uav|mq9|reaper/i.test(k+(d.name||'')))return'drone';if(d.cls==='heli')return'heli';if(['ship','sub'].includes(d.cls))return'naval';
  if(['darkstar','sr71','rods','shuttle','tr3b','saucer'].includes(k)||d.cls==='rocket'||/space|orbit/i.test(d.cls||''))return'space';if(d.cls==='air')return'fighter';return'strategic';};
 const catList=()=>{const have=new Set(flEntries().map(e=>catOf(e[0])));return CATS.filter(c=>have.has(c[0]));};

 const AD=()=>window.__airdef&&__airdef.TYPES||null;
 const flEntries=()=>{const e=Object.entries(DEFS);const T=AD();if(T)for(const [k,t] of Object.entries(T))e.push(['ad_'+k,{name:t.name.replace(' battery',''),desc:'Enemy '+t.name+' ('+t.mk+'). Fly in and test it: it will engage you. Range '+Math.round(t.range/1000)+' km.',cls:'airdef',weapons:[]}]);return e;};
 const nm=k=>{const e=flEntries().find(x=>x[0]===k);return e?e[1].name:'';};
 const launchAD=k=>{const type=k.slice(3);mission=null;menuView='home';spawn('fighter','airbase');setPaused(false);try{window.__adop?__adop.start(type):msg('Air defense control unavailable',2);}catch(e){showErr(e);}};
 let pick=null,flowFrom='home';
 const vehKey=()=>{const k=settings.lastVeh||settings.defVeh;return k&&DEFS[k]?k:'fighter';};
 const launch=k=>{settings.lastVeh=settings.defVeh=k;saveSettings();mission=null;menuView='home';spawn(k,settings.loc||'airbase');setPaused(false);};
 const go=v=>{menuView=v;buildMenu();const m=$('menu');m.scrollTop=0;};
 const head=(step,title,back)=>{const h=mk('div','flHead');const b=tap(mk('div','flBack',CHEV),back);b.setAttribute('aria-label','Back');b.id='flBack';
  const t=mk('div','flT',`<div class="s">STEP ${step} OF 2</div><div class="h">${title}</div>`);const d=mk('div','flDots',`<i class="${step===1?'on':''}"></i><i class="${step===2?'on':''}"></i>`);h.append(b,t,d);return h;};
 const _bm=buildMenu;
 buildMenu=function(){const m=$('menu');m.classList.add('ios');
  if(menuView==='home'){m.innerHTML='';const w=mk('div','dmWrap');m.appendChild(w);
   w.innerHTML='<div class="dmLogo"><div class="a">DOMINION</div><div class="b">ALL DOMAIN WAR</div><div class="ln"></div></div>';
   const B=(cls,html,f,id)=>{const b=tap(mk('div','dmBtn '+cls,html),f);if(id)b.id=id;w.appendChild(b);return b;};
   if(player)B('play','Resume <span class="chev">›</span>',()=>setPaused(false),'flResume');
   B(player?'':'play','Play <span class="chev">›</span>',()=>{flowFrom='home';pick=vehKey();go('pick');},'flPlay');
   if(settings.lastVeh&&DEFS[settings.lastVeh])B('','Quick Launch <small>'+DEFS[settings.lastVeh].name+' · '+(LOCS[settings.loc||'airbase']||'')+'</small>',()=>launch(settings.lastVeh),'flQuick');
   B('','Free Play <span class="chev">›</span>',()=>{flowFrom='free';pick=vehKey();go('pick');},'flFree');
   B('','Settings <span class="chev">›</span>',()=>go('settings'),'flSet');
   const ml=tap(mk('div','dmLink','Missions'),()=>go('mis'));w.appendChild(ml);return;}
  if(menuView==='pick'){m.innerHTML='';const w=mk('div','dmWrap');m.appendChild(w);
   w.appendChild(head(1,flowFrom==='free'?'Free Play':'Choose Aircraft',()=>go('home')));
   const cats=catList(),ck=cats.find(c=>c[0]===catOf(pick))?catOf(pick):(cats.find(c=>c[0]===settings.lastCat)||cats[0])[0];
   const bar=mk('div','flSeg');bar.id='flSeg';w.appendChild(bar);
   const rail=mk('div','flRail');rail.id='flRail';w.appendChild(rail);
   const show=(c,anim)=>{settings.lastCat=c;saveSettings();bar.querySelectorAll('.flTab').forEach(t=>t.classList.toggle('on',t.dataset.c===c));
    const on=bar.querySelector('.flTab.on');if(on)bar.scrollTo({left:on.offsetLeft-(bar.clientWidth-on.clientWidth)/2,behavior:anim?'smooth':'auto'});
    let first=null;rail.querySelectorAll('.flCard').forEach(x=>{const v=x.dataset.c===c;x.style.display=v?'':'none';if(v){if(!first)first=x;if(anim){x.classList.remove('flIn');void x.offsetWidth;x.classList.add('flIn');}}});
    const sel=rail.querySelector('.flCard.sel');if(!sel||sel.dataset.c!==c){if(first){pick=first.dataset.k;rail.querySelectorAll('.flCard').forEach(x=>x.classList.toggle('sel',x===first));nb.innerHTML=(pick.startsWith('ad_')?'Operate <small>':'Continue <small>')+nm(pick)+'</small>';}}
    rail.scrollLeft=0;const s2=rail.querySelector('.flCard.sel');if(s2)rail.scrollLeft=s2.offsetLeft-rail.offsetLeft-(rail.clientWidth-s2.clientWidth)/2;};
   for(const [c,label] of cats){const t=tap(mk('div','flTab',label),()=>show(c,true));t.dataset.c=c;bar.appendChild(t);}
   for(const [k,d] of flEntries()){const st=stats(d);
    const c=mk('div','flCard'+(k===pick?' sel':''),`<div class="flArt">${art(k,d)}<div class="tag">${st[0][0]}</div></div><div class="flName">${d.name}</div><div class="flDesc">${d.desc||''}</div><div class="flStats">${st.map(s=>`<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div>`);
    c.dataset.k=k;c.dataset.c=catOf(k);tap(c,()=>{if(pick===k){k.startsWith('ad_')?launchAD(k):go('load');return;}pick=k;rail.querySelectorAll('.flCard').forEach(x=>x.classList.toggle('sel',x.dataset.k===k));c.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});nb.innerHTML=(k.startsWith('ad_')?'Operate <small>':'Continue <small>')+d.name+'</small>';});rail.appendChild(c);}
   const nb=tap(mk('div','flGo flNext','Continue <small>'+nm(pick)+'</small>'),()=>pick.startsWith('ad_')?launchAD(pick):go('load'));nb.id='flNext';w.appendChild(nb);
   show(ck,false);requestAnimationFrame(()=>show(ck,false));return;}
  if(menuView==='load'){const d=DEFS[pick]||DEFS.fighter;m.innerHTML='';const w=mk('div','dmWrap');m.appendChild(w);
   w.appendChild(head(2,'Loadout',()=>go('pick')));
   const sm=mk('div','flSum',`<div class="flArt">${art(pick,d)}</div><div><b>${d.name}</b><small>${stats(d).map(s=>s[0]).join(' · ')}</small></div>`);w.appendChild(sm);
   w.appendChild(mk('div','flSec','WEAPONS'));const wc=mk('div','flChips');(d.weapons&&d.weapons.length?d.weapons:['UNARMED']).forEach(x=>wc.appendChild(mk('div','flChip ro',x+(AMMO[x]?' <span style="opacity:.55">×'+(settings.unlimited?'∞':AMMO[x])+'</span>':''))));w.appendChild(wc);
   w.appendChild(mk('div','flSec','SPAWN'));const lc=mk('div','flChips');const ld=settings.loc||'airbase';
   for(const [k,n] of Object.entries(LOCS)){const c=tap(mk('div','flChip'+(k===ld?' on':''),n),()=>{settings.loc=k;saveSettings();lc.querySelectorAll('.flChip').forEach(x=>x.classList.toggle('on',x.dataset.l===k));});c.dataset.l=k;lc.appendChild(c);}w.appendChild(lc);
   w.appendChild(mk('div','flSec','OPTIONS'));const oc=mk('div','flChips');
   const u=tap(mk('div','flChip'+(settings.unlimited?' on':''),'∞ Unlimited ammo'),()=>{settings.unlimited=!settings.unlimited;saveSettings();u.classList.toggle('on',settings.unlimited);});u.id='flUnl';
   const a=tap(mk('div','flChip'+(settings.advanced?' on':''),'Advanced controls'),()=>{settings.advanced=!settings.advanced;saveSettings();applySettings();a.classList.toggle('on',settings.advanced);});oc.append(u,a);w.appendChild(oc);
   const g=tap(mk('div','flGo','LAUNCH <small>'+d.name+'</small>'),()=>launch(pick));g.id='flLaunch';w.appendChild(g);return;}
  _bm();};
 {const _sp=setPaused;setPaused=function(p){if(p&&menuView!=='pick'&&menuView!=='load')menuView='home';_sp(p);};}
 buildMenu();
 {const s=document.getElementById('ngSplash');if(s)setTimeout(()=>{s.style.opacity=0;setTimeout(()=>s.remove(),700);},5000);}
}
