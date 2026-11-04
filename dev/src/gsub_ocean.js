// SUPERSEDED (Oct 21): duplicate of src/gsub.js from an interrupted builder. DO NOT include in the merged build; gsub.js is canonical (subx_sub.js hooks it).
//GSUB-BEGIN  #3 sub launch 3rd-person cam, #8 underwater visibility, #9 deep ocean (450 m)
(()=>{const T=THREE;const SUBMAX=450;window.SUBMAX=SUBMAX;
// ---------- #9 deep bathymetry: continental shelf near islands, slope to abyssal plain ~470 m ----------
const _th=terrainH;
terrainH=function(x,z){const h=_th(x,z);if(h>-29.5)return h;
 let best=-9;for(const s of ISL){const g=1-Math.hypot(x-s.x,z-s.z)/s.r;if(g>best)best=g;}
 if(best>-0.25)return h;const k=Math.min(1,(-best-0.25)/0.55);const e=k*k*(3-2*k);
 const n=vnoise(x*0.0011,z*0.0011)*0.6+vnoise(x*0.004,z*0.004)*0.4;
 return Math.max(-30-e*(430+40*(n-0.5)),-490);};
// ---------- deep seabed mesh following camera (replaces flat -90 m plane) ----------
seabed.visible=false;
const sandC=document.createElement('canvas');sandC.width=sandC.height=256;{const x=sandC.getContext('2d');const im=x.createImageData(256,256);
 for(let j=0;j<256;j++)for(let i=0;i<256;i++){const r=0.25*Math.sin(i*0.098+Math.sin(j*0.049)*2.2)*Math.sin(j*0.0245*2+1)+vnoise(i*0.06,j*0.06)*0.45+Math.random()*0.3;const v=Math.round(130+80*r);const o=(j*256+i)*4;im.data[o]=v;im.data[o+1]=v*0.95;im.data[o+2]=v*0.8;im.data[o+3]=255;}x.putImageData(im,0,0);}
const sandT=new T.CanvasTexture(sandC);sandT.wrapS=sandT.wrapT=T.RepeatWrapping;sandT.repeat.set(60,60);sandT.colorSpace=T.SRGBColorSpace;
const N=isTouch?64:96,SZ=7000;const bg=new T.PlaneGeometry(SZ,SZ,N,N);bg.rotateX(-Math.PI/2);
const bm=new T.MeshStandardMaterial({map:sandT,color:0x9a9478,roughness:1,metalness:0});
const CU={t:{value:0},ck:{value:0}};
bm.onBeforeCompile=s=>{s.uniforms.uT=CU.t;s.uniforms.uCk=CU.ck;
 s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <fog_vertex>','#include <fog_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;');
 s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uT,uCk;\nfloat cst(vec2 p){float c=0.;for(int i=0;i<3;i++){p=p*1.7+vec2(sin(p.y*0.9+uT*0.7),cos(p.x*0.8-uT*0.6));c+=abs(sin(p.x)+sin(p.y));}return pow(max(0.,1.-c/3.6),4.);}')
 .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(0.55,0.85,0.9)*cst(vWp.xz*0.09)*uCk;');};
const bed=new T.Mesh(bg,bm);bed.receiveShadow=false;bed.frustumCulled=false;scene.add(bed);let bx=1e9,bz=1e9;
function rebuildBed(cx,cz){bx=Math.round(cx/250)*250;bz=Math.round(cz/250)*250;const p=bg.attributes.position;
 for(let i=0;i<p.count;i++){p.setY(i,terrainH(p.getX(i)+bx,p.getZ(i)+bz)-0.5);}p.needsUpdate=true;bg.computeVertexNormals();bed.position.set(bx,0,bz);}
// rocks / coral mounds as visible bottom references
const rockG=new T.DodecahedronGeometry(1,0);const rockM=new T.MeshStandardMaterial({color:0x5d6358,roughness:1,flatShading:true});const NR=isTouch?120:220;
const rocks=new T.InstancedMesh(rockG,rockM,NR);rocks.frustumCulled=false;scene.add(rocks);const _m=new T.Matrix4(),_q=new T.Quaternion(),_s=new T.Vector3(),_p=new T.Vector3();
function placeRocks(){for(let i=0;i<NR;i++){const a=hash(i,bx*0.01+bz*0.003)*Math.PI*2,r=Math.sqrt(hash(i*3.1,7+bz*0.01))*1400;const x=bx+Math.cos(a)*r,z=bz+Math.sin(a)*r;const sc=2+hash(i,9)*9;
 _p.set(x,terrainH(x,z)+sc*0.3,z);_q.setFromEuler(new T.Euler(hash(i,1)*3,hash(i,2)*3,0));_s.set(sc,sc*(0.5+hash(i,4)*0.6),sc*(0.8+hash(i,5)*0.5));rocks.setMatrixAt(i,_m.compose(_p,_q,_s));}rocks.instanceMatrix.needsUpdate=true;}
// ---------- #8 underwater light: god rays, marine snow, teal fill ----------
const fill=new T.HemisphereLight(0x7fd6e6,0x10302c,0);scene.add(fill);
const rayM=new T.MeshBasicMaterial({color:0xbfefff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});
{const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,256);const h=x.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(0,0,0,1)');h.addColorStop(0.5,'rgba(0,0,0,0)');h.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-out';x.fillStyle=h;x.fillRect(0,0,64,256);rayM.map=new T.CanvasTexture(c);}
const rays=new T.Group();scene.add(rays);const RN=isTouch?10:16;for(let i=0;i<RN;i++){const m=new T.Mesh(new T.PlaneGeometry(6+hash(i,3)*10,160),rayM);m.position.set((hash(i,1)-0.5)*220,-80,(hash(i,2)-0.5)*220);m.rotation.set(0.18*(hash(i,5)-0.5),hash(i,6)*3,0.25);m.userData.ph=hash(i,7)*6;rays.add(m);}
const SN=isTouch?500:900;const sg=new T.BufferGeometry();const sp=new Float32Array(SN*3);for(let i=0;i<SN*3;i++)sp[i]=(Math.random()-0.5)*80;sg.setAttribute('position',new T.BufferAttribute(sp,3));
const snow=new T.Points(sg,new T.PointsMaterial({color:0xd8f0f0,size:0.12,transparent:true,opacity:0.55,depthWrite:false,fog:true}));snow.frustumCulled=false;scene.add(snow);
const _ue=updEnv;updEnv=function(dt=0.016){_ue(dt);const cp=camera.position;if(Math.hypot(cp.x-bx,cp.z-bz)>600){rebuildBed(cp.x,cp.z);placeRocks();}
 const under=cp.y<waveH(cp.x,cp.z,simT)-0.3;const d=Math.max(0,-cp.y);CU.t.value+=dt;
 const vis=under;if(typeof cloudDeck!=='undefined')cloudDeck.visible=!under;rays.visible=vis&&d<160;snow.visible=vis;bed.visible=true;rocks.visible=d>0||cp.y<600;
 if(under){const k=Math.min(1,d/SUBMAX);// clear tropical water: bright teal near surface, deep blue at depth, never pitch black
  scene.fog.color.setRGB(0.10*(1-k)+0.012*k,0.40*(1-k)+0.07*k,0.48*(1-k)+0.13*k);scene.fog.density=0.0034+0.0022*k;scene.background=scene.fog.color;
  const w=$('water');if(w)w.style.opacity=0.35;fill.intensity=1.1*(1-k)+0.45*k;CU.ck.value=Math.max(0,1-d/140)*0.9;
  rays.position.set(cp.x,0,cp.z);rayM.opacity=0.13*Math.max(0,1-d/150);for(const r of rays.children)r.position.y=-80+Math.sin(CU.t.value*0.4+r.userData.ph)*3;
  snow.position.set(Math.floor(cp.x/80)*80,Math.floor(cp.y/80)*80,Math.floor(cp.z/80)*80);// tiled box; looks continuous
 }else{fill.intensity=0;CU.ck.value=0;}};
// ---------- #9 depth physics: allow 450 m, faster deep transit ----------
const _us=updShip;updShip=function(v,dt){_us(v,dt);if(v.def.cls!=='sub')return;
 const bedD=-terrainH(v.mesh.position.x,v.mesh.position.z)-12;v.depthT=clamp(v.depthT,0,Math.max(0,Math.min(SUBMAX,bedD)));
 const e=v.depthT-v.depth;if(Math.abs(e)>25)v.depth+=clamp(e,-5*dt,5*dt);// extra rate for long dives (total ~11 m/s max)
 v.depth=clamp(v.depth,0,SUBMAX);if(v.depth>=1)v.mesh.position.y=-v.depth;
 if(v.depth>300&&Math.random()<dt*0.05)msg('HULL CREAK — TEST DEPTH '+SUBMAX+' m',1.2);};
// ---------- #3 sub launch: external 3rd-person shot, then normal missile follow ----------
window.__gsubKeys=()=>Object.keys(DEFS);window.__gsubCam=()=>camera.position.toArray().map(x=>+x.toFixed(1));window.__gsubFire=v=>fireWeapon(v);
const LC={t:-1,v:null,o:null,dur:4.2,side:1,base:null};window.__subLC=LC;
const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons&&v.weapons[v.wi];const n0=projs.length;const r=_fw(v);
 if(r&&v===player&&v.def.cls==='sub'&&w!=='TORPEDO'&&projs.length>n0){LC.t=0;LC.v=v;LC.o=projs[projs.length-1];LC.side=Math.random()<0.5?1:-1;LC.base=v.mesh.position.clone();LC.dep=v.depth||0;}return r;};
const _cp2=new T.Vector3(),_cp=new T.Vector3(),_cq=new T.Quaternion(),_la=new T.Vector3(),_f=new T.Vector3(),_r=new T.Vector3();
const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);if(LC.t>=0){LC.t+=dt;if(LC.t>LC.dur||player!==LC.v||!LC.o||LC.o.dead)LC.t=-1;}};
const _rf=renderFrame;renderFrame=function(sc,cam){if(LC.t<0||sc!==scene||cam!==camera)return _rf(sc,cam);
 const v=LC.v,p=v.mesh.position,q=v.mesh.quaternion;fwdOf(q,_f);rightOf(q,_r);const o=LC.o;_cp.copy(camera.position);_cq.copy(camera.quaternion);
 const deep=LC.dep>6,T1=1.2,ph1=deep&&LC.t<T1;
 if(ph1){// underwater beam shot: full hull in frame, slight up-tilt toward the rising missile
  camera.position.copy(p).addScaledVector(_r,LC.side*85).addScaledVector(_f,-20).add(_la.set(0,-10,0));
  _la.copy(p).addScaledVector(_f,-8).add(V3(0,6+Math.min(18,Math.max(0,o.pos.y-p.y)*0.15),0));camera.lookAt(_la);}
 else{// surface shot from water level: breach plume + missile climbing, view tilt capped so the sea stays in frame
  const s=Math.min(1,(LC.t-(deep?T1:0))/2.4);const bp=_cp2.copy(LC.base).setY(0).addScaledVector(_f,-10);
  camera.position.copy(bp).addScaledVector(_r,LC.side*(160+60*s)).addScaledVector(_f,-70).setY(3+5*s);
  const hor=Math.hypot(camera.position.x-bp.x,camera.position.z-bp.z);_la.copy(bp);_la.y=Math.min(Math.max(o.pos.y,0)*0.5,hor*0.55);camera.lookAt(_la);}
 updEnv(0);_rf(sc,cam);camera.position.copy(_cp);camera.quaternion.copy(_cq);};
})();
//GSUB-END
