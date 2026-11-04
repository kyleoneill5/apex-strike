// ---------- GFX v3: post stack (N8AO, SMAA, grain, motion blur, heat haze), auto quality, swell+foam ocean, cloud deck, volumetric exhaust, glTF models ----------
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {SMAAPass} from 'three/addons/postprocessing/SMAAPass.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const GQ={tier:settings.quality==='low'?0:(isTouch?1:2),max:settings.quality==='low'?0:2,locked:/[#&]hq/.test(location.hash)||settings.quality==='low',fpsT:0,fpsN:0,good:0,ao:null,smaa:null,cine:null};
if(/[#&]hq/.test(location.hash))GQ.tier=2;
window.__gfx=GQ;
// cinematic pass: motion blur (radial, speed based), heat haze, film grain, vignette, slight chromatic fringe
const CineShader={uniforms:{tDiffuse:{value:null},uT:{value:0},uBlur:{value:0},uHaze:{value:new THREE.Vector3(0.5,0.5,0)},uRes:{value:new THREE.Vector2(1,1)},uGrain:{value:0.035}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uT,uBlur,uGrain;uniform vec3 uHaze;uniform vec2 uRes;varying vec2 vUv;
 float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
 void main(){vec2 uv=vUv;
  // heat haze around exhaust screen point
  if(uHaze.z>0.001){vec2 d=(uv-uHaze.xy)*vec2(uRes.x/uRes.y,1.);float r=length(d);float m=uHaze.z*smoothstep(0.16,0.0,r);
   uv+=m*0.006*vec2(n2(uv*60.+vec2(0.,uT*9.))-.5,n2(uv*60.+vec2(uT*7.,3.))-.5);}
  vec3 c=texture2D(tDiffuse,uv).rgb;
  if(uBlur>0.001){vec2 dir=(uv-0.5);float w=1.;for(int i=1;i<8;i++){float s=float(i)/8.;float k=1.-s*0.5;c+=texture2D(tDiffuse,uv-dir*s*uBlur*0.06*length(dir)*2.).rgb*k;w+=k;}c/=w;}
  vec2 q=vUv-0.5;c*=1.-dot(q,q)*0.55;
  float g=h(vUv*uRes+fract(uT*13.7)*91.)-.5;c+=g*uGrain*(1.1-dot(c,vec3(.33)));
  gl_FragColor=vec4(c,1.);}`};
{const out=composer.passes.find(p=>p.constructor&&p.constructor.name==='OutputPass');
 GQ.cine=new ShaderPass(CineShader);GQ.smaa=new SMAAPass(innerWidth*renderer.getPixelRatio(),innerHeight*renderer.getPixelRatio());
 composer.addPass(GQ.smaa);composer.addPass(GQ.cine);
 bloom.strength=0.42;bloom.radius=0.55;bloom.threshold=0.9;
 addEventListener('resize',()=>{GQ.smaa.setSize(innerWidth*renderer.getPixelRatio(),innerHeight*renderer.getPixelRatio());if(GQ.ao)GQ.ao.setSize(innerWidth,innerHeight);});}
// SSAO via N8AO (handles log depth). Loaded lazily, falls back silently.
if(GQ.max>=2)import('./lib/N8AO.js').then(({N8AOPass})=>{const ao=new N8AOPass(scene,camera,innerWidth,innerHeight);Object.assign(ao.configuration,{aoRadius:4,distanceFalloff:1.5,intensity:2.2,halfRes:true,depthAwareUpsampling:true,aoSamples:12,denoiseSamples:6,gammaCorrection:false});
 GQ.ao=ao;GQ.rPass=rPass;applyTier();}).catch(e=>{GQ.aoErr=String(e);});
function applyTier(){const t=GQ.tier;const pr=t===0?1:t===1?Math.min(devicePixelRatio,1.5):Math.min(devicePixelRatio,isTouch?2:2);
 renderer.setPixelRatio(pr);composer.setPixelRatio(pr);composer.setSize(innerWidth,innerHeight);
 GQ.smaa.enabled=t>=1;bloom.enabled=t>=1&&HIGH;
 if(GQ.ao){const useAO=t>=2;const i=composer.passes.indexOf(GQ.ao),j=composer.passes.indexOf(GQ.rPass);if(useAO&&i<0&&j>=0)composer.passes[j]=GQ.ao;else if(!useAO&&i>=0)composer.passes[i]=GQ.rPass;}
 sun.shadow.mapSize.set(t===2?4096:t===1?2048:1024,t===2?4096:t===1?2048:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.radius=t===2?3:2;
 renderer.shadowMap.enabled=HIGH&&t>=1;GQ.cine.uniforms.uRes.value.set(innerWidth*pr,innerHeight*pr);}
GQ.set=t=>{GQ.tier=clamp(t,0,GQ.max);applyTier();};GQ.lock=t=>{GQ.locked=true;GQ.set(t);};
applyTier();
// soft shadow box sized by vehicle
sun.shadow.camera.left=sun.shadow.camera.bottom=-220;sun.shadow.camera.right=sun.shadow.camera.top=220;sun.shadow.camera.updateProjectionMatrix();sun.shadow.blurSamples=12;
// atmosphere tuning
skyU.rayleigh.value=1.35;skyU.turbidity.value=2.6;skyU.mieCoefficient.value=0.003;skyU.mieDirectionalG.value=0.8;
// ---- ocean: geometric swell matching waveH(), whitecap foam, shoreline-ish foam on crests ----
{const segs=isTouch?160:240;const R=30000;const pos=[],idx=[];const rings=110;
 for(let i=0;i<=rings;i++){const r=i===0?0:R*Math.pow(i/rings,2.6);for(let j=0;j<segs;j++){const a=j/segs*Math.PI*2;pos.push(Math.cos(a)*r,Math.sin(a)*r,0);}}
 for(let i=0;i<rings;i++)for(let j=0;j<segs;j++){const a=i*segs+j,b=i*segs+(j+1)%segs,c=(i+1)*segs+j,d=(i+1)*segs+(j+1)%segs;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(pos.map((_,k)=>k%3==2?1:0),3));g.setIndex(idx);ocean.geometry.dispose();ocean.geometry=g;
 const m=ocean.material;m.uniforms.swT={value:0};
 m.vertexShader=m.vertexShader.replace('void main() {',`uniform float swT;varying float vCrest;
 float wH(vec2 p,float t){return 0.6*sin(0.02*p.x+1.1*t)+0.4*sin(0.031*p.y+0.9*t)+0.25*sin(0.05*(p.x+p.y)+1.7*t);}
 void main() {`).replace('mirrorCoord = modelMatrix * vec4( position, 1.0 );',`vec4 wp0=modelMatrix*vec4(position,1.0);float hh=wH(vec2(wp0.x,wp0.z),swT);vCrest=hh;vec3 pd=position+vec3(0.,0.,hh*(1.0-smoothstep(4000.,9000.,length(position.xy))));
 mirrorCoord = modelMatrix * vec4( pd, 1.0 );`).replace('vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );','vec4 mvPosition =  modelViewMatrix * vec4( pd, 1.0 );');
 m.fragmentShader=m.fragmentShader.replace('varying vec4 worldPosition;','varying vec4 worldPosition;varying float vCrest;').replace('vec3 outgoingLight = albedo;',`
 float slope=1.0-clamp(surfaceNormal.y,0.,1.);vec2 fp=worldPosition.xz;
 float fn=getNoise(fp*3.1).x*0.5+0.5;float foam=smoothstep(0.62,0.95,fn+slope*1.6+max(vCrest-0.75,0.)*0.9)*(1.0-smoothstep(1500.,6000.,distance));
 vec3 outgoingLight = mix(albedo,vec3(0.86,0.9,0.92)*(0.5+0.5*max(dot(sunDirection,vec3(0,1,0)),0.)),foam*0.55);`);
 m.needsUpdate=true;ocean.receiveShadow=false;}
// ---- high stratocumulus deck (fbm, sun-lit edges) for depth & scale ----
const cloudDeck=(()=>{const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uT:{value:0},sunDir:{value:sunDir},sunC:{value:new THREE.Color(1,0.96,0.9)},fogC:{value:new THREE.Color(0xa8c8e8)}},
 vertexShader:`varying vec3 vW;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;
#include <logdepthbuf_vertex>
}`,fragmentShader:`uniform float uT;uniform vec3 sunDir,sunC,fogC;varying vec3 vW;
#include <common>
#include <logdepthbuf_pars_fragment>
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<6;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
#include <logdepthbuf_fragment>
vec2 p=vW.xz/5200.+vec2(uT*0.004,uT*0.0015);float d=fb(p);float cov=smoothstep(0.6,0.86,d);if(cov<0.01)discard;
float dl=fb(p+sunDir.xz*0.035);float lit=clamp(0.55+(d-dl)*5.0,0.25,1.25);
float dist=length(vW.xz-cameraPosition.xz);float elev=abs(vW.y-cameraPosition.y)/max(dist,1.);float fade=(1.-smoothstep(8000.,40000.,dist))*smoothstep(0.03,0.25,elev);
float below=step(vW.y,cameraPosition.y);vec3 col=mix(vec3(0.62,0.66,0.72),sunC*1.15,lit);col=mix(col,vec3(0.95),below*0.25);col=mix(col,fogC,smoothstep(20000.,120000.,dist)*0.7);
gl_FragColor=vec4(col,cov*0.8*fade);}`});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(300000,300000).rotateX(-Math.PI/2),m);mesh.position.y=3600;mesh.renderOrder=1;mesh.frustumCulled=false;scene.add(mesh);return mesh;})();
// ---- volumetric afterburner/exhaust cone (fresnel + noise, additive) for jets ----
const exhMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uT:{value:0},uI:{value:0}},
 vertexShader:`varying vec2 vUv;varying vec3 vN,vV;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:`uniform float uT,uI;varying vec2 vUv;varying vec3 vN,vV;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
float y=vUv.y;float rim=pow(abs(dot(vN,vV)),1.5);float diam=0.5+0.5*sin(y*48.-uT*6.);diam=pow(diam,6.)*smoothstep(0.35,0.95,y);
float core=smoothstep(0.0,0.6,y)*rim;vec3 c=mix(vec3(1.0,0.62,0.28),vec3(0.6,0.7,1.0),smoothstep(0.6,1.,y));c+=vec3(1.,.9,.8)*diam*0.8;
gl_FragColor=vec4(c*(core*0.9+diam*rim)*uI,1.);}`});
let exhMesh=null,exhFor=null;const _hz=new THREE.Vector3();
function attachExhaust(v){if(exhMesh&&exhMesh.parent)exhMesh.parent.remove(exhMesh);exhMesh=null;exhFor=v;if(!v||v.def.cls!=='air'||!v.mesh)return;
 const bb=new THREE.Box3().setFromObject(v.mesh);const inv=v.mesh.matrixWorld.clone().invert();bb.applyMatrix4(inv);const L=bb.max.z-bb.min.z;const twin=v.kind==='fa18'||v.kind==='sr71';
 const g=new THREE.Group();for(const s of (twin?[-1,1]:[0])){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.55,1,24,8,true).translate(0,-0.5,0).rotateX(-Math.PI/2),exhMat);c.position.x=s*(v.kind==='sr71'?4.35:0.75);g.add(c);}
 g.position.set(0,(bb.min.y+bb.max.y)*0.5-0.1,bb.max.z-0.2);if(v.kind==='sr71')g.position.set(0,0.33,14.35);g.userData.L=L;g.rotation.x=Math.PI;v.mesh.add(g);exhMesh=g;}
// ---- glTF model library (meshopt-compressed, relative paths, procedural fallback) ----
const MODELS={crawler:{url:'models/crawler.glb',len:40,credit:'NASA'}};const GL=new GLTFLoader();GL.setMeshoptDecoder(MeshoptDecoder);
function loadModel(k){const d=MODELS[k];return new Promise((res,rej)=>GL.load(d.url,g=>{const o=g.scene;const bb=new THREE.Box3().setFromObject(o);const sz=bb.getSize(new THREE.Vector3());const s=d.len/Math.max(sz.x,sz.z);o.scale.setScalar(s);
 const c=bb.getCenter(new THREE.Vector3());o.position.set(-c.x*s,-bb.min.y*s,-c.z*s);const w=new THREE.Group();w.add(o);o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(m.material){m.material.envMapIntensity=1;}}});res(w);},undefined,rej));}
window.__models={MODELS,loaded:{}};
if(GQ.max>=1)loadModel('crawler').then(w=>{w.position.set(90,0,70);w.rotation.y=0.6;LC39.add(w);window.__models.loaded.crawler=true;}).catch(e=>{window.__models.err=String(e);});
// ---- per-frame: auto quality scaler, motion blur, haze, grain, swell, cloud deck ----
{const _r=render;let lastP=null;render=function(rdt){const t0=performance.now();
 const m=ocean.material.uniforms;m.swT.value=simT;exhMat.uniforms.uT.value=simT;cloudDeck.material.uniforms.uT.value=simT;cloudDeck.position.x=Math.round(camera.position.x/5000)*5000;cloudDeck.position.z=Math.round(camera.position.z/5000)*5000;
 if(scene.fog)cloudDeck.material.uniforms.fogC.value.copy(scene.fog.color);
 const v=player;if(v!==exhFor)attachExhaust(v);let spd=0,haze=0;
 if(v){spd=camFollow&&camFollow.vel?camFollow.vel.length():v.vel?v.vel.length():v.os?Math.hypot(v.os.vs,v.os.vh):0;
  if(exhMesh){const ab=inp.throttle>0.85?1:inp.throttle*0.5;exhMat.uniforms.uI.value=ab*1.4;exhMesh.scale.set(1,1,0.5+ab*(v.kind==='sr71'?6:3.6));exhMesh.visible=ab>0.05;
   _hz.set(0,0,exhMesh.userData.L*0.5+2).applyMatrix4(v.mesh.matrixWorld);haze=ab;}
  else if(v.def.cls==='rocket'&&v.os&&v.os.engine&&v.os.throttle>0&&v.view==='ship'){_hz.copy(padRocket.position);haze=Math.max(0,1-v.os.h/3000);}}
 const u=GQ.cine.uniforms;u.uT.value=simT;u.uBlur.value=GQ.tier>=1?clamp((spd-180)/900,0,1)*0.6:0;
 if(haze>0.01){const s=_hz.clone().project(camera);if(s.z<1&&Math.abs(s.x)<1.3&&Math.abs(s.y)<1.3){u.uHaze.value.set(s.x*0.5+0.5,s.y*0.5+0.5,haze);}else u.uHaze.value.z=0;}else u.uHaze.value.z=0;
 _r(rdt);
 if(!GQ.locked){GQ.fpsT+=rdt;GQ.fpsN++;if(GQ.fpsT>2){const fps=GQ.fpsN/GQ.fpsT;GQ.fps=fps;GQ.fpsT=0;GQ.fpsN=0;if(fps<42&&GQ.tier>0){GQ.set(GQ.tier-1);GQ.good=0;}else if(fps>58){if(++GQ.good>=3&&GQ.tier<GQ.max){GQ.set(GQ.tier+1);GQ.good=0;}}else GQ.good=0;}}};}
// N8AO renders its own beauty pass: keep its scene/camera in sync with renderFrame
{const _rf=renderFrame;renderFrame=function(sc,cam){if(GQ.ao){GQ.ao.scene=sc;GQ.ao.camera=cam;}_rf(sc,cam);};}

// keep cloud deck out of the water mirror (avoids dark blotches in reflections)
{const ob=ocean.onBeforeRender;ocean.onBeforeRender=function(...a){const v=cloudDeck.visible;cloudDeck.visible=false;ob.apply(this,a);cloudDeck.visible=v;};}
