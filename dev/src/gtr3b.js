var UFO_TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
//GTR3B-BEGIN  TR-3B "Astra": RUMORED / UNCONFIRMED black triangle (refs/tr3b/sources.txt). 40 m equilateral (reports range ~20-183 m). Nose -Z, metres.
// gmissiles-style canvas PBR: albedo + roughness + normal-from-height (panel seams, fasteners, RAM tiles, weathering); env-reactive MeshPhysical + real point lights.
const TR3B=(()=>{const T=THREE,PI=Math.PI,S=40,R=S/Math.sqrt(3),Hc=3.2,Hb=1.6;
const C=[0,1,2].map(i=>{const a=-PI/2+i*2*PI/3;return[Math.cos(a)*R,Math.sin(a)*R];});
function cvs(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const tx=(c,s)=>{const t=new T.CanvasTexture(c);t.colorSpace=s?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=8;return t;};
let SK=null;function skin(){if(SK)return SK;const W=2048,PX=x=>(x/(2*R)+0.5)*W,PZ=z=>(z/(2*R)+0.5)*W;
 const ht=cvs(W,W,x=>{x.fillStyle='#808080';x.fillRect(0,0,W,W);x.strokeStyle='#4c4c4c';x.lineWidth=3;
  for(const k of[0.25,0.45,0.62,0.78,0.9]){x.beginPath();C.forEach(([a,b],i)=>{i?x.lineTo(PX(a*k),PZ(b*k)):x.moveTo(PX(a*k),PZ(b*k));});x.closePath();x.stroke();}
  for(let i=0;i<3;i++){const[a,b]=C[i];const n=40;x.beginPath();for(let j=0;j<=n;j++){const u=j/n,o=(j%2?6:-6);x.lineTo(PX(a*u)+o*(-b/R),PZ(b*u)+o*(a/R));}x.stroke();
   const[c2,d2]=C[(i+1)%3];x.beginPath();for(let j=0;j<=n;j++){const u=j/n;x.lineTo(PX((a+c2)/2*u)+(j%2?5:-5),PZ((b+d2)/2*u));}x.stroke();}
  x.fillStyle='#555';for(const k of[0.45,0.78])for(let i=0;i<3;i++){const[a,b]=C[i],[c2,d2]=C[(i+1)%3];for(let u=0;u<1;u+=0.006){x.beginPath();x.arc(PX((a+(c2-a)*u)*k*0.97),PZ((b+(d2-b)*u)*k*0.97),1.6,0,7);x.fill();}}
  for(let i=0;i<160;i++){x.strokeStyle='rgba(70,70,70,0.8)';x.lineWidth=2;const s=20+Math.random()*80;x.strokeRect(Math.random()*W,Math.random()*W,s,s*0.6);}});
 const col=cvs(W,W,x=>{x.fillStyle='#16171a';x.fillRect(0,0,W,W);
  for(let i=0;i<4000;i++){x.fillStyle=`rgba(${Math.random()<0.5?'0,0,0':'70,74,80'},${Math.random()*0.05})`;x.fillRect(Math.random()*W,Math.random()*W,4+Math.random()*60,2+Math.random()*30);}
  for(let i=0;i<90;i++){x.fillStyle=`rgba(${20+Math.random()*14|0},${21+Math.random()*14|0},${25+Math.random()*14|0},0.5)`;x.fillRect(Math.random()*W,Math.random()*W,20+Math.random()*90,20+Math.random()*90);}
  x.globalAlpha=0.3;x.drawImage(ht,0,0);x.globalAlpha=1;
  const g=x.createRadialGradient(W/2,W/2,0,W/2,W/2,W*0.22);g.addColorStop(0,'rgba(70,40,30,0.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,W);
  for(let i=0;i<600;i++){x.fillStyle=`rgba(10,10,12,${Math.random()*0.06})`;x.fillRect(Math.random()*W,Math.random()*W,1+Math.random()*3,40+Math.random()*200);}
  x.fillStyle='rgba(120,124,130,0.5)';x.font='bold 26px Arial';x.textAlign='center';x.fillText('NO STEP',W/2,W*0.36);x.fillText('DANGER  FIELD ZONE',W/2,W*0.6);});
 const rg=cvs(1024,1024,(x,w,h)=>{x.fillStyle='#d0d0d0';x.fillRect(0,0,w,h);x.globalAlpha=0.4;x.drawImage(ht,0,0,w,h);x.globalAlpha=1;for(let i=0;i<500;i++){const v=170+Math.random()*80|0;x.fillStyle=`rgba(${v},${v},${v},0.3)`;x.fillRect(Math.random()*w,Math.random()*h,8+Math.random()*40,6+Math.random()*30);}});
 const nm=(()=>{const w=1024;const s=cvs(w,w,x=>x.drawImage(ht,0,0,w,w)).getContext('2d').getImageData(0,0,w,w).data;const o=cvs(w,w,()=>{}),ox=o.getContext('2d'),id=ox.createImageData(w,w);const H=(i,j)=>s[(((j+w)%w)*w+((i+w)%w))*4]/255;
  for(let j=0;j<w;j++)for(let i=0;i<w;i++){const dx=(H(i-1,j)-H(i+1,j))*2,dy=(H(i,j-1)-H(i,j+1))*2,l=Math.hypot(dx,dy,1),k=(j*w+i)*4;id.data[k]=(dx/l*.5+.5)*255;id.data[k+1]=(dy/l*.5+.5)*255;id.data[k+2]=(1/l*.5+.5)*255;id.data[k+3]=255;}ox.putImageData(id,0,0);return o;})();
 return SK={map:tx(col,1),rough:tx(rg,0),nrm:tx(nm,0)};}
let M=null;function mats(){if(M)return M;const s=skin();M={
 ram:new T.MeshPhysicalMaterial({color:0xffffff,map:s.map,roughnessMap:s.rough,normalMap:s.nrm,normalScale:new T.Vector2(0.5,0.5),roughness:0.85,metalness:0.25,clearcoat:0.15,clearcoatRoughness:0.55,envMapIntensity:0.8,flatShading:true,side:T.DoubleSide}),
 edge:new T.MeshStandardMaterial({color:0x2a2c30,roughness:0.5,metalness:0.6}),dark:new T.MeshStandardMaterial({color:0x050506,roughness:0.95,metalness:0.1}),
 lamp:new T.MeshStandardMaterial({color:0xfff6dd,emissive:0xfff0c8,emissiveIntensity:3,roughness:0.2}),lens:new T.MeshPhysicalMaterial({color:0x111111,roughness:0.05,clearcoat:1,transparent:true,opacity:0.5}),
 core:new T.MeshStandardMaterial({color:0xff5a1e,emissive:0xff4a10,emissiveIntensity:2.5,roughness:0.4}),
 ring:new T.MeshBasicMaterial({color:0x8fb8ff,transparent:true,opacity:0.6,blending:T.AdditiveBlending,depthWrite:false}),
 halo:new T.MeshBasicMaterial({color:0xff6a2a,transparent:true,opacity:0.35,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})};return M;}
function hull(){const pos=[],uv=[];const P=(x,y,z)=>{pos.push(x,y,z);uv.push(x/(2*R)+0.5,z/(2*R)+0.5);};const tri=(a,b,c)=>{P(...a);P(...b);P(...c);};
 const top=[0,Hc,0],bot=[0,-Hb,0],k=0.42,ring=C.map(([x,z])=>[x*k,Hc*0.62,z*k]),bring=C.map(([x,z])=>[x*0.5,-Hb*0.55,z*0.5]),edge=C.map(([x,z])=>[x,0,z]);
 for(let i=0;i<3;i++){const j=(i+1)%3;const m=[(C[i][0]+C[j][0])/2,0.25,(C[i][1]+C[j][1])/2],mlo=[m[0],-0.2,m[2]];const mr=[(ring[i][0]+ring[j][0])/2*1.05,Hc*0.7,(ring[i][2]+ring[j][2])/2*1.05];
  tri(top,ring[j],mr);tri(top,mr,ring[i]);tri(ring[i],mr,edge[i]);tri(mr,m,edge[i]);tri(mr,ring[j],m);tri(ring[j],edge[j],m);
  const mb=[(bring[i][0]+bring[j][0])/2,-Hb*0.6,(bring[i][2]+bring[j][2])/2];tri(bot,mb,bring[j]);tri(bot,bring[i],mb);tri(bring[i],edge[i],mb);tri(mb,edge[i],mlo);tri(mb,mlo,edge[j]);tri(mb,edge[j],bring[j]);
  tri(edge[i],m,mlo);tri(edge[j],mlo,m);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return new T.Mesh(g,mats().ram);}
let GT=null;function glowTex(){if(GT)return GT;GT=tx(cvs(128,128,x=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.2,'rgba(255,240,210,0.6)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);}),1);return GT;}
function shimTex(){const t=tx(cvs(256,256,x=>{for(let i=0;i<900;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.5})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*2,8+Math.random()*30);}}),0);t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
function build(){const G=new T.Group(),Mt=mats();G.add(hull());const A={lights:[]};
 for(let i=0;i<3;i++){const a=C[i],b=C[(i+1)%3],n=26,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);const sh=new T.Shape();sh.moveTo(0,0);for(let j=0;j<n;j++){sh.lineTo((j+0.5)/n*L,0.55);sh.lineTo((j+1)/n*L,0);}sh.lineTo(L,-0.05);sh.lineTo(0,-0.05);
  const ge=new T.ExtrudeGeometry(sh,{depth:0.08,bevelEnabled:false});ge.rotateX(PI/2);const m=new T.Mesh(ge,Mt.edge);m.position.set(a[0],0.04,a[1]);m.rotation.y=-Math.atan2(dz,dx);
  const mid=new T.Vector3((a[0]+b[0])/2,0,(a[1]+b[1])/2),nrm=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),m.rotation.y);if(nrm.dot(mid)<0)m.scale.z=-1;G.add(m);} // serrations point outward
 C.forEach(([x,z])=>{const px=x*0.86,pz=z*0.86;const hs=new T.Mesh(new T.CylinderGeometry(1.25,1.45,0.5,24),Mt.edge);hs.position.set(px,-0.55,pz);G.add(hs);
  const lp=new T.Mesh(new T.SphereGeometry(0.95,24,12,0,2*PI,PI/2,PI/2),Mt.lamp.clone());lp.position.set(px,-0.8,pz);G.add(lp);
  const ln=new T.Mesh(new T.SphereGeometry(1.05,24,12,0,2*PI,PI/2,PI/2),Mt.lens);ln.position.copy(lp.position);G.add(ln);
  const fl=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xfff3d8,blending:T.AdditiveBlending,depthWrite:false,transparent:true}));fl.scale.setScalar(9);fl.position.set(px,-1.2,pz);G.add(fl);
  const pl=UFO_TOUCH?{intensity:0}:new T.PointLight(0xfff0d0,600,140,2);if(pl.isLight){pl.position.set(px,-2,pz);G.add(pl);}A.lights.push({lp,fl,pl});
  const tp=new T.Mesh(new T.CylinderGeometry(0.7,0.9,0.4,20),Mt.dark);tp.position.set(x*0.7,-0.5,z*0.7);G.add(tp);});
 const ring=new T.Mesh(new T.TorusGeometry(6.5,0.45,12,96),Mt.ring);ring.rotation.x=PI/2;ring.position.y=-Hb*0.85;G.add(ring);A.ring=ring;
 const hous=new T.Mesh(new T.TorusGeometry(6.5,0.75,8,96),Mt.dark);hous.rotation.x=PI/2;hous.position.y=-Hb*0.62;hous.scale.z=0.5;G.add(hous);
 const core=new T.Mesh(new T.SphereGeometry(2.6,32,12,0,2*PI,PI/2,PI/2),Mt.core);core.position.y=-Hb*0.95;G.add(core);A.core=core;
 const halo=new T.Mesh(new T.CircleGeometry(9,48),Mt.halo);halo.rotation.x=PI/2;halo.position.y=-Hb*1.15;G.add(halo);A.halo=halo;
 const cpl=new T.PointLight(0xff5a20,900,90,2);cpl.position.y=-5;G.add(cpl);if(UFO_TOUCH)cpl.distance=60;A.cpl=cpl;
 const shim=new T.Mesh(new T.CylinderGeometry(10,15,14,40,1,true),new T.MeshBasicMaterial({map:shimTex(),color:0x9ab0ff,transparent:true,opacity:0.08,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));shim.position.y=-Hb-7;G.add(shim);A.shim=shim;
 const hatch=new T.Mesh(new T.CylinderGeometry(1.6,1.8,0.3,6),Mt.edge);hatch.position.y=Hc-0.05;G.add(hatch);
 G.traverse(o=>{if(o.isMesh&&!(o.material.blending===T.AdditiveBlending)){o.castShadow=true;o.receiveShadow=true;}});G.userData.tr3b=A;A.t=0;A.pw=1;return G;}
function animate(G,dt,st){const A=G.userData.tr3b;if(!A)return;A.t+=dt;const dash=Math.min(1,(st.speed||0)/250);A.pw+=((st.power?1:0)-A.pw)*Math.min(1,dt*2);
 const pulse=0.75+0.25*Math.sin(A.t*6)+0.1*Math.sin(A.t*17.3);
 A.ring.material.opacity=0.55*A.pw*pulse;A.ring.rotation.z+=dt*(3+dash*20);A.ring.material.color.setHSL(0.6-dash*0.06,0.8,0.6+0.1*pulse);
 A.core.material.emissiveIntensity=(1.2+1.6*pulse*(Math.sin(A.t*2.2)>0?1:0.55))*A.pw;A.halo.material.opacity=0.3*A.pw*pulse;A.cpl.intensity=900*A.pw*pulse;
 for(const L of A.lights){const k=(1-dash*0.8)*A.pw;L.lp.material.emissiveIntensity=3*k+0.2;L.fl.material.opacity=k;L.pl.intensity=600*k;L.fl.material.color.setHSL(0.1-dash*0.1,0.3+dash*0.5,0.85);}
 A.shim.material.map.offset.y-=dt*(0.6+dash);A.shim.material.map.offset.x=Math.sin(A.t*1.3)*0.05;A.shim.material.opacity=(0.05+0.04*pulse)*A.pw*(1-dash*0.5);A.shim.rotation.y+=dt*0.4;}
return{build,animate,S,R};})();
window.__tr3b={TR3B};
// ---------------- game hooks (wrap only) ----------------
// ---- shared UFO flight (easy mode): linear stick = direct velocity, fast response, auto-stop on release, no wobble, gentle speed ramp while stick held ----
var UFOFLY=(()=>{const _t=new THREE.Vector3(),_ax=new THREE.Vector3(),_q=new THREE.Quaternion(),_qy=new THREE.Quaternion(),_up=new THREE.Vector3(0,1,0),cl=(a,b,c)=>Math.max(b,Math.min(c,a));
 return function(v,dt,o){const p=v.mesh.position;if(v.hdg==null){v.hdg=v.mesh.rotation.y||0;v.ramp=0;v.tilt=0;v.yr=0;}
  const st=(typeof GUIDE!=='undefined'&&GUIDE.stick)||{};let px=cl((inp.roll||0)+(st.r||0),-1,1),py=cl((inp.pitch||0)+(st.p||0),-1,1);
  const mag=Math.min(1,Math.hypot(px,py));const dz=0.06,m=mag<dz?0:(mag-dz)/(1-dz);
  // gentle ramp: after 1 s near-full stick, speed eases from vmax up to top over ~6 s; releases back down smoothly
  v.ramp=m>0.9?Math.min(1,v.ramp+dt/6):Math.max(0,v.ramp-dt/1.5);const vmax=o.vmax+(o.top-o.vmax)*v.ramp*v.ramp;
  v.yr+=((inp.yaw||0)*1.6-v.yr)*Math.min(1,dt*10);v.hdg-=v.yr*dt;const fx=-Math.sin(v.hdg),fz=-Math.cos(v.hdg);
  _t.set(fx*(-py)-fz*px,0,fz*(-py)+fx*px);if(_t.lengthSq()>1e-6)_t.normalize().multiplyScalar(m*vmax);
  const th=(inp.throttle-0.5)*2,tz=Math.abs(th)<0.08?0:(Math.abs(th)-0.08)/0.92*Math.sign(th);_t.y=tz*o.climb*(1+v.ramp*8);
  const k=m>0||tz?6:4.5;v.vel.lerp(_t,1-Math.exp(-k*dt));if(v.vel.lengthSq()<0.04&&!m&&!tz)v.vel.set(0,0,0);
  p.addScaledVector(v.vel,dt);v.throttle=inp.throttle;v.gload=1;v.stall=false;
  _qy.setFromAxisAngle(_up,v.hdg);
  if(o.tilt){v.tilt+=(cl(v.vel.length()/1500,0,1)*Math.PI/2*v.ramp-v.tilt)*Math.min(1,dt*1.5);const hv=_ax.set(v.vel.x,0,v.vel.z);
   if(v.tilt>0.01&&hv.lengthSq()>1){hv.normalize();_ax.set(hv.z,0,-hv.x);_q.setFromAxisAngle(_ax,-v.tilt);v.mesh.quaternion.copy(_q).multiply(_qy);}else v.mesh.quaternion.copy(_qy);}
  else v.mesh.quaternion.copy(_qy);
  const g=groundAt(p.x,p.z);v.agl=p.y-g.h;v.onGround=false;if(p.y<g.h+o.hover){if(v.vel.y<-120){crash('CRASHED');return;}p.y=g.h+o.hover;if(v.vel.y<0)v.vel.y=0;v.onGround=v.vel.length()<1.5;}
  if(p.y>(v.def.ceil||36000))v.vel.y=Math.min(0,v.vel.y);};})();
// remove any stale UFO meshes from the scene on every vehicle switch (saucer used to stay behind)
{const _sp=spawn;spawn=function(...a){for(const o of [...scene.children])if(o.userData&&o.userData.ufoRoot)scene.remove(o);const r=_sp(...a);if(player&&player.mesh&&player.mesh.userData.ufoRoot&&!player.mesh.parent)scene.add(player.mesh);return r;};}

DEFS.tr3b={name:'TR-3B "Astra" (rumored)',desc:'RUMORED / UNCONFIRMED black triangle. Silent hover, corner lights, red-orange core, claimed plasma "MFD" ring. Reported sizes 20-183 m; modelled 40 m.',cls:'air',thrust:30,vstall:1,vrot:1,dragK:1e-5,ceil:36000,col:0x16171a,weapons:['AAM'],maxMach:9,role:'Experimental',noRho:true,
 stats:{span_m:40,height_m:4.8,engines:'claimed MFD plasma ring + 3 corner thrusters',claimedMach:9,status:'unconfirmed'},bars:{speed:1,agility:1,armor:0.5,firepower:0.3},preview:()=>TR3B.build()};
if(typeof AMMO!=='undefined'&&!AMMO.AAM)DEFS.tr3b.weapons=Object.keys(AMMO).slice(0,1);
if(typeof ENG_CHAR!=='undefined')ENG_CHAR.tr3b={r:0.15,w:0.2,ab:0};
{const _j=jet;jet=function(c,f,kind){if(kind==='tr3b'){const g=TR3B.build();g.userData.flame=null;g.userData.ufoRoot='tr3b';return g;}return _j(c,f,kind);};}
{const _ae=attachExhaust;attachExhaust=function(v){if(v&&v.kind==='tr3b'){if(exhMesh&&exhMesh.parent)exhMesh.parent.remove(exhMesh);exhMesh=null;exhFor=v;return;}return _ae(v);};}
// Hover-and-dash (reported behaviour): level attitude always, no banking. Stick = instant omnidirectional translation; yaw = turn; throttle = vertical (0.5 holds).
// Partial stick = slow silent drift (<=60 m/s); full stick held 0.6 s = sudden dash to ~Mach 8 with sharp angle changes; release = near-instant motionless hover.
{const _ua=updAir,_t=new THREE.Vector3(),_e=new THREE.Euler();const cl=(a,b,c)=>Math.max(b,Math.min(c,a));
 updAir=function(v,dt){if(v.kind!=='tr3b')return _ua(v,dt);UFOFLY(v,dt,{hover:4,vmax:80,top:2400,climb:35,tilt:false});if(!v.alive)return;TR3B.animate(v.mesh,dt,{speed:v.vel.length(),power:true});};}
{const _uc=updCamera,_cp=new THREE.Vector3();updCamera=function(dt){_uc(dt);const v=player;if(!v||v.kind!=='tr3b'||!v.mesh||camFollow||blastCam||camMode!==0||window.__studio||window.__testCam)return;
  _cp.copy(camera.position).sub(v.mesh.position);const d=_cp.length();if(d<95){_cp.multiplyScalar(95/Math.max(d,1e-3));camera.position.copy(v.mesh.position).add(_cp);camera.lookAt(v.mesh.position);}};}
//GTR3B-END
