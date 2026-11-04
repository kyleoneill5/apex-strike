// ---------- Falcon 9 / Starship + recovery ----------
const STEEL=()=>new THREE.MeshStandardMaterial({color:0xaeb3b8,metalness:1.0,roughness:0.22,normalMap:panelNrm,normalScale:new THREE.Vector2(0.25,0.25),envMapIntensity:1.6});
function f9Model(){const g=new THREE.Group(),w=0xf2f2f2;const s1=new THREE.Group(),s2=new THREE.Group(),fair=new THREE.Group();
 add(s1,new THREE.CylinderGeometry(1.83,1.83,41,20),w,0,20.5+1,0);add(s1,new THREE.CylinderGeometry(1.84,1.84,6,20),0x1a1a1a,0,44.5,0);
 for(let i=0;i<9;i++){const a=i/8*Math.PI*2,r=i===8?0:1.2;add(s1,new THREE.CylinderGeometry(0.25,0.45,1.2,8),0x2a2a2a,i===8?0:Math.cos(a)*r,0.5,i===8?0:Math.sin(a)*r);}
 const fins=[],legs=[];for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const f=new THREE.Group();f.position.set(Math.cos(a)*1.9,46,Math.sin(a)*1.9);f.rotation.y=-a;add(f,new THREE.BoxGeometry(0.15,1.2,1.4),0x333333,0.1,0,0);f.rotation.z=-Math.PI/2*0.0;fins.push(f);s1.add(f);
  const lp=new THREE.Group();lp.position.set(Math.cos(a)*1.85,1.5,Math.sin(a)*1.85);lp.rotation.y=-a;add(lp,new THREE.BoxGeometry(0.35,10,0.6),0x2b2b2b,0.15,5,0);legs.push(lp);s1.add(lp);}
 s1.userData={fins,legs};
 add(s2,new THREE.CylinderGeometry(1.83,1.83,13,20),w,0,47+6.5,0);add(fair,new THREE.CylinderGeometry(2.6,1.83,1.2,20),w,0,60.6,0);add(fair,new THREE.CylinderGeometry(2.6,2.6,6,20),w,0,64.2,0);
 const ng=new THREE.LatheGeometry(Array.from({length:12},(_,i)=>new THREE.Vector2(2.6*Math.cos(i/11*Math.PI/2),i/11*6.5)),20);add(fair,ng,w,0,67.2,0);
 g.add(s1,s2,fair);g.userData={s1,s2,fair,s2base:47};return g;}
function starshipModel(){const g=new THREE.Group();const s1=new THREE.Group(),s2=new THREE.Group(),fair=new THREE.Group();const st=STEEL();
 add(s1,new THREE.CylinderGeometry(4.5,4.5,71,32),st,0,35.5,0);add(s1,new THREE.CylinderGeometry(4.3,3.6,1.5,32),0x222222,0,0,0);
 for(let i=0;i<33;i++){const r=i<3?0.9:i<13?2.4:3.8;const n=i<3?3:i<13?10:20;const k=i<3?i:i<13?i-3:i-13;const a=k/n*Math.PI*2;add(s1,new THREE.CylinderGeometry(0.35,0.55,1.4,8),0x333333,Math.cos(a)*r,-0.6,Math.sin(a)*r);}
 const fins=[];for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const f=new THREE.Group();f.position.set(Math.cos(a)*4.7,66,Math.sin(a)*4.7);f.rotation.y=-a;add(f,new THREE.BoxGeometry(0.3,3.5,3),0x555555,0.4,0,0);fins.push(f);s1.add(f);}
 add(s1,new THREE.CylinderGeometry(4.55,4.55,2,32),0x2a2a2a,0,72,0);s1.userData={fins,legs:[]};
 add(s2,new THREE.CylinderGeometry(4.5,4.5,32,32),st,0,73+16,0);
 const nose=new THREE.LatheGeometry(Array.from({length:16},(_,i)=>new THREE.Vector2(4.5*Math.cos(i/15*Math.PI/2)**0.9,i/15*18)),32);add(s2,nose,st,0,105,0);
 const hs=new THREE.Mesh(new THREE.CylinderGeometry(4.56,4.56,32,24,1,true,-Math.PI/2,Math.PI),new THREE.MeshStandardMaterial({color:0x111214,roughness:0.85,metalness:0.1}));hs.position.set(0,89,0);s2.add(hs);
 for(const [y,s] of [[77,1],[106,0.7]])for(const sx of [-1,1]){const f=add(s2,new THREE.BoxGeometry(0.3,s*9,s*5),0x1b1b1d,0,y+s*4.5,sx*(4.5+s*2.2));}
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2,r=i<3?1.2:2.8;add(s2,new THREE.CylinderGeometry(0.4,i<3?0.6:1.0,1.6,8),0x333333,Math.cos(a)*r,73,Math.sin(a)*r);}
 s2.userData={shield:hs};g.add(s1,s2,fair);g.userData={s1,s2,fair,s2base:73};return g;}
function boosterFromModel(model){const b=model.userData.s1.clone(true);const fins=[],legs=[];b.traverse(o=>{});
 // re-collect fins/legs by matching structure
 const src=model.userData.s1.userData;b.userData={fins:src.fins.map(f=>b.children[model.userData.s1.children.indexOf(f)]),legs:src.legs.map(l=>b.children[model.userData.s1.children.indexOf(l)])};const g=new THREE.Group();g.add(b);g.userData=b.userData;return g;}
function shipFromModel(model){const b=model.userData.s2.clone(true);const g=new THREE.Group();b.position.y=-73;g.add(b);g.userData={shield:b.children[model.userData.s2.children.indexOf(model.userData.s2.userData.shield)]};return g;}
// landing sites
const DSHIP=V3(8500,0,-4700),SPLASH=V3(-12000,0,20000);
const droneShip=(()=>{const g=new THREE.Group();add(g,new THREE.BoxGeometry(52,5,92),0x2d3033,0,0.5,0);const r=add(g,new THREE.RingGeometry(14,16,40).rotateX(-Math.PI/2),0xeeeeee,0,3.05,0);
 add(g,new THREE.BoxGeometry(2,0.1,22),0xeeeeee,0,3.06,0).rotation.y=0.785;add(g,new THREE.BoxGeometry(2,0.1,22),0xeeeeee,0,3.06,0).rotation.y=-0.785;
 add(g,new THREE.BoxGeometry(3,8,3),0x444444,22,7,40);add(g,new THREE.BoxGeometry(3,8,3),0x444444,-22,7,40);g.position.copy(DSHIP);scene.add(g);return g;})();
const mechazilla=(()=>{const g=new THREE.Group();const c=0x505458;for(const dx of[-4,4])for(const dz of[-4,4])add(g,new THREE.BoxGeometry(0.8,146,0.8),c,dx,73,dz);
 for(let y=6;y<146;y+=6){add(g,new THREE.BoxGeometry(8.8,0.4,0.4),c,0,y,4);add(g,new THREE.BoxGeometry(8.8,0.4,0.4),c,0,y,-4);add(g,new THREE.BoxGeometry(0.4,0.4,8.8),c,4,y,0);add(g,new THREE.BoxGeometry(0.4,0.4,8.8),c,-4,y,0);}
 const arms=[];for(const sz of[-1,1]){const p=new THREE.Group();p.position.set(4,98,sz*3.5);add(p,new THREE.BoxGeometry(26,2.5,1.6),0x3a3d40,13,0,0);p.userData.sz=sz;arms.push(p);g.add(p);}
 g.userData.arms=arms;g.position.set(PAD.x-20,10,PAD.z);g.visible=false;scene.add(g);return g;})();
const buoy=(()=>{const g=new THREE.Group();add(g,new THREE.CylinderGeometry(2,2.5,4,12),0xff6a00,0,1,0);add(g,new THREE.RingGeometry(55,60,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:0.6,side:THREE.DoubleSide}),0,0.6,0);g.position.copy(SPLASH);scene.add(g);return g;})();
const BCFG={
 falcon9:{dry:25600,fEng:914e3,ispSL:282,ispVac:311,bbEng:3,entryEng:3,landEng:1,minThr:0.4,CdA:12.6,flipT:10,boostback:true,aim:0,entryBurn:true,entryAlt:55000,entryV:1000,landProp:4000,radius:45,successMsg:'🎉 THE FALCON HAS LANDED - drone ship recovery!',assist:true,site:'drone ship',flame:[1,0.75,0.4]},
 starship:{dry:200000,fEng:2450e3,ispSL:327,ispVac:350,bbEng:13,entryEng:13,landEng:3,landEngHi:13,minThr:0.4,CdA:63.6,flipT:6,boostback:true,aim:0,entryBurn:true,entryAlt:45000,entryV:700,landStartMax:4000,landProp:22000,radius:15,successMsg:'🥢 BOOSTER CAUGHT BY THE CHOPSTICKS!',assist:true,site:'tower',flame:[0.6,0.7,1]}};
const SHIPCFG={dry:120000,fEng:2450e3,ispSL:330,ispVac:375,landEng:3,minThr:0.4,CdA:63.6,bellyCdA:500,flipT:1,radius:60,assist:true,successMsg:'🌊 SHIP LANDED - SOFT SPLASHDOWN ON TARGET!',flame:[0.6,0.7,1]};
function setupRocketModels(rk){warp=1;if(padRocket)scene.remove(padRocket);if(oRocket)oScene.remove(oRocket);
 const mk=rk==='falcon9'?f9Model:rk==='starship'?starshipModel:rocketModel;padRocket=mk();padRocket.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});if(!padRocket.userData.s2base)padRocket.userData.s2base=45.6;scene.add(padRocket);oRocket=mk();oRocket.scale.setScalar(0.001);oScene.add(oRocket);
 mechazilla.visible=rk==='starship';mechazilla.userData.arms.forEach(a=>a.rotation.y=a.userData.sz*0.6);pad.children.forEach(c=>{if(c.position.x<-5&&c.position.x>-13)c.visible=rk!=='starship';});
 for(const k of ['booster','shipDS'])if(rec[k]){scene.remove(rec[k].mesh);rec[k]=null;}}
const rec={booster:null,shipDS:null};
function startBooster(v){const os=v.os;const cfg=BCFG[os.kind];if(!cfg||!os.sepState)return false;const ss=os.sepState;
 const ds=DS.fromOrbit(ss,'booster',{...cfg,prop:ss.prop});ds.auto=true;if(os.kind==='falcon9'){const xp=DS.predictX(ds);ds.x=-xp*0.5;}else ds.x=ds.dr;
 const mesh=boosterFromModel(padRocket);scene.add(mesh);rec.booster={ds,mesh,cfg,site:os.kind==='falcon9'?DSHIP.clone().setY(3):V3(PAD.x,10+22,PAD.z),q:new THREE.Quaternion()};
 padRocket.userData.s1.visible=false;oRocket.userData.s1.visible=false;rocketMsgQ.push('BOOSTER SEPARATED - tap '+(isTouch?'VIEW':'X')+' to follow it home');return true;}
function startShipDescent(v){const os=v.os;const ds=DS.fromOrbit(os,'ship',{...SHIPCFG,prop:os.stages[1].prop});ds.auto=true;ds.x=-DS.predictX(ds);
 const mesh=shipFromModel(padRocket);scene.add(mesh);rec.shipDS={ds,mesh,cfg:SHIPCFG,site:SPLASH.clone(),q:new THREE.Quaternion()};v.view='shipDS';os.engine=false;padRocket.visible=false;oRocket.visible=false;warp=Math.min(warp,10);
 rocketMsgQ.push('ENTRY INTERFACE - belly-flop reentry, target buoy at sea');}
function updRecovery(v,sim){for(const k of ['booster','shipDS']){const r=rec[k];if(!r)continue;const ds=r.ds;
  if(!ds.auto||settings.advanced&&ds.phase==='landing'&&v.view===k){ds.auto=false;if(ds.phase==='landing'){ds.thr=inp.throttle;ds.att=90-inp.roll*25;}}
  const fast=(ds.phase==='coast'||ds.phase==='belly'||ds.phase==='flip')&&ds.h>20000;const hs=fast?0.25:0.02;let n=Math.min(1500,Math.ceil(sim/hs));const d=sim/Math.max(1,n);
  for(let i=0;i<n&&!ds.landed&&!ds.crashed;i++)DS.step(ds,d);
  while(ds.events.length){const e=ds.events.shift();rocketMsgQ.push((k==='booster'?'BOOSTER: ':'SHIP: ')+e);
   if(ds.landed&&k==='booster'&&r.cfg.site==='tower'){r.caught=true;}
   if(ds.crashed){explosion(r.mesh.position.clone().add(V3(0,10,0)),5);r.mesh.visible=false;shake=Math.max(shake,1);}
   if(ds.landed&&k==='shipDS'){splash(r.mesh.position,8);}
   if(ds.landed||ds.crashed){Bus.emit('recovery.end',{vehicle:k,ok:ds.landed,x:ds.x});if(mission&&mission.m.id==='landing'&&k==='booster')endMission(ds.landed,10000-Math.abs(ds.x)*80);}}
  // visuals
  const m=r.mesh;m.position.set(r.site.x+ds.x,r.site.y+Math.max(0,ds.h),r.site.z);if(k==='shipDS')m.position.y=Math.max(m.position.y,r.site.y+(ds.landed?-20:0));
  let up;const thrOn=ds.thr>0&&ds.eng>0&&ds.prop>0;const a=ds.att*Math.PI/180;
  if(thrOn)up=V3(Math.cos(a),Math.sin(a),0);else if(k==='shipDS'&&(ds.phase==='belly'||ds.phase==='coast'||ds.phase==='flip'))up=V3(Math.sign(ds.vx||1),0.05,0).normalize();
  else{const v2=Math.hypot(ds.vx,ds.vh)||1;up=ds.phase==='boostback'||ds.phase==='flip'?V3(-Math.sign(ds.vx||1)*0.3,1,0).normalize():V3(-ds.vx/v2*0.15,1,0).normalize();}
  r.q.setFromUnitVectors(V3(0,1,0),up);m.quaternion.slerp(r.q,Math.min(1,sim*(ds.phase==='landing'?1.2:0.5)));
  const ud=m.userData;if(ud.legs)ud.legs.forEach(l=>{l.rotation.z+=((ds.leg?0.55:0)-l.rotation.z)*Math.min(1,sim*1.5);});if(ud.fins)ud.fins.forEach(f=>{f.rotation.z+=((ds.fins||k==='booster'&&ds.phase!=='flip'?-Math.PI/2:0)-f.rotation.z)*Math.min(1,sim*2);});
  const fc=r.cfg.flame;const dl=V3(0,1,0).applyQuaternion(m.quaternion);
  if(thrOn&&!ds.landed){const n2=Math.ceil(ds.eng/4)+1;const pl=1+Math.min(6,ds.h/8000);for(let i=0;i<n2;i++)fire.spawn(_t.copy(m.position).addScaledVector(dl,-1-i*2),-dl.x*50+rnd(3),-dl.y*50+rnd(3),rnd(3),0.25,(k==='booster'&&r.cfg.site==='tower'?6:3)*pl,6*pl,fc[0],fc[1],fc[2],1,0,0,1,0.4,0.2);
   if(ds.h<200)for(let i=0;i<2;i++){const a2=Math.random()*6.28;smoke.spawn(_t.set(m.position.x+Math.cos(a2)*8,r.site.y+2,m.position.z+Math.sin(a2)*8),Math.cos(a2)*40,6,Math.sin(a2)*40,5,12,12,0.85,0.85,0.85,0.6,0.5,0);}}
  if(ds.plasma>0.02){const s=ds.plasma;for(let i=0;i<3;i++){const off=k==='shipDS'?V3(0,-5,0):dl.clone().multiplyScalar(-2);fire.spawn(_t.copy(m.position).add(off).add(V3(rnd(8),rnd(3),rnd(8))),-ds.vx*0.05,-ds.vh*0.05+5,0,0.4,10*s+4,8,1,0.45+rnd(0.1),0.55,0.8*s,0,0,1,0.3,0.6);}}
  if(k==='shipDS'&&ud.shield)ud.shield.material.emissive=new THREE.Color(1,0.35,0.15).multiplyScalar(ds.plasma*1.5);
  if(r.caught){mechazilla.userData.arms.forEach(a=>a.rotation.y+=(0-a.rotation.y)*Math.min(1,sim*1.5));}}}
