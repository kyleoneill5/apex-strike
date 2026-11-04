// ================= gsub.js: deep ocean (to ~600 m), underwater visibility, sub launch cam =================
{const T=THREE;const SUBX={maxD:600,testD:490,lc:null};
 // ---- #9 deep ocean terrain: shelf near islands, slope, abyssal plain 450-620 m with ridges ----
 const _tH=terrainH;
 terrainH=function(x,z){const h=_tH(x,z);if(h>0)return h;let d=1e9;for(const s of ISL){const e=Math.hypot(x-s.x,z-s.z)-s.r;if(e<d)d=e;}
  const n=vnoise(x*0.0009,z*0.0009),n2=vnoise(x*0.004+7,z*0.004+3);
  const deep=-(14+70*sstep(0,500,d)+430*sstep(450,3200,d)+n*70+n2*18*sstep(300,1500,d));
  return Math.min(h,deep);};
 window.__subTerrain=terrainH;
 // ---- seafloor mesh (follows camera, rebuilt when it moves >600 m) ----
 seabed.visible=false;
 const sandC=document.createElement('canvas');sandC.width=sandC.height=256;{const x=sandC.getContext('2d');x.fillStyle='#8a8670';x.fillRect(0,0,256,256);
  for(let i=0;i<5000;i++){const v=Math.random();x.fillStyle=`rgba(${v<.5?60:170},${v<.5?58:165},${v<.5?45:140},${0.05+Math.random()*0.1})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*3);}
  for(let j=0;j<256;j+=9){x.strokeStyle='rgba(50,48,38,0.08)';x.beginPath();for(let i=0;i<=256;i+=8)x.lineTo(i,j+Math.sin(i*0.07+j)*3);x.stroke();}}
 const sandT=new T.CanvasTexture(sandC);sandT.wrapS=sandT.wrapT=T.RepeatWrapping;sandT.repeat.set(90,90);sandT.colorSpace=T.SRGBColorSpace;
 const N=110,SZ=9000;const fg=new T.PlaneGeometry(SZ,SZ,N,N).rotateX(-Math.PI/2);fg.setAttribute('color',new T.BufferAttribute(new Float32Array(fg.attributes.position.count*3),3));
 const floor=new T.Mesh(fg,new T.MeshStandardMaterial({map:sandT,vertexColors:true,roughness:1,metalness:0}));floor.receiveShadow=false;floor.castShadow=false;floor.frustumCulled=false;floor.name='subSeafloor';scene.add(floor);
 const fc=new T.Vector3(1e9,0,1e9);
 function rebuild(cx,cz){cx=Math.round(cx/200)*200;cz=Math.round(cz/200)*200;fc.set(cx,0,cz);const P=fg.attributes.position,C=fg.attributes.color,base=fg.userData.b||(fg.userData.b=P.array.slice());
  for(let i=0;i<P.count;i++){const x=base[i*3]+cx,z=base[i*3+2]+cz;let h=terrainH(x,z);h=Math.min(h,-1.5);P.setY(i,h);
   const k=sstep(20,520,-h);C.setXYZ(i,lerp(1.0,0.55,k),lerp(0.98,0.6,k),lerp(0.9,0.62,k));}
  P.needsUpdate=true;C.needsUpdate=true;fg.computeVertexNormals();floor.position.set(cx,0,cz);}
 // keep geometry in world coords via base offsets
 // ---- #8 underwater look: depth-graded fog, ambient fill, sub lamps, god rays ----
 const uwHemi=new T.HemisphereLight(0x7fd4e8,0x1a2a2a,0);scene.add(uwHemi);
 const lamp=new T.SpotLight(0xdff4ff,0,520,0.55,0.6,1.2);lamp.castShadow=false;scene.add(lamp);scene.add(lamp.target);
 const rayC=document.createElement('canvas');rayC.width=64;rayC.height=256;{const x=rayC.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(200,240,255,0.9)');g.addColorStop(1,'rgba(200,240,255,0)');x.fillStyle=g;x.fillRect(0,0,64,256);
  const h=x.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(0,0,0,1)');h.addColorStop(0.5,'rgba(0,0,0,0)');h.addColorStop(1,'rgba(0,0,0,1)');x.globalCompositeOperation='destination-out';x.fillStyle=h;x.fillRect(0,0,64,256);}
 const rayT=new T.CanvasTexture(rayC);const rays=new T.Group();rays.name='subGodRays';const rayM=[];
 for(let i=0;i<14;i++){const m=new T.MeshBasicMaterial({map:rayT,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});rayM.push(m);
  const w=6+Math.random()*16,L=90+Math.random()*90;const pl=new T.Mesh(new T.PlaneGeometry(w,L).translate(0,-L/2,0),m);const a=Math.random()*6.28,r=20+Math.random()*120;pl.position.set(Math.cos(a)*r,0,Math.sin(a)*r);pl.rotation.set(0.25,Math.random()*3.14,0.12);pl.userData.ph=Math.random()*6.28;rays.add(pl);}
 rays.visible=false;rays.frustumCulled=false;scene.add(rays);
 // marine snow (cheap points near camera)
 const snG=new T.BufferGeometry();const snP=new Float32Array(600*3);for(let i=0;i<snP.length;i++)snP[i]=(Math.random()-0.5)*120;snG.setAttribute('position',new T.BufferAttribute(snP,3));
 const snow=new T.Points(snG,new T.PointsMaterial({color:0xcfe6ea,size:0.25,transparent:true,opacity:0.5,depthWrite:false}));snow.frustumCulled=false;snow.visible=false;scene.add(snow);
 const wEl=$('water');
 function applyUW(){const cp=camera.position;const under=cp.y<waveH(cp.x,cp.z,simT)-0.3;
  if(fc.distanceTo(_sv.set(cp.x,0,cp.z))>600)rebuild(cp.x,cp.z);
  rays.visible=snow.visible=under;if(typeof cloudDeck!=='undefined'&&cloudDeck)cloudDeck.visible=!under;
  const sp=player&&player.def&&player.def.cls==='sub'?player:null;
  if(!under){uwHemi.intensity=0;lamp.intensity=0;return;}
  const d=Math.max(0,-cp.y),k=sstep(0,450,d);
  // clear tropical blue near surface -> deep navy; visibility ~250 m shallow, ~170 m deep (lamp + fill keep targets readable)
  scene.fog.color.setRGB(lerp(0.05,0.03,k),lerp(0.33,0.15,k),lerp(0.43,0.24,k));scene.fog.density=lerp(0.0026,0.0029,k);scene.background=scene.fog.color;
  uwHemi.intensity=lerp(1.0,1.6,k);uwHemi.color.setRGB(lerp(0.5,0.25,k),lerp(0.85,0.55,k),lerp(0.95,0.85,k));sun.intensity*=lerp(1,0.12,k);
  if(wEl)wEl.style.opacity=String(lerp(0.35,0.6,k));
  if(sp){const m=sp.mesh,f=_sv2.set(-Math.sin(sp.hdg),0,-Math.cos(sp.hdg));lamp.position.copy(m.position).addScaledVector(f,58).add(_sv3.set(0,-1,0));lamp.target.position.copy(lamp.position).addScaledVector(f,100).add(_sv3.set(0,-35,0));lamp.intensity=lerp(0,9000,sstep(60,250,d));}else lamp.intensity=0;
  const rk=1-sstep(10,140,d);rays.position.set(cp.x,Math.min(-0.5,waveH(cp.x,cp.z,simT)-0.5),cp.z);rays.rotation.y=simT*0.01;
  for(const c of rays.children){c.material.opacity=rk*(0.07+0.05*Math.sin(simT*0.7+c.userData.ph));}
  snow.position.set(Math.round(cp.x/40)*40,cp.y,Math.round(cp.z/40)*40);snow.material.opacity=0.35+0.25*k;}
 const _sv=new T.Vector3(),_sv2=new T.Vector3(),_sv3=new T.Vector3();
 const _ue=updEnv;updEnv=function(dt){_ue(dt);applyUW();};
 // ---- #9 depth control: target depth to 600 m (base clamps at 250) ----
 const _us=updShip;
 updShip=function(v,dt){if(!(v&&v.def&&v.def.cls==='sub'))return _us(v,dt);
  const p=inp.pitch;const bedD=-terrainH(v.mesh.position.x,v.mesh.position.z)-12;
  if(Math.abs(p)>0.05){const rate=settings.advanced?12:(Math.abs(p)>0.2?18:30);v.depthT=clamp(v.depthT-p*rate*(1+v.depthT/250)*dt,0,SUBX.maxD);}
  v.depthT=Math.min(v.depthT,Math.max(0,bedD));inp.pitch=0;const dT=v.depthT;
  try{_us(v,dt);}finally{inp.pitch=p;}
  v.depthT=dT;// deep transit: allow up to 6 m/s vertical when far from target (base caps 3 m/s)
  const e=v.depthT-v.depth;if(Math.abs(e)>8){v.depth+=clamp(e*0.4*dt,-3*dt,3*dt);v.mesh.position.y=v.depth<1?v.mesh.position.y:-v.depth;}
  gauge(v,bedD);};
 // ---- depth gauge (compact, top centre, replaces the text pill) ----
 const G=document.createElement('div');G.id='subGauge';G.innerHTML='<div class="sgN"><b>0</b><i>m</i></div><div class="sgBar"><div class="sgFill"></div><div class="sgTgt"></div><div class="sgBed"></div><div class="sgTest"></div></div><div class="sgS"></div>';
 const st=document.createElement('style');st.textContent=`#subGauge{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translateX(-50%);display:none;align-items:center;gap:10px;padding:6px 12px;border-radius:14px;background:rgba(2,14,26,.42);border:1px solid rgba(120,220,255,.28);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font:600 12px -apple-system,system-ui;color:#d6f3ff;pointer-events:none;z-index:6;letter-spacing:.04em}
#subGauge .sgN b{font-size:18px;font-variant-numeric:tabular-nums}#subGauge .sgN i{font-style:normal;opacity:.6;margin-left:2px}
#subGauge .sgBar{position:relative;width:150px;height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(90,200,255,.35),rgba(10,40,90,.6))}
#subGauge .sgFill{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:#7fe3ff}
#subGauge .sgTgt{position:absolute;top:-4px;width:2px;height:14px;background:#fff;opacity:.85}
#subGauge .sgBed{position:absolute;top:-3px;height:12px;right:0;background:repeating-linear-gradient(45deg,rgba(200,170,110,.7) 0 2px,transparent 2px 4px)}
#subGauge .sgTest{position:absolute;top:-2px;width:1px;height:10px;background:#ff6a4a}
#subGauge .sgS{min-width:44px;text-align:right;opacity:.8;font-variant-numeric:tabular-nums}#subGauge.warn{border-color:rgba(255,110,80,.7)}#subGauge.warn .sgFill{background:#ff7a5a}`;
 document.head.appendChild(st);document.body.appendChild(G);const gN=G.querySelector('b'),gF=G.querySelector('.sgFill'),gT=G.querySelector('.sgTgt'),gB=G.querySelector('.sgBed'),gX=G.querySelector('.sgTest'),gS=G.querySelector('.sgS');
 gX.style.left=(SUBX.testD/SUBX.maxD*100)+'%';let wT=0;
 function gauge(v,bedD){G.style.display='flex';const old=$('subDepth');if(old)old.style.visibility='hidden';const M=SUBX.maxD;
  gN.textContent=v.depth.toFixed(0);gF.style.width=clamp(v.depth/M*100,0,100)+'%';gT.style.left=clamp(v.depthT/M*100,0,100)+'%';gB.style.width=clamp((M-bedD-12)/M*100,0,100)+'%';
  gS.textContent=(v.spd*1.944).toFixed(0)+' kn';const w=v.depth>SUBX.testD;G.classList.toggle('warn',w);
  if(w&&simT-wT>6){wT=simT;msg('⚠ BELOW TEST DEPTH',1.5);}}
 const _hud=updHUD;updHUD=function(){_hud();if(!(player&&player.def&&player.def.cls==='sub'))G.style.display='none';};
 // ---- #3 sub launch cam (gameplay owner: gsub). Cold launch: missile is ejected straight up out of its tube, rises through the
 //      water, breaches, then flies on. Camera: shot 1 underwater beam view framing whole hull + missile leaving tube; shot 2 water-level
 //      view of breach + climb; then hands back to the normal missile follow cam.
 //      HOOK for subx_ (look/cinematics): window.__sub.SUBX.lc = {phase:'tube'|'air',t,v,o,tube:Vector3,f,side,R,br,rs}
 //      window.__sub.onLaunch.push(fn(lc)) fires at launch; set lc.camByX=true to take over the camera (gsub then writes nothing).
 const onLaunch=[];let subR=0;
 const _fw=fireWeapon;
 fireWeapon=function(v){const n=projs.length;const sub=v&&v===player&&v.def.cls==='sub'&&v.weapons[v.wi]!=='TORPEDO';if(sub)SUBX.firing=true;let r;try{r=_fw(v);}finally{SUBX.firing=false;}
  if(r!==false&&v&&v===player&&v.def.cls==='sub'&&v.weapons[v.wi]!=='TORPEDO'&&projs.length>n){const o=projs[projs.length-1];if(o){if(!SUBX.lc||SUBX.lc.o!==o)startLC(v,o);if(SUBX.lc)SUBX.lc.ex=projs.slice(n).filter(q=>q!==SUBX.lc.o);}}return r;};
 const _lb=launchBallistic;launchBallistic=function(v,w){const n=projs.length;const r=_lb(v,w);if(!SUBX.firing&&v&&v===player&&v.def.cls==='sub'&&projs.length>n)startLC(v,projs[projs.length-1]);return r;};
 function startLC(v,o){if(SUBX.lc&&SUBX.lc.fov)camera.fov=SUBX.lc.fov;
  if(!subR){const b=new T.Box3().setFromObject(v.mesh),s=new T.Vector3();b.getSize(s);subR=clamp(Math.max(s.x,s.y,s.z)*0.5,20,120);}
  const f=V3(-Math.sin(v.hdg),0,-Math.cos(v.hdg)),side=V3(f.z,0,-f.x);if(Math.random()<0.5)side.negate();
  const d=Math.max(0,v.depth||0);const tube=v.mesh.position.clone().addScaledVector(f,-subR*0.15);tube.y=Math.min(tube.y+4,-0.5);
  const L={phase:d>3?'tube':'air',t:0,t0:simT,v,o,f,side,tube,R:subR,fov:camera.fov,rs:clamp(d/1.7,9,32),vel0:o.vel?o.vel.clone():null,br:d>3?0:simT};
  L.hold=L.phase==='tube'?1.3:0;L.y0=tube.y;if(L.phase==='tube'){o.pos.copy(tube);if(o.mesh)o.mesh.position.copy(tube);}
  SUBX.lc=L;for(const fn of onLaunch){try{fn(L);}catch(e){console.warn('gsub hook',e);}}}
 function endLC(){const L=SUBX.lc;if(!L)return;camera.fov=L.fov;camera.updateProjectionMatrix();SUBX.lc=null;}
 const _lc=new T.Vector3(),_lt=new T.Vector3();
 function lcCam(){const L=SUBX.lc;if(!L)return false;
  if(!L.o||L.o.dead===true||!L.v.alive||player!==L.v||projs.indexOf(L.o)<0||(L.br&&simT-L.br>3.2)||L.t>16){endLC();return false;}
  if(L.camByX||(window.__subx&&__subx.seq&&__subx.seq.sub))return true;
  const sp=L.v.mesh.position,op=L.o.pos,R=L.R;
  if(L.phase==='tube'&&L.t<L.hold){// shot 0: close on the opening hatch
   _lc.copy(L.tube).addScaledVector(L.side,13).addScaledVector(L.f,9);_lc.y=L.tube.y+5;_lt.copy(L.tube);_lt.y+=0.5;}
  else if(L.phase==='tube'){// shot 1: underwater, abeam, slightly below the deck: full hull + missile rising out of the tube
   _lc.copy(L.tube).addScaledVector(L.side,R*0.95).addScaledVector(L.f,R*0.35);_lc.y=Math.min(sp.y+R*0.08,-3);
   _lt.copy(L.tube);_lt.y=lerp(sp.y+4,Math.min(op.y,-1),0.4);}
  else{const k=sstep(0,3,simT-L.br);// shot 2: just above the swell, breach point + missile climbing, sea kept in frame
   const bp=_sv3.copy(L.tube).setY(0);_lc.copy(bp).addScaledVector(L.side,R*1.5+k*R*0.8).addScaledVector(L.f,-R*0.6);_lc.y=lerp(6,14,k);
   const hor=Math.hypot(_lc.x-bp.x,_lc.z-bp.z);_lt.copy(bp);_lt.y=Math.min(Math.max(op.y,0)*0.5,hor*0.32);}
  camera.position.copy(_lc);camera.up.set(0,1,0);camera.lookAt(_lt);camera.fov=55;camera.updateProjectionMatrix();return true;}
 // cold-launch physics: hold the missile on the tube axis while submerged, rise at L.rs m/s, release at the surface
 const _up=updProjs;updProjs=function(dt){const L=SUBX.lc;const o=L&&L.phase==='tube'?L.o:null;let i=-1;
  const ex=o&&L.ex?L.ex.filter(q=>{const k=projs.indexOf(q);if(k>=0){projs.splice(k,1);return true;}return false;}):[];if(o){i=projs.indexOf(o);if(i>=0)projs.splice(i,1);}// keep base sim from treating the submerged missile as a water impact
  const La=L&&L.phase==='air'&&L.o&&simT-L.br<2.5?L.o:null;if(La&&L.ex)for(const q of L.ex){if(q.vel&&q.vel.y<30)q.vel.y=30;if(q.pos.y<6)q.pos.y=6;if(q.mesh)q.mesh.visible=true;}if(La&&La.vel){if(La.vel.y<30)La.vel.y=30;if(La.pos.y<6)La.pos.y=6;}// boost-out: glide bodies (o.hw) must not hit the 'ground' check right after breach
  let r;try{r=_up(dt);}finally{for(const q of ex){projs.push(q);q.pos.copy(o.pos);if(L.vel0&&q.vel)q.vel.copy(L.vel0);if(q.mesh){q.mesh.position.copy(q.pos);q.mesh.visible=false;}}if(o&&i>=0){projs.push(o);
   const ht=simT-L.t0-L.hold;if(ht<0){o.pos.copy(L.tube).y-=4;}else{if(!L.gas){L.gas=true;gasBurst(L.tube);if(L.hatch&&L.hatch.userData.mem)L.hatch.userData.mem.visible=false;}L.tube.y=Math.min(0.6,L.y0+L.rs*ht);}if(ht>=0)o.pos.copy(L.tube);if(L.vel0)o.vel.copy(L.vel0);if(o.mesh)o.mesh.position.copy(o.pos);
   if(L.tube.y>=0.6){L.phase='air';L.br=simT;o.pos.y=4.5;if(o.vel&&o.vel.y<25)o.vel.y=25;if(o.mesh)o.mesh.position.copy(o.pos);breachFx(o.pos);}}}
  return r;};
 // no smoke/fire particles under water (they rendered as dark fogged blobs filling the launch shot); splash stays
 for(const P of [smoke,fire]){const sp0=P.spawn.bind(P);P.spawn=function(p,...a){if(p&&p.y<-1.5&&(SUBX.lc||SUBX.firing))return;if(P===fire&&SUBX.lc&&SUBX.lc.phase==='air'&&!SUBX.ownFx&&SUBX.lc.o&&p&&p.distanceToSquared(SUBX.lc.o.pos)<900)return;return sp0(p,...a);};}
 // hide the held missile from per-frame game hooks (HGV warhead release by target distance fired 3 RVs under water)
 {const _gh=window.gameHook;window.gameHook=function(dt){const L=SUBX.lc;const hold=L&&L.o&&(L.phase==='tube'||simT-L.br<1.5)?[L.o,...(L.ex||[])]:[];const back=[];for(const q of hold){const k=projs.indexOf(q);if(k>=0){projs.splice(k,1);back.push(q);}if(L.phase==='tube')q.gsT=0;}
  try{if(_gh)_gh(dt);}finally{for(const q of back)projs.push(q);}};}
 const _ucs=updCamera;updCamera=function(dt){_ucs(dt);if(SUBX.lc){SUBX.lc.t=simT-SUBX.lc.t0;lcCam();}};
 // re-assert just before render so later camera modules (merged after gsub) cannot leave the shot showing empty sky
 const _rfs=renderFrame;renderFrame=function(sc,cam){if(SUBX.lc&&sc===scene&&cam===camera)lcCam();
  if(sc===scene&&cam===camera){const cp=camera.position;if(cp.y<waveH(cp.x,cp.z,simT)-0.3){if(typeof cloudDeck!=='undefined'&&cloudDeck)cloudDeck.visible=false;if(typeof clouds!=='undefined'&&clouds)clouds.visible=false;if(typeof sunCore!=='undefined')for(const q of [sunCore,sunHalo,sunRay,...ghosts])if(q&&q.material)q.material.opacity=0;}}
  if(SUBX.lc&&typeof sunHalo!=='undefined'){for(const q of [sunHalo,sunRay,...ghosts])if(q&&q.material)q.material.opacity=0;}// launch cam: no sun halo arc/ghosts// no sky clouds seen through the water
  let fd=null,ex=null;if(SUBX.lc&&sc===scene&&cam===camera&&camera.position.y>0){if(scene.fog&&scene.fog.density!==undefined){fd=scene.fog.density;scene.fog.density*=0.5;}ex=renderer.toneMappingExposure;renderer.toneMappingExposure*=0.85;}
  try{return _rfs(sc,cam);}finally{if(fd!==null)scene.fog.density=fd;if(ex!==null)renderer.toneMappingExposure=ex;}};

 // ===== launch realism + hull look (refs/gsub: sources.txt, compare.png) =====
 // -- bubble particles (fogged, rim-lit spheres; base Particles have no fog -> white cartoon puffs under water)
 const BN=600,bP=new Float32Array(BN*3),bV=new Float32Array(BN*3),bL=new Float32Array(BN),bS=new Float32Array(BN),bA=new Float32Array(BN);let bI=0;
 const bG=new T.BufferGeometry();bG.setAttribute('position',new T.BufferAttribute(bP,3));bG.setAttribute('size',new T.BufferAttribute(bS,1));bG.setAttribute('alpha',new T.BufferAttribute(bA,1));
 const bM=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{scale:{value:innerHeight/2},fogC:{value:new T.Color()},fogD:{value:0.003}},
  vertexShader:`attribute float size;attribute float alpha;varying float vA;varying float vF;uniform float scale,fogD;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);float z=-mv.z;vF=1.0-exp(-fogD*fogD*z*z);vA=alpha;gl_PointSize=clamp(size*scale/max(z,0.001),0.0,300.0);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`,fragmentShader:`varying float vA;varying float vF;uniform vec3 fogC;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
vec2 c=gl_PointCoord-0.5;float d=length(c);if(d>0.5)discard;
float rim=smoothstep(0.30,0.47,d)*smoothstep(0.5,0.46,d);float spec=smoothstep(0.12,0.0,length(c-vec2(-0.16,-0.16)));
float a=(0.10+0.75*rim+0.8*spec)*vA;vec3 col=mix(vec3(0.80,0.95,1.0),fogC,vF*0.85);gl_FragColor=vec4(col,a*(1.0-vF*0.7));}`});
 const bub=new T.Points(bG,bM);bub.frustumCulled=false;bub.renderOrder=3;scene.add(bub);
 function bubble(p,vx,vy,vz,life,size,a=1){const i=bI;bI=(bI+1)%BN;bP[i*3]=p.x;bP[i*3+1]=p.y;bP[i*3+2]=p.z;bV[i*3]=vx;bV[i*3+1]=vy;bV[i*3+2]=vz;bL[i]=life;bS[i]=size;bA[i]=a;}
 function updBub(dt){for(let i=0;i<BN;i++){if(bL[i]<=0)continue;bL[i]-=dt;const y=bP[i*3+1];if(bL[i]<=0||y>-0.3){bL[i]=0;bA[i]=0;bS[i]=0;if(y>-0.3&&Math.random()<0.05)smoke.spawn(_bv.set(bP[i*3],0.2,bP[i*3+2]),rnd(1),1,rnd(1),1.5,1.2,2,0.95,0.97,1,0.5,1,0);continue;}
  bV[i*3+1]+=(2.5+bS[i]*0.8-bV[i*3+1])*Math.min(1,dt*1.5);bV[i*3]*=1-dt*0.8;bV[i*3+2]*=1-dt*0.8;
  bP[i*3]+=(bV[i*3]+Math.sin(simT*6+i)*0.6)*dt;bP[i*3+1]+=bV[i*3+1]*dt;bP[i*3+2]+=(bV[i*3+2]+Math.cos(simT*5+i)*0.6)*dt;bS[i]*=1+dt*0.04;}
  bG.attributes.position.needsUpdate=bG.attributes.size.needsUpdate=bG.attributes.alpha.needsUpdate=true;
  if(scene.fog){bM.uniforms.fogC.value.copy(scene.fog.color);bM.uniforms.fogD.value=scene.fog.density||0.003;}}
 const _bv=new T.Vector3();const rnd=s=>(Math.random()-0.5)*2*s;
 // gas-generator ejection: steam/gas slug blows out of the tube, then the missile drags a column of bubbles to the surface
 function gasBurst(p){for(let i=0;i<220;i++){const r=Math.random();bubble(p,rnd(3+r*5),2+Math.random()*10,rnd(3+r*5),3+Math.random()*5,0.2+Math.pow(Math.random(),3)*3.2,0.9);}}
 function bubbleTrail(o,dt){const n=Math.ceil(14*dt*30);for(let i=0;i<n;i++){const a=Math.random()*6.28,r=0.6+Math.random()*1.6;
  bubble(_bv.set(o.pos.x+Math.cos(a)*r,o.pos.y-Math.random()*12,o.pos.z+Math.sin(a)*r),Math.cos(a)*1.5,1+Math.random()*3,Math.sin(a)*1.5,2.5+Math.random()*4,0.15+Math.pow(Math.random(),2.5)*2.4,0.85);}}
 // breach: white water column + spray + gas/steam cloud (refs/subx/launch/trident_breach_2019.jpg)
 function breachFx(p){const q=_bv.copy(p).setY(0.5);
  for(let i=0;i<220;i++){const a=Math.random()*6.28,r=Math.pow(Math.random(),0.55)*28;smoke.spawn(_sv.set(q.x+Math.cos(a)*r,0.4+Math.random()*6,q.z+Math.sin(a)*r),Math.cos(a)*(2+Math.random()*9),3+Math.random()*10,Math.sin(a)*(2+Math.random()*9),8+Math.random()*8,10+Math.random()*14,6+Math.random()*6,0.93,0.94,0.95,0.92,0.55,0.5,0.88,0.89,0.9);}
  for(let i=0;i<260;i++){const a=Math.random()*6.28,h=Math.random();smoke.spawn(_sv.set(q.x+rnd(3),1,q.z+rnd(3)),Math.cos(a)*(3+h*10),18+Math.random()*34,Math.sin(a)*(3+h*10),1.6+Math.random()*1.4,0.5+Math.random()*1.3,0.8,0.96,0.97,1,0.95,0.15,-9.8);}
  for(let i=0;i<130;i++){const a=Math.random()*6.28,r=Math.random()*14,sp=6+Math.random()*10;smoke.spawn(_sv.set(q.x+Math.cos(a)*r,1+Math.random()*5,q.z+Math.sin(a)*r),Math.cos(a)*sp,0.5+Math.random()*2.5,Math.sin(a)*sp,7+Math.random()*4,10+Math.random()*7,4+Math.random()*3,0.95,0.95,0.96,0.85,0.5,0.1,0.87,0.88,0.89);}// wide low skirt (Trident photo)
  for(let i=0;i<48;i++){const a=i/48*6.28;smoke.spawn(_sv.set(q.x+Math.cos(a)*4,0.6,q.z+Math.sin(a)*4),Math.cos(a)*9,0.6,Math.sin(a)*9,4,3,3,0.95,0.97,1,0.8,0.8,0);}}
 // -- hull: anechoic tile skin, Ohio proportions (170 m x 12.8 m -> L/B 13.3), hull lights; hatches open on launch
 const tileC=document.createElement('canvas');tileC.width=1024;tileC.height=1024;const bumpC=document.createElement('canvas');bumpC.width=bumpC.height=1024;
 {const x=tileC.getContext('2d'),y=bumpC.getContext('2d');x.fillStyle='#0c0d0e';x.fillRect(0,0,1024,1024);y.fillStyle='#000';y.fillRect(0,0,1024,1024);
  // irregular anechoic tiles: rows of varying height, tiles of varying width, near-black rubber, faint seams (refs/subx/ohio_surface.jpg)
  let yy=0;while(yy<1024){const h=Math.min(1024-yy,36+Math.random()*60|0);let xx=-(Math.random()*90|0);while(xx<1024){const w=30+Math.random()*110|0;const v=15+Math.random()*4+(Math.random()<0.02?6:0);
    x.fillStyle=`rgb(${v},${v+1},${v+2})`;const jy=Math.random()*3|0;x.fillRect(xx+1,yy+1+jy,w-2,h-2-jy);if(Math.random()<0.18){x.fillStyle='rgba(0,0,0,0.5)';x.fillRect(xx+(w*(0.3+Math.random()*0.4)|0),yy+1,1,h-2);}y.fillStyle=`rgb(${190+Math.random()*50|0},${190},${190})`;y.fillRect(xx+2,yy+2,w-4,h-4);
    if(Math.random()<0.025){x.fillStyle='#2a2b2a';x.fillRect(xx+1.5,yy+1.5,w-3,h-3);}xx+=w;}yy+=h;}
  // streaking (salt/rust runs down the sides) + grime
  for(let k=0;k<260;k++){const sx=Math.random()*1024,sy=Math.random()*1024,len=80+Math.random()*400,g=x.createLinearGradient(sx,0,sx+len,0);const lt=Math.random()<0.6;
   g.addColorStop(0,lt?'rgba(120,115,100,0.07)':'rgba(0,0,0,0.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx,sy,len,1+Math.random()*4);}
  for(let k=0;k<900;k++){x.fillStyle=`rgba(60,58,50,${Math.random()*0.06})`;x.fillRect(Math.random()*1024,Math.random()*1024,2+Math.random()*20,1+Math.random()*2);}}
 const mkT=(c,rx,ry,srgb)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;if(srgb)t.colorSpace=T.SRGBColorSpace;return t;};
 const hullFill=new T.DirectionalLight(0xbfe8ff,0);scene.add(hullFill);scene.add(hullFill.target);
 const rimL=new T.DirectionalLight(0x9fdcff,0);scene.add(rimL);scene.add(rimL.target);
 function upHull(v){const m=v.mesh;if(m.userData.gsubHull)return;m.userData.gsubHull=true;m.scale.x*=0.86;m.scale.y*=0.86;const hatches=[];
  m.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color)return;const h=o.material.color.getHexString(),gt=o.geometry.type;
   if(h==='9aa0a4'){const lathe=gt==='LatheGeometry';o.material=o.material.clone();o.material.map=mkT(tileC,lathe?40:0.35,lathe?110:0.35,true);o.material.bumpMap=mkT(bumpC,lathe?40:0.35,lathe?110:0.35);o.material.bumpScale=1.3;
    o.material.normalMap=null;o.material.color.setHex(0xffffff);o.material.roughness=0.82;o.material.metalness=0.0;o.material.envMapIntensity=0.5;o.material.needsUpdate=true;}
   if(gt==='CylinderGeometry'&&h==='22262a'){o.geometry.computeBoundingBox();hatches.push(o);}});
  // turtleback: raised flat missile-deck fairing behind the sail; hatches sit flush in it (Ohio: 24 tubes in 2 rows)
  if(hatches.length){const bb=new T.Box3();for(const hm of hatches){hm.geometry.computeBoundingBox();const q=hm.geometry.boundingBox.clone();q.translate(hm.position);bb.union(q);}
   const tbW=bb.max.x-bb.min.x+2.2,tbL=bb.max.z-bb.min.z+5,top=bb.max.y-0.02;const P=hatches[0].parent;
   const tbM=hatches[0].material.clone();const hullMat=(()=>{let mm=null;m.traverse(o=>{if(!mm&&o.isMesh&&o.geometry.type==='LatheGeometry')mm=o.material;});return mm;})();
   const shp=new T.Shape();const hw=tbW/2;shp.moveTo(-hw-1.2,-2.2);shp.lineTo(-hw-0.2,-0.25);shp.quadraticCurveTo(-hw,0,-hw+0.6,0);shp.lineTo(hw-0.6,0);shp.quadraticCurveTo(hw,0,hw+0.2,-0.25);shp.lineTo(hw+1.2,-2.2);shp.lineTo(-hw-1.2,-2.2);
   const tg=new T.ExtrudeGeometry(shp,{depth:tbL,bevelEnabled:false,curveSegments:6});tg.translate(0,0,-tbL/2);
   const tb=new T.Mesh(tg,hullMat?hullMat.clone():tbM);if(tb.material.map){tb.material.map=tb.material.map.clone();tb.material.map.repeat.set(0.18,0.18);tb.material.map.needsUpdate=true;}if(tb.material.bumpMap){tb.material.bumpMap=tb.material.bumpMap.clone();tb.material.bumpMap.repeat.set(0.18,0.18);tb.material.bumpMap.needsUpdate=true;}
   tb.position.set((bb.min.x+bb.max.x)/2,top,(bb.min.z+bb.max.z)/2);tb.name='gsubTurtleback';P.add(tb);
   const lipM=new T.MeshStandardMaterial({color:0x07080a,roughness:0.6,metalness:0.3});
   for(const hm of hatches){const r=(hm.geometry.parameters&&hm.geometry.parameters.radiusTop)||1;hm.geometry=new T.CylinderGeometry(r,r,0.38,32);hm.material=tb.material;hm.position.y=top-0.17;
    const piv=new T.Group();P.add(piv);piv.position.copy(hm.position).add(_sv.set(0,0.17,-r));hm.position.set(0,-0.17,r);piv.add(hm);hm.userData.piv=piv;
    // seam ring, hinge barrel + 2 arms, tube wall, muzzle membrane
    const ring=new T.Mesh(new T.TorusGeometry(r+0.04,0.05,6,40).rotateX(Math.PI/2),lipM);ring.position.set(piv.position.x,top+0.005,piv.position.z+r);P.add(ring);
    const barrel=new T.Mesh(new T.CylinderGeometry(0.16,0.16,r*1.1,12).rotateZ(Math.PI/2),lipM);barrel.position.set(piv.position.x,top+0.05,piv.position.z-0.05);P.add(barrel);
    const wall=new T.Mesh(new T.CylinderGeometry(r*0.96,r*0.96,3,28,1,true),new T.MeshStandardMaterial({color:0x111214,roughness:0.7,metalness:0.4,side:T.BackSide}));wall.position.set(piv.position.x,top-1.5,piv.position.z+r);P.add(wall);
    const mem=new T.Mesh(new T.SphereGeometry(r*0.98,28,12,0,Math.PI*2,0,0.62),new T.MeshStandardMaterial({color:0xf2e2b8,roughness:0.42,metalness:0.05,emissive:0x3a2a10,emissiveIntensity:0.35}));mem.scale.y=0.55;mem.position.set(piv.position.x,top-0.55,piv.position.z+r);P.add(mem);
    const seal=new T.Mesh(new T.RingGeometry(r*0.15,r*0.92,28),new T.MeshStandardMaterial({color:0x6a5030,roughness:0.6,metalness:0.2,side:T.DoubleSide}));seal.rotation.x=-Math.PI/2;seal.position.set(piv.position.x,top-0.42,piv.position.z+r);P.add(seal);hm.userData.mem=mem;}}
  m.userData.hatches=hatches;}
 function hatchFor(v,tube){const H=v.mesh.userData.hatches;if(!H||!H.length)return null;let best=null,bd=1e9;const w=new T.Vector3();for(const h of H){if(h.userData.open)continue;h.getWorldPosition(w);const d=w.distanceTo(tube);if(d<bd){bd=d;best=h;}}return best;}
 const opening=[];
 let _tl=0;function tickLaunch(){const dt=Math.min(0.5,Math.max(0,simT-_tl));_tl=simT;updBub(dt);const L=SUBX.lc;
  for(const h of opening){h.userData.t+=dt;h.userData.piv.rotation.x=-Math.min(1,h.userData.t/0.9)*1.75;}
  const cp=camera.position,under=cp.y<0;const sp=player&&player.def&&player.def.cls==='sub'?player:null;
  if(sp&&under){const m=sp.mesh;hullFill.intensity=4.2;hullFill.position.copy(cp).add(_sv.set(0,60,0));hullFill.target.position.copy(m.position);
   rimL.intensity=4.5;rimL.position.copy(m.position).add(_sv.set(0,120,0)).addScaledVector(_sv2.copy(m.position).sub(cp).setY(0).normalize(),80);rimL.target.position.copy(m.position);}else{hullFill.intensity=0;rimL.intensity=0;}
  if(L&&L.phase==='tube'&&L.gas&&L.o)bubbleTrail(L.o,dt);
  // continuous trail: fill the gap between frames with overlapping puffs (base trail spawns once per frame -> dotted at missile speed)
  if(L&&L.phase==='air'&&L.o&&L.o.pos.y>2){const p=L.o.pos;if(L.lp){const d=p.distanceTo(L.lp),n=Math.min(40,Math.ceil(d/2.5));for(let i=0;i<n;i++){_bv.copy(L.lp).lerp(p,i/n);smoke.spawn(_bv,rnd(0.8),rnd(0.8)+0.5,rnd(0.8),4+Math.random()*2,3.5+Math.random()*1.5,3.5,0.93,0.93,0.94,0.55,0.4,0.3,0.85,0.85,0.86);}
   SUBX.ownFx=true;const dv=_sv2.copy(p).sub(L.lp);for(let i=0;i<6;i++){_bv.copy(p).addScaledVector(dv,-i/6*0.9);fire.spawn(_bv,0,0,0,0.12,2.2-i*0.25,-4,1,0.85,0.55,0.9,0,0,1,0.45,0.15);}SUBX.ownFx=false;}(L.lp||(L.lp=new T.Vector3())).copy(p);}
  // breach column: gas/steam + water carried up behind the missile, ~5x missile length (~65 m, Trident II D5 13.4 m) like the 2019 photo
  if(L&&L.phase==='air'&&L.o&&simT-L.br<1.6){const k=(simT-L.br)/1.6,n=Math.ceil(dt*30*6),top=Math.min(L.o.pos.y,68);
   for(let i=0;i<n;i++){const hh=Math.pow(Math.random(),1.4)*top,w=lerp(9,3,hh/68);smoke.spawn(_sv.set(L.tube.x+rnd(w),hh,L.tube.z+rnd(w)),rnd(2.5),1+Math.random()*3,rnd(2.5),6+Math.random()*4,lerp(14,7,hh/68)+Math.random()*5,3+Math.random()*3,0.94,0.95,0.96,0.85,0.3,0.4,0.86,0.87,0.88);}}}
 const _usp=updShip;updShip=function(v,dt){if(v&&v.def&&v.def.cls==='sub')upHull(v);return _usp(v,dt);};
 const _ue2=updEnv;updEnv=function(dt){_ue2(dt);tickLaunch();};
 onLaunch.push(L=>{if(L.phase!=='tube')return;const h=hatchFor(L.v,L.tube);if(h){const w=new T.Vector3();h.userData.piv.getWorldPosition(w);L.tube.x=w.x;L.tube.z=w.z;L.tube.y=Math.min(w.y+1,-0.5);L.y0=L.tube.y;L.o.pos.copy(L.tube);h.userData.open=true;h.userData.t=0;opening.push(h);L.hatch=h;}});
 window.__gsubPostOff=()=>{for(const p of composer.passes)if(p!==rPass&&p.constructor.name!=='OutputPass')p.enabled=false;};// test-only: shots without post (wh owns NaN/black-block bug)
 window.__gsubKeys=()=>Object.keys(DEFS);window.__sub={opening,smoke,fire,get cam(){return camera.position},SUBX,onLaunch,fire:v=>fireWeapon(v),rebuild,terrainH:(x,z)=>terrainH(x,z)};}
