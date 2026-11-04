//GDETAIL_F35-BEGIN  Rebuilt from web refs (refs/f35a, refs/darkstar). F-35A: L 15.67 span 10.70 H 4.38 (USAF fact sheet / LM). Darkstar mockup: L 21.18 span 10.06 (Daniel Simon). Nose -Z, metres.
{const T=THREE,PI=Math.PI;let SK=null,DK=null;
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const tx=(c,srgb=true)=>{const t=new T.CanvasTexture(c);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;};
const R=Math.random;
// ---------- F-35 skin: FS36170-ish gray RAM, lighter stepped/sawtooth LO-tape patches (as in USAF photo), fastener rows
function lo(x,w,h,n,col){x.fillStyle=col;for(let k=0;k<n;k++){const x0=R()*w,y0=R()*h,a=40+R()*170,b=24+R()*90,st=6+((R()*5)|0);
 x.beginPath();x.moveTo(x0,y0);for(let i=0;i<=st;i++)x.lineTo(x0+i*a/st,y0+(i%2?-10:0));x.lineTo(x0+a,y0+b);for(let i=st;i>=0;i--)x.lineTo(x0+i*a/st,y0+b+(i%2?10:0));x.closePath();x.fill();}}
function grain(x,w,h,n,a){for(let i=0;i<n;i++){x.fillStyle=`rgba(${R()<0.5?'0,0,0':'255,255,255'},${R()*a})`;const s=2+R()*22;x.fillRect(R()*w,R()*h,s,s*0.6);}}
function rivets(x,w,h,nv,c){x.strokeStyle=c;x.lineWidth=1.5;x.fillStyle=c;for(let i=1;i<nv;i++){const y=i/nv*h;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();for(let u=0;u<w;u+=12){x.beginPath();x.arc(u,y+5,1,0,7);x.fill();}}}
function skins(){if(SK)return SK;const S=2048;
 const fus=cv(S,S,(x,w,h)=>{x.fillStyle='#626a72';x.fillRect(0,0,w,h);grain(x,w,h,7000,0.03);lo(x,w,h,34,'rgba(150,158,164,0.55)');lo(x,w,h,20,'rgba(80,86,92,0.35)');rivets(x,w,h,22,'rgba(35,38,42,0.35)');
  x.fillStyle='#6d747b';x.fillRect(0,0,w,h*0.06);});
 const wing=cv(S,S,(x,w,h)=>{x.fillStyle='#5f676f';x.fillRect(0,0,w,h);grain(x,w,h,6000,0.03);lo(x,w,h,26,'rgba(150,158,164,0.5)');rivets(x,w,h,16,'rgba(35,38,42,0.3)');
  x.strokeStyle='rgba(155,162,168,0.6)';x.lineWidth=7;for(let k=0;k<6;k++){const y=R()*h;x.beginPath();for(let u=0;u<=w;u+=32)x.lineTo(u,y+(u/32%2)*14);x.stroke();}});
 const rough=cv(512,512,(x,w,h)=>{x.fillStyle='#b4b4b4';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){x.fillStyle=`rgba(${R()<0.5?0:255},${R()<0.5?0:255},${R()<0.5?0:255},0.07)`;x.fillRect(R()*w,R()*h,3,3);}});
 const ft=tx(fus);const wt=tx(wing);wt.repeat.set(0.13,0.13);const rt=tx(rough,false);
 const std=(o)=>new T.MeshStandardMaterial(o);
 SK={fus:std({map:ft,roughnessMap:rt,roughness:0.7,metalness:0.12,envMapIntensity:0.5}),wing:std({map:wt,roughnessMap:rt,roughness:0.7,metalness:0.12,envMapIntensity:0.5,side:T.DoubleSide}),
  dark:std({color:0x2a2e33,roughness:0.6,metalness:0.4}),inlet:std({color:0x0a0b0c,roughness:0.95,side:T.DoubleSide}),
  ceramic:std({color:0x56524c,roughness:0.6,metalness:0.5,side:T.DoubleSide}),hot:std({color:0x3a302a,roughness:0.4,metalness:0.9,side:T.DoubleSide}),
  glass:new T.MeshPhysicalMaterial({color:0xb89a55,metalness:0.4,roughness:0.03,transparent:true,opacity:0.62,clearcoat:1,iridescence:0.6,iridescenceIOR:1.6,side:T.DoubleSide}),
  eots:new T.MeshPhysicalMaterial({color:0x6a5a2a,metalness:0.6,roughness:0.05,clearcoat:1,iridescence:0.8}),
  seat:std({color:0x2f3328,roughness:0.85}),helm:std({color:0x3d4248,roughness:0.4,metalness:0.3}),panel:std({color:0x1a1c1e,roughness:0.5,emissive:0x0f2f40,emissiveIntensity:0.9}),
  lampG:new T.MeshBasicMaterial({color:0x22ff44}),lampR:new T.MeshBasicMaterial({color:0xff2222}),lampW:new T.MeshBasicMaterial({color:0xffffff}),
  rub:std({color:0x151515,roughness:0.95}),chrome:std({color:0xd0d3d6,roughness:0.15,metalness:1}),white:std({color:0xdddddd,roughness:0.6})};return SK;}
// ---------- Darkstar skin: near-black gloss carbon w/ subtle panel lines, NAVY/roundel/skunk in light gray (from Lockheed Edwards photo)
function dskins(){if(DK)return DK;const S=2048;
 const body=cv(S,S,(x,w,h)=>{x.fillStyle='#22262b';x.fillRect(0,0,w,h);grain(x,w,h,5000,0.02);x.strokeStyle='rgba(70,76,84,0.55)';x.lineWidth=2;
  for(let k=0;k<40;k++){const x0=R()*w,y0=R()*h;x.strokeRect(x0,y0,60+R()*260,40+R()*160);}rivets(x,w,h,10,'rgba(12,13,15,0.35)');});
 const rough=cv(256,256,(x,w,h)=>{x.fillStyle='#606060';x.fillRect(0,0,w,h);for(let i=0;i<3000;i++){x.fillStyle=`rgba(${R()<0.5?0:255},0,0,0.06)`;x.fillRect(R()*w,R()*h,2,2);}});
 const bt=tx(body),rt=tx(rough,false);
 DK={body:new T.MeshPhysicalMaterial({map:bt,roughnessMap:rt,roughness:0.42,metalness:0.35,clearcoat:0.6,clearcoatRoughness:0.25,side:T.DoubleSide}),
  edge:new T.MeshStandardMaterial({color:0x15171a,roughness:0.5,metalness:0.4}),
  inlet:new T.MeshStandardMaterial({color:0x050505,roughness:1,side:T.DoubleSide}),
  glass:new T.MeshPhysicalMaterial({color:0x3a6f9a,metalness:0.5,roughness:0.03,clearcoat:1,iridescence:0.5,transparent:true,opacity:0.85}),
  hot:new T.MeshStandardMaterial({color:0x2c2622,roughness:0.4,metalness:0.9,side:T.DoubleSide}),
  liner:new T.MeshStandardMaterial({color:0x221810,emissive:0xff6a20,emissiveIntensity:0.3,side:T.DoubleSide}),
  gear:new T.MeshStandardMaterial({color:0xb8bcc0,roughness:0.35,metalness:0.8}),rub:new T.MeshStandardMaterial({color:0x111111,roughness:0.95})};return DK;}
// ---------- geometry helpers
function loft(sec,mat,seg=56){const n=sec.length,pos=[],uv=[],idx=[];const z0=sec[0][0],z1=sec[n-1][0];
 for(let i=0;i<n;i++){const [z,a,b,yc,e=2.4,ch=0,bot=1]=sec[i];for(let j=0;j<=seg;j++){const t=j/seg*2*PI,c=Math.cos(t),s=Math.sin(t);let px=a*Math.sign(c)*Math.pow(Math.abs(c),2/e),py=b*Math.sign(s)*Math.pow(Math.abs(s),2/e);
  if(s<0)py*=bot;if(ch&&Math.abs(s)<0.3)px*=1+ch*(1-Math.abs(s)/0.3);
  pos.push(px,yc+py,z);uv.push(j/seg,1-(z-z0)/(z1-z0));}}
 for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+seg+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat);return m;}
function surf(pts,t,mat,uvS=1){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:t*0.5,bevelEnabled:true,bevelThickness:t*0.25,bevelSize:Math.min(0.05,t*0.6),bevelSegments:3,curveSegments:4});g.translate(0,0,-t*0.25);g.rotateX(PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*uvS,p.getZ(i)*uvS);g.computeVertexNormals();return new T.Mesh(g,mat);}
const ord=(pts,s)=>s>0?pts:pts.map(([x,z])=>[-x,z]).reverse();
function P(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;}
function dec(g,draw,w,h,pos,rot,W=512,H=256){const m=new T.MeshStandardMaterial({map:tx(cv(W,H,draw)),transparent:true,roughness:0.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});return P(g,new T.PlaneGeometry(w,h),m,...pos,...rot);}
const star=(x,cx,cy,r)=>{x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,rr=i%2?r*0.38:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.fill();};
const roundel=(col,bg)=>(x,w,h)=>{x.fillStyle=col;x.fillRect(w/2-h*0.72,h/2-h*0.12,h*1.44,h*0.24);x.beginPath();x.arc(w/2,h/2,h*0.34,0,7);x.fill();x.fillStyle=bg;star(x,w/2,h/2,h*0.31);};
const finish=g=>{g.traverse(o=>{if(o.isMesh&&!o.material.transparent){o.castShadow=true;o.receiveShadow=true;}});return g;};

// ================= F-35A =================  (planform/profile digitised from LM 3-view, 0.0242 m/px, checked vs USAF flight photo)
function f35A(){const K=skins(),g=new T.Group();g.name='F-35A';
 // [z, halfW, halfH, yc, exp, chine, bottomScale]
 g.add(loft([[-7.84,0.02,0.02,0.17,2],[-7.5,0.14,0.12,0.15,2,0.15],[-7.16,0.24,0.2,0.13,2.1,0.25],[-6.6,0.4,0.32,0.13,2.2,0.3],[-5.95,0.54,0.42,0.14,2.3,0.32],
  [-5.2,0.64,0.55,0.17,2.5,0.3],[-4.5,0.72,0.66,0.19,2.8,0.25],[-3.6,0.95,0.82,0.22,3.2,0.12],[-3.0,1.42,0.9,0.22,3.6,0.05],[-1.84,1.62,0.97,0.2,4,0.03],[-0.15,1.64,0.97,0.2,4.2],
  [1.5,1.63,0.93,0.24,4.2],[2.76,1.6,0.87,0.27,4],[3.8,1.52,0.8,0.28,3.6],[4.45,1.42,0.73,0.29,3.2],[5.42,1.05,0.54,0.3,2.6],[6.15,0.7,0.42,0.27,2.2],[6.6,0.58,0.4,0.25,2]],K.fus,64));
 // shoulder ridges either side of spine (intake ducts blending aft), visible in photo
 for(const s of[1,-1]){const sh=loft([[-3.1,0.05,0.05,0,2],[-2.3,0.42,0.3,0,2.2],[0.5,0.48,0.28,0,2.4],[3.0,0.4,0.22,0,2.4],[4.6,0.05,0.05,0,2]],K.fus,24);sh.position.set(s*0.98,0.95,0);g.add(sh);}
 // DSI bumps + caret inlets: lips at z=-3.3, raked forward-out
 for(const s of[1,-1]){const b=P(g,new T.SphereGeometry(0.4,20,12),K.fus,s*0.86,0.35,-3.75);b.scale.set(0.42,0.6,1.1);
  const lip=new T.Shape();lip.moveTo(0,-0.42);lip.lineTo(0.62,-0.34);lip.lineTo(0.66,0.62);lip.lineTo(0,0.66);lip.closePath();
  const ip=P(g,new T.ShapeGeometry(lip),K.inlet,s*0.92,0.18,-3.05,0,s>0?-0.25:PI+0.25,0);if(s<0)ip.scale.x=-1;
  const lipe=P(g,new T.BoxGeometry(0.05,1.08,0.08),K.fus,s*1.58,0.3,-3.0,0,0,s*0.08);}
 // wings: LE sweep 35 deg, TE slightly fwd-swept (3-view)
 const W=[[1.6,-0.85],[5.35,1.78],[5.35,3.85],[1.6,4.35]];
 for(const s of[1,-1]){g.add(surf(ord(W,s),0.2,K.wing,0.12)).position.y=0.12;
  const fl=surf(ord([[1.7,3.75],[3.6,3.55],[3.6,4.1],[1.7,4.32]],s),0.06,K.wing,0.12);fl.position.y=0.135;fl.name='flap';g.add(fl);
  const ai=surf(ord([[3.65,3.52],[5.3,3.32],[5.3,3.83],[3.65,4.08]],s),0.06,K.wing,0.12);ai.position.y=0.135;ai.name='aileron';g.add(ai);
  P(g,new T.BoxGeometry(4.5,0.015,0.03),K.dark,s*3.5,0.235,0.55,0,-s*0.611,0);// LE flap hinge line
  P(g,new T.SphereGeometry(0.05,8,6),s>0?K.lampG:K.lampR,s*5.36,0.12,2.6);
  // all-moving stabs (3-view)
  const hs=surf(ord([[0.65,5.3],[3.56,6.34],[3.56,7.84],[0.7,7.6]],s),0.1,K.wing,0.12);hs.position.y=0.22;hs.name='stab';g.add(hs);
  // canted verticals ~25 deg outward (front view), root z 4.2..6.25, tip z 5.24..7.1, h 2.4
  const vt=new T.Group();vt.position.set(s*1.25,0.95,0);vt.rotation.z=-s*0.44;g.add(vt);
  const fin=surf([[0,4.2],[2.4,5.24],[2.4,7.1],[0,6.25]],0.1,K.wing,0.12);fin.rotation.z=PI/2;vt.add(fin);
  const rd=surf([[0.15,5.95],[2.3,6.62],[2.3,7.08],[0.15,6.3]],0.05,K.wing,0.12);rd.rotation.z=PI/2;rd.position.x=0.01*s;rd.name='rudder';vt.add(rd);
  dec(vt,(x,w,h)=>{x.fillStyle='rgba(185,190,195,0.85)';x.font='bold 120px Arial';x.textAlign='center';x.fillText('ED',w/2,130);x.font='bold 38px Arial';x.fillText('AF 07-0745',w/2,205);},0.9,0.45,[s*0.07,1.55,6.0],[0,s*PI/2,0]);
  dec(g,roundel('rgba(180,186,192,0.9)','rgba(70,76,82,1)'),1.3,0.65,[s*4.0,0.24,2.7],[-PI/2,0,0]);
  dec(g,(x,w,h)=>{x.fillStyle='rgba(170,176,182,0.85)';x.font='bold 30px Arial';x.fillText('RESCUE',20,60);x.font='20px Arial';x.fillText('CANOPY JETTISON ⟶',20,100);x.fillStyle='rgba(170,176,182,0.85)';x.beginPath();x.moveTo(330,40);x.lineTo(380,90);x.lineTo(330,140);x.fill();},0.8,0.4,[s*0.66,0.55,-5.5],[0,s*PI/2.15,0]);}
 // F135 nozzle: axisymmetric with serrated LO petals, ceramic aft tiles
 const nz=new T.Group();nz.position.set(0,0.25,6.55);g.add(nz);
 P(nz,new T.CylinderGeometry(0.6,0.58,0.4,30,1,true).rotateX(PI/2),K.ceramic,0,0,0.15);
 P(nz,new T.CylinderGeometry(0.5,0.59,0.75,30,1,true).rotateX(PI/2),K.hot,0,0,0.7);
 for(let i=0;i<14;i++){const pv=new T.Group();pv.rotation.z=(i+0.5)/14*2*PI;nz.add(pv);const sh=new T.Shape();sh.moveTo(-0.11,0);sh.lineTo(0.11,0);sh.lineTo(0,0.1);sh.closePath();P(pv,new T.ShapeGeometry(sh),K.hot,0,0.49,1.07,PI/2,0,0);}
 P(nz,new T.CircleGeometry(0.5,24),K.inlet,0,0,0.4,0,PI,0);for(let i=0;i<16;i++)P(nz,new T.BoxGeometry(0.02,0.4,0.02),K.chrome,0,0,0.45,0,0,i/16*PI);
 // canopy: one-piece, no bow on windscreen, aft frame; z -5.97..-3.2, top y 1.5
 const can=P(g,new T.SphereGeometry(1,36,16,0,2*PI,0,PI/2),K.glass,0,0.78,-4.5);can.scale.set(0.5,0.72,1.45);can.renderOrder=2;
 P(g,new T.TorusGeometry(1,0.04,8,24,PI),K.dark,0,0.78,-3.2).scale.set(0.5,0.72,1);
 P(g,new T.BoxGeometry(0.98,0.06,2.9),K.dark,0,0.79,-4.5);
 P(g,new T.BoxGeometry(0.5,0.6,0.18),K.seat,0,0.95,-3.8);P(g,new T.SphereGeometry(0.15,14,10),K.helm,0,1.22,-4.0);P(g,new T.BoxGeometry(0.22,0.06,0.04),K.eots,0,1.22,-4.15);
 P(g,new T.BoxGeometry(0.75,0.22,0.06),K.panel,0,0.9,-4.95,-0.45,0,0);
 // EOTS faceted sapphire window under chin
 P(g,new T.CylinderGeometry(0.13,0.17,0.15,7),K.eots,0,-0.2,-6.1);
 // GAU-22/A gun bump on left upper shoulder (photo)
 P(g,new T.CapsuleGeometry(0.11,1.6,4,10).rotateX(PI/2),K.fus,-1.45,0.85,-0.7);P(g,new T.CircleGeometry(0.05,8),K.inlet,-1.45,0.85,-1.62,0,PI,0);
 // DAS apertures + CNI blades
 for(const [x,y,z] of[[0,1.15,-2.5],[0.75,0.5,-5.2],[-0.75,0.5,-5.2],[0,-0.6,-4]])P(g,new T.CircleGeometry(0.06,6),K.eots,x,y,z,x?0:(y>0?-PI/2:PI/2),x>0?PI/2:x<0?-PI/2:0,0);
 for(const [y,z] of[[1.17,0.4],[1.08,3.0],[-0.76,-1.0],[-0.66,3.2]]){const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(0.3,0);sh.lineTo(0.06,y>0?0.16:-0.16);sh.closePath();P(g,new T.ExtrudeGeometry(sh,{depth:0.02,bevelEnabled:false}),K.dark,-0.01,y,z,0,-PI/2,0);}
 // AAR receptacle door behind canopy
 dec(g,(x,w,h)=>{x.strokeStyle='rgba(40,44,48,0.8)';x.lineWidth=8;x.strokeRect(10,10,w-20,h-20);},0.45,0.3,[0,1.18,-1.7],[-PI/2,0,0],256,160);
 // weapons bay doors (sawtooth edges) underside
 for(const s of[1,-1])dec(g,(x,w,h)=>{x.strokeStyle='rgba(30,33,36,0.85)';x.lineWidth=5;x.beginPath();x.moveTo(10,10);for(let i=0;i<=8;i++)x.lineTo(10+i*(w-20)/8,i%2?40:10);x.lineTo(w-10,h-10);for(let i=8;i>=0;i--)x.lineTo(10+i*(w-20)/8,h-(i%2?40:10));x.closePath();x.stroke();},4.2,0.7,[s*0.65,-0.76,0.6],[PI/2,0,PI/2],512,96);
 P(g,new T.SphereGeometry(0.05,8,6),K.lampW,0,1.17,1.8);P(g,new T.SphereGeometry(0.05,8,6),K.lampR,0,-0.78,0.5);
 // gear (hidden in flight, userData.gear)
 const gear=new T.Group();g.add(gear);g.userData.gear=gear;
 const leg=(x,z,h,wr)=>{P(gear,new T.CylinderGeometry(0.07,0.07,h,10),K.chrome,x,-0.7-h/2,z);P(gear,new T.CylinderGeometry(wr,wr,0.22,20).rotateZ(PI/2),K.rub,x,-0.7-h,z);P(gear,new T.CylinderGeometry(wr*0.55,wr*0.55,0.24,14).rotateZ(PI/2),K.dark,x,-0.7-h,z);};
 leg(0,-5.0,1.3,0.3);leg(1.5,1.2,1.25,0.38);leg(-1.5,1.2,1.25,0.38);gear.visible=false;
 return finish(g);}

// ================= Darkstar =================  (proportions from Daniel Simon design sheets + Lockheed Edwards photo; L 21.18, span 10.06)
function darkstarX(){const K=dskins(),g=new T.Group();g.name='Darkstar';
 // flat blade forebody -> blended body; exp<2 gives the knife-edge chine
 g.add(loft([[-10.6,0.02,0.01,0,2],[-9.6,0.32,0.07,0.02,1.5],[-8.2,0.72,0.17,0.05,1.45],[-6.6,1.12,0.3,0.1,1.45],[-5.0,1.5,0.48,0.14,1.5,0,0.7],[-3.6,1.85,0.62,0.15,1.6,0,0.7],
  [-2.0,2.15,0.66,0.12,1.7,0,0.75],[0,2.35,0.64,0.1,1.8,0,0.8],[2.5,2.45,0.6,0.08,1.8,0,0.85],[5,2.4,0.55,0.05,1.8,0,0.9],[7.5,2.2,0.45,0.03,1.8],[9.5,1.9,0.3,0.0,1.8],[10.5,1.7,0.18,0,1.8]],K.body,64));
 // dorsal cockpit/fuel spine
 g.add(loft([[-7.0,0.02,0.02,0.25,2],[-5.6,0.45,0.32,0.4,2.2],[-3.6,0.62,0.5,0.45,2.4],[-0.5,0.7,0.48,0.4,2.4],[4,0.6,0.38,0.3,2.4],[8.5,0.3,0.15,0.2,2]],K.body,40));
 // wings: blended double-delta, tips at aft (span 10.06)
 for(const s of[1,-1]){const w=surf(ord([[1.8,-6.5],[3.6,0.5],[5.03,6.6],[5.03,8.6],[4.0,9.0],[3.2,8.0],[2.2,9.4],[1.6,9.8]],s),0.18,K.body,0.1);w.position.y=-0.02;g.add(w);
  P(g,new T.BoxGeometry(0.04,0.05,6.3),K.edge,s*4.3,0,3.55,0,-s*0.21,0);// leading-edge carbon strip
  // canted twin fins on aft body
  const vt=new T.Group();vt.position.set(s*2.15,0.3,0);vt.rotation.z=-s*0.22;g.add(vt);
  const fin=surf([[0,5.8],[2.1,7.9],[2.1,9.0],[0,9.6]],0.12,K.body,0.1);fin.rotation.z=PI/2;vt.add(fin);
  // nacelles under aft body: rectangular intakes, round nozzles
  g.add((m=>(m.position.set(s*1.25,-0.55,0),m))(loft([[-1.5,0.55,0.4,0,3.2],[1,0.75,0.55,0,3.2],[6,0.78,0.6,0,3],[9.8,0.7,0.55,0,2.6],[10.9,0.62,0.5,0,2.4]],K.body,32)));
  const inl=P(g,new T.PlaneGeometry(1.0,0.7),K.inlet,s*1.25,-0.57,-1.48,0,PI,0);
  P(g,new T.CylinderGeometry(0.5,0.55,0.4,24,1,true).rotateX(PI/2),K.hot,s*1.25,-0.55,10.95);
  P(g,new T.CircleGeometry(0.48,24),K.liner,s*1.25,-0.55,10.9,0,0,0);
  // side diamond nacelle panel (Edwards photo)
  dec(g,(x,w,h)=>{x.strokeStyle='rgba(120,128,136,0.6)';x.lineWidth=6;x.beginPath();x.moveTo(20,h/2);x.lineTo(w/2,15);x.lineTo(w-20,h/2);x.lineTo(w/2,h-15);x.closePath();x.stroke();},2.2,0.9,[s*2.04,-0.5,6.5],[0,s*PI/2,0]);
  // cockpit side windows (quartz, side-facing)
  const win=P(g,new T.PlaneGeometry(0.75,0.24),K.glass,s*0.5,0.62,-5.2,0,s*PI/2.6,0);win.rotation.x=-0.2;
  // markings
  dec(g,roundel('rgba(200,204,208,0.9)','rgba(35,38,43,1)'),1.4,0.7,[s*3.6,0.17,5.6],[-PI/2,0,0]);
  dec(g,(x,w,h)=>{x.fillStyle='rgba(205,210,214,0.9)';x.font='bold 80px Arial';x.textAlign='center';x.fillText('NAVY',w/2,140);},1.6,0.8,[s*1.5,0.58,-1.0],[-PI/2,0,s>0?-PI/2:PI/2]);
  dec(vt,(x,w,h)=>{x.fillStyle='rgba(205,210,214,0.9)';x.font='bold 46px Arial';x.textAlign='center';x.fillText('SKUNK WORKS',w/2,90);x.font='bold 70px Arial';x.fillText('🦨',w/2,190);},1.1,0.55,[s*0.08,1.0,8.1],[0,s*PI/2,0]);
  dec(g,(x,w,h)=>{x.fillStyle='rgba(205,210,214,0.9)';x.beginPath();x.moveTo(30,h-30);x.lineTo(w/2,30);x.lineTo(w-30,h-30);x.closePath();x.lineWidth=12;x.strokeStyle=x.fillStyle;x.stroke();},0.4,0.4,[s*1.3,0.35,-3.6],[-PI/2,0,0],256,256);}
 // star tracker aperture + AAR receptacle
 P(g,new T.CircleGeometry(0.16,20),K.glass,0,0.94,-1.2,-PI/2,0,0);
 dec(g,(x,w,h)=>{x.strokeStyle='rgba(110,118,126,0.8)';x.lineWidth=8;x.strokeRect(10,10,w-20,h-20);},0.5,0.35,[0,0.9,-3.0],[-PI/2,0,0],256,160);
 // gear (mockup has fixed gear; hidden in flight)
 const gear=new T.Group();g.add(gear);g.userData.gear=gear;
 const leg=(x,z,h,wr)=>{P(gear,new T.CylinderGeometry(0.09,0.09,h,10),K.gear,x,-0.5-h/2,z);P(gear,new T.CylinderGeometry(wr,wr,0.3,20).rotateZ(PI/2),K.rub,x,-0.5-h,z);};
 leg(0,-4.2,1.8,0.38);leg(2.2,5.2,1.6,0.48);leg(-2.2,5.2,1.6,0.48);gear.visible=false;
 g.userData.liner=K.liner;
 return finish(g);}

window.F35A=f35A;window.DarkstarX=darkstarX;
const _f=f35;f35=function(c){try{return f35A();}catch(e){console.warn('f35 detail',e);return _f(c);}};
{const _j=jet;jet=function(c,fa18,kind){
 if(kind==='darkstar'){let g;try{g=darkstarX();}catch(e){console.warn('darkstar',e);return _j(c,fa18,kind);}
  const fl=new T.Group();for(const sx of[-1.25,1.25]){const f=new T.Mesh(new T.ConeGeometry(0.5,1,12).rotateX(PI/2).translate(0,0,0.5),flameMat);f.position.set(sx,-0.55,11.1);fl.add(f);}g.add(fl);g.userData.flame=fl;
  g.userData.updLiner=t=>{g.userData.liner.emissiveIntensity=0.3+t*2.2;};return g;}
 if(fa18||(kind&&kind!=='fighter'&&kind!=='f35'))return _j(c,fa18,kind);let g;try{g=f35A();}catch(e){console.warn('f35',e);return _j(c,fa18,kind);}
 const fl=new T.Group();const f=new T.Mesh(new T.ConeGeometry(0.5,1,14).rotateX(PI/2).translate(0,0,0.5),flameMat);f.position.set(0,0.25,7.4);fl.add(f);g.add(fl);g.userData.flame=fl;return g;};}
}
//GDETAIL_F35-END
