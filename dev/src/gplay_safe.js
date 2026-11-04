// ===== gplay_safe.js (controls team, wrap-only; load AFTER gplay.js): iOS HUD toggle polish + safe-area / 44pt / no-overlap guard =====
{const css=document.createElement('style');css.id='gsafeCss';css.textContent=`
:root{--sat:env(safe-area-inset-top,0px);--sab:env(safe-area-inset-bottom,0px);--sal:env(safe-area-inset-left,0px);--sar:env(safe-area-inset-right,0px);--spr:cubic-bezier(.32,1.25,.42,1);--ease:cubic-bezier(.25,.1,.25,1)}
html body #bHud{width:44px!important;height:44px!important;min-width:44px!important;padding:0!important;left:calc(10px + var(--sal))!important;top:calc(10px + var(--sat))!important;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;transition:transform .32s var(--spr),background .25s var(--ease),box-shadow .25s var(--ease)!important;box-shadow:0 4px 14px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.18)}
html body #bHud::before{width:20px;height:20px;transition:opacity .22s var(--ease),transform .32s var(--spr)}
html body #bHud.pr{transform:scale(.88)!important;background:rgba(255,255,255,.24)!important}
html body.hudOff #bHud{background:rgba(255,255,255,.9)!important;border-color:rgba(255,255,255,.95)!important}
html body.hudOff #bHud::before{filter:invert(1) brightness(.15);transform:rotate(-8deg)}
/* smooth hide/show of every readout card; hidden cards never eat touches */
html body #hcards,html body #hr,html body #hc,html body #nhR,html body #nhL,html body #nhA,html body #rodHud{transition:opacity .34s var(--ease),transform .42s var(--spr),filter .34s var(--ease)!important;will-change:opacity,transform}
html body.hudOff #hcards,html body.hudOff #hr,html body.hudOff #hc,html body.hudOff #nhR,html body.hudOff #nhL,html body.hudOff #nhA,html body.hudOff #rodHud{opacity:0!important;filter:blur(6px);pointer-events:none!important}
html body.hudOff #hcards{transform:translateY(-6px) scale(.96)!important}
html body.hudOff #hr{transform:translateY(-6px) scale(.96)!important;transform-origin:top right}
html body.hudOff #nhL,html body.hudOff #nhA{transform:translateY(-50%) scale(.94)!important}
html body.hudOff #nhR{transform:translateX(-50%) scale(.94)!important}
#gsToast{position:fixed;left:50%;top:34%;transform:translate(-50%,-8px) scale(.94);opacity:0;pointer-events:none;z-index:40;padding:8px 16px;border-radius:999px;background:rgba(18,24,34,.55);-webkit-backdrop-filter:blur(20px) saturate(170%);backdrop-filter:blur(20px) saturate(170%);border:1px solid rgba(255,255,255,.16);color:#fff;font:600 12.5px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;letter-spacing:.02em;transition:opacity .25s var(--ease),transform .38s var(--spr)}
#gsToast.on{opacity:1;transform:translate(-50%,0) scale(1)}
/* 44pt touch targets: visual size kept, hit area grown */
html body #gbar .gb{min-height:44px!important;box-sizing:border-box;display:flex;align-items:center}
html body #gView .sg{min-height:38px;display:flex;align-items:center;justify-content:center;box-sizing:border-box}
html body #gView{min-height:44px;box-sizing:border-box}
html body #topb div{min-width:44px!important;min-height:44px!important}
html body .tb,html body #bHud,html body #topb div{touch-action:manipulation}
`;document.head.appendChild(css);
const hb=document.getElementById('bHud');
const toast=document.createElement('div');toast.id='gsToast';document.body.appendChild(toast);let tt=0;
const sync=()=>{const off=document.body.classList.contains('hudOff');if(hb){hb.setAttribute('role','switch');hb.setAttribute('aria-checked',off?'false':'true');}return off;};
if(hb){sync();
 hb.addEventListener('pointerdown',()=>{hb.classList.add('pr');},true);
 const up=()=>hb.classList.remove('pr');['pointerup','pointercancel','pointerleave'].forEach(ev=>hb.addEventListener(ev,up));
 // gplay.js toggles the class on pointerdown; observe the result and give feedback
 new MutationObserver(()=>{const off=sync();toast.textContent=off?'HUD Hidden':'HUD Shown';toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),1100);try{if(navigator.vibrate&&window.__tapOK)navigator.vibrate(8);}catch(e){}})
  .observe(document.body,{attributes:true,attributeFilter:['class'],attributeOldValue:true});}
// ---- safe-area / overlap guard: exposed for overlap tests, and logs once per layout in dev (?safe=1) ----
const SEL='#bHud,#bFire,#bWpn,#bCtx,#bCam,#thr,#bYawL,#bYawR,#bFlr,#bMute,#bRc,#bAP,#topb>div,#gView,#gbar>.gb';
const vis=e=>{if(!e)return false;let p=e;while(p&&p.nodeType===1){const cs=getComputedStyle(p);if(cs.display==='none'||cs.visibility==='hidden')return false;p=p.parentElement;}const cs=getComputedStyle(e);if(+cs.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
const insets=()=>{const d=document.createElement('div');d.style.cssText='position:fixed;visibility:hidden;top:var(--sat);left:var(--sal);right:var(--sar);bottom:var(--sab)';document.body.appendChild(d);const r=d.getBoundingClientRect();d.remove();return{t:r.top,l:r.left,r:innerWidth-r.right,b:innerHeight-r.bottom};};
window.__gsafeCheck=()=>{const sa=insets(),W=innerWidth,H=innerHeight,I=[],P=[];
 document.querySelectorAll(SEL).forEach(e=>{if(vis(e))I.push({n:e.id||e.className||e.tagName,r:e.getBoundingClientRect(),btn:1});});
 document.querySelectorAll('#hcards,#hr,#hc').forEach(e=>{if(vis(e))I.push({n:e.id,r:e.getBoundingClientRect(),btn:0});});
 const ov=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>0.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>0.5;
 for(let i=0;i<I.length;i++){const a=I[i];
  if(a.btn&&(a.r.width<43.5||a.r.height<43.5))P.push(`small ${a.n} ${Math.round(a.r.width)}x${Math.round(a.r.height)}`);
  if(a.r.left<sa.l-0.5||a.r.right>W-sa.r+0.5||a.r.top<sa.t-0.5||a.r.bottom>H-sa.b+0.5)P.push('unsafe '+a.n);
  for(let j=i+1;j<I.length;j++){const b=I[j];if(!a.btn&&!b.btn)continue;if(ov(a.r,b.r))P.push(`overlap ${a.n} x ${b.n}`);}}
 return{W,H,sa,n:I.length,P};};
if(/[?&]safe=1/.test(location.search)){let lt=0;const run=()=>{clearTimeout(lt);lt=setTimeout(()=>{const r=window.__gsafeCheck();console.log('[gsafe]',r.W+'x'+r.H,r.P.length?r.P.join('; '):'OK');},500);};addEventListener('resize',run);addEventListener('orientationchange',run);run();}
}
