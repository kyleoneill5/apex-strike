// ===== gplay_cams.js (sea builder, CONTROLS team): polish layer on top of gplay.js — missile CHASE cam (spring-damped, speed FOV, bank, terrain clamp, boost shake)
// and futuristic NOSE-CAM HUD (flight-path marker, heading tape, boost ring, G meter, ground-proximity cue). Wrap-only: no edits to gplay.js. NO auto-targeting.
{const V=()=>new THREE.Vector3();const S={p:V(),v:V(),on:false,fov0:null,fov:0,roll:0,prevD:V(),shk:0};const _iq=new THREE.Quaternion(),_a=V(),_b=V(),_c=V(),_d=V(),UP=new THREE.Vector3(0,1,0);
 const $$=id=>document.getElementById(id);
 // ---------- extra nose HUD elements (added into gplay's #nhud) ----------
 const css=document.createElement('style');css.textContent=`
#nhud .tape{position:absolute;left:50%;top:calc(76px + var(--sat,0px));transform:translateX(-50%);width:min(56vw,320px);height:26px;overflow:hidden;border-radius:13px;background:rgba(5,20,30,.28);border:1px solid rgba(140,235,255,.28);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent);mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent)}
#nhud .tape i{position:absolute;top:0;height:100%;font:600 10px var(--sf,-apple-system);color:#bff4ff;font-style:normal;display:flex;align-items:center;justify-content:center;width:40px;margin-left:-20px;letter-spacing:.05em}
#nhud .tape i::after{content:'';position:absolute;bottom:2px;left:50%;width:1px;height:5px;background:rgba(190,245,255,.6)}
#nhud .tape .ptr{position:absolute;left:50%;top:-1px;width:0;height:0;border:5px solid transparent;border-top-color:#e8fbff;transform:translateX(-50%)}
#nhud .hdg{position:absolute;left:50%;top:calc(106px + var(--sat,0px));transform:translateX(-50%);font:600 13px var(--sf,-apple-system);color:#e8fbff;font-variant-numeric:tabular-nums;text-shadow:0 0 8px rgba(110,230,255,.6)}
#nhud .gpw{position:absolute;left:50%;bottom:calc(26% + var(--sab,0px));transform:translateX(-50%) scale(.96);padding:7px 16px;border-radius:999px;font:700 12px var(--sf,-apple-system);letter-spacing:.24em;color:#fff;background:rgba(255,59,48,.55);border:1px solid rgba(255,140,130,.7);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);opacity:0;transition:opacity .2s,transform .2s;pointer-events:none}
#nhud .gpw.on{opacity:1;transform:translateX(-50%) scale(1);animation:gpwP .6s ease-in-out infinite alternate}
@keyframes gpwP{to{background:rgba(255,59,48,.8)}}
#nhud{transition:opacity .35s ease}
`;document.head.appendChild(css);
 const nh=$$('nhud');let FPM=null,BR=null,GM=null,TAPE=null,HDG=null,GPW=null;
 if(nh){const svg=nh.querySelector('svg');const ns='http://www.w3.org/2000/svg';
  const el=(t,a,p=svg)=>{const e=document.createElementNS(ns,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e;};
  // flight-path marker (where the missile is actually going, vs where the nose points)
  FPM=el('g',{opacity:'0.95'});el('circle',{r:'7','stroke-width':'1.6'},FPM);el('path',{d:'M-7 0h-11M7 0h11M0-7v-8','stroke-width':'1.6'},FPM);
  // boost ring (arc around reticle, fills while boost is active / shows ready)
  el('circle',{r:'34','stroke-opacity':'.18','stroke-width':'3'});BR=el('circle',{r:'34','stroke-width':'3',stroke:'#7df9ff','stroke-dasharray':'0 214','transform':'rotate(-90)','stroke-linecap':'round'});
  // G meter arc (lower-left)
  el('path',{d:'M-120 120 A170 170 0 0 1 -165 40','stroke-opacity':'.2','stroke-width':'4'});GM=el('path',{d:'M-120 120 A170 170 0 0 1 -165 40','stroke-width':'4',stroke:'#7df9ff','stroke-dasharray':'0 100','pathLength':'100'});
  el('text',{x:'-150',y:'136',fill:'#bff4ff',stroke:'none','font-size':'9','letter-spacing':'2'}).textContent='G';
  // heading tape + digital heading
  TAPE=document.createElement('div');TAPE.className='tape';let h='';for(let d=-360;d<=720;d+=15){const n=((d%360)+360)%360;const lab=n%90?(n%45?String(n).padStart(3,'0'):''):['N','E','S','W'][n/90];h+=`<i data-d="${d}">${lab||'·'}</i>`;}TAPE.innerHTML=h+'<div class="ptr"></div>';nh.appendChild(TAPE);
  HDG=document.createElement('div');HDG.className='hdg';nh.appendChild(HDG);GPW=document.createElement('div');GPW.className='gpw';GPW.textContent='PULL UP';nh.appendChild(GPW);}
 const tapeW=()=>TAPE?TAPE.clientWidth:300;const PX=4;// px per degree on tape
 // ---------- camera wrap ----------
 const _uc=updCamera;updCamera=function(dt){_uc(dt);dt=Math.min(dt||0.016,0.05);
  const o=camFollow,live=!!(o&&o.vel&&o.pos&&typeof blastCam!=='undefined'&&!blastCam);
  if(S.fov0===null)S.fov0=camera.fov;
  // ---- CHASE: replace gplay's rigid placement with a critically damped spring + cinematic extras ----
  if(live&&GUIDE.chase&&!GUIDE.nose){const sp=o.vel.length();if(sp>1){_a.copy(o.vel).divideScalar(sp);
    const L0=o.type==='ballistic'?36:o.type==='rod'?16:9;const Z=(window.__milsim&&__milsim.FL&&__milsim.FL.zoom)||1;const L=L0*Math.max(0.6,Math.min(2.2,Z))*(1+Math.min(0.5,sp/3000));
    const want=_b.copy(o.pos).addScaledVector(_a,-L).addScaledVector(UP,L*0.24);
    if(!S.on){S.p.copy(camera.position);S.v.set(0,0,0);S.prevD.copy(_a);S.on=true;S.roll=0;}
    // spring: omega 9 (snappy but smooth on 60/120 Hz ProMotion)
    const w=9;_c.copy(S.p).sub(want);_d.copy(S.v).addScaledVector(_c,w).multiplyScalar(dt);S.v.addScaledVector(_d,-w).multiplyScalar(1/(1+w*dt+0.48*w*w*dt*dt+0.235*w*w*w*dt*dt*dt));S.p.copy(want).add(_c.add(_d));
    // never lag more than 0.6 L behind (fast missiles), never under the ground/sea
    if(S.p.distanceTo(want)>L*0.6)S.p.lerp(want,0.5);const gh=Math.max(typeof terrainH==='function'?terrainH(S.p.x,S.p.z):0,0)+2;if(S.p.y<gh&&o.pos.y>gh)S.p.y=gh;
    camera.position.copy(S.p);
    // bank with turn rate (yaw rate around world up), eased, max 22 deg
    const yr=Math.atan2(S.prevD.x*_a.z-S.prevD.z*_a.x,S.prevD.x*_a.x+S.prevD.z*_a.z)/dt;S.prevD.copy(_a);S.roll+=(Math.max(-0.38,Math.min(0.38,-yr*0.35))-S.roll)*(1-Math.exp(-dt*4));
    camera.up.copy(UP);camera.lookAt(_c.copy(o.pos).addScaledVector(_a,L*1.6));camera.rotateZ(S.roll);
    // boost: micro shake + FOV punch; speed: FOV widens with Mach (sense of speed)
    S.shk+=((GUIDE.boostT>0?1:0)-S.shk)*(1-Math.exp(-dt*6));if(S.shk>0.01){const t=performance.now()*0.05;camera.rotateX(Math.sin(t*1.7)*0.003*S.shk);camera.rotateY(Math.sin(t*2.3)*0.003*S.shk);}
    const tf=S.fov0+Math.min(16,sp/340*3.2)+S.shk*5;S.fov+=(tf-(S.fov||S.fov0))*(1-Math.exp(-dt*3));camera.fov=S.fov;camera.updateProjectionMatrix();}}
  else{if(S.on){S.on=false;}if(S.fov&&Math.abs(camera.fov-S.fov0)>0.05&&!GUIDE.nose){S.fov+=(S.fov0-S.fov)*(1-Math.exp(-dt*5));camera.fov=S.fov;camera.updateProjectionMatrix();}else if(S.fov&&!GUIDE.nose){camera.fov=S.fov0;S.fov=0;camera.updateProjectionMatrix();}}
  // ---- NOSE HUD extras ----
  if(live&&GUIDE.nose&&nh){const svgW=nh.querySelector('svg').clientWidth||300,k=400/svgW;
   // flight path marker: project velocity direction into camera space -> svg units
   _a.copy(o.vel).normalize().applyQuaternion(_iq.copy(camera.quaternion).invert());
   if(_a.z<-0.05){const f=(window.innerHeight/2)/Math.tan(camera.fov*Math.PI/360);const x=_a.x/-_a.z*f*k,y=-_a.y/-_a.z*f*k;const cx=Math.max(-140,Math.min(140,x)),cy=Math.max(-140,Math.min(140,y));FPM.setAttribute('transform',`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);FPM.style.opacity=(Math.abs(x)>140||Math.abs(y)>140)?'.35':'.95';}
   // boost ring
   const bt=GUIDE.boostT||0,bmax=GUIDE.boostMax||3;const frac=bt>0?Math.min(1,bt/bmax):(GUIDE.boostCd>0?1-Math.min(1,GUIDE.boostCd/(GUIDE.boostCdMax||6)):1);BR.setAttribute('stroke-dasharray',`${(frac*213.6).toFixed(1)} 214`);BR.setAttribute('stroke',bt>0?'#ffd60a':frac>=1?'#7df9ff':'#5ac8fa');
   // G meter
   GM.setAttribute('stroke-dasharray',`${Math.min(100,(GUIDE.g||0)/40*100).toFixed(0)} 100`);GM.setAttribute('stroke',(GUIDE.g||0)>30?'#ff9f0a':'#7df9ff');
   // heading tape
   const f=_c.set(0,0,-1).applyQuaternion(camera.quaternion);let hd=(Math.atan2(f.x,-f.z)*180/Math.PI+360)%360;if(HDG)HDG.textContent=String(Math.round(hd)%360).padStart(3,'0')+'°';
   if(TAPE){const W=tapeW();for(const i of TAPE.children){if(!i.dataset||i.dataset.d===undefined)continue;i.style.left=(W/2+(+i.dataset.d-hd)*PX)+'px';}}
   // ground proximity cue (no targeting, purely terrain): descending and < 3 s to ground
   const agl=o.pos.y-Math.max(typeof terrainH==='function'?terrainH(o.pos.x,o.pos.z):0,0);const vz=o.vel.y;GPW.classList.toggle('on',vz<-5&&agl/(-vz)<3&&o.type!=='rod'&&o.type!=='ballistic');}
  else if(GPW)GPW.classList.remove('on');
 };
 window.__playCams=S;}
