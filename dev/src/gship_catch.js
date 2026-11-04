// ===== GSHIP_CATCH (ship builder, #12/#13): Super Heavy catch + Starship landing-burn sequencing per IFT-5 (B12, 13 Oct 2024) / IFT-7 (B14) / SN15 timelines.
// Booster: boostback -> 13-engine landing burn -> 3 center Raptors <1200 m -> lateral divert from offshore aim to tower axis -> slow to ~hover beside tower at arm height -> arms swing closed -> pins settle on rails (small drop) -> engines cut.
// Ship: belly-flop -> flip relight 3 SL Raptors -> 2 -> 1 engine on final descent. Never forces thr>0 when throttle cut (respects msl #14 engine cutoff: s.thr==0 keeps s.eng==0). =====
(()=>{if(typeof BCFG!=='undefined'&&BCFG.starship)BCFG.starship.landProp=Math.max(BCFG.starship.landProp||0,30000); // hover-fuel tune: 30 t reserve (passes headless at >=28 t; 22 t ran dry in hover)
 const ARM_H=0; // DS touchdown (h=0) == pins on arm rails (grockets snaps mesh to arm height on catch)
 const _st=DS.step;DS.step=function(s,dt){
  const tower=s.mode==='booster'&&s.landEngHi===13;const ship=s.mode==='ship';
  const r=_st.apply(this,arguments);if(s.landed||s.crashed)return r;
  if(tower&&s.phase==='landing'){s._mz=s._mz||{};const z=s._mz;
   if(s.h<1200&&!z.e3){z.e3=1;s.events.push('ENGINES 13 -> 3 CENTER RAPTORS');}
   if(s.h<450&&!z.dv){z.dv=1;z.x0=s.x;s.events.push('DIVERT TO TOWER');}
   if(z.dv&&s.h>8){const k=Math.min(1,dt*0.9);s.x+=(-0-s.x)*k*0.5;s.vx*=1-Math.min(1,dt*2);} // translate in from offshore aim
   if(s.h<60&&s.thr>0){if(!z.hv){z.hv=1;s.events.push('HOVER BESIDE TOWER - ARMS CLOSING');}const vd=-Math.max(3.5,Math.sqrt(2*3.2*Math.max(0,s.h-ARM_H)));s.vh+=(vd-s.vh)*Math.min(1,dt*2.5);}
   z.k=Math.max(0,Math.min(1,(60-s.h)/(60-ARM_H)));}
  if(ship&&s.phase==='landing'&&s.thr>0&&s.fl){const ft=s.t-s.fl.t0;
   const n=s.h>220?3:(s.h>45?2:1);if(n<(s._ne||9)){if(s._ne)s.events.push(n===2?'LANDING BURN: 2 RAPTORS':'FINAL DESCENT: 1 RAPTOR');s._ne=n;}
   s.engVis=ft<0.9?Math.max(1,Math.ceil(ft/0.3)):n;} // visual only; physics thrust untouched // staggered relight 1-2-3 during flip
  return r;};
 // arms: hold open until hover, then close over ~3 s (B12 webcast: arms close as booster is ~at arm height)
 const _ur=updRecovery;updRecovery=function(v,sim){_ur(v,sim);const r=rec.booster;if(!r||r.cfg.site!=='tower'||r.caught)return;const z=r.ds._mz;if(!z||r.ds.phase!=='landing')return;
  const k=z.hv?Math.min(1,(z.ck=(z.ck||0)+sim/3)):0;const e=k*k*(3-2*k);mechazilla.userData.arms.forEach(a=>a.rotation.y=a.userData.sz*0.6*(1-e*0.92));};
 window.__shipCatch={info(){const a=mechazilla.userData.arms[0];return {pr:padRocket.position.y,mz:mechazilla.position.toArray(),armY:mechazilla.position.y+a.position.y,pad:[PAD.x,PAD.z]};},
  ray(e,t){const rc=new THREE.Raycaster();rc.camera=camera;const o=new THREE.Vector3(...e),d=new THREE.Vector3(...t).sub(o).normalize();rc.set(o,d);return rc.intersectObjects(scene.children,true).slice(0,6).map(h=>{let n=[],x=h.object;while(x&&n.length<5){n.push((x.name||x.type)+(x.userData&&Object.keys(x.userData).length?'{'+Object.keys(x.userData).slice(0,4).join(',')+'}':''));x=x.parent;}return {d:+h.distance.toFixed(1),vis:h.object.visible,col:h.object.material&&h.object.material.color&&h.object.material.color.getHexString(),side:h.object.material&&h.object.material.side,path:n.join('<'),geo:h.object.geometry&&h.object.geometry.type};});},
  engine(){const g=new THREE.Group();R3.build(g,0,0,0,0.65,2.35,false);g.position.set(PAD.x-60,400,PAD.z+260);scene.add(g);return g.position.toArray();},
  exhibit(){const x=PAD.x,z=PAD.z+260;const b=boosterFromModel(padRocket);b.position.set(x,400,z);scene.add(b);const sh=shipFromModel(padRocket);sh.position.set(x+60,400,z);scene.add(sh);return {b:[x,400,z],s:[x+60,400,z]};},
  arms(k){const e=k*k*(3-2*k);mechazilla.userData.arms.forEach(a=>a.rotation.y=a.userData.sz*0.6*(1-e*0.92));},
  shot(eye,tgt,fov){this.hold=eye?[eye,tgt,fov]:null;}, // test-only framing: holds the camera until shot(null)
  pose(){const mz=mechazilla;const b=boosterFromModel(padRocket);scene.add(b);const armY=mz.position.y+mz.userData.arms[0].position.y+1.3;b.position.set(PAD.x,armY-66.6-1.05,PAD.z);mz.userData.arms.forEach(a=>a.rotation.y=a.userData.sz*0.6*0.08);padRocket.visible=false;this.b=b;this.y0=b.position.y;return b.position.toArray();},dy(d){this.b.position.y=this.y0+d;},test(){const c=Object.assign({},BCFG.starship,{mode:'booster',phase:'landing',h:3000,vh:-180,vx:0,x:-150,prop:+(window.__scProp||BCFG.starship.landProp),t:0,auto:true,events:[]});const s=DS.create?DS.create(c):c;s.events=s.events||[];const out=[];
  for(let i=0;i<20000&&!s.landed&&!s.crashed;i++){DS.step(s,0.02);while(s.events.length)out.push(s.events.shift()+' @h='+s.h.toFixed(0)+' vh='+s.vh.toFixed(1)+' x='+s.x.toFixed(1)+' eng='+s.eng);}return {out,landed:s.landed,crashed:s.crashed,td:s.td,x:s.x};}};
})();
{const _rn=render;render=function(rdt){const h=window.__shipCatch&&__shipCatch.hold;if(!h)return _rn(rdt);camera.up.set(0,1,0);camera.position.set(...h[0]);camera.lookAt(...h[1]);if(h[2]&&camera.fov!==h[2]){camera.fov=h[2];camera.updateProjectionMatrix();}updEnv(rdt);renderFrame(scene,camera);};}
