//GF9LEGS-BEGIN  Falcon 9 booster return + landing legs, matched to webcast telemetry (refs/falcon9/legs_sources.txt). Wrap-only.
// Profile: sep -> cold-gas flip -> (droneship: no boostback) coast, grid fins out -> 3-engine entry burn ~62 km, cut at ~650 m/s
// -> fin-steered subsonic fall (~250-300 m/s at a few km) -> single center-engine hoverslam lit at ~2-3 km (40-100% throttle, no hover)
// -> legs: helium telescoping struts swing them out/down over ~2.5 s in the last ~7 s -> touchdown <2 m/s, ~0 lateral, upright, settles on the pads.
{const isF9=s=>s&&s.mode==='booster'&&s.landEng===1&&s.fEng===914e3;const G0=9.80665;
 if(typeof BCFG!=='undefined'&&BCFG.falcon9)Object.assign(BCFG.falcon9,{boostback:false,entryAlt:62000,entryV:650,landStartMax:1,flipT:12});
 const _st=DS.step;DS.step=function(s,dt){if(!isF9(s))return _st.apply(this,arguments);
  if(s.landed||s.crashed)return _st.apply(this,arguments);
  if(!s._f9){s._f9=1;s.landStartMax=1;}
  // landing-burn ignition: single Merlin at ~92% must zero the speed exactly at the deck (hoverslam)
  if((s.phase==='aero'||s.phase==='coast')&&s.vh<0&&s.h<6000){const v=Math.hypot(s.vx,s.vh);const a1=s.fEng*0.92/(s.dry+s.prop)-G0;
   if(s.h<4000&&s.h<=v*v/(2*Math.max(1,a1))+60||s.h<1200){s.phase='landing';s.events.push('LANDING BURN - CENTER ENGINE');}}
  const ph0=s.phase,ne=s.events.length;const r=_st.apply(this,arguments);
  for(let i=ne;i<s.events.length;i++){const e=s.events[i];
   if(e==='BOOSTBACK BURN')s.events[i]=s.boostback?'COLD-GAS FLIP COMPLETE - BOOSTBACK BURN (3 ENGINES)':'COLD-GAS FLIP COMPLETE - COASTING, GRID FINS DEPLOYED';
   else if(e==='ENTRY BURN')s.events[i]='ENTRY BURN (3 ENGINES)';else if(e==='LANDING BURN')s.events.splice(i--,1);}
  if(ph0==='flip'&&s.phase==='coast')s.fins=true;
  // grid fins steer the fall onto the deck (lift ~ q, capped 4 m/s^2); engine gimbal diverts during the landing burn
  if(s.auto&&!s.landed&&!s.crashed&&s.vh<0&&s.h<40000&&(s.phase==='aero'||s.phase==='landing')){const tgo=Math.max(4,s.h/Math.max(20,-s.vh));const cap=s.phase==='landing'?(s.thr>0?6:1):Math.min(6,s.q*s.CdA*0.35/(s.dry+s.prop));
   const a=Math.max(-cap,Math.min(cap,(-s.x/tgo-s.vx)*(s.phase==='landing'?0.8:0.3)));s.vx+=a*dt;}
  if(s.phase==='landing'&&!s.landed&&!s.crashed){
   // final 30 m: trim descent toward ~1.5 m/s and null drift so it touches down gently and upright
   if(s.h<30&&s.auto){const vt=-Math.max(1.2,s.h*0.18);if(s.vh<vt)s.vh+=(vt-s.vh)*Math.min(1,dt*2.5);s.vx-=s.vx*Math.min(1,dt*2);}
   if(s.h<40){const vf=-Math.max(1.6,s.h*0.3);if(s.vh>vf)s.vh=vf;} // Merlin can't hover (min thrust > weight): it throttles/cuts rather than climbing back up
   if(!s.man){const tgo=s.h/Math.max(1,-s.vh);if(s.h<120||tgo<5){if(!s.leg)s.events.push('LANDING LEGS DEPLOYED');s.leg=true;}else s.leg=false;}}
  if(s.landed&&s.td){s.td.vh=Math.max(s.td.vh,-2);}
  return r;};
// droneship parks where the unpowered-boostback trajectory actually lands (pre-simulated, secant iterations)
 function f9Aim(ds){const run=x=>{const c=Object.assign({},ds,{events:[],x:x,auto:true});let n=0;while(!c.landed&&!c.crashed&&n<60000){DS.step(c,(c.phase==='coast'||c.phase==='flip')&&c.h>20000?0.25:0.02);n++;}return c.x;};
  let x0=0,f0=run(0),x1=-f0,f1=run(x1);for(let it=0;it<5&&Math.abs(f1)>3&&f1!==f0;it++){const x2=x1-f1*(x1-x0)/(f1-f0);x0=x1;f0=f1;x1=x2;f1=run(x1);if(globalThis.__f9dbg)console.log('aim',it,x1|0,f1|0);}return x1;}
 if(typeof startBooster==='function'){const _sb=startBooster;startBooster=function(v){const ok=_sb(v);const r=rec.booster;if(ok&&r&&isF9(r.ds)&&!r.ds.boostback){r.ds.x=f9Aim(r.ds);}return ok;};}
 // ---- visuals: leg deploy kinematics, telescoping struts, fin steering, settle on pads ----
 const TH=2.06,LEN=9.6,ANC=new THREE.Vector3(-0.08,8.2,0);const sm=x=>x*x*(3-2*x);
 const strutMat=new THREE.MeshStandardMaterial({color:0xc4c8cc,metalness:1,roughness:0.28});const tubeG=[0.16,0.12,0.085].map(r=>new THREE.CylinderGeometry(r,r,1,12).translate(0,0.5,0));
 function ensureStrut(l){if(l.userData.f9s)return l.userData.f9s;const g=new THREE.Group();g.position.copy(ANC);const t=tubeG.map(geo=>{const m=new THREE.Mesh(geo,strutMat);m.castShadow=true;g.add(m);return m;});l.add(g);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.85,0.22,20),new THREE.MeshStandardMaterial({color:0x1d1d1f,metalness:0.5,roughness:0.6}));pad.castShadow=true;l.add(pad);return l.userData.f9s={g,t,pad};}
 const _v=new THREE.Vector3(),_y=new THREE.Vector3(0,1,0);
 const _u=updRocket;updRocket=function(v,dt){_u(v,dt);const r=typeof rec!=='undefined'&&rec.booster;if(!r||!isF9(r.ds)||!r.mesh)return;const ds=r.ds,ud=r.mesh.userData;
  const sim=dt*(typeof warp!=='undefined'?warp:1);r._lk=Math.max(0,Math.min(1,(r._lk||0)+(ds.leg?1:-1)*sim/2.5));const k=sm(r._lk);
  (ud.legs||[]).forEach(l=>{// keep each leg on its own 90-deg azimuth: Euler re-derived from a quaternion comes back as (pi,y,pi); zeroing z alone flipped legs 2+3 onto the other legs' side
   l.rotation.set(0,-Math.atan2(l.position.z,l.position.x),0);let inner=null;l.traverse(o=>{if(o.name==='grLegInner')inner=o;});if(!inner)return;inner.rotation.z=-TH*k;
   const S=ensureStrut(l);const tip=_v.set(Math.sin(TH*k)*LEN*0.97,Math.cos(TH*k)*LEN*0.97,0);const d=tip.clone().sub(ANC);const L=d.length();
   S.g.quaternion.setFromUnitVectors(_y,d.normalize());S.t.forEach((m,i)=>{const seg=Math.max(0.4,L/3+0.35);m.scale.set(1,seg,1);m.position.set(0,i*(L-seg)/2,0);});S.g.visible=k>0.03;
   S.pad.position.set(tip.x/0.97,tip.y/0.97-0.12,0);S.pad.visible=k>0.6;});
  // grid-fin steering: fins trim (~+-15 deg) toward the drone ship while falling
  if(ds.fins&&!ds.landed&&(ds.phase==='aero'||ds.phase==='coast'||ds.phase==='entry')){const tgo=Math.max(3,ds.h/Math.max(30,-ds.vh));const c=Math.max(-0.26,Math.min(0.26,(-ds.x/tgo-ds.vx)*0.01));
   (ud.fins||[]).forEach((f,i)=>{const a=i*Math.PI/2+Math.PI/4;const ch=f.children[0];if(ch)ch.rotation.x=c*Math.sin(a);});}
  // settle on the footpads: engines sit ~2.4 m above the deck once the legs are locked, small strut-compression bounce
  const drop=-(2.0+Math.cos(TH)*LEN)*k;r.mesh.position.y+=drop;
  if(ds.landed){r._td=(r._td||0)+sim;const t=r._td;r.mesh.position.y-=0.35*Math.min(1,t*4)-0.12*Math.sin(t*10)*Math.exp(-t*3);r.mesh.quaternion.slerp(new THREE.Quaternion(),Math.min(1,sim*4));}};
 window.__f9legs={TH,LEN};}
//GF9LEGS-END
