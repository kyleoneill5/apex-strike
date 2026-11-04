// ===== Realism pass 3: SR-71, flight FX, ship wakes, Poly Haven CC0 textures, NYC bridges/facades/night, taxi lights, time of day =====
// ---- SR-71 Blackbird (32.7 m long, 16.9 m span, matte black, chines, mid-wing nacelles, inward-canted fins) ----
function sr71M(){const g=new THREE.Group();const m=M(0x101113,{roughness:0.92,metalness:0.05,skin:'none'}),md=M(0x101113,{roughness:0.92,metalness:0.05,side:THREE.DoubleSide});
 g.add(fuse([[-17,0],[-16.2,0.25],[-14,0.6],[-11,0.9],[-7,1.1],[-2,1.2],[4,1.15],[10,1.0],[14,0.6],[15.5,0.3]],1.0,0.8,m,24));
 // chines: thin lifting surfaces blending from nose to wing
 const ch=[[0.2,16.8],[1.0,12],[2.2,7],[3.2,3.6],[3.2,-10],[0.6,-14.8]];for(const p of [ch.map(([a,b])=>[a,b-1.5]),mirror(ch.map(([a,b])=>[a,b-1.5]))])g.add(wingX(p,0.12,m));
 // delta wing
 const w=[[3,4],[8.45,-8.8],[8.45,-10.6],[3,-11.5]];g.add(wingX(w,0.16,m));g.add(wingX(mirror(w),0.16,m));
 for(const s of[-1,1]){const nac=fuse([[-9.5,0],[-9,0.55],[-7.5,1.05],[-5,1.25],[6,1.25],[11,1.1],[12.5,1.0]],1,1,m,20);nac.position.set(s*4.9,0,0);g.add(nac);
  const spike=add(g,coneF(0.62,3.2,16),M(0x2a2b2d,{metalness:0.6,roughness:0.5}),s*4.9,0,-10.8);
  const nz=new THREE.Mesh(new THREE.CylinderGeometry(0.95,1.0,1.4,20,1,true).rotateX(Math.PI/2),M(0x3b3530,{metalness:0.8,roughness:0.45,side:THREE.DoubleSide}));nz.position.set(s*4.9,0,13.1);g.add(nz);
  add(g,new THREE.CircleGeometry(0.85,16),M(0x0b0a09),s*4.9,0,12.6).rotation.y=Math.PI;
  const t=finX([[-7,0],[-10.5,3.4],[-12.4,3.4],[-12.6,0]],0.1,md);t.position.set(s*4.9,0.9,0);t.rotation.z=s*0.26;g.add(t);}  // inward-canted fins on nacelles
 canopy(g,-11.2,2.2,0.55,0.45,0.55,0x1a1a1a);add(g,new THREE.BoxGeometry(0.5,0.25,1.8),0x1a1a1a,0,1.15,-8.6);
 decal(g,RND_LO,1.4,0.7,[6.6,0.1,-6.5],[-Math.PI/2,0,0],0.5);decal(g,RND_LO,1.4,0.7,[-6.6,0.1,-6.5],[-Math.PI/2,0,0],0.5);
 for(const s of[-1,1])decal(g,decalTex((x,w,h)=>{x.fillStyle='#b30000';x.font='bold 54px Arial';x.textAlign='center';x.fillText('17972',w/2,84);}),1.8,0.9,[s*(4.9+s*0.12)+s*0.8*Math.sin(0.26)*s,2.6,-10.6],[0,s*Math.PI/2,s*0.26],0.85);
 return g;}
DEFS.sr71={name:'SR-71 Blackbird',desc:'Mach 3.3 strategic reconnaissance at 85,000 ft. Unarmed - outrun everything.',cls:'air',thrust:62,vstall:85,vrot:88,dragK:7e-6,noRho:true,ceil:27000,col:0x101113,weapons:[],maxMach:3.3};
{const order={};for(const k of Object.keys(DEFS)){order[k]=DEFS[k];if(k==='darkstar'){}}}
{const _jetX=jet;jet=function(c,fa18,kind){if(kind==='sr71'){const g=sr71M();const fl=new THREE.Group();for(const sx of[-4.35,4.35]){const f=new THREE.Mesh(new THREE.ConeGeometry(0.8,1,8).rotateX(Math.PI/2).translate(0,0,0.5),flameMat);f.position.set(sx,0.33,14.3);fl.add(f);}g.add(fl);g.userData.flame=fl;g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});return g;}return _jetX(c,fa18,kind);};}
// ---- F-35 smoother rear: replace boxy side bodies, add nozzle petals + canopy ----
{const _f35=f35;f35=function(c){const g=_f35(c);const kill=[];g.children.forEach(o=>{const p=o.geometry&&o.geometry.parameters;if(p&&o.geometry.type==='BoxGeometry'&&p.depth===6)kill.push(o);if(o.geometry&&o.geometry.type==='CylinderGeometry'&&p.radiusTop===0.62)kill.push(o);});kill.forEach(o=>g.remove(o));
 const m=M(c);for(const s of[-1,1]){const sb=fuse([[-4.6,0.05],[-4,0.5],[-2,0.72],[2,0.75],[4.5,0.55],[6.4,0.2]],1,0.85,m,18);sb.position.set(s*1.25,0.12,0);g.add(sb);}
 const ud=fuse([[-6,0.4],[-2,1.0],[3,1.05],[6,0.85],[7.1,0.7]],1.25,0.5,m,22);ud.position.y=0.55;g.add(ud); // dorsal blend
 const nm=M(0x2d2a28,{metalness:0.85,roughness:0.4});const nz=new THREE.Mesh(new THREE.CylinderGeometry(0.66,0.74,1.3,24,1,true).rotateX(Math.PI/2),M(0x2d2a28,{metalness:0.85,roughness:0.4,side:THREE.DoubleSide}));nz.position.z=7.5;g.add(nz);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;const pt=add(g,new THREE.BoxGeometry(0.3,0.04,1.1),nm,Math.cos(a)*0.7,Math.sin(a)*0.7,7.6);pt.rotation.z=a+Math.PI/2;pt.rotation.x=0;}
 add(g,new THREE.CircleGeometry(0.62,20),M(0x120f0d),0,0,7.0).rotation.y=Math.PI;add(g,new THREE.TorusGeometry(0.45,0.05,6,20),M(0x5a4a3a,{metalness:0.9}),0,0,7.05);
 return g;};}
// ---- flight FX: contrails, vapor, sonic boom cone, afterburner shock diamonds ----
const boomCone=new THREE.Mesh(new THREE.ConeGeometry(1,1,32,1,true).rotateX(-Math.PI/2).translate(0,0,0.5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,fog:false}));scene.add(boomCone);
const abDia=new THREE.Group();for(let i=0;i<5;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:nukeTex,color:0xff9ad0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));s.position.z=1.2+i*1.15;s.scale.setScalar(1.1-i*0.12);abDia.add(s);}scene.add(abDia);
const _updAirX=updAir;
updAir=function(v,dt){_updAirX(v,dt);const p=v.mesh.position;const spd=v.vel.length();const a_s=p.y<11000?340-0.0039*p.y:295;const mach=spd/a_s;
 if(v.def.maxMach&&mach>v.def.maxMach){v.vel.multiplyScalar(v.def.maxMach/mach);}
 const fl=v.mesh.userData.flame;v.mesh.updateMatrixWorld();
 // contrails above ~8 km
 if(p.y>8000&&p.y<16000&&fl)for(const c of fl.children){const wp=_t.copy(c.position).applyMatrix4(v.mesh.matrixWorld);smoke.spawn(wp,rnd(0.5),rnd(0.5),rnd(0.5),9,1.2,5,1,1,1,0.55,0.02,0);}
 // high-G vapor over wings
 const gl=v.gload||1;if(gl>5.5&&p.y<9000){for(let i=0;i<3;i++){const wp=_t.set(rnd(5),0.8,-1-Math.random()*3).applyMatrix4(v.mesh.matrixWorld);smoke.spawn(wp,v.vel.x*0.7+rnd(2),v.vel.y*0.7+rnd(2),v.vel.z*0.7+rnd(2),0.35,1.5,3,1,1,1,Math.min(0.7,(gl-5.5)*0.25),0.2,0);}}
 // sonic boom cone near Mach 1
 const bc=Math.max(0,1-Math.abs(mach-1.0)/0.06);boomCone.visible=bc>0.02&&p.y<15000;if(boomCone.visible){boomCone.position.copy(p);boomCone.quaternion.copy(v.mesh.quaternion);boomCone.position.addScaledVector(fwdOf(v.mesh.quaternion,V3()),-3);boomCone.scale.set(5,5,9);boomCone.material.opacity=bc*0.35*(0.7+Math.random()*0.3);}
 // afterburner shock diamonds
 abDia.visible=!!fl&&inp.throttle>0.86&&player===v&&p.y<20000;if(abDia.visible){const c=fl.children[0];abDia.position.copy(c.position).applyMatrix4(v.mesh.matrixWorld);abDia.quaternion.copy(v.mesh.quaternion);abDia.children.forEach((s,i)=>{s.material.opacity=(0.9-i*0.15)*(0.8+Math.random()*0.2);});
  if(fl.children.length>1){if(!abDia.userData.b){const b=abDia.clone();b.children.forEach(s=>s.material=s.material.clone());scene.add(b);abDia.userData.b=b;}const b=abDia.userData.b;b.visible=true;b.position.copy(fl.children[1].position).applyMatrix4(v.mesh.matrixWorld);b.quaternion.copy(v.mesh.quaternion);b.children.forEach((s,i)=>s.material.opacity=abDia.children[i].material.opacity);}
  else if(abDia.userData.b)abDia.userData.b.visible=false;}else if(abDia.userData.b)abDia.userData.b.visible=false;};
// ---- ship wakes + bow spray ----
const _updShipX=updShip;
updShip=function(v,dt){_updShipX(v,dt);const spd=Math.abs(v.spd||0);if(spd<0.8)return;const p=v.mesh.position;if(v.def.cls==='sub'&&p.y<-3)return;const q=v.mesh.quaternion;const f=fwdOf(q,V3()),r=rightOf(q,V3());
 const L=v.kind==='carrier'?160:v.kind==='sub'?55:75,W=v.kind==='carrier'?20:v.kind==='sub'?5:9;const k=Math.min(1,spd/14);
 for(let i=0;i<Math.ceil(3*k);i++){const s=Math.random()<0.5?-1:1;smoke.spawn(_t.copy(p).addScaledVector(f,L*0.9).addScaledVector(r,s*W*0.3).setY(1.5),r.x*s*6*k+rnd(2),3+Math.random()*5*k,r.z*s*6*k+rnd(2),1.4,2+W*0.15,5,1,1,1,0.7*k,0.6,-6);}
 for(let i=0;i<Math.ceil(4*k);i++){const s=Math.random()<0.5?-1:1;smoke.spawn(_t.copy(p).addScaledVector(f,-L*0.75).addScaledVector(r,s*W*(0.6+Math.random()*0.6)).setY(0.4),r.x*s*2.5+rnd(1),0.2,r.z*s*2.5+rnd(1),14,W*0.5,W*1.6,0.93,0.97,1,0.38*k,0.05,0);}
 for(let i=0;i<2;i++){const s=i?1:-1;smoke.spawn(_t.copy(p).addScaledVector(f,-L*0.2+Math.random()*L*0.9).addScaledVector(r,s*W*1.05).setY(0.5),r.x*s*3,0.5,r.z*s*3,10,3,W*0.8,0.93,0.97,1,0.3*k,0.05,0);}};
// ---- Poly Haven CC0 textures (terrain / beach / concrete / asphalt) with procedural fallback ----
const PH='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/';
function phLoad(name,kind,srgb){const fix=t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t;};
 return new Promise((res,rej)=>{const L=new THREE.TextureLoader();L.setCrossOrigin('anonymous');L.load(`tex/${name}_${kind}_2k.jpg`,t=>res(fix(t)),undefined,()=>L.load(`${PH}${name}/${name}_${kind}_1k.jpg`,t=>res(fix(t)),undefined,rej));});}
const phRough=(name,mats,rep)=>phLoad(name,'rough').then(r=>{for(const m of mats){const t=r.clone();t.needsUpdate=true;if(rep)t.repeat.copy(rep);else if(m.map)t.repeat.copy(m.map.repeat);m.roughnessMap=t;m.roughness=1;m.needsUpdate=true;}}).catch(()=>{});
function lumDetail(t){const im=t.image;const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,cv.width,cv.height);let s=0;const n=d.data.length/4;
 for(let i=0;i<d.data.length;i+=4)s+=d.data[i]*0.3+d.data[i+1]*0.59+d.data[i+2]*0.11;const mean=s/n;for(let i=0;i<d.data.length;i+=4){const l=(d.data[i]*0.3+d.data[i+1]*0.59+d.data[i+2]*0.11)/mean;const v=Math.min(255,200*(0.55+0.45*l));d.data[i]=d.data[i+1]=d.data[i+2]=v;}x.putImageData(d,0,0);
 const nt=new THREE.CanvasTexture(cv);nt.wrapS=nt.wrapT=THREE.RepeatWrapping;nt.anisotropy=8;nt.colorSpace=THREE.SRGBColorSpace;return nt;}
const PHX={};
if(settings.quality!=='low'){
 Promise.all([phLoad('aerial_grass_rock','diff'),phLoad('aerial_grass_rock','nor_gl')]).then(([d,n])=>{const det=lumDetail(d);scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.vertexColors&&o.material.map&&o.geometry.attributes.color&&!o.isInstancedMesh){const rp=o.material.map.repeat.x;o.material.map=det.clone();o.material.map.needsUpdate=true;o.material.map.repeat.set(rp*1.5,rp*1.5);o.material.normalMap=n.clone();o.material.normalMap.needsUpdate=true;o.material.normalMap.repeat.set(rp*1.5,rp*1.5);o.material.normalScale.set(1.2,1.2);o.material.needsUpdate=true;PHX._tm=(PHX._tm||[]);PHX._tm.push(o.material);}});phRough('aerial_grass_rock',PHX._tm||[]);PHX.terrain=true;}).catch(()=>{});
 Promise.all([phLoad('coast_sand_01','diff',1),phLoad('coast_sand_01','nor_gl')]).then(([d,n])=>{STARBASE.traverse(o=>{if(o.isMesh&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius===900||o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===300){const dm=lumDetail(d);dm.repeat.set(60,60);n.repeat.set(60,60);o.material=new THREE.MeshStandardMaterial({map:dm,normalMap:n,roughness:1,color:0xd8c8a0});phRough('coast_sand_01',[o.material]);}});PHX.sand=true;}).catch(()=>{});
 Promise.all([phLoad('concrete_floor_02','diff',1),phLoad('concrete_floor_02','nor_gl')]).then(([d,n])=>{d.repeat.set(12,12);n.repeat.set(12,12);for(const o of [...pad.children,...(mechazilla.userData.olm?mechazilla.userData.olm.children:[])]){if(o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width>=30){o.material=new THREE.MeshStandardMaterial({map:d,normalMap:n,roughness:0.9,color:0xd8d8d4});}}
  STARBASE.traverse(o=>{if(o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width>=34&&o.geometry.parameters.height<1){o.material=new THREE.MeshStandardMaterial({map:d,normalMap:n,roughness:0.9,color:0xd8d8d4});}});PHX.concrete=true;{const ms=new Set();scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===d)ms.add(o.material);});phRough('concrete_floor_02',[...ms]);}}).catch(()=>{});
 Promise.all([phLoad('asphalt_02','diff',1),phLoad('asphalt_02','nor_gl')]).then(([d,n])=>{d.repeat.set(4,160);n.repeat.set(4,160);const mt=M(0x3a3c3e);mt.map=d;mt.normalMap=n;mt.color.set(0x8a8a8a);mt.needsUpdate=true;phRough('asphalt_02',[mt]);PHX.asphalt=true;}).catch(()=>{});}
// ---- NYC: varied facades (glass / brick / limestone) w/ night windows, bridges ----
function facadeTex(kind){return canvasTex(128,256,(c,w,h)=>{const base={glass:'#3b4a5a',brick:'#7a4a3a',lime:'#b9b1a1'}[kind];c.fillStyle=base;c.fillRect(0,0,w,h);
 if(kind==='glass'){for(let x=0;x<w;x+=16){c.fillStyle='#1d2a38';c.fillRect(x,0,14,h);c.fillStyle='rgba(180,200,220,0.25)';c.fillRect(x+1,0,3,h);}for(let y=0;y<h;y+=8){c.fillStyle='#55626e';c.fillRect(0,y,w,1);}}
 else{for(let y=4;y<h;y+=10)for(let x=4;x<w;x+=10){const r=Math.random();c.fillStyle=r<0.12?'#d9cfa6':kind==='brick'?'#2a2f36':'#38404a';c.fillRect(x,y,5,7);}}});}
function nightTex(){return canvasTex(128,256,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);for(let y=4;y<h;y+=10)for(let x=4;x<w;x+=10){if(Math.random()<0.33){c.fillStyle=Math.random()<0.7?'#ffd590':'#cfe4ff';c.fillRect(x,y,5,7);}}});}
const CITYNIGHT=nightTex();const cityMats=[];
{const old=scene.children.find(o=>o.isInstancedMesh&&o.count>500);if(old){const geo=old.geometry;const n=old.count;const groups={glass:[],brick:[],lime:[]};const m=new THREE.Matrix4();
 for(let i=0;i<n;i++){old.getMatrixAt(i,m);const h=m.elements[5];const r=hash(i,7);const k=h>140?(r<0.75?'glass':'lime'):(r<0.45?'brick':r<0.8?'lime':'glass');groups[k].push(m.clone());}
 scene.remove(old);for(const [k,list] of Object.entries(groups)){const mat=new THREE.MeshStandardMaterial({map:facadeTex(k),roughness:k==='glass'?0.15:0.85,metalness:k==='glass'?0.7:0.05,envMapIntensity:k==='glass'?1.6:0.6,emissive:0xffffff,emissiveMap:CITYNIGHT,emissiveIntensity:0});
  cityMats.push(mat);const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((mm,i)=>im.setMatrixAt(i,mm));im.castShadow=im.receiveShadow=true;scene.add(im);
  const roof=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,0.04,0.5),M(0x555a60),list.length);list.forEach((mm,i)=>{const t=mm.clone();const hh=mm.elements[5];t.elements[5]=hh*0.02+2;t.elements[13]=mm.elements[13]+hh;roof.setMatrixAt(i,t);});scene.add(roof);}}
 // bridges east of the island (Brooklyn / Manhattan-style suspension bridges)
 const sm=M(0x7d6e5c,{roughness:0.8}),cm=new THREE.LineBasicMaterial({color:0x444444});
 for(const bz of [NYC.z-1900,NYC.z-900]){const g=new THREE.Group();const x0=NYC.x+1050,len=1800;
  add(g,new THREE.BoxGeometry(len,3,26),0x56595c,x0+len/2,42,bz);for(const tx of [x0+450,x0+len-450]){for(const s of[-1,1])add(g,new THREE.BoxGeometry(14,95,8),sm,tx,47,bz+s*12);add(g,new THREE.BoxGeometry(14,10,32),sm,tx,82,bz);add(g,new THREE.BoxGeometry(18,6,32),sm,tx,0,bz);}
  for(const s of[-1,1]){const pts=[];const ax=x0+450,bx=x0+len-450;for(let i=0;i<=40;i++){const t=i/40,x=x0+t*len;let y;if(x<ax)y=42+(x-x0)/(ax-x0)*50;else if(x>bx)y=92-(x-bx)/(x0+len-bx)*50;else{const u=(x-ax)/(bx-ax);y=92-180*u*(1-u)*0.45;}pts.push(V3(x,y,bz+s*12));}
   g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),cm));for(let i=2;i<40;i+=2){const p=pts[i];g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p,V3(p.x,43.5,p.z)]),cm));}}
  add(g,new THREE.BoxGeometry(200,40,40),0x5a5650,x0+len+100,20,bz);scene.add(g);}}
// ---- airbase taxiway / runway edge lights ----
const LIGHTMAT_B=new THREE.MeshBasicMaterial({color:0x3a6dff}),LIGHTMAT_W=new THREE.MeshBasicMaterial({color:0xfff2cc});
{const geo=new THREE.SphereGeometry(0.35,6,4);const rw=[],tw=[];for(let z=-1480;z<=1480;z+=60){rw.push([-31,z],[31,z]);}for(let z=-1280;z<=1280;z+=40){tw.push([77,z],[103,z]);}
 const mk=(list,mat)=>{const im=new THREE.InstancedMesh(geo,mat,list.length);const m=new THREE.Matrix4();list.forEach(([x,z],i)=>{m.makeTranslation(x,6.5,z);im.setMatrixAt(i,m);});scene.add(im);return im;};mk(rw,LIGHTMAT_W);mk(tw,LIGHTMAT_B);}
{scene.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===60&&o.geometry.parameters.height===3000){o.material.color.set(0x8a8a8a);o.material.roughness=1;}});}
// ---- time of day ----
const TOD={day:{el:55,sun:3.2,hemi:0.5,env:0.9,exp:0.58,city:0,fog:[0.48,0.6,0.78]},dusk:{el:86,sun:1.6,hemi:0.25,env:0.35,exp:0.7,city:0.6,fog:[0.55,0.42,0.38]},night:{el:96,sun:0.05,hemi:0.18,env:0.04,exp:0.9,city:1.6,fog:[0.02,0.03,0.06]}};
const hemiL=scene.children.find(o=>o.isHemisphereLight);
function applyTOD(){if(!window.__envTex&&scene.environment)window.__envTex=scene.environment;scene.environment=settings.tod==='night'?null:window.__envTex||scene.environment;const t=TOD[settings.tod||'day'];sunDir.setFromSphericalCoords(1,THREE.MathUtils.degToRad(t.el),THREE.MathUtils.degToRad(30));skyU.sunPosition.value.copy(sunDir);if(ocean.material.uniforms.sunDirection)ocean.material.uniforms.sunDirection.value.copy(sunDir);
 sun.intensity=t.sun;sun.color.set(settings.tod==='dusk'?0xffa060:0xfff0dc);if(hemiL)hemiL.intensity=t.hemi;scene.environmentIntensity=t.env;renderer.toneMappingExposure=t.exp;cityMats.forEach(m=>m.emissiveIntensity=t.city);
 const lb=settings.tod==='night'?3:settings.tod==='dusk'?1.5:0.6;LIGHTMAT_B.color.setRGB(0.23*lb,0.43*lb,1*lb);LIGHTMAT_W.color.setRGB(1*lb,0.95*lb,0.8*lb);stars.material.opacity=settings.tod==='night'?1:0;TOD._fog=t.fog;}
const _updEnvX=updEnv;updEnv=function(dt){_updEnvX(dt);if(settings.tod&&settings.tod!=='day'){const cp=camera.position;if(cp.y>-0.3&&TOD._fog){const k=sstep(12000,70000,cp.y);scene.fog.color.setRGB(lerp(TOD._fog[0],0,k),lerp(TOD._fog[1],0,k),lerp(TOD._fog[2],0.02,k));clouds.material.uniforms.fogC.value.copy(scene.fog.color);}if(settings.tod==='night')stars.material.opacity=1;}};
applyTOD();
const _bmX=buildMenu;buildMenu=function(){_bmX();const r=$('menu').querySelector('#mQ');if(!r)return;const b=document.createElement('div');b.className='btn';b.id='mTod';b.textContent='Time: '+(settings.tod||'day').toUpperCase();r.after(b);b.onclick=()=>{const o=['day','dusk','night'];settings.tod=o[(o.indexOf(settings.tod||'day')+1)%3];saveSettings();applyTOD();buildMenu();};};
window.__gx={PHX,applyTOD,TOD};
window.__setTod=t=>{settings.tod=t;applyTOD();};
