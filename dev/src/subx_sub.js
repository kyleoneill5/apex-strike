// ================= subx_sub.js (#23): Ohio SSBN ultra-realistic look + realistic 3rd-person submerged launch =================
// Look-only override, loaded AFTER gsub.js. Does not change sub physics/depth/weapons. Hooks gsub's #3 launch cam (window.__sub.SUBX.lc).
{const T=THREE;const SX={ts:1,seq:null,hn:0,lowFx:!!isTouch};window.__subx=SX;
 const HATCH=[];for(let i=0;i<12;i++)for(const sx of[-1,1])HATCH.push(new T.Vector3(sx*1.3,5.5,-14+i*2.9));
 // ---------- procedural PBR hull shader: anechoic tiles + seams, missing tiles, rust/salt streaks, wet sheen, caustics, rim silhouette, open-hatch holes ----------
 const GLSL_H=`float sxH(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
 float sxN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(sxH(i),sxH(i+vec2(1,0)),f.x),mix(sxH(i+vec2(0,1)),sxH(i+1.),f.x),f.y);}
 float sxC(vec2 p,float t){p*=.33;float c=0.;for(int i=0;i<3;i++){p+=vec2(sin(p.y*1.3+t*.9),cos(p.x*1.1-t*.7))*.6;c+=pow(max(0.,1.-abs(sin(p.x)*sin(p.y))*1.6),6.);p*=1.7;}return c*.5;}`;
 function hullMat(uni){const m=new T.MeshStandardMaterial({color:0xffffff,roughness:0.85,metalness:0.0,dithering:true});
  m.onBeforeCompile=s=>{Object.assign(s.uniforms,uni);
   s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSXw;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvSXw=(modelMatrix*vec4(transformed,1.)).xyz;');
   s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vSXw;uniform mat4 uSXinv;uniform float uSXt,uSXuw;uniform vec4 uSXh[24];\n${GLSL_H}`)
   .replace('#include <color_fragment>',`#include <color_fragment>
    vec3 gp=(uSXinv*vec4(vSXw,1.)).xyz;
    for(int i=0;i<24;i++){vec4 h=uSXh[i];if(h.w>.5&&gp.y>4.6&&length(gp.xz-h.xz)<.93)discard;}
    float ang=atan(gp.x,gp.y)*5.1;vec2 tc=vec2(ang/.62,gp.z/.62);tc.x+=mod(floor(tc.y),2.)*.5;vec2 tf=fract(tc);
    float seam=smoothstep(0.,.05,min(tf.x,1.-tf.x))*smoothstep(0.,.05,min(tf.y,1.-tf.y));float th=sxH(floor(tc));
    vec3 tile=vec3(.055,.062,.070)*(.45+1.15*th);
    if(th>.993)tile=vec3(.10,.09,.08);           // missing tile: bare primer
    float sc=sxN(vec2(gp.z*1.7,floor(ang*1.5)))*sxN(vec2(gp.z*.3,gp.y*.6));
    float salt=smoothstep(.55,.9,sxN(gp.zx*vec2(.25,2.)+3.))*smoothstep(1.,3.5,gp.y)*(1.-smoothstep(4.8,5.3,gp.y));
    float rust=smoothstep(.72,.95,sxN(vec2(gp.z*2.4,1.)))*smoothstep(.5,1.,sxN(vec2(gp.z*2.4,gp.y*.35)))*smoothstep(2.,5.,gp.y);
    tile=mix(tile,vec3(.30,.31,.29),salt*.35);tile=mix(tile,vec3(.22,.10,.05),rust*.55);tile*=mix(.55,1.,seam);tile*=.9+.2*sc;
    diffuseColor.rgb=tile;`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    float wet=1.-smoothstep(-.2,2.5,vSXw.y);roughnessFactor=mix(.86,.32,clamp(wet+ (vSXw.y<-.2?0.:.0),0.,1.)*(1.-uSXuw*.6));roughnessFactor=mix(roughnessFactor,.95,1.-seam);`)
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    if(vSXw.y<0.){float dk=exp(vSXw.y/14.);totalEmissiveRadiance+=vec3(.16,.34,.36)*sxC(vSXw.xz,uSXt)*dk*smoothstep(3.,5.,gp.y)*.6;}
    vec3 vv=normalize(vViewPosition);float rim=pow(1.-abs(dot(normalize(vNormal),vv)),3.);totalEmissiveRadiance+=vec3(.05,.16,.2)*rim*uSXuw;`);};
  m.customProgramCacheKey=()=>'subx_hull1';return m;}
 const L1=[],uniList=[];
 const _sb=sub;
 sub=function(){const g=_sb();const uni={uSXinv:{value:new T.Matrix4()},uSXt:{value:0},uSXuw:{value:0},uSXh:{value:HATCH.map(h=>new T.Vector4(h.x,h.y,h.z,0))}};uniList.push(uni);
  const hm=hullMat(uni);let hull=null;const oldHull=g.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type!=='TorusGeometry');
  g.traverse(o=>{if(!o.isMesh)return;const gt=o.geometry.type;
   if(gt==='CylinderGeometry'&&Math.abs(o.position.y-5.08)<0.05&&o.geometry.parameters.radiusTop===1.0){o.visible=false;return;} // old flat hatch discs
   if(gt==='TorusGeometry'){o.visible=false;return;} // old fake rings -> shader seams
   if(oldHull&&o.material===oldHull.material){o.material=hm;if(!hull)hull=o;}});
  if(hull)hull.onBeforeRender=()=>{uni.uSXinv.value.copy(g.matrixWorld).invert();};
  // missile deck casing ("turtleback") aft of sail
  const cas=new T.Mesh(new T.BoxGeometry(6.4,1.4,37,1,1,1),hm);cas.position.set(0,4.8,2.3);g.add(cas);
  for(const s of[-1,1]){const f=new T.Mesh(new T.CylinderGeometry(0.7,0.7,37,10,1,false,s>0?0:Math.PI,Math.PI).rotateX(Math.PI/2),hm);f.position.set(s*3.2,4.8,2.3);g.add(f);}
  // hatches: hinged doors + tube interior + phenolic membrane
  const doorM=hm, tubeM=new T.MeshStandardMaterial({color:0x2a2e30,roughness:0.6,metalness:0.6,side:T.BackSide,dithering:true}),memM=new T.MeshStandardMaterial({color:0x8a6a44,roughness:0.75,metalness:0,dithering:true});
  const doorG=new T.CylinderGeometry(1.0,1.0,0.22,28).translate(0,0.11,-1.0),rimG=new T.TorusGeometry(1.0,0.07,6,28).rotateX(Math.PI/2),tubeG=new T.CylinderGeometry(0.94,0.94,10,20,1,true).translate(0,-5,0),botG=new T.CircleGeometry(0.94,20).rotateX(-Math.PI/2),memG=new T.SphereGeometry(0.94,18,6,0,Math.PI*2,0,0.5).translate(0,-0.95,0);
  const hingeG=new T.BoxGeometry(0.9,0.18,0.25),hingeM=new T.MeshStandardMaterial({color:0x222426,roughness:0.5,metalness:0.7});
  const H=[];HATCH.forEach((h,i)=>{const pv=new T.Group();pv.position.set(h.x,h.y,h.z+1.0);const d=new T.Mesh(doorG,doorM);pv.add(d);g.add(pv);
   const rim=new T.Mesh(rimG,hingeM);rim.position.set(h.x,h.y+0.02,h.z);g.add(rim);const hg=new T.Mesh(hingeG,hingeM);hg.position.set(h.x,h.y+0.05,h.z+1.05);g.add(hg);
   const tube=new T.Group();tube.position.copy(h);tube.visible=false;tube.add(new T.Mesh(tubeG,tubeM));const b=new T.Mesh(botG,tubeM);b.position.y=-9.9;tube.add(b);const mem=new T.Mesh(memG,memM);tube.add(mem);g.add(tube);
   H.push({pv,tube,mem,a:0,tgt:0,u:uni.uSXh.value[i]});});
  g.userData.subx={H,uni};
  // markings: low-vis hull number on sail, draft marks exist (gdetail_sea)
  const cv=document.createElement('canvas');cv.width=256;cv.height=96;{const x=cv.getContext('2d');x.clearRect(0,0,256,96);x.fillStyle='rgba(190,190,180,0.55)';x.font='bold 70px Arial';x.textAlign='center';x.fillText('730',128,75);}
  const nt=new T.CanvasTexture(cv);nt.colorSpace=T.SRGBColorSpace;nt.anisotropy=4;const nm=new T.MeshStandardMaterial({map:nt,transparent:true,roughness:0.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  for(const s of[-1,1]){const p=new T.Mesh(new T.PlaneGeometry(2.4,0.9),nm);p.position.set(s*1.62,9.2,-24);p.rotation.y=s*Math.PI/2;g.add(p);}
  // extra sail masts: periscopes (2), ESM, comms whip, snorkel head
  const mm=new T.MeshStandardMaterial({color:0x1b1d1f,roughness:0.55,metalness:0.4});
  for(const [x,z,h,r] of[[0.25,-24.5,4.2,0.2],[-0.25,-25.5,3.6,0.16],[0,-23,2.6,0.28],[0.45,-27,5.2,0.05],[-0.5,-22,2.2,0.35]]){const c=new T.Mesh(new T.CylinderGeometry(r*0.8,r,h,10),mm);c.position.set(x,11.9+h/2,z);c.userData.mast=1;c.visible=false;g.add(c);}
  return g;};
 // ---------- shared FX pools ----------
 function dot(c0,c1){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,c0);gr.addColorStop(0.6,c1);gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);return t;}
 function ring(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(26,24,2,32,32,30);gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.35,'rgba(200,240,255,0.15)');gr.addColorStop(0.8,'rgba(220,250,255,0.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);}
 class Pool{constructor(n,tex,size,col,add){this.n=n;this.i=0;const g=new T.BufferGeometry();this.P=new Float32Array(n*3).fill(-1e5);this.V=new Float32Array(n*3);this.L=new Float32Array(n);this.S=new Float32Array(n);this.K=new Uint8Array(n);
   g.setAttribute('position',new T.BufferAttribute(this.P,3));g.setAttribute('sz',new T.BufferAttribute(this.S,1));
   const m=new T.ShaderMaterial({uniforms:{map:{value:tex},col:{value:new T.Color(col)},ps:{value:size*innerHeight/2}},transparent:true,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending,
    vertexShader:'attribute float sz;varying float vA;uniform float ps;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vA=clamp(sz,0.,1.);gl_PointSize=clamp(ps*max(sz,.0)/-mv.z,0.,96.);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform sampler2D map;uniform vec3 col;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);float d=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5)/255.;gl_FragColor=vec4(col*t.rgb+d,t.a*min(1.,vA*3.));if(gl_FragColor.a<.01)discard;}'});
   this.pts=new T.Points(g,m);this.pts.frustumCulled=false;this.g=g;scene.add(this.pts);}
  spawn(p,vx,vy,vz,life,size,kind){const i=this.i;this.i=(i+1)%this.n;this.P[i*3]=p.x;this.P[i*3+1]=p.y;this.P[i*3+2]=p.z;this.V[i*3]=vx;this.V[i*3+1]=vy;this.V[i*3+2]=vz;this.L[i]=life;this.S[i]=size;this.K[i]=kind;}
  upd(dt){const P=this.P,V=this.V;for(let i=0;i<this.n;i++){if(this.L[i]<=0){if(this.S[i]!==0){this.S[i]=0;P[i*3+1]=-1e5;}continue;}this.L[i]-=dt;
    if(this.K[i]===0){V[i*3+1]+=(P[i*3+1]<0?2.5:-30)*dt;V[i*3]*=1-1.5*dt;V[i*3+2]*=1-1.5*dt;if(P[i*3+1]>-0.1){this.L[i]=0;}P[i*3]+=Math.sin(simT*7+i)*0.3*dt;}// bubble: buoyant, pops at surface
    else{V[i*3+1]-=9.8*dt;V[i*3]*=1-0.4*dt;V[i*3+2]*=1-0.4*dt;if(P[i*3+1]<-0.3)this.L[i]=0;}// droplet/spray: gravity, dies in water
    P[i*3]+=V[i*3]*dt;P[i*3+1]+=V[i*3+1]*dt;P[i*3+2]+=V[i*3+2]*dt;if(this.K[i]===0)this.S[i]=Math.min(this.S[i]*(1+0.08*dt),2.5);}
   this.g.attributes.position.needsUpdate=true;this.g.attributes.sz.needsUpdate=true;}}
 const NB=SX.lowFx?420:700,NS=SX.lowFx?360:600;
 const bub=new Pool(NB,ring(),1.0,0xd8f4ff,false),spr=new Pool(NS,dot('rgba(255,255,255,1)','rgba(235,245,250,0.5)'),1.0,0xf4f8fa,false);SX.bub=bub;SX.spr=spr;
 // gas bubble / cavity / breach dome: fresnel water-air interface shader
 const ifM=new T.ShaderMaterial({uniforms:{op:{value:0},tint:{value:new T.Color(0xdff6ff)}},transparent:true,depthWrite:false,side:T.DoubleSide,
  vertexShader:'varying vec3 vN,vV;varying vec3 vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vP=position;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float op;uniform vec3 tint;varying vec3 vN,vV,vP;void main(){float f=pow(1.-abs(dot(vN,vV)),2.2);float n=fract(sin(dot(floor(vP*6.),vec3(12.9,78.2,37.7)))*43758.5);float d=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5)/255.;gl_FragColor=vec4(tint*(0.7+0.5*f)+d,op*(0.12+0.85*f)*(0.85+0.15*n));}'});
 const gasB=new T.Mesh(new T.SphereGeometry(1,28,18),ifM.clone());gasB.visible=false;gasB.frustumCulled=false;scene.add(gasB);
 const cav=new T.Mesh(new T.SphereGeometry(1,24,16),ifM.clone());cav.visible=false;scene.add(cav);
 const domeM=new T.MeshStandardMaterial({color:0xcfe4ea,roughness:0.35,metalness:0,transparent:true,opacity:0.9,dithering:true});
 const dome=new T.Mesh(new T.SphereGeometry(1,28,14,0,Math.PI*2,0,Math.PI/2),domeM);dome.visible=false;scene.add(dome);
 const ign=new T.PointLight(0xffc27a,0,600,1.6);scene.add(ign); // always present (no shader recompile)
 // wake foam strip + bow wave (surface)
 const wc=document.createElement('canvas');wc.width=128;wc.height=512;{const x=wc.getContext('2d');x.clearRect(0,0,128,512);for(let i=0;i<2600;i++){const v=i/2600,y=Math.random()*512,sp=10+y/512*54;const xx=64+(Math.random()-0.5)*2*sp*(Math.random()<0.6?1:0.4);x.fillStyle=`rgba(255,255,255,${(0.08+Math.random()*0.18)*(1-y/600)})`;x.beginPath();x.arc(xx,y,1+Math.random()*3,0,7);x.fill();}}
 const wt=new T.CanvasTexture(wc);const wake=new T.Mesh(new T.PlaneGeometry(26,180).rotateX(-Math.PI/2).translate(0,0,90),new T.MeshBasicMaterial({map:wt,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-4}));wake.visible=false;wake.renderOrder=2;scene.add(wake);
 // ---------- alarm (muffled two-tone, lowpassed) + hull vibration ----------
 let AC=null;function alarm(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=650;o.type='square';
   for(let i=0;i<6;i++){o.frequency.setValueAtTime(i%2?520:690,t+i*0.32);}g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.05,t+0.05);g.gain.setValueAtTime(0.05,t+1.8);g.gain.linearRampToValueAtTime(0,t+2.0);o.connect(f);f.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+2.05);
   const n=AC.createBufferSource(),bf=AC.createBuffer(1,AC.sampleRate*1.2,AC.sampleRate),d=bf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*4);n.buffer=bf;const nf=AC.createBiquadFilter();nf.type='lowpass';nf.frequency.value=180;const ng=AC.createGain();ng.gain.value=0.35;n.connect(nf);nf.connect(ng);ng.connect(AC.destination);SX._thump=()=>{try{const s=AC.createBufferSource();s.buffer=bf;s.connect(nf);s.start();}catch(e){}};}catch(e){}}
 // ---------- launch sequence ----------
 const _v=new T.Vector3(),_v2=new T.Vector3(),_q=new T.Quaternion(),_cp=new T.Vector3(),_ct=new T.Vector3();
 function hatchWorld(v,i,out){return out.copy(HATCH[i]).applyMatrix4(v.mesh.matrixWorld);}
 function begin(v,o,kind){const u=v.mesh.userData.subx;if(!u||!o||!o.pos)return;const i=SX.hn%24;SX.hn++;v.mesh.updateMatrixWorld(true);
  const hw=hatchWorld(v,i,new T.Vector3());const tube=hw.clone().addScaledVector(_v.set(0,1,0).applyQuaternion(v.mesh.quaternion),-6);
  const sub_=v.depth>3;SX.seq={v,o,i,u,t:0,t0:simT,hw,tube,kind,sub:sub_,hold:sub_?(kind==='SLBM'?1.25:0.6):0,br:0,ig:0,cam0:camera.position.clone()};
  if(sub_){o.pos.copy(tube);if(o.mesh)o.mesh.position.copy(tube);}
  u.H[i].tgt=1;u.H[i].tube.visible=true;u.H[i].mem.visible=true;alarm();
  if(!SX.tsHook){SX.tsHook=1;const prev=window.__gmsl2TS;window.__gmsl2TS=()=>(SX.seq&&!SX.seq.ig&&SX.seq.sub)?1:(prev?prev():(camFollow&&camFollow.type==='ballistic'?5:1));}}
 // per-substep: hold missile in tube until ejection; keep motor clock frozen while underwater (avoids underwater 'impact' at o.t>5)
 const _up=updProjs;updProjs=function(dt){const S=SX.seq;const r=_up(dt);if(S&&S.sub&&projs.indexOf(S.o)>=0){const o=S.o;
   if(simT-S.t0<S.hold){o.pos.copy(S.tube);if(o.vel)o.vel.set(0,5,0);if(o.mesh)o.mesh.position.copy(S.tube);}
   if(o.pos.y<0&&o.t!==undefined)o.t=Math.min(o.t,3.5);}return r;};
 const _lb=launchBallistic;launchBallistic=function(v,w){const n=projs.length;const r=_lb(v,w);if(v&&v===player&&v.def.cls==='sub'&&projs.length>n)begin(v,projs[projs.length-1],w);return r;};
 const _fw=fireWeapon;fireWeapon=function(v){const n=projs.length;const w=v&&v.weapons?v.weapons[v.wi]:'';const r=_fw(v);
  if(v&&v===player&&v.def.cls==='sub'&&w==='HYPERSONIC'&&projs.length>n)begin(v,projs[projs.length-1],w);return r;};
 function seqUpd(dt){const S=SX.seq;if(!S)return;S.t=simT-S.t0;const o=S.o,alive=projs.indexOf(o)>=0;const H=S.u.H[S.i];
  if(S.sub&&S.t<S.hold&&alive){
   if(Math.random()<dt*25)bub.spawn(_v.copy(S.hw).add(_v2.set((Math.random()-0.5)*1.6,0.2,(Math.random()-0.5)*1.6)),0,1.5,0,6,0.35+Math.random()*0.3,0);}
  // ejection pulse
  if(S.sub&&!S.ej&&S.t>=S.hold){S.ej=simT;H.mem.visible=false;if(SX._thump)SX._thump();SX.ts=0.55;
   for(let k=0;k<(SX.lowFx?60:110);k++){const a=Math.random()*6.283,r=Math.random()*2.5;bub.spawn(_v.copy(S.hw).add(_v2.set(Math.cos(a)*r,Math.random()*2,Math.sin(a)*r)),Math.cos(a)*(3+Math.random()*6),3+Math.random()*9,Math.sin(a)*(3+Math.random()*6),5+Math.random()*4,0.4+Math.random()*0.9,0);}
   gasB.visible=true;}
  if(gasB.visible&&S.ej){const k=(simT-S.ej);const s=1.2+k*7;gasB.scale.set(s*0.8,s*1.25,s*0.8);gasB.position.copy(S.hw).add(_v.set(0,s*0.9,0));gasB.material.uniforms.op.value=Math.max(0,0.9-k*0.55);if(k>1.7||gasB.position.y>-0.5)gasB.visible=false;}
  // rising: cavity + bubble column
  const p=o.pos;
  if(alive&&S.ej&&p.y<-0.8){cav.visible=true;cav.position.copy(p).add(_v.set(0,7,0));cav.scale.set(1.6,10,1.6);cav.material.uniforms.op.value=0.7;
   const nb=SX.lowFx?2:4;for(let k=0;k<nb;k++)bub.spawn(_v.copy(p).add(_v2.set((Math.random()-0.5)*2.6,Math.random()*3,(Math.random()-0.5)*2.6)),(Math.random()-0.5)*2,1+Math.random()*3,(Math.random()-0.5)*2,7+Math.random()*4,0.3+Math.random()*0.7,0);}
  else cav.visible=false;
  // breach
  if(alive&&S.ej&&!S.br&&p.y>-1.5){S.br=simT;SX.ts=0.6;dome.visible=true;
   for(let k=0;k<(SX.lowFx?220:380);k++){const a=Math.random()*6.283,r=Math.random()*3,up=12+Math.random()*30;spr.spawn(_v.set(p.x+Math.cos(a)*r,0.3,p.z+Math.sin(a)*r),Math.cos(a)*(2+Math.random()*9),up,Math.sin(a)*(2+Math.random()*9),2+Math.random()*1.5,0.5+Math.random()*1.4,1);}
   for(let k=0;k<(SX.lowFx?16:30);k++)smoke.spawn(_v.set(p.x,1,p.z),rnd(6),3+Math.random()*12,rnd(6),4+Math.random()*3,4,9,0.95,0.97,1,0.55,0.6,-2);}
  if(S.br){const k=simT-S.br;const h=Math.max(0,Math.sin(Math.min(1,k/1.6)*Math.PI))*7,r=3.5+k*5;dome.position.set(S.hw.x,0,S.hw.z);dome.scale.set(r,h+0.01,r);domeM.opacity=0.9*Math.max(0,1-k/1.8);if(k>1.8)dome.visible=false;if(k>0.8&&SX.ts<1)SX.ts=1;}
  // first-stage ignition just above surface
  if(alive&&S.br&&!S.ig&&p.y>6){S.ig=simT;for(let k=0;k<(SX.lowFx?24:40);k++)smoke.spawn(_v.set(p.x,2,p.z),rnd(14),2+Math.random()*10,rnd(14),5+Math.random()*4,6,14,0.96,0.95,0.93,0.7,0.6,-3);}
  if(S.ig){const k=simT-S.ig;ign.position.copy(p).add(_v.set(0,-6,0));ign.intensity=k<4?(isTouch?3500:6000)*Math.min(1,k*4)*(1-k/4):0;}
  if(S.ej&&!S.br&&SX.ts<1&&simT-S.ej>0.9)SX.ts=1;
  // hatch close after missile is clear
  if((S.br&&simT-S.br>1.5)||!alive)H.tgt=0;
  if(S.t>14||(!alive&&S.t>3)){SX.ts=1;ign.intensity=0;cav.visible=false;H.tgt=0;SX.seq=null;}}
 let hT=0;function hatchUpd(){const dt=Math.max(0,Math.min(0.1,simT-hT));hT=simT;const v=player;if(!v||!v.mesh||!v.mesh.userData.subx)return;for(const h of v.mesh.userData.subx.H){if(h.a===h.tgt&&h.a===0)continue;const sp=h.tgt>h.a?0.9:0.5;h.a=clamp(h.a+(h.tgt>h.a?1:-1)*sp*dt,0,1);if(Math.abs(h.a-h.tgt)<0.002)h.a=h.tgt;
   const e=h.a<0.5?2*h.a*h.a:1-Math.pow(-2*h.a+2,2)/2;h.pv.rotation.x=e*1.92;h.u.w=h.a>0.04?1:0;if(h.a===0){h.tube.visible=false;}}}
 // ---------- per-frame: surface wake/bow wave, propulsor bubbles, shader uniforms ----------
 let acc=0;
 function envUpd(dt){const v=player;bub.upd(dt);spr.upd(dt);for(const u of uniList){u.uSXt.value=simT;u.uSXuw.value=camera.position.y<0?1:0;}
  if(!v||!v.def||v.def.cls!=='sub'){wake.visible=false;return;}
  const m=v.mesh,f=_v.set(-Math.sin(v.hdg),0,-Math.cos(v.hdg)),spd=Math.abs(v.spd||0);m.traverse(o=>{if(o.userData.mast)o.visible=v.depth<20;});
  const surf=v.depth<3;wake.visible=surf&&spd>0.5;if(wake.visible){wake.position.set(m.position.x,waveH(m.position.x,m.position.z,simT)*0+0.15,m.position.z).addScaledVector(f,-40);wake.rotation.y=v.hdg;wake.material.opacity=Math.min(0.85,spd/8);}
  acc+=dt;if(acc<1/30)return;const st=acc;acc=0;
  if(surf&&spd>1.2){const bow=_v2.copy(m.position).addScaledVector(f,52).setY(0.3);const sd=_cp.set(f.z,0,-f.x);
   const n=Math.ceil(spd*0.6*(SX.lowFx?0.6:1));for(let k=0;k<n;k++){const s=Math.random()<0.5?-1:1;spr.spawn(_ct.copy(bow).addScaledVector(sd,s*(1+Math.random()*3)),sd.x*s*spd*0.5+f.x*spd*0.6,1.5+Math.random()*spd*0.5,sd.z*s*spd*0.5+f.z*spd*0.6,0.6+Math.random()*0.6,0.4+Math.random()*0.7,1);}
   if(Math.random()<spd*0.08){const dk=_ct.copy(m.position).addScaledVector(f,30+Math.random()*15).addScaledVector(sd,(Math.random()-0.5)*8).setY(0.5);spr.spawn(dk,sd.x*(Math.random()-0.5)*4,1+Math.random()*2,sd.z*(Math.random()-0.5)*4,0.8,0.6,1);}}// deck wash
  if(!surf&&spd>0.8){const tail=_v2.copy(m.position).addScaledVector(f,-57).setY(m.position.y);const n=SX.lowFx?2:3;for(let k=0;k<n;k++)bub.spawn(_ct.copy(tail).add(_cp.set((Math.random()-0.5)*3,(Math.random()-0.5)*3,(Math.random()-0.5)*3)),-f.x*spd*0.3,0.5,-f.z*spd*0.3,4+Math.random()*4,0.25+Math.random()*0.4,0);}}
 const _ue=updEnv;updEnv=function(dt){_ue(dt);try{envUpd(dt);hatchUpd(dt);seqUpd(dt);}catch(e){console.warn('subx',e);}};
 // camera: hook gsub's #3 launch cam - cinematic ease-in near sail/deck during hatch+ejection, hull vibration shake
 const _uc=updCamera;updCamera=function(dt){_uc(dt);const S=SX.seq;if(!S||!S.sub)return;const L=window.__sub&&window.__sub.SUBX&&window.__sub.SUBX.lc;const v=S.v;
  const f=_v.set(-Math.sin(v.hdg),0,-Math.cos(v.hdg)),sd=_v2.set(f.z,0,-f.x);const tE=S.ej?simT-S.ej:0;
  const close=S.br?0:(S.ej?Math.max(0,1-tE/2.4):1);
  if(close>0){const w=Math.min(1,S.t/0.9)*close;w>0;
   _cp.copy(S.hw).addScaledVector(sd,30).addScaledVector(f,-14);_cp.y=S.hw.y+7+(S.ej?tE*4:0);_ct.copy(S.hw).add(_ct.set(0,S.ej?2+tE*5:1,0));
   const e=w*w*(3-2*w);camera.position.lerp(_cp,e);if(!L){camera.lookAt(_ct);}else{const q0=camera.quaternion.clone();camera.lookAt(_ct);const q1=camera.quaternion.clone();camera.quaternion.copy(q0).slerp(q1,e);}}
  const sh=(S.t<S.hold?0.05:0)+(S.ej&&tE<0.5?0.25*(1-tE/0.5):0)+(S.br&&simT-S.br<0.6?0.15:0);if(sh>0){camera.position.x+=(Math.random()-0.5)*sh;camera.position.y+=(Math.random()-0.5)*sh;}};
 // slow-mo during ejection + breach only
 const _tk=tick;tick=function(dt){_tk(dt*(SX.ts||1));};
 SX.state=()=>{const S=SX.seq;return S?{t:+S.t.toFixed(2),ej:!!S.ej,br:!!S.br,ig:!!S.ig,y:+S.o.pos.y.toFixed(1),hatch:S.i,ha:+S.u.H[S.i].a.toFixed(2),ts:SX.ts}:null;};
}
