// ===== GMSL2_SM3: RIM-161 SM-3 Block IIA (Kyle fix #7). Ship-launched from Mk41 VLS, 4 stages: Mk72 booster -> Mk104 DTRM -> Mk136 TSRM (2 pulses)
// -> clamshell nosecone jettison -> LEAP-style kinetic warhead with DACS divert, hit-to-kill in space. Nose-cam follow. 6.55 m x 0.533 m (21 in).
// Reattach to any ship: GMSL2_SM3.attach('defKey',{f:40,u:8,r:0})  (VLS position in ship frame: f=forward m, u=up m, r=right m)
(()=>{const T=THREE,PI=Math.PI,UP=new T.Vector3(0,1,0),_a=new T.Vector3(),_b=new T.Vector3(),_c=new T.Vector3(),_d=new T.Vector3(),_e=new T.Vector3(),_q=new T.Quaternion();
 const R=0.2665,LEN=6.55;
 // ---------- skin ----------
 function skin(len,o){const W=512,H=Math.round(1024*Math.min(2,len/1.6)),c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle=o.base||'#ecebe6';x.fillRect(0,0,W,H);for(let i=0;i<900;i++){x.fillStyle=`rgba(60,55,45,${Math.random()*0.03})`;const s=3+Math.random()*26;x.fillRect(Math.random()*W,Math.random()*H,s*3,s);}
  const Y=y=>(1-y/len)*H;
  for(const b of o.bands||[]){x.fillStyle=b.c;x.fillRect(0,Y(b.y1),W,Y(b.y0)-Y(b.y1));}
  x.lineWidth=2;for(const y of o.rings||[]){x.strokeStyle='rgba(0,0,0,0.5)';x.beginPath();x.moveTo(0,Y(y));x.lineTo(W,Y(y));x.stroke();x.fillStyle='rgba(0,0,0,0.4)';for(let u=0;u<W;u+=W/32){x.beginPath();x.arc(u,Y(y)+5,1.4,0,7);x.fill();x.beginPath();x.arc(u,Y(y)-5,1.4,0,7);x.fill();}}
  for(const p of o.panels||[]){const[u0,u1,y0,y1]=p;x.strokeStyle='rgba(0,0,0,0.42)';x.lineWidth=1.6;x.strokeRect(u0*W,Y(y1),(u1-u0)*W,Y(y0)-Y(y1));x.fillStyle='rgba(0,0,0,0.45)';for(const[a,b]of[[u0,y0],[u1,y0],[u0,y1],[u1,y1]]){x.beginPath();x.arc(a*W+(a==u0?5:-5),Y(b)+(b==y0?-5:5),1.8,0,7);x.fill();}}
  for(const s of o.text||[]){x.save();x.translate(s.u*W,Y(s.y));x.rotate(-PI/2);x.fillStyle=s.c||'#1b1b1b';x.font=`${s.b?'bold ':''}${s.s||20}px "DejaVu Sans Condensed",Arial Narrow,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(s.t,0,0);x.restore();}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
 const M=(c,r=0.55,m=0.1,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o));
 function lathe(pts,mat,y0=0,seg=48,phi0=0,phiL=2*PI){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(p[0],1e-4),p[1])),seg,phi0,phiL);const L=pts[pts.length-1][1]-pts[0][1];
  const uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setY(i,(pos.getY(i)-pts[0][1])/L);g.computeVertexNormals();const m=new T.Mesh(g,mat);m.position.y=y0;return m;}
 function ogive(Rb,Ln,y0,n=18,tip=0.012){const a=[];const rho=(Rb*Rb+Ln*Ln)/(2*Rb);for(let i=0;i<=n;i++){const yy=i/n*Ln;a.push([Math.max(Math.sqrt(rho*rho-yy*yy)+Rb-rho,tip*(i==n?0.4:1)),y0+yy]);}return a;}
 function fin(G,y,root,tip,span,sweep,th,mat,roll,n=4){for(let i=0;i<n;i++){const s=new T.Shape();s.moveTo(0,0);s.lineTo(span,sweep);s.lineTo(span,sweep+tip);s.lineTo(0,root);s.closePath();
   const g=new T.ExtrudeGeometry(s,{depth:th*0.5,bevelEnabled:true,bevelThickness:th*0.25,bevelSize:0.004,bevelSegments:2});g.translate(0,0,-th*0.25);const f=new T.Mesh(g,mat);
   const p=new T.Group();f.position.set(R*0.98,y,0);p.add(f);p.rotation.y=roll+i*PI/2;G.add(p);}}
 function band(G,r,w,y,mat){const m=new T.Mesh(new T.CylinderGeometry(r,r,w,48,1,true),mat);m.position.y=y;G.add(m);return m;}
 function nozzle(G,r0,r1,l,y){const o=new T.Mesh(new T.CylinderGeometry(r0,r1,l,32,1,true),M(0x2b2826,0.45,0.7,{side:T.DoubleSide}));o.position.y=y-l/2;G.add(o);
  const th=new T.Mesh(new T.CircleGeometry(r0*0.9,24),M(0x110d0b,0.9,0.2));th.rotation.x=PI/2;th.position.y=y-0.02;G.add(th);return o;}
 const dark=M(0x3a3c3e,0.5,0.4),metal=M(0x9a9c9e,0.35,0.8),fins=M(0xe2e1dc,0.5,0.15);
 function build(){const root=new T.Group();root.name='SM-3 Block IIA';const body=new T.Group();body.position.y=-LEN;root.add(body);// origin = nose tip
  // --- Mk72 booster 0..1.70 (4 TVC nozzles, 4 clipped-delta tail fins) ---
  const s1=new T.Group();s1.name='Mk72';
  s1.add(lathe([[0.235,0],[R,0.07],[R,1.70]],M(0xffffff,0.6,0.08,{map:skin(1.7,{bands:[{y0:1.18,y1:1.24,c:'#7a5230'}],rings:[0.07,0.62,1.62],panels:[[0.08,0.2,0.85,1.1],[0.58,0.7,0.85,1.1]],text:[{u:0.36,y:0.95,t:'MK 72 MOD 1  BOOSTER',s:15,b:1},{u:0.86,y:0.95,t:'ROCKET MOTOR',s:14}]})})));
  band(s1,R+0.004,0.05,1.675,metal);for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const nz=new T.Group();nozzle(nz,0.07,0.1,0.18,0.02);nz.position.set(Math.cos(a)*0.13,0,Math.sin(a)*0.13);s1.add(nz);}
  const base=new T.Mesh(new T.CircleGeometry(0.236,40),M(0x2a2a2a,0.8,0.3));base.rotation.x=PI/2;base.position.y=0.001;s1.add(base);
  fin(s1,0.04,0.66,0.28,0.52,0.36,0.016,fins,0);
  body.add(s1);
  // --- Mk104 DTRM + steering control section 1.70..4.30 (4 control fins aft, dorsal raceway) ---
  const s2=new T.Group();s2.name='Mk104';
  s2.add(lathe([[R,1.70],[R,4.30]],M(0xffffff,0.55,0.08,{map:skin(2.6,{bands:[{y0:1.35,y1:1.41,c:'#7a5230'},{y0:2.38,y1:2.42,c:'#c9a227'}],rings:[0.55,1.15,2.55],
   panels:[[0.05,0.17,0.05,0.48],[0.3,0.42,0.05,0.48],[0.55,0.67,0.05,0.48],[0.8,0.92,0.05,0.48],[0.2,0.28,1.6,2.1]],text:[{u:0.36,y:1.85,t:'RIM-161D  SM-3 BLK IIA',s:18,b:1},{u:0.86,y:1.85,t:'U.S. NAVY',s:18,b:1},{u:0.62,y:1.05,t:'MK 104 DTRM',s:14}]})})));
  fin(s2,1.72,0.55,0.2,0.33,0.3,0.014,fins,PI/4);for(let i=0;i<4;i++){const a=PI/4+i*PI/2;const hng=new T.Mesh(new T.CylinderGeometry(0.018,0.018,0.06,10),dark);hng.rotation.z=PI/2;hng.position.set(Math.cos(a)*(R+0.02),1.98,-Math.sin(a)*(R+0.02));s2.add(hng);}
  const rw=new T.Mesh(new T.BoxGeometry(0.07,2.2,0.045),M(0xdedcd6,0.6,0.1));rw.position.set(0,3.05,R+0.018);s2.add(rw);
  nozzle(s2,0.11,0.17,0.24,1.70);band(s2,R+0.003,0.035,4.29,metal);
  body.add(s2);
  // --- Mk136 TSRM 4.30..5.25 ---
  const s3=new T.Group();s3.name='Mk136';
  s3.add(lathe([[R,4.30],[R,5.25]],M(0xffffff,0.5,0.1,{map:skin(0.95,{base:'#e6e5df',bands:[{y0:0.1,y1:0.14,c:'#7a5230'},{y0:0.86,y1:0.95,c:'#8d9094'}],rings:[0.02,0.93],panels:[[0.1,0.18,0.35,0.6],[0.6,0.68,0.35,0.6]],text:[{u:0.4,y:0.5,t:'MK 136 TSRM',s:13}]})})));
  const rw3=new T.Mesh(new T.BoxGeometry(0.07,0.85,0.045),M(0xdedcd6,0.6,0.1));rw3.position.set(0,4.75,R+0.018);s3.add(rw3);
  for(const a of[0.6,2.2,3.8,5.4]){const pa=new T.Mesh(new T.BoxGeometry(0.08,0.08,0.01),dark);pa.position.set(Math.sin(a)*(R+0.003),4.95,Math.cos(a)*(R+0.003));pa.rotation.y=a;s3.add(pa);}
  nozzle(s3,0.1,0.2,0.3,4.30);
  body.add(s3);
  // --- kinetic warhead (inside the nosecone) ---
  const kw=new T.Group();kw.name='KW';
  kw.add(lathe([[0.17,5.27],[0.2,5.3],[0.2,5.72],[0.16,5.84],[0.12,5.9]],M(0x34373a,0.45,0.6)));
  const win=new T.Mesh(new T.SphereGeometry(0.115,24,12,0,2*PI,0,PI/2),M(0x1a2733,0.05,0.2,{transparent:true,opacity:0.9}));win.position.y=5.9;kw.add(win);
  band(kw,0.205,0.08,5.45,M(0xb08d3a,0.35,0.9));// gold MLI wrap
  for(let i=0;i<4;i++){const a=i*PI/2;const d=new T.Mesh(new T.CylinderGeometry(0.025,0.04,0.07,12),metal);d.rotation.z=PI/2;d.position.set(Math.cos(a)*0.22,5.55,Math.sin(a)*0.22);d.lookAt(Math.cos(a)*2,5.55,Math.sin(a)*2);d.rotateX(PI/2);kw.add(d);}
  for(let i=0;i<6;i++){const a=i*PI/3;const d=new T.Mesh(new T.CylinderGeometry(0.012,0.018,0.04,8),metal);d.position.set(Math.cos(a)*0.17,5.3,Math.sin(a)*0.17);kw.add(d);}
  body.add(kw);
  // --- clamshell nosecone 5.25..6.55 (two halves) ---
  const nskin=M(0xffffff,0.45,0.1,{map:skin(1.3,{base:'#efeee9',bands:[{y0:0,y1:0.06,c:'#8d9094'}],rings:[0.06],text:[]}),side:T.DoubleSide});
  const op=ogive(R,1.3,5.25);const halves=[];for(let k=0;k<2;k++){const h=lathe(op,nskin,0,24,k*PI,PI);const hg=new T.Group();hg.add(h);body.add(hg);halves.push(hg);}
  const tip=new T.Mesh(new T.SphereGeometry(0.014,10,8),metal);tip.position.y=6.548;halves[0].add(tip);
  root.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  root.userData={len:LEN,diam:0.533,s1,s2,s3,kw,halves,body};return root;}
 // ---------- flight model ----------
 const ST=[{n:'MK 72 BOOSTER',burn:6,acc:62,tail:0,turn:0.4},{n:'MK 104 DUAL-THRUST',burn:22,acc:[[10,58],[22,26]],tail:1.70,turn:0.35},{n:'MK 136 PULSE 1',burn:8,acc:190,tail:4.30,turn:0.28},{n:'MK 136 PULSE 2',burn:6,acc:190,tail:4.30,turn:0.28,pulse:true}];
 const COAST=1.8,TAPER=1.4,GAP2=3;
 const list=[];let tgts=[];
 function pickTarget(o){let best=null,bd=1e12;for(const p of projs){if(p.done||p===o)continue;if(p.type==='ballistic'&&p.owner!==player){const d=p.pos.distanceTo(o.pos);if(d<bd){bd=d;best=p;}}}
  for(const t of tgts)if(!t.done){const d=t.pos.distanceTo(o.pos);if(d<bd){bd=d;best=t;}}return best;}
 function spawnTarget(from,dirH){// exo ballistic RV: ~90 km downrange, 120 km alt, inbound ~2.2 km/s
  const m=new T.Group();const rv=window.MSL_MODELS?MSL_MODELS.mk12a():new T.Mesh(new T.ConeGeometry(0.3,1.8,16),M(0x333333));if(window.MSL_MODELS){rv.rotation.x=PI/2;}m.add(rv);
  const bus=new T.Mesh(new T.CylinderGeometry(0.7,0.7,1.6,24),M(0x7d7f80,0.4,0.7));bus.position.y=-1.8;m.add(bus);
  const glow=new T.Sprite(new T.SpriteMaterial({color:0xff5040,transparent:true,opacity:0.0,depthWrite:false,blending:T.AdditiveBlending,fog:false}));glow.scale.setScalar(40);m.add(glow);
  const p=from.clone().addScaledVector(dirH,90000);p.y=120000;const v=dirH.clone().multiplyScalar(-1600);v.y=-600;
  const t={type:'tgtrv',pos:p,vel:v,mesh:m,done:false,glow,name:'TARGET RV'};m.position.copy(p);scene.add(m);tgts.push(t);return t;}
 function updTgt(t,dt){t.vel.y-=G*dt;t.pos.addScaledVector(t.vel,dt);t.mesh.position.copy(t.pos);t.mesh.quaternion.setFromUnitVectors(UP,_a.copy(t.vel).normalize());
  const cd=camera.position.distanceTo(t.pos);t.glow.material.opacity=cd>3000?0.6:0;t.glow.scale.setScalar(Math.max(40,cd*0.012));if(t.pos.y<0){t.done=true;scene.remove(t.mesh);}}
 function kill(t,p){t.done=true;if(t.mesh)scene.remove(t.mesh);if(projs.includes(t)){t.life=0;}
  for(let k=0;k<60;k++)fire.spawn(p,rnd(140),rnd(140),rnd(140),0.6+Math.random()*0.8,8,40,1,0.9,0.7,1);for(let k=0;k<40;k++)smoke.spawn(p,rnd(90),rnd(90),rnd(90),4,10,40,0.85,0.85,0.88,0.35,0,0);
  if(typeof sfx==='function')try{sfx('boom');}catch(e){}}
 const plume=(o,tailY,k)=>{const d=o.dir;const tl=_a.copy(o.pos).addScaledVector(d,-(LEN-tailY));const h=o.pos.y;const vac=Math.min(1,Math.max(0,(h-20000)/40000));
  if(Math.random()>k)return;for(let i=0;i<3;i++)fire.spawn(_b.copy(tl).addScaledVector(d,-0.3-i*0.9),rnd(1.2)-d.x*30,rnd(1.2)-d.y*30,rnd(1.2)-d.z*30,0.22,0.9+vac*2,2.4+vac*7,1,0.82,0.5,1,0,0,1,0.3,0.1);
  if(Math.random()<(h<25000?0.9:0.25))smoke.spawn(_b.copy(tl).addScaledVector(d,-3),rnd(1.5),rnd(1.5),rnd(1.5),h<25000?14:4,1.6+h/6000,5+h/2500,0.94,0.94,0.96,h<25000?0.6:0.2,0.05,0);};
 function shed(o,grp,dv,spin){const U=o.mesh.userData;o.mesh.updateMatrixWorld(true);const wp=new T.Vector3(),wq=new T.Quaternion(),ws=new T.Vector3();grp.matrixWorld.decompose(wp,wq,ws);grp.parent.remove(grp);
  const g=new T.Group();g.add(grp);grp.position.set(0,0,0);grp.quaternion.identity();g.position.copy(wp);g.quaternion.copy(wq);scene.add(g);
  const S=window.__gicbmstage;const d={m:g,p:wp.clone(),v:o.vel.clone().add(dv),w:new T.Vector3(rnd(spin),rnd(spin),rnd(spin)),t:0};if(S)S.debris.push(d);else{scene.add(g);}return d;}
 const sepRing=(p,d)=>{for(let k=0;k<14;k++){const a=k/14*6.283;_c.set(Math.cos(a),0,Math.sin(a));_c.addScaledVector(d,-_c.dot(d)).normalize();smoke.spawn(p,_c.x*5,_c.y*5,_c.z*5,1.4,0.5,2.2,0.95,0.95,0.97,0.6,0.05,0);}};
 function acc(s,t){if(Array.isArray(s.acc)){for(const [tt,a] of s.acc)if(t<tt)return a;return 0;}return s.acc;}
 function update(o,dt){if(o.done)return;o.t+=dt;const U=o.mesh.userData;const d=o.dir;
  if(!o.tg||o.tg.done)o.tg=pickTarget(o);
  // aim point: predicted intercept (+ gravity compensation while powered)
  let aim=null;if(o.tg){const r=_b.copy(o.tg.pos).sub(o.pos);const dist=r.length();const vc=Math.max(800,o.vel.length()+(-o.tg.vel.dot(r)/Math.max(dist,1)));const tgo=Math.min(200,dist/vc);
   aim=_c.copy(o.tg.pos).addScaledVector(o.tg.vel,tgo);o.tgo=tgo;}
  if(o.ph==='kw'){// PN + DACS
   if(o.tg&&!o.tg.done){const R=_a.copy(o.tg.pos).sub(o.pos);const rv=_b.copy(o.tg.vel).sub(o.vel);const Rm=R.length();const Vc=-R.dot(rv)/Math.max(Rm,1);
    _c.copy(R).cross(rv).multiplyScalar(1/(Rm*Rm+1e-6)); // ω
    _d.copy(_c).cross(_e.copy(R).normalize()) .multiplyScalar(5.0*Math.max(Vc,200)); // a = N Vc (ω × r̂)
    const amax=(o.tgo!=null&&o.tgo<5)?600:(o.tgo!=null&&o.tgo<12)?320:160;const L=_d.length();if(L>1e-3){const k=Math.min(1,amax/L);o.vel.addScaledVector(_d,k*dt);
     if(Math.random()<0.5)fire.spawn(_b.copy(o.pos).addScaledVector(d,-0.7),_d.x*0.02,_d.y*0.02,_d.z*0.02,0.07,0.2,0.5,0.85,0.9,1,0.85);}
    o.tgo=Rm/Math.max(Vc,50);}
   o.vel.y-=G*dt;d.copy(o.vel).normalize();}
  else{const s=ST[o.stg];
   if(o.coast>0){o.coast-=dt;o.vel.y-=G*dt;if(o.coast<=0){o.ph='burn';o.bt=0;const tl=_a.copy(o.pos).addScaledVector(d,-(LEN-s.tail));for(let k=0;k<18;k++)fire.spawn(tl,rnd(5)-d.x*25,rnd(5)-d.y*25,rnd(5)-d.z*25,0.3,1.2,4,1,0.88,0.6,1);msg(s.n+' IGNITION',1.1);o.ign=o.t;}}
   else{o.bt+=dt;const left=s.burn-o.bt;
    if(o.t>2.2&&aim){const want=_a.copy(aim).sub(o.pos);const Rm=want.length();want.normalize();if(o.pos.y<2000&&o.t<6)want.lerp(UP,0.55).normalize();
     // lead the velocity toward the desired direction (not just the nose)
     const sp=Math.max(o.vel.length(),1);_e.copy(want).multiplyScalar(sp).sub(o.vel);const L=_e.length();const amax=s.turn*sp; // rad/s * sp ≈ m/s²
     if(L>1e-3)o.vel.addScaledVector(_e,Math.min(1,amax*dt/L));d.copy(o.vel).normalize();}
    const a=acc(s,o.bt);o.vel.addScaledVector(d,a*dt);o.vel.y-=G*dt;const rho=1.225*Math.exp(-o.pos.y/8500);o.vel.multiplyScalar(1-Math.min(0.1,rho*o.vel.length()*2e-6*dt));
    plume(o,s.tail,left<TAPER?Math.max(0.08,left/TAPER):1);
    if(o.stg===2&&!o.nc&&o.bt>1.5){o.nc=true;for(let k=0;k<2;k++){const sgn=k?1:-1;const side=_b.set(0,0,0);const hq=o.mesh.quaternion;side.set(sgn,0,0).applyQuaternion(hq);shed(o,U.halves[k],side.multiplyScalar(9).addScaledVector(d,-3),2.2);}msg('NOSECONE JETTISON - KW SEEKER UNCAGED',1.4);}
    if(left<=0){// burnout -> stage
     if(o.stg===0){shed(o,U.s1,_a.copy(d).multiplyScalar(-14),0.9);sepRing(_b.copy(o.pos).addScaledVector(d,-(LEN-1.70)),d);msg('MK 72 BURNOUT - SEPARATION',1.2);o.stg=1;o.coast=COAST;o.sep=o.t;}
     else if(o.stg===1){shed(o,U.s2,_a.copy(d).multiplyScalar(-12),0.9);sepRing(_b.copy(o.pos).addScaledVector(d,-(LEN-4.30)),d);msg('MK 104 BURNOUT - SEPARATION',1.2);o.stg=2;o.coast=COAST;o.sep=o.t;}
     else if(o.stg===2){o.stg=3;o.coast=GAP2;o.sep=o.t;msg('MK 136 PULSE 1 COMPLETE - COAST',1.2);}
     else{if(!o.nc){o.nc=true;for(let k=0;k<2;k++)shed(o,U.halves[k],_b.set(k?9:-9,0,0).applyQuaternion(o.mesh.quaternion),2.2);}
      o.ph='kw';o.kwT=o.t;shed(o,U.s3,_a.copy(d).multiplyScalar(-8),0.7);sepRing(_b.copy(o.pos).addScaledVector(d,-(LEN-5.27)),d);msg('KINETIC WARHEAD SEPARATION - HOMING',1.6);o.sep=o.t;}
     o.ph=o.ph==='kw'?'kw':'coast';}}}
  const p0=_b.copy(o.pos);o.pos.addScaledVector(o.vel,dt);o.mesh.position.copy(o.pos);o.mesh.quaternion.setFromUnitVectors(UP,d);
  o.mach=o.vel.length()/(o.pos.y<11000?340:295);
  // hit-to-kill: closest approach on this step
  if(o.tg&&!o.tg.done){const rel=_a.copy(o.vel).sub(o.tg.vel);const r0=_c.copy(p0).sub(o.tg.pos);const L2=rel.lengthSq()*dt*dt;const tt=L2>0?Math.max(0,Math.min(1,-r0.dot(rel)*dt/L2)):0;const miss=r0.addScaledVector(rel,tt*dt).length();
   if(miss<(o.ph==='kw'?80:10)){const hp=o.tg.pos.clone();kill(o.tg,hp);o.done=true;o.life=0;msg('INTERCEPT - TARGET DESTROYED\n'+(hp.y/1000).toFixed(0)+' km ALT',3);o.hit=hp;window.__gmsl2sm3hit=(window.__gmsl2sm3hit||0)+1;return;}}
  if(o.pos.y<-5&&o.t>5){o.done=true;o.life=0;}if(o.ph==='kw'&&o.t-o.kwT>160){o.done=true;o.life=0;msg('KW MISS - SELF DESTRUCT',2);}}
 // run inside updProjs so it gets the same sub-steps as other projectiles
 const _up=updProjs;updProjs=function(dt){for(const o of list)update(o,dt);for(const t of tgts)if(!t.done)updTgt(t,dt);
  for(let i=list.length-1;i>=0;i--)if(list[i].done){if(camFollow===list[i]){camFollow=null;GUIDE.nose=false;}list.splice(i,1);}tgts=tgts.filter(t=>!t.done);return _up(dt);};
 function launch(v,cfg){cfg=cfg||{};const q=v.mesh.quaternion,P=v.mesh.position;const f=fwdOf(q,V3()),u=upOf(q,V3()),r=rightOf(q,V3());
  const p=P.clone().addScaledVector(f,cfg.f!=null?cfg.f:40).addScaledVector(u,cfg.u!=null?cfg.u:7).addScaledVector(r,cfg.r||0);
  const mesh=build();const o={type:'sm3',name:'SM-3 BLK IIA',pos:p.clone().addScaledVector(UP,LEN),vel:V3(0,28,0).add(v.vel||V3()),dir:V3(0,1,0),life:1e9,mesh,owner:v,t:0,stg:0,ph:'burn',bt:0,coast:0,mach:0};
  mesh.position.copy(o.pos);
  for(let k=0;k<30;k++)smoke.spawn(p,rnd(10),Math.random()*14,rnd(10),3.5,4,16,0.95,0.95,0.96,0.75,0.1,0);for(let k=0;k<16;k++)fire.spawn(p,rnd(3),Math.random()*6,rnd(3),0.25,2,5,1,0.85,0.5,1);
  addProj(o);list.push(o);o.tg=pickTarget(o);if(!o.tg){const h=V3(f.x,0,f.z).normalize();o.tg=spawnTarget(P,h);}
  camFollow=o;GUIDE.nose=cfg.nose!=null?cfg.nose:true;msg('SM-3 BLK IIA AWAY - '+(o.tg.type==='tgtrv'?'EXO TARGET':'BALLISTIC TRACK')+' - MK 72 BOOST',1.6);if(typeof sfx==='function')try{sfx('missile');}catch(e){}return o;}
 // ---------- weapon hookup (reattachable) ----------
 const HOOK={};AMMO['SM-3']=4;
 function attach(key,cfg){const d=DEFS[key];if(!d)return false;HOOK[key]=Object.assign({f:40,u:7,r:0},cfg||{});if(!d.weapons.includes('SM-3'))d.weapons.splice(Math.min(2,d.weapons.length),0,'SM-3');
  if(player&&player.kind===key&&!player.weapons.includes('SM-3')){player.weapons.splice(Math.min(2,player.weapons.length),0,'SM-3');player.ammo['SM-3']=AMMO['SM-3'];}return true;}
 const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons[v.wi];if(w!=='SM-3')return _fw(v);if(!(v.ammo[w]>0)||simT<(v.cool||0))return false;v.cool=simT+3;v.ammo[w]--;launch(v,HOOK[v.kind]);return true;};
 attach('destroyer',{f:40,u:7,r:0});// current g2 Arleigh Burke; forward Mk41 VLS
 const ts=o=>{if(o.coast>0)return 1;if(o.t<8)return 1;if(o.ign!=null&&o.t-o.ign<2)return 1;if(o.ph==='burn'){const s=ST[o.stg];if(s&&s.burn-o.bt<2)return 1;if(o.stg===2&&!o.nc&&o.bt>0.5)return 1;}
  if(o.ph==='kw'&&(o.t-o.kwT<2||(o.tgo!=null&&o.tgo<8)))return 1;return 4;};
 window.GMSL2_SM3={attach,launch,build,ts,list,get targets(){return tgts},spawnTarget,ST};})();
 window.__gmsl2fire=v=>fireWeapon(v);
 window.__gmsl2set=(k,v)=>{settings[k]=v;};window.__gmsl2inp=()=>inp;
