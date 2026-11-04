//GRODS3 – steerable rods (deployable tail fins + canards), target/impact markers, third-person orbit view with inset targeting, ground clarity aids
const RD3={tp:false,hc:false,icons:[]};
{const T=THREE;
 const finM=new T.MeshPhysicalMaterial({color:0x8d9198,metalness:1,roughness:0.3,emissive:0xff5a1a,emissiveIntensity:0});
 const hingeM=new T.MeshStandardMaterial({color:0x2a2c30,metalness:0.8,roughness:0.5});
 function finGeo(sp,ch,tc,sw){const s=new T.Shape();s.moveTo(0,0);s.lineTo(0,ch);s.lineTo(sp,ch-sw);s.lineTo(sp,ch-sw-tc);s.lineTo(0,0);const g=new T.ExtrudeGeometry(s,{depth:0.018,bevelEnabled:true,bevelSize:0.005,bevelThickness:0.006,bevelSegments:2});g.translate(0,0,-0.009);return g;}
 const TAIL=finGeo(0.62,0.9,0.42,0.25),CAN=finGeo(0.22,0.32,0.14,0.1);
 // attach to a fired rod: 4 folding tail fins (hinged at the boat-tail) + 4 small canards behind the nose
 RD3.fit=function(o){const m=o.mesh,fins=[];
  for(const [y,geo,n,off] of [[-3.0,TAIL,4,Math.PI/4],[1.9,CAN,4,0]])for(let i=0;i<n;i++){const pv=new T.Group();pv.rotation.y=i*Math.PI/2+off;const hg=new T.Group();hg.position.set(0.155,y,0);pv.add(hg);
   const f=new T.Mesh(geo,finM.clone());hg.add(f);const pin=new T.Mesh(new T.CylinderGeometry(0.02,0.02,0.06,10).rotateX(Math.PI/2),hingeM);pin.position.y=0.05;hg.add(pin);
   hg.rotation.z=-1.45;hg.userData.can=geo===CAN;f.visible=geo===TAIL;m.add(pv);fins.push(hg);}
  o.fins=fins;o.dep=0;};
 const mk=(col,r)=>{const g=new T.Group();const mat=new T.MeshBasicMaterial({color:col,transparent:true,opacity:0.95,depthTest:false,depthWrite:false,fog:false,side:T.DoubleSide});
  const a=new T.Mesh(new T.RingGeometry(0.86,1,64).rotateX(-Math.PI/2),mat);g.add(a);for(let i=0;i<4;i++){const b=new T.Mesh(new T.PlaneGeometry(0.06,0.5).rotateX(-Math.PI/2),mat);b.position.set(Math.sin(i*1.5708)*1.2,0,Math.cos(i*1.5708)*1.2);b.rotation.y=i*1.5708;g.add(b);}
  g.renderOrder=999;g.traverse(x=>x.renderOrder=999);g.visible=false;scene.add(g);return g;};
 RD3.mT=mk(0xff3b30);RD3.mP=mk(0x5ac8fa);RD3.mA=mk(0xffd60a);
 const place=(g,p,s)=>{g.position.copy(p);g.position.y+=1;g.scale.setScalar(s);g.visible=true;};
 RD3.scale=p=>Math.max(30,camera.position.distanceTo(p)*Math.tan(camera.fov*Math.PI/360)*0.06);
 // fire wrapper: fins + auto-follow offer
 const _fw=fireWeapon;fireWeapon=function(v){const r=_fw(v);if(v&&v.kind==='rods'&&r){const o=projs.filter(q=>q.type==='rod').pop();if(o&&!o.fins){RD3.fit(o);RD3.last=o;}}return r;};
 // steering in the atmosphere
 const _ur=updRod;updRod=function(o,dt){const sp0=o.vel.length();_ur(o,dt);if(o.done)return;const p=o.pos,h=p.y;
  o.mesh.quaternion.setFromUnitVectors(V3(0,1,0),_t.copy(o.vel).normalize());
  if(o.fins){const want=h<80000&&o.phase==='fall'?1:0;if(want&&!o.depMsg){o.depMsg=1;msg('FINS DEPLOYED - STEER WITH STICK',1.6);play3D('missile',null,0.25,2.2);}
   o.dep+=(want-o.dep)*Math.min(1,dt*2.5);const rhoN=Math.exp(-h/7200);for(const f of o.fins){f.rotation.z=-1.45*(1-o.dep);f.children[0].visible=!f.userData.can||o.dep>0.05;f.children[0].material.emissiveIntensity=o.rodM?o.rodM.emissiveIntensity*0.8:0;}
   if(o.dep>0.3){const S=GUIDE.active?GUIDE.stick:{p:inp.pitch||0,r:inp.roll||0};const sx=clamp((S.r||0),-1,1),sy=clamp((S.p||0),-1,1);
    const R=_t.set(1,0,0).applyQuaternion(camera.quaternion);R.y=0;if(R.lengthSq()<1e-6)R.set(1,0,0);R.normalize();const F=V3(-R.z,0,R.x).negate();F.set(R.z,0,-R.x);
    const auth=(70+900*Math.min(1,rhoN/0.3))*o.dep;o.vel.addScaledVector(R,sx*auth*dt).addScaledVector(F,sy*auth*dt);
    for(const f of o.fins){const a=f.parent.rotation.y;f.rotation.x=clamp(sx*Math.cos(a)-sy*Math.sin(a),-1,1)*0.35*o.dep;}
    const sp=o.vel.length(),tgtS=Math.max(sp0*0.995,2900);if(sp<tgtS)o.vel.multiplyScalar(tgtS/sp);if(o.vel.y>-1200)o.vel.y=-1200;}}
  // markers + prediction
  const gh=groundAt(p.x,p.z).h,tI=(h-gh)/Math.max(1,-o.vel.y);o.pred=V3(p.x+o.vel.x*tI,0,p.z+o.vel.z*tI);o.pred.y=groundAt(o.pred.x,o.pred.z).h;o.tti=tI;
  if(camFollow===o||RD3.tp){place(RD3.mT,o.tgt,RD3.scale(o.tgt));place(RD3.mP,o.pred,RD3.scale(o.pred));}};
 // tick: hide markers when idle
 const _tk=tick;tick=function(dt){_tk(dt);const any=projs.some(q=>q.type==='rod');if(!any){RD3.mT.visible=RD3.mP.visible=false;}if(!(player&&player.kind==='rods'))RD3.mA.visible=false;};
 // HUD: view toggle, follow, high-contrast, minimap/compass, rod readout, unit icons
 const css=document.createElement('style');css.textContent=`.rdB{position:fixed;z-index:46;pointer-events:auto;padding:12px 16px;border-radius:16px;background:rgba(30,40,60,.55);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#fff;font:600 14px -apple-system,sans-serif;display:none;user-select:none;-webkit-user-select:none;touch-action:none}
 .rdB.on{background:rgba(10,132,255,.6)}#rdView{right:calc(84px + env(safe-area-inset-right));top:calc(122px + env(safe-area-inset-top));font-size:16px;padding:14px 20px}#rdFol{right:calc(84px + env(safe-area-inset-right));top:calc(182px + env(safe-area-inset-top))}#rdHC{right:calc(232px + env(safe-area-inset-right));top:calc(182px + env(safe-area-inset-top))}
 #rdMap{position:fixed;left:calc(10px + env(safe-area-inset-left));bottom:calc(150px + env(safe-area-inset-bottom));width:150px;height:150px;z-index:46;pointer-events:none;display:none;border-radius:50%;background:rgba(0,10,20,.45)}
 #rdInfo{position:fixed;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:46;pointer-events:none;display:none;font:600 13px ui-monospace,Menlo,monospace;color:#e8f4ff;text-shadow:0 0 4px #000;white-space:pre;text-align:center}
 .rdIc{position:fixed;z-index:44;pointer-events:none;font:600 10px -apple-system,sans-serif;color:#ff453a;text-shadow:0 0 3px #000;transform:translate(-50%,-50%);text-align:center}
 .rdIc i{display:block;margin:0 auto 2px;width:10px;height:10px;border:2px solid #ff453a;transform:rotate(45deg)}
 #rdInsetF{position:fixed;z-index:43;pointer-events:none;display:none;border:1px solid rgba(255,255,255,.55);border-radius:14px;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
 #rdInsetF:after{content:'TARGETING';position:absolute;left:8px;top:6px;font:600 10px -apple-system,sans-serif;letter-spacing:.2em;color:#fff}
 #rdInsetF b{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px;border:1.5px solid #ffd60a}`;document.head.appendChild(css);
 const B=(id,txt,f)=>{const b=document.createElement('div');b.id=id;b.className='rdB';b.textContent=txt;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();window.__tapT=performance.now();f(b);});document.body.appendChild(b);return b;};
 RD3.bView=B('rdView','👁  3RD PERSON',b=>{RD3.tp=!RD3.tp;if(RS)RS.inspect=null;});
 RD3.bFol=B('rdFol','FOLLOW ROD',b=>{const o=projs.filter(q=>q.type==='rod').pop();if(camFollow&&camFollow.type==='rod')camFollow=null;else if(o)camFollow=o;});
 RD3.bHC=B('rdHC','HI-CONTRAST',b=>{RD3.hc=!RD3.hc;});
 const mp=document.createElement('canvas');mp.id='rdMap';mp.width=mp.height=300;document.body.appendChild(mp);
 const info=document.createElement('div');info.id='rdInfo';document.body.appendChild(info);
 const insF=document.createElement('div');insF.id='rdInsetF';insF.innerHTML='<b></b>';document.body.appendChild(insF);
 const icRoot=document.createElement('div');document.body.appendChild(icRoot);
 const insCam=new T.PerspectiveCamera(5,1,50,400000);RD3.insCam=insCam;
 const _uc=updCamera;updCamera=function(dt){_uc(dt);const on=!!(RS&&player&&player.kind==='rods');for(const b of[RD3.bView,RD3.bFol,RD3.bHC])b.style.display=on?'block':'none';mp.style.display=info.style.display=on?'block':'none';
  if(!on){insF.style.display='none';icRoot.innerHTML='';RD3.tp=false;renderer.domElement.style.filter='';return;}
  const rod=projs.filter(q=>q.type==='rod').pop();const fol=camFollow&&camFollow.type==='rod';RD3.bView.classList.toggle('on',RD3.tp);RD3.bFol.classList.toggle('on',fol);RD3.bFol.style.display=rod?'block':'none';RD3.bHC.classList.toggle('on',RD3.hc);
  renderer.domElement.style.filter=RD3.hc?'contrast(1.45) saturate(1.35) brightness(1.08)':'';
  const zoom=(__milsim.FL&&__milsim.FL.zoom)||1;
  // third-person orbit chase behind/above the satellite; stick still slews the aim
  if(RD3.tp&&!fol&&!(RS.iv&&RS.iv.t>0)){RS.el.style.display='none';const s=GUIDE.stick;const ix=clamp((inp.roll||0)+(s.r||0),-1,1),iy=clamp((inp.pitch||0)+(s.p||0),-1,1);const span=6000*zoom;
   RS.aim.x+=ix*span*0.6*dt;RS.aim.z-=iy*span*0.6*dt;RS.aim.y=groundAt(RS.aim.x,RS.aim.z).h;
   if(camera.fov!==50){camera.fov=50;camera.updateProjectionMatrix();}camera.up.set(0,1,0);const c=RS.sat.position,R=34*zoom;
   const want=_t.set(c.x-R,c.y+R*0.45,c.z+R*0.35);RD3.cp=RD3.cp||want.clone();RD3.cp.lerp(want,1-Math.exp(-dt*4));camera.position.copy(RD3.cp);camera.lookAt(c.x+8,c.y-6,c.z);}
  RD3.inset=RD3.tp&&!fol;insF.style.display=RD3.inset?'block':'none';
  if(RD3.inset){const W=innerWidth,H=innerHeight,w=Math.round(Math.min(W*0.42,240)),h=Math.round(w*0.75);RD3.ir=[W-w-14,H-h-Math.max(150,H*0.2),w,h];Object.assign(insF.style,{left:RD3.ir[0]+'px',top:RD3.ir[1]+'px',width:w+'px',height:h+'px'});
   const span=6000*zoom;insCam.aspect=w/h;insCam.fov=clamp(2*Math.atan(span/2/ROD_ALT)*180/Math.PI,0.6,40);insCam.updateProjectionMatrix();insCam.position.copy(RS.sat.position).add(V3(0,-8,0));insCam.up.set(0,0,-1);insCam.lookAt(RS.aim);}
  if(!fol)place(RD3.mA,RS.aim,RD3.scale(RS.aim));else RD3.mA.visible=false;
  // readout
  if(rod){const sp=rod.vel.length();const miss=rod.pred?Math.hypot(rod.pred.x-rod.tgt.x,rod.pred.z-rod.tgt.z):0;info.textContent=`${rod.name}  ALT ${(rod.pos.y/1000).toFixed(1)} km  M ${(sp/340).toFixed(1)}  TTI ${(rod.tti||0).toFixed(1)} s\nFINS ${rod.dep>0.9?'DEPLOYED':rod.dep>0.05?'OPENING':'STOWED'}  MISS ${miss<1000?Math.round(miss)+' m':(miss/1000).toFixed(1)+' km'}  ${rod.dep>0.3?'STICK = STEER':''}`;}
  else info.textContent=RD3.tp?`RODS ${player.ammo.ROD}/6  ·  stick moves the aim  ·  FIRE to drop`:'';
  // minimap with range rings + compass, relative to the aim (or the rod's predicted impact)
  const cx=fol&&rod?rod.pred||rod.pos:RS.aim;const x=mp.getContext('2d');const M=150,rng=Math.max(2000,6000*zoom);x.clearRect(0,0,300,300);x.save();x.translate(M,M);
  x.strokeStyle='rgba(200,230,255,.5)';x.lineWidth=2;for(const k of[0.33,0.66,1]){x.beginPath();x.arc(0,0,k*140,0,7);x.stroke();}x.fillStyle='rgba(200,230,255,.8)';x.font='600 18px -apple-system';x.textAlign='center';x.fillText('N',0,-118);x.font='14px -apple-system';x.fillText((rng/1000).toFixed(1)+' km',0,136);
  x.beginPath();x.moveTo(-140,0);x.lineTo(140,0);x.moveTo(0,-140);x.lineTo(0,140);x.strokeStyle='rgba(200,230,255,.18)';x.stroke();
  const pt=(p,col,r)=>{const dx=(p.x-cx.x)/rng*140,dz=(p.z-cx.z)/rng*140;if(Math.hypot(dx,dz)>140)return;x.fillStyle=col;x.beginPath();x.arc(dx,dz,r,0,7);x.fill();};
  for(const t of targets)if(t.alive)pt(t.pos,'#ff453a',5);if(typeof ENEMY!=='undefined')pt(ENEMY,'#ff9f0a',7);if(typeof NYC!=='undefined')pt(NYC,'#64d2ff',7);
  if(rod){pt(rod.tgt,'#ff3b30',9);if(rod.pred)pt(rod.pred,'#5ac8fa',7);}pt(RS.aim,'#ffd60a',6);x.restore();
  // unit icons projected on screen
  icRoot.innerHTML='';const cams=[[camera,0,0,innerWidth,innerHeight]];let n=0;
  const used=[];const ctr=fol&&rod?(rod.pred||rod.pos):RS.aim;for(const t of targets){if(!t.alive||n>24)continue;if(Math.hypot(t.pos.x-ctr.x,t.pos.z-ctr.z)>Math.max(4000,9000*zoom))continue;const v=_t.copy(t.pos).project(camera);if(v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1)continue;const sx=(v.x+1)/2*innerWidth,sy=(1-v.y)/2*innerHeight;if(used.some(u=>Math.hypot(u[0]-sx,u[1]-sy)<34))continue;used.push([sx,sy]);n++;const d=document.createElement('div');d.className='rdIc';d.style.left=((v.x+1)/2*innerWidth)+'px';d.style.top=((1-v.y)/2*innerHeight)+'px';d.innerHTML='<i></i>'+(t.name||t.kind||'TGT').toString().slice(0,10).toUpperCase();icRoot.appendChild(d);}};
 // render: thinner haze for rods views, inset targeting picture in third person
 const _rf=renderFrame;renderFrame=function(sc,cam){const on=RS&&player&&player.kind==='rods'&&scene.fog;let fd;if(on){fd=scene.fog.density;scene.fog.density=fd*(RD3.hc?0.08:0.25);}_rf(sc,cam);
  if(on&&RD3.inset&&RD3.ir){const [x,y,w,h]=RD3.ir,H=innerHeight;const ac=renderer.autoClear;renderer.autoClear=false;renderer.setScissorTest(true);renderer.setViewport(x,H-y-h,w,h);renderer.setScissor(x,H-y-h,w,h);renderer.clearDepth();
   RD3.mA.scale.setScalar(Math.max(30,ROD_ALT*Math.tan(RD3.insCam.fov*Math.PI/360)*0.08));renderer.render(sc,RD3.insCam);renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.autoClear=ac;}
  if(on)scene.fog.density=fd;};
}
try{window.__milsim.fireWeapon=fireWeapon;}catch(e){}try{window.__milsim.rd3=RD3;}catch(e){}try{window.__milsim.setFollow=o=>{camFollow=o;};}catch(e){}
