// ===== missile FPV: seeker overlay, IR/TV look, auto-FPV on launch, shake, smooth chase<->FPV blend =====
{const css=document.createElement('style');css.textContent=`#fpv{position:fixed;inset:0;pointer-events:none;z-index:6;display:none;font:13px monospace;color:#d8ffd8;text-shadow:0 0 3px #000}
#fpv svg{position:absolute;left:50%;top:50%;width:min(60vw,60vh);height:min(60vw,60vh);transform:translate(-50%,-50%)}#fpvT{position:absolute;left:50%;top:calc(50% + min(31vw,31vh));transform:translateX(-50%);white-space:pre;text-align:center}
#fpv .vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55))}canvas.ir{filter:grayscale(1) contrast(1.35) brightness(1.1)}`;document.head.appendChild(css);
 const d=document.createElement('div');d.id='fpv';d.innerHTML=`<div class="vig"></div><svg viewBox="-100 -100 200 200" fill="none" stroke="#d8ffd8" stroke-width="1.2"><circle r="38"/><path d="M-90 0H-46M46 0H90M0-90V-46M0 46V90"/><path d="M-12 0H-4M4 0H12M0-12V-4M0 4V12"/><path d="M-70-70h12M-70-70v12M70-70h-12M70-70v12M-70 70h12M-70 70v-12M70 70h-12M70 70v-12"/></svg><div id="fpvT"></div>`;document.body.appendChild(d);
 const bar=$('gbar');const mk=(id,t,f)=>{const e=document.createElement('div');e.className='gb';e.id=id;e.textContent=t;bar.insertBefore(e,$('gInfo'));e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();f();});return e;};
 mk('gBst','BOOST',()=>{if(GUIDE.cd>0)return;GUIDE.boostT=4;GUIDE.cd=10;msg('TERMINAL BOOST - 2x AGILITY',1);});
 mk('gAF','AUTO FPV: '+(settings.fpvAuto?'ON':'OFF'),()=>{settings.fpvAuto=!settings.fpvAuto;saveSettings();$('gAF').textContent='AUTO FPV: '+(settings.fpvAuto?'ON':'OFF');});
 mk('gIR','IR: '+(settings.fpvIR?'ON':'OFF'),()=>{settings.fpvIR=!settings.fpvIR;saveSettings();$('gIR').textContent='IR: '+(settings.fpvIR?'ON':'OFF');});}
{const _add=addProj;addProj=function(o){const r=_add(o);if(settings.fpvAuto&&camFollow===o)GUIDE.nose=true;return r;};}
const FPVB={k:0,from:new THREE.Vector3(),fq:new THREE.Quaternion()};
{const _uc=updCamera;let lastNose=false;updCamera=function(dt){const pre=camera.position.clone(),pq=camera.quaternion.clone();_uc(dt);const o=camFollow;const on=!!(GUIDE.nose&&o&&o.vel&&!blastCam);
 if(on!==lastNose){FPVB.k=1;FPVB.from.copy(pre);FPVB.fq.copy(pq);lastNose=on;}
 if(FPVB.k>0){FPVB.k=Math.max(0,FPVB.k-dt/0.45);const e=FPVB.k*FPVB.k*(3-2*FPVB.k);camera.position.lerp(FPVB.from,e);camera.quaternion.slerp(FPVB.fq,e);}
 const nb=$('gNose');if(nb)nb.textContent=GUIDE.nose?'CHASE CAM':'FPV';
 $('fpv').style.display=on?'block':'none';renderer.domElement.classList.toggle('ir',on&&!!settings.fpvIR);
 if(on){const sp=o.vel.length();const sh=Math.min(0.25,sp/8000);camera.position.x+=(Math.random()-0.5)*sh;camera.position.y+=(Math.random()-0.5)*sh;
  let tg=o.tg&&o.tg.pos?o.tg.pos:o.tgt||null;let rng=tg?o.pos.distanceTo(tg):NaN;
  if(!tg){const d=o.vel.clone().normalize();if(d.y<-0.02){const t=(o.pos.y-groundAt(o.pos.x,o.pos.z).h)/-o.vel.y;rng=sp*t;}}
  $('fpvT').textContent=`RNG ${isFinite(rng)?(rng>2000?(rng/1000).toFixed(1)+' km':Math.round(rng)+' m'):'---'}   TTI ${isFinite(rng)?(rng/Math.max(sp,1)).toFixed(1)+' s':'---'}\nALT ${Math.round(o.pos.y)} m   SPD ${Math.round(sp*3.6)} km/h  M${(sp/340).toFixed(1)}   ${(GUIDE.g||0).toFixed(0)} G${GUIDE.boostT>0?'  BOOST':''}`;}};}
