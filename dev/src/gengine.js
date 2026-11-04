// ===== v4 rocket engines: contoured regen bells, Merlin octaweb, gimbal, shader plumes, liftoff dust =====
{const cv=document.createElement('canvas');cv.width=512;cv.height=256;const x=cv.getContext('2d');
 const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#b8794a');gr.addColorStop(0.18,'#c99a63');gr.addColorStop(0.35,'#7f8aa6');gr.addColorStop(0.55,'#5d5751');gr.addColorStop(1,'#2c2a29');x.fillStyle=gr;x.fillRect(0,0,512,256);
 for(let i=0;i<128;i++){const xx=i*4;x.fillStyle='rgba(0,0,0,.28)';x.fillRect(xx,0,1,256);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(xx+2,0,1,256);} // regen cooling tubes
 for(const y of[30,70,140,220]){x.fillStyle='rgba(20,18,16,.6)';x.fillRect(0,y,512,3);}  // stiffener bands
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;
 const ec=document.createElement('canvas');ec.width=8;ec.height=256;const e=ec.getContext('2d');const eg=e.createLinearGradient(0,0,0,256);eg.addColorStop(0,'#ff9a40');eg.addColorStop(0.3,'#401000');eg.addColorStop(0.75,'#200800');eg.addColorStop(1,'#ff5a10');e.fillStyle=eg;e.fillRect(0,0,8,256);
 const et=new THREE.CanvasTexture(ec);et.colorSpace=THREE.SRGBColorSpace;
 Object.assign(RAPTOR_MAT,{map:t,color:new THREE.Color(0xffffff),emissive:new THREE.Color(0xffffff),emissiveMap:et,emissiveIntensity:0,metalness:0.85,roughness:0.38});RAPTOR_MAT.needsUpdate=true;}
// contoured bell: chamber -> throat -> parabolic (Rao) bell, origin at gimbal
bell=function(r,l,seg=36){const pts=[];const ch=[[0.34,0.42],[0.36,0.3],[0.33,0.2],[0.22,0.1],[0.2,0.05]];for(const [a,b] of ch)pts.push(new THREE.Vector2(r*a,l*b));
 for(let i=1;i<=16;i++){const t=i/16;pts.push(new THREE.Vector2(r*(0.2+0.8*(1-Math.pow(1-t,2.1))),0.05*l-l*1.05*t));}const G=new THREE.LatheGeometry(pts,seg);return G;};
for(const k in _bellCache)delete _bellCache[k];
const BELLS=[];const _raptor0=raptor;raptor=function(g,x,y,z,r,l,vac){const n0=g.children.length;const gl=_raptor0(g,x,y,z,r,l,vac);
 const piv=new THREE.Group();piv.position.set(x,y,z);const parts=g.children.slice(n0);for(const o of parts){g.remove(o);o.position.x-=x;o.position.y-=y;o.position.z-=z;piv.add(o);}
 // turbopumps + plumbing
 const pm=M(0x8a8c90,{metalness:0.85,roughness:0.35});add(piv,new THREE.CylinderGeometry(r*0.16,r*0.16,l*0.38,10),pm,r*0.42,l*0.3,0);add(piv,new THREE.CylinderGeometry(r*0.14,r*0.14,l*0.32,10),pm,-r*0.42,l*0.3,0);
 const pipe=new THREE.TorusGeometry(r*0.3,r*0.035,6,16,Math.PI);add(piv,pipe,pm,0,l*0.42,0).rotation.y=Math.random()*3;
 g.add(piv);piv.userData.bell=1;BELLS.push(piv);return gl;};
// Falcon 9: Merlin 1D x9 in octaweb, MVac on stage 2
{const _f9=f9Model;f9Model=function(){const g=_f9();const s1=g.userData.s1,s2=g.userData.s2;
 s1.children.filter(o=>o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===0.25).forEach(o=>s1.remove(o));
 const glows=[];for(let i=0;i<9;i++){const a=i/8*Math.PI*2,r=i===8?0:1.25;glows.push(raptor(s1,i===8?0:Math.cos(a)*r,1.25,i===8?0:Math.sin(a)*r,0.46,1.45));}
 add(s1,new THREE.CylinderGeometry(1.83,1.83,0.35,9),0x2a2b2d,0,1.7,0);const sh=add(s1,new THREE.CylinderGeometry(1.84,1.84,0.12,32),M(0x3a3836,{roughness:0.8}),0,1.55,0); // octaweb + heat shield
 s1.userData.glows=glows;s2.userData.glows=[raptor(s2,0,47.4,0,0.95,2.6,true)];return g;};}
// plume: bright core, shock diamonds near sea level, expands with altitude, flicker
const PLUME_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
 uniforms:{uT:{value:0},uI:{value:0},uVac:{value:0},uMeth:{value:1}},
 vertexShader:`varying vec2 vU;varying vec3 vN,vV;void main(){vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform float uT,uI,uVac,uMeth;varying vec2 vU;varying vec3 vN,vV;
 float h(float n){return fract(sin(n)*43758.5);}float ns(float x){float i=floor(x),f=fract(x);return mix(h(i),h(i+1.),f*f*(3.-2.*f));}
 void main(){float y=1.-vU.y;float rim=abs(dot(vN,vV));float core=pow(rim,2.5);
  float dia=(1.-uVac)*pow(max(0.,sin(y*38.)),6.)*smoothstep(0.55,0.,y)*0.9;
  float fl=0.8+0.2*ns(uT*40.+y*12.)+0.1*ns(uT*90.);
  float a=core*exp(-y*(2.4-uVac*1.6))*fl+dia*core;a*=smoothstep(0.,0.03,y);
  vec3 cm=uMeth>0.5?vec3(0.55,0.68,1.):vec3(1.,0.62,0.28);vec3 c=mix(cm,vec3(1.,0.97,0.9),core*smoothstep(0.35,0.,y));
  gl_FragColor=vec4(c*a*uI*3.0,min(1.,a*uI*1.5));}`});
function mkPlume(){const g=new THREE.CylinderGeometry(1,1,1,40,30,true).translate(0,-0.5,0);const m=new THREE.Mesh(g,PLUME_MAT.clone());m.frustumCulled=false;m.renderOrder=5;return m;}
const PL=[mkPlume(),mkPlume()];
{const _u=updRocket;let gim={p:0,y:0};updRocket=function(v,dt){_u(v,dt);const os=v.os;if(!padRocket)return;const ud=padRocket.userData;const sk=os.kind==='starship',f9=os.kind==='falcon9';const st=os.stage;
 const on=os.launched&&os.engine&&os.stages[st]&&os.stages[st].prop>0;const h=os.h||0;const vac=sstep(3000,60000,h);
 RAPTOR_MAT.emissiveIntensity=on?1.4:Math.max(0,RAPTOR_MAT.emissiveIntensity-dt*0.3);
 // gimbal follows stick
 gim.p+=((inp.pitch||0)*0.12-gim.p)*Math.min(1,dt*6);gim.y+=((inp.roll||0)*0.12-gim.y)*Math.min(1,dt*6);
 for(const b of BELLS){if(!b.parent)continue;b.rotation.x=on?gim.p:0;b.rotation.z=on?-gim.y:0;}
 const thr=os.throttle==null?1:os.throttle;
 for(let i=0;i<2;i++){const p=PL[i];const act=on&&st===i&&(sk||f9);if(p.parent!==padRocket&&act)padRocket.add(p);p.visible=act;if(!act)continue;
  const R=sk?(i?3.6:5.2):(i?1.0:2.4),L=sk?(i?60:95):(i?30:48),base=sk?(i?69.6:-2.2):(i?44.6:-0.3);
  p.position.set(0,base,0);const ex=1+vac*(i?5:4);p.scale.set(R*ex,L*(1+vac*1.2),R*ex);p.geometry.attributes.position.needsUpdate=false;
  const u=p.material.uniforms;u.uT.value+=dt;u.uI.value=0.55+0.45*thr;u.uVac.value=vac;u.uMeth.value=sk?1:0;}
 // ground dust and lit steam at liftoff (Falcon 9 / LC-39A)
 if(on&&h<250&&f9&&typeof PAD!=='undefined'){for(let k=0;k<3;k++){const a=Math.random()*6.28,r=8+Math.random()*16;smoke.spawn(_t.set(PAD.x+Math.cos(a)*r,6+Math.random()*4,PAD.z+Math.sin(a)*r),Math.cos(a)*(40+Math.random()*40),3+Math.random()*10,Math.sin(a)*(40+Math.random()*40),7,14,18,0.85,0.8,0.74,0.35,0.25,0.5);}}};}

{const _ua=updAir;updAir=function(v,dt){_ua(v,dt);if(v.kind==='sr71'&&SR.hot){const ab=clamp((inp.throttle-0.5)*2,0,1);SR.hot.emissiveIntensity+=(ab*0.12-SR.hot.emissiveIntensity)*Math.min(1,dt*2);for(const m of SR.liner||[])m.emissiveIntensity=ab*1.6;}};}
