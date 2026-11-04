// ---------- vehicles ----------
function spawn(kind,loc=settings.loc||'airbase'){if(!DEFS[kind]){try{msg('UNKNOWN VEHICLE',1.2);}catch(e){}return player;}if(player){if(player.mesh&&player.own)scene.remove(player.mesh);}
 for(const o of projs)if(o.mesh)scene.remove(o.mesh);projs.length=0;camFollow=null;blastCam=null;warp=1;
 fleetCarrier.position.copy(CARRIER_POS);fleetCarrier.rotation.set(0,0,0);siloMissile.visible=true;silo.userData.door.position.x=0;if(padRocket)padRocket.visible=true;
 const d=DEFS[kind];const v={kind,loc,def:d,alive:true,vel:V3(),weapons:d.weapons.slice(),wi:0,ammo:{},spd:0,own:true,onGround:false,throttle:0,crashT:0};
 for(const w of v.weapons)v.ammo[w]=AMMO[w];inp.throttle=0;
 if(d.cls==='air'){v.mesh=jet(d.col||(d.fa18?0x8a949c:0x5d6873),d.fa18,kind);
  if(d.fa18){const cp=fleetCarrier.position;v.mesh.position.set(cp.x+6,cp.y+21+2,cp.z+130);v.mesh.rotation.y=0;v.onGround=true;inp.throttle=0;}
  else{v.mesh.position.set(0,6+2,1300);v.onGround=true;}}
 else if(d.cls==='heli'){v.mesh=heli();v.mesh.position.set(55,6+1.8,-300);v.onGround=true;v.yaw=0;v.pt=0;v.bk=0;}
 else if(d.cls==='ship'||d.cls==='sub'){if(kind==='carrier'){v.mesh=fleetCarrier;v.own=false;}else v.mesh=kind==='sub'?sub():destroyer();
  if(kind!=='carrier')v.mesh.position.set(kind==='sub'?-1200:1200,0,6500);v.hdg=0;v.depth=0;v.depthT=0;}
 else if(d.cls==='silo'){v.mesh=new THREE.Object3D();v.mesh.position.set(SILO.x,10,SILO.z);v.own=false;}
 else if(d.cls==='rocket'){setupRocketModels(d.rk||'rocket');v.mesh=padRocket;v.own=false;v.view='ship';v.os=OM.create(d.rk||'rocket');v.os.auto=false;v.os.throttle=1;inp.throttle=1;resetRocketVisual();}
 if(v.own)scene.add(v.mesh);v.mesh.traverse(o=>{if(o.isMesh&&!o.material.blending){o.castShadow=true;o.receiveShadow=true;}});player=v;v.vel.set(0,0,0);if(d.cls==='ship'||d.cls==='sub')v.mesh.rotation.y=0;applySpawnLoc(v,loc);
 camSmooth.copy(v.mesh.position).add(V3(0,30,90));updateCtxLabel();$('rocketHud').style.display='none';$('bWarp').style.display=d.cls==='rocket'?'block':'none';
 msg(d.name,2);}
function crash(why){if(!player.alive)return;player.alive=false;player.crashT=3.5;explosion(player.mesh.position,player.def.cls==='air'?3:2);if(player.own)player.mesh.visible=false;msg('💥 '+why+'\nRespawning…',3.5);}
const camSmooth=V3();
function updAir(v,dt){const d=v.def,q=v.mesh.quaternion,p=v.mesh.position;const f=fwdOf(q,_f),u=upOf(q,_u),r=rightOf(q,_r);
 let pi=inp.pitch,ro=inp.roll,ya=inp.yaw;const bank=Math.atan2(-r.y,u.y),pAng=Math.asin(clamp(f.y,-1,1));const vf=v.vel.dot(f);
 const easy=!settings.advanced;
 if(easy&&!v.onGround){const idle=!inp.joyActive&&Math.abs(pi)<0.05&&Math.abs(ro)<0.05;if(!idle||v.altT==null)v.altT=p.y;if(idle){ro=0;pi=0;}else{pi+=Math.abs(Math.sin(bank))*0.35*(1-Math.abs(pi));ya+=ro*0.15;}}
 if(v.onGround&&easy&&vf>d.vrot&&pAng<0.16&&inp.throttle>0.3)pi=Math.max(pi,0.55);
 const auth=easy?clamp(vf/110,0.35,1.1):clamp(vf/110,0.12,1.1);const pr=pi*1.5*auth,rr=ro*3.2*clamp(vf/80,0.15,1),yr=ya*0.5*auth;
 _q.setFromEuler(_e.set(pr*dt,-yr*dt,-rr*dt,'XYZ'));q.multiply(_q).normalize();
 v.throttle=inp.throttle;const thrust=d.thrust*(inp.throttle<=0.85?inp.throttle/0.85*0.65:0.65+(inp.throttle-0.85)/0.15*0.35);
 const sp=v.vel.length();const rho=Math.exp(-p.y/8500);const pull=easy&&!v.onGround&&pi>0?pi:0;
 _a.set(0,-G,0).addScaledVector(f,thrust*(1+pull*0.6)*Math.max(d.noRho?0.85:easy?0.6:0.3,rho));_a.addScaledVector(v.vel,-d.dragK*sp*rho*(1+(v.gear?0.3:0)));if(easy&&!v.onGround&&!d.noRho){_a.addScaledVector(f,Math.max(0,f.y)*G*1.05+Math.max(0,d.vstall*1.6-vf)*0.9);}
 const rhoL=easy?Math.max(rho,d.ceil&&p.y>d.ceil?rho:0.45):rho;const liftK=clamp((vf*vf)/(d.vstall*d.vstall),0,4)*rhoL*(1+pull*0.5);const vu=v.vel.dot(u),vr=v.vel.dot(r);
 const lift=-vu*(easy?3.4:2.2)*Math.min(liftK,1.6);_a.addScaledVector(u,clamp(lift,-9*G,9*G));_a.addScaledVector(r,-vr*1.5);
 _a.addScaledVector(v.vel,-Math.abs(lift)*(easy?0.0012:0.004));v.gload=(lift/G)+u.y;
 if(!easy&&liftK<0.7&&!v.onGround&&vf<d.vstall){v.stall=true;_q.setFromAxisAngle(V3(1,0,0),-0.6*dt*(1-liftK));q.multiply(_q);}else v.stall=false;
 v.vel.addScaledVector(_a,dt);p.addScaledVector(v.vel,dt);
 const g=groundAt(p.x,p.z);const gearH=2.0;v.onGround=false;
 if(p.y<g.h+gearH){const vy=v.vel.y;if(g.type==='water'||vy<-9||Math.abs(bank)>0.45||pAng<-0.25||g.type==='bldg'||(g.type==='land'&&Math.hypot(p.x,p.z)>2000&&!(Math.abs(p.x)<420&&Math.abs(p.z)<1800))){crash(g.type==='water'?'CRASHED INTO THE SEA':'CRASHED');return;}
  p.y=g.h+gearH;if(v.vel.y<0)v.vel.y=0;v.onGround=true;const h=V3(v.vel.x,0,v.vel.z);const fr=inp.throttle<0.05?0.5:0.03;v.vel.addScaledVector(h,-fr*dt);
  if(pAng<0){_q.setFromAxisAngle(V3(1,0,0),-pAng*Math.min(1,dt*5));q.multiply(_q);}
  if(Math.abs(bank)>0.01){_q.setFromAxisAngle(V3(0,0,1),bank*Math.min(1,dt*5));q.multiply(_q);}
  const hv=v.vel.clone();hv.y=0;const fl=f.clone().setY(0).normalize();const fs=hv.dot(fl);v.vel.copy(fl.multiplyScalar(fs)).setY(v.vel.y);}
 const fl=v.mesh.userData.flame;if(fl){fl.visible=false;if(inp.throttle>0.6)for(const c of fl.children){const ab=inp.throttle>0.85;fire.spawn(_t.copy(c.position).applyMatrix4(v.mesh.matrixWorld),v.vel.x-f.x*60,v.vel.y-f.y*60,v.vel.z-f.z*60,0.05,ab?1.6:0.9,ab?6:2,1,ab?0.6:0.5,ab?0.35:0.3,ab?0.9:0.4);}}
 if(p.y>(d.ceil||16000)){v.vel.y=Math.min(v.vel.y,0);}}
function updHeli(v,dt){const p=v.mesh.position;const easy=!settings.advanced;
 const tp=-inp.pitch*0.42,tb=inp.roll*0.45;v.pt+=(tp-v.pt)*Math.min(1,dt*2.2);v.bk+=(tb-v.bk)*Math.min(1,dt*2.2);
 v.yaw-=(inp.yaw*1.2+(easy?inp.roll*0.7:0))*dt;v.mesh.quaternion.setFromEuler(_e.set(v.pt,v.yaw,-v.bk,'YXZ'));
 const u=upOf(v.mesh.quaternion,_u);const coll=inp.throttle*2*G;_a.set(0,-G,0).addScaledVector(u,coll);
 if(easy){const vy=v.vel.y;_a.y+=-vy*0.6;} _a.addScaledVector(v.vel,-0.12);_a.addScaledVector(v.vel,-0.0015*v.vel.length());
 v.vel.addScaledVector(_a,dt);p.addScaledVector(v.vel,dt);v.throttle=inp.throttle;
 const ud=v.mesh.userData;ud.rotor.rotation.y+=dt*(10+inp.throttle*25);ud.trotor.rotation.x+=dt*40;
 const g=groundAt(p.x,p.z);v.onGround=false;if(p.y<g.h+2){if(g.type==='water'||v.vel.y<-8||v.vel.length()>25){crash('HELICOPTER CRASHED');return;}p.y=g.h+2;v.vel.multiplyScalar(0.8);if(v.vel.y<0)v.vel.y=0;v.onGround=true;}
 if(inp.throttle>0.2&&p.y-g.h<30&&Math.random()<0.5)smoke.spawn(_t.set(p.x+rnd(15),g.h+1,p.z+rnd(15)),rnd(10),1,rnd(10),1.5,6,8,g.type==='water'?0.9:0.7,g.type==='water'?0.95:0.65,g.type==='water'?1:0.55,0.35,0.5);}
function updShip(v,dt){const d=v.def,p=v.mesh.position;const sub=d.cls==='sub';
 const tgt=inp.throttle*d.maxSpd;v.spd+=(tgt-v.spd)*dt*0.08;const turnIn=inp.roll+inp.yaw;v.hdg-=turnIn*d.turn*clamp(Math.abs(v.spd)/4,0.15,1)*dt;
 const f=_f.set(-Math.sin(v.hdg),0,-Math.cos(v.hdg));const np=p.clone().addScaledVector(f,v.spd*dt);const ahead=p.clone().addScaledVector(f,sub?60:d.camD*0.45);
 const bed=terrainH(ahead.x,ahead.z);if(bed>(sub?v.depth*-1-8:-6)){v.spd*=Math.max(0,1-dt*3);if(Math.random()<dt)msg('⚠ SHALLOW WATER / LAND AHEAD',1.5);}else p.copy(np);
 if(sub){if(settings.advanced)v.depthT=clamp(v.depthT-inp.pitch*12*dt,0,450);else if(Math.abs(inp.pitch)>0.2)v.depthT=clamp(v.depthT-inp.pitch*15*dt,0,450);
  const bedH=-terrainH(p.x,p.z)-12;v.depthT=Math.min(v.depthT,Math.max(0,bedH));v.depth+=clamp(v.depthT-v.depth,-3*dt,3*dt);}
 const wv=waveH(p.x,p.z,simT);p.y=sub?(v.depth<1?wv*0.5-3.5:-v.depth):wv*(v.kind==='carrier'?0.15:0.4);
 const rollA=-turnIn*Math.min(1,v.spd/8)*(v.kind==='carrier'?0.02:0.07)+Math.sin(simT*0.7)*0.015*(v.kind==='carrier'?0.3:1);
 const pitchA=sub?clamp((v.depthT-v.depth)*-0.01,-0.2,0.2):Math.sin(simT*0.5+1)*0.01;v.mesh.rotation.set(pitchA,v.hdg,rollA,'YXZ');
 v.vel.copy(f).multiplyScalar(v.spd);
 if(v.spd>1&&(!sub||v.depth<2))for(let k=0;k<2;k++){const s=(v.kind==='carrier'?18:sub?5:9);smoke.spawn(_t.copy(p).addScaledVector(f,-(d.camD*0.38)).setY(0.4).add(V3(rnd(s),0,rnd(s))),rnd(2),0.5,rnd(2),5,s*0.6,s*0.4,0.95,0.97,1,0.55,0.1,0);
  const r=rightOf(v.mesh.quaternion,_r);smoke.spawn(_t.copy(p).addScaledVector(f,(d.camD*0.3)).setY(0.6).addScaledVector(r,rnd(1)>0?s*0.7:-s*0.7),0,1,0,3,s*0.4,s*0.3,0.95,0.97,1,0.5,0,0);}
 if(sub&&v.depth>2&&v.spd>1&&Math.random()<0.6)smoke.spawn(_t.copy(p).addScaledVector(f,-55),rnd(1),1,rnd(1),4,1,0.8,0.8,0.9,1,0.8,0.5,2.5);}
// ---------- input ----------
const keys={};addEventListener('keydown',e=>{if(e.repeat&&!['ShiftLeft','ShiftRight','ControlLeft','ControlRight'].includes(e.code)){keys[e.code]=true;return;}keys[e.code]=true;
 if(e.code==='KeyX')cycleWeapon();if(e.code==='KeyG')ctxAction();if(e.code==='KeyC')cycleCam();if(e.code==='KeyT')cycleWarp();if(e.code==='KeyP'||e.code==='Escape')togglePause();if(e.code==='Space')e.preventDefault();if(e.code==='KeyU'&&player&&player.os)toggleAuto();});
addEventListener('keyup',e=>keys[e.code]=false);
let joy={x:0,y:0},yawBtn=0,gyro={on:false,b0:0,g0:0,x:0,y:0};
function readInput(dt){let p=0,r=0,y=0;if(keys.KeyW||keys.ArrowUp)p+=1;if(keys.KeyS||keys.ArrowDown)p-=1;if(keys.KeyA||keys.ArrowLeft)r-=1;if(keys.KeyD||keys.ArrowRight)r+=1;if(keys.KeyQ)y-=1;if(keys.KeyE)y+=1;
 if(keys.ShiftLeft||keys.ShiftRight||keys.KeyR)inp.throttle=clamp(inp.throttle+dt*0.6,0,1);if(keys.ControlLeft||keys.ControlRight||keys.KeyF)inp.throttle=clamp(inp.throttle-dt*0.6,0,1);
 const kb=p||r||y;p+=joy.y;r+=joy.x;y+=yawBtn;if(gyro.on){p+=gyro.y;r+=gyro.x;}
 inp.pitch=clamp(p,-1,1);inp.roll=clamp(r,-1,1);inp.yaw=clamp(y,-1,1);inp.joyActive=!!kb||Math.hypot(joy.x,joy.y)>0.08||(gyro.on&&Math.hypot(gyro.x,gyro.y)>0.08);
 inp.fire=keys.Space||touchFire;$('thrf').style.height=(inp.throttle*100)+'%';}
let touchFire=false;
function setupTouch(){const J=$('joy'),K=$('knob');let jid=null;
 const jm=e=>{const b=J.getBoundingClientRect();let dx=(e.clientX-(b.left+b.width/2))/(b.width/2),dy=(e.clientY-(b.top+b.height/2))/(b.height/2);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}
  joy.x=Math.sign(dx)*Math.pow(Math.abs(dx),1.4);joy.y=-Math.sign(dy)*Math.pow(Math.abs(dy),1.4);K.style.transform=`translate(${dx*45}px,${dy*45}px)`;};
 J.addEventListener('pointerdown',e=>{jid=e.pointerId;J.setPointerCapture(jid);jm(e);});J.addEventListener('pointermove',e=>{if(e.pointerId===jid)jm(e);});
 const je=e=>{if(e.pointerId!==jid)return;jid=null;joy.x=joy.y=0;K.style.transform='';};J.addEventListener('pointerup',je);J.addEventListener('pointercancel',je);
 const T=$('thr');let tid=null;const tm=e=>{const b=T.getBoundingClientRect();inp.throttle=clamp(1-(e.clientY-b.top)/b.height,0,1);if(inp.throttle<0.04)inp.throttle=0;};
 T.addEventListener('pointerdown',e=>{tid=e.pointerId;T.setPointerCapture(tid);tm(e);});T.addEventListener('pointermove',e=>{if(e.pointerId===tid)tm(e);});T.addEventListener('pointerup',()=>tid=null);
 const btn=(id,dn,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('pr');dn&&dn();});const u=()=>{b.classList.remove('pr');up&&up();};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('pointerleave',u);};
 btn('bFire',()=>touchFire=true,()=>touchFire=false);btn('bWpn',cycleWeapon);btn('bCtx',ctxAction);btn('bYawL',()=>yawBtn=-1,()=>yawBtn=0);btn('bYawR',()=>yawBtn=1,()=>yawBtn=0);btn('bCam',()=>cycleCam());
 btn('bPause',togglePause);btn('bGyro',toggleGyro);btn('bWarp',cycleWarp);}
function toggleGyro(){if(gyro.on){gyro.on=false;gyro.x=gyro.y=0;$('bGyro').style.background='';settings.gyro=false;saveSettings();return;}
 const start=()=>{gyro.on=true;gyro.cal=true;$('bGyro').style.background='rgba(80,200,80,.5)';settings.gyro=true;saveSettings();msg('TILT STEERING ON\n(current angle = neutral)',2);};
 if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')start();else msg('Tilt permission denied',2);}).catch(()=>msg('Tilt not available',2));}else start();}
addEventListener('deviceorientation',e=>{if(!gyro.on||e.beta==null)return;const ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
 let pitch,roll;if(ang===90){roll=e.beta;pitch=-e.gamma;}else if(ang===-90||ang===270){roll=-e.beta;pitch=e.gamma;}else{roll=e.gamma;pitch=e.beta;}
 if(gyro.cal){gyro.b0=pitch;gyro.g0=roll;gyro.cal=false;}gyro.x=clamp((roll-gyro.g0)/25,-1,1);gyro.y=clamp(-(pitch-gyro.b0)/20,-1,1);if(Math.abs(gyro.x)<0.08)gyro.x=0;if(Math.abs(gyro.y)<0.08)gyro.y=0;});
function cycleWeapon(){if(!player)return;if(player.os){const vs=['ship',...(rec.booster?['booster']:[])];if(rec.shipDS)vs[0]='shipDS';if(vs.length>1||player.view!==vs[0]){const i=vs.indexOf(player.view);player.view=vs[(i+1)%vs.length];msg('VIEW: '+({ship:'UPPER STAGE',booster:'BOOSTER',shipDS:'STARSHIP'})[player.view],1);updateCtxLabel();return;}toggleAuto();return;}if(!player.weapons.length)return;player.wi=(player.wi+1)%player.weapons.length;msg(player.weapons[player.wi],0.8);updateCtxLabel();}
function cycleCam(){if(camFollow){camFollow=null;return;}if(blastCam){blastCam=null;return;}camMode=(camMode+1)%2;}
function cycleWarp(){if(!player||!player.os){return;}const os=player.os;const dv=player.view!=='ship'&&rec[player.view]?rec[player.view].ds:null;const lv=dv?(dv.h>20000&&dv.thr===0?[1,2,4,10,50]:[1,2,4]):os.h>70000&&!os.engine?[1,10,100,1000]:[1,2,4];const i=lv.indexOf(warp);warp=lv[(i+1)%lv.length]||1;msg('TIME WARP x'+warp,1);}
function toggleAuto(){const os=player.os;os.auto=!os.auto;msg(os.auto?'AUTOPILOT: GRAVITY TURN ON':'MANUAL CONTROL\nStick = pitch, slider = throttle',1.8);if(!os.auto){os.cmdPitch=os.pitch;}updateCtxLabel();}
function ctxAction(){if(!player)return;const c=player.def.cls;
 if(c==='sub'){player.depthT=player.depthT>5?0:60;msg(player.depthT?'DIVE! DIVE! → 60 m':'SURFACING',1.5);}
 else if(c==='silo'){player.wi=0;fireWeapon(player);}
 else if(c==='air'){player.gear=!player.gear;msg(player.gear?'AIRBRAKE ON':'AIRBRAKE OFF',1);}
 else if(c==='rocket'){const os=player.os;if(os.kind==='starship'&&os.orbit&&!os.engine&&!os.retro&&!rec.shipDS&&os.stage===1){os.retro=true;msg('DEORBIT BURN (retrograde)',2);}else if(!os.launched){OM.launch(os);shake=1.2;}else if(OM.stageSep(os)){os.engine=true;}else msg('NO MORE STAGES',1);}
 else if(c==='ship'){player.wi=(player.wi+1)%player.weapons.length;}
 updateCtxLabel();}
function updateCtxLabel(){if(!player)return;const c=player.def.cls;let t={sub:(player.depthT>5?'SURF':'DIVE'),silo:'LAUNCH',air:'BRAKE',heli:'—',ship:'WPN'}[c];
 if(c==='rocket'){const os=player.os;t=!os.launched?'LAUNCH':(os.kind==='starship'&&os.orbit&&!rec.shipDS)?'DEORB':'STAGE';}$('bCtx').textContent=t||'—';$('bWpn').textContent=c==='rocket'?(rec.booster||rec.shipDS?'VIEW':(player.os.auto?'AUTO':'MAN')):'WPN';}
