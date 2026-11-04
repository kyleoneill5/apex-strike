//GCRUISE-BEGIN  Bigger cruise-missile warheads (Tomahawk/TLAM, JASSM, any 'cruise'): ~2x blast radius+damage, bigger fireball, shockwave ring, debris. Wrap-only.
{const T=THREE,isC=o=>o&&(o.tlam||o.type==='cruise'||/TOMAHAWK|TLAM|JASSM|CRUISE|STORM|SCALP|KALIBR|KH-?101|BRAHMOS/i.test(o.mslName||o.wpn||o.name||''));
 const live=new Map(),SW=[];const swG=new T.RingGeometry(0.9,1,48).rotateX(-Math.PI/2);
 function blast(p){const R=60;// direct-hit radius was 28 m -> area kill ~60 m (2x)
  for(const t of targets)if(t.alive&&t.pos.distanceTo(p)<R)killTarget(t,true);
  explosion(p.clone(),3.2);explosion(p.clone().add(new T.Vector3(0,8,0)),2.2);
  for(let i=0;i<40;i++)smoke.spawn(p.clone(),(Math.random()-.5)*40,Math.random()*30,(Math.random()-.5)*40,6+Math.random()*6,5,30,0.2,0.18,0.16,0.8);
  for(let i=0;i<30;i++)fire.spawn(p.clone(),(Math.random()-.5)*70,20+Math.random()*60,(Math.random()-.5)*70,0.3,2.5,1.2,1,0.7,0.3,1);// debris streaks
  const m=new T.Mesh(swG,new T.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:0.7,depthWrite:false,side:T.DoubleSide}));m.position.copy(p);m.position.y=Math.max(p.y,terrainH(p.x,p.z)+1.5);scene.add(m);SW.push({m,t:0});
  if(typeof sfx==='function')sfx('explosion',1);}
 const _up=updProjs;updProjs=function(dt){for(const o of projs)if(isC(o)&&!live.has(o))live.set(o,o.pos.clone());const r=_up.apply(this,arguments);
  for(const [o,last] of live){if(projs.includes(o)){last.copy(o.pos);continue;}live.delete(o);if((o.life===undefined||o.life>0.05))blast(last);}
  for(let i=SW.length-1;i>=0;i--){const s=SW[i];s.t+=dt||0.016;const k=s.t/0.9;s.m.scale.setScalar(10+k*170);s.m.material.opacity=0.7*(1-k);if(k>=1){scene.remove(s.m);s.m.material.dispose();SW.splice(i,1);}}
  return r;};
 window.__gcruise={isC,blast,SW};}
//GCRUISE-END
