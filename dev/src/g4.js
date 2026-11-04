// ---------- weapons ----------
const tracerGeo=new THREE.BoxGeometry(0.25,0.25,10),tracerMat=new THREE.MeshBasicMaterial({color:0xffee88});
const glowMat=new THREE.MeshBasicMaterial({color:0xff8844,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false});
function addProj(o){projs.push(o);if(o.mesh)scene.add(o.mesh);return o;}
function fireWeapon(v){const w=v.weapons[v.wi];if(!w||v.ammo[w]<=0)return false;const q=v.mesh.quaternion,f=fwdOf(q,V3()),u=upOf(q,V3()),p=v.mesh.position;
 const cd={GUN:0.05,CIWS:0.02,ROCKETS:0.15,AAM:0.8,SAM:0.6,HYPERSONIC:1.5,TORPEDO:1.5,NUKE:2,SLBM:3,ICBM:3}[w];if(simT<(v.cool||0))return false;v.cool=simT+cd;v.ammo[w]--;
 const vel=v.vel?v.vel.clone():V3();
 if(w==='GUN'||w==='CIWS'){let dir=f.clone();let o=p.clone().addScaledVector(f,v.def.cls==='air'?11:6);
  if(v.def.cls==='ship'){const tg=nearestTarget(p,null,['drone','boat'],5000,-1);o=p.clone().add(V3(0,w==='CIWS'?28:9,0)).addScaledVector(f,w==='CIWS'?-40:50);if(tg){dir=tg.pos.clone().addScaledVector(tg.vel,tg.pos.distanceTo(o)/1000).sub(o).normalize();}else dir=f.clone().add(V3(0,0.15,0)).normalize();}
  dir.x+=rnd(0.006);dir.y+=rnd(0.006);dir.z+=rnd(0.006);const m=new THREE.Mesh(tracerGeo,tracerMat);m.position.copy(o);m.lookAt(o.clone().add(dir));
  addProj({type:'bullet',pos:o,vel:dir.multiplyScalar(1050).add(vel),life:3,mesh:m,owner:v});}
 else if(w==='ROCKETS'){const o=p.clone().addScaledVector(f,3).addScaledVector(u,-1.4).addScaledVector(rightOf(q,_r),(v.ammo[w]%2?1:-1)*2.3);addProj({type:'rocket',pos:o,vel:f.clone().multiplyScalar(250).add(vel),life:6,mesh:missileMesh(2,0.1),owner:v,maxSpd:740,acc:600,turn:0,tg:null});}
 else if(w==='AAM'||w==='SAM'||w==='HYPERSONIC'){const hyp=w==='HYPERSONIC';let o,d0;
  if(v.def.cls==='ship'||v.def.cls==='sub'){o=p.clone().add(V3(0,v.def.cls==='sub'?2:10,0)).addScaledVector(f,v.def.cls==='sub'?-10:30);d0=V3(0,1,0);if(v.def.cls==='sub')splash(o,3);}
  else{o=p.clone().addScaledVector(u,-1.5);d0=f.clone();}
  const tg=nearestTarget(p,v.def.cls==='air'||v.def.cls==='heli'?f:null,w==='AAM'?['drone','boat']:hyp?['boat','drone']:['drone','boat'],hyp?60000:12000,v.def.cls==='air'||v.def.cls==='heli'?0.5:-1);
  addProj({type:hyp?'hyper':'missile',pos:o,vel:d0.multiplyScalar(v.def.cls==='air'?60:40).add(vel),life:hyp?60:20,mesh:missileMesh(hyp?6:3.6,hyp?0.35:0.18,hyp?0x333333:0xeeeeee),owner:v,maxSpd:hyp?2720:900,acc:hyp?260:220,turn:hyp?1.0:3.0,tg,arm:0.6,boost:hyp?1.2:0.8});
  msg(tg?(hyp?'HYPERSONIC AWAY - MACH 8':'FOX 3 - LOCKED'):'NO LOCK - DUMB FIRE',1.2);}
 else if(w==='TORPEDO'){const o=p.clone().addScaledVector(f,v.def.cls==='sub'?-42:-20).setY(Math.min(p.y-3,-3));if(v.def.cls==='ship'){o.addScaledVector(rightOf(q,_r),9);splash(o,2);}
  const tg=nearestTarget(p,null,['boat'],5000,-1);addProj({type:'torpedo',pos:o,vel:f.clone().multiplyScalar(15),life:120,mesh:missileMesh(6,0.27,0x335533),owner:v,tg});msg(tg?'TORPEDO AWAY - HOMING':'TORPEDO AWAY',1.2);}
 else if(w==='NUKE'){const m=new THREE.Group();add(m,cylZ(0.35,0.35,3.2,8),0x556655);add(m,new THREE.SphereGeometry(0.35,8,6),0x556655,0,0,-1.6);add(m,new THREE.BoxGeometry(1.4,0.05,0.5),0x556655,0,0,1.5);add(m,new THREE.BoxGeometry(0.05,1.4,0.5),0x556655,0,0,1.5);
  addProj({type:'nuke',pos:p.clone().addScaledVector(u,-2),vel,life:200,mesh:m,owner:v});msg('NUCLEAR BOMB RELEASED\nClimb & extend away!',2.5);}
 else if(w==='SLBM'||w==='ICBM'){launchBallistic(v,w);}
 return true;}
function launchBallistic(v,w){const p=w==='ICBM'?V3(SILO.x,8,SILO.z):v.mesh.position.clone().setY(-5);if(w==='ICBM'){silo.userData.door.position.x=8;siloMissile.visible=false;}
 const tgt=ENEMY.clone().add(V3(rnd(800),0,rnd(800)));const m=icbm(1);m.position.copy(p);const o=addProj({type:'ballistic',pos:p,vel:V3(0,w==='ICBM'?25:40,0),life:900,mesh:m,owner:v,t:0,tgt,boostT:70,apex:80000,name:w,mach:0});
 camFollow=o;if(v.def.cls==='sub')for(let i=0;i<40;i++)smoke.spawn(p.clone().setY(0),rnd(10),5+Math.random()*25,rnd(10),3,6,8,0.95,0.97,1,0.8,0.5,-6);
 msg(w+' LAUNCH!\nCamera following - impact in ~45 s',3);}
function requiredVel(p,tgt,apex){const H=Math.max(apex-p.y,1000);const vy=Math.sqrt(2*G*H);const tUp=vy/G,tDn=Math.sqrt(2*(apex-tgt.y)/G);const T=tUp+tDn;return V3((tgt.x-p.x)/T,vy,(tgt.z-p.z)/T);}
function updProjs(dt){let maxMach=0;
 for(let i=projs.length-1;i>=0;i--){const o=projs[i];o.life-=dt;let dead=o.life<=0;const p=o.pos;
  if(o.type==='bullet'){o.vel.y-=G*dt;p.addScaledVector(o.vel,dt);for(const t of targets)if(t.alive&&t.pos.distanceToSquared(p)<(t.kind==='boat'?400:300)){killTarget(t);dead=true;break;}
   const g=groundAt(p.x,p.z);if(p.y<g.h){if(g.type==='water')splash(p,0.4);else smoke.spawn(p,0,3,0,1,2,3,0.5,0.45,0.4,0.6);dead=true;}}
  else if(o.type==='missile'||o.type==='hyper'||o.type==='rocket'){o.arm-=dt;const spd=o.vel.length();const dir=_a.copy(o.vel).divideScalar(spd||1);
   if(o.boost>0)o.boost-=dt;
   if(o.tg&&o.tg.alive&&o.arm<=0){const tti=o.tg.pos.distanceTo(p)/Math.max(spd,300);_t.copy(o.tg.pos).addScaledVector(o.tg.vel,tti);
    if(o.type==='hyper'&&_t.distanceTo(p)>4000){_t.y+=Math.min(3000,_t.distanceTo(p)*0.2);} _t.sub(p).normalize();const ang=dir.angleTo(_t);const mx=o.turn*dt*(o.type==='hyper'?1:Math.min(1,spd/250));
    if(ang>1e-4){const k=Math.min(1,mx/ang);dir.lerp(_t,k).normalize();}}
   else if(o.type!=='rocket'&&o.boost<=0&&o.owner&&(o.owner.def.cls==='ship'||o.owner.def.cls==='sub')&&dir.y>0.3){_t.copy(fwdOf(o.owner.mesh.quaternion,_f)).setY(0.1).normalize();const k=Math.min(1,dt*1.2);dir.lerp(_t,k).normalize();}
   const ns=Math.min(o.maxSpd,spd+o.acc*dt)-(p.y<20000?spd*spd*1e-7*dt:0);o.vel.copy(dir).multiplyScalar(ns);if(o.type==='rocket')o.vel.y-=G*dt;p.addScaledVector(o.vel,dt);
   const back=_t.copy(p).addScaledVector(dir,o.type==='hyper'?-3.5:-2);
   if(o.type==='hyper'){maxMach=Math.max(maxMach,ns/340);for(let k=0;k<2;k++)fire.spawn(_t.copy(p).addScaledVector(dir,-3.5-k*ns*dt*0.5),rnd(2),rnd(2),rnd(2),0.5+Math.random()*0.4,3.5,5,1,0.6+Math.random()*0.3,0.3,0.9,0,0,1,0.2,0.1);
    if(Math.random()<0.5)smoke.spawn(back,rnd(1),rnd(1),rnd(1),3,2.5,4,0.85,0.85,0.88,0.35,0,0.3);}
   else{fire.spawn(back,0,0,0,0.12,1.8,0,1,0.8,0.4,1);smoke.spawn(back,rnd(1),rnd(1),rnd(1),2.5,1.5,3,0.9,0.9,0.9,0.5,0,0.3);}
   if(o.tg&&o.tg.alive&&o.tg.pos.distanceTo(p)<(o.type==='hyper'?45:28)){killTarget(o.tg);dead=true;explosion(p,o.type==='hyper'?3:1.5);}
   if(o.type==='rocket')for(const t of targets)if(t.alive&&t.pos.distanceToSquared(p)<500){killTarget(t);dead=true;}
   const g=groundAt(p.x,p.z);if(o.arm<=0&&p.y<g.h){explosion(p,o.type==='hyper'?3:1.2);if(g.type==='water')splash(p,2);dead=true;}
   o.mesh.position.copy(p),o.mesh.lookAt(_t.copy(p).sub(dir));}
  else if(o.type==='torpedo'){const spd=o.vel.length();const dir=_a.copy(o.vel).normalize();const want=-6;
   if(o.tg&&o.tg.alive){_t.copy(o.tg.pos).setY(want).sub(p);_t.y=0;_t.normalize();const ang=Math.atan2(dir.x*_t.z-dir.z*_t.x,dir.x*_t.x+dir.z*_t.z);dir.applyAxisAngle(V3(0,1,0),-clamp(ang,-0.35*dt,0.35*dt));}
   else if(!o.tg||!o.tg.alive)o.tg=nearestTarget(p,null,['boat'],3000,-1);
   dir.y=0;dir.normalize();const ns=Math.min(30,spd+8*dt);o.vel.copy(dir).multiplyScalar(ns);o.vel.y=(want-p.y)*0.8;p.addScaledVector(o.vel,dt);
   if(Math.random()<0.8)smoke.spawn(_t.copy(p).addScaledVector(dir,-3.5),rnd(0.4),0.5,rnd(0.4),3+Math.random()*2,0.5+Math.random()*0.5,0.4,0.85,0.95,1,0.85,0.5,2.5);
   if(p.y>-2&&Math.random()<0.3)smoke.spawn(_t.copy(p).setY(0.3),0,0,0,4,1.5,2,0.9,0.95,1,0.5);
   if(o.tg&&o.tg.alive&&_t.copy(o.tg.pos).setY(p.y).distanceTo(p)<18){killTarget(o.tg);splash(o.tg.pos,4);dead=true;}
   if(terrainH(p.x,p.z)>p.y){explosion(p,1);dead=true;}o.mesh.position.copy(p),o.mesh.lookAt(_t.copy(p).sub(dir));}
  else if(o.type==='nuke'){o.vel.y-=G*dt;o.vel.multiplyScalar(1-0.0004*o.vel.length()*dt);p.addScaledVector(o.vel,dt);o.mesh.position.copy(p),o.mesh.lookAt(_t.copy(p).sub(o.vel));
   const g=groundAt(p.x,p.z);if(p.y<=g.h+1){nukeDetonate(p.clone().setY(g.h));dead=true;}}
  else if(o.type==='ballistic'){updBallistic(o,dt);if(o.done)dead=true;maxMach=Math.max(maxMach,o.mach);}
  if(!dead&&o.mesh)o.mesh.position.copy(p);
  if(dead){if(o.mesh)scene.remove(o.mesh);projs.splice(i,1);if(camFollow===o&&!o.done)camFollow=null;}}
 return maxMach;}
function updBallistic(o,dt){o.t+=dt;const p=o.pos;const h=p.y;
 if(o.t<o.boostT){const vr=requiredVel(p,o.tgt,o.apex);const rem=Math.max(o.boostT-o.t,2);_a.copy(vr).sub(o.vel).divideScalar(rem);_a.y+=G;if(o.t<4){_a.set(0,25+G,0);}
  o.vel.addScaledVector(_a,dt);o.vel.y-=G*dt;const dir=_t.copy(o.vel).normalize();
  for(let k=0;k<3;k++){const b=_f.copy(p).addScaledVector(dir,-2-k*2);fire.spawn(b,rnd(3),rnd(3),rnd(3),0.35,4+h/9000,6+h/4000,1,0.75,0.4,1,0,0,1,0.3,0.1);}
  if(Math.random()<(h<30000?0.9:0.3))smoke.spawn(_f.copy(p).addScaledVector(dir,-6),rnd(3),rnd(3),rnd(3),h<30000?20:6,5+h/3000,10+h/1500,0.92,0.92,0.95,h<30000?0.55:0.25,0.05,0);
  if(o.t>=o.boostT-dt*1.5&&!o.sep){o.sep=true;msg('BOOST COMPLETE - BALLISTIC COAST\nApex ~80 km',2.5);}}
 else{o.vel.y-=G*dt;if(h<40000&&o.vel.y<0){const rho=1.225*Math.exp(-h/8500);const sp=o.vel.length();o.vel.multiplyScalar(1-Math.min(0.5,rho*sp*0.00002*dt));
   for(let k=0;k<2;k++)fire.spawn(_f.copy(p).addScaledVector(o.vel,-0.002*k),rnd(2),rnd(2),rnd(2),0.4,6+(40000-h)/6000,8,1,0.5+Math.random()*0.3,0.2,Math.min(1,(40000-h)/15000+0.2),0,0,1,0.2,0.05);}}
 p.addScaledVector(o.vel,dt);o.mach=o.vel.length()/(h<11000?340-0.0039*h:295);
 o.mesh.quaternion.setFromUnitVectors(V3(0,1,0),_t.copy(o.vel).normalize());o.mesh.scale.setScalar(o.t>o.boostT?0.45:1);
 const g=groundAt(p.x,p.z);if(p.y<=g.h+2&&o.t>5){o.done=true;nukeDetonate(p.clone().setY(g.h));camFollow=null;}}
// ---------- NUKE ----------
const nukeTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');const gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.3,'rgba(255,240,200,0.9)');gr.addColorStop(1,'rgba(255,160,60,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv);})();
function nukeDetonate(p){const g=new THREE.Group();g.position.copy(p);scene.add(g);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:nukeTex,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,color:0xffffff}));glow.scale.setScalar(4000);g.add(glow);
 const ring=new THREE.Mesh(new THREE.RingGeometry(0.97,1,128).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xeef4ff,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false,fog:false}));ring.position.y=3;g.add(ring);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12,side:THREE.DoubleSide,depthWrite:false,fog:false,blending:THREE.AdditiveBlending}));g.add(dome);
 const light=new THREE.PointLight(0xffe0b0,4e7,80000,2);light.position.y=600;g.add(light);
 const NS=isTouch?900:1500,NF=isTouch?350:600;const sm=new Particles(scene,NS,false),fi=new Particles(scene,NF,true);PS.splice(PS.indexOf(sm),1);PS.splice(PS.indexOf(fi),1);
 const P=[];for(let i=0;i<NS;i++){const r=Math.random();P.push({type:r<0.64?'cap':r<0.82?'stem':r<0.92?'skirt':'cond',u:Math.random()*6.283,v:Math.random()*6.283,j:Math.random(),k:Math.random(),y0:Math.random()});}
 const F=[];for(let i=0;i<NF;i++)F.push({u:Math.random()*6.283,v:Math.random()*6.283,j:Math.random(),k:Math.random()});
 const n={g,glow,ring,dome,light,sm,fi,P,F,t:0,p:p.clone(),hit:new Set(),playerHit:false,camHit:false};nukes.push(n);
 const dCam=camera.position.distanceTo(p);$('flash').style.transition='none';$('flash').style.opacity=Math.max(0.35,1-dCam/60000);requestAnimationFrame(()=>{$('flash').style.transition='opacity 2.5s';$('flash').style.opacity=0;});
 shake=Math.max(shake,3*Math.max(0.2,1-dCam/30000));msg('☢ NUCLEAR DETONATION ☢',4);
 if(!camFollow||camFollow.done){blastCam={p:p.clone(),t:10,from:camera.position.clone()};}else blastCam={p:p.clone(),t:12,from:null};}
function nukeShape(n){const t=n.t,P=n.P,F=n.F,sm=n.sm,fi=n.fi;const fbR=t<2?650*Math.sqrt(t/2):650+t*6;const rise=t<2?fbR*0.7:Math.min(3400,fbR*0.7+(t-2)*170);
 const R=Math.min(950,fbR*0.75+Math.max(0,t-2)*38),r=R*0.62,stemR=Math.min(320,120+t*12);const dark=sstep(3,14,t),fadeAll=t<32?1:Math.max(0,1-(t-32)/16);const ringR=t*700;
 const S=sm.pos,C=sm.col,Z=sm.size;
 for(let i=0;i<P.length;i++){const q=P[i];let x,y,z,s,cr,cg,cb,a;
  if(q.type==='cap'||t<2.2){const vv=q.v+t*0.22;const tube=r*(0.55+0.5*q.j);const rr=R+Math.cos(vv)*tube;const tur=Math.sin(q.u*7+t*0.6)*0.08+Math.sin(q.v*5-t*0.4)*0.06;
   if(t<2.2){const rad=fbR*(0.3+0.7*q.j);x=Math.cos(q.u)*Math.sin(q.v)*rad;z=Math.sin(q.u)*Math.sin(q.v)*rad;y=fbR*0.6+Math.cos(q.v)*rad*0.8;}
   else{x=Math.cos(q.u)*rr*(1+tur);z=Math.sin(q.u)*rr*(1+tur);y=rise+Math.sin(vv)*tube*0.75+ (1-q.j)*r*0.25;}
   s=r*(0.55+q.k*0.7);const lit=0.75+0.35*Math.sin(vv);const glowk=Math.max(0,1-dark)*(Math.cos(vv)<0?1:0.5);
   cr=lerp(0.36,0.62,dark*0.6)*lit+glowk*0.8;cg=lerp(0.27,0.58,dark*0.6)*lit+glowk*0.35;cb=lerp(0.22,0.55,dark*0.6)*lit+glowk*0.05;a=0.85*fadeAll;}
  else if(q.type==='stem'){const yy=((q.y0+t*0.05)%1)*rise;const sr=stemR*(0.35+0.65*q.j)*(1+0.5*sstep(rise*0.8,rise,yy));x=Math.cos(q.u+t*0.3)*sr;z=Math.sin(q.u+t*0.3)*sr;y=yy;s=stemR*(0.7+q.k*0.6);
   const l=0.7+0.3*q.k;cr=0.42*l+(1-dark)*0.4;cg=0.33*l+(1-dark)*0.15;cb=0.27*l;a=0.8*fadeAll*sstep(2.2,4,t);}
  else if(q.type==='skirt'){const rr=Math.min(ringR,3200)*(0.25+0.75*q.j);x=Math.cos(q.u)*rr;z=Math.sin(q.u)*rr;y=40+q.k*180*(0.5+t*0.05);s=220+q.k*260;const c0=0.62+q.k*0.15;cr=c0;cg=c0*0.93;cb=c0*0.82;a=0.6*Math.max(0,1-t/40)*sstep(0.5,2,t);}
  else{const cR=R*1.5+q.j*80;x=Math.cos(q.u)*cR;z=Math.sin(q.u)*cR;y=rise*0.6+Math.sin(q.v)*60;s=160+q.k*120;cr=cg=cb=0.97;a=0.75*sstep(2.5,4,t)*(1-sstep(6,10,t));}
  S[i*3]=n.p.x+x;S[i*3+1]=n.p.y+y;S[i*3+2]=n.p.z+z;Z[i]=s;C[i*4]=cr;C[i*4+1]=cg;C[i*4+2]=cb;C[i*4+3]=a;}
 const FS=fi.pos,FC=fi.col,FZ=fi.size;const fireA=Math.max(0,1-t/22);
 for(let i=0;i<F.length;i++){const q=F[i];let x,y,z,s;if(t<2.5){const rad=fbR*(0.15+0.75*q.j);x=Math.cos(q.u)*Math.sin(q.v)*rad;z=Math.sin(q.u)*Math.sin(q.v)*rad;y=fbR*0.6+Math.cos(q.v)*rad*0.8;s=fbR*(0.35+q.k*0.4);}
  else if(i%3===0){const yy=q.j*rise*0.85;const sr=stemR*0.35;x=Math.cos(q.u)*sr;z=Math.sin(q.u)*sr;y=yy;s=stemR*(0.5+q.k*0.4);}
  else{const vv=q.v+t*0.22;const tube=r*0.35*q.j;const rr=R+Math.cos(vv)*tube;x=Math.cos(q.u)*rr;z=Math.sin(q.u)*rr;y=rise+Math.sin(vv)*tube*0.7;s=r*(0.4+q.k*0.4);}
  FS[i*3]=n.p.x+x;FS[i*3+1]=n.p.y+y;FS[i*3+2]=n.p.z+z;FZ[i]=s;const h=clamp(t/3,0,1);FC[i*4]=1;FC[i*4+1]=lerp(0.95,0.42,h)+q.k*0.1;FC[i*4+2]=lerp(0.8,0.08,h);FC[i*4+3]=fireA*(t<2.5?0.9:0.55);}
 for(const ps of [sm,fi]){const gg=ps.pts.geometry;gg.attributes.position.needsUpdate=gg.attributes.col.needsUpdate=gg.attributes.size.needsUpdate=true;}
 return {fbR,rise,R};}
function updNukes(dt){for(let i=nukes.length-1;i>=0;i--){const n=nukes[i];n.t+=dt;const t=n.t;const sh=nukeShape(n);
 n.glow.material.opacity=Math.max(0,1-t/3);n.glow.scale.setScalar(5000+t*3500);n.glow.position.y=sh.fbR*0.6;n.light.intensity=Math.max(0,4e7*(1-t/5));
 const R=t*700;n.ring.scale.setScalar(R);n.ring.material.opacity=Math.max(0,0.5*(1-R/12000));n.ring.visible=R<12000;n.dome.scale.set(R*0.9,R*0.45,R*0.9);n.dome.material.opacity=Math.max(0,0.14*(1-R/5000));n.dome.visible=R<5000;
 if(R<4500)for(const tg of targets){if(tg.alive&&!n.hit.has(tg)){const d=Math.hypot(tg.pos.x-n.p.x,tg.pos.z-n.p.z);if(d<R){n.hit.add(tg);killTarget(tg,true);}}}
 const dc=Math.hypot(camera.position.x-n.p.x,camera.position.z-n.p.z);if(!n.camHit&&R>dc){n.camHit=true;shake=Math.max(shake,4*Math.max(0.15,1-dc/15000));}
 if(player&&player.alive&&!n.playerHit&&player.def.cls!=='rocket'){const pp=player.mesh.position;const d=pp.distanceTo(n.p);if(d<R&&d<900){n.playerHit=true;crash('CAUGHT IN NUCLEAR BLAST');}}
 if(t>50){scene.remove(n.g);scene.remove(n.sm.pts);scene.remove(n.fi.pts);n.sm.pts.geometry.dispose();n.fi.pts.geometry.dispose();nukes.splice(i,1);}}}
