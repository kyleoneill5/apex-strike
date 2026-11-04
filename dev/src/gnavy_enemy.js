// ===== GNAVY_ENEMY: hostile "Red Coalition" surface group, subs and fighter wing that actively fight. Reuses in-game models, repainted + enemy flags/roundels/hull numbers.
// HARD RULES (Kyle): enemies NEVER get UFOs (TR-3B/saucer), SR-71, SR-72, nukes/ICBM/MIRV or space-launched weapons. Subs: cruise missiles + torpedoes ONLY. Jets: guns + air-to-air + cruise missiles ONLY (no nukes, no 50k bomb).
const ENEMY_RULES=Object.freeze({forbiddenModels:['tr3b','saucer','sr71','sr72','darkstar'],ship:['cruise','ciws'],sub:['cruise','torpedo'],jet:['gun','aam','cruise']});
const RED_FORCE=(()=>{const T=THREE,PI=Math.PI;if(typeof scene==='undefined'||typeof targets==='undefined')return null;
 const cvs=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
 const tx=c=>{const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;};
 const dm=c=>new T.MeshStandardMaterial({map:tx(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:0.6,side:T.DoubleSide});
 // insignia: fictional Red Coalition - crimson disc, white ring, black star
 const roundel=dm(cvs(128,128,(x)=>{x.fillStyle='#fff';x.beginPath();x.arc(64,64,62,0,7);x.fill();x.fillStyle='#b3121b';x.beginPath();x.arc(64,64,54,0,7);x.fill();x.fillStyle='#111';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?16:40;x.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);}x.fill();}));
 const flag=new T.MeshStandardMaterial({map:tx(cvs(150,100,(x,w,h)=>{x.fillStyle='#8e0f16';x.fillRect(0,0,w,h);x.fillStyle='#111';x.beginPath();x.moveTo(0,h);x.lineTo(w*0.35,h);x.lineTo(w,0);x.lineTo(w*0.65,0);x.fill();x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?7:17;x.lineTo(30+Math.cos(a)*r,28+Math.sin(a)*r);}x.fill();})),side:T.DoubleSide,roughness:0.8});
 const num=(t)=>dm(cvs(256,128,(x,w,h)=>{x.font='bold 96px "Arial Black",Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(0,0,0,.6)';x.fillText(t,w/2+5,h/2+4);x.fillStyle='#d9d9d2';x.fillText(t,w/2,h/2);}));
 // enemy paint: darker blue-gray with splinter camo (ships) / gray-blue tones (jets)
 const camo=(base,dk)=>{const c=cvs(512,256,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);x.fillStyle=dk;for(let i=0;i<14;i++){x.beginPath();const X=Math.random()*w,Y=Math.random()*h;x.moveTo(X,Y);for(let k=0;k<4;k++)x.lineTo(X+(Math.random()-.5)*160,Y+(Math.random()-.5)*120);x.fill();}for(let i=0;i<2500;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.05})`;x.fillRect(Math.random()*w,Math.random()*h,4,2);}});const t=tx(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
 const shipCamo=camo('#4f5964','#363e47'),jetCamo=camo('#5d6a78','#465260');
 function repaint(g,camoTex,tint){const done=new Map();g.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;
  if(m.transparent&&m.map){o.visible=false;return;}// strip US decals (hull numbers, roundels, flags)
  if(done.has(m)){o.material=done.get(m);return;}const n=m.clone();if(n.map&&n.color&&n.color.getHex()===0xffffff&&camoTex===shipCamo){n.color.setHex(0x7d8ea4);n.map=n.map.clone();n.map.needsUpdate=true;if(n.roughness!==undefined)n.roughness=Math.min(1,n.roughness+0.05);}else if(n.color){const hsl={};n.color.getHSL(hsl);if(hsl.s<0.25&&hsl.l>0.18&&hsl.l<0.8){n.color.setHex(tint);if(!n.map&&o.geometry&&o.geometry.attributes.uv){n.map=camoTex;}}}done.set(m,n);o.material=n;});}
 function decal(g,mat,w,h,x,y,z,ry,rx=0){const p=new T.Mesh(new T.PlaneGeometry(w,h),mat);p.position.set(x,y,z);p.rotation.set(rx,ry,0,'YXZ');g.add(p);return p;}
 const wetAt=(x,z)=>terrainH(x,z)<-30;
 function findWater(cx,cz,r0,r1){for(let k=0;k<60;k++){const a=Math.random()*6.283,r=r0+Math.random()*(r1-r0);const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(wetAt(x,z)&&wetAt(x+200,z)&&wetAt(x,z+200))return new T.Vector3(x,0,z);}return null;}
 const LOW=(window.innerWidth*window.innerHeight)<500000;// phone-class: smaller caps
 const CAP={ships:LOW?4:5,subs:2,jets:LOW?4:6};
 const E=[];// all enemy units: {kind:'ship'|'sub'|'jet', mesh, t(target proxy), hp, ...}
 const ext=new Set();
 const GC=V3(-14000,0,-9000);// battle area between home and enemy coast
 function proxy(kind,u){const t={kind,zone:1,mesh:u.mesh,pos:u.mesh.position.clone(),vel:V3(),hdg:0,alive:true,resp:0,phase:0,ext:true,u};targets.push(t);ext.add(t);return t;}
 // ---------- surface ships (Burke/Tico/LCS + patrol boats) ----------
 function mkShip(i){const kinds=['burke','tico','lcs','burke','boat'];const k=kinds[i%kinds.length];let m;
  try{m=k==='boat'?(()=>{const b=boat();b.scale.setScalar(2.2);return b;})():NAVYX.lod(NAVYX[k]);}catch(e){m=destroyer();}
  const hi=m.userData&&m.userData.hi?m.userData.hi:m;m.traverse(o=>{});
  {const usF=NAVYX.flagMat('us');m.traverse(o=>{if(o.isMesh&&o.material===usF)o.material=flag;});}// no US ensign on Red ships
  for(const lv of(m.isLOD?m.levels.map(l=>l.object):[m]))repaint(lv,shipCamo,0x56606b);
  const L=(m.userData.L||60),B=(m.userData.B||10);const tgt=m.isLOD?m.levels[0].object:m;
  if(k!=='boat'){const hb=tgt.userData.hb;const nm=num(String(600+i*7));for(const s of[-1,1])decal(tgt,nm,9,4.5,s*(hb?hb(0.15)+0.15:B/2),4.5,-L*0.35,s*PI/2);
   const f=decal(tgt,flag,4,2.6,0,(tgt.userData.cls==='LCS'?30:30),L*0.02,PI/2);}
  scene.add(m);const u={kind:'ship',k,mesh:m,L:k==='boat'?29:L,B:k==='boat'?8:B,hp:k==='boat'?1:(k==='tico'?5:4),hp0:0,st:'ok',hdg:Math.random()*6.28,spd:k==='boat'?11:7,rl:8+Math.random()*10,ciwsT:0,sinkT:0};u.hp0=u.hp;
  const p=findWater(GC.x,GC.z,0,6000)||findWater(ENEMY.x,ENEMY.z,3000,12000)||V3(GC.x,0,GC.z);m.position.copy(p);u.t=proxy('boat',u);E.push(u);}
 // ---------- subs (cruise + torpedo only) ----------
 function mkSub(i){const m=sub();repaint(m,null,0x222629);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});decal(m,roundel,3,3,1.25,8.5,-26,PI/2);decal(m,roundel,3,3,-1.25,8.5,-26,-PI/2);
  scene.add(m);const u={kind:'sub',mesh:m,L:57,B:6,hp:2,hp0:2,st:'ok',hdg:Math.random()*6.28,spd:6,rl:20+i*7,depth:-9,sinkT:0};const p=findWater(GC.x,GC.z,1500,7000)||V3(GC.x+2000,0,GC.z);m.position.copy(p);m.position.y=u.depth;u.t=proxy('boat',u);E.push(u);}
 // ---------- fighters: reuse in-game enemy airframes (Su-57 / J-20 / MiG-29 / F/A-18E) ----------
 const AF=['su57','mig29','j20','fa18e'];
 function mkJet(i){const k=AF[i%AF.length];if(ENEMY_RULES.forbiddenModels.includes(k))return;let m;
  try{m=(typeof ENEMY_AC!=='undefined'&&ENEMY_AC[k])?ENEMY_AC[k]():jet(0x5d6a78);}catch(e){m=jet(0x5d6a78);}
  repaint(m,null,0x5f6c7a);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  // reshape slab tail fins (box) into swept, tapered fins with a Red Coalition fin flash
  if(!(typeof ENEMY_AC!=='undefined'&&ENEMY_AC[k])){const fins=[];m.traverse(o=>{const g=o.geometry;if(o.isMesh&&g&&g.type==='BoxGeometry'){const P=g.parameters;if(P.width<0.5&&P.height>0.9&&P.depth>0.9&&P.height<6)fins.push(o);}});
   for(const o of fins){const P=o.geometry.parameters,h=P.height,d=P.depth,th=Math.max(0.08,P.width*0.55);const sh=new T.Shape();sh.moveTo(-d/2,-h/2);sh.lineTo(d/2,-h/2);sh.lineTo(d/2+d*0.05-d*0.1,h/2);sh.lineTo(d/2-d*0.45,h/2);sh.lineTo(-d/2+d*0.05,-h/2+h*0.08);sh.closePath();
    const eg=new T.ExtrudeGeometry(sh,{depth:th,bevelEnabled:true,bevelThickness:th*0.35,bevelSize:th*0.35,bevelSegments:2,steps:1});eg.translate(0,0,-th/2);eg.rotateY(PI/2);eg.computeVertexNormals();o.geometry=eg;
    const fl=new T.Mesh(new T.PlaneGeometry(d*0.45,h*0.35),flag.clone());fl.material.polygonOffset=true;fl.material.polygonOffsetFactor=-4;for(const sx of[-1,1]){const f2=fl.clone();f2.position.set(sx*(th/2+th*0.4+0.02),h*0.12,d*0.08);f2.rotation.y=sx*PI/2;o.add(f2);}}}
  const bb=new T.Box3().setFromObject(m),sz=bb.getSize(V3());const sp=sz.x*0.3,yT=bb.max.y-0.2;
  for(const s of[-1,1])decal(m,roundel,1.8,1.8,s*sp,bb.min.y+sz.y*0.45+0.02,(bb.min.z+bb.max.z)/2+sz.z*0.12,0,-PI/2);
  for(const s of[-1,1])decal(m,roundel,1.2,1.2,s*(sz.x*0.07),(bb.min.y+bb.max.y)/2,bb.min.z+sz.z*0.3,s*PI/2);
  scene.add(m);const u={kind:'jet',k,mesh:m,hp:1,hp0:1,st:'ok',pos:V3(GC.x+rnd(4000),1500+Math.random()*1500,GC.z+rnd(4000)),vel:V3(240,0,0),gunT:0,aamT:6+i*3,cmT:15+i*5,resp:0};m.position.copy(u.pos);u.t=proxy('drone',u);E.push(u);}
 for(let i=0;i<CAP.ships;i++)mkShip(i);for(let i=0;i<CAP.subs;i++)mkSub(i);for(let i=0;i<CAP.jets;i++)mkJet(i);
 // ---------- enemy weapons (own list; flares decoy AAMs) ----------
 const W=[];const allowed=(u,w)=>ENEMY_RULES[u.kind].includes(w);
 function fireW(u,w,from,aim){if(!allowed(u,w))return;// rule gate: anything else is impossible by construction
  const spec={cruise:{spd:260,turn:0.5,life:60,dmg:45,col:0x8a8f86,l:6,r:0.3,alt:22},aam:{spd:780,turn:2.2,life:18,dmg:34,col:0xdddddd,l:3.8,r:0.12},torpedo:{spd:28,turn:0.25,life:150,dmg:60,col:0x223322,l:6,r:0.27,uw:true}}[w];
  const mesh=missileMesh(spec.l,spec.r,spec.col);mesh.position.copy(from);scene.add(mesh);const d=aim.clone().sub(from).normalize();if(w==='cruise')d.y=Math.max(d.y,0.6);
  W.push(Object.assign({w,u,pos:from.clone(),vel:d.multiplyScalar(w==='cruise'?90:spec.spd*0.5),mesh,t:0},spec));if(w!=='torpedo')try{sfx('missile',0.35);}catch(e){}
  msg(w==='torpedo'?'⚠ TORPEDO IN THE WATER':w==='aam'?'⚠ MISSILE LOCK - FLARES':'⚠ ANTI-SHIP MISSILE INBOUND',1.8);}
 function updW(dt){const pp=player&&player.mesh?player.mesh.position:null;for(let i=W.length-1;i>=0;i--){const e=W[i];e.t+=dt;e.life-=dt;let goal=pp&&player.alive?pp.clone():null;
  if(e.w==='aam'&&!e.decoy&&EAD.flareT>0&&goal&&e.pos.distanceTo(goal)<3500&&Math.random()<0.8){e.decoy=goal.clone().add(V3(rnd(90),-70,rnd(90)));msg('MISSILE DECOYED',1);}
  if(e.decoy)goal=e.decoy;if(goal){if(e.w==='cruise'&&e.t>3&&goal.distanceTo(e.pos)>1500)goal.y=Math.max(goal.y,e.alt);if(e.uw)goal.y=Math.min(goal.y,-6);
   const dir=e.vel.clone().normalize(),want=goal.sub(e.pos).normalize();const ang=dir.angleTo(want);if(ang>1e-4)dir.lerp(want,Math.min(1,e.turn*dt/ang)).normalize();const sp=Math.min(e.spd,e.vel.length()+e.spd*0.6*dt);e.vel.copy(dir).multiplyScalar(sp);}
  e.pos.addScaledVector(e.vel,dt);if(e.uw)e.pos.y=Math.min(e.pos.y,-4);e.mesh.position.copy(e.pos);e.mesh.lookAt(_t.copy(e.pos).sub(e.vel));
  if(!e.uw&&Math.random()<0.7)smoke.spawn(_t.copy(e.pos).addScaledVector(e.vel,-0.012),rnd(1),rnd(1),rnd(1),1.5,2,3,0.9,0.9,0.9,0.5);
  let dead=e.life<=0||(e.decoy&&e.pos.distanceTo(e.decoy)<25)||(!e.uw&&e.pos.y<terrainH(e.pos.x,e.pos.z)&&e.t>2);
  // player can shoot them down with guns/missiles
  for(const o of projs){if(o.done||!o.pos||o.owner!==player)continue;if(o.pos.distanceToSquared(e.pos)<(o.type==='bullet'?60:400)){dead=true;o.done=true;score+=50;msg('+50 MISSILE KILLED',1);break;}}
  if(!e.decoy&&pp&&player.alive&&e.pos.distanceTo(pp)<(e.w==='aam'?18:(player.def.cls==='ship'?40:22))){eadHit(e.dmg,e.w==='torpedo'?'TORPEDO HIT':e.w==='aam'?'MISSILE HIT':'ANTI-SHIP MISSILE HIT');dead=true;}
  if(dead){explosion(e.pos,e.uw?2:1.3);scene.remove(e.mesh);W.splice(i,1);}}}
 // ---------- damage / sinking (wraps killTarget so ships take several hits) ----------
 {const _k=killTarget;killTarget=function(t,big){if(t&&t.ext){hitUnit(t.u,big?2:1);return;}return _k(t,big);};}
 {const _r=respawnTarget;respawnTarget=function(t){if(t&&t.ext)return;return _r(t);};}
 {const _u=updTargets;updTargets=function(dt){const keep=targets.filter(t=>!t.ext);const all=targets.slice();targets.length=0;targets.push(...keep);try{_u(dt);}finally{targets.length=0;targets.push(...all);}try{tickAll(dt);}catch(e){console.warn('redforce',e);}};}
 function hitUnit(u,dmg){if(u.st!=='ok')return;u.hp-=dmg;explosion(u.mesh.position.clone().add(V3(rnd(u.L?u.L*0.3:3),u.kind==='jet'?0:6,rnd(u.L?u.L*0.3:3))),u.kind==='jet'?1.4:2.4);
  if(u.hp<=0){u.st='dead';u.t.alive=false;u.sinkT=0;const pts={ship:u.k==='boat'?150:400,sub:450,jet:250}[u.kind];score+=pts;msg('+'+pts+' ENEMY '+(u.kind==='jet'?'FIGHTER DOWN':u.kind==='sub'?'SUB KILLED':'WARSHIP SUNK'),2);}}
 const fightOn=()=>player&&player.mesh&&player.alive&&!mission&&settings.enemies!==false;
 let clock=0;
 // Engage the player in any vehicle (not only air/sea) and the US ships. A submerged sub below periscope depth is not a cruise/ASM target.
 function pickEngage(from,pp,R){const deep=player&&player.def&&player.def.cls==='sub'&&player.mesh&&player.mesh.position.y<-18;if(fightOn()&&pp&&!deep&&from.distanceTo(pp)<R)return pp;let b=null,bd=R;if(typeof NAVY_FLEET!=='undefined')for(const s of NAVY_FLEET.ships){if(!s.m)continue;const d=s.m.position.distanceTo(from);if(d>80&&d<bd){bd=d;b=s.m.position;}}return b;}
 function tickAll(dt){clock+=dt;const pp=player&&player.mesh?player.mesh.position:V3();const pc=player&&player.def?player.def.cls:'';const air=pc==='air'||pc==='heli';const sea=pc==='ship'||pc==='sub';
  for(const u of E){const m=u.mesh;
   if(u.kind!=='jet'){// ---- surface & sub movement + sinking ----
    if(u.st==='ok'){const dx=-Math.sin(u.hdg),dz=-Math.cos(u.hdg);if(!wetAt(m.position.x+dx*400,m.position.z+dz*400))u.hdg+=dt*0.5;else{u.hdg+=Math.sin(clock*0.05+u.L)*0.01*dt;m.position.x+=dx*u.spd*dt;m.position.z+=dz*u.spd*dt;}
     const by=u.kind==='sub'?u.depth:Math.sin(clock*0.6+u.L)*0.3;m.position.y=by;m.rotation.set(Math.sin(clock*0.5+u.L)*0.008,u.hdg,Math.sin(clock*0.7+u.L)*0.012);
     // collision with player projectiles (torpedoes/missiles at low altitude) — bullets use killTarget via proxy
     for(const o of projs){if(o.done||!o.pos||o.owner!==player||o.type==='bullet'||o.pos.y>16)continue;const d=m.worldToLocal(o.pos.clone());if(Math.abs(d.x)<u.B*0.6+2&&Math.abs(d.z)<u.L*0.5+2&&d.y>-20){o.done=true;o.life=0;if(o.mesh)o.mesh.visible=false;hitUnit(u,o.type==='torpedo'?3:2);break;}}
     if(fightOn()){const d=m.position.distanceTo(pp);u.rl-=dt;
      if(u.kind==='ship'&&u.k!=='boat'){// cruise vs any player who is not a deep sub, and vs US ships
       if(u.rl<=0&&W.filter(w=>w.u===u).length<1){const aim=pickEngage(m.position,pp,28000);if(aim){u.rl=8+Math.random()*6;fireW(u,'cruise',m.position.clone().add(V3(0,12,0)),aim);}}
       if(air&&d<3200&&pp.y<3500){u.ciwsT-=dt;if(u.ciwsT<=0){u.ciwsT=0.1;const o=m.position.clone().add(V3(0,14,0));const dd=pp.clone().sub(o);const Ld=dd.length();dd.normalize();for(let k=0;k<2;k++)fire.spawn(_t.copy(o).addScaledVector(dd,Ld*(0.2+Math.random()*0.8)).add(V3(rnd(40),rnd(40),rnd(40))),dd.x*500,dd.y*500,dd.z*500,0.3,1,0,1,0.85,0.3,1);if(Math.random()<0.012)eadHit(3,'CIWS FIRE');}}}
      if(u.kind==='sub'&&u.rl<=0&&W.filter(w=>w.u===u).length<1){const aim=pickEngage(m.position,pp,24000);if(aim){u.rl=10+Math.random()*6;const surf=aim===pp&&sea&&!(pc==='sub'&&pp.y<-18);if(surf&&m.position.distanceTo(aim)<6000)fireW(u,'torpedo',m.position.clone().add(V3(0,-2,0)),aim);else fireW(u,'cruise',m.position.clone().setY(2),aim);}}}}
    else{u.sinkT+=dt;const k=Math.min(1,u.sinkT/20);m.rotation.z=0.4*k*k;m.rotation.x=0.1*k;m.position.y-=dt*(u.kind==='sub'?4:1.4*k);if(u.kind!=='sub'&&Math.random()<dt*6)smoke.spawn(V3(m.position.x+rnd(u.L*.3),3,m.position.z+rnd(u.L*.3)),rnd(2),6,rnd(2),6,10,8,.15,.14,.13,.6,0,.1);
     if(u.sinkT>45){u.st='ok';u.hp=u.hp0;u.t.alive=true;m.rotation.set(0,0,0);const p=findWater(GC.x,GC.z,0,7000);if(p)m.position.copy(p);}}
    u.t.pos.copy(m.position);if(u.kind==='sub')u.t.pos.y=Math.max(u.t.pos.y,-3);u.t.mesh=m;m.visible=true;continue;}
   // ---- fighters ----
   if(u.st!=='ok'){u.resp-=dt;if(u.resp===undefined||u.resp<=-1){} if(u.st==='dead'){u.st='down';u.resp=40;m.visible=false;explosion(u.pos,1.6);}else if(u.resp<=0){u.st='ok';u.hp=u.hp0;u.t.alive=true;m.visible=true;u.pos.set(GC.x+rnd(5000),2000,GC.z+rnd(5000));}continue;}
   const aimP=pickEngage(u.pos,pp,26000);const hunt=!!aimP;
   let goal;if(hunt){goal=aimP.clone();if(aimP===pp&&!air)goal.y=Math.max(goal.y,pp.y);}else{const a=clock*0.05+E.indexOf(u);goal=V3(GC.x+Math.cos(a)*5000,1800+Math.sin(a*2)*400,GC.z+Math.sin(a)*5000);}
   const dir=u.vel.clone().normalize(),want=goal.clone().sub(u.pos);const dist=want.length();want.normalize();const ang=dir.angleTo(want);if(ang>1e-4)dir.lerp(want,Math.min(1,0.9*dt/ang)).normalize();
   const spd=hunt?300:230;u.vel.copy(dir).multiplyScalar(spd);u.pos.addScaledVector(u.vel,dt);const gh=terrainH(u.pos.x,u.pos.z);if(u.pos.y<Math.max(0,gh)+150)u.pos.y=Math.max(0,gh)+150;
   m.position.copy(u.pos);m.lookAt(_t.copy(u.pos).sub(u.vel));const bank=clamp(dir.clone().cross(want).y*6,-1.1,1.1);m.rotateZ(-bank);u.t.pos.copy(u.pos);u.t.vel.copy(u.vel);
   if(hunt){u.gunT-=dt;u.aamT-=dt;u.cmT-=dt;const facing=dir.dot(want)>0.985;
    if(air&&facing&&dist<1300&&u.gunT<=0){u.gunT=0.09;const o=u.pos.clone().addScaledVector(dir,8);for(let k=0;k<2;k++)fire.spawn(_t.copy(o).addScaledVector(dir,Math.random()*dist),dir.x*900,dir.y*900,dir.z*900,0.25,0.8,0,1,0.9,0.4,1);if(Math.random()<0.06)eadHit(4,'GUN HITS');}
    if(air&&dist<7000&&dist>900&&u.aamT<=0&&W.filter(w=>w.w==='aam').length<2){u.aamT=16+Math.random()*10;fireW(u,'aam',u.pos.clone().addScaledVector(dir,6).add(V3(0,-1.5,0)),pp);}
    if(hunt&&!(air&&aimP===pp)&&dist<26000&&u.cmT<=0&&W.filter(w=>w.w==='cruise').length<3){u.cmT=10+Math.random()*6;fireW(u,'cruise',u.pos.clone().add(V3(0,-2,0)),aimP);}}}
  updW(dt);}
 window.__red={E,W,CAP,RULES:ENEMY_RULES,fireW,hitUnit};return {E,W};})();
