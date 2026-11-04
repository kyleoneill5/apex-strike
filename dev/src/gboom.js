//GBOOM – realistic transonic/supersonic FX for every aircraft: Prandtl-Glauert vapor skirt (M 0.95-1.05), Mach-cone heat shimmer (asin(1/M)), low-level dust/spray, camera thump
const BOOM={};
{const T=THREE;
 // noise normal map for refraction shimmer
 const nc=document.createElement('canvas');nc.width=nc.height=256;{const x=nc.getContext('2d'),id=x.createImageData(256,256),d=id.data;const h=[];for(let i=0;i<256*256;i++)h.push(Math.random());const H=(i,j)=>h[((j&255)<<8)|(i&255)];
  const sm=(i,j)=>{let s=0;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)s+=H(i+a,j+b);return s/25;};const S=[];for(let j=0;j<256;j++)for(let i=0;i<256;i++)S.push(sm(i,j));const Q=(i,j)=>S[((j&255)<<8)|(i&255)];
  for(let j=0;j<256;j++)for(let i=0;i<256;i++){const dx=(Q(i+1,j)-Q(i-1,j))*6,dy=(Q(i,j+1)-Q(i,j-1))*6,l=Math.hypot(dx,dy,1),k=(j*256+i)*4;d[k]=(dx/l*0.5+0.5)*255;d[k+1]=(dy/l*0.5+0.5)*255;d[k+2]=(1/l*0.5+0.5)*255;d[k+3]=255;}x.putImageData(id,0,0);}
 const NT=new T.CanvasTexture(nc);NT.wrapS=NT.wrapT=T.RepeatWrapping;NT.colorSpace=T.NoColorSpace;
 // alpha: fade at apex and at the open end so no hard ring is ever visible
 const ac=document.createElement('canvas');ac.width=4;ac.height=256;{const x=ac.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#000');g.addColorStop(0.12,'#fff');g.addColorStop(0.6,'#888');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,4,256);}
 const AT=new T.CanvasTexture(ac);
 // Mach cone: open cone, apex at the nose, axis +Z (aft); scaled per Mach
 const cg=new T.ConeGeometry(1,1,64,24,true);cg.translate(0,-0.5,0);cg.rotateX(-Math.PI/2);
 BOOM.shM=new T.MeshPhysicalMaterial({color:0xffffff,transmission:1,thickness:0.4,roughness:0.02,metalness:0,ior:1.02,normalMap:NT,normalScale:new T.Vector2(0.6,0.6),alphaMap:AT,transparent:true,opacity:1,side:T.DoubleSide,depthWrite:false,fog:false,specularIntensity:0});
 BOOM.cone=new T.Mesh(cg,BOOM.shM);BOOM.cone.visible=false;BOOM.cone.renderOrder=5;scene.add(BOOM.cone);
 // Prandtl-Glauert vapor skirt: lathe shell that flares aft from max-thickness, shader = soft volumetric-looking condensation
 const P=[];for(let i=0;i<=40;i++){const t=i/40;P.push(new T.Vector2(0.18+0.95*Math.pow(t,0.55),t));}
 const vg=new T.LatheGeometry(P,96);vg.rotateX(Math.PI/2);
 BOOM.vM=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,fog:false,uniforms:{k:{value:0},t:{value:0},sun:{value:new T.Vector3(0.4,0.8,0.3)}},
  vertexShader:'#include <common>\n#include <logdepthbuf_pars_vertex>\nvarying vec3 vP,vN,vV;void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;\n#include <logdepthbuf_vertex>\n}',
  fragmentShader:'#include <logdepthbuf_pars_fragment>\nuniform float k,t;uniform vec3 sun;varying vec3 vP,vN,vV;float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}\nfloat fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}\nvoid main(){\n#include <logdepthbuf_fragment>\nfloat z=vP.z;float ang=atan(vP.y,vP.x);vec3 q=vec3(cos(ang)*2.,sin(ang)*2.,z*3.-t*1.5);float d=fbm(q*1.7)+0.5*fbm(q*5.+3.);float front=smoothstep(0.,0.12,z)*(1.-smoothstep(0.35,1.,z));float rim=pow(1.-abs(dot(normalize(vN),vV)),1.2);float a=k*front*smoothstep(0.55,1.1,d+rim*0.35)*0.55;float lit=0.72+0.28*max(dot(normalize(vN),normalize(sun)),0.);vec3 c=vec3(0.93,0.95,0.98)*lit;gl_FragColor=vec4(c,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
 BOOM.vap=new T.Mesh(vg,BOOM.vM);BOOM.vap.visible=false;BOOM.vap.renderOrder=6;scene.add(BOOM.vap);
 const sz=v=>{if(v._bL)return v._bL;const b=new T.Box3().setFromObject(v.mesh);const s=b.getSize(V3());return v._bL=Math.max(8,Math.min(60,Math.max(s.x,s.z)));};
 const _ua=updAir;updAir=function(v,dt){_ua(v,dt);if(typeof boomCone!=='undefined')boomCone.visible=false;if(v!==player)return;const p=v.mesh.position,sp=v.vel.length();const a_s=p.y<11000?340-0.0039*p.y:295;const M=sp/a_s;const L=sz(v);const q=v.mesh.quaternion;const f=fwdOf(q,V3());
  const rho=Math.exp(-p.y/8500);
  // vapor: peaks at M~0.99, strongest in humid low air, decays fast after the crossing
  const win=Math.max(0,1-Math.abs(M-0.995)/0.055);v._vk=Math.max(win,(v._vk||0)*Math.exp(-dt*3.2));const vk=v._vk*Math.min(1,rho*1.25)*(p.y<12000?1:0);
  BOOM.vap.visible=vk>0.01;if(BOOM.vap.visible){BOOM.vM.uniforms.k.value=vk;BOOM.vM.uniforms.t.value+=dt;if(typeof sunDir!=='undefined')BOOM.vM.uniforms.sun.value.copy(sunDir);BOOM.vap.quaternion.copy(q);BOOM.vap.position.copy(p).addScaledVector(f,-L*0.05);BOOM.vap.scale.set(L*0.42,L*0.42,L*0.55);
   if(Math.random()<vk)smoke.spawn(_t.copy(p).addScaledVector(f,-L*0.45).add(V3(rnd(L*0.3),rnd(L*0.3),rnd(L*0.3))),v.vel.x*0.85,v.vel.y*0.85,v.vel.z*0.85,L*0.12,L*0.12,0.5,0.95,0.96,0.98,0.22*vk,0.4,0);}
  // shimmer cone at the Mach angle, only in dense air and when supersonic
  const sk=M>1.02?Math.min(1,(M-1.02)/0.15)*Math.min(1,rho*1.6):0;BOOM.cone.visible=sk>0.03&&p.y<16000;
  if(BOOM.cone.visible){const mu=Math.asin(Math.min(1,1/M));const Lc=L*3.2;BOOM.cone.position.copy(p).addScaledVector(f,L*0.45);BOOM.cone.quaternion.copy(q);BOOM.cone.scale.set(Lc*Math.tan(mu),Lc*Math.tan(mu),Lc);BOOM.shM.thickness=0.25+0.6*sk;BOOM.shM.normalScale.set(0.5*sk,0.5*sk);NT.offset.y-=dt*0.6;NT.offset.x+=dt*0.13;}
  // low-level supersonic: shock footprint lifts spray/dust below and behind, camera thump on crossing
  const g=groundAt(p.x,p.z);const agl=p.y-g.h;if(M>0.98&&agl<350){const kk=Math.min(1,(350-agl)/250)*Math.min(1,(M-0.98)/0.1+0.2);const wat=g.type==='water';const n=Math.ceil(kk*6);
   for(let i=0;i<n;i++){const off=Math.random()*L*3;const ra=agl*Math.tan(Math.asin(Math.min(1,1/Math.max(1,M))))*0.4+L*0.3;const a=Math.random()*6.283;const gp=_t.copy(p).addScaledVector(f,-off);gp.x+=Math.cos(a)*ra;gp.z+=Math.sin(a)*ra;gp.y=g.h+0.5;
    if(wat)smoke.spawn(gp,v.vel.x*0.15+rnd(6),4+Math.random()*12*kk,v.vel.z*0.15+rnd(6),2+Math.random()*3,5+L*0.2,3.5,0.93,0.95,0.97,0.55*kk,0.8,-4);
    else smoke.spawn(gp,v.vel.x*0.12+rnd(5),2+Math.random()*7*kk,v.vel.z*0.12+rnd(5),2.5+Math.random()*3,6+L*0.2,6,0.66,0.58,0.48,0.5*kk,0.3,-1);}}
  if((v._pm||0)<1&&M>=1){const d=camera.position.distanceTo(p);const th=Math.max(0,1-d/3000);if(th>0)shake=Math.max(shake,0.35+0.9*th*(agl<500?1:0.4));}v._pm=M;};
}
try{window.__milsim.boom=BOOM;}catch(e){}
