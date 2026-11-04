//GMSLHOOK-BEGIN  swaps generic projectile meshes for MSL_MODELS at spawn; per-frame model animation. Enemy SAMs (eMissiles) untouched.
(()=>{if(!window.MSL_MODELS)return;const MM=MSL_MODELS;
const noShadow=g=>{g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});return g;};
const yUp=g=>{const w=new THREE.Group();g.rotation.x=Math.PI/2;g.position.y=g.userData.len/2;w.add(g);w.userData=g.userData;return w;};
// cruise missile weapon (Tomahawk) for destroyer + sub
AMMO.CRUISE=8;for(const k of ['destroyer','sub'])if(DEFS[k]&&!DEFS[k].weapons.includes('CRUISE'))DEFS[k].weapons.splice(DEFS[k].weapons.indexOf('HYPERSONIC')+1,0,'CRUISE');
const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons[v.wi];if(w!=='CRUISE')return _fw(v);
 if(!(v.ammo[w]>0)||simT<(v.cool||0))return false;v.cool=simT+2;v.ammo[w]--;const p=v.mesh.position,q=v.mesh.quaternion;
 const sub=v.def.cls==='sub';const o=p.clone().add(V3(0,sub?2:10,0)).addScaledVector(fwdOf(q,V3()),sub?-10:30);if(sub)splash(o,3);
 const tg=nearestTarget(p,null,['boat','drone'],60000,-1);
 addProj({type:'missile',pos:o,vel:V3(0,40,0),life:150,mesh:missileMesh(5.5,0.26),owner:v,maxSpd:250,acc:90,turn:0.9,tg,arm:1.5,boost:1.5,tlam:true,age:0});
 msg(tg?'TOMAHAWK AWAY - WINGS DEPLOYING':'TOMAHAWK AWAY - NO TARGET',1.5);if(typeof sfx==='function')sfx('missile');return true;};
const _ap=addProj;addProj=function(o){try{
 const v=o.owner,cls=v&&v.def&&v.def.cls;let m=null;
 if(o.mslName&&MM[o.mslName]){m=MM[o.mslName]();}
 else if(o.tlam){m=MM.tomahawk({deployed:false});}
 else if(o.type==='missile'){const w=v&&v.weapons?v.weapons[v.wi]:'';
  if(cls==='heli')m=MM.hellfire();
  else if(cls==='air'){const d=o.tg&&o.tg.pos?o.tg.pos.distanceTo(o.pos):1e9;m=d<3500?MM.aim9x():MM.aim120();}
  else m=MM.aim120();}           // ship/sub SAM: active-radar interceptor stand-in
 else if(o.type==='hyper')m=MM.hgv();
 else if(o.type==='torpedo')m=MM.mk48();
 else if(o.type==='nuke')m=MM.b61();
 else if(o.type==='ballistic')m=yUp((o.rv||o.sep)?MM.mk12a():MM.minuteman3());
 if(m){noShadow(m);if(o.mesh){m.position.copy(o.mesh.position);m.quaternion.copy(o.mesh.quaternion);}o.mesh=m;o.msl=m.userData;}
}catch(e){console.warn('mslhook',e);}return _ap(o);};
const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
 for(const o of projs){const u=o.msl;if(!u)continue;
  if(o.tlam){o.age=(o.age||0)+dt;u.deploy&&u.deploy(Math.min(1,Math.max(0,(o.age-1.2)/1.3)));}
  if(u.glow){const h=o.pos.y,sp=o.vel.length();const q=1.225*Math.exp(-h/7200)*sp*sp*sp*1e-9;u.glow(Math.min(1,q*0.5));}
  if(u.spin)u.spin(dt);}};
})();
//GMSLHOOK-END
// screenshot/dev hook: optional camera override (unused in normal play)
{const _uc=updCamera;updCamera=function(dt){_uc(dt);if(window.__camOv)window.__camOv(camera,THREE);};}
// ===== GBU-43/B MOAB: loadout weapon for air vehicles, GPS-guided fall, massive air blast =====
(()=>{if(!window.MSL_MODELS||!MSL_MODELS.moab)return;AMMO.MOAB=1;
 const HEAVY=['ac130','c130','mc130','b2','b52','b1','b1b','b21','tu95','tu160'];let patched=false;const patch=()=>{for(const k in DEFS){const d=DEFS[k];const heavy=HEAVY.includes(k)||d.heavy||d.bomber;if(!Array.isArray(d.weapons))continue;const i=d.weapons.indexOf('MOAB');if(heavy&&i<0)d.weapons.push('MOAB');if(!heavy&&i>=0)d.weapons.splice(i,1);}};patch();
 const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons[v.wi];if(w!=='MOAB')return _fw(v);if(!(v.ammo[w]>0)||simT<(v.cool||0))return false;v.cool=simT+3;v.ammo[w]--;
  const q=v.mesh.quaternion,p=v.mesh.position.clone().addScaledVector(upOf(q,V3()),-3);const f=fwdOf(q,V3());
  // GPS aim point: ground point ahead along current track (or nearest ground target within 6 km)
  const tg=nearestTarget(p,null,['boat','drone'],6000,-1);let aim=tg?tg.pos.clone():p.clone().addScaledVector(V3(f.x,0,f.z).normalize(),Math.max(800,p.y*1.2));aim.y=groundAt(aim.x,aim.z).h;
  const mesh=noShadowM(MSL_MODELS.moab());mesh.position.copy(p);const o={type:'moab',pos:p,vel:(v.vel?v.vel.clone():V3()).add(V3(0,-2,0)),life:240,mesh,owner:v,aim,t:0,chute:null};
  // pallet extraction look: small drogue chute for the first seconds
  const ch=new THREE.Mesh(new THREE.SphereGeometry(2.2,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x6b6a52,roughness:0.9,side:THREE.DoubleSide}));ch.rotation.x=Math.PI/2;ch.position.z=11;mesh.add(ch);o.chute=ch;
  addProj(o);msg('MOAB AWAY - GPS GUIDED\nGBU-43/B  ~11 t TNT eq.',2.5);if(typeof sfx==='function')sfx('missile');return true;};
 function noShadowM(g){g.traverse(o=>{if(o.isMesh){o.castShadow=false;}});return g;}
 const RING=new THREE.MeshBasicMaterial({color:0xfff0d8,transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false});
function blast(p){if(window.MOAB_BLAST)return MOAB_BLAST(p);msg('MOAB DETONATION  ~11 t TNT  |  blast radius ~1 km',3.5);
  explosion(p,9);for(let k=0;k<120;k++)fire.spawn(p,rnd(160),40+Math.random()*220,rnd(160),1.2+Math.random()*1.4,40,90,1,0.62+Math.random()*0.2,0.25,1,4);
  // dust mushroom: stem + cap
  for(let k=0;k<70;k++)smoke.spawn(_t.copy(p).add(V3(rnd(30),20+k*4,rnd(30))),rnd(15),25+Math.random()*30,rnd(15),16,30,70,0.55,0.48,0.4,0.8,0.05,0.3);
  for(let k=0;k<90;k++){const a=Math.random()*6.28,r=Math.random()*120;smoke.spawn(_t.copy(p).add(V3(Math.cos(a)*r,320+Math.random()*80,Math.sin(a)*r)),Math.cos(a)*30,8,Math.sin(a)*30,20,60,120,0.5,0.44,0.38,0.85,0.02,0.2);}
  for(let k=0;k<160;k++){const a=Math.random()*6.28;smoke.spawn(_t.copy(p).add(V3(0,4,0)),Math.cos(a)*(150+Math.random()*120),6+Math.random()*10,Math.sin(a)*(150+Math.random()*120),9,20,45,0.6,0.52,0.42,0.7,0.6,0.5);}// ground-hugging dust surge
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.92,1,96).rotateX(-Math.PI/2),RING.clone());ring.position.copy(p).setY(p.y+3);scene.add(ring);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.18,depthWrite:false,side:THREE.DoubleSide}));dome.position.copy(p);scene.add(dome);// condensation shock dome
  let rt=0;const rr=()=>{rt+=0.016;ring.scale.setScalar(30+rt*1100);ring.material.opacity=Math.max(0,0.7-rt*0.45);dome.scale.setScalar(20+rt*700);dome.material.opacity=Math.max(0,0.22-rt*0.6);if(rt<1.6)requestAnimationFrame(rr);else{scene.remove(ring);scene.remove(dome);}};rr();
  const cr=new THREE.Mesh(new THREE.CircleGeometry(160,48).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2f2820,roughness:1,transparent:true,opacity:0.85,polygonOffset:true,polygonOffsetFactor:-4}));cr.position.copy(p).setY(p.y+0.3);scene.add(cr);
  if(typeof shake!=='undefined')shake=Math.max(shake,3.5);
  if(typeof play3D==='function'){play3D('boom',p.clone(),2,0.45,4000);play3D('explosion',p.clone(),2,0.5,4000);play3D('debris',p.clone(),1.2,0.8,1500);}
  for(const t of targets){if(!t.alive||!t.pos)continue;const d=t.pos.distanceTo(p);if(d<1100)killTarget(t,true);}
  if(typeof BLD!=='undefined'&&typeof damageBuilding==='function'){for(const b of BLD){const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<900)damageBuilding(b,d<300?1:0.8*(1-d/900)+0.2,'moab');}if(typeof NYC!=='undefined'&&Math.hypot(p.x-NYC.x,p.z-NYC.z)<8000&&typeof play3D==='function')play3D('collapse',p.clone(),1.4,0.85,3000);}
  const pl=player&&player.mesh;if(pl&&pl.position.distanceTo(p)<500&&player.def.cls!=='air'&&typeof msg==='function')msg('YOU WERE CAUGHT IN THE BLAST',2);}
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);if(!patched){patched=true;patch();if(player&&player.weapons&&player.def.weapons&&player.def.weapons.includes('MOAB')&&!player.weapons.includes('MOAB')){player.weapons.push('MOAB');player.ammo.MOAB=1;}}
  for(const o of projs){if(o.type!=='moab'||o.done)continue;o.t+=dt;const p=o.pos;
   // drag (chute for 3 s), gravity, then GPS steering by tail fins toward the aim point
   const chute=o.t<3;o.vel.y-=G*dt;const sp=o.vel.length();o.vel.multiplyScalar(1-(chute?0.0035:0.00025)*sp*dt);
   if(!chute){if(o.chute){o.mesh.remove(o.chute);o.chute=null;}const tt=Math.max(1,(p.y-o.aim.y)/Math.max(30,-o.vel.y));const want=V3((o.aim.x-p.x)/tt,0,(o.aim.z-p.z)/tt);
    o.vel.x+=(want.x-o.vel.x)*Math.min(1,dt*0.8);o.vel.z+=(want.z-o.vel.z)*Math.min(1,dt*0.8);}
   p.addScaledVector(o.vel,dt);o.mesh.position.copy(p);o.mesh.lookAt(_t.copy(p).sub(o.vel));
   const g=groundAt(p.x,p.z).h;if(p.y<=g+6){o.done=true;o.life=0;blast(p.clone().setY(g+6));}}};
})();
