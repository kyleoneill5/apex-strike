//GDETAIL_FIGHTERS-BEGIN  F/A-18E Super Hornet, high detail. Real dims: L 18.31 m, span 13.62 m, H 4.88 m. Nose -Z, origin ~CG.
const FIGHTERS=(()=>{const T=THREE,PI=Math.PI;
function cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
function tx(c,srgb=true){const t=new T.CanvasTexture(c);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
let SK=null;
function skins(){if(SK)return SK;const S=2048;
 // FS36375/36320 two-tone ghost gray with panel lines, fasteners, access doors, exhaust staining, RAM-tape seams; mapped u=around, v=along (0 nose..1 tail)
 const paint=(x,w,h,base,top)=>{x.fillStyle=base;x.fillRect(0,0,w,h);if(top){x.fillStyle=top;x.fillRect(0,0,w*0.5,h);}
  for(let i=0;i<9000;i++){x.fillStyle=`rgba(${Math.random()<0.5?'0,0,0':'255,255,255'},${Math.random()*0.03})`;const s=2+Math.random()*30;x.fillRect(Math.random()*w,Math.random()*h,s,s*0.6);}
  for(let i=0;i<60;i++){x.fillStyle=`rgba(${top?'150,160,170':'90,95,100'},${0.05+Math.random()*0.06})`;x.fillRect(Math.random()*w,Math.random()*h,40+Math.random()*120,30+Math.random()*90);}}
 const panels=(x,w,h,nu,nv,seed)=>{x.strokeStyle='rgba(30,34,38,0.55)';x.lineWidth=2;for(let i=0;i<=nv;i++){const y=(i/nv)*h+(i%2?6:0);x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();}
  for(let i=0;i<nv;i++)for(let j=0;j<nu;j++){if((i*7+j*3+seed)%3)continue;const X=j/nu*w+((i%2)*w/nu/2),Y=i/nv*h;x.beginPath();x.moveTo(X,Y);x.lineTo(X,Y+h/nv);x.stroke();}
  for(let k=0;k<70;k++){const X=Math.random()*w,Y=Math.random()*h,a=20+Math.random()*60,b=14+Math.random()*40;x.strokeRect(X,Y,a,b);x.fillStyle='rgba(20,22,24,0.5)';for(const [px,py] of [[X+4,Y+4],[X+a-4,Y+4],[X+4,Y+b-4],[X+a-4,Y+b-4]]){x.beginPath();x.arc(px,py,1.6,0,7);x.fill();}}
  x.fillStyle='rgba(25,28,30,0.45)';for(let i=0;i<=nv;i++)for(let u=0;u<w;u+=14){x.beginPath();x.arc(u,(i/nv)*h+(i%2?6:0)+5,1.1,0,7);x.fill();}};
 const fus=cv(S,S,(x,w,h)=>{paint(x,w,h,'#8f969c','#7b8389');panels(x,w,h,16,22,1);
  const g=x.createLinearGradient(0,h*0.86,0,h);g.addColorStop(0,'rgba(40,36,30,0)');g.addColorStop(1,'rgba(40,36,30,0.55)');x.fillStyle=g;x.fillRect(0,0,w,h);// exhaust soot aft
  x.fillStyle='#3b3f44';x.fillRect(0,0,w,h*0.055);// dark radome
  // anti-glare panel
  x.fillStyle='rgba(50,56,62,0.85)';x.fillRect(w*0.2,h*0.05,w*0.1,h*0.1);
  // RAM/edge tape seams (sawtooth)
  x.strokeStyle='rgba(60,66,72,0.6)';x.lineWidth=4;x.beginPath();for(let u=0;u<w;u+=40){x.lineTo(u,h*0.06+(u/40%2)*14);}x.stroke();});
 const wing=cv(S,S,(x,w,h)=>{paint(x,w,h,'#868d93');panels(x,w,h,10,12,2);x.strokeStyle='rgba(30,34,38,0.6)';x.lineWidth=3;for(let i=0;i<16;i++){x.beginPath();x.moveTo(i*w/16,0);x.lineTo(i*w/16+30,h);x.stroke();}
  x.fillStyle='rgba(40,40,40,0.5)';x.font='bold 60px Arial';for(let i=0;i<6;i++)x.fillText('NO STEP',Math.random()*w*0.8,Math.random()*h);
  x.fillStyle='rgba(200,40,40,0.55)';for(let i=0;i<4;i++)x.fillRect(Math.random()*w,Math.random()*h,80,8);});
 const mk=c=>{const t=tx(c);t.repeat.set(1,1);return t;};const rough=cv(512,512,(x,w,h)=>{x.fillStyle='#9a9a9a';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){x.fillStyle=`rgba(${Math.random()<0.5?0:255},${Math.random()<0.5?0:255},${Math.random()<0.5?0:255},0.08)`;x.fillRect(Math.random()*w,Math.random()*h,3,3);}});
 const wt=mk(wing);wt.repeat.set(0.12,0.12);const rt=tx(rough,false);
 SK={fus:new T.MeshStandardMaterial({map:mk(fus),roughnessMap:rt,roughness:0.72,metalness:0.18}),
  wing:new T.MeshStandardMaterial({map:wt,roughnessMap:rt,roughness:0.72,metalness:0.18,side:T.DoubleSide}),
  dark:new T.MeshStandardMaterial({color:0x2a2d31,roughness:0.6,metalness:0.4}),inlet:new T.MeshStandardMaterial({color:0x0c0d0e,roughness:0.9,metalness:0.1,side:T.DoubleSide}),
  ti:new T.MeshStandardMaterial({color:0x7a6f62,roughness:0.35,metalness:0.95}),petal:new T.MeshStandardMaterial({color:0x4b4844,roughness:0.42,metalness:0.9,side:T.DoubleSide}),
  glass:new T.MeshPhysicalMaterial({color:0xb79a52,metalness:0.2,roughness:0.04,transmission:0,transparent:true,opacity:0.55,clearcoat:1,iridescence:0.6,iridescenceIOR:1.6}),
  chrome:new T.MeshStandardMaterial({color:0xd0d3d6,roughness:0.12,metalness:1}),white:new T.MeshStandardMaterial({color:0xd8dadb,roughness:0.6,metalness:0.2}),
  rub:new T.MeshStandardMaterial({color:0x151515,roughness:0.95}),red:new T.MeshStandardMaterial({color:0xb01818,roughness:0.5}),
  lamp:new T.MeshStandardMaterial({color:0x22ff44,emissive:0x22ff44,emissiveIntensity:2}),lampR:new T.MeshStandardMaterial({color:0xff2222,emissive:0xff2222,emissiveIntensity:2}),
  seat:new T.MeshStandardMaterial({color:0x2f3328,roughness:0.85}),panel:new T.MeshStandardMaterial({color:0x1a1c1e,roughness:0.6,emissive:0x0b3d1a,emissiveIntensity:0.6})};
 return SK;}
// lofted superellipse fuselage: sections [z, halfW, halfH, yc, exp]
function loft(sec,mat,seg=48){const n=sec.length,pos=[],uv=[],idx=[];
 for(let i=0;i<n;i++){const [z,a,b,yc,e=2.4]=sec[i];for(let j=0;j<=seg;j++){const t=j/seg*2*PI,c=Math.cos(t),s=Math.sin(t);const px=a*Math.sign(c)*Math.pow(Math.abs(c),2/e),py=b*Math.sign(s)*Math.pow(Math.abs(s),2/e);pos.push(px,yc+py,z);uv.push(j/seg,1-(z-sec[0][0])/(sec[n-1][0]-sec[0][0]));}}
 for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+seg+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return new T.Mesh(g,mat);}
// airfoil-thickness planform surface. pts [[x,z]...] (outline), t = max thickness; top-down UVs in metres
function surf(pts,t,mat,uvS=1){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:t*0.5,bevelEnabled:true,bevelThickness:t*0.25,bevelSize:Math.min(0.05,t*0.6),bevelSegments:3,curveSegments:4});g.translate(0,0,-t*0.25);g.rotateX(PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*uvS,p.getZ(i)*uvS);g.computeVertexNormals();const m=new T.Mesh(g,mat);return m;}
const mir=pts=>pts.map(([x,z])=>[-x,z]).reverse();
function P(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;}
function dec(g,draw,w,h,pos,rot,W=512,H=256){const c=cv(W,H,draw);const m=new T.MeshStandardMaterial({map:tx(c),transparent:true,roughness:0.7,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});const d=P(g,new T.PlaneGeometry(w,h),m,...pos,...rot);return d;}
const star=(x,cx,cy,r)=>{x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,rr=i%2?r*0.38:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.fill();};
const insignia=(x,w,h)=>{x.fillStyle='rgba(70,76,82,0.9)';x.beginPath();x.arc(w/2,h/2,h*0.3,0,7);x.fill();x.fillRect(w/2-h*0.62,h/2-h*0.1,h*1.24,h*0.2);x.fillStyle='rgba(150,156,162,0.95)';star(x,w/2,h/2,h*0.28);};
function aim(name,g,x,y,z){if(!window.MSL_MODELS)return;const m=MSL_MODELS[name]();m.position.set(x,y,z);m.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.add(m);return m;}

function fa18(){const K=skins(),g=new T.Group();g.name='F/A-18E';
 // ---- fuselage (z from nose -9.6 to tail 8.0) ----
 const fus=loft([[-9.6,0.02,0.02,0.05,2],[-9.3,0.2,0.2,0.05,2],[-8.6,0.4,0.4,0.05,2],[-7.6,0.55,0.55,0.08,2.1],[-6.6,0.64,0.68,0.12,2.3],[-5.6,0.7,0.78,0.15,2.4],[-4.6,0.78,0.82,0.12,2.6],[-3.4,0.92,0.84,0.05,2.8],[-2.2,1.25,0.85,-0.05,3.2],[-1.0,1.42,0.88,-0.05,3.4],[1.0,1.48,0.9,-0.05,3.4],[3.0,1.48,0.86,-0.05,3.4],[5.0,1.42,0.78,-0.08,3.2],[6.6,1.32,0.68,-0.1,3.0],[7.6,1.22,0.6,-0.1,2.8],[8.0,1.18,0.56,-0.1,2.8]],K.fus,64);
 fus.castShadow=fus.receiveShadow=true;g.add(fus);
 // dorsal spine & cockpit sill
 P(g,new T.CapsuleGeometry(0.42,6,6,16).rotateX(PI/2),K.fus,0,0.72,-0.6).scale.set(1,0.5,1);
 // ---- LEX (leading-edge extensions) ----
 for(const s of[1,-1]){const lex=[[0.62,-6.6],[1.0,-4.2],[1.65,-2.2],[2.15,-0.6],[1.3,-0.4],[0.62,-1.5]].map(([x,z])=>[x*s,z]);const m=surf(s>0?lex:lex.reverse(),0.08,K.wing,0.12);m.position.y=0.38;g.add(m);
  // LEX vent fence (Super Hornet LEX spoiler)
  P(g,new T.BoxGeometry(0.9,0.04,0.25),K.dark,s*1.25,0.45,-2.6,0,s*0.3,0);}
 // ---- wings: root at x 1.35, LE sweep ~20deg, span 6.81; with separate TE flaps/ailerons (rigged as 'flap') ----
 const W=[[1.35,-2.0],[6.81,-0.05],[6.81,1.45],[4.6,1.55],[1.35,2.2]];
 for(const s of[1,-1]){const pts=W.map(([x,z])=>[x*s,z]);const m=surf(s>0?pts:pts.reverse(),0.2,K.wing,0.12);m.position.y=-0.02;m.castShadow=true;g.add(m);
  // leading-edge flap line + dogtooth snag
  P(g,new T.BoxGeometry(5.4,0.015,0.03),K.dark,s*4.1,0.09,-1.6+((4.1-1.35)/5.46)*1.95*0.5,0,s*-0.34,0);
  P(g,new T.BoxGeometry(0.1,0.22,0.35),K.wing,s*4.3,0.0,-0.55);
  // wingfold hinge line
  P(g,new T.BoxGeometry(0.03,0.025,1.8),K.dark,s*4.5,0.1,0.6);
  // TE flap (inboard, double-slotted) + aileron (outboard) as separate thin meshes for rigJet
  const flap=new T.Mesh(new T.BoxGeometry(2.9,0.08,0.8),K.wing);flap.position.set(s*2.95,-0.02,2.35);flap.rotation.y=s*0.05;g.add(flap);
  const ail=new T.Mesh(new T.BoxGeometry(2.1,0.06,0.62),K.wing);ail.position.set(s*5.7,-0.02,1.75);g.add(ail);
  // wingtip launch rail + AIM-9X
  P(g,new T.BoxGeometry(0.1,0.12,2.6),K.wing,s*6.86,0,0.3);aim('aim9x',g,s*6.86,-0.02,0.4);
  // pylons: inboard (tank/AMRAAM), mid, outboard
  for(const [x,mz] of [[2.6,'aim120'],[4.1,'aim120'],[5.5,'aim9x']]){P(g,new T.BoxGeometry(0.14,0.42,2.2),K.wing,s*x,-0.3,0.2).rotation.y=s*0.07;// canted pylons (F/A-18E has toe-out)
   aim(mz,g,s*x,-0.65,0.1).rotation.y=s*0.07;}
  // fuselage-shoulder AMRAAM stations
  aim('aim120',g,s*1.15,-0.95,1.6);
  // vortex generators / RWR fairing at tip
  P(g,new T.CapsuleGeometry(0.06,0.4,4,8).rotateX(PI/2),K.dark,s*6.86,0.08,-1.2);}
 // ---- intakes (caret/'Ds' style, Super Hornet rectangular canted) ----
 for(const s of[1,-1]){const it=new T.Group();it.position.set(s*1.22,-0.42,-2.2);g.add(it);
  P(it,new T.BoxGeometry(0.95,0.82,2.4),K.fus,0,0,1.1);P(it,new T.PlaneGeometry(0.85,0.72),K.inlet,0,0,-0.09,0,PI,0);
  P(it,new T.BoxGeometry(0.04,0.84,0.3),K.fus,-s*0.47,0,-0.05,0,s*0.5,0);// splitter
  P(it,new T.BoxGeometry(0.96,0.04,0.3),K.fus,0,0.42,-0.04);
  // engine face / radar blocker vanes
  for(let k=0;k<6;k++)P(it,new T.BoxGeometry(0.8,0.02,0.08),K.dark,0,-0.3+k*0.12,0.25,0.5,0,0);}
 // engine bays underside + fuel dump / tail hook
 P(g,new T.BoxGeometry(2.4,0.3,6.0),K.fus,0,-0.68,4.6);
 const hook=P(g,new T.BoxGeometry(0.08,0.08,2.4),K.white,0,-0.88,6.6);for(let i=0;i<6;i++)P(g,new T.BoxGeometry(0.085,0.085,0.15),K.dark,0,-0.88,5.6+i*0.4);
 // ---- vertical tails (canted 20 deg, 3.1 m tall) with rudders ----
 for(const s of[1,-1]){const vt=new T.Group();vt.position.set(s*1.2,0.6,0);vt.rotation.z=-s*0.35;g.add(vt);
  const sh=new T.Shape();[[3.6,0],[6.0,3.1],[7.3,3.1],[8.0,0]].forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
  const gg=new T.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:true,bevelThickness:0.03,bevelSize:0.03,bevelSegments:2});gg.rotateY(PI/2);gg.translate(0.03,0,0);const uvA=gg.attributes.uv,pA=gg.attributes.position;for(let i=0;i<pA.count;i++)uvA.setXY(i,pA.getZ(i)*0.12,pA.getY(i)*0.12);
  const fin=new T.Mesh(gg,K.wing);fin.castShadow=true;vt.add(fin);
  P(vt,new T.BoxGeometry(0.1,1.6,0.6),K.wing,0,1.3,7.6);// rudder
  P(vt,new T.CapsuleGeometry(0.07,0.5,4,8).rotateX(PI/2),K.dark,0,3.12,7.0);// tail-cap antenna/RWR
  P(vt,new T.SphereGeometry(0.05,8,6),K.white,0,3.12,7.7);// position light
  // tail art: VFA-103 Jolly Rogers style (original), 'AG' tail code
  const art=(x,w,h)=>{x.fillStyle='rgba(28,30,34,0.92)';x.font='bold 120px Arial';x.textAlign='center';x.fillText('AG',w*0.5,h*0.55);x.font='bold 40px Arial';x.fillText('NAVY',w*0.5,h*0.85);x.beginPath();x.arc(w*0.82,h*0.25,36,0,7);x.fill();x.fillStyle='rgba(200,200,200,0.9)';x.fillRect(w*0.80,h*0.20,10,10);x.fillRect(w*0.83,h*0.20,10,10);};
  dec(vt,art,1.9,0.95,[s*0.08,1.7,5.9],[0,s*PI/2,0]);}
 // ---- stabilators (all-moving; separate for rigJet 'stab') ----
 for(const s of[1,-1]){const st=surf([[1.3*s,5.4],[4.3*s,6.9],[4.3*s,8.0],[1.3*s,8.6]].map(p=>p),0.1,K.wing,0.12);if(s<0){const q=[[ -1.3,5.4],[-1.3,8.6],[-4.3,8.0],[-4.3,6.9]];g.add(surf(q,0.1,K.wing,0.12)).position.y=-0.1;}else{st.position.y=-0.1;g.add(st);}}
 // ---- nozzles: F414 convergent-divergent with 12 petals & sealing flaps ----
 for(const s of[1,-1]){const n=new T.Group();n.position.set(s*0.62,-0.1,7.95);g.add(n);
  P(n,new T.CylinderGeometry(0.5,0.54,0.5,32,1,true).rotateX(PI/2),K.ti,0,0,0);
  for(let k=0;k<12;k++){const a=k/12*2*PI;const pt=P(n,new T.BoxGeometry(0.24,0.02,0.75),K.petal,Math.cos(a)*0.5,Math.sin(a)*0.5,0.55);pt.rotation.z=a+PI/2;pt.rotation.x=0;pt.lookAt(Math.cos(a)*0.4,Math.sin(a)*0.4,1.5);
   const act=P(n,new T.CylinderGeometry(0.025,0.025,0.5,6).rotateX(PI/2),K.chrome,Math.cos(a+0.26)*0.56,Math.sin(a+0.26)*0.56,0.35);}
  P(n,new T.CircleGeometry(0.42,24),K.inlet,0,0,0.05,0,PI,0);// turbine face (dark)
  const ring=P(n,new T.TorusGeometry(0.44,0.05,8,24),K.dark,0,0,-0.2);
  // flame holder / afterburner liner glow
  P(n,new T.RingGeometry(0.15,0.4,24),new T.MeshStandardMaterial({color:0x221a14,emissive:0x351005,emissiveIntensity:0.5,side:T.DoubleSide}),0,0,0.1);}
 // ---- canopy: one-piece bubble with frame, ACES II seats, HUD ----
 const can=new T.Group();can.position.set(0,0.78,-5.3);g.add(can);
 const cg=new T.SphereGeometry(1,40,20,0,2*PI,0,PI/2);const cm=new T.Mesh(cg,K.glass);cm.scale.set(0.56,0.58,1.9);can.add(cm);
 P(can,new T.TorusGeometry(1,0.025,6,40,PI).rotateY(PI/2),K.dark,0,0,-0.5).scale.set(0.56,0.58,1);
 P(can,new T.TorusGeometry(1,0.02,6,40,PI).rotateY(PI/2),K.dark,0,0,0.6).scale.set(0.56,0.56,1);
 P(can,new T.BoxGeometry(0.05,0.05,3.5),K.dark,0,0.58,0);// canopy bow center (frame)
 P(can,new T.BoxGeometry(0.4,0.6,0.35),K.seat,0,-0.05,0.3);P(can,new T.BoxGeometry(0.42,0.12,0.5),K.seat,0,-0.32,0.05);// seat
 P(can,new T.SphereGeometry(0.13,14,10),new T.MeshStandardMaterial({color:0xcfd2c8,roughness:0.5}),0,0.38,0.25);// pilot helmet
 P(can,new T.BoxGeometry(0.62,0.22,0.15),K.panel,0,-0.08,-0.62,-0.4,0,0);P(can,new T.PlaneGeometry(0.16,0.14),new T.MeshStandardMaterial({color:0x66ffaa,transparent:true,opacity:0.25,emissive:0x22ff66,emissiveIntensity:0.6}),0,0.14,-0.75,-0.4,0,0);
 // ---- radome joint, pitot probes, AoA vanes, IFF blades, IRST-less chin, gun port ----
 P(g,new T.TorusGeometry(0.47,0.012,6,32),K.dark,0,0.06,-8.45);
 for(const s of[1,-1]){P(g,new T.CylinderGeometry(0.012,0.02,0.6,6).rotateX(PI/2),K.chrome,s*0.42,0.12,-8.2);P(g,new T.BoxGeometry(0.02,0.08,0.1),K.dark,s*0.6,0.0,-6.9);}
 for(let i=0;i<3;i++)P(g,new T.BoxGeometry(0.02,0.18,0.24),K.dark,0,0.9-i*0.03,-3.5+i*2.4);// blade antennas
 P(g,new T.CircleGeometry(0.06,12),K.inlet,0,0.48,-8.0,-0.3,0,0);// M61A2 gun port
 for(let i=0;i<3;i++)P(g,new T.BoxGeometry(0.02,0.012,0.22),K.dark,-0.08+i*0.08,0.5,-7.7);
 // formation lights / position lights
 for(const s of[1,-1]){P(g,new T.BoxGeometry(0.04,0.02,0.6),new T.MeshStandardMaterial({color:0xccff99,emissive:0x66ff44,emissiveIntensity:0.6}),s*0.66,0.3,-6.0,0,0,-s*0.6);P(g,new T.SphereGeometry(0.05,8,6),s>0?K.lamp:K.lampR,s*6.9,0.05,-1.25);}
 // boarding ladder door, stencils, warning chevrons, modex
 dec(g,(x,w,h)=>{x.fillStyle='rgba(30,33,36,0.92)';x.font='bold 150px Arial';x.textAlign='center';x.fillText('NAVY',w/2,h*0.62);},2.2,0.55,[1.47,-0.05,1.0],[0,PI/2,0]);
 dec(g,(x,w,h)=>{x.fillStyle='rgba(30,33,36,0.92)';x.font='bold 150px Arial';x.textAlign='center';x.fillText('NAVY',w/2,h*0.62);},2.2,0.55,[-1.47,-0.05,1.0],[0,-PI/2,0]);
 for(const s of[1,-1]){dec(g,(x,w,h)=>{x.fillStyle='rgba(30,33,36,0.92)';x.font='bold 170px Arial';x.textAlign='center';x.fillText('200',w/2,h*0.68);},0.9,0.4,[s*0.66,0.15,-7.2],[0,s*PI/2-s*0.2,0]);
  dec(g,insignia,1.6,0.8,[s*1.49,0.0,3.4],[0,s*PI/2,0]);
  dec(g,(x,w,h)=>{x.fillStyle='#c01818';x.font='bold 46px Arial';x.textAlign='center';x.fillText('⚠ RESCUE',w/2,60);x.font='28px Arial';x.fillStyle='#222';x.fillText('EJECTION SEAT  •  CANOPY JETTISON',w/2,110);x.strokeStyle='#c01818';x.lineWidth=6;x.strokeRect(6,6,w-12,h-12);},0.7,0.34,[s*0.71,0.5,-4.6],[0,s*PI/2-s*0.25,0]);
  dec(g,(x,w,h)=>{x.fillStyle='#c01818';for(let i=0;i<6;i++){x.beginPath();x.moveTo(i*90,0);x.lineTo(i*90+45,h/2);x.lineTo(i*90,h);x.lineTo(i*90+25,h);x.lineTo(i*90+70,h/2);x.lineTo(i*90+25,0);x.fill();}},0.9,0.25,[s*1.0,-0.28,-2.0],[0,s*PI/2,0]);// intake danger chevrons
  dec(g,insignia,1.8,0.9,[s*4.2,0.11,0.2],[-PI/2,0,0]);}
 // ---- landing gear (stowed in flight, shown on deck): nose with catapult launch bar, twin wheels; main trunnion gear ----
 const gear=new T.Group();gear.name='gear';g.add(gear);
 P(gear,new T.CylinderGeometry(0.07,0.07,1.6,10),K.chrome,0,-1.4,-6.2);P(gear,new T.CylinderGeometry(0.11,0.11,0.8,12),K.white,0,-1.0,-6.2);
 for(const s of[1,-1])P(gear,new T.CylinderGeometry(0.28,0.28,0.18,20).rotateZ(PI/2),K.rub,s*0.16,-2.2,-6.2);P(gear,new T.BoxGeometry(0.06,0.06,0.9),K.white,0,-1.9,-6.7,0.4,0,0);
 for(const s of[1,-1]){P(gear,new T.CylinderGeometry(0.1,0.1,1.7,10),K.chrome,s*1.65,-1.3,0.9,0,0,s*0.1);P(gear,new T.BoxGeometry(0.12,0.12,1.3),K.white,s*1.5,-1.1,0.6,0.6,0,0);
  P(gear,new T.CylinderGeometry(0.42,0.42,0.3,24).rotateZ(PI/2),K.rub,s*1.78,-2.06,0.95);P(gear,new T.CylinderGeometry(0.25,0.25,0.32,16).rotateZ(PI/2),K.white,s*1.78,-2.06,0.95);
  P(gear,new T.BoxGeometry(0.05,0.9,1.4),K.white,s*1.2,-0.9,0.9);}// gear doors
 for(const s of[1,-1])P(gear,new T.BoxGeometry(0.05,0.6,1.2),K.white,s*0.35,-0.95,-6.2);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 g.userData.gear=gear;return g;}

return {fa18};})();
window.FIGHTERS=FIGHTERS;
{const _j=jet;jet=function(c,fa18,kind){if(!fa18||(kind&&kind!=='fa18'))return _j(c,fa18,kind);let g;try{g=FIGHTERS.fa18();}catch(e){console.warn('fa18 detail',e);return _j(c,fa18,kind);}
 const fl=new THREE.Group();for(const sx of[-0.62,0.62]){const f=new THREE.Mesh(new THREE.ConeGeometry(0.5,1,12).rotateX(Math.PI/2).translate(0,0,0.5),flameMat);f.position.set(sx,-0.1,8.7);fl.add(f);}g.add(fl);g.userData.flame=fl;
 try{rigJet(g,'fa18');}catch(e){}return g;};}
{const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{const v=player;if(v&&v.mesh&&v.mesh.userData.gear){const agl=v.mesh.position.y-(typeof groundAt==='function'?groundAt(v.mesh.position.x,v.mesh.position.z).h:0);v.mesh.userData.gear.visible=!!v.onGround||agl<60;}}catch(e){}};}
//GDETAIL_FIGHTERS-END
