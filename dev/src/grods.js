// ===== Rods from God: orbital kinetic bombardment platform (LEO), 6 tungsten rods, targeting view, deorbit + Mach 10 re-entry, kinetic impact =====
DEFS.rods={name:'Rods from God (Orbital KE)',desc:'LEO kinetic bombardment satellite. Aim from orbit, drop 6 m tungsten rods: deorbit burn, Mach 10 re-entry, massive non-nuclear impact.',cls:'silo',weapons:['ROD']};AMMO.ROD=6;
const ROD_ALT=110000;
function goldFoil(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#b8902e';x.fillRect(0,0,512,512);
 for(let i=0;i<900;i++){const px=Math.random()*512,py=Math.random()*512,r=6+Math.random()*40;const g=x.createRadialGradient(px,py,0,px,py,r);const l=Math.random()<0.5;g.addColorStop(0,l?'rgba(255,236,160,.22)':'rgba(70,45,5,.22)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r);}
 x.strokeStyle='rgba(60,40,8,.35)';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(0,i*85+40);x.lineTo(512,i*85+44);x.stroke();}x.fillStyle='rgba(40,30,10,.6)';for(let i=0;i<40;i++){x.beginPath();x.arc(Math.random()*512,Math.random()*512,2.2,0,7);x.fill();} // seams + tape pins
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function solarTex(){const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');x.fillStyle='#c8c8c8';x.fillRect(0,0,256,512);for(let i=0;i<8;i++)for(let j=0;j<16;j++){const g=x.createLinearGradient(0,j*32,0,j*32+30);g.addColorStop(0,'#1a2550');g.addColorStop(1,'#0c1430');x.fillStyle=g;x.fillRect(i*32+1,j*32+1,30,30);x.strokeStyle='rgba(160,180,255,.25)';x.beginPath();x.moveTo(i*32+16,j*32+1);x.lineTo(i*32+16,j*32+31);x.stroke();}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function rodSat(){const g=new THREE.Group();const foil=new THREE.MeshStandardMaterial({map:goldFoil(),metalness:0.9,roughness:0.35});const wht=new THREE.MeshStandardMaterial({color:0xe6e6e2,roughness:0.5,metalness:0.2});const al=new THREE.MeshStandardMaterial({color:0xa8acb0,metalness:0.9,roughness:0.3});
 add(g,new THREE.BoxGeometry(2.6,3.2,2.6),foil,0,0,0);add(g,new THREE.BoxGeometry(2.7,0.2,2.7),wht,0,1.7,0);add(g,new THREE.BoxGeometry(2.7,0.2,2.7),wht,0,-1.7,0);
 // rod magazine: 6 tungsten rods in a hex rack under the bus
 const rk=new THREE.Group();rk.position.y=-1.9;g.add(rk);add(rk,new THREE.CylinderGeometry(1.25,1.25,0.25,6),al,0,0,0);
 const rodM=new THREE.MeshStandardMaterial({color:0x6f7378,metalness:1,roughness:0.28});const rods=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const r=add(rk,new THREE.CylinderGeometry(0.15,0.15,6,16),rodM,Math.cos(a)*0.8,-3.1,Math.sin(a)*0.8);add(r,new THREE.ConeGeometry(0.15,0.5,16),rodM,0,-3.25,0).rotation.x=Math.PI;rods.push(r);}
 for(let k=0;k<3;k++)add(rk,new THREE.TorusGeometry(1.0,0.04,6,24).rotateX(Math.PI/2),al,0,-1-k*2,0);g.userData.rods=rods;
 // solar wings
 const sm=new THREE.MeshStandardMaterial({map:solarTex(),metalness:0.4,roughness:0.25,side:THREE.DoubleSide});for(const s of[-1,1]){add(g,new THREE.CylinderGeometry(0.06,0.06,1.6,8).rotateZ(Math.PI/2),al,s*2.1,0,0);for(let p=0;p<3;p++){add(g,new THREE.BoxGeometry(3.4,0.05,2.4),sm,s*(4.0+p*3.5),0,0);}}
 // radiators, antennas, thrusters, star trackers
 add(g,new THREE.BoxGeometry(0.05,2.4,2.0),wht,1.35,0,0);add(g,new THREE.BoxGeometry(0.05,2.4,2.0),wht,-1.35,0,0);
 const dish=new THREE.Mesh(new THREE.SphereGeometry(0.9,24,8,0,Math.PI*2,0,0.6),wht);dish.position.set(0,2.6,0.6);dish.rotation.x=Math.PI;g.add(dish);add(g,new THREE.CylinderGeometry(0.04,0.04,0.9,6),al,0,2.2,0.6);
 for(const [x,z] of[[1.2,1.2],[-1.2,1.2],[1.2,-1.2],[-1.2,-1.2]]){add(g,new THREE.ConeGeometry(0.12,0.3,10,1,true),al,x,1.85,z).rotation.x=Math.PI;add(g,new THREE.ConeGeometry(0.12,0.3,10,1,true),al,x,-1.85,z);}
 add(g,new THREE.BoxGeometry(0.3,0.3,0.4),al,0.8,1.95,-0.9);add(g,new THREE.CylinderGeometry(0.12,0.12,0.25,12),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.2}),0.8,2.15,-0.9);
 decal(g,decalTex((x,w,h)=>{x.fillStyle='#202020';x.font='bold 40px Arial';x.textAlign='center';x.fillText('KE-6  USSF',w/2,80);},256,128),1.8,0.9,[0,0.6,1.36],[0,0,0],0.9);
 // solar array yokes + frames, rod tail fins, sun sensors, docking/handling fixtures
 for(const sx of[-1,1]){for(let p=0;p<3;p++){const fr=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4,0.06,2.4)),new THREE.LineBasicMaterial({color:0x9a9ea2}));fr.position.set(sx*(4.0+p*3.5),0,0);g.add(fr);}add(g,new THREE.BoxGeometry(0.5,0.12,1.4),al,sx*2.35,0,0);}
 for(const r of rods){for(let f=0;f<4;f++){const fn=add(r,new THREE.BoxGeometry(0.02,0.5,0.28),rodM,0,2.7,0);fn.rotation.y=f*Math.PI/2;fn.position.set(Math.cos(f*Math.PI/2)*0.18,2.7,Math.sin(f*Math.PI/2)*0.18);}}
 for(const [x,y,z] of[[1.32,1.2,0.9],[-1.32,-1.2,-0.9],[1.32,-1.1,-0.8]])add(g,new THREE.BoxGeometry(0.06,0.18,0.18),new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.2,metalness:0.5}),x,y,z);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;add(g,new THREE.CylinderGeometry(0.05,0.05,0.5,8),al,Math.cos(a)*1.25,-2.0,Math.sin(a)*1.25);}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
let RS=null;window.__rods=()=>RS;
{const _sp=spawn;spawn=function(kind,loc){if(kind!=='rods'){if(RS){scene.remove(RS.sat);RS.el.style.display='none';camera.fov=RS.fov0;camera.updateProjectionMatrix();camera.up.set(0,1,0);RS=null;}return _sp(kind,loc);}
 if(RS){scene.remove(RS.sat);RS.el.style.display='none';}_sp('silo',loc);const v=player;v.kind='rods';v.def=DEFS.rods;v.weapons=['ROD'];v.ammo={ROD:6};v.wi=0;
 const c=loc==='nyc'?NYC.clone():loc==='silo'?ENEMY.clone():ENEMY.clone();const sat=rodSat();sat.position.set(c.x-30000,ROD_ALT,c.z);scene.add(sat);
 RS={sat,aim:c.clone(),fov0:camera.fov,zoom:1,el:$('rodHud'),vt:0};RS.el.style.display='block';v.mesh.position.copy(sat.position);msg('ORBITAL KE PLATFORM - LEO\nStick moves the reticle, FIRE drops a rod',3);updateCtxLabel&&updateCtxLabel();};}
{const d=document.createElement('div');d.id='rodHud';d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:6;display:none;font:13px monospace;color:#cfe8ff;text-shadow:0 0 3px #000';
 d.innerHTML='<svg viewBox="-100 -100 200 200" style="position:absolute;left:50%;top:50%;width:min(50vw,50vh);height:min(50vw,50vh);transform:translate(-50%,-50%)" fill="none" stroke="#cfe8ff" stroke-width="1"><rect x="-30" y="-30" width="60" height="60"/><path d="M-95 0H-40M40 0H95M0-95V-40M0 40V95M-4 0H4M0-4V4"/><circle r="70" stroke-dasharray="3 5"/></svg><div id="rodT" style="position:absolute;left:12px;top:calc(60px + env(safe-area-inset-top));white-space:pre"></div>';document.body.appendChild(d);}
// fire: deorbit a rod toward the reticle
{const _fw=fireWeapon;fireWeapon=function(v){if(!(v&&v.kind==='rods'))return _fw(v);if(!RS||v.ammo.ROD<=0)return false;if(RS.cool>0)return false;RS.cool=3;v.ammo.ROD--;
 const rv=RS.sat.userData.rods[v.ammo.ROD];if(rv)rv.visible=false;const p=RS.sat.position.clone().add(V3(0,-6,0));
 const m=new THREE.Group();const rodM=new THREE.MeshStandardMaterial({color:0x7a7e84,metalness:1,roughness:0.3,emissive:0xff6020,emissiveIntensity:0});add(m,new THREE.CylinderGeometry(0.15,0.15,6,16),rodM,0,0,0);add(m,new THREE.ConeGeometry(0.15,0.6,16),rodM,0,3.3,0);
 const sh=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xffb070,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sh.scale.set(1.2,5,1.2);sh.position.y=2.5;m.add(sh);m.position.copy(p);scene.add(m);
 const tg=RS.aim.clone();const o={type:'rod',pos:p,vel:V3(7600*0.0,0,0),life:600,mesh:m,owner:v,t:0,tgt:tg,name:'ROD-'+(6-v.ammo.ROD),phase:'deorbit',sh,rodM};
 // horizontal velocity to reach the aim point given a ~3.1 km/s descent
 const T=ROD_ALT/3100;o.vel.set((tg.x-p.x)/T,-300,(tg.z-p.z)/T);addProj(o);msg('DEORBIT BURN - '+o.name,1.5);play3D('missile',null,0.5,0.6);return true;};}
GUIDE.types.push('rod');
{const _tick=tick;tick=function(dt){_tick(dt);if(RS){RS.cool=Math.max(0,(RS.cool||0)-dt);}for(let i=projs.length-1;i>=0;i--){const o=projs[i];if(o.type!=='rod')continue;updRod(o,dt);if(o.done){scene.remove(o.mesh);projs.splice(i,1);}}};}
function updRod(o,dt){o.t+=dt;const p=o.pos,h=p.y;
 if(o.phase==='deorbit'){o.vel.y-=900*dt;for(let k=0;k<2;k++)fire.spawn(_t.copy(p).add(V3(0,4,0)),rnd(2),20,rnd(2),0.2,1.5,0,0.7,0.8,1,1);if(o.vel.y<-3100){o.vel.y=-3100;o.phase='fall';}}
 else{o.vel.y-=G*dt;const rho=1.225*Math.exp(-h/7200);const sp=o.vel.length();o.vel.multiplyScalar(1-Math.min(0.05,rho*sp*0.0000012*dt));
  const q=rho*sp*sp*sp*1e-9;const k=clamp(q*0.12,0,1);o.sh.material.opacity=k*0.9;o.sh.scale.set(1.2+k*2.5,5+k*14,1.2+k*2.5);o.rodM.emissiveIntensity=k*2;
  if(k>0.05){for(let j=0;j<3;j++)fire.spawn(_t.copy(p).addScaledVector(o.vel,-0.004*j),rnd(3),rnd(3),rnd(3),0.6,3+k*6,10,1,0.65+Math.random()*0.2,0.3,k,0,0,1,0.2,0.05);smoke.spawn(_t.copy(p).addScaledVector(o.vel,-0.01),rnd(2),rnd(2),rnd(2),8,3,12,0.9,0.85,0.8,0.25*k,0.02,0);}
  if(!o.shriek&&h<60000){o.shriek=true;play3D('plasma',p.clone(),1.4,1.3,3000);}}
 p.addScaledVector(o.vel,dt);o.mesh.position.copy(p);o.mesh.quaternion.setFromUnitVectors(V3(0,1,0),_t.copy(o.vel).normalize().negate());o.mach=o.vel.length()/295;
 const gh=groundAt(p.x,p.z).h;if(p.y<=gh+2){o.done=true;rodImpact(p.clone().setY(gh),o.vel.length());if(camFollow===o)camFollow=null;}}
const ROD_RING=new THREE.MeshBasicMaterial({color:0xfff2dd,transparent:true,opacity:0.6,side:THREE.DoubleSide,depthWrite:false});
function rodImpact(p,sp){if(RS)RS.iv={p:p.clone(),t:7,a:0.6};const E=0.5*2700*sp*sp;msg('KINETIC IMPACT  '+(E/4.184e9).toFixed(1)+' t TNT eq.  @ Mach '+(sp/340).toFixed(1),3);
 explosion(p,7);for(let k=0;k<60;k++)smoke.spawn(_t.copy(p).add(V3(rnd(40),5,rnd(40))),rnd(120),40+Math.random()*160,rnd(120),12,30,50,0.55,0.5,0.45,0.75,0.1,0.6);
 for(let k=0;k<80;k++)fire.spawn(p,rnd(250),60+Math.random()*250,rnd(250),1.5+Math.random(),3,2,1,0.7,0.3,1,9.8);
 const ring=new THREE.Mesh(new THREE.RingGeometry(0.9,1,64).rotateX(-Math.PI/2),ROD_RING.clone());ring.position.copy(p).setY(p.y+2);scene.add(ring);let rt=0;const rr=()=>{rt+=0.016;ring.scale.setScalar(20+rt*900);ring.material.opacity=Math.max(0,0.6-rt*0.5);if(rt<1.2)requestAnimationFrame(rr);else scene.remove(ring);};rr();
 const cr=new THREE.Mesh(new THREE.CircleGeometry(38,40).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a241e,roughness:1,transparent:true,opacity:0.92,polygonOffset:true,polygonOffsetFactor:-4}));cr.position.copy(p).setY(p.y+0.3);scene.add(cr);
 shake=Math.max(shake,2.5);play3D('boom',p.clone(),1.6,0.7,2000);play3D('explosion',p.clone(),1.6,0.6,2000);play3D('debris',p.clone(),1,0.9,800);
 if(typeof BLD!=='undefined'){for(const b of BLD){const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<350)damageBuilding(b,d<120?1:0.6*(1-d/350)+0.2,'rod');}if(Math.hypot(p.x-NYC.x,p.z-NYC.z)<8000)play3D('collapse',p.clone(),1.3,0.9,2500);}
 for(const t of targets){if(t.alive&&t.pos.distanceTo(p)<300)killTarget(t,true);}}
// targeting camera from orbit
{const _uc=updCamera;updCamera=function(dt){_uc(dt);if(!RS||!player||player.kind!=='rods')return;RS.sat.position.x+=dt*25;RS.sat.rotation.y+=dt*0.02;
 if(RS.iv&&RS.iv.t>0){RS.iv.t-=dt;RS.el.style.display='none';if(camera.fov!==55){camera.fov=55;camera.updateProjectionMatrix();}camera.up.set(0,1,0);const a=RS.iv.a+=dt*0.05;const q=RS.iv.p;camera.position.set(q.x+Math.sin(a)*2600,q.y+700,q.z+Math.cos(a)*2600);camera.lookAt(q.x,q.y+150,q.z);return;}
 if(camFollow&&camFollow.type==='rod'&&!GUIDE.nose&&!blastCam){RS.el.style.display='none';if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}camera.up.set(0,1,0);const o=camFollow,d=_t.copy(o.vel).normalize();const sd=V3(d.z,0,-d.x).normalize();
  camera.position.copy(o.pos).addScaledVector(d,-22).addScaledVector(sd,5).add(V3(0,3,0));camera.lookAt(o.pos.x+d.x*30,o.pos.y+d.y*30,o.pos.z+d.z*30);return;}
 if(camFollow&&!blastCam){RS.el.style.display='none';if(camera.fov!==RS.fov0){camera.fov=RS.fov0;camera.updateProjectionMatrix();}camera.up.set(0,1,0);return;}if(camMode===1||RS.inspect){RS.el.style.display='none';const F=__milsim.FL||{yaw:0.8,pitch:0.2,zoom:1};const yw=RS.inspect?RS.inspect[0]:F.yaw,pt=RS.inspect?RS.inspect[1]:F.pitch,R=(RS.inspect?RS.inspect[2]:1)*28*(F.zoom||1);
  if(camera.fov!==40){camera.fov=40;camera.updateProjectionMatrix();}camera.up.set(0,1,0);const c=RS.sat.position;camera.position.set(c.x+Math.sin(yw)*Math.cos(pt)*R,c.y+Math.sin(pt)*R,c.z+Math.cos(yw)*Math.cos(pt)*R);camera.lookAt(c.x,c.y-2.5,c.z);return;}
 RS.el.style.display='block';
 const s=GUIDE.stick;const ix=clamp((inp.roll||0)+(s.r||0),-1,1),iy=clamp((inp.pitch||0)+(s.p||0),-1,1);const zoom=(window.__milsim.FL&&__milsim.FL.zoom)||1;const span=6000*zoom;
 RS.aim.x+=ix*span*0.6*dt;RS.aim.z-=iy*span*0.6*dt;RS.aim.y=groundAt(RS.aim.x,RS.aim.z).h;
 const fov=clamp(2*Math.atan(span/2/(ROD_ALT))*180/Math.PI,0.6,40);camera.fov=fov;camera.updateProjectionMatrix();camera.up.set(0,0,-1);camera.position.copy(RS.sat.position).add(V3(0,-8,0));camera.lookAt(RS.aim);
 $('rodT').textContent=`KE-6 ORBITAL PLATFORM   ALT ${(RS.sat.position.y/1000).toFixed(0)} km   RODS ${player.ammo.ROD}/6${RS.cool>0?'  CYCLING':''}\nAIM ${(RS.aim.x/1000).toFixed(1)}, ${(RS.aim.z/1000).toFixed(1)} km   SPAN ${(span/1000).toFixed(1)} km\nPinch to zoom - FIRE to drop`;};}
{const _bm=buildMenu;buildMenu=function(){_bm();const g=$('menu').querySelector('.grid');if(!g||g.querySelector('[data-k="rods"]'))return;};}
try{window.__milsim.cam=camera;}catch(e){}
try{window.__milsim.spawn=spawn;}catch(e){}try{window.__milsim.fireWeapon=fireWeapon;}catch(e){}
{const b=$('bFire');if(b)b.addEventListener('pointerdown',()=>{if(player&&player.kind==='rods')fireWeapon(player);});}
