// ===== GICBMSTAGE: Minuteman III 3-stage separation -> bus + shroud sep -> 3 Mk12A RVs (own aim points, individual detonation); HYPERSONIC booster sep -> HGV glide -> 3 warheads. Wraps gicbm.js/g4.js; reuses MSL_MODELS =====
(()=>{const MM=window.MSL_MODELS,T=THREE,UP=new T.Vector3(0,1,0),_v=new T.Vector3();
 const debris=[];
 const puff=(p,n=24,s=8)=>{for(let k=0;k<n;k++)smoke.spawn(p,rnd(s),rnd(s),rnd(s),2.5,5,9,0.93,0.93,0.95,0.6,0.05,0);for(let k=0;k<8;k++)fire.spawn(p,rnd(4),rnd(4),rnd(4),0.25,2,4,1,0.85,0.5,1);};
 // spent piece: a real MSL_MODELS mesh (or slice of it) that keeps its velocity, drifts back, tumbles and falls
 function shed(o,mesh,dv,spin){const m=mesh;m.position.copy(o.pos);m.quaternion.copy(o.mesh.quaternion);scene.add(m);
  debris.push({m,p:o.pos.clone(),v:o.vel.clone().add(dv),w:new T.Vector3(rnd(spin),rnd(spin),rnd(spin)),t:0});}
 function stageMesh(i){const g=MM.minuteman3();g.scale.set(1,0.34,1);g.traverse(c=>{if(c.material&&c.material.color)c.material=c.material.clone();});if(i===0&&g.userData.tailFins)g.userData.tailFins.forEach(f=>f.visible=true);return yUpM(g);}
 function yUpM(m){const g=new T.Group();m.rotation.x=-Math.PI/2;g.add(m);return g;}
 function release(o,aim,i,hyp){const p=o.pos.clone();const h=Math.max(1,p.y-groundAt(p.x,p.z).h);
  const vy=o.vel.y;const Tf=(vy+Math.sqrt(Math.max(0,vy*vy+2*G*h)))/G||30;
  const vel=new T.Vector3((aim.x-p.x)/Tf,vy,(aim.z-p.z)/Tf);if(hyp){vel.y=Math.min(vy,-200);}
  const m=yUpM(MM.mk12a());m.position.copy(p);
  const rv={type:'ballistic',pos:p,vel,life:1800,mesh:m,owner:o.owner,t:1e4,boostT:0,apex:0,name:(hyp?'HGV-WH-':'RV-')+(i+1),mach:0,sep:true,rv:true,gsAim:aim.clone(),hw:hyp};
  const f=camFollow;addProj(rv);camFollow=f;puff(p,10,3);msg((hyp?'WARHEAD ':'Mk12A RV-')+(i+1)+' RELEASED  -> own aim point',1.2);return rv;}
 const aims=(c,n,r)=>{const a=[];const b=Math.random()*6.28;for(let i=0;i<n;i++){const t=b+i/n*Math.PI*2;a.push(new T.Vector3(c.x+Math.cos(t)*r,0,c.z+Math.sin(t)*r));}return a;};
 // ---- AUTO Minuteman III ----
 const _u=updBallistic;updBallistic=function(o,dt){
  const auto=(o.name==='ICBM'||o.name==='SLBM')&&!o.man&&!o.rv&&o.boostT>0&&o.boostT<1e8;
  if(auto&&!o.gs){o.gs={stg:0,cut:[o.boostT*0.36,o.boostT*0.70],coast:0,rel:0,relT:0};}
  if(auto){const g=o.gs;
   if(g.coast>0){g.coast-=dt;o.boostT+=dt;o.t+=dt;o.vel.y-=G*dt;o.pos.addScaledVector(o.vel,dt);o.mesh.position.copy(o.pos);if(g.coast<=0)msg('STAGE '+(g.stg+1)+' IGNITION',1.2);return;}
   if(g.stg<2&&o.t>=g.cut[g.stg]){const dir=_v.copy(o.vel).normalize();shed(o,stageMesh(g.stg),dir.clone().multiplyScalar(-12),1.2);puff(o.pos);
    g.stg++;g.coast=1.4;msg('STAGE '+g.stg+' SEPARATION',1.2);if(o.msl&&o.mesh.children[0])o.mesh.children[0].scale.multiplyScalar(g.stg===1?0.82:0.78);return;}
   _u(o,dt);
   if(o.sep&&!g.bus){g.bus=true;puff(o.pos);const d=_v.copy(o.vel).normalize();shed(o,stageMesh(2),d.clone().multiplyScalar(-10),1);
    for(const s of[-1,1]){const sh=yUpM(MM.mk12a());sh.scale.set(1.6,0.9,1.6);shed(o,sh,new T.Vector3(s*6,2,-s*4),2.5);} // payload shroud halves
    g.aim=aims(o.tgt||o.pos,3,2500);g.relT=o.t+3;msg('STAGE 3 SEP - SHROUD JETTISON - POST-BOOST BUS',2);}
   if(g.bus&&g.rel<3&&o.t>=g.relT){release(o,g.aim[g.rel],g.rel,false);g.rel++;g.relT=o.t+2.2;if(g.rel>=3){o.done=true;if(o.mesh)scene.remove(o.mesh);}}
   return;}
  if(o.hw){o.t+=dt;o.vel.y-=G*dt;o.pos.addScaledVector(o.vel,dt);o.mesh.quaternion.setFromUnitVectors(UP,_v.copy(o.vel).normalize());rvFx(o,dt);
   const g=groundAt(o.pos.x,o.pos.z);if(o.pos.y<=g.h+2){o.done=true;explosion(o.pos.clone().setY(g.h+2),6);}return;}
  return _u(o,dt);};
 // ---- MANUAL (gicbm): separation fx on each stage, Minuteman III bus carries 3 RVs ----
 const _st=icbmStage;icbmStage=function(o){const d=_v.copy(o.vel).normalize();shed(o,stageMesh(Math.min(2,o.stg)),d.clone().multiplyScalar(-12),1.2);puff(o.pos);_st(o);
  if(o.phase==='bus'){for(const s of[-1,1]){const sh=yUpM(MM.mk12a());sh.scale.set(1.6,0.9,1.6);shed(o,sh,new T.Vector3(s*6,2,-s*4),2.5);}}};
 const _rl=icbmRelease;icbmRelease=function(o){if(o.bus&&o.bus.n>=3)return null;const rv=_rl(o);if(rv&&o.bus.n>=3){o.bus.n=8;o.done=true;msg('ALL 3 Mk12A RVs RELEASED',2);}return rv;};
 // ---- HYPERSONIC: booster sep at burnout, HGV glide, 3 warheads near target ----
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
  for(const o of projs){if(o.type!=='hyper'||o.done)continue;o.gsT=(o.gsT||0)+dt;
   if(!o.gsB&&o.gsT>(o.boost||1.2)+0.6){o.gsB=true;const b=yUpM(MM.minuteman3());b.scale.set(0.5,0.25,0.5);shed(o,b,_v.copy(o.vel).normalize().multiplyScalar(-15),1.5);puff(o.pos,16,4);msg('BOOSTER SEP - HGV GLIDE',1.2);}
   const tp=o.tg&&o.tg.pos;if(o.gsB&&tp&&!o.gsW&&o.pos.distanceTo(tp)<7000){o.gsW=true;const A=aims(tp,3,180);for(let i=0;i<3;i++)release(o,A[i],i,true);o.done=true;if(o.mesh)scene.remove(o.mesh);}}
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.t+=dt;d.v.y-=G*dt;d.v.multiplyScalar(1-Math.min(0.3,1.225*Math.exp(-d.p.y/8500)*0.002*dt));d.p.addScaledVector(d.v,dt);d.m.position.copy(d.p);
   d.m.rotation.x+=d.w.x*dt;d.m.rotation.y+=d.w.y*dt;d.m.rotation.z+=d.w.z*dt;if(d.t<1.5&&Math.random()<0.5)smoke.spawn(d.p,rnd(2),rnd(2),rnd(2),1.5,3,5,0.9,0.9,0.92,0.4,0.05,0);
   if(d.p.y<groundAt(d.p.x,d.p.z).h||d.t>240){scene.remove(d.m);debris.splice(i,1);}}};
 window.__gicbmstage={debris,release};})();
