// ===== GTORP: steerable torpedo (depth + yaw) with deflecting grid fins, sinkable ship targets, ambient AI jets. Lean: procedural only =====
{const T=THREE;
 // --- grid-fin lattice texture (shared) ---
 const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');x.strokeStyle='#fff';x.lineWidth=5;x.strokeRect(3,3,58,58);
 for(let i=1;i<6;i++){x.beginPath();x.moveTo(i*64/6,0);x.lineTo(i*64/6,64);x.moveTo(0,i*64/6);x.lineTo(64,i*64/6);x.stroke();}
 const finM=new T.MeshStandardMaterial({color:0x6c726c,metalness:.7,roughness:.45,map:new T.CanvasTexture(cv),alphaTest:.5,transparent:false,side:T.DoubleSide});
 const finG=new T.PlaneGeometry(0.42,0.42);
 const addFins=o=>{const g=o.mesh;if(!g||g.userData.fins)return;const fins=[];
  // mesh axis is local Z (cylZ, nose -Z); fins at tail z=+2.7, radius .27
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const piv=new T.Group();piv.position.set(Math.cos(a)*0.27,Math.sin(a)*0.27,2.6);piv.rotation.z=a;
   const f=new T.Mesh(finG,finM);f.position.x=0.21;f.rotation.y=Math.PI/2;piv.add(f);g.add(piv);fins.push(piv);}g.userData.fins=fins;};
 {const _add=addProj;addProj=function(o){const r=_add(o);if(o&&o.type==='torpedo'){addFins(o);o.dT=-6;}return r;};}
 // --- depth steering + fin deflection; runs after projectile physics ---
 {const _up=updProjs;updProjs=function(dt){const r=_up(dt);
  for(const o of projs){if(o.type!=='torpedo'||o.done||!o.vel)continue;
   const steer=camFollow===o&&GUIDE.active;const sp=GUIDE.stick||{p:0,r:0,y:0};const pIn=steer?clamp(sp.p,-1,1):0,yIn=steer?clamp(sp.r+sp.y,-1,1):0;
   const bed=groundAt(o.pos.x,o.pos.z);const floor=(bed.type==='water'&&bed.bed!=null?bed.bed:-200)+3;
   o.dT=clamp((o.dT??-6)+pIn*dt*10,Math.max(floor,-180),-1.5);
   const vy=clamp((o.dT-o.pos.y)*0.8,-6,6);o.vel.y+=(vy-o.vel.y)*Math.min(1,dt*3);
   const f=o.mesh&&o.mesh.userData.fins;if(f){o._fp=(o._fp||0)+(pIn-(o._fp||0))*Math.min(1,dt*8);o._fy=(o._fy||0)+(yIn-(o._fy||0))*Math.min(1,dt*8);
    f[0].rotation.x=f[2].rotation.x=o._fp*0.45;f[1].rotation.x=f[3].rotation.x=o._fy*0.45;}}
  return r;};}
 // --- ships: patrol in deep water, sink on torpedo / missile hits ---
 const SH=[];const N=window.innerWidth*window.innerHeight>0?6:6;
 const holeC=document.createElement('canvas');holeC.width=holeC.height=128;{const h=holeC.getContext('2d');const gr=h.createRadialGradient(64,64,6,64,64,62);gr.addColorStop(0,'#000');gr.addColorStop(.55,'#120c08');gr.addColorStop(.8,'rgba(60,40,25,.7)');gr.addColorStop(1,'rgba(0,0,0,0)');h.fillStyle=gr;h.beginPath();for(let i=0;i<22;i++){const a=i/22*6.283,rr=40+Math.random()*22;h.lineTo(64+Math.cos(a)*rr,64+Math.sin(a)*rr);}h.fill();}
 const holeM=new T.MeshBasicMaterial({map:new T.CanvasTexture(holeC),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:T.DoubleSide});
 const colM=new T.MeshBasicMaterial({color:0xeaf4f8,transparent:true,opacity:.85,depthWrite:false});const colG=new T.CylinderGeometry(.4,1,1,14,1,true).translate(0,.5,0);
 const place=s=>{for(let k=0;k<40;k++){const a=Math.random()*6.283,r=3000+Math.random()*7000;const px=Math.cos(a)*r,pz=Math.sin(a)*r;if(terrainH(px,pz)<-25){s.pos.set(px,0,pz);return;}}s.pos.set(6000,0,0);};
 const mkShip=i=>{const big=i%3===0;const m=big?destroyer():boat();if(!big)m.scale.setScalar(2.2);scene.add(m);const s={m,big,pos:new T.Vector3(),hdg:Math.random()*6.28,spd:big?8:6,hp:big?3:1,st:'ok',t:0,L:big?77:29,B:big?10:8,holes:[]};place(s);return s;};
 for(let i=0;i<N;i++)SH.push(mkShip(i));
 const fx=[];
 const hitShip=(s,p,dmg)=>{s.hp-=dmg;explosion(p,s.big?3:2.4);
  const c=new T.Mesh(colG,colM.clone());c.position.set(p.x,0,p.z);scene.add(c);fx.push({c,t:0});
  // hull hole decal at the waterline on the struck side
  const lp=s.m.worldToLocal(p.clone());const side=Math.sign(lp.x)||1;const h=new T.Mesh(new T.PlaneGeometry(1,1),holeM);
  h.position.set(side*(s.big?9.6:3.3),-0.6,clamp(lp.z,-s.L*0.8,s.L*0.8)/(s.big?1:2.2));h.rotation.y=side*Math.PI/2;h.scale.setScalar((s.big?9:4)*(0.8+Math.random()*.5));s.m.add(h);s.holes.push(h);
  if(s.hp<=0&&s.st==='ok'){s.st='sink';s.t=0;s.side=side;score+=s.big?500:150;msg(s.big?'+500 DESTROYER SUNK':'+150 SHIP SUNK',2);}};
 const _ut=updTargets;updTargets=function(dt){_ut(dt);
  for(const s of SH){
   if(s.st==='ok'){s.hdg+=dt*0.01;const dx=Math.sin(s.hdg),dz=-Math.cos(s.hdg);const nx=s.pos.x+dx*s.spd*dt,nz=s.pos.z+dz*s.spd*dt;if(terrainH(nx+dx*300,nz+dz*300)>-20)s.hdg+=dt*0.6;else s.pos.set(nx,0,nz);
    s.m.position.set(s.pos.x,Math.sin(simT*.6+s.L)*.25,s.pos.z);s.m.rotation.set(Math.sin(simT*.5+s.L)*.01,s.hdg+Math.PI,Math.sin(simT*.7)*.015);
    for(const o of projs){if(o.done||!o.pos||o.owner!==player||o.pos.y>14)continue;const d=s.m.worldToLocal(o.pos.clone());
     if(Math.abs(d.x)<s.B*(s.big?1:1)&&Math.abs(d.z)<s.L){o.done=true;o.life=0;if(o.mesh)o.mesh.visible=false;hitShip(s,o.pos,o.type==='torpedo'?(s.big?3:1):1);break;}}}
   else if(s.st==='sink'){s.t+=dt;const k=Math.min(1,s.t/24);s.m.rotation.z=s.side*0.45*k*k;s.m.rotation.x=0.12*k;s.m.position.y=-k*k*(s.big?28:14);
    if(Math.random()<dt*6)smoke.spawn(V3(s.pos.x+rnd(s.L*.4),2,s.pos.z+rnd(s.L*.4)),rnd(2),6,rnd(2),6,10,8,.15,.14,.13,.6,0,.1);
    if(s.t>40){s.holes.forEach(h=>s.m.remove(h));s.holes=[];s.hp=s.big?3:1;s.st='ok';s.m.rotation.set(0,0,0);place(s);}}}
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;const k=f.t/2.4;f.c.scale.set(6+k*10,40*Math.sin(Math.min(1,k)*Math.PI)+1,6+k*10);f.c.material.opacity=.85*(1-k);if(k>=1){scene.remove(f.c);f.c.material.dispose();fx.splice(i,1);}}};
 // --- ambient AI jets (reuse jet meshes; 4 only, no shadows) ---
 const AJ=[];for(let i=0;i<4;i++){const m=jet(i%2?0x8a949c:0x5d6873,i%2===1);m.traverse(o=>{if(o.isMesh)o.castShadow=false;});if(m.userData.flame)m.userData.flame.visible=false;scene.add(m);AJ.push({m,r:5000+i*1800,h:1400+i*900,w:(i%2?1:-1)*(200+i*20)/(5000+i*1800),a:i*1.6});}
 const _ut2=updTargets;updTargets=function(dt){_ut2(dt);for(const j of AJ){j.a+=j.w*dt;const x=Math.cos(j.a)*j.r,z=Math.sin(j.a)*j.r;j.m.position.set(x,j.h,z);const tx=-Math.sin(j.a)*Math.sign(j.w),tz=Math.cos(j.a)*Math.sign(j.w);j.m.rotation.set(0,Math.atan2(-tx,-tz),Math.sign(j.w)*-0.5,'YXZ');}};
 window.__torp={SH,AJ,hitShip};
}
