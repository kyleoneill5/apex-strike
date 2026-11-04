//GPLAY_THUMB – two-thumb landscape layout on top of gplay.js: left thumb flies (floating stick, left half), right thumb fires.
// FIRE sits at the natural right-thumb rest point; WPN / LAUNCH(ctx) / FLARE / CAM fan out on a reachable arc around the thumb pivot; throttle moves up the right edge.
const THUMB={on:false};
{const css=document.createElement('style');css.textContent=`
body.thumb #bFire,body.thumb #bWpn,body.thumb #bCtx,body.thumb #bFlr,body.thumb #bRc,body.thumb #bCam{transition:transform .12s cubic-bezier(.3,1.6,.5,1),opacity .2s;touch-action:none}
body.thumb #bFire:active,body.thumb #bWpn:active,body.thumb #bCtx:active,body.thumb #bFlr:active,body.thumb #bCam:active,body.thumb .pr{transform:scale(.92)}
body.thumb #thumbArc{position:fixed;pointer-events:none;z-index:4;border-radius:50%;border:1px dashed rgba(255,255,255,.10)}`;document.head.appendChild(css);
 const arc=document.createElement('div');arc.id='thumbArc';document.body.appendChild(arc);
 const sa=k=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue(k))||0;
 const probe=document.createElement('div');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;padding:var(--sat,env(safe-area-inset-top)) var(--sar,env(safe-area-inset-right)) var(--sab,env(safe-area-inset-bottom)) var(--sal,env(safe-area-inset-left))';document.body.appendChild(probe);
 let SR={};const set=(el,x,y,s)=>{if(!el)return;x=Math.max(SR.l+s/2+6,Math.min(SR.r-s/2-6,x));y=Math.max(SR.t+s/2+6,Math.min(SR.b-s/2-6,y));(THUMB.rects=THUMB.rects||[]).push([x-s/2,y-s/2,x+s/2,y+s/2]);const st=el.style;st.setProperty('left',(x-s/2)+'px','important');st.setProperty('top',(y-s/2)+'px','important');st.setProperty('right','auto','important');st.setProperty('bottom','auto','important');st.setProperty('width',s+'px','important');st.setProperty('height',s+'px','important');};
 const clr=el=>{if(!el)return;for(const k of['left','top','right','bottom','width','height'])el.style.removeProperty(k);};
 const IDS=['bFire','bWpn','bCtx'];
 THUMB.layout=function(){const W=innerWidth,H=innerHeight;const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart'in window;const land=W>H;const want=touch&&land&&H<=520;
  if(!want){if(THUMB.on){THUMB.on=false;document.body.classList.remove('thumb');IDS.forEach(i=>clr(document.getElementById(i)));clr(document.getElementById('thr'));arc.style.display='none';}return;}
  THUMB.on=true;document.body.classList.add('thumb');const cs=getComputedStyle(probe);const sr=parseFloat(cs.paddingRight)||0,sb=parseFloat(cs.paddingBottom)||0,st=parseFloat(cs.paddingTop)||0;
  // pivot = base of the right thumb (just off the bottom-right corner, inside the safe area)
  const sl=parseFloat(cs.paddingLeft)||0;SR={l:sl,r:W-sr,t:st,b:H-sb};THUMB.rects=[];const thE=document.getElementById('thr'),thW=thE?(thE.offsetWidth||58):0;const px=W-sr-(thE?thW+30:18),py=H-sb+6;const r1=H*0.33,r2=H*0.62;const pol=(r,deg)=>[px+r*Math.cos(deg*Math.PI/180),py+r*Math.sin(deg*Math.PI/180)];
  // proven grid on the right-thumb arc: [id,right,bottom,size] from the safe-area corner (verified overlap-free 852..956 wide)
  const G=[['bFire',90,26,100],['bWpn',210,22,66],['bCtx',196,104,66]];
  for(const [id,rr,bb,sz] of G){const e=document.getElementById(id);if(e)set(e,W-sr-rr-sz/2,H-sb-bb-sz/2,sz);}
  arc.style.display='block';Object.assign(arc.style,{left:(px-r2)+'px',top:(py-r2)+'px',width:(2*r2)+'px',height:(2*r2)+'px'});
  const t=thE;if(t){const hr=document.getElementById('hr');const hb=hr&&getComputedStyle(hr).display!=='none'?hr.getBoundingClientRect().bottom:st;const h=Math.max(72,Math.min(180,H-sb-22-(hb+10)));const q=t.style;q.setProperty('right',(sr+12)+'px','important');q.setProperty('top','auto','important');q.setProperty('left','auto','important');q.setProperty('bottom',(sb+22)+'px','important');q.setProperty('height',h+'px','important');}};
 {const rc=document.getElementById('bRc'),tb=document.getElementById('topb');if(rc&&tb){tb.insertBefore(rc,tb.firstChild);const st=document.createElement('style');st.textContent='#topb #bRc{position:static!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;border-radius:999px!important;margin:0!important;right:auto!important;bottom:auto!important;font-size:12px!important}';document.head.appendChild(st);}}
 addEventListener('resize',()=>THUMB.layout());addEventListener('orientationchange',()=>setTimeout(THUMB.layout,250));setInterval(()=>THUMB.layout(),600);THUMB.layout();
 const bf=document.getElementById('bFire');if(bf){bf.style.setProperty('touch-action','none');}
}
try{window.__milsim.thumb=THUMB;}catch(e){}
