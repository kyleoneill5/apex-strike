//UI_MW2-BEGIN  Kyle #1: MW2(2009)-feel interface. Original CSS/SVG only; font Barlow Condensed (SIL OFL, bundled fonts/). Reskins existing DOM, adds NO buttons.
{const F="'DMCond','Barlow Condensed','Arial Narrow',sans-serif";
const css=document.createElement('style');css.id='uiMw2Css';css.textContent=`
@font-face{font-family:DMCond;src:url(fonts/BarlowCondensed-Medium.ttf) format('truetype');font-weight:500;font-display:swap}
@font-face{font-family:DMCond;src:url(fonts/BarlowCondensed-SemiBold.ttf) format('truetype');font-weight:600;font-display:swap}
@font-face{font-family:DMCond;src:url(fonts/BarlowCondensed-Bold.ttf) format('truetype');font-weight:700;font-display:swap}
:root{--mw-g:#9bd14a;--mw-g2:rgba(155,209,74,.85);--mw-w:#f2f2ea;--mw-dim:rgba(230,232,220,.55);--mw-bg:rgba(10,12,10,.72);--mw-ln:rgba(255,255,255,.14);--mw-f:${F}}
/* ===== MENU ===== */
html body #menu.ios{font-family:var(--mw-f)!important;background:radial-gradient(70% 60% at 78% 40%,rgba(70,80,60,.35),transparent 70%),linear-gradient(100deg,#050605 0%,#0b0d0a 45%,#141812 100%)!important;align-items:flex-start!important;padding:calc(18px + env(safe-area-inset-top)) calc(24px + env(safe-area-inset-right)) calc(18px + env(safe-area-inset-bottom)) calc(28px + env(safe-area-inset-left))!important}
html body #menu.ios::before{inset:-30%!important;background:radial-gradient(30% 22% at 30% 40%,rgba(200,210,180,.07),transparent 70%),radial-gradient(28% 24% at 70% 65%,rgba(160,170,140,.08),transparent 70%),radial-gradient(22% 18% at 55% 25%,rgba(255,255,255,.05),transparent 70%)!important;animation:mwSmoke 26s ease-in-out infinite alternate!important;will-change:transform}
html body #menu.ios::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 3px),linear-gradient(90deg,rgba(0,0,0,.55),transparent 55%)}
@keyframes mwSmoke{0%{transform:translate3d(-4%,2%,0) scale(1)}100%{transform:translate3d(5%,-3%,0) scale(1.12)}}
html body #menu.ios .dmWrap{width:min(420px,100%)!important;margin:0!important;gap:2px!important;align-items:stretch}
html body #menu.ios .dmLogo{text-align:left!important;margin:0 0 14px!important}
html body #menu.ios .dmLogo .a{font-family:var(--mw-f)!important;font-weight:700!important;font-size:clamp(34px,7vw,52px)!important;letter-spacing:.06em!important;padding:0!important;background:none!important;color:var(--mw-w)!important;-webkit-text-fill-color:var(--mw-w);text-shadow:0 2px 0 rgba(0,0,0,.6)}
html body #menu.ios .dmLogo .b{font-weight:600!important;font-size:12px!important;letter-spacing:.42em!important;color:var(--mw-g)!important;padding:0!important;margin-top:2px!important}
html body #menu.ios .dmLogo .ln{margin:8px 0 0!important;width:180px!important;background:linear-gradient(90deg,var(--mw-g),transparent)!important}
html body #menu.ios .dmBtn{position:relative;font-family:var(--mw-f)!important;text-transform:uppercase;font-weight:700!important;font-size:22px!important;letter-spacing:.06em!important;padding:9px 14px 9px 16px!important;min-height:46px;border-radius:0!important;background:transparent!important;border:none!important;border-left:3px solid transparent!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:none!important;color:rgba(242,242,234,.82)!important;transition:background .16s ease,color .16s ease,border-color .16s ease,transform .16s ease!important}
html body #menu.ios .dmBtn small{font-family:var(--mw-f);font-weight:500!important;font-size:13px!important;letter-spacing:.08em;color:var(--mw-dim)!important;text-transform:uppercase}
html body #menu.ios .dmBtn .chev{display:none}
html body #menu.ios .dmBtn.play,html body #menu.ios .dmBtn:hover,html body #menu.ios .dmBtn.pr{background:linear-gradient(90deg,rgba(155,209,74,.92),rgba(155,209,74,.55) 60%,rgba(155,209,74,0))!important;color:#0b0e08!important;border-left-color:#fff!important}
html body #menu.ios .dmBtn.play small,html body #menu.ios .dmBtn.pr small{color:rgba(10,14,8,.7)!important}
html body #menu.ios .dmBtn.pr{transform:translateX(4px)!important}
html body #menu.ios #flFree{display:none!important}
html body #menu.ios .dmLink{text-align:left!important;font-family:var(--mw-f);text-transform:uppercase;font-weight:700;font-size:22px!important;letter-spacing:.06em;color:rgba(242,242,234,.82)!important;padding:9px 16px!important;min-height:46px;border-left:3px solid transparent}
html body #menu.ios .dmLink.pr{background:linear-gradient(90deg,rgba(155,209,74,.92),rgba(155,209,74,0))!important;color:#0b0e08!important}
html body #menu.ios .dmFoot{text-align:left!important;font-family:var(--mw-f);letter-spacing:.1em;text-transform:uppercase;color:var(--mw-dim)!important}
#ngMark{opacity:.22!important}
/* player card */
#mwCard{position:fixed;top:calc(16px + env(safe-area-inset-top));right:calc(18px + env(safe-area-inset-right));display:flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;min-width:220px;background:linear-gradient(90deg,rgba(20,24,18,.9),rgba(40,48,34,.75));border:1px solid var(--mw-ln);border-left:3px solid var(--mw-g);font-family:var(--mw-f);color:var(--mw-w);pointer-events:none;z-index:21;animation:mwIn .4s ease both}
#mwCard .t{display:flex;flex-direction:column;line-height:1.05;flex:1}#mwCard .t b{font-size:17px;font-weight:700;letter-spacing:.06em}#mwCard .t span{font-size:11.5px;font-weight:600;letter-spacing:.16em;color:var(--mw-g)}
#mwCard .t b.dia{background:linear-gradient(100deg,#f6d35a 0%,#fff3b8 22%,#ffffff 38%,#bfe8ff 50%,#e0a92a 70%,#fff3b8 85%,#f6d35a 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:mwShim 4s linear infinite}@keyframes mwShim{0%{background-position:100% 0}100%{background-position:-120% 0}}
#mwCard .xp{height:3px;margin-top:5px;background:rgba(255,255,255,.12)}#mwCard .xp i{display:block;height:100%;background:var(--mw-g)}
@keyframes mwIn{0%{opacity:0;transform:translateX(14px)}100%{opacity:1;transform:none}}
@media (orientation:portrait){#mwCard{top:auto;bottom:calc(16px + env(safe-area-inset-bottom));left:calc(18px + env(safe-area-inset-left));right:auto}}
/* pick flow */
html body #menu.ios .flT .s{font-family:var(--mw-f)!important;color:var(--mw-g)!important;letter-spacing:.24em!important}
html body #menu.ios .flT .h{font-family:var(--mw-f)!important;text-transform:uppercase;font-weight:700!important;letter-spacing:.05em!important}
html body #menu.ios .flBack{border-radius:0!important;background:rgba(255,255,255,.06)!important;border:1px solid var(--mw-ln)!important;width:46px!important;height:46px!important}
html body #menu.ios .flDots i{border-radius:0!important;height:4px!important}html body #menu.ios .flDots i.on{background:var(--mw-g)!important}
html body #menu.ios .flSeg{border-radius:0!important;background:rgba(0,0,0,.45)!important;border:none!important;border-bottom:1px solid var(--mw-ln)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:0!important;gap:0!important}
html body #menu.ios .flTab{border-radius:0!important;font-family:var(--mw-f)!important;text-transform:uppercase;font-size:16px!important;font-weight:700!important;letter-spacing:.08em;padding:12px 16px!important;min-height:44px;color:rgba(242,242,234,.6)!important;border-bottom:3px solid transparent;transition:color .16s,background .16s,border-color .16s!important}
html body #menu.ios .flTab.on{background:linear-gradient(0deg,rgba(155,209,74,.28),transparent)!important;color:#fff!important;border-bottom-color:var(--mw-g)!important;box-shadow:none!important}
html body #menu.ios .flCard{border-radius:2px!important;background:linear-gradient(160deg,rgba(40,46,36,.82),rgba(14,16,13,.9))!important;border:1px solid var(--mw-ln)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:0 10px 26px rgba(0,0,0,.5)!important}
html body #menu.ios .flCard.sel{border-color:var(--mw-g)!important;box-shadow:inset 0 0 0 1px var(--mw-g),0 10px 30px rgba(0,0,0,.55)!important;background:linear-gradient(160deg,rgba(80,100,50,.6),rgba(14,16,13,.92))!important}
html body #menu.ios .flArt{border-radius:0!important;background:radial-gradient(80% 90% at 50% 100%,rgba(155,209,74,.16),transparent 70%),repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 1px,transparent 1px 22px),linear-gradient(180deg,rgba(0,0,0,.5),rgba(20,24,18,.4))!important}
html body #menu.ios .flArt .tag{border-radius:0!important;font-family:var(--mw-f);background:var(--mw-g)!important;color:#0b0e08!important}
html body #menu.ios .flName{font-family:var(--mw-f)!important;text-transform:uppercase;font-size:21px!important;letter-spacing:.04em!important}
html body #menu.ios .flDesc{font-family:var(--mw-f);font-size:14px!important;font-weight:500;color:var(--mw-dim)!important}
html body #menu.ios .flStats div{border-radius:0!important;background:rgba(0,0,0,.4)!important;border-left:2px solid var(--mw-g)}html body #menu.ios .flStats b{font-family:var(--mw-f)}html body #menu.ios .flStats span{font-family:var(--mw-f);letter-spacing:.14em}
html body #menu.ios .flSec{font-family:var(--mw-f)!important;color:var(--mw-g)!important;letter-spacing:.22em!important}
html body #menu.ios .flChip{border-radius:0!important;font-family:var(--mw-f);text-transform:uppercase;font-weight:600!important;letter-spacing:.06em;background:rgba(255,255,255,.05)!important;border:1px solid var(--mw-ln)!important;min-height:44px}
html body #menu.ios .flChip.on{background:rgba(155,209,74,.3)!important;border-color:var(--mw-g)!important}
html body #menu.ios .flSum{border-radius:0!important;background:rgba(0,0,0,.4)!important;border:1px solid var(--mw-ln)!important;border-left:3px solid var(--mw-g)!important}
html body #menu.ios .flSum b{font-family:var(--mw-f);text-transform:uppercase}
html body #menu.ios .flGo{border-radius:0!important;font-family:var(--mw-f)!important;font-weight:700!important;letter-spacing:.14em!important;color:#0b0e08!important;background:linear-gradient(90deg,#b5e35a,#8dbf3e)!important;box-shadow:0 8px 26px rgba(120,170,50,.35),inset 0 -3px 0 rgba(0,0,0,.25)!important;clip-path:polygon(0 0,100% 0,100% 70%,97% 100%,0 100%)}
html body #menu.ios .flGo small{color:rgba(10,14,8,.7)!important}
html body #menu.ios .dmTop .dmTitle{font-family:var(--mw-f);text-transform:uppercase;font-weight:700;letter-spacing:.06em}
html body #menu.ios .dmBack{border-radius:0!important;font-family:var(--mw-f);text-transform:uppercase;min-height:44px}
html body #menu.ios .dmPanel{border-radius:0!important;background:rgba(10,12,9,.7)!important;border:1px solid var(--mw-ln)!important;border-left:3px solid var(--mw-g)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
html body #menu.ios .dmPanel .card,html body #menu.ios .dmPanel .chip,html body #menu.ios .dmPanel .btn{border-radius:0!important;font-family:var(--mw-f)!important;text-transform:uppercase;letter-spacing:.05em}
html body #menu.ios .dmPanel .btn.on,html body #menu.ios .dmPanel .chip.on{background:rgba(155,209,74,.35)!important;border-color:var(--mw-g)!important}
html body #menu.ios .dmPanel .lbl{font-family:var(--mw-f)!important;color:var(--mw-g)!important}
/* prestige panel (inside Settings) */
#mwPrest{display:flex;gap:14px;align-items:center;margin:0 0 12px;padding:12px;background:linear-gradient(90deg,rgba(155,209,74,.14),rgba(0,0,0,.3));border:1px solid var(--mw-ln);border-left:3px solid var(--mw-g);font-family:var(--mw-f);color:var(--mw-w)}
#mwPrest .big{flex:none}#mwPrest .i{flex:1;min-width:0}#mwPrest .i b{display:block;font-size:22px;font-weight:700;letter-spacing:.05em}#mwPrest .i span{font-size:12px;letter-spacing:.18em;color:var(--mw-g);font-weight:600}
#mwPrest .row2{display:flex;flex-wrap:nowrap;gap:3px;margin-top:8px}#mwPrest .row2 svg{opacity:.28}#mwPrest .row2 svg.got{opacity:1}
#mwPrest .xp{height:4px;margin-top:6px;background:rgba(255,255,255,.12)}#mwPrest .xp i{display:block;height:100%;background:var(--mw-g)}
#mwPrest .go{margin-top:8px;display:inline-block;padding:11px 18px;min-height:44px;font-size:17px;font-weight:700;letter-spacing:.12em;background:var(--mw-g);color:#0b0e08;cursor:pointer;touch-action:manipulation}
#mwConfirm{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;font-family:var(--mw-f)}
#mwConfirm .b{width:min(420px,88vw);background:linear-gradient(180deg,#1a1f16,#0c0e0b);border:1px solid var(--mw-ln);border-top:3px solid var(--mw-g);padding:18px;color:var(--mw-w);text-align:center}
#mwConfirm h3{margin:6px 0;font-size:24px;letter-spacing:.08em}#mwConfirm p{margin:0 0 14px;color:var(--mw-dim);font-size:15px;letter-spacing:.04em}
#mwConfirm .r{display:flex;gap:10px}#mwConfirm .r div{flex:1;padding:12px;min-height:46px;font-size:18px;font-weight:700;letter-spacing:.12em;border:1px solid var(--mw-ln);cursor:pointer;touch-action:manipulation}#mwConfirm .r .y{background:var(--mw-g);color:#0b0e08;border-color:var(--mw-g)}
@keyframes mwFade{0%{opacity:0}100%{opacity:1}}
/* ===== HUD ===== */
#hud,#hud .panel,#hr,#hc,#hcards,#msg,#kfeed,#gbar,#topb div{font-family:var(--mw-f)!important}
#hr{border-radius:0!important;background:linear-gradient(270deg,rgba(10,12,9,.75),rgba(10,12,9,.35))!important;border:none!important;border-right:3px solid var(--mw-g)!important;font-size:13px!important;font-weight:600!important;letter-spacing:.04em}
#hc{border-radius:0!important;background:rgba(10,12,9,.6)!important;border:none!important;border-bottom:2px solid var(--mw-g)!important;font-weight:700!important;letter-spacing:.12em!important;text-transform:uppercase}
#hcards .hg{border-radius:0!important;background:linear-gradient(90deg,rgba(10,12,9,.75),rgba(10,12,9,.35))!important;border:none!important;border-left:3px solid var(--mw-g)!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
#hcards .hg>i{color:var(--mw-g)!important;letter-spacing:.2em!important}#hcards .hr b{font-family:var(--mw-f)!important;font-weight:700!important}#hcards .hr span{letter-spacing:.12em!important}
#hcards .st div{border-radius:0!important;font-family:var(--mw-f)!important}
#msg{font-family:var(--mw-f)!important;font-weight:700!important;letter-spacing:.14em!important;text-transform:uppercase;color:#fff!important;text-shadow:0 2px 6px rgba(0,0,0,.8)!important}
#kfeed div{border-radius:0!important;background:linear-gradient(270deg,rgba(10,12,9,.7),rgba(10,12,9,.2))!important;border-left:none!important;border-right:3px solid #d9433a!important;font-family:var(--mw-f)!important;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
#cross{border-color:rgba(255,255,255,.75)!important}#cross:after{background:#fff!important}
.tb{font-family:var(--mw-f)!important}
#mwMap{position:fixed;left:calc(10px + var(--sal,env(safe-area-inset-left)));top:calc(8px + var(--sat,env(safe-area-inset-top)));width:92px;height:92px;border-radius:50%;pointer-events:none;z-index:6;background:radial-gradient(circle,rgba(20,26,18,.55),rgba(5,7,5,.8));border:2px solid rgba(220,230,200,.35);box-shadow:0 0 0 1px rgba(0,0,0,.6),inset 0 0 12px rgba(0,0,0,.8);overflow:hidden;display:none}
@media (orientation:landscape) and (max-height:400px){#hcards{transform:scale(.84)!important;max-width:calc(54vw - 110px)!important}}
#mwMap canvas{width:100%;height:100%}
#mwRank{position:absolute;left:-4px;bottom:-6px;width:28px;height:28px}
#mwRank svg{width:28px;height:28px}
#mwKS{position:fixed;display:none;flex-direction:column;gap:5px;pointer-events:none;z-index:6}
#mwKS i{width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:rgba(10,12,9,.6);border-right:2px solid rgba(255,255,255,.25);opacity:.35;transition:opacity .25s,border-color .25s}
#mwKS i.on{opacity:1;border-right-color:var(--mw-g)}#mwKS i svg{width:20px;height:20px}
#mwAmmo{position:fixed;display:none;pointer-events:none;z-index:6;font-family:var(--mw-f);color:#fff;text-align:right;text-shadow:0 1px 3px #000;line-height:1}
#mwAmmo b{font-size:26px;font-weight:700;letter-spacing:.02em}#mwAmmo span{display:block;font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--mw-g);text-transform:uppercase;margin-top:2px;max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mwXP{position:fixed;left:50%;top:41%;transform:translate(-50%,0);font-family:var(--mw-f);font-weight:700;font-size:22px;letter-spacing:.06em;color:#ffe066;text-shadow:0 2px 4px #000;pointer-events:none;z-index:8;animation:mwXP 1.3s ease-out forwards}
.mwXP.rk{color:var(--mw-g);font-size:20px;letter-spacing:.16em}
@keyframes mwXP{0%{opacity:0;transform:translate(-50%,8px) scale(.9)}15%{opacity:1;transform:translate(-50%,0) scale(1.08)}30%{transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-26px)}}
`;document.head.appendChild(css);
const $$=id=>document.getElementById(id);
const tapOK=()=>performance.now()-(window.__tapT||-1e9)>=700;
// ---------- MENU hooks ----------
const card=()=>{const P=window.__prog;if(!P)return;let c=$$('mwCard');if(!c){c=document.createElement('div');c.id='mwCard';}const d=P.d,pc=d.lvl>=P.MAXL?100:Math.round(100*d.xp/P.need(d.lvl));
 c.innerHTML=`${P.badge(40)}<div class="t"><b class="${d.owner?'dia':''}">${d.owner&&d.title?d.title+' · ':''}${d.p?'P'+d.p+' · ':''}LEVEL ${d.lvl}</b><span>${d.lvl>=P.MAXL?(d.p<P.MAXP?'MAX RANK · PRESTIGE IN SETTINGS':'MAX PRESTIGE'):'NEXT '+(d.lvl+1)}</span><div class="xp"><i style="width:${pc}%"></i></div></div>`;return c;};
const prestPanel=()=>{const P=window.__prog;const d=P.d;const p=document.createElement('div');p.id='mwPrest';const pc=d.lvl>=P.MAXL?100:Math.round(100*d.xp/P.need(d.lvl));
 let row0=d.owner?'<span style="color:#f6d35a;letter-spacing:.2em;font-size:12px;font-weight:700;margin-right:6px;align-self:center">GOLD DIAMOND TIER ›</span>'+P.ownerSvg(24).replace('<svg','<svg class="got"'):'';let row='';for(let i=1;i<=P.MAXP;i++)row+=P.prestigeSvg(i,24).replace('<svg',`<svg class="${i<=d.p?'got':''}"`);
 p.innerHTML=`<div class="big">${P.badge(64)}</div><div class="i"><span>${d.p?'PRESTIGE '+d.p:'NO PRESTIGE'} · MAX RANK ${P.MAXL}</span><b>LEVEL ${d.lvl}${d.lvl<P.MAXL?' · '+d.xp+' / '+P.need(d.lvl)+' XP':''}</b><div class="xp"><i style="width:${pc}%"></i></div><div class="row2">${row}</div>${row0?'<div class="row2">'+row0+'</div>':''}</div>`;
 if(P.canPrestige()){const g=document.createElement('div');g.className='go';g.id='mwPrestGo';g.textContent='ENTER PRESTIGE '+(d.p+1);g.onclick=()=>{if(!tapOK())return;confirmP();};p.querySelector('.i').appendChild(g);}
 return p;};
const confirmP=()=>{const P=window.__prog;const o=document.createElement('div');o.id='mwConfirm';o.innerHTML=`<div class="b">${P.prestigeSvg(P.d.p+1,72)}<h3>ENTER PRESTIGE ${P.d.p+1}?</h3><p>Rank resets to Level 1. You keep the Prestige ${P.d.p+1} emblem.</p><div class="r"><div class="n">CANCEL</div><div class="y">PRESTIGE</div></div></div>`;
 o.querySelector('.n').onclick=()=>o.remove();o.querySelector('.y').onclick=()=>{P.prestige();o.remove();try{buildMenu();}catch(e){}};document.body.appendChild(o);};
window.__mwConfirm=confirmP;
const MWM=window.__mwMenu={items:[],add(id,label,fn,o){this.items=this.items.filter(x=>x.id!==id);this.items.push({id,label,fn,ownerOnly:!!(o&&o.ownerOnly)});try{if(menuView==='home')buildMenu();}catch(e){}}};
const _bm=buildMenu;buildMenu=function(){_bm.apply(this,arguments);const m=$$('menu');const old=$$('mwCard');if(old)old.remove();
 if(menuView==='home'){const c=card();if(c)m.appendChild(c);const w=m.querySelector('.dmWrap');const P=window.__prog;const own=P&&P.d.owner;
  if(w)MWM.items.forEach(it=>{if(it.ownerOnly&&!own)return;const b=document.createElement('div');b.className='dmBtn';b.id=it.id;b.textContent=it.label;b.onclick=()=>{if(!tapOK())return;try{it.fn();}catch(e){console.warn(e)}};const ref=w.querySelector('#flSet');w.insertBefore(b,ref||null);});}
 if(menuView==='settings'&&window.__prog){const pn=m.querySelector('.dmPanel')||m.querySelector('.dmWrap');if(pn)pn.prepend(prestPanel());}};
try{if($$('menu')&&$$('menu').style.display!=='none')buildMenu();}catch(e){}
// ---------- HUD ----------
const map=document.createElement('div');map.id='mwMap';map.innerHTML='<canvas width="184" height="184"></canvas><div id="mwRank"></div>';document.body.appendChild(map);
const ks=document.createElement('div');ks.id='mwKS';const KSI=[
 "<svg viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.8'><circle cx='12' cy='12' r='8'/><path d='M12 12L18 6'/><circle cx='12' cy='12' r='2' fill='white'/></svg>",
 "<svg viewBox='0 0 24 24' fill='white'><path d='M12 2l2.5 5v9l2.5 3v3l-5-2-5 2v-3l2.5-3V7z'/></svg>",
 "<svg viewBox='0 0 24 24' fill='white'><path d='M2 12l8-2 2-7 2 7 8 2-8 2-2 7-2-7z'/></svg>"],KSN=[3,5,7];
const KAD="<svg viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.6' stroke-linejoin='round'><path d='M3 20h18'/><path d='M5 20l2-5h10l2 5' fill='rgba(255,255,255,.25)'/><path d='M8 15l3-9 2 .7-2.6 8.3'/><path d='M13 15l4-8 1.8 1-3.4 7'/><path d='M17 4.5c1.5-1 3-1 4 0' /><path d='M18 2.5c1-.6 2-.6 2.8 0'/></svg>";
ks.innerHTML=KSI.map(s=>`<i>${s}</i>`).join('');document.body.appendChild(ks);
const am=document.createElement('div');am.id='mwAmmo';am.innerHTML='<b></b><span></span>';document.body.appendChild(am);
const pop=(t,cls)=>{const e=document.createElement('div');e.className='mwXP'+(cls?' '+cls:'');e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1350);};
let streak=0,lastP=null,xpAcc=0,xpT=0;
if(window.__prog){__prog.on((ev,x)=>{if(ev==='xp'){streak++;xpAcc+=x;clearTimeout(xpT);xpT=setTimeout(()=>{pop('+'+xpAcc);xpAcc=0;},120);}if(ev==='rank')setTimeout(()=>pop('RANK UP · LEVEL '+x,'rk'),500);if(ev==='prestige')pop('PRESTIGE '+x,'rk');});}
const ctx=map.querySelector('canvas').getContext('2d');
const vis=e=>{if(!e)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return null;const r=e.getBoundingClientRect();return r.width>0?r:null;};
const lay=()=>{let pl;try{pl=player;}catch(e){}const menuOn=$$('menu')&&$$('menu').style.display!=='none';const on=!!pl&&!menuOn&&!document.body.classList.contains('hudOff');
 if(pl!==lastP){streak=0;lastP=pl;}
 map.style.display=ks.style.display=am.style.display=on?'':'none';if(!on)return;ks.style.display='flex';
 // minimap: map sits top-left; push #hcards to its right
 const hc=$$('hcards');if(hc){hc.style.setProperty('left','calc(110px + var(--sal,0px))','important');hc.style.setProperty('top','calc(8px + var(--sat,0px))','important');}
 const R=document.getElementById('mwRank');if(R&&window.__prog){const k=__prog.d.p+':'+__prog.d.lvl;if(R.dataset.k!==k){R.dataset.k=k;R.innerHTML=__prog.badge(28);}}
 // thumb cluster bounds
 let L=innerWidth,T=innerHeight;['bFire','bWpn','bCtx','bCam','thr','bFlr','bRc'].forEach(id=>{const r=vis($$(id));if(r&&r.top>innerHeight*0.35){L=Math.min(L,r.left);T=Math.min(T,r.top);}});
 const sab=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab'))||0;
 am.style.right=(innerWidth-L+12)+'px';am.style.bottom=(sab+10)+'px';
 const hr=vis($$('hr'));const top=(hr?hr.bottom:60)+8;const sar=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sar'))||0;
 ks.style.right=(sar+12)+'px';ks.style.top=top+'px';ks.style.display=(T-top>3*35+6)?'flex':'none';
 const MP=!!(window.__mp&&__mp.active)||document.body.classList.contains('mp');const third=ks.children[2];if(third&&third.dataset.m!==String(MP)){third.dataset.m=String(MP);third.innerHTML=MP?KAD:KSI[2];}
 [...ks.children].forEach((e,i)=>{const was=e.classList.contains('on'),now=streak>=KSN[i];e.classList.toggle('on',now);if(now&&!was&&MP&&i===2){pop('AIR DEFENSE BATTERY READY','rk');try{window.__mwKS&&__mwKS.onEarn&&__mwKS.onEarn('airdef');}catch(x){}}});
 const w=pl.weapons&&pl.weapons[pl.wi];am.querySelector('b').textContent=w&&pl.ammo&&pl.ammo[w]!=null?(pl.ammo[w]===Infinity?'∞':pl.ammo[w]):'';am.querySelector('span').textContent=w||'';
 // draw minimap
 const c=ctx,S=184,h=S/2;c.clearRect(0,0,S,S);c.strokeStyle='rgba(220,230,200,.12)';c.lineWidth=1;for(let r=30;r<h;r+=30){c.beginPath();c.arc(h,h,r,0,7);c.stroke();}
 const m=pl.mesh;if(!m)return;const e=m.matrixWorld.elements;const yaw=Math.atan2(e[8],e[10]);const px=m.position.x,pz=m.position.z,RNG=6000;
 let tg=[];try{tg=targets||[];}catch(x){}
 c.fillStyle='#e0473c';for(const t of tg){const p=t.mesh&&t.mesh.position||t.pos;if(!p||t.dead)continue;let dx=p.x-px,dz=p.z-pz;const ca=Math.cos(-yaw),sa=Math.sin(-yaw);let x=dx*ca-dz*sa,z=dx*sa+dz*ca;const d=Math.hypot(x,z);if(d>RNG){x*=RNG/d;z*=RNG/d;}c.beginPath();c.arc(h-x/RNG*(h-8),h-z/RNG*(h-8),4,0,7);c.fill();}
 c.fillStyle='#fff';c.beginPath();c.moveTo(h,h-10);c.lineTo(h+7,h+8);c.lineTo(h,h+4);c.lineTo(h-7,h+8);c.closePath();c.fill();};
let fr=0;const loop=()=>{fr++;if(fr%6===0){try{lay();}catch(e){}}requestAnimationFrame(loop);};requestAnimationFrame(loop);
window.__mwLay=lay;window.__mwKS=window.__mwKS||{onEarn:null,reset:()=>{streak=0;}};}
//UI_MW2-END