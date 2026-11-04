// ---------- camera ----------
const camOff=V3(0,10,40),_look=V3();
function updCamera(dt){const v=player;let p=v.mesh.position;const q=v.mesh.quaternion;const c=v.def.cls;camera.up.set(0,1,0);
 if(blastCam){blastCam.t-=dt;const bp=blastCam.p;const from=blastCam.from||camera.position;const dir=V3(from.x-bp.x,0,from.z-bp.z);if(dir.lengthSq()<1)dir.set(1,0,1);dir.normalize();
  camera.position.copy(bp).addScaledVector(dir,9000).setY(bp.y+900);camera.lookAt(bp.x,bp.y+1600,bp.z);if(blastCam.t<=0)blastCam=null;}
 else if(camFollow){const o=camFollow;const vd=o.vel.clone().normalize();const side=V3(-vd.z,0,vd.x).normalize();const dist=60+Math.min(400,o.pos.y*0.004);
  camera.position.copy(o.pos).addScaledVector(vd,-dist).addScaledVector(side,dist*0.5).add(V3(0,dist*0.25,0));camera.lookAt(o.pos);}
 else if(c==='silo'){const a=simT*0.1;camera.position.set(SILO.x+Math.cos(a)*120,60,SILO.z+Math.sin(a)*120);camera.lookAt(SILO.x,15,SILO.z);}
 else if(c==='rocket'&&v.view!=='ship'&&rec[v.view]){const r=rec[v.view],m=r.mesh;const h=r.ds.h;const D=Math.min(900,140+h*0.004);const up=V3(0,1,0).applyQuaternion(m.quaternion);const ctr=m.position.clone().addScaledVector(up,30);
  camera.position.set(ctr.x-D*0.45,ctr.y+D*0.12,ctr.z+D);if(camera.position.y<r.site.y+3)camera.position.y=r.site.y+3;camera.lookAt(ctr);}
 else if(c==='rocket'){const h=Math.max(0,v.os.h);const rp=padRocket.position;const D=170+h*0.08;camera.position.set(rp.x-D*0.3,Math.max(12,rp.y-D*0.15+(h<50?0:-h*0.02)),rp.z+D);if(h<1)camera.position.y=40;camera.lookAt(rp.x,rp.y+35,rp.z);}
 else if(camMode===1){const f=fwdOf(q,_f),u=upOf(q,_u);const o={air:[-5.5,1.0],heli:[-4,0.8],ship:[v.kind==='carrier'?-10:-25,v.kind==='carrier'?45:18],sub:[-16,9]}[c]||[0,2];
  camera.position.copy(p).addScaledVector(f,o[0]).addScaledVector(u,o[1]);camera.quaternion.copy(q);if(c==='ship'||c==='sub')camera.rotateX(-0.05);}
 else{const d={air:[30,7],heli:[30,9]}[c]||[v.def.camD,v.def.camH];let f;if(c==='air'||c==='heli')f=fwdOf(q,_f).clone();else f=fwdOf(q,_f).clone().setY(0).normalize();
  const des=f.multiplyScalar(-d[0]).add(V3(0,d[1],0));camOff.lerp(des,1-Math.exp(-dt*(c==='air'?5:3)));camera.position.copy(p).add(camOff);
  if(c==='air'){const u=upOf(q,_u);camera.up.copy(u).lerp(V3(0,1,0),0.6).normalize();}
  _look.copy(p).addScaledVector(fwdOf(q,_f),c==='air'?25:10).add(V3(0,c==='air'?2:d[1]*0.25,0));camera.lookAt(_look);
  const gh=groundAt(camera.position.x,camera.position.z);if(c!=='sub'&&camera.position.y<gh.h+2)camera.position.y=gh.h+2;}
 if(shake>0.001){camera.position.add(V3(rnd(shake*4),rnd(shake*4),rnd(shake*4)));camera.rotateZ(rnd(shake*0.02));shake*=Math.exp(-dt*1.2);}}
function updEnv(dt=0.016){const cp=camera.position;const wh=waveH(cp.x,cp.z,simT);const under=cp.y<wh-0.3;const space=sstep(12000,70000,cp.y);
 sky.position.copy(cp);stars.position.copy(cp);stars.material.opacity=space;skyU.rayleigh.value=lerp(1.1,0.02,space);skyU.mieCoefficient.value=lerp(0.003,0.0002,space);skyU.turbidity.value=lerp(3.5,0.3,space);
 ocean.material.uniforms.time.value+=dt*0.6;clouds.visible=!under;
 if(under){scene.fog.color.setRGB(0.02,0.12,0.16);scene.fog.density=0.012;$('water').style.opacity=1;sky.visible=false;scene.background=scene.fog.color;}
 else{sky.visible=true;scene.background=null;scene.fog.color.setRGB(lerp(0.48,0.0,space),lerp(0.6,0.0,space),lerp(0.78,0.02,space));scene.fog.density=0.000022*(1-sstep(1500,25000,cp.y)*0.97);$('water').style.opacity=0;}
 clouds.material.uniforms.fogC.value.copy(scene.fog.color);
 const tp=player&&player.mesh?(player.view&&player.view!=='ship'&&rec[player.view]?rec[player.view].mesh.position:player.mesh.position):cp;sun.target.position.copy(tp);sun.position.copy(tp).addScaledVector(sunDir,1500);
 seabed.position.set(cp.x,-90,cp.z);ocean.position.set(Math.round(cp.x/100)*100,0,Math.round(cp.z/100)*100);farOcean.position.x=ocean.position.x;farOcean.position.z=ocean.position.z;}
// ---------- HUD ----------
const pad2=(n,w=5)=>String(Math.round(n)).padStart(w);
function bar(f,n=10){f=clamp(f,0,1);return '█'.repeat(Math.round(f*n))+'░'.repeat(n-Math.round(f*n));}
function fmtT(t){t=Math.max(0,t);const h=Math.floor(t/3600),m=Math.floor(t/60)%60,s=Math.floor(t%60);return (h?h+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
let hudT=0,lastMach=0;
function updHUD(){const v=player;const c=v.def.cls;let L='',R='',C='';
 if(camFollow&&camFollow.type==='ballistic'){const o=camFollow;const dist=Math.hypot(o.tgt.x-o.pos.x,o.tgt.z-o.pos.z);
  L=`${o.name} IN FLIGHT  ${o.t<o.boostT?'BOOST':'BALLISTIC'}\nALT  ${(o.pos.y/1000).toFixed(1).padStart(6)} km\nSPD  ${pad2(o.vel.length())} m/s\nMACH ${o.mach.toFixed(1).padStart(6)}\nV/S  ${pad2(o.vel.y)} m/s\nRANGE ${(dist/1000).toFixed(1)} km\nTIME x5`;
  R=`TARGET: ENEMY RANGE\nC/CAM = return\nSCORE ${score}`;C='☢ '+o.name+' TRACKING';}
 else if(c==='rocket'&&v.view!=='ship'&&rec[v.view]){const r=rec[v.view],ds=r.ds;const nm=v.view==='booster'?(v.os.kind==='falcon9'?'FALCON 9 BOOSTER':'SUPER HEAVY'):'STARSHIP';
  L=`${nm}  ${ds.phase.toUpperCase()}${ds.auto?'  AUTO':'  MANUAL'}\nALT  ${(ds.h/1000).toFixed(2).padStart(8)} km\nV/S  ${pad2(ds.vh,6)} m/s\nH-SPD${pad2(ds.vx,6)} m/s\nMACH ${ds.mach.toFixed(1).padStart(8)}\nQ    ${(ds.q/1000).toFixed(1).padStart(8)} kPa\nG    ${(ds.g||0).toFixed(1).padStart(8)} g\nTHR  ${Math.round(ds.thr*100)}%  ENG ${ds.eng}\nFUEL ${(ds.prop/1000).toFixed(1)} t`;
  R=`TARGET: ${v.view==='booster'?r.cfg.site.toUpperCase():'SPLASH BUOY'}\nRANGE ${Math.abs(ds.x)>2000?(ds.x/1000).toFixed(1)+' km':ds.x.toFixed(0)+' m'}\n${ds.plasma>0.05?'🔥 PLASMA '+Math.round(ds.plasma*100)+'%':''}\n${ds.leg?'LEGS DOWN':''}\nWARP x${warp}`;C=ds.landed?'✅ '+ (v.view==='booster'?'RECOVERED':'LANDED'):ds.crashed?'❌ LOST':nm+' RECOVERY';}
 else if(c==='rocket'){const os=v.os;const st=os.stages;const vc=Math.sqrt(OM.MU/(OM.RE+os.h));
  const per=os.a>0&&isFinite(os.a)?2*Math.PI*Math.sqrt(Math.pow(os.a,3)/OM.MU):0;
  const srf=Math.hypot(os.vs,os.vh-OM.OMEGA*(OM.RE+os.h));L=`T+ ${fmtT(os.t)}  STAGE ${os.stage+1}  ${os.auto?'AUTO':'MANUAL'}\nALT  ${(os.h/1000).toFixed(2).padStart(8)} km\n${os.h<60000?'SRF VEL '+pad2(srf,5)+' m/s':'ORB VEL '+pad2(os.speed,5)+' m/s (circ '+pad2(vc,4)+')'}\nV/S  ${pad2(os.vs,6)} m/s\nH-SPD${pad2(os.vh-OM.OMEGA*(OM.RE+os.h),6)} m/s (srf)\nAPO  ${(os.apo/1000).toFixed(1).padStart(8)} km\nPERI ${(os.peri/1000).toFixed(1).padStart(8)} km\nG    ${os.gforce.toFixed(2).padStart(8)} g\nQ    ${(os.q/1000).toFixed(1).padStart(8)} kPa  MAX ${(os.maxQ/1000).toFixed(1)}\nMACH ${os.mach.toFixed(1).padStart(8)}\nPITCH${os.pitch.toFixed(1).padStart(8)}°  THR ${Math.round(os.throttle*100)}%`;
  R=`S1 FUEL ${bar(st[0].prop/os.cfg.stages[0].prop)} ${pad2(st[0].prop/os.cfg.stages[0].prop*100,3)}%\nS2 FUEL ${bar(st[1].prop/os.cfg.stages[1].prop)} ${pad2(st[1].prop/os.cfg.stages[1].prop*100,3)}%\nMASS ${(OM.mass(os)/1000).toFixed(1)} t\nENGINES ${os.engine&&st[os.stage].prop>0&&!(window.ENGINE_CUT&&ENGINE_CUT.state(player).cut)?'ON':'OFF'}\nWARP x${warp}\n${per?'PERIOD '+fmtT(per):''}\n${os.h>100000?'▲ ABOVE KÁRMÁN LINE':''}`;
  C=os.orbit?'🛰 ORBIT ACHIEVED':!os.launched?'READY - press LAUNCH (G)':os.h<100000?'ASCENT':'SPACE';}
 else{const p=v.mesh.position;const f=fwdOf(v.mesh.quaternion,_f);const hdg=(Math.atan2(f.x,-f.z)*180/Math.PI+360)%360;const spd=v.vel.length();const g=groundAt(p.x,p.z);
  if(c==='sub')L=`SPD  ${(v.spd*1.944).toFixed(1).padStart(5)} kt\nDEPTH ${pad2(Math.max(0,-p.y),4)} m → ${Math.round(v.depthT)} m\nHDG  ${pad2(hdg,3)}°\nTHR  ${pad2(inp.throttle*100,3)}%\n${v.depth>2?'≈ SUBMERGED ≈':'SURFACED'}`;
  else if(c==='ship')L=`SPD  ${(v.spd*1.944).toFixed(1).padStart(5)} kt\nHDG  ${pad2(hdg,3)}°\nTHR  ${pad2(inp.throttle*100,3)}%`;
  else if(c==='silo'&&v.kind==='rods')L=`KE-6 ORBITAL PLATFORM\nRODS ${v.ammo.ROD}/6\nFIRE = DEOREBIT ROD`.replace('DEOREBIT','DEORBIT');
  else if(c==='silo'&&player.def===DEFS.shuttle)L='';else if(c==='silo')L=`ICBM SILO\nSTATUS ${v.ammo.ICBM>0?'READY':'EMPTY'}\nMISSILES ${v.ammo.ICBM}\nTARGET: ENEMY RANGE 40 km NW`;
  else L=`SPD  ${pad2(spd*1.944,4)} kt  M${(spd/340).toFixed(2)}\nALT  ${pad2(p.y,5)} m\nAGL  ${pad2(p.y-g.h,5)} m\nV/S  ${pad2(v.vel.y,4)} m/s\nHDG  ${pad2(hdg,3)}°\nTHR  ${pad2(inp.throttle*100,3)}%${inp.throttle>0.85&&c==='air'?' AB':''}\n${c==='air'?'G   '+(v.gload||1).toFixed(1):''}${v.stall?'\n⚠ STALL':''}${v.onGround?'\nON GROUND':''}`;
  R=v.weapons.map((w,i)=>(i===v.wi?'▶ ':'  ')+w.padEnd(11)+String(v.ammo[w]).padStart(4)).join('\n')+`\n\nSCORE ${score}`+(lastMach>0.5?`\nHYPERSONIC M${lastMach.toFixed(1)}`:'');
  C=v.def.name+(camMode?' [COCKPIT]':'');}
 const mh=missionHud();if(mh)C=mh;
 $('hl').textContent=L;$('hr').textContent=R;$('hc').textContent=C;$('cross').style.display=(c==='air'||c==='heli')&&!camFollow&&!blastCam?'block':'none';}
// ---------- menu ----------
let menuTab='free';
function buildMenu(){const m=$('menu');const ld=settings.loc||'airbase';
 let body='';if(menuTab==='free'){body=`<div class="lbl">SPAWN LOCATION</div><div class="chips">${Object.entries(LOCS).map(([k,n])=>`<div class="chip ${k===ld?'on':''}" data-l="${k}">${n}</div>`).join('')}</div>
 <div class="lbl">CHOOSE VEHICLE</div><div class="grid">${Object.entries(DEFS).map(([k,d])=>`<div class="card" data-k="${k}"><b>${d.name}</b>${d.desc}</div>`).join('')}</div>
 <div class="row"><div class="btn ${settings.unlimited?'on':''}" id="mUnl">∞ Unlimited ammo: ${settings.unlimited?'ON':'OFF'}</div><div class="btn" id="mResp">↻ Respawn targets</div></div>`;}
 else body=`<div class="grid">${MISSIONS.map((x,i)=>`<div class="card" data-m="${i}"><b>${x.name}</b>${x.desc}<div style="color:#ff6;margin-top:6px">🏆 Best: ${best[x.id]||'—'}</div></div>`).join('')}</div>`;
 m.innerHTML=`<h1 class="logo"><span class="d1">DOMINION</span><span class="d2">ALL DOMAIN WAR</span></h1><div class="sub">Military flight · naval · strategic · space simulator</div>
 <div class="tabs"><div class="tab ${menuTab==='free'?'on':''}" id="tFree">FREE PLAY</div><div class="tab ${menuTab==='mis'?'on':''}" id="tMis">MISSIONS</div></div>${body}
 <div class="row"><div class="btn ${settings.advanced?'':'on'}" id="mEasy">EASY controls</div><div class="btn ${settings.advanced?'on':''}" id="mAdv">ADVANCED</div><div class="btn" id="mTut">How to play</div><div class="btn" id="mQ">Graphics: ${settings.quality==='low'?'LOW':'HIGH'}</div>${player?'<div class="btn" id="mRes">▶ RESUME</div>':''}</div>
 <div class="sub">Desktop: W/S pitch · A/D roll · Q/E yaw · Shift/Ctrl (R/F) throttle · Space fire · X weapon · G action · C camera · T warp · U autopilot · P pause</div>`;
 m.querySelectorAll('.card[data-k]').forEach(c=>c.onclick=()=>{mission=null;spawn(c.dataset.k,settings.loc||'airbase');setPaused(false);});
 m.querySelectorAll('.card[data-m]').forEach(c=>c.onclick=()=>startMission(MISSIONS[+c.dataset.m]));
 m.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{settings.loc=c.dataset.l;saveSettings();buildMenu();});
 const on=(id,f)=>{if($(id))$(id).onclick=()=>{sfx('ui');f();};};
 on('tFree',()=>{menuTab='free';buildMenu();});on('tMis',()=>{menuTab='mis';buildMenu();});on('mUnl',()=>{settings.unlimited=!settings.unlimited;saveSettings();buildMenu();});on('mResp',()=>{respawnAllTargets();});
 on('mEasy',()=>{settings.advanced=false;saveSettings();applySettings();buildMenu();});on('mAdv',()=>{settings.advanced=true;saveSettings();applySettings();buildMenu();});
 on('mTut',()=>$('tut').style.display='flex');on('mQ',()=>{settings.quality=settings.quality==='low'?'high':'low';saveSettings();location.reload();});on('mRes',()=>setPaused(false));tapify(m);}
function tapify(root){root.querySelectorAll('.card,.chip,.btn,.tab,#tutOk').forEach(el=>{if(el._tp||!el.onclick)return;el._tp=1;const f=el.onclick;let sx=0,sy=0,t0=0,fired=0;
 el.onclick=e=>{if(performance.now()-(window.__tapT||-1e9)<700)return;f.call(el,e);};
 el.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;t0=performance.now();el.classList.add('pr');},{passive:true});
 el.addEventListener('pointercancel',()=>el.classList.remove('pr'),{passive:true});
 el.addEventListener('pointerup',e=>{el.classList.remove('pr');if(e.pointerType==='mouse')return;if(Math.hypot(e.clientX-sx,e.clientY-sy)>12||performance.now()-t0>1500)return;fired=window.__tapT=performance.now();try{f.call(el,e);}catch(err){showErr(err);}});});}
function showErr(err){console.error(err);let d=document.getElementById('errToast');if(!d){d=document.createElement('div');d.id='errToast';d.style.cssText='position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:99;background:rgba(120,0,0,.85);color:#fff;font:12px system-ui;padding:8px;border-radius:8px;pointer-events:none';document.body.appendChild(d);}d.textContent='Error: '+(err&&err.message||err);setTimeout(()=>d.remove(),8000);}
addEventListener('error',e=>showErr(e.error||e.message));addEventListener('unhandledrejection',e=>showErr(e.reason));
function applySettings(){document.body.classList.toggle('advanced',settings.advanced);}
function setPaused(p){paused=p;$('menu').style.display=p?'flex':'none';if(p)buildMenu();}
function togglePause(){if(!player)return;setPaused(!paused);}
$('tutOk').onclick=()=>{$('tut').style.display='none';settings.tut=true;saveSettings();};tapify($('tut'));
// ---------- main loop ----------
let last=performance.now();
function tick(dt){if(!player)return;simT+=dt;oceanU.time.value=simT;readInput(dt);const v=player;
  if(v.alive){const c=v.def.cls;if(c==='air')updAir(v,dt);else if(c==='heli')updHeli(v,dt);else if(c==='ship'||c==='sub')updShip(v,dt);else if(c==='rocket')updRocket(v,dt);
   if(v.alive&&v.weapons.length&&c!=='silo'){const w=v.weapons[v.wi];const auto=w==='GUN'||w==='CIWS';if(inp.fire&&(auto||!inp.firePrev))fireWeapon(v);}
   if(c==='silo'&&inp.fire&&!inp.firePrev)fireWeapon(v);}
  else{v.crashT-=dt;if(v.crashT<=0)spawn(v.kind,v.loc);}
  inp.firePrev=inp.fire;
  const ts=window.__gmsl2TS?window.__gmsl2TS():(camFollow&&camFollow.type==='ballistic'?5:1);let mm=0;for(let k=0;k<ts;k++){updTargets(dt);mm=Math.max(mm,updProjs(dt));updNukes(dt);}lastMach=mm;
  for(const p of PS)p.update(dt);if(window.gameHook)gameHook(dt);
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0;}}
function render(rdt){const useOrbit=player.def.cls==='rocket'&&player.view==='ship'&&player.os.h>15000&&!blastCam;
 if(useOrbit){renderRocketCam(player,rdt);renderFrame(oScene,oCam);}else{updCamera(rdt);updEnv(rdt);renderFrame(scene,camera);}}
function frame(now){requestAnimationFrame(frame);const rdt=Math.min(0.05,(now-last)/1000);last=now;if(!player){updEnv(rdt);renderFrame(scene,camera);return;}
 if(!paused)tick(rdt);render(rdt);hudT-=rdt;if(hudT<=0){hudT=0.1;updHUD();}}
scene.traverse(o=>{if(o.isMesh&&o!==ocean&&o!==farOcean&&o!==sky&&o!==clouds&&o!==seabed){o.castShadow=true;o.receiveShadow=true;}});
if(isTouch)$('touch').style.display='block';setupTouch();applySettings();buildMenu();
if(!settings.tut)$('tut').style.display='flex';
camera.position.set(600,300,2500);camera.lookAt(0,0,0);requestAnimationFrame(frame);
window.__milsim={dbg:{clouds,sky,skyU,bloom,renderer,scene,ocean},rec,Bus,serializeState,startMission,MISSIONS,get mission(){return mission},endMission,step:(n,dt=1/30)=>{for(let i=0;i<n;i++){tick(dt);if(i%3==0)updCamera(dt);}render(dt);updHUD();},spawn,get player(){return player},fireWeapon,nukeDetonate,inp,setPaused,ctxAction,cycleWeapon,get projs(){return projs},get targets(){return targets},setWarp:w=>warp=w,setCam:m=>camMode=m,get simT(){return simT},OM};
