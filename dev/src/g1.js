import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from 'three/addons/objects/Water.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
const $=id=>document.getElementById(id);
const clamp=(x,a,b)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t, sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0||location.hash.includes('touch');
const settings=Object.assign({advanced:false,gyro:false,tut:false,quality:'high'},JSON.parse(localStorage.getItem('milsim_settings')||'{}'));
const saveSettings=()=>localStorage.setItem('milsim_settings',JSON.stringify(settings));
// ---------- renderer / scenes ----------
const renderer=new THREE.WebGLRenderer({antialias:!isTouch,logarithmicDepthBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:2));renderer.setSize(innerWidth,innerHeight);
document.body.prepend(renderer.domElement);
const HIGH=settings.quality!=='low';
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=0.58;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=HIGH;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
// ---- procedural textures ----
function canvasTex(w,h,fn,srgb=true,rep=1){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');fn(x,w,h);const t=new THREE.CanvasTexture(cv);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=8;t.userData.cv=cv;return t;}
function fbm(x,y,o=4){let s=0,a=0.5,f=1;for(let i=0;i<o;i++){s+=a*vnoiseT(x*f,y*f,f);a*=0.5;f*=2;}return s;}
function vnoiseT(x,y,per){return vnoise(x,y);}
function normalFrom(srcCv,str=2,rep=1){const w=srcCv.width,h=srcCv.height;const d=srcCv.getContext('2d').getImageData(0,0,w,h).data;return canvasTex(w,h,(x)=>{const im=x.createImageData(w,h);
 const H=(i,j)=>d[(((j+h)%h)*w+((i+w)%w))*4]/255;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i+1,j)-H(i-1,j))*str,dy=(H(i,j+1)-H(i,j-1))*str;const l=Math.hypot(dx,dy,1);const k=(j*w+i)*4;
  im.data[k]=(-dx/l*0.5+0.5)*255;im.data[k+1]=(dy/l*0.5+0.5)*255;im.data[k+2]=(1/l*0.5+0.5)*255;im.data[k+3]=255;}x.putImageData(im,0,0);},false,rep);}
function pixTex(w,h,f,srgb=true,rep=1){return canvasTex(w,h,(x)=>{const im=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const c=f(i,j);const k=(j*w+i)*4;im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=c[3]??255;}x.putImageData(im,0,0);},srgb,rep);}
// aircraft/ship panel skin (white-based so material color tints it)
const panelTex=canvasTex(512,512,(x,w,h)=>{const im=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const n=fbm(i/60,j/60,4);const s=fbm(i/8,j/120,2);const v=200+n*40+(s-0.5)*18;const k=(j*w+i)*4;im.data[k]=im.data[k+1]=im.data[k+2]=v;im.data[k+3]=255;}x.putImageData(im,0,0);
 x.strokeStyle='rgba(60,60,60,0.55)';x.lineWidth=1.3;for(let k=0;k<26;k++){const vert=k%2;const p=Math.floor(hash(k,7)*w);x.beginPath();if(vert){x.moveTo(p,0);x.lineTo(p,h);}else{x.moveTo(0,p);x.lineTo(w,p);}x.stroke();}
 for(let k=0;k<40;k++){const X=hash(k,1)*w,Y=hash(k,2)*h,W=20+hash(k,3)*90,Hh=20+hash(k,4)*90;x.strokeRect(X,Y,W,Hh);}
 x.fillStyle='rgba(40,40,40,0.35)';for(let k=0;k<900;k++){x.fillRect(hash(k,5)*w,hash(k,6)*h,1.4,1.4);}
 for(let k=0;k<30;k++){const X=hash(k,9)*w;const g2=x.createLinearGradient(X,0,X,h);g2.addColorStop(0,'rgba(50,45,40,0.12)');g2.addColorStop(1,'rgba(50,45,40,0)');x.fillStyle=g2;x.fillRect(X,hash(k,8)*h*0.5,3+hash(k,10)*8,h);}});
const panelNrm=normalFrom(panelTex.userData.cv,3);
const camoTex=pixTex(256,256,(i,j)=>{const n=fbm(i/40+3,j/40,3),m=fbm(i/30+9,j/30+4,3);return n>0.55?[95,90,70]:m>0.5?[60,70,45]:[120,125,95];});
const rockTex=pixTex(256,256,(i,j)=>{const n=fbm(i/20,j/20,5);const v=150+n*100;return [v,v,v];},true,1);const rockNrm=normalFrom(rockTex.userData.cv,4);
const puffTex=pixTex(128,128,(i,j)=>{const dx=(i-64)/64,dy=(j-64)/64;const r=Math.hypot(dx,dy);const n=fbm(i/18,j/18,4);const a=Math.max(0,1-r*r*1.1)*(0.4+n*0.9)-0.08;return [255,255,255,Math.max(0,Math.min(255,a*255))];},false);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xa8c8e8,0.000045);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,0.5,900000);
const oScene=new THREE.Scene();const oCam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.002,300000);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);for(const c of [camera,oCam]){c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();}PS.forEach(p=>p.mat.uniforms.scale.value=innerHeight/2);});
scene.add(new THREE.HemisphereLight(0xcfe6ff,0x4a4a40,0.5));
const sun=new THREE.DirectionalLight(0xfff0dc,3.2);scene.add(sun);
// ---------- sky ----------
const sky=new Sky();sky.scale.setScalar(450000);scene.add(sky);const skyU=sky.material.uniforms;skyU.turbidity.value=3.5;skyU.rayleigh.value=1.1;skyU.mieCoefficient.value=0.003;skyU.mieDirectionalG.value=0.75;
const sunDir=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(55),THREE.MathUtils.degToRad(30));skyU.sunPosition.value.copy(sunDir);sun.position.copy(sunDir);
const pmrem=new THREE.PMREMGenerator(renderer);{const sc=new THREE.Scene();const s2=new Sky();s2.scale.setScalar(1000);Object.keys(skyU).forEach(k=>s2.material.uniforms[k].value=skyU[k].value);sc.add(s2);scene.environment=pmrem.fromScene(sc).texture;}
sun.castShadow=HIGH;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=sun.shadow.camera.bottom=-160;sun.shadow.camera.right=sun.shadow.camera.top=160;sun.shadow.camera.near=1;sun.shadow.camera.far=3000;sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.4;scene.add(sun.target);
function makeStars(R,n,size){const g=new THREE.BufferGeometry(),a=[];for(let i=0;i<n;i++){const v=V3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(R);a.push(v.x,v.y,v.z);}g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));
  return new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));}
const stars=makeStars(400000,2500,1.6);scene.add(stars);
// ---------- particles ----------
const PS=[];
class Particles{constructor(sc,n,additive){this.n=n;this.i=0;const g=new THREE.BufferGeometry();this.pos=new Float32Array(n*3);this.col=new Float32Array(n*4);this.size=new Float32Array(n);
 this.v=new Float32Array(n*3);this.life=new Float32Array(n);this.max=new Float32Array(n);this.grow=new Float32Array(n);this.a0=new Float32Array(n);this.drag=new Float32Array(n);this.buoy=new Float32Array(n);this.fade=new Float32Array(n*3);
 g.setAttribute('position',new THREE.BufferAttribute(this.pos,3));g.setAttribute('col',new THREE.BufferAttribute(this.col,4));g.setAttribute('size',new THREE.BufferAttribute(this.size,1));
 this.mat=new THREE.ShaderMaterial({uniforms:{scale:{value:innerHeight/2},tex:{value:puffTex},boost:{value:additive?2.2:1.0}},transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
  vertexShader:`attribute float size;attribute vec4 col;varying vec4 vC;varying float vR;uniform float scale;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vC=col;vR=fract(sin(dot(position.xz,vec2(12.9898,78.233)))*43758.5)*6.283;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(size*scale/max(-mv.z,0.001),0.0,400.0);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:`varying vec4 vC;varying float vR;uniform sampler2D tex;uniform float boost;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
vec2 c=gl_PointCoord-0.5;float d=length(c);if(d>0.5)discard;float a=smoothstep(0.5,0.05,d);gl_FragColor=vec4(vC.rgb,vC.a*a);}`});
 this.pts=new THREE.Points(g,this.mat);this.pts.frustumCulled=false;sc.add(this.pts);PS.push(this);}
 spawn(p,vx,vy,vz,life,size,grow,r,g,b,a,drag=0,buoy=0,fr=-1,fg=-1,fb=-1){const i=this.i;this.i=(i+1)%this.n;
  this.pos[i*3]=p.x;this.pos[i*3+1]=p.y;this.pos[i*3+2]=p.z;this.v[i*3]=vx;this.v[i*3+1]=vy;this.v[i*3+2]=vz;this.life[i]=life;this.max[i]=life;this.size[i]=size;this.grow[i]=grow;
  this.col[i*4]=r;this.col[i*4+1]=g;this.col[i*4+2]=b;this.col[i*4+3]=a;this.a0[i]=a;this.drag[i]=drag;this.buoy[i]=buoy;this.fade[i*3]=fr<0?r:fr;this.fade[i*3+1]=fg<0?g:fg;this.fade[i*3+2]=fb<0?b:fb;}
 update(dt){const P=this.pos,V=this.v;for(let i=0;i<this.n;i++){if(this.life[i]<=0)continue;this.life[i]-=dt;if(this.life[i]<=0){this.col[i*4+3]=0;this.size[i]=0;continue;}
  const d=Math.max(0,1-this.drag[i]*dt);V[i*3]*=d;V[i*3+1]=V[i*3+1]*d+this.buoy[i]*dt;V[i*3+2]*=d;P[i*3]+=V[i*3]*dt;P[i*3+1]+=V[i*3+1]*dt;P[i*3+2]+=V[i*3+2]*dt;
  this.size[i]+=this.grow[i]*dt;const t=this.life[i]/this.max[i];this.col[i*4+3]=this.a0[i]*Math.min(1,t*1.5);
  const k=Math.min(1,dt*2.5);this.col[i*4]+= (this.fade[i*3]-this.col[i*4])*k;this.col[i*4+1]+=(this.fade[i*3+1]-this.col[i*4+1])*k;this.col[i*4+2]+=(this.fade[i*3+2]-this.col[i*4+2])*k;}
  const g=this.pts.geometry;g.attributes.position.needsUpdate=true;g.attributes.col.needsUpdate=true;g.attributes.size.needsUpdate=true;}}
const smoke=new Particles(scene,isTouch?1800:3000,false),fire=new Particles(scene,isTouch?1500:2500,true);
const oSmoke=new Particles(oScene,800,false),oFire=new Particles(oScene,800,true);
const rnd=(a=1)=>(Math.random()*2-1)*a;
function explosion(p,s=1){for(let i=0;i<14*Math.min(s,3);i++)fire.spawn(p,rnd(12*s),rnd(12*s)+4*s,rnd(12*s),0.6+Math.random()*0.6,6*s,14*s,1,0.8,0.3,1,1.5,0,1,0.2,0.0);
 for(let i=0;i<10*Math.min(s,3);i++)smoke.spawn(p,rnd(6*s),rnd(4*s)+5*s,rnd(6*s),3+Math.random()*3,8*s,10*s,0.25,0.22,0.2,0.7,0.6,1);}
function splash(p,s=1){for(let i=0;i<8*s;i++)smoke.spawn(p,rnd(4*s),12*s+Math.random()*10*s,rnd(4*s),1.5,3*s,5*s,0.9,0.95,1,0.8,0.3,-9);}
// ---------- terrain ----------
function hash(x,y){const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);}
function vnoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 return lerp(lerp(hash(ix,iy),hash(ix+1,iy),u),lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);}
const ISL=[{x:0,z:0,r:3400,h:220},{x:-9000,z:-7000,r:2400,h:420},{x:9000,z:-11000,r:2000,h:260},{x:-5000,z:9000,r:1600,h:180},{x:15000,z:4000,r:2800,h:520},{x:-30000,z:-30000,r:2000,h:160},{x:6000,z:15000,r:1200,h:120},{x:24000,z:-2000,r:3600,h:30}];
const PAD=V3(1500,0,-1700),SILO=V3(-1500,0,-1500),ENEMY=V3(-30000,0,-27000),CARRIER_POS=V3(2500,0,8500);
const NYC=V3(24000,0,-2000);const FLAT=[{x:24000,z:-2000,w:1000,l:2700},{x:0,z:0,w:420,l:1800},{x:PAD.x,z:PAD.z,w:300,l:300},{x:SILO.x,z:SILO.z,w:200,l:200}];
function terrainH(x,z){let best=-9,bi=null;for(const s of ISL){const g=1-Math.hypot(x-s.x,z-s.z)/s.r;if(g>best){best=g;bi=s;}}
 let h;if(best>0){const n=vnoise(x*0.0016,z*0.0016)*0.65+vnoise(x*0.007,z*0.007)*0.35;h=5+bi.h*Math.pow(best,1.4)*(0.35+0.9*n);}else h=5+best*140;
 for(const f of FLAT){const dx=Math.max(0,Math.abs(x-f.x)-f.w),dz=Math.max(0,Math.abs(z-f.z)-f.l);const d=Math.hypot(dx,dz);if(d<500){const t=sstep(0,500,d);h=lerp(6,h,t);}}
 return Math.max(h,-80);}
function waveH(x,z,t){return 0.6*Math.sin(0.02*x+1.1*t)+0.4*Math.sin(0.031*z+0.9*t)+0.25*Math.sin(0.05*(x+z)+1.7*t);}
function buildIsland(s){const size=s.r*2.5,seg=Math.round(clamp(s.r/22,50,isTouch?110:150));const g=new THREE.PlaneGeometry(size,size,seg,seg);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,c=[];for(let i=0;i<p.count;i++){const x=p.getX(i)+s.x,z=p.getZ(i)+s.z,h=terrainH(x,z);p.setY(i,h);
  c.push(0,0,0);}
 g.computeVertexNormals();const nr=g.attributes.normal;for(let i=0;i<p.count;i++){const h=p.getY(i),x=p.getX(i)+s.x,z=p.getZ(i)+s.z;const sl=1-nr.getY(i);const n=fbm(x/300,z/300,3);let col;
  if(Math.abs(x-24000)<1050&&Math.abs(z+2000)<2750&&h>3)col=[0.3+n*0.05,0.3+n*0.05,0.31];else if(h<2.5)col=[0.55,0.5,0.38];else if(h<5.5)col=[0.72,0.66,0.5];else if(h<7&&Math.hypot(x,z)<3600)col=[0.2+n*0.08,0.3+n*0.06,0.12];else{const gr=[0.17+n*0.1,0.27+n*0.08,0.1];const dry=[0.42,0.38,0.24];const rk=[0.36,0.34,0.31];col=gr.map((v,k)=>lerp(v,dry[k],sstep(0.4,0.7,n)));const rs=sstep(0.18,0.4,sl)+sstep(s.h*0.6,s.h*0.85,h);col=col.map((v,k)=>lerp(v,rk[k],clamp(rs,0,1)));if(h>s.h*0.88)col=col.map(v=>lerp(v,0.85,0.6));}
  c[i*3]=col[0];c[i*3+1]=col[1];c[i*3+2]=col[2];}
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));const tm=new THREE.MeshStandardMaterial({vertexColors:true,map:rockTex,normalMap:rockNrm,normalScale:new THREE.Vector2(0.8,0.8),roughness:0.95,metalness:0});tm.map=rockTex.clone();tm.map.repeat.set(size/40,size/40);tm.normalMap=rockNrm.clone();tm.normalMap.repeat.set(size/40,size/40);
 const m=new THREE.Mesh(g,tm);m.receiveShadow=true;m.position.set(s.x,0,s.z);scene.add(m);}
ISL.forEach(buildIsland);
// ---------- ocean ----------
const oceanU={time:{value:0}};
const waterNrm=(()=>{const t=pixTex(256,256,(i,j)=>{const n=fbm(i/16,j/16,4)*0.7+fbm(i/5+40,j/5,2)*0.3;const v=n*255;return [v,v,v];},false);const nt=normalFrom(t.userData.cv,5);nt.repeat.set(1,1);return nt;})();
const ocean=new Water(new THREE.PlaneGeometry(60000,60000),{textureWidth:HIGH?512:256,textureHeight:HIGH?512:256,waterNormals:waterNrm,sunDirection:sunDir.clone(),sunColor:0xffffff,waterColor:0x06283c,distortionScale:2.6,fog:true,alpha:1});
ocean.material.fragmentShader=ocean.material.fragmentShader.replace('( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight )','( waterColor * 0.5 + reflectionSample * 0.42 + reflectionSample * specularLight )').replace('vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;','vec3 scatter = (0.35+max( 0.0, dot( surfaceNormal, eyeDirection ) )) * waterColor;');ocean.rotation.x=-Math.PI/2;ocean.material.uniforms.size.value=2.2;scene.add(ocean);
const farOcean=new THREE.Mesh(new THREE.RingGeometry(29800,900000,64,1).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x0b2a3d,roughness:0.35,metalness:0.2}));farOcean.position.y=-0.3;scene.add(farOcean);
// ---- clouds (instanced camera-facing puffs) ----
const clouds=(()=>{const N=HIGH?1320:660;const geo=new THREE.InstancedBufferGeometry();geo.copy(new THREE.PlaneGeometry(1,1));const off=new Float32Array(N*4);const sh=new Float32Array(N);
 let k=0;const PER=22;for(let c=0;c<Math.floor(N/PER);c++){const cx=rnd(45000),cz=rnd(45000),cy=1500+Math.random()*600;const R=500+Math.random()*700;
  for(let j=0;j<PER;j++){const a=Math.random()*6.283,rr=Math.sqrt(Math.random())*R;const hh=Math.max(0,1-rr/R);const y=Math.random()*R*0.9*hh;off[k*4]=cx+Math.cos(a)*rr;off[k*4+1]=cy+y;off[k*4+2]=cz+Math.sin(a)*rr*0.8;off[k*4+3]=R*(0.35+0.4*Math.random())*(0.6+hh*0.6);sh[k]=0.55+0.45*(y/(R*0.9));k++;}}
 geo.setAttribute('off',new THREE.InstancedBufferAttribute(off,4));geo.setAttribute('shade',new THREE.InstancedBufferAttribute(sh,1));geo.instanceCount=N;
 const mat=new THREE.ShaderMaterial({uniforms:{tex:{value:puffTex},fogC:{value:new THREE.Color()},sunC:{value:new THREE.Color(1,0.97,0.92)}},transparent:true,depthWrite:false,
  vertexShader:`attribute vec4 off;attribute float shade;varying vec2 vUv;varying float vS;varying float vD;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vUv=uv;vS=shade;vec3 cr=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);vec3 cu=vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]);
vec3 wp=off.xyz+(cr*position.x+cu*position.y)*off.w;vec4 mv=viewMatrix*vec4(wp,1.0);vD=-mv.z;gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:`uniform sampler2D tex;uniform vec3 fogC;uniform vec3 sunC;varying vec2 vUv;varying float vS;varying float vD;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
float a=texture2D(tex,vUv).a;if(a<0.02)discard;vec3 c=sunC*mix(vS,vS+0.25,vUv.y)*1.25;float f=1.0-exp(-vD*0.00002);c=mix(c,fogC*1.3,f*0.6);float near=smoothstep(30.0,400.0,vD);gl_FragColor=vec4(c,min(1.0,a*1.35)*near);}`});
 const m=new THREE.Mesh(geo,mat);m.frustumCulled=false;m.renderOrder=2;scene.add(m);return m;})();
const seabed=new THREE.Mesh(new THREE.PlaneGeometry(20000,20000).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x26332b,roughness:1}));scene.add(seabed);

// ---- post processing ----
const composer=new EffectComposer(renderer);composer.setPixelRatio(renderer.getPixelRatio());const rPass=new RenderPass(scene,camera);composer.addPass(rPass);
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),0.3,0.35,0.97);if(HIGH)composer.addPass(bloom);composer.addPass(new OutputPass());
addEventListener('resize',()=>{composer.setSize(innerWidth,innerHeight);});
function renderFrame(sc,cam){rPass.scene=sc;rPass.camera=cam;composer.render();}
