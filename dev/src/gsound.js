// ---------- Sampled audio engine (real CC0 recordings, Web Audio: HRTF panning, distance, speed-of-sound delay, altitude muffling) ----------
const SND={buf:{},loops:{},muted:localStorage.getItem('milsim_mute')==='1',ready:false,lastBoom:0,lastGun:0,ping:0};window.__snd=SND;
const SND_FILES=['rocket','rocket_deep','missile','flyby','jet','jet_flyby','rotor','ship','waves','sonar','torpedo','explosion','nuke','boom','collapse','glass','debris','alarm','plasma','gun'];
function sndInit(){const C=AU.ctx;if(!C||SND.ready)return;SND.ready=true;
 try{AU.eG.disconnect();AU.oG.disconnect();}catch(e){}
 SND.bus=C.createGain();SND.bus.gain.value=SND.muted?0:1;SND.comp=C.createDynamicsCompressor();SND.comp.threshold.value=-14;SND.comp.ratio.value=4;SND.bus.connect(SND.comp).connect(C.destination);AU.master.gain.value=SND.muted?0:0.6;
 SND.air=C.createBiquadFilter();SND.air.type='lowpass';SND.air.frequency.value=18000;SND.air.connect(SND.bus);
 const b=C.createBuffer(1,1,22050);const s=C.createBufferSource();s.buffer=b;s.connect(C.destination);s.start(0); // iOS unlock
 for(const k of SND_FILES)fetch('sounds/'+k+'.m4a').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(a=>C.decodeAudioData(a)).then(d=>{SND.buf[k]=d;}).catch(()=>{});}
['pointerdown','touchend','keydown'].forEach(e=>addEventListener(e,()=>{audioInit();if(AU.ctx){if(AU.ctx.state!=='running')AU.ctx.resume();sndInit();}},{passive:true}));
function loop(k){const C=AU.ctx;if(!C||!SND.buf[k])return null;let L=SND.loops[k];if(L)return L;
 const s=C.createBufferSource();s.buffer=SND.buf[k];s.loop=true;const g=C.createGain();g.gain.value=0;s.connect(g).connect(SND.air);s.start(0,Math.random()*Math.max(0,SND.buf[k].duration-1));return SND.loops[k]={s,g};}
function setLoop(k,gain,rate=1){const L=loop(k);if(!L)return;const t=AU.ctx.currentTime;L.g.gain.setTargetAtTime(gain,t,0.12);L.s.playbackRate.setTargetAtTime(clamp(rate,0.4,2.5),t,0.15);}
function play3D(k,pos,vol=1,rate=1,minD=60){const C=AU.ctx;if(!C||!SND.buf[k]||SND.muted)return;const d=pos?pos.distanceTo(camera.position):0;const delay=pos&&d>300?d/343:0;
 const s=C.createBufferSource();s.buffer=SND.buf[k];s.playbackRate.value=rate;const g=C.createGain();g.gain.value=vol;let n=s.connect(g);
 if(pos){const p=C.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=minD;p.rolloffFactor=0.9;p.maxDistance=1e6;p.positionX.value=pos.x;p.positionY.value=pos.y;p.positionZ.value=pos.z;
  const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=clamp(20000*Math.exp(-d/6000),300,20000);n=n.connect(lp).connect(p);}
 n.connect(SND.air);s.start(C.currentTime+Math.min(delay,30));}
SND.toggle=()=>{SND.muted=!SND.muted;localStorage.setItem('milsim_mute',SND.muted?'1':'0');if(SND.bus)SND.bus.gain.value=SND.muted?0:1;if(AU.master)AU.master.gain.value=SND.muted?0:0.6;const b=$('bMute');if(b)b.textContent=SND.muted?'🔇':'🔊';};
{const b=document.createElement('div');b.id='bMute';b.textContent=SND.muted?'🔇':'🔊';b.style.cssText='position:fixed;top:calc(8px + env(safe-area-inset-top));left:50%;margin-left:150px;z-index:40;font-size:18px;padding:4px 8px;background:rgba(0,0,0,.35);border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none';
 b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();SND.toggle();});document.body.appendChild(b);}
// one-shot hooks
{const _ex=explosion;explosion=function(p,s=1){_ex(p,s);play3D('explosion',p.clone?p.clone():p,Math.min(1.5,0.5+s*0.4),1.05-Math.min(0.3,s*0.08),80*s);if(s>=2.5)play3D('debris',p.clone(),0.6,1,100);};}
{const _nk=nukeDetonate;nukeDetonate=function(p,...a){const r=_nk(p,...a);play3D('nuke',p.clone(),1.6,0.8,4000);play3D('explosion',p.clone(),1.4,0.55,4000);if(p.distanceTo(CITY_C)<4000){play3D('collapse',p.clone(),1.2,0.9,3000);play3D('glass',p.clone(),0.8,1,2000);}return r;};}
const CITY_C=V3(NYC.x,0,NYC.z);
{const _ap=addProj;addProj=function(o){const r=_ap(o);const p=o.pos&&o.pos.clone();
 if(o.type==='missile'||o.type==='hyper'||o.type==='sam')play3D('missile',p,1,o.type==='hyper'?0.85:1,40);
 else if(o.type==='torpedo')play3D('torpedo',p,0.8,1,30);else if(o.type==='ballistic')play3D('rocket',p,1.3,0.9,200);
 else if(o.type==='bullet'){const n=performance.now();if(n-SND.lastGun>110){SND.lastGun=n;play3D('gun',p,0.5,1,30);}}return r;};}
// per-frame: listener, engine layers by thrust/RPM, altitude/space muffling, sonic boom, sonar
{const _ue=updEnv;let prevMach=0;updEnv=function(dt=0.016){_ue(dt);const C=AU.ctx;if(!C||!SND.ready)return;const L=C.listener;const cp=camera.position;const f=V3(0,0,-1).applyQuaternion(camera.quaternion),u=V3(0,1,0).applyQuaternion(camera.quaternion);
 if(L.positionX){L.positionX.value=cp.x;L.positionY.value=cp.y;L.positionZ.value=cp.z;L.forwardX.value=f.x;L.forwardY.value=f.y;L.forwardZ.value=f.z;L.upX.value=u.x;L.upY.value=u.y;L.upZ.value=u.z;}else{L.setPosition(cp.x,cp.y,cp.z);L.setOrientation(f.x,f.y,f.z,u.x,u.y,u.z);}
 const v=player;const want={};if(v&&v.alive!==false&&!paused){const c=v.def.cls,th=inp.throttle;
  const h=c==='rocket'&&v.os?Math.max(0,v.os.h):cp.y;const rho=Math.exp(-h/8500);SND.air.frequency.setTargetAtTime(clamp(18000*Math.pow(rho,1.3),140,18000),C.currentTime,0.3);
  const near=camFollow?0.4:1;
  if(c==='air'){const sp=v.vel?v.vel.length():0;want.jet=[(0.25+0.6*th)*near,0.8+th*0.35+sp/3000];if(th>0.85)want.rocket_deep=[0.35*near,1.25];want.plasma=[clamp((sp-900)/1500,0,0.6),1];}
  else if(c==='heli')want.rotor=[0.5+0.5*th,0.85+th*0.3];
  else if(c==='ship'||c==='sub'){const under=c==='sub'&&v.mesh.position.y<-4;want.ship=[0.35+0.35*th,0.8+th*0.3];if(!under)want.waves=[0.35,1];}
  else if(c==='rocket'&&v.os){const on=v.os.engine&&v.os.throttle>0;const deep=v.def.rk==='starship';const vib=Math.max(rho,0.08);
   if(on){want.rocket=[1.1*vib,deep?0.78:1];want.rocket_deep=[0.9*vib,deep?0.7:0.95];}
   const sp=Math.hypot(v.os.vs,v.os.vh);if(!on&&v.os.h<90000&&v.os.h>25000&&sp>2500)want.plasma=[0.7,0.8];}
  if(!cp.y||cp.y>-2)want.waves=want.waves||[clamp(0.25-cp.y/2000,0,0.25),1];
  if(cp.y<-2)SND.air.frequency.setTargetAtTime(600,C.currentTime,0.2);
  const m=typeof lastMach!=='undefined'?lastMach:0;const mm=c==='air'&&v.vel?v.vel.length()/340:m;if(prevMach<1&&mm>=1&&simT-SND.lastBoom>4){SND.lastBoom=simT;play3D('boom',v.mesh.position.clone().add(V3(0,0,600).applyQuaternion(v.mesh.quaternion)),1.2,1,400);}prevMach=mm;
  if(c==='sub'&&v.mesh.position.y<-4){SND.ping-=dt;if(SND.ping<=0){SND.ping=7;play3D('sonar',null,0.5,1);}}}
 for(const k of ['jet','rocket','rocket_deep','rotor','ship','waves','plasma','torpedo']){const w=want[k];if(w)setLoop(k,SND.muted?0:w[0],w[1]);else if(SND.loops[k])setLoop(k,0,1);}};}
