// ===== GWH_MIRV (wh, #16): missile-grade Minuteman III MIRV: Mk12A reentry vehicle + post-boost vehicle (PBV / "bus") =====
// Ref: refs/mirv (W78/Mk12A on MM III bus, LANL/USAF photos). Mk12A: sphere-cone, L ~1.81 m, base dia ~0.54 m, half-angle ~8 deg, dark carbon-phenolic heatshield,
// small graphite nosetip, lighter aft band below a joint ring, small flush ports/markings. Bus: riveted aluminium frustum (~1.3 m base) with top deck, cable harness, 3 RV pedestals.
// Replaces MSL_MODELS.mk12a (same convention: nose -Z, origin centre, len 1.8) and swaps the in-flight bus mesh. No new buttons.
(()=>{if(!window.MSL_MODELS)return;const T=THREE,PI=Math.PI;
 const SAN=m=>{m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{vec4 _c=gl_FragColor;if(any(isnan(_c))||any(isinf(_c)))_c=vec4(0.,0.,0.,1.);gl_FragColor=vec4(clamp(_c.rgb,0.,64.),clamp(_c.a,0.,1.));}');};m.customProgramCacheKey=()=>'gwhsan';return m;};
 const M=(c,r,m,o)=>SAN(new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{})));
 const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;t.anisotropy=8;return t;};
 let TX=null;const tex=()=>TX||(TX={
  rv:cv(1024,1024,(x,W,H)=>{// v: 0 = base, 1 = nose. Joint ring at v~0.33: aft band (lighter, slightly bluish grey), forward cone darker
   x.fillStyle='#2c2b2a';x.fillRect(0,0,W,H);x.fillStyle='#3a3a3b';x.fillRect(0,H*0.67,W,H*0.33);
   for(let i=0;i<7000;i++){const v=Math.random()*36|0;x.fillStyle=`rgba(${v},${v},${v},0.18)`;x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,1);}
   x.strokeStyle='rgba(0,0,0,0.22)';x.lineWidth=1;for(let y=0;y<H;y+=5){x.beginPath();x.moveTo(0,y+Math.random());x.lineTo(W,y+Math.random());x.stroke();}// tape-wrap
   x.strokeStyle='rgba(0,0,0,0.75)';x.lineWidth=4;for(const v of[0.33,0.055,0.93]){x.beginPath();x.moveTo(0,H*(1-v));x.lineTo(W,H*(1-v));x.stroke();}
   x.fillStyle='rgba(225,225,215,0.9)';for(const [u,v,w,h] of[[0.12,0.42,10,14],[0.62,0.42,10,14],[0.30,0.36,7,6],[0.45,0.73,14,5]])x.fillRect(u*W,H*(1-v),w,h);// ports, as in photo
   x.fillStyle='rgba(15,15,15,0.9)';for(const u of[0.12,0.62])x.fillRect(u*W+2,H*(1-0.42)+3,6,8);
   x.save();x.font='12px sans-serif';x.fillStyle='rgba(190,185,170,0.4)';x.fillText('MK 12A   S/N 0417',0.2*W,H*0.8);x.restore();}),
  al:cv(1024,256,(x,W,H)=>{const g=x.createLinearGradient(0,0,W,0);for(let i=0;i<=8;i++)g.addColorStop(i/8,i%2?'#b9bcbf':'#d6d8da');x.fillStyle=g;x.fillRect(0,0,W,H);
   for(let i=0;i<3000;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.06})`;x.fillRect(Math.random()*W,Math.random()*H,Math.random()*30,1);}
   x.strokeStyle='rgba(60,60,60,0.7)';x.lineWidth=2;for(let k=0;k<6;k++){x.beginPath();x.moveTo(k*W/6,0);x.lineTo(k*W/6,H);x.stroke();}
   for(const v of[0.06,0.5,0.94]){x.beginPath();x.moveTo(0,v*H);x.lineTo(W,v*H);x.stroke();}
   x.fillStyle='rgba(50,50,50,0.85)';for(const v of[0.06,0.5,0.94])for(let u=0;u<W;u+=11){x.beginPath();x.arc(u,v*H+6,1.4,0,7);x.fill();}for(let k=0;k<6;k++)for(let y=12;y<H;y+=11){x.beginPath();x.arc(k*W/6+6,y,1.3,0,7);x.fill();}
   x.fillStyle='#111';for(const [u,v,r] of[[0.2,0.35,7],[0.24,0.35,7],[0.55,0.72,9],[0.85,0.4,5]]){x.beginPath();x.arc(u*W,v*H,r,0,7);x.fill();}})});
 function lathe(pts,mat,seg=56){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(p[0],1e-4),p[1])),seg);const y0=pts[0][1],L=pts[pts.length-1][1]-y0;const uv=g.attributes.uv,pos=g.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setY(i,(pos.getY(i)-y0)/L);g.computeVertexNormals();return new T.Mesh(g,mat);}
 const L=1.81,R=0.30;// R from photo: RV base ~0.45 of bus top dia (was 0.27, too slender)
 // ---------- Mk12A RV (built +Y nose, then wrapped to -Z nose) ----------
 function rvY(kind){const mk5=kind==='mk5';const L=mk5?1.75:1.81,R=mk5?0.29:0.30;const G=new T.Group();const X=tex();const hs=M(mk5?0xb9b6b0:0xffffff,mk5?0.75:0.88,mk5?0.15:0.05,{map:X.rv});
  // sphere-cone: base shoulder radius, cone half-angle ~8 deg, small spherical nose (tip radius ~2.5 cm)
  const pts=[[R*0.93,0],[R,0.025],[R,0.05]];const rn=mk5?0.05:0.028,ha=Math.atan((R-rn*Math.cos(0.14))/(L-0.05-rn));for(let i=0;i<=24;i++){const t=i/24;pts.push([R-(R-rn)*(t+0.10*Math.sin(t*PI)*-1)*1,0.05+(L-0.05-rn*(1-Math.sin(ha)))*t]);}
  for(let i=1;i<=8;i++){const a=ha+(PI/2-ha)*i/8;pts.push([rn*Math.cos(a),L-rn+rn*Math.sin(a)]);}
  const body=lathe(pts,hs,64);G.add(body);
  const tip=lathe([[0.03,L-0.12],[0.022,L-0.04],[0.0001,L]],M(0x5a5652,0.45,0.6),32);G.add(tip);// graphite nosetip
  // aft closure: recessed base plate, spin-rocket / separation fittings, attach fitting
  const base=new T.Mesh(new T.CircleGeometry(R*0.9,48),M(0x6c6b66,0.7,0.6));base.rotation.x=PI/2;base.position.y=0.004;G.add(base);
  const ring=new T.Mesh(new T.TorusGeometry(R*0.91,0.012,8,48),M(0x9a9a96,0.4,0.85));ring.rotation.x=PI/2;ring.position.y=0.01;G.add(ring);
  const fit=new T.Mesh(new T.CylinderGeometry(0.06,0.08,0.06,20),M(0xb8b8b4,0.35,0.9));fit.position.y=-0.03;G.add(fit);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4;const n=new T.Mesh(new T.CylinderGeometry(0.014,0.02,0.035,10),M(0x2a2a2a,0.5,0.7));n.position.set(Math.cos(a)*0.17,-0.012,Math.sin(a)*0.17);G.add(n);}
  // ---- reentry heating: plasma sheath (shock layer hugging the cone, hottest at the nose) + luminous wake trail ----
  const shP=pts.map(([r,y])=>[r*1.10+0.015,y+0.02]);const sh=lathe(shP,new T.MeshBasicMaterial({color:0xff8a3a,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.BackSide,fog:false}),48);SAN(sh.material);G.add(sh);
  const nose=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:0xffd2a0,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));nose.position.y=L;nose.scale.setScalar(0.9);G.add(nose);
  const wakeG=new T.ConeGeometry(R*1.05,1,32,8,true);wakeG.translate(0,-0.5,0);const wm=new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,uniforms:{k:{value:0},t:{value:0}},
   vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform float k,t;varying vec2 vU;void main(){float a=vU.y;float n=0.75+0.25*sin(vU.x*40.+t*30.-a*20.);vec3 c=mix(vec3(1.,0.35,0.08),vec3(1.,0.85,0.6),a*a);float o=k*a*a*n*0.85;gl_FragColor=vec4(max(c*o,0.),clamp(o,0.,1.));}'});
  const wake=new T.Mesh(wakeG,wm);wake.rotation.x=PI;wake.position.y=0;wake.scale.set(1,0.01,1);G.add(wake);// cone tip points aft, opens at base
  G.userData.body=body;G.userData.L=L;
  G.userData.heat=(k,dt)=>{k=Math.max(0,Math.min(1,k));sh.material.opacity=0.55*k;sh.material.color.setRGB(1,0.45+0.35*k,0.2+0.3*k);nose.material.opacity=k;nose.scale.setScalar(0.6+1.6*k);
   wm.uniforms.k.value=k;wm.uniforms.t.value+=dt||0.016;wake.scale.set(1+k*0.6,0.01+k*14,1+k*0.6);body.material.emissive&&(body.material.emissive.setRGB(0.5*k,0.12*k,0.02*k));};
  return G;}
 function rv(kind){const W=new T.Group();const g=rvY(kind);W.name=kind==='mk5'?'Mk5 RV':'Mk12A RV';const Lk=g.userData.L;g.rotation.x=-PI/2;g.position.z=Lk/2;W.add(g);W.userData={len:Lk,diam:R*2,whRV:true,heat:g.userData.heat};W.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});return W;}
 // ---------- Post-boost vehicle with 3 RVs (+Y up/forward, origin = bus base centre) ----------
 const glowTex=(()=>{let t;return()=>{if(t)return t;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(0.25,'rgba(255,220,180,0.6)');g.addColorStop(1,'rgba(255,120,40,0)');x.fillStyle=g;x.fillRect(0,0,64,64);t=new T.CanvasTexture(c);return t;};})();
 function pbv(kind){const G=new T.Group();G.name='MM III PBV';const X=tex();const al=M(0xffffff,0.32,0.9,{map:X.al}),dk=M(0x3a3a3a,0.6,0.6),gold=M(0xb08d3c,0.35,0.9);
  const h=0.62;G.add(lathe([[0.70,0],[0.70,0.03],[0.66,0.05],[0.60,h-0.06],[0.62,h-0.04],[0.62,h]],al,64));
  const lip=new T.Mesh(new T.TorusGeometry(0.69,0.02,8,64),M(0x8c8e90,0.3,0.9));lip.rotation.x=PI/2;lip.position.y=0.04;G.add(lip);
  const deck=new T.Mesh(new T.CylinderGeometry(0.62,0.62,0.03,64),M(0xa9abad,0.4,0.85));deck.position.y=h;G.add(deck);
  // PSRE axial nozzle + ACS thrusters on the skirt
  const nz=lathe([[0.16,0],[0.1,0.12],[0.07,0.2]],dk,24);nz.rotation.x=PI;nz.position.y=0.02;G.add(nz);
  for(let i=0;i<8;i++){const a=i*PI/4;const t=new T.Mesh(new T.CylinderGeometry(0.018,0.03,0.06,10),dk);t.rotation.z=PI/2;t.rotation.y=-a;t.position.set(Math.cos(a)*0.66,0.18+(i%2)*0.22,Math.sin(a)*0.66);G.add(t);}
  // cable harness loops + avionics boxes on deck (photo: bundled wiring on the left, plumbing over the deck)
  const tube=(pts,r,m)=>{const c=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));return new T.Mesh(new T.TubeGeometry(c,40,r,8,false),m);};
  const wire=M(0xc8c4b8,0.6,0.2);for(let k=0;k<4;k++){const o=k*0.02;G.add(tube([[-0.6,0.25+o,0.2],[-0.68,0.38+o,0.1],[-0.63,h+0.02,0],[-0.3,h+0.05,-0.05+o],[0,h+0.03,0.15]],0.012,wire));}
  for(let k=0;k<3;k++){const a=k*2*PI/3+0.5;G.add(tube([[0,h+0.02,0],[Math.cos(a)*0.2,h+0.08,Math.sin(a)*0.2],[Math.cos(a)*0.36,h+0.04,Math.sin(a)*0.36]],0.01,M(0x9d9fa1,0.35,0.9)));}
  for(const [x,z,w,d] of[[0.25,-0.3,0.18,0.12],[-0.15,0.35,0.14,0.1],[0.35,0.25,0.1,0.1]]){const b=new T.Mesh(new T.BoxGeometry(w,0.08,d),gold);b.position.set(x,h+0.055,z);G.add(b);}
  // 3 RV pedestals + RVs, canted slightly outward as in the photo
  const rvs=[];for(let k=0;k<3;k++){const a=k*2*PI/3+PI/2;const px=Math.cos(a)*0.37,pz=Math.sin(a)*0.37;
   const ped=new T.Mesh(new T.CylinderGeometry(0.07,0.1,0.1,16),M(0xbcbec0,0.3,0.9));ped.position.set(px,h+0.06,pz);G.add(ped);
   const r=rvY(kind);r.position.set(px,h+0.12,pz);r.rotation.set(Math.sin(a)*0.05,0,-Math.cos(a)*0.05);G.add(r);rvs.push(r);}
  G.userData={rvs,whBus:true,h};G.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});return G;}
 let CUR=null;MSL_MODELS.mk12a=()=>rv(CUR&&(CUR.name==='SLBM'||CUR.whKind==='mk5')?'mk5':'');MSL_MODELS.mk5=()=>rv('mk5');MSL_MODELS.mm3pbv=pbv;window.WH=Object.assign(window.WH||{},{rv,pbv,RV_LEN:L});
 // ---- in-flight: show the real bus once the payload shroud is gone; hide each RV as it is released ----

 const _hv=new T.Vector3();
 const _u=updBallistic;updBallistic=function(o,dt){const pc=CUR;CUR=o;try{_u(o,dt);}finally{CUR=pc;}
  if(o.rv&&o.mesh&&!o.done){if(o.whHeat===undefined){(window.__whRVs=window.__whRVs||[]).push(o);if(window.__whRVs.length>40)window.__whRVs.shift();o.whHeat=null;o.mesh.traverse(c=>{if(!o.whHeat&&c.userData&&c.userData.heat&&c.visible!==false)o.whHeat=c.userData.heat;});}
   if(o.whHeat){const h=o.pos.y,v=o.vel.length();const rho=Math.exp(-h/7200);const k=Math.min(1,Math.max(0,(v-1200)/3500))*Math.min(1,rho*900)*(h>1500?1:h/1500);o.whHeat(k,dt);o.whK=Math.max(o.whK||0,k);
    if(k>0.05&&o.vel.lengthSq()>1){const q=o.mesh.quaternion;_hv.copy(o.vel).normalize();q.setFromUnitVectors(new T.Vector3(0,1,0),_hv);}}}
  const busOn=(o.phase==='bus'&&o.bus)||(o.gs&&o.gs.bus);
  if(busOn&&!o.whBus&&o.mesh&&!o.done){o.whBus=pbv(o.name==='SLBM'?'mk5':'');for(const c of [...o.mesh.children])c.visible=false;o.mesh.scale.set(1,1,1);o.mesh.add(o.whBus);}
  if(o.whBus){const n=o.bus?o.bus.n:(o.gs?o.gs.rel:0);o.whBus.userData.rvs.forEach((r,i)=>r.visible=i>=n);}};
})();
