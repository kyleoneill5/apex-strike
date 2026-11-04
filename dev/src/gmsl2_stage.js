// ===== GMSL2_STAGE: realistic, readable staging for every multi-stage missile (Kyle fix #2).
// Per stage: visible burnout (plume tapers + sputter) -> ~1.8 s coast (no plume) -> clean sep (spent stage tumbles away)
// -> ignition flash + plume from the NEW tail. Sim slows to real time around every staging event so it is watchable.
// Covers: auto ICBM/SLBM (Minuteman III, gicbmstage), manual ICBM (gicbm), hypersonic booster (HGV). Needs gicbmstage.js + gstaging.js before it.
(()=>{const T=THREE,UP=new T.Vector3(0,1,0),_v=new T.Vector3(),_w=new T.Vector3();
 let ACT=null;const COAST=1.8,TAPER=1.6,ST=[0,7.5,11.3,13.9];
 const MAP=new Map();// projectile -> {drop:bool, shift:number(m along -dir... tail offset), keep:0..1}
 const flash=(p,d,n=1)=>{const A=ACT;ACT=null;try{for(let k=0;k<14*n;k++)fire.spawn(_w.copy(p).addScaledVector(d,-0.5-Math.random()*2),rnd(5)-d.x*20,rnd(5)-d.y*20,rnd(5)-d.z*20,0.3+Math.random()*0.3,2.5,7,1,0.85,0.55,1);
  for(let k=0;k<10*n;k++)smoke.spawn(_w.copy(p).addScaledVector(d,-1),rnd(6),rnd(6),rnd(6),2.5,3,9,0.9,0.9,0.92,0.5,0.05,0);}finally{ACT=A;}};
 const sepRing=(p,d)=>{const A=ACT;ACT=null;try{for(let k=0;k<18;k++){const a=k/18*6.283;_v.set(Math.cos(a),0,Math.sin(a));_v.addScaledVector(d,-_v.dot(d)).normalize();smoke.spawn(p,_v.x*9,_v.y*9,_v.z*9,1.6,1.2,4,0.95,0.95,0.97,0.55,0.05,0);}}finally{ACT=A;}};
 // fire/smoke filter: per-object plume suppression / taper / re-anchor to the live tail
 const wrapSpawn=(ps)=>{const s0=ps.spawn;ps.spawn=function(p,...r){if(ACT){for(const [o,f] of ACT){const d=o.__gmDir;if(!d)continue;if(p.distanceToSquared(o.pos)<(f.r||12)*(f.r||12)){
     if(f.drop)return;if(f.keep<1&&Math.random()>f.keep)return;if(f.shift){p=_w.copy(p).addScaledVector(d,f.shift);}break;}}}return s0.call(ps,p,...r);};};
 wrapSpawn(fire);wrapSpawn(smoke);
 const dirOf=o=>{if(!o.__gmDir)o.__gmDir=new T.Vector3();const d=o.__gmDir;if(o.man&&o.dirT&&o.phase==='boost')d.copy(o.dirT);else d.copy(o.vel).normalize();return d;};
 const _up=updProjs;updProjs=function(dt){ACT=MAP.size?MAP:null;for(const o of MAP.keys()){if(o.done||!projs.includes(o)){MAP.delete(o);continue;}dirOf(o);}
  try{return _up(dt);}finally{ACT=null;}};
 const tailSt=o=>ST[Math.min(3,o.gs?o.gs.stg:(o.stg||0))]||0;
 // ---------------- AUTO ICBM / SLBM ----------------
 const _ub=updBallistic;updBallistic=function(o,dt){
  const autoNew=(o.name==='ICBM'||o.name==='SLBM')&&!o.man&&!o.rv&&!o.gs&&o.t<0.2&&o.boostT>0&&o.boostT<1e8&&o.boostT<100;
  if(autoNew)o.boostT=135;// ~45 s per stage (game time): S1 0-48.6, S2 -94.5, S3 -135
  if(o.man)return manual(o,dt);
  const g0=o.gs,c0=g0?g0.coast:0,s0=g0?g0.stg:-1;
  if(o.gs&&!o.rv){const g=o.gs;let f={drop:false,keep:1,shift:0,r:14};
   if(g.coast>0)f.drop=true;else{const nxt=g.stg<2?g.cut[g.stg]:o.boostT;const left=nxt-o.t;if(left<TAPER&&o.t<o.boostT)f.keep=Math.max(0.08,left/TAPER)*0.9;f.shift=tailSt(o);}
   MAP.set(o,f);}
  _ub(o,dt);const g=o.gs;if(!g||o.rv)return;
  if(g.stg>s0&&s0>=0){g.coast=COAST;g.sepT=o.t;const d=dirOf(o);sepRing(_v.copy(o.pos).addScaledVector(d,ST[g.stg]),d);}
  if(c0>0&&g.coast<=0){g.ignT=o.t;const d=dirOf(o);flash(_v.copy(o.pos).addScaledVector(d,ST[g.stg]),d,1.4);}
  if(o.t>=o.boostT&&!g.bo){g.bo=true;MAP.delete(o);}
 };
 // ---------------- MANUAL ICBM (gicbm) ----------------
 function manual(o,dt){
  if(o.phase==='boost'&&o.gmCoast>0){o.gmCoast-=dt;o.t+=dt;o.vel.y-=G*dt;o.pos.addScaledVector(o.vel,dt);o.mesh.position.copy(o.pos);o.mesh.quaternion.setFromUnitVectors(UP,o.dirT);
   if(o.gmCoast<=0){const d=dirOf(o);flash(_v.copy(o.pos).addScaledVector(d,ST[o.stg]),d,1.4);msg('STAGE '+(o.stg+1)+' IGNITION',1.2);o.gmIgn=o.t;}return;}
  if(o.phase==='boost'){const S=ICBM_ST[o.stg];const left=S?S.t-o.burn:9;MAP.set(o,{drop:false,keep:left<TAPER?Math.max(0.08,left/TAPER):1,shift:ST[o.stg]||0,r:14});}
  else MAP.delete(o);
  const s0=o.stg;_ub(o,dt);
  if(o.stg>s0&&o.phase==='boost'){o.gmCoast=COAST;o.gmSep=o.t;const d=dirOf(o);sepRing(_v.copy(o.pos).addScaledVector(d,ST[o.stg]),d);}}
 const _st=icbmStage;icbmStage=function(o){_st(o);if(o.phase==='boost'&&o.mesh){o.mesh.scale.setScalar(1);}};// gstaging clips; drop old shrink
 // manual: hold the "IGNITION" message until the coast ends
 const _msg=msg;let quiet=false;msg=function(t,d){if(quiet&&/IGNITION/.test(t))return;return _msg(t,d);};
 {const _u2=updBallistic;updBallistic=function(o,dt){quiet=!!o.man;try{return _u2(o,dt);}finally{quiet=false;}};}
 // ---------------- HYPERSONIC: solid booster stack under the HGV ----------------
 const HB={burn:7.5,coast:COAST};let boosterProto=null;
 function booster(){// two-segment solid booster, matte white/grey, 4 fins, nozzle — Z axis, nose -Z, length 9 m, Ø 0.9
  const G=new T.Group();const L=9,R=0.45;const m=new T.MeshStandardMaterial({color:0xdcdcd6,roughness:0.62,metalness:0.1}),d=new T.MeshStandardMaterial({color:0x2c2e30,roughness:0.5,metalness:0.4});
  const pts=[[0.33,0],[R,0.25],[R,L-0.6],[0.36,L]].map(p=>new T.Vector2(p[0],p[1]));const b=new T.Mesh(new T.LatheGeometry(pts,40),m);b.rotation.x=-Math.PI/2;b.position.z=L/2;G.add(b);
  for(const y of[0.3,3.2,6.1,L-0.62]){const r=new T.Mesh(new T.CylinderGeometry(R+0.012,R+0.012,0.12,40,1,true),d);r.rotation.x=Math.PI/2;r.position.z=L/2-y;G.add(r);}
  const rw=new T.Mesh(new T.BoxGeometry(0.1,0.07,L-1.2),d);rw.position.set(0,R+0.03,0);G.add(rw);
  const nz=new T.Mesh(new T.CylinderGeometry(0.3,0.4,0.6,32,1,true),new T.MeshStandardMaterial({color:0x1d1b19,metalness:0.6,roughness:0.4,side:T.DoubleSide}));nz.rotation.x=Math.PI/2;nz.position.z=L/2+0.28;G.add(nz);
  for(let i=0;i<4;i++){const s=new T.Shape();s.moveTo(0,0);s.lineTo(0.55,0.25);s.lineTo(0.55,0.9);s.lineTo(0,1.6);s.closePath();const f=new T.Mesh(new T.ExtrudeGeometry(s,{depth:0.03,bevelEnabled:false}),d);
   f.rotation.x=-Math.PI/2;const p=new T.Group();f.position.set(R*0.95,0,L/2-0.05);p.add(f);p.rotation.z=i*Math.PI/2+Math.PI/4;G.add(p);}
  G.userData.len=L;return G;}
 function hgvL(o){const u=o.msl||(o.mesh&&o.mesh.userData)||{};return u.len||5.4;}
 const _gh=window.gameHook;window.gameHook=function(dt){
  for(const o of projs){if(o.type!=='hyper'||o.done||o.hb===false)continue;
   if(!o.hb){o.gsB=true;// tell gicbmstage we handle the booster
    if(!boosterProto)boosterProto=booster();const b=boosterProto.clone(true);const Lh=hgvL(o);b.position.z=Lh/2+4.5-0.1;o.mesh.add(b);
    o.hb={t:0,b,Lh,acc0:o.acc,max0:o.maxSpd,ph:'burn'};o.maxSpd=Math.min(o.maxSpd,2300);}
   const h=o.hb;h.t+=dt;const shift=-(h.Lh/2+9+0.3-3.5);// g4 spawns plume at -3.5 m: move it to the booster nozzle
   if(h.ph==='burn'){const left=HB.burn-h.t;MAP.set(o,{drop:false,keep:left<TAPER?Math.max(0.08,left/TAPER):1,shift,r:9});
    if(left<=0){h.ph='coast';h.t=0;o.acc=0;MAP.set(o,{drop:true,r:9});msg('BOOSTER BURNOUT',1);}}
   else if(h.ph==='coast'&&h.t>=HB.coast){h.ph='glide';o.acc=h.acc0;o.maxSpd=h.max0;MAP.delete(o);
    // separate: spent booster becomes debris with retro + tumble (gicbmstage debris integrator)
    const S=window.__gicbmstage;const b=h.b;o.mesh.updateMatrixWorld(true);const wp=new T.Vector3(),wq=new T.Quaternion();b.getWorldPosition(wp);b.getWorldQuaternion(wq);o.mesh.remove(b);
    const g=new T.Group();g.add(b);b.position.set(0,0,0);g.position.copy(wp);g.quaternion.copy(wq);scene.add(g);
    if(S)S.debris.push({m:g,p:wp.clone(),v:o.vel.clone().addScaledVector(_v.copy(o.vel).normalize(),-25).add(new T.Vector3(rnd(3),rnd(3),rnd(3))),w:new T.Vector3(rnd(0.6),rnd(0.6),rnd(0.6)),t:0});
    const d=_w.copy(o.vel).normalize();sepRing(_v.copy(o.pos).addScaledVector(d,-h.Lh/2),d.clone());msg('BOOSTER SEP - HGV GLIDE',1.2);o.hb.done=true;}
  }
  if(_gh)_gh(dt);};
 // ---------------- time scale: real time around staging, fast elsewhere ----------------
 window.__gmsl2TS=function(){const o=camFollow;if(!o)return 1;
  if(o.type==='ballistic'){if(o.rv||o.t>=o.boostT+4)return 5;
   if(o.man){if(o.phase!=='boost')return 5;if(o.gmCoast>0)return 1;if(o.gmIgn!=null&&o.t-o.gmIgn<2.5)return 1;const S=ICBM_ST[o.stg];if(S&&S.t-o.burn<2.2)return 1;return 5;}
   const g=o.gs;if(!g)return 5;if(g.coast>0)return 1;if(g.ignT!=null&&o.t-g.ignT<2.5)return 1;if(o.t<6)return 1;
   const nxt=g.stg<2?g.cut[g.stg]:o.boostT;if(nxt-o.t<2.2&&nxt-o.t>-1)return 1;return 5;}
  if(o.type==='sm3'&&window.GMSL2_SM3)return GMSL2_SM3.ts(o);return 1;};
 window.__gmsl2stage={MAP,HB};})();

window.V3=V3;window.camFollowRef=()=>camFollow;

Object.defineProperty(window,'camFollow',{get:()=>camFollow,set:v=>{camFollow=v;}});
