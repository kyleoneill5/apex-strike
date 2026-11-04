// ---------- NYC city ----------
const CITY={x0:NYC.x-900,z0:NYC.z-2500,cs:60,nx:30,nz:84,h:null};
(function buildCity(){CITY.h=new Float32Array(CITY.nx*CITY.nz);const list=[];
 for(let i=0;i<CITY.nx;i++)for(let j=0;j<CITY.nz;j++){if(i%4===3||j%3===2)continue;const x=CITY.x0+i*CITY.cs+30,z=CITY.z0+j*CITY.cs+30;
  const zf=(z-CITY.z0)/(CITY.nz*CITY.cs);const core=Math.max(Math.exp(-Math.pow((zf-0.15)/0.08,2)),Math.exp(-Math.pow((zf-0.45)/0.12,2))*1.1);
  if(Math.abs(i-14.5)<2&&zf>0.55&&zf<0.75)continue; // park
  let h=18+hash(i,j)*40+core*(60+hash(j,i)*260);if(i===15&&j===38)h=440;CITY.h[i*CITY.nz+j]=6+h;list.push([x,z,h,hash(i*3,j)]);}
 const geo=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);const tex=canvasTex(128,256,(c,w,h)=>{c.fillStyle='#9a9ea4';c.fillRect(0,0,w,h);for(let y=4;y<h;y+=8){c.fillStyle='#7d8288';c.fillRect(0,y+6,w,2);for(let x=3;x<w;x+=8){const r=Math.random();c.fillStyle=r<0.15?'#c9d6e2':r<0.7?'#2c3a4a':'#45566a';c.fillRect(x,y,6,6);}}});
 const rough=canvasTex(128,256,(c,w,h)=>{c.fillStyle='#d0d0d0';c.fillRect(0,0,w,h);for(let y=4;y<h;y+=8)for(let x=3;x<w;x+=8){c.fillStyle='#202020';c.fillRect(x,y,6,6);}},false);
 const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({map:tex,roughnessMap:rough,roughness:1,metalness:0.55,envMapIntensity:1.4}),list.length);const m=new THREE.Matrix4(),col=new THREE.Color();
 list.forEach((b,k)=>{m.makeScale(44,b[2],44);tex.repeat.set(1,1);m.setPosition(b[0],6,b[1]);im.setMatrixAt(k,m);col.setHSL(0.58,0.05,0.55+b[3]*0.35);im.setColorAt(k,col);});scene.add(im);
 const top=new THREE.Mesh(new THREE.ConeGeometry(6,60,6),M(0xcccccc));top.position.set(CITY.x0+15*60+30,6+440+30,CITY.z0+38*60+30);scene.add(top);
 const park=new THREE.Mesh(new THREE.PlaneGeometry(220,0.2*84*60).rotateX(-Math.PI/2),M(0x3d7a3a));park.position.set(CITY.x0+14.5*60+30,6.2,CITY.z0+0.65*84*60);scene.add(park);})();
function cityH(x,z){const i=Math.floor((x-CITY.x0)/CITY.cs),j=Math.floor((z-CITY.z0)/CITY.cs);if(i<0||j<0||i>=CITY.nx||j>=CITY.nz)return 0;
 const lx=(x-CITY.x0)-i*CITY.cs,lz=(z-CITY.z0)-j*CITY.cs;if(Math.abs(lx-30)>22||Math.abs(lz-30)>22)return 0;return CITY.h[i*CITY.nz+j];}
// ---------- spawn locations ----------
const LOCS={airbase:'Airbase',carrier:'Carrier at sea',nyc:'New York City',pad:'Launch pad',silo:'Missile silo',ocean:'Open ocean'};
function applySpawnLoc(v,loc){const c=v.def.cls,p=v.mesh.position;
 if(c==='silo'||c==='rocket'||v.kind==='carrier'&&loc!=='ocean')return;
 if(v.kind==='fa18'&&loc==='airbase')loc='carrier';
 if(loc==='airbase'&&!(v.kind==='fa18'))return; // defaults
 const air=c==='air'||c==='heli';const sea=c==='ship'||c==='sub';
 const air0=(pos,hdg,alt)=>{p.set(pos.x,alt,pos.z);v.mesh.rotation.set(0,hdg,0);v.mesh.quaternion.setFromEuler(v.mesh.rotation);if(c==='air'){v.vel.copy(fwdOf(v.mesh.quaternion,V3())).multiplyScalar(v.kind==='darkstar'?400:200);inp.throttle=0.8;}else{inp.throttle=0.5;v.yaw=hdg;}v.onGround=false;};
 if(loc==='carrier'){if(v.kind==='carrier'){return;}if(air){const cp=fleetCarrier.position;p.set(cp.x+6+(c==='heli'?-15:0),cp.y+21+2,cp.z+(c==='heli'?40:130));v.mesh.rotation.set(0,0,0);v.onGround=true;inp.throttle=0;if(c==='heli')v.yaw=0;}
  else if(sea){p.set(CARRIER_POS.x-300,0,CARRIER_POS.z+250);}}
 else if(loc==='nyc'){if(air)air0(V3(NYC.x+3500,0,NYC.z+5000),Math.atan2(3500,5000),c==='heli'?250:900);else if(sea)p.set(NYC.x-3200,0,NYC.z+4500);}
 else if(loc==='pad'||loc==='silo'){const q=loc==='pad'?PAD:SILO;if(air)air0(V3(q.x+600,0,q.z+3000),0,c==='heli'?150:700);}
 else if(loc==='ocean'){const o=V3(0,0,24000);if(v.kind==='carrier'){fleetCarrier.position.set(o.x,0,o.z);return;}if(air)air0(o,0,c==='heli'?120:800);else if(sea)p.set(o.x+500,0,o.z);}
 if(sea){v.hdg=0;}camOffReset();}
function camOffReset(){if(typeof camOff!=='undefined')camOff.set(0,10,40);}
// ---------- audio ----------
const AU={ctx:null};
function audioInit(){if(AU.ctx)return;try{const C=new (window.AudioContext||window.webkitAudioContext)();AU.ctx=C;AU.master=C.createGain();AU.master.gain.value=0.6;AU.master.connect(C.destination);
 const len=C.sampleRate*2,buf=C.createBuffer(1,len,C.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;AU.noise=buf;
 const ns=C.createBufferSource();ns.buffer=buf;ns.loop=true;AU.eF=C.createBiquadFilter();AU.eF.type='lowpass';AU.eF.frequency.value=600;AU.eG=C.createGain();AU.eG.gain.value=0;ns.connect(AU.eF).connect(AU.eG).connect(AU.master);ns.start();
 AU.osc=C.createOscillator();AU.osc.type='sawtooth';AU.oG=C.createGain();AU.oG.gain.value=0;const of=C.createBiquadFilter();of.type='lowpass';of.frequency.value=2500;AU.osc.connect(of).connect(AU.oG).connect(AU.master);AU.osc.start();
 AU.lfo=C.createOscillator();AU.lfo.frequency.value=0;AU.lfoG=C.createGain();AU.lfoG.gain.value=0;AU.lfo.connect(AU.lfoG).connect(AU.eG.gain);AU.lfo.start();}catch(e){AU.ctx=null;}}
['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,()=>{audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();},{passive:true}));
function sfx(type,vol=1){const C=AU.ctx;if(!C||paused)return;const t=C.currentTime;const g=C.createGain();g.connect(AU.master);
 const noise=(dur,f0,f1,q=1,ft='lowpass')=>{const s=C.createBufferSource();s.buffer=AU.noise;const f=C.createBiquadFilter();f.type=ft;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);s.connect(f).connect(g);s.start(t,Math.random());s.stop(t+dur+0.05);};
 const tone=(dur,f0,f1,type='sine')=>{const o=C.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);o.connect(g);o.start(t);o.stop(t+dur+0.05);};
 const env=(a,dur,peak)=>{g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak*vol,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);};
 if(type==='gun'){env(0.003,0.07,0.25);noise(0.07,3000,800,1,'bandpass');}
 else if(type==='missile'){env(0.05,1.4,0.5);noise(1.4,400,2500,2,'bandpass');}
 else if(type==='boom'){env(0.01,1.6,1.0);noise(1.6,1400,60);tone(0.6,120,40);}
 else if(type==='sonic'){env(0.005,0.8,1.0);noise(0.8,900,80);tone(0.3,70,35,'square');}
 else if(type==='nuke'){env(0.02,9,1.4);noise(9,900,25);tone(6,55,20);}
 else if(type==='sonar'){env(0.01,2.2,0.35);tone(2.2,1150,1120);}
 else if(type==='splash'){env(0.02,0.8,0.4);noise(0.8,2500,300,1,'bandpass');}
 else if(type==='hit'){env(0.005,0.15,0.3);tone(0.15,1400,700,'square');}
 else if(type==='launch'){env(0.3,6,1.0);noise(6,300,120);}
 else if(type==='ui'){env(0.005,0.1,0.2);tone(0.1,900,1200);}}
let machPrev=0,sonarT=0;
function audioUpd(dt){const C=AU.ctx;if(!C||!player)return;const v=player,c=v.def.cls,t=C.currentTime;let eg=0,ef=600,og=0,of=100,lf=0,lg=0;
 if(paused||!v.alive){}else if(c==='air'){const th=inp.throttle;eg=0.12+th*0.25;ef=500+th*2500;og=0.03+th*0.05;of=180+th*520+v.vel.length()*0.3;
  const m=v.vel.length()/340;if(machPrev<1&&m>=1){sfx('sonic');msg('💥 SONIC BOOM - MACH 1',1.2);shake=Math.max(shake,0.4);}machPrev=m;}
 else if(c==='heli'){eg=0.25+inp.throttle*0.25;ef=380;lf=17;lg=0.2;}
 else if(c==='ship'||c==='sub'){eg=0.05+inp.throttle*0.12;ef=180;if(c==='sub'&&v.depth>5){sonarT-=dt;if(sonarT<=0){sonarT=6;sfx('sonar');}}}
 else if(c==='rocket'){const os=v.os;if(os.engine&&os.launched&&os.stages[os.stage].prop>0){const air=Math.exp(-os.h/8500);eg=0.15+0.6*air;ef=200+300*air;og=0.05*air;of=45;}}
 if(camFollow&&camFollow.type==='ballistic'&&camFollow.t<camFollow.boostT){eg=Math.max(eg,0.45);ef=250;}
 AU.eG.gain.setTargetAtTime(eg,t,0.1);AU.eF.frequency.setTargetAtTime(ef,t,0.1);AU.oG.gain.setTargetAtTime(og,t,0.1);AU.osc.frequency.setTargetAtTime(of,t,0.1);AU.lfo.frequency.setTargetAtTime(lf,t,0.1);AU.lfoG.gain.setTargetAtTime(lg,t,0.1);}
// ---------- hit feedback ----------
const popEl=document.createElement('div');popEl.style.cssText='position:fixed;left:50%;top:42%;transform:translate(-50%,-50%);font:bold 22px system-ui;color:#ff5;text-shadow:0 0 6px #000;pointer-events:none;opacity:0;transition:opacity .5s,top .5s;z-index:6';document.body.appendChild(popEl);
let kills=0;
{const _kt=killTarget;killTarget=function(t,big){if(!t.alive)return;kills++;_kt(t,big);const d=camera.position.distanceTo(t.pos);sfx('boom',clamp(1-d/9000,0.15,1));sfx('hit',0.6);
 popEl.textContent=(t.kind==='boat'?'+100 SHIP SUNK':'+150 DRONE DOWN');popEl.style.transition='none';popEl.style.opacity=1;popEl.style.top='42%';requestAnimationFrame(()=>{popEl.style.transition='opacity 1.2s ease-in,top 1.2s';popEl.style.opacity=0;popEl.style.top='36%';});
 if(d<3000)shake=Math.max(shake,0.35*(1-d/3000));};}
{const _nd=nukeDetonate;nukeDetonate=function(p){_nd(p);sfx('nuke');};}
{const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons[v.wi];const ok=_fw(v);if(ok){if(w==='GUN'||w==='CIWS')sfx('gun');else if(w==='TORPEDO')sfx('splash');else if(w==='ICBM'||w==='SLBM')sfx('launch');else if(w!=='NUKE')sfx('missile');}return ok;};}
{const _ex=explosion;explosion=function(p,s=1){_ex(p,s);if(s>=2&&camera.position.distanceTo(p)<2500)shake=Math.max(shake,0.2*s);};}
// ---------- missions ----------
const MISSIONS=[
 {id:'landing',name:'Booster Recovery',veh:'falcon9',loc:'pad',desc:'Launch Falcon 9 and land the booster on the drone ship. Score = landing accuracy.',limit:1500},
 {id:'drones',name:'Drone Hunter',veh:'fighter',loc:'airbase',desc:'Take off and destroy 6 targets in 4 minutes.',limit:240,goal:6},
 {id:'carq',name:'Carrier Qualification',veh:'fa18',loc:'carrier',desc:'Launch from the carrier, climb above 300 m, then land back on the deck.',limit:420},
 {id:'orbit',name:'Reach Orbit',veh:'rocket',loc:'pad',desc:'Fly the launch vehicle into a stable orbit (periapsis > 100 km). Score = speed + fuel left.',limit:1200},
 {id:'sub',name:'Silent Hunter',veh:'sub',loc:'airbase',desc:'Dive and sink 3 enemy ships with torpedoes.',limit:420,goal:3},
 {id:'dark',name:'Darkstar: Outrun',veh:'darkstar',loc:'ocean',desc:'Enemy SAMs (Mach 3.5) are launched at you. Survive 90 s — go hypersonic!',limit:90},
 {id:'icbm',name:'Strategic Strike',veh:'silo',loc:'silo',desc:'Destroy 5 targets at the enemy range 40 km away using ICBMs.',limit:240,goal:5}];
const best=JSON.parse(localStorage.getItem('apex_best')||'{}');let mission=null;const eMissiles=[];
function startMission(m){settings.unlimited=false;spawn(m.veh,m.loc);mission={m,t:0,kills0:kills,stage:0,done:false,spawnT:8};for(const e of eMissiles)scene.remove(e.mesh);eMissiles.length=0;setPaused(false);msg('MISSION: '+m.name+'\n'+m.desc,5);}
function endMission(ok,sc){if(!mission||mission.done)return;mission.done=true;const m=mission.m;sc=Math.max(0,Math.round(sc||0));let nb=false;if(ok&&sc>(best[m.id]||0)){best[m.id]=sc;nb=true;localStorage.setItem('apex_best',JSON.stringify(best));}
 sfx(ok?'ui':'boom');setTimeout(()=>{if(!mission||mission.m!==m)return;const r=$('result');r.style.display='flex';r.innerHTML=`<div class="box" style="text-align:center"><h1 style="color:${ok?'#8f8':'#f66'}">${ok?'MISSION COMPLETE':'MISSION FAILED'}</h1><div style="font-size:18px">${m.name}</div>
  <div style="font-size:30px;margin:10px;color:#ff6">${ok?'SCORE '+sc:''}</div><div>${nb?'🏆 NEW BEST!':'Best: '+(best[m.id]||0)}</div><div class="row"><div class="btn" id="rRetry">RETRY</div><div class="btn" id="rMenu">MENU</div><div class="btn" id="rFree">KEEP FLYING</div></div></div>`;
  $('rRetry').onclick=()=>{r.style.display='none';startMission(m);};$('rMenu').onclick=()=>{r.style.display='none';mission=null;setPaused(true);};$('rFree').onclick=()=>{r.style.display='none';mission=null;};},1500);}
function missionUpd(dt){if(!mission||mission.done)return;const M_=mission,m=M_.m,v=player;M_.t+=dt;const k=kills-M_.kills0;const left=m.limit-M_.t;
 if(!v.alive&&m.id!=='orbit'){endMission(false);return;}
 if(m.id==='drones'||m.id==='sub'||m.id==='icbm'){if(k>=m.goal)endMission(true,left*20+k*500);}
 else if(m.id==='carq'){if(M_.stage===0&&v.mesh.position.y>300){M_.stage=1;msg('Now land back on the carrier deck!\nSlow down, gentle descent',3);}if(M_.stage===1&&v.onGround&&groundAt(v.mesh.position.x,v.mesh.position.z).type==='deck'&&v.vel.length()<60){endMission(true,3000+left*10);}}
 else if(m.id==='landing'){if(!v.alive)endMission(false);}
 else if(m.id==='orbit'){if(v.os.orbit&&!v.os.engine)endMission(true,20000-v.os.t*10+v.os.stages[1].prop/10);if(!v.alive||v.os.crashed)endMission(false);}
 else if(m.id==='dark'){M_.spawnT-=dt;if(M_.spawnT<=0){M_.spawnT=7;spawnSAM();}if(left<=0)endMission(true,5000+v.vel.length()*2);}
 if(left<=0&&m.id!=='dark')endMission(false);}
function spawnSAM(){const p=player.mesh.position;const a=Math.random()*6.28;const o=V3(p.x+Math.cos(a)*10000,0,p.z+Math.sin(a)*10000);const mesh=missileMesh(5,0.3,0xaa2222);mesh.position.copy(o);scene.add(mesh);
 eMissiles.push({pos:o,vel:V3(0,300,0),mesh,life:30});msg('⚠ SAM LAUNCH DETECTED',1.5);sfx('missile',0.6);}
function updSAMs(dt){for(let i=eMissiles.length-1;i>=0;i--){const e=eMissiles[i];e.life-=dt;const pp=player.mesh.position;const dir=e.vel.clone().normalize();const want=pp.clone().sub(e.pos).normalize();
 const ang=dir.angleTo(want);if(ang>1e-4)dir.lerp(want,Math.min(1,2.0*dt/ang)).normalize();const sp=Math.min(1200,e.vel.length()+300*dt);e.vel.copy(dir).multiplyScalar(sp);e.pos.addScaledVector(e.vel,dt);
 e.mesh.position.copy(e.pos);e.mesh.lookAt(_t.copy(e.pos).sub(dir));smoke.spawn(_t.copy(e.pos).addScaledVector(dir,-3),rnd(1),rnd(1),rnd(1),2,2,3,0.9,0.9,0.9,0.5);fire.spawn(_t,0,0,0,0.1,2,0,1,0.6,0.3,1);
 let dead=e.life<=0;if(player.alive&&e.pos.distanceTo(pp)<25){crash('HIT BY SAM');dead=true;}if(dead){explosion(e.pos,1.5);scene.remove(e.mesh);eMissiles.splice(i,1);}}}
function missionHud(){if(!mission||mission.done)return '';const m=mission.m;const left=Math.max(0,m.limit-mission.t);let s=`${m.name}  ⏱ ${fmtT(left)}`;
 if(m.goal)s+=`  ${kills-mission.kills0}/${m.goal}`;if(m.id==='carq')s+=mission.stage?'  → LAND':'  → CLIMB >300 m';if(m.id==='dark')s+=`  SAMs:${eMissiles.length}`;return s;}
window.gameHook=function(dt){if(settings.unlimited&&player)for(const w of player.weapons)player.ammo[w]=AMMO[w];missionUpd(dt);if(eMissiles.length&&player)updSAMs(dt);audioUpd(dt);};
function respawnAllTargets(){for(const t of targets)respawnTarget(t);msg('TARGETS RESPAWNED',1.5);}
// ---------- multiplayer-ready hooks (no networking yet) ----------
// Central event bus: all gameplay events flow through Bus.emit so a future net layer can relay them.
const Bus={h:{},on(t,f){(this.h[t]||(this.h[t]=[])).push(f);},emit(t,d){(this.h[t]||[]).forEach(f=>{try{f(d);}catch(e){console.warn(e);}});(this.h['*']||[]).forEach(f=>f(t,d));}};
{const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons[v.wi];const ok=_fw(v);if(ok)Bus.emit('weapon.fire',{vehicle:v.kind,weapon:w,pos:v.mesh.position.toArray(),t:simT});return ok;};}
{const _kt=killTarget;killTarget=function(t,b){if(t.alive)Bus.emit('target.destroyed',{id:targets.indexOf(t),kind:t.kind,pos:t.pos.toArray()});_kt(t,b);};}
{const _nd=nukeDetonate;nukeDetonate=function(p){Bus.emit('nuke.detonate',{pos:p.toArray(),t:simT});_nd(p);};}
{const _sp=spawn;spawn=function(k,l){_sp(k,l);Bus.emit('vehicle.spawn',{kind:k,loc:l});};}
{const _cr=crash;crash=function(w){if(player&&player.alive)Bus.emit('vehicle.destroyed',{kind:player.kind,reason:w});_cr(w);};}
// Serializable snapshot of entity state (plain JSON) for future sync/replays.
function serializeState(){const v=player;const s={t:simT,score,player:v?{kind:v.kind,alive:v.alive,pos:v.mesh.position.toArray(),quat:v.mesh.quaternion.toArray(),vel:v.vel.toArray(),throttle:inp.throttle,weapon:v.weapons[v.wi]||null,ammo:{...v.ammo},
  rocket:v.os?{x:v.os.x,y:v.os.y,vx:v.os.vx,vy:v.os.vy,t:v.os.t,stage:v.os.stage,pitch:v.os.pitch,prop:v.os.stages.map(x=>x.prop)}:null}:null,
 targets:targets.map((t,i)=>({id:i,kind:t.kind,alive:t.alive,pos:t.pos.toArray(),vel:t.vel.toArray()})),
 projectiles:projs.map(o=>({type:o.type,pos:o.pos.toArray(),vel:o.vel.toArray()})),nukes:nukes.map(n=>({pos:n.p.toArray(),t:n.t}))};return s;}
