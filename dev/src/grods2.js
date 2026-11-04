//GRODS2 – high-detail Rods from God: machined tungsten penetrators, detailed KE-6 bus, bow-shock re-entry, layered impact + sound
const ROD2=(()=>{const T=THREE,c={};
 function cv(w,h,f){const e=document.createElement('canvas');e.width=w;e.height=h;f(e.getContext('2d'),w,h);const t=new T.CanvasTexture(e);t.anisotropy=8;t.colorSpace=T.SRGBColorSpace;return t;}
 // brushed tungsten skin: longitudinal brushing, machined bands, stencils, heat-tint gradient near the nose
 c.rodMap=cv(512,2048,(x,W,H)=>{x.fillStyle='#7d8288';x.fillRect(0,0,W,H);for(let i=0;i<5000;i++){const g=110+Math.random()*40|0;x.fillStyle=`rgba(${g},${g+3},${g+6},0.12)`;x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,30+Math.random()*200);}
  const hg=x.createLinearGradient(0,0,0,H*0.25);hg.addColorStop(0,'rgba(60,40,90,0.55)');hg.addColorStop(0.4,'rgba(150,110,50,0.35)');hg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=hg;x.fillRect(0,0,W,H*0.25);
  for(const v of[0.18,0.42,0.66,0.86]){x.fillStyle='rgba(20,22,26,0.7)';x.fillRect(0,v*H,W,5);x.fillStyle='rgba(255,255,255,0.25)';x.fillRect(0,v*H+5,W,2);}
  x.save();x.translate(W*0.5,H*0.55);x.rotate(Math.PI/2);x.fillStyle='rgba(15,15,18,0.85)';x.font='bold 46px monospace';x.textAlign='center';x.fillText('KE-6 PENETRATOR  W-Ni-Fe  LOT 0417',0,0);x.font='30px monospace';x.fillText('USSF  NSN 1340-01-662-0912   DO NOT HANDLE WITHOUT GROUND STRAP',0,48);x.restore();
  x.fillStyle='rgba(255,200,0,0.9)';x.fillRect(0,H*0.92,W,26);x.fillStyle='#111';for(let u=0;u<W;u+=40){x.beginPath();x.moveTo(u,H*0.92);x.lineTo(u+20,H*0.92);x.lineTo(u+6,H*0.92+26);x.lineTo(u-14,H*0.92+26);x.fill();}});
 c.rodRough=cv(64,512,(x,W,H)=>{x.fillStyle='#4a4a4a';x.fillRect(0,0,W,H);for(let i=0;i<400;i++){x.fillStyle=`rgba(${Math.random()<.5?0:255},0,0,0.05)`;x.fillRect(0,Math.random()*H,W,2);}});
 // MLI with crinkle normal map
 c.mliN=cv(512,512,(x,W,H)=>{x.fillStyle='rgb(128,128,255)';x.fillRect(0,0,W,H);for(let i=0;i<900;i++){const a=Math.random()*6.28,l=10+Math.random()*60,px=Math.random()*W,py=Math.random()*H;x.strokeStyle=`rgba(${128+Math.cos(a)*90|0},${128+Math.sin(a)*90|0},255,0.5)`;x.lineWidth=1+Math.random()*3;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a+1.57)*l,py+Math.sin(a+1.57)*l);x.stroke();}});
 c.mliN.colorSpace=T.NoColorSpace;c.mliN.wrapS=c.mliN.wrapT=T.RepeatWrapping;
 c.cell=cv(512,512,(x,W,H)=>{x.fillStyle='#0b1430';x.fillRect(0,0,W,H);const n=8;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const px=i*W/n+3,py=j*H/n+3,s=W/n-6;const g=x.createLinearGradient(px,py,px+s,py+s);g.addColorStop(0,'#1d3570');g.addColorStop(1,'#0a1638');x.fillStyle=g;x.fillRect(px,py,s,s);x.strokeStyle='rgba(200,210,230,0.55)';x.lineWidth=1;for(let k=1;k<6;k++){x.beginPath();x.moveTo(px,py+k*s/6);x.lineTo(px+s,py+k*s/6);x.stroke();}x.lineWidth=2.5;x.beginPath();x.moveTo(px+s/3,py);x.lineTo(px+s/3,py+s);x.moveTo(px+2*s/3,py);x.lineTo(px+2*s/3,py+s);x.stroke();x.fillStyle='rgba(230,230,240,0.8)';x.fillRect(px,py,s,2);}});
 c.cell.wrapS=c.cell.wrapT=T.RepeatWrapping;
 const rodM=()=>new T.MeshPhysicalMaterial({map:c.rodMap,roughnessMap:c.rodRough,color:0xffffff,metalness:1,roughness:0.32,clearcoat:0.2,emissive:0xff5a1a,emissiveIntensity:0});
 const ccM=new T.MeshStandardMaterial({color:0x1b1b1d,roughness:0.85,metalness:0.1,emissive:0xff7a30,emissiveIntensity:0});
 // penetrator: 6.1 m x 0.30 m, ogive carbon-carbon tip, machined body, flared boat-tail with 4 strakes
 function rod(){const g=new T.Group(),m=rodM();const P=[];const L=6.1,R=0.15;
  P.push(new T.Vector2(0.001,-L/2-0.0));P.push(new T.Vector2(R*0.92,-L/2+0.02));P.push(new T.Vector2(R*1.18,-L/2+0.32));P.push(new T.Vector2(R*1.18,-L/2+0.40));P.push(new T.Vector2(R,-L/2+0.62));
  for(let y=-L/2+0.7;y<L/2-1.0;y+=0.6){P.push(new T.Vector2(R,y));P.push(new T.Vector2(R*0.97,y+0.02));P.push(new T.Vector2(R,y+0.04));}
  P.push(new T.Vector2(R,L/2-1.0));const tipL=1.0;for(let i=1;i<=24;i++){const t=i/24;P.push(new T.Vector2(Math.max(0.001,R*Math.sqrt(1-t*t)*(1-0.15*t)),L/2-1.0+tipL*t*0.7));}
  const body=new T.Mesh(new T.LatheGeometry(P,48),m);g.add(body);
  const tipP=[];for(let i=0;i<=20;i++){const t=i/20;tipP.push(new T.Vector2(Math.max(0.0005,0.075*Math.cos(t*1.57)),L/2-0.3+0.42*Math.sin(t*1.57)));}
  const tip=new T.Mesh(new T.LatheGeometry(tipP,32),ccM.clone());g.add(tip);
  const fm=new T.MeshPhysicalMaterial({color:0x8a8e94,metalness:1,roughness:0.35});
  for(let f=0;f<4;f++){const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(0.95,0);sh.lineTo(0.95,0.20);sh.lineTo(0.15,0.10);sh.lineTo(0,0.10);const ge=new T.ExtrudeGeometry(sh,{depth:0.016,bevelEnabled:true,bevelSize:0.004,bevelThickness:0.004,bevelSegments:2});const fn=new T.Mesh(ge,fm);
   const pv=new T.Group();pv.rotation.y=f*Math.PI/2+Math.PI/4;fn.rotation.z=Math.PI/2;fn.position.set(R*1.15,-L/2+0.15,-0.008);pv.add(fn);g.add(pv);}
  g.userData={m,tip:tip.material};g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
 // extra bus detail
 function detail(sat){const al=new T.MeshPhysicalMaterial({color:0xb4b8bc,metalness:1,roughness:0.25});const blk=new T.MeshStandardMaterial({color:0x0c0c0e,roughness:0.6});
  const kap=new T.MeshPhysicalMaterial({color:0xd8a040,metalness:1,roughness:0.28,normalMap:c.mliN,normalScale:new T.Vector2(0.9,0.9),clearcoat:0.3});
  sat.traverse(o=>{if(o.isMesh&&o.material&&o.material.map&&o.material.metalness>0.85&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width>2.5&&o.geometry.parameters.height>3){o.material=kap;}
   if(o.isMesh&&o.material&&o.material.map&&o.geometry.type==='BoxGeometry'&&Math.abs(o.geometry.parameters.width-3.4)<0.01){o.material=new T.MeshPhysicalMaterial({map:c.cell,metalness:0.3,roughness:0.15,clearcoat:1,clearcoatRoughness:0.05,side:T.DoubleSide});o.material.map.repeat.set(2,1.4);}});
  const ad=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);sat.add(o);return o;};
  // MLI seams + velcro tabs
  for(const s of[-1,1]){for(const y of[-0.8,0.8])ad(new T.BoxGeometry(0.02,0.04,2.62),blk,s*1.31,y,0);ad(new T.BoxGeometry(2.62,0.04,0.02),blk,0,0.4*s,s*1.31);}
  // HGA feed struts + subreflector
  for(let i=0;i<3;i++){const a=i*2.09;const st=ad(new T.CylinderGeometry(0.015,0.015,0.85,6),al,Math.cos(a)*0.35,2.85,0.6+Math.sin(a)*0.35);st.rotation.set(Math.sin(a)*0.4,0,-Math.cos(a)*0.4);}
  ad(new T.SphereGeometry(0.12,16,8,0,6.29,0,1.2),al,0,3.25,0.6).rotation.x=Math.PI;
  // RCS quads with nozzle bells
  for(const [x,z] of[[1.3,1.3],[-1.3,1.3],[1.3,-1.3],[-1.3,-1.3]]){const q=ad(new T.BoxGeometry(0.22,0.22,0.22),al,x,0,z);for(const d of[[1,0,0],[0,1,0],[0,-1,0],[0,0,1]]){const n=new T.Mesh(new T.CylinderGeometry(0.025,0.06,0.12,12,1,true),blk);n.position.set(d[0]*0.15*Math.sign(x),d[1]*0.15,d[2]*0.15*Math.sign(z));n.lookAt(n.position.clone().multiplyScalar(5));n.rotateX(Math.PI/2);q.add(n);}}
  // main deorbit engine + propellant tanks, GPS patch antennas, laser crosslink head
  ad(new T.CylinderGeometry(0.12,0.32,0.55,24,1,true),blk,0,2.0,-0.6);
  for(const x of[-0.6,0.6])ad(new T.SphereGeometry(0.42,24,16),al,x,1.2,-1.36).scale.set(1,1,0.25);
  for(const x of[-0.9,-0.3,0.3,0.9])ad(new T.BoxGeometry(0.18,0.02,0.18),new T.MeshStandardMaterial({color:0xece6d0,roughness:0.7}),x,1.81,0.9);
  const lc=ad(new T.CylinderGeometry(0.14,0.14,0.3,20),al,-0.8,2.0,-0.3);ad(new T.CircleGeometry(0.11,20),new T.MeshPhysicalMaterial({color:0x102040,metalness:0.2,roughness:0,clearcoat:1,iridescence:1}),-0.8,2.151,-0.3).rotation.x=-Math.PI/2;
  // magazine truss
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;for(const y of[-2.2,-4.2,-6.2]){const b=ad(new T.CylinderGeometry(0.025,0.025,1.0,6),al,Math.cos(a)*1.0,y-1,Math.sin(a)*1.0);b.rotation.set(0.5*Math.sin(a),0,0.5*Math.cos(a));}}
  // replace stowed rods with detailed penetrators
  const rs=sat.userData.rods;if(rs)rs.forEach((r,i)=>{const n=rod();n.position.copy(r.position);n.rotation.x=Math.PI;r.parent.add(n);r.parent.remove(r);rs[i]=n;});
  sat.traverse(o=>{if(o.isMesh)o.castShadow=true;});return sat;}
 // bow-shock / plasma sheath shader: fresnel, hot stagnation, flickering wake
 const shockMat=()=>new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,uniforms:{k:{value:0},t:{value:0}},
  vertexShader:'varying vec3 vN,vV;varying float vY;void main(){vY=position.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float k,t;varying vec3 vN,vV;varying float vY;float h(float n){return fract(sin(n)*43758.5);}void main(){float f=pow(1.-abs(dot(vN,vV)),2.2);float ny=clamp(vY*.5+.5,0.,1.);float fl=.8+.2*h(floor(t*40.)+vY*13.);vec3 c=mix(vec3(1.,.35,.08),vec3(1.,.95,.85),ny*ny);c=mix(c,vec3(.55,.6,1.),smoothstep(.7,1.,ny)*.35);float a=k*(f*.9+.25*ny)*fl*smoothstep(0.,.25,ny);gl_FragColor=vec4(c*a*1.6,a);}'});
 return{rod,detail,shockMat};})();
{const _rs=rodSat;rodSat=function(){return ROD2.detail(_rs());};}
// detailed fired penetrator + shader sheath
{const _fw=fireWeapon;fireWeapon=function(v){const n0=projs.length;const r=_fw(v);if(!(v&&v.kind==='rods')||!r)return r;const o=projs.slice(n0).find(q=>q.type==='rod')||projs.filter(q=>q.type==='rod').pop();if(!o||o._d2)return r;o._d2=1;
 const m=o.mesh;while(m.children.length)m.remove(m.children[0]);const rd=ROD2.rod();m.add(rd);o.rodM=rd.userData.m;o.tipM=rd.userData.tip;
 const sm=ROD2.shockMat();const sh=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),sm);sh.position.y=1.5;m.add(sh);o.sh=sh;o.shM=sm;
 const wk=new THREE.Mesh(new THREE.ConeGeometry(1,1,32,1,true),ROD2.shockMat());wk.rotation.x=Math.PI;m.add(wk);o.wk=wk;
 o.lt=new THREE.PointLight(0xffa060,0,4000,1.5);m.add(o.lt);
 play3D('missile',null,0.35,1.4);setTimeout(()=>play3D('rocket',null,0.3,1.8),150);return r;};}
{const _ur=updRod;updRod=function(o,dt){_ur(o,dt);if(!o.shM)return;const h=o.pos.y,sp=o.vel.length(),rho=1.225*Math.exp(-h/7200);const k=clamp(rho*sp*sp*sp*1.2e-10,0,1);
 o.shM.uniforms.k.value=k;o.shM.uniforms.t.value+=dt;o.sh.scale.set(0.5+k*1.4,2.2+k*3.5,0.5+k*1.4);o.sh.material.opacity=1;
 o.wk.material.uniforms.k.value=k*0.8;o.wk.material.uniforms.t.value+=dt;const wl=6+k*120;o.wk.scale.set(0.6+k*3,wl,0.6+k*3);o.wk.position.y=-3-wl/2;
 o.rodM.emissiveIntensity=k*1.4;if(o.tipM)o.tipM.emissiveIntensity=k*4;o.lt.intensity=k*k*6e5;
 if(k>0.2&&Math.random()<k*0.6)smoke.spawn(_t.copy(o.pos).addScaledVector(o.vel,-0.05-Math.random()*0.1),rnd(4),rnd(4),rnd(4),5,4,20,0.95,0.9,0.85,0.18*k,0.01,0);
 if(!o.boomT&&h<12000){o.boomT=1;const dc=camera.position.distanceTo(o.pos);setTimeout(()=>{play3D('boom',null,0.9,1.25);setTimeout(()=>play3D('boom',null,0.7,1.1),120);},Math.min(6000,dc/340*1000*0.25));}};}
// layered impact: flash light, condensation dome, ejecta curtain, raised-rim crater, rising column, delayed ground roll
{const _ri=rodImpact;rodImpact=function(p,sp){_ri(p,sp);const T=THREE;
 const L=new T.PointLight(0xfff0d0,4e7,30000,1.6);L.position.copy(p).setY(p.y+60);scene.add(L);
 const dome=new T.Mesh(new T.SphereGeometry(1,48,24,0,6.29,0,1.57),new T.MeshStandardMaterial({color:0xf4f2ee,transparent:true,opacity:0.5,roughness:1,depthWrite:false}));dome.position.copy(p);scene.add(dome);
 const ej=new T.Mesh(new T.CylinderGeometry(1,0.35,1,48,6,true),new T.MeshStandardMaterial({color:0x6b5c4a,transparent:true,opacity:0.85,roughness:1,side:T.DoubleSide,depthWrite:false}));ej.position.copy(p);scene.add(ej);
 const rimG=new T.RingGeometry(10,70,96,6).rotateX(-Math.PI/2);const pa=rimG.attributes.position;for(let i=0;i<pa.count;i++){const r=Math.hypot(pa.getX(i),pa.getZ(i));const u=(r-10)/60;pa.setY(i,(u<0.35?-14*(1-u/0.35)+9*(u/0.35):9*Math.exp(-(u-0.35)*4))*(0.85+Math.random()*0.3));}rimG.computeVertexNormals();
 const rim=new T.Mesh(rimG,new T.MeshStandardMaterial({color:0x3a3027,roughness:1,flatShading:true}));rim.position.copy(p).setY(p.y+0.4);rim.receiveShadow=true;scene.add(rim);
 const pit=new T.Mesh(new T.CircleGeometry(10.5,48).rotateX(-Math.PI/2),new T.MeshStandardMaterial({color:0x140f0b,roughness:1,emissive:0xff5010,emissiveIntensity:1.5}));pit.position.copy(p).setY(p.y-13);scene.add(pit);
 const scorch=new T.Mesh(new T.CircleGeometry(220,64).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:new T.CanvasTexture((()=>{const e=document.createElement('canvas');e.width=e.height=256;const x=e.getContext('2d');const g=x.createRadialGradient(128,128,10,128,128,128);g.addColorStop(0,'rgba(20,15,10,0.95)');g.addColorStop(0.5,'rgba(50,40,30,0.6)');g.addColorStop(1,'rgba(60,50,40,0)');x.fillStyle=g;x.fillRect(0,0,256,256);for(let i=0;i<70;i++){x.strokeStyle='rgba(30,22,15,0.5)';x.lineWidth=1+Math.random()*3;const a=Math.random()*6.28;x.beginPath();x.moveTo(128,128);x.lineTo(128+Math.cos(a)*(60+Math.random()*68),128+Math.sin(a)*(60+Math.random()*68));x.stroke();}return e;})()),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}));scorch.position.copy(p).setY(p.y+0.2);scene.add(scorch);
 const chunks=[];const cm=new T.MeshStandardMaterial({color:0x4a4038,roughness:1,flatShading:true});for(let i=0;i<40;i++){const ch=new T.Mesh(new T.DodecahedronGeometry(1+Math.random()*3,0),cm);ch.position.copy(p).setY(p.y+5);const a=Math.random()*6.28,s=60+Math.random()*180;ch.userData.v=V3(Math.cos(a)*s,120+Math.random()*220,Math.sin(a)*s);scene.add(ch);chunks.push(ch);}
 for(let k=0;k<40;k++)smoke.spawn(_t.copy(p).add(V3(rnd(30),20+k*12,rnd(30))),rnd(15),25+Math.random()*30,rnd(15),30,40,90,0.42,0.37,0.32,0.8,0.05,0.4);
 const dc=camera.position.distanceTo(p);setTimeout(()=>{play3D('collapse',null,0.9,0.5);play3D('debris',null,0.8,0.6);},Math.min(5000,dc/1500*1000));
 let t=0;const st=()=>{const dt=0.016;t+=dt;L.intensity=4e7*Math.exp(-t*5);dome.scale.set(30+t*1400,(30+t*1400)*0.55,30+t*1400);dome.material.opacity=Math.max(0,0.5-t*0.9);
  ej.scale.set(15+t*160,Math.min(380,40+t*700)*(t<1.5?1:Math.max(0,1-(t-1.5)/3)),15+t*160);ej.position.y=p.y+ej.scale.y/2;ej.material.opacity=Math.max(0,0.85-t*0.18);pit.material.emissiveIntensity=Math.max(0,1.5-t*0.12);
  for(const ch of chunks){if(ch.userData.done)continue;ch.userData.v.y-=9.81*dt;ch.position.addScaledVector(ch.userData.v,dt);ch.rotation.x+=dt*3;ch.rotation.z+=dt*2;const gh=groundAt(ch.position.x,ch.position.z).h;if(ch.position.y<gh+1){ch.position.y=gh+1;ch.userData.done=1;smoke.spawn(ch.position.clone(),rnd(5),8,rnd(5),5,8,15,0.5,0.45,0.4,0.6,0.1,0.5);}}
  if(t<6)requestAnimationFrame(st);else{scene.remove(L,dome,ej);}};st();};}
try{window.__milsim.fireWeapon=fireWeapon;}catch(e){}try{window.__milsim.spawn=spawn;}catch(e){}
