// ===== DOMINION home screen: iOS-style frosted glass, SF type, few large rounded buttons, spring transitions =====
let menuView='home';
{const css=document.createElement('style');css.textContent=`
#menu.ios{background:radial-gradient(120% 90% at 20% 10%,#16243a 0%,#0a0f1a 45%,#05070c 100%)!important;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue",Arial,sans-serif;color:#fff;justify-content:flex-start;padding:calc(28px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom))}
#menu.ios::before{content:"";position:fixed;inset:-20%;background:radial-gradient(40% 35% at 70% 30%,rgba(90,150,255,.22),transparent 70%),radial-gradient(35% 30% at 25% 75%,rgba(120,220,255,.14),transparent 70%);animation:dmDrift 18s ease-in-out infinite alternate;pointer-events:none;z-index:-1}
@keyframes dmDrift{0%{transform:translate3d(-3%,-2%,0) scale(1)}100%{transform:translate3d(4%,3%,0) scale(1.08)}}
#menu.ios .dmWrap{width:min(560px,100%);display:flex;flex-direction:column;align-items:stretch;gap:14px;margin:auto 0;animation:dmIn .55s cubic-bezier(.2,.9,.25,1.15) both}
@keyframes dmIn{0%{opacity:0;transform:translateY(18px) scale(.98)}100%{opacity:1;transform:none}}
#menu.ios .dmLogo{text-align:center;margin:4px 0 18px}
#menu.ios .dmLogo .a{font-weight:200;font-size:clamp(44px,12vw,78px);letter-spacing:.14em;line-height:1;background:linear-gradient(180deg,#fff 0%,#dfe9ff 55%,#9db6e6 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding-left:.14em}
#menu.ios .dmLogo .b{margin-top:10px;font-weight:500;font-size:12px;letter-spacing:.62em;color:rgba(220,232,255,.72);padding-left:.62em}
#menu.ios .dmLogo .ln{width:120px;height:1px;margin:14px auto 0;background:linear-gradient(90deg,transparent,rgba(140,190,255,.8),transparent)}
#menu.ios .dmBtn{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);font-size:18px;font-weight:600;letter-spacing:.02em;color:#fff;cursor:pointer;transition:transform .18s cubic-bezier(.2,.9,.3,1.3),background .18s;box-shadow:0 8px 30px rgba(0,0,0,.25);touch-action:manipulation}
#menu.ios .dmBtn small{font-weight:400;font-size:13px;color:rgba(230,238,255,.55)}
#menu.ios .dmBtn.pr{transform:scale(.97);background:rgba(255,255,255,.14)}
#menu.ios .dmBtn.play{background:linear-gradient(135deg,rgba(80,150,255,.55),rgba(60,110,230,.35));border-color:rgba(150,200,255,.45);font-size:21px;padding:22px}
#menu.ios .dmBtn .chev{opacity:.5;font-weight:300;font-size:22px}
#menu.ios .dmTop{display:flex;align-items:center;gap:10px;margin-bottom:6px}
#menu.ios .dmBack{padding:9px 14px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:15px;font-weight:600;cursor:pointer;touch-action:manipulation}
#menu.ios .dmTitle{font-size:22px;font-weight:600;letter-spacing:.02em}
#menu.ios .dmPanel{border-radius:22px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);padding:14px}
#menu.ios .dmPanel .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
#menu.ios .dmPanel .card{border-radius:16px!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(255,255,255,.1)!important;color:rgba(235,242,255,.75)!important;font-size:12px!important;padding:12px!important}
#menu.ios .dmPanel .card b{display:block;color:#fff;font-size:15px;font-weight:600;margin-bottom:4px}
#menu.ios .dmPanel .card.sel{border-color:rgba(140,190,255,.8)!important;background:rgba(90,150,255,.18)!important}
#menu.ios .dmPanel .chip,#menu.ios .dmPanel .btn{border-radius:14px!important;background:rgba(255,255,255,.07)!important;border:1px solid rgba(255,255,255,.12)!important;color:#eef3ff!important;font-family:inherit!important}
#menu.ios .dmPanel .chip.on,#menu.ios .dmPanel .btn.on{background:rgba(90,150,255,.35)!important;border-color:rgba(150,200,255,.6)!important}
#menu.ios .dmPanel .lbl{color:rgba(220,232,255,.6)!important;font:600 11px -apple-system,sans-serif!important;letter-spacing:.2em;margin:10px 4px 6px}
#menu.ios .dmFoot{text-align:center;font-size:12px;color:rgba(220,232,255,.4);margin-top:8px}
#menu.ios .dmLink{text-align:center;font-size:15px;color:rgba(160,200,255,.85);padding:10px;cursor:pointer}`;document.head.appendChild(css);}
{const _bm=buildMenu;
 const go=v=>{menuView=v;buildMenu();const m=$('menu');m.scrollTop=0;};
 const btn=(cls,html,f)=>{const b=document.createElement('div');b.className='dmBtn '+cls;b.innerHTML=html;b.onclick=()=>{if(performance.now()-(window.__tapT||-1e9)<700)return;sfx&&sfx('ui');f();};return b;};
 buildMenu=function(){const m=$('menu');m.classList.add('ios');
  if(menuView==='home'){m.innerHTML='';const w=document.createElement('div');w.className='dmWrap';m.appendChild(w);
   w.innerHTML='<div class="dmLogo"><div class="a">DOMINION</div><div class="b">ALL DOMAIN WAR</div><div class="ln"></div></div>';
   if(player)w.appendChild(btn('play','Resume <span class="chev">›</span>',()=>setPaused(false)));
   const dv=settings.defVeh&&DEFS[settings.defVeh]?settings.defVeh:'fighter';
   w.appendChild(btn(player?'':'play',`Play <small>${DEFS[dv].name}</small>`,()=>{mission=null;spawn(dv,settings.loc||'airbase');setPaused(false);}));
   w.appendChild(btn('','Free Play <span class="chev">›</span>',()=>go('free')));
   w.appendChild(btn('','Loadout <span class="chev">›</span>',()=>go('loadout')));
   w.appendChild(btn('','Settings <span class="chev">›</span>',()=>go('settings')));
   const ml=document.createElement('div');ml.className='dmLink';ml.textContent='Missions';ml.onclick=()=>{if(performance.now()-(window.__tapT||-1e9)<700)return;go('mis')};w.appendChild(ml);
   const ft=document.createElement('div');ft.className='dmFoot';ft.textContent='Rods from God: Free Play › Rods from God (Orbital KE)';w.appendChild(ft);tapify(m);return;}
  menuTab=menuView==='mis'?'mis':'free';_bm();
  // re-wrap legacy content in a glass panel with a header
  const kids=[...m.children];const w=document.createElement('div');w.className='dmWrap';const top=document.createElement('div');top.className='dmTop';
  const bk=document.createElement('div');bk.className='dmBack';bk.textContent='‹ Back';bk.onclick=()=>{if(performance.now()-(window.__tapT||-1e9)<700)return;go('home')};const tt=document.createElement('div');tt.className='dmTitle';tt.textContent=({free:'Free Play',loadout:'Loadout',settings:'Settings',mis:'Missions'})[menuView];top.append(bk,tt);
  const pn=document.createElement('div');pn.className='dmPanel';kids.forEach(k=>{if(k.matches('h1.logo,.sub,.tabs'))k.remove();else pn.appendChild(k);});w.append(top,pn);m.appendChild(w);
  const rows=[...pn.querySelectorAll('.row')];
  if(menuView==='free'){rows.forEach((r,i)=>{if(i===rows.length-1)r.remove();});}
  if(menuView==='settings'){[...pn.children].forEach(k=>{if(!k.classList.contains('row'))k.remove();});}
  if(menuView==='loadout'){rows.forEach(r=>r.remove());pn.querySelectorAll('.card[data-k]').forEach(c=>{const n=c.cloneNode(true);if(n.dataset.k===(settings.defVeh||'fighter'))n.classList.add('sel');n.onclick=()=>{settings.defVeh=n.dataset.k;saveSettings();buildMenu();};c.replaceWith(n);});
   const l=document.createElement('div');l.className='lbl';l.textContent='TAP A VEHICLE TO SET YOUR PLAY DEFAULT';pn.prepend(l);}
  tapify(m);};}
{const _sp=setPaused;setPaused=function(p){if(p)menuView='home';_sp(p);};}
buildMenu();
// Neill Gaming watermark + launch splash
{const css=document.createElement('style');css.textContent=`#ngMark{position:fixed;right:calc(10px + env(safe-area-inset-right));bottom:calc(8px + env(safe-area-inset-bottom));width:60px;opacity:.35;pointer-events:none;z-index:45}
#ngSplash{position:fixed;inset:0;z-index:100;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;pointer-events:none;transition:opacity .6s ease;font:300 13px -apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:.5em;color:rgba(255,255,255,.75)}
#ngSplash img{width:min(46vw,220px);animation:ngIn 1s cubic-bezier(.2,.9,.25,1) both}@keyframes ngIn{0%{opacity:0;transform:scale(.94)}100%{opacity:1;transform:none}}`;document.head.appendChild(css);
 const w=document.createElement('img');w.id='ngMark';w.src='brand/ng_logo.png';w.alt='';document.body.appendChild(w);
 const s=document.getElementById('ngSplash')||document.createElement('div');s.id='ngSplash';s.innerHTML='<img src="brand/ng_logo.png" alt="Neill Gaming"><div>PRESENTS</div>';document.body.appendChild(s);
 setTimeout(()=>{s.style.opacity=0;setTimeout(()=>s.remove(),700);},5000);}
