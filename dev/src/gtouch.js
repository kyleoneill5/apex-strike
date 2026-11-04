// ===== v4 touch UI: floating joystick, inertial throttle slider, larger safe-area buttons =====
{const css=document.createElement('style');css.textContent=`
#joyZone{position:absolute;left:0;top:90px;bottom:0;width:52%;pointer-events:auto;touch-action:none}
#joy{pointer-events:none!important;opacity:.35;transition:opacity .25s,left .0s,top .0s;background:radial-gradient(circle,rgba(255,255,255,.10),rgba(255,255,255,.03) 70%)!important;border:1.5px solid rgba(255,255,255,.28)!important;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);will-change:transform}
#joy.act{opacity:1}
#knob{background:radial-gradient(circle at 40% 35%,rgba(255,255,255,.55),rgba(220,235,255,.22))!important;box-shadow:0 2px 10px rgba(0,0,0,.35);transition:transform .22s cubic-bezier(.2,.9,.3,1.2);will-change:transform}
#joy.act #knob{transition:none}
#thr{-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border:1.5px solid rgba(255,255,255,.28)!important;width:62px!important;height:210px!important;touch-action:none}
#thrf{background:linear-gradient(to top,rgba(90,230,140,.45),rgba(160,255,190,.2))!important;transition:none}
.tb{min-width:62px;min-height:62px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);background:rgba(20,28,36,.38)!important;border:1.5px solid rgba(255,255,255,.3)!important;transition:transform .1s ease,background .1s ease;will-change:transform;touch-action:none}
.tb.pr{transform:scale(.92);background:rgba(255,255,255,.22)!important}
#hud,#rocketHud{transition:opacity .3s ease}`;document.head.appendChild(css);
 const tch=$('touch'),J=$('joy'),K=$('knob');const Z=document.createElement('div');Z.id='joyZone';tch.insertBefore(Z,tch.firstChild);
 const home=()=>{J.style.left='';J.style.top='';J.style.bottom='';};let jid=null,cx=0,cy=0;const R=60;
 const mv=e=>{let dx=(e.clientX-cx)/R,dy=(e.clientY-cy)/R;const l=Math.hypot(dx,dy);if(l>1){ // knob drags the base along (follows the thumb)
   cx+=(dx/l)*(l-1)*R;cy+=(dy/l)*(l-1)*R;dx/=l;dy/=l;place();}
  joy.x=Math.sign(dx)*Math.pow(Math.abs(dx),1.4);joy.y=-Math.sign(dy)*Math.pow(Math.abs(dy),1.4);K.style.transform=`translate3d(${dx*45}px,${dy*45}px,0)`;};
 const place=()=>{J.style.left=(cx-75)+'px';J.style.top=(cy-75)+'px';J.style.bottom='auto';};
 Z.addEventListener('pointerdown',e=>{e.preventDefault();jid=e.pointerId;try{Z.setPointerCapture(jid);}catch(_){}cx=e.clientX;cy=e.clientY;place();J.classList.add('act');mv(e);});
 Z.addEventListener('pointermove',e=>{if(e.pointerId===jid)mv(e);},{passive:true});
 const up=e=>{if(e.pointerId!==jid)return;jid=null;joy.x=joy.y=0;J.classList.remove('act');K.style.transform='';setTimeout(()=>{if(jid===null)home();},260);};
 Z.addEventListener('pointerup',up);Z.addEventListener('pointercancel',up);
 // throttle: replace with inertial slider
 const T0=$('thr'),T=T0.cloneNode(true);T0.replaceWith(T);let tid=null,tgt=null;
 const tm=e=>{const b=T.getBoundingClientRect();tgt=clamp(1-(e.clientY-b.top)/b.height,0,1);if(tgt<0.04)tgt=0;if(tgt>0.97)tgt=1;};
 T.addEventListener('pointerdown',e=>{e.preventDefault();tid=e.pointerId;try{T.setPointerCapture(tid);}catch(_){}tm(e);});T.addEventListener('pointermove',e=>{if(e.pointerId===tid)tm(e);},{passive:true});
 T.addEventListener('pointerup',()=>tid=null);T.addEventListener('pointercancel',()=>tid=null);
 let last=performance.now();const loop=t=>{const dt=Math.min(0.05,(t-last)/1000);last=t;if(tgt!=null){inp.throttle+=(tgt-inp.throttle)*(1-Math.exp(-dt*9));if(Math.abs(tgt-inp.throttle)<0.002){inp.throttle=tgt;if(tid===null)tgt=null;}const f=$('thrf');if(f)f.style.height=(inp.throttle*100)+'%';}requestAnimationFrame(loop);};requestAnimationFrame(loop);
 window.__touch={zone:Z};}
