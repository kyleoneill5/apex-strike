// ===== GSHIP_BAY (ship builder, Kyle #19): orbital cargo-bay weapon deploy. Shuttle: payload bay doors (existing, opened in orbit like STS - radiators on door inner faces) -> FIRE releases the selected payload.
// Starship: Starlink-style "pez" payload door on the ship's flank slides open (S/N real Flight 3+ door), payload ejects. Payloads: KROD (tungsten kinetic rod, reuses grods 'rod' projectile + impact),
// WSAT (weapon satellite: reuses rodSat() bus, drops 2 rods after release), SBI (space-based interceptor: reuses missile projectile, homes on nearest air/sea target).
// Orbit only. Player only (enemies never have it - nothing here touches targets/AI). No new buttons: FIRE = deploy, weapon switch = choose payload. Shuttle CTX keeps launch/deorbit. =====
(()=>{const T=THREE,PAY=['KROD','WSAT','SBI'],NAME={KROD:'KINETIC ROD',WSAT:'WEAPON SAT',SBI:'INTERCEPTOR'},AM0={KROD:4,WSAT:2,SBI:4};
 const B={wi:0,ammo:null,door:0,doorT:0,flying:[]};window.__bay=B;
 function reset(){B.ammo=Object.assign({},AM0);B.wi=0;B.door=0;B.doorT=0;}reset();
 function where(){if(!player||!player.alive)return null;
  if(player.kind==='shuttle'&&typeof SHS!=='undefined'&&SHS&&SHS.ph==='orbit')return {k:'shuttle',ok:SHS.doors>0.9,h:SHS.pos.y,p:SHS.pos,v:SHS.vel};
  const os=player.os;if(player.def.cls==='rocket'&&os&&os.kind==='starship'&&os.orbit&&!os.engine&&!os.retro&&os.stage===1&&!rec.shipDS)return {k:'starship',ok:B.door>0.95,h:Math.max(150000,os.h||0)};
  return null;}
 function tgtPoint(from){let best=null,bd=1e18;for(const t of targets){if(!t.alive)continue;const d=Math.hypot(t.pos.x-from.x,t.pos.z-from.z);if(d<bd){bd=d;best=t;}}
  if(best)return best.pos.clone();const c=player.mesh.position;return V3(c.x+3000,0,c.z);}
 function dropRod(src,h,name){const tg=tgtPoint(src);const H=Math.min(h,ROD_ALT);const p=V3(tg.x-1500,H,tg.z);tg.y=groundAt(tg.x,tg.z).h;
  const m=new T.Group();const rodM=new T.MeshStandardMaterial({color:0x7a7e84,metalness:1,roughness:0.3,emissive:0xff6020,emissiveIntensity:0});add(m,new T.CylinderGeometry(0.15,0.15,6,16),rodM,0,0,0);add(m,new T.ConeGeometry(0.15,0.6,16),rodM,0,3.3,0);
  const sh=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshBasicMaterial({color:0xffb070,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));sh.scale.set(1.2,5,1.2);sh.position.y=2.5;m.add(sh);m.position.copy(p);scene.add(m);
  const Tt=H/3100;const o={type:'rod',pos:p,vel:V3((tg.x-p.x)/Tt,-300,(tg.z-p.z)/Tt),life:600,mesh:m,owner:player,t:0,tgt:tg,name,phase:'deorbit',sh,rodM};addProj(o);return o;}
 function sbi(src){const p=player.mesh.position;const o=V3(p.x,Math.min(src.h,60000),p.z);const tg=nearestTarget(o,null,['drone','boat'],400000,-1);
  addProj({type:'hyper',pos:o,vel:V3(0,-400,0),life:90,mesh:missileMesh(5,0.3,0xdddddd),owner:player,maxSpd:3500,acc:300,turn:1.2,tg,arm:1,boost:1.5});return tg;}
 // ---- visual payload released from the bay (child of the vehicle so it works in either scene/scale) ----
 function payloadMesh(w){const g=new T.Group();const foil=new T.MeshStandardMaterial({color:0xc8a040,metalness:0.9,roughness:0.35});const wh=new T.MeshStandardMaterial({color:0xd8d8d8,metalness:0.4,roughness:0.5});
  if(w==='WSAT'&&typeof rodSat==='function'){const s=rodSat();s.scale.setScalar(0.35);g.add(s);}
  else if(w==='SBI'){add(g,new T.CylinderGeometry(0.4,0.4,5,12),wh,0,0,0);add(g,new T.ConeGeometry(0.4,1.2,12),wh,0,3.1,0);g.rotation.z=Math.PI/2;}
  else{add(g,new T.BoxGeometry(1.6,1.6,6.5),foil,0,0,0);for(let i=-1;i<=1;i+=2)for(let j=-1;j<=1;j+=2)add(g,new T.CylinderGeometry(0.15,0.15,6.8,8),new T.MeshStandardMaterial({color:0x777b80,metalness:1,roughness:0.3}),i*0.45,j*0.45,0).rotation.x=Math.PI/2;}
  return g;}
 function release(parent,local,dir,w){const m=payloadMesh(w);m.position.copy(local);parent.add(m);B.flying.push({m,parent,dir:dir.clone(),t:0});}
 // ---- Starship pez door (added lazily to the orbit-view model) ----
 function shipDoor(){if(typeof oRocket==='undefined'||!oRocket||!oRocket.userData.s2)return null;const u=oRocket.userData;if(u.bayDoor)return u.bayDoor;
  const s2=u.s2;const bb=new T.Box3().setFromObject(s2);const inv=new T.Matrix4().copy(oRocket.matrixWorld).invert();bb.applyMatrix4(inv);const c=bb.getCenter(V3()),sz=bb.getSize(V3());
  const L=Math.max(sz.x,sz.y,sz.z),R=Math.min(sz.x,sz.z)/2,ax=sz.y>=sz.x&&sz.y>=sz.z?1:0;const y0=ax?bb.min.y+L*0.68:c.y; // door ~2/3 up the ship, below the forward flaps (Flight 3 pez door location)
  const hole=new T.Mesh(new T.PlaneGeometry(R*0.9,L*0.12),new T.MeshBasicMaterial({color:0x050506}));hole.position.set(c.x,y0,c.z+R*1.002);oRocket.add(hole);
  const door=new T.Mesh(new T.PlaneGeometry(R*0.92,L*0.122),new T.MeshStandardMaterial({color:0xb9bec4,metalness:0.85,roughness:0.35}));door.position.copy(hole.position);door.position.z+=R*0.006;oRocket.add(door);
  u.bayDoor={door,hole,y0,R,L,cz:c.z,cx:c.x};return u.bayDoor;}
 // ---- input (FIRE + weapon switch only) ----
 const _fw=fireWeapon;fireWeapon=function(v){const w=v===player?where():null;
  if(!w||!B.ammo)return _fw.apply(this,arguments);
  if(!w.ok){if(w.k==='starship'){B.doorT=1;msg('PAYLOAD DOOR OPENING',1.2);return false;}return _fw.apply(this,arguments);}
  const wp=PAY[B.wi];if(B.ammo[wp]<=0){msg(NAME[wp]+' EMPTY',1);return false;}B.ammo[wp]--;
  if(w.k==='shuttle'){const o=SH.orb;release(o,V3(0,1.2,0),V3(0,1,0),wp);}
  else{const d=shipDoor();if(d)release(oRocket,V3(d.cx,d.y0,d.cz+d.R*1.05),V3(0,0,1),wp);}
  B.lastDep=performance.now();if(wp==='KROD'){B.follow=dropRod(w.p||player.mesh.position,w.h,'ROD-'+(AM0.KROD-B.ammo.KROD));msg('KINETIC ROD DEPLOYED - DEORBIT BURN',1.6);}
  else if(wp==='WSAT'){msg('WEAPON SAT DEPLOYED',1.6);setTimeout(()=>{if(!player)return;B.follow=dropRod(player.mesh.position,w.h,'SAT-A');dropRod(player.mesh.position.clone().add(V3(800,0,0)),w.h,'SAT-B');msg('WEAPON SAT: 2 RODS AWAY',1.4);},3500);}
  else{const tg=sbi(w);msg(tg?'INTERCEPTOR AWAY - LOCKED':'INTERCEPTOR AWAY',1.4);}
  if(typeof play3D==='function')play3D('missile',null,0.4,0.8);return true;};
 const _cw=cycleWeapon;cycleWeapon=function(){const w=where();if(w&&B.ammo){B.wi=(B.wi+1)%PAY.length;const p=PAY[B.wi];msg(NAME[p]+'  x'+B.ammo[p],0.9);return;}return _cw.apply(this,arguments);};
 // Shuttle: CTX (silo) keeps deorbit, FIRE becomes deploy when doors are open
 const _cx=ctxAction;ctxAction=function(){if(player&&player.kind==='shuttle'&&typeof SHS!=='undefined'&&SHS&&SHS.ph==='orbit'){shAction();return;}return _cx.apply(this,arguments);};
 // ---- per-frame: door animation + released payload drift ----
 const _tk=tick;tick=function(dt){_tk(dt);if(typeof SHS!=='undefined'&&SHS&&SHS.ph==='orbit'&&SHS.auto&&!SHS.deorbitReq&&B.lastDep&&performance.now()-B.lastDep<45000)SHS.closeDoors=false; // autopilot holds bay open 45 s after the last deploy
 if(player!==B.pl){B.pl=player;reset();}const w=where();if(!w){B.doorT=0;if(B.door>0)B.door=Math.max(0,B.door-dt*0.3);}
  B.door+=((B.doorT?1:0)-B.door)*Math.min(1,dt*0.6);if(Math.abs(B.door-B.doorT)<0.01)B.door=B.doorT;
  const d=typeof oRocket!=='undefined'&&oRocket&&oRocket.userData.bayDoor;if(d){d.door.position.x=d.cx-B.door*d.R*0.95;d.door.position.z=d.cz+d.R*(1.008+0.03*B.door);d.hole.visible=d.door.visible=player&&player.os&&player.os.kind==='starship';}
  for(let i=B.flying.length-1;i>=0;i--){const f=B.flying[i];f.t+=dt;f.m.position.addScaledVector(f.dir,dt*(0.6+f.t*0.5));f.m.rotation.y+=dt*0.15;if(f.t>20){f.parent.remove(f.m);B.flying.splice(i,1);}}};
 // real taps: the HUD buttons hold the ORIGINAL cycleWeapon/ctxAction references, so intercept them in capture phase while a bay is live
 document.addEventListener('pointerdown',e=>{const t=e.target&&e.target.closest&&e.target.closest('#bWpn,#bCtx');if(!t||!where()||!B.ammo)return;
  e.stopImmediatePropagation();e.preventDefault();t.classList.add('pr');setTimeout(()=>t.classList.remove('pr'),120);if(t.id==='bWpn')cycleWeapon();else ctxAction();},true);
 // Starship (rocket class, no weapons) never reaches fireWeapon from the FIRE button - edge-detect FIRE here in orbit
 const _tk0=tick;tick=function(dt){_tk0(dt);if(B.pin)B.forceStar();const w=where();const f=!!(inp&&inp.fire);if(w&&w.k==='starship'&&f&&!B.fp&&!(player.weapons&&player.weapons.length))fireWeapon(player);B.last=[!!w,f,!!B.fp,B.pin];B.fp=f;};
 // chase cam on the dropped rod (works from Starship orbit view too: renders the main world while following)
 const _rn=render;render=function(rdt){const o=B.follow;if(o&&!o.done&&!blastCam&&player){const d=V3().copy(o.vel).normalize(),sd=V3(d.z,0,-d.x).normalize();if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}camera.up.set(0,1,0);
   camera.position.copy(o.pos).addScaledVector(d,-22).addScaledVector(sd,5).add(V3(0,3,0));camera.lookAt(o.pos.x+d.x*30,o.pos.y+d.y*30,o.pos.z+d.z*30);updEnv(rdt);renderFrame(scene,camera);return;}
  if(o&&o.done)B.follow=null;_rn(rdt);};
 Object.assign(B,{camq:()=>camera.quaternion.toArray().concat([camera.fov,camera.matrixWorld.elements[12]]),cam:()=>({p:camera.position.toArray(),far:camera.far,near:camera.near,fog:scene.fog?[scene.fog.near,scene.fog.far,scene.fog.density]:null}),kinds:()=>Object.keys(DEFS),shs:()=>SHS&&{ph:SHS.ph,doors:+SHS.doors.toFixed(2),auto:SHS.auto},fire:()=>fireWeapon(player),cyc:()=>cycleWeapon(),ctx:()=>ctxAction(),nproj:()=>projs.filter(o=>o.type==='rod'||o.type==='hyper').length,
  forceShuttle(auto){SHS.ph='orbit';SHS.to=SHS.t-(auto?80:20);SHS.doors=1;SHS.auto=!!auto;SHS.pos.y=Math.max(SHS.pos.y,200000);},
  forceStar(){const os=player.os;Object.assign(os,{launched:true,orbit:true,engine:false,retro:false,stage:1,h:200000});}});
 window.__bay.where=where;window.__bay.pay=PAY;
})();
