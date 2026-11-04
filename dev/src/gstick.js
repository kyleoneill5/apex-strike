// ===== GSTICK: fixed bottom-left stick (only touches starting inside it steer), open screen = pinch/camera; trimmed thumb cluster =====
{const css=document.createElement('style');css.textContent=`
html body #joyZone{left:calc(var(--sal,0px) + 8px)!important;bottom:calc(var(--sab,0px) + 12px)!important;top:auto!important;width:170px!important;height:170px!important;border-radius:50%!important}
html body #joy{left:calc(var(--sal,0px) + 18px)!important;bottom:calc(var(--sab,0px) + 22px)!important;top:auto!important;opacity:.85!important}
html body #bFlr{display:none!important}
body.noCtx #bCtx{display:none!important}
#topb #bCam{position:static!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;border-radius:999px!important;margin:0!important;padding:0!important;font-size:0!important;background-size:20px!important;background-position:center!important}
@media (orientation:portrait){#topb #bCam,#topb #bRc{position:fixed!important;right:calc(var(--sar) + 10px)!important;left:auto!important}#topb #bCam{top:44%!important}#topb #bRc{top:calc(44% + 54px)!important}}`;document.head.appendChild(css);
 const tb=document.getElementById('topb'),cam=document.getElementById('bCam');if(tb&&cam)tb.insertBefore(cam,tb.firstChild);
 const Z0=document.getElementById('joyZone'),J=document.getElementById('joy'),K=document.getElementById('knob');
 if(Z0&&J&&K){const Z=Z0.cloneNode(false);Z0.replaceWith(Z);let jid=null,cx=0,cy=0;const R=60;
  const mv=e=>{let dx=(e.clientX-cx)/R,dy=(e.clientY-cy)/R;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}
   joy.x=Math.sign(dx)*Math.pow(Math.abs(dx),1.4);joy.y=-Math.sign(dy)*Math.pow(Math.abs(dy),1.4);K.style.transform=`translate3d(${dx*45}px,${dy*45}px,0)`;};
  Z.addEventListener('pointerdown',e=>{if(jid!==null)return;e.preventDefault();e.stopPropagation();jid=e.pointerId;try{Z.setPointerCapture(jid);}catch(_){}const r=J.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;J.classList.add('act');mv(e);});
  Z.addEventListener('pointermove',e=>{if(e.pointerId===jid)mv(e);},{passive:true});
  const up=e=>{if(e.pointerId!==jid)return;jid=null;joy.x=joy.y=0;J.classList.remove('act');K.style.transform='';};
  Z.addEventListener('pointerup',up);Z.addEventListener('pointercancel',up);}
 const ctxNeed=()=>{const c=player&&player.def&&player.def.cls;return !!c&&!['air','heli'].includes(c);};
 setInterval(()=>document.body.classList.toggle('noCtx',!ctxNeed()),400);document.body.classList.add('noCtx');
}
