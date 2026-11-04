// ===== GSTAGING v2 (msl builder): slow, visible Minuteman III staging, one stage at a time.
// Burn -> SEPARATION (spent stage = its own clipped segment, tumbles away) -> ~2.6 s coast, no plume -> next stage IGNITION with plume from the NEW tail.
// The live model is clipped at the live stage's aft station and slid so that tail sits on the projectile origin (where the plume spawns). =====
(()=>{const T=THREE,S=window.__gicbmstage;if(!S||!window.MSL_MODELS)return;renderer.localClippingEnabled=true;
 const ST=[0,7.5,11.3,13.9];const COAST=2.6;
 const AUTO_BURN=[48,44,40];// game s (real M55A1 ~61 s, SR19 ~66 s, SR73 ~60 s, ~0.7x)
 const _n=new T.Vector3(),_a=new T.Vector3(),_q=new T.Quaternion();const live=new Set(),segs=[];
 const own=(root,pl)=>root.traverse(c=>{if(c.material){const f=x=>{x=x.clone();x.clippingPlanes=pl;return x;};c.material=Array.isArray(c.material)?c.material.map(f):f(c.material);}});
 const axis=(w)=>{w.updateMatrixWorld(true);_n.set(0,1,0).applyQuaternion(w.getWorldQuaternion(_q));w.getWorldPosition(_a);};
 function updLive(o){axis(o.mesh);const p=o._stPl[0];p.normal.copy(_n);p.constant=-_n.dot(_a)+0.02;}
 function updSeg(s){axis(s.m);s.pl[0].normal.copy(_n);s.pl[0].constant=-_n.dot(_a)+s.h/2;s.pl[1].normal.copy(_n).negate();s.pl[1].constant=_n.dot(_a)+s.h/2;}
 function flash(p,dir,n=14){for(let k=0;k<n;k++)fire.spawn(p,rnd(5)-dir.x*20,rnd(5)-dir.y*20,rnd(5)-dir.z*20,0.35,3,7,1,0.85,0.55,1);}
 // i = stage index dropped (0,1,2); d = gicbmstage debris entry to replace with a real segment
 let sep=function(o,i,d){const w=o.mesh,g=w&&w.children[0];if(!g||!g.userData||!g.userData.len)return;const L=g.userData.len;
  axis(w);const n=_n.clone();const h=ST[i+1]-ST[i];
  // spent segment, positioned exactly where it was on the stack
  const D=new T.Group(),m=MSL_MODELS.minuteman3();m.rotation.x=Math.PI/2;m.position.y=L/2-ST[i]-h/2;D.add(m);
  if(i===0&&m.userData.tailFins)m.userData.tailFins.forEach(f=>f.visible=true);
  m.traverse(c=>{if(c.isMesh)c.castShadow=false;});const pl=[new T.Plane(),new T.Plane()];own(m,pl);
  D.quaternion.copy(w.getWorldQuaternion(_q));const c0=o.pos.clone().addScaledVector(n,h/2);D.position.copy(c0);scene.add(D);
  if(d){scene.remove(d.m);d.m=D;d.p.copy(c0);d.w.set(rnd(0.5),rnd(0.2),rnd(0.5));d.v.copy(o.vel).addScaledVector(n,-9).add(_a.set(rnd(3),rnd(3),rnd(3)));}
  segs.push({m:D,pl,h,d});
  // live missile: move origin to the new tail and cut below it
  o.pos.addScaledVector(n,h);w.position.copy(o.pos);
  if(!o._stPl){o._stPl=[new T.Plane()];own(g,o._stPl);}o._stLo=ST[i+1];g.position.y=L/2-ST[i+1];g.scale.setScalar(1);w.scale.setScalar(1);live.add(o);updLive(o);
  for(let k=0;k<26;k++)smoke.spawn(o.pos,rnd(6),rnd(6),rnd(6),3,4,9,0.9,0.9,0.92,0.45,0.05,0);
  msg(i<2?'STAGE '+(i+1)+' SEPARATION':'STAGE 3 SEP - SHROUD JETTISON - POST-BOOST BUS',1.6);}
 // ---- AUTO ICBM/SLBM ----
 const _u=updBallistic;updBallistic=function(o,dt){
  const auto=(o.name==='ICBM'||o.name==='SLBM')&&!o.man&&!o.rv&&o.boostT>0&&o.boostT<1e8;
  if(auto&&!o.gs&&o.t>0.6){const B=AUTO_BURN;o.boostT=B[0]+B[1]+B[2]+2*COAST;o.gs={stg:0,cut:[B[0],B[0]+COAST+B[1]],coast:0,rel:0,relT:0};}
  if(o.man&&!o._thr1){o._thr1=true;if(typeof inp!=='undefined'&&inp.throttle<1)inp.throttle=1;}// launch at full throttle (pad throttle 0 made the silo ICBM fall back)
  if(o.man&&o.coastT>0){o.t+=dt;o.coastT-=dt;o.vel.y-=G*dt;o.pos.addScaledVector(o.vel,dt);o.mesh.position.copy(o.pos);
   if(o.coastT<=0){flash(o.pos,o.dirT||_n.set(0,1,0));msg('STAGE '+(o.stg+1)+' IGNITION',1.4);}return;}
  const g=o.gs,s0=g?g.stg:0,c0=g?g.coast:0,b0=g&&g.bus,nd=S.debris.length;
  _u(o,dt);
  if(g&&!o.man){
   if(g.stg>s0){g.coast=COAST;sep(o,s0,S.debris[nd]);}
   if(g.bus&&!b0)sep(o,2,S.debris[nd]);
   if(c0>0&&g.coast<=0){axis(o.mesh);flash(o.pos,_n);}}
  if(o._stPl){o.mesh.scale.setScalar(1);const c=o.mesh.children[0];if(c)c.scale.setScalar(1);}};
 // ---- MANUAL ICBM: each stage burn (62/56/48 s) -> sep -> coast -> ignition ----
 const _st=icbmStage;icbmStage=function(o){const s0=o.stg,nd=S.debris.length;_st(o);
  if(o.stg>s0&&s0<=2){sep(o,s0,S.debris[nd]);if(o.phase==='boost')o.coastT=COAST;}};
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
  for(const o of live){if(o.done||!projs.includes(o)){live.delete(o);continue;}updLive(o);}
  {const ts=window.__gmsl2TS();if(ts>1)for(const d of S.debris){const e=dt*(ts-1);d.v.y-=G*e;d.p.addScaledVector(d.v,e);d.m.position.copy(d.p);}}// debris keeps pace with the 5x ballistic warp
  for(let i=segs.length-1;i>=0;i--){const s=segs[i];if(s.d&&!S.debris.includes(s.d)){segs.splice(i,1);continue;}updSeg(s);}};
 // real-time around staging events: the follow cam normally warps ballistic flight 5x, which made every sep look instant.
 let slowT=0;const near=o=>{if(o.done)return false;if(o.man)return o.phase==='boost'&&(o.coastT>0||o.burn>ICBM_ST[o.stg].t-1.5);const g=o.gs;return !!g&&(g.coast>0||(g.stg<2&&o.t>g.cut[g.stg]-1.5)||(!g.bus&&o.t>o.boostT-1.5&&o.t<o.boostT+1));};
 const baseTS=()=>(camFollow&&camFollow.type==='ballistic'?5:1);
 window.__gmsl2TS=()=>{const b=baseTS();if(b===1)return 1;if(simT<slowT)return 1;const o=camFollow;if(o&&(near(o)||segs.some(s=>s.d&&s.d.t<2.5)))return 1;return b;};
 const _sep=sep;sep=function(o,i,d){slowT=simT+3;return _sep(o,i,d);};
 window.__gstaging={live,segs,T,COAST,AUTO_BURN};})();
