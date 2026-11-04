//GDETAIL_ENEMY-BEGIN  Photo-referenced MQ-9A, Shahed-136/Geran-2, Su-57, J-20, MiG-29 (9.12), F/A-18E. Refs + dims: /workspace/milsim/refs/<type>/sources.txt
// Convention: nose -Z, +Y up, +X right (pilot's right = -X looking from front? no: +X = starboard when nose is -Z and up +Y => right-handed), origin ~mid-length. Metres.
const ENEMY_AC=(()=>{const T=THREE,PI=Math.PI;
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const tx=(c,srgb=true)=>{const t=new T.CanvasTexture(c);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;};
let R=0;const rnd=s=>{R=s;return()=>{R=(R*16807)%2147483647;return R/2147483647;};};
// ---- skin: base + optional camo + panel lines/fasteners/access doors + weathering. u=around (loft) / x (surf), v=along
function skin(o){const S=o.S||1024;const r=rnd(o.seed||7);
 const c=cv(S,S,(x,w,h)=>{x.fillStyle=o.base;x.fillRect(0,0,w,h);if(o.camo)o.camo(x,w,h,r);
  for(let i=0;i<5000;i++){x.fillStyle=`rgba(${r()<0.5?'0,0,0':'255,255,255'},${r()*0.025})`;const s=2+r()*24;x.fillRect(r()*w,r()*h,s,s*0.6);}
  const pl=o.pl||'rgba(25,28,32,0.5)';x.strokeStyle=pl;x.lineWidth=1.5;const nu=o.nu||12,nv=o.nv||16;
  for(let i=0;i<=nv;i++){const y=i/nv*h;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();}
  for(let i=0;i<nv;i++)for(let j=0;j<nu;j++){if((i*5+j*3)%3===0)continue;const X=(j+(i%2)*0.5)/nu*w,Y=i/nv*h;x.beginPath();x.moveTo(X,Y);x.lineTo(X,Y+h/nv);x.stroke();}
  for(let k=0;k<(o.doors??40);k++){const X=r()*w,Y=r()*h,a=14+r()*50,b=10+r()*34;x.strokeRect(X,Y,a,b);x.fillStyle='rgba(20,22,24,0.45)';for(const [px,py] of [[X+3,Y+3],[X+a-3,Y+3],[X+3,Y+b-3],[X+a-3,Y+b-3]]){x.beginPath();x.arc(px,py,1.3,0,7);x.fill();}}
  x.fillStyle='rgba(20,22,24,0.35)';for(let i=0;i<=nv;i++)for(let u=0;u<w;u+=11){x.beginPath();x.arc(u,i/nv*h+4,0.9,0,7);x.fill();}
  if(o.soot){const g=x.createLinearGradient(0,h*0.82,0,h);g.addColorStop(0,'rgba(35,30,25,0)');g.addColorStop(1,'rgba(35,30,25,0.5)');x.fillStyle=g;x.fillRect(0,0,w,h);}
  if(o.extra)o.extra(x,w,h,r);});
 const t=tx(c);if(o.rep)t.repeat.set(o.rep,o.rep);
 return new T.MeshStandardMaterial({map:t,roughness:o.rough??0.62,metalness:o.metal??0.25,side:o.dbl?T.DoubleSide:T.FrontSide,envMapIntensity:0.8});}
const MAT={};const mat=(k,f)=>MAT[k]||(MAT[k]=f());
const std=(c,r=0.6,m=0.3,e)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},e||{}));
const glassM=()=>mat('glass',()=>new T.MeshPhysicalMaterial({color:0xc8a860,metalness:0.3,roughness:0.05,transparent:true,opacity:0.6,clearcoat:1,iridescence:0.5}));
const clearM=()=>mat('clear',()=>new T.MeshPhysicalMaterial({color:0x7f98a8,metalness:0.1,roughness:0.03,transparent:true,opacity:0.42,clearcoat:1}));
// ---- geometry helpers
// loft: sections [z, halfW, halfH, yc, exponent(2=ellipse, >2 boxier), flatBottom 0..1]
function loft(sec,m,seg=48){const n=sec.length,pos=[],uv=[],idx=[];const z0=sec[0][0],z1=sec[n-1][0];
 for(let i=0;i<n;i++){const [z,a,b,yc,e=2,fb=0]=sec[i];for(let j=0;j<=seg;j++){const t=j/seg*2*PI,c=Math.cos(t),s=Math.sin(t);let py=b*Math.sign(s)*Math.pow(Math.abs(s),2/e);if(s<0)py*=1-fb*0.5;pos.push(a*Math.sign(c)*Math.pow(Math.abs(c),2/e),yc+py,z);uv.push(j/seg,(z-z0)/(z1-z0));}}
 for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){const a=i*(seg+1)+j,b=a+seg+1;idx.push(a,a+1,b,b,a+1,b+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return new T.Mesh(g,m);}
// planform surface pts [[x,z]] with thickness t (bevelled = rounded LE/TE). UV in metres*uvS
function surf(pts,t,m,uvS=0.08){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));
 const g=new T.ExtrudeGeometry(s,{depth:t*0.4,bevelEnabled:true,bevelThickness:t*0.3,bevelSize:Math.min(0.06,t*0.5),bevelSegments:3,curveSegments:2});g.translate(0,0,-t*0.2);g.rotateX(PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*uvS+0.5,p.getZ(i)*uvS+0.5);g.computeVertexNormals();return new T.Mesh(g,m);}
// fin: profile pts [[z,y]] in side view, thickness t; then caller rotates about Z for cant
function fin(pts,t,m,uvS=0.12){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));
 const g=new T.ExtrudeGeometry(s,{depth:t*0.4,bevelEnabled:true,bevelThickness:t*0.3,bevelSize:Math.min(0.05,t*0.5),bevelSegments:3,curveSegments:2});g.translate(0,0,-t*0.2);g.rotateY(-PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getZ(i)*uvS+0.5,p.getY(i)*uvS+0.5);g.computeVertexNormals();return new T.Mesh(g,m);}
const mx=pts=>pts.map(([x,z])=>[-x,z]).reverse();
function P(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;}
function dec(g,draw,w,h,pos,rot,W=512,H=256){const m=new T.MeshStandardMaterial({map:tx(cv(W,H,draw)),transparent:true,roughness:0.65,metalness:0.1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:T.DoubleSide});return P(g,new T.PlaneGeometry(w,h),m,...pos,...rot);}
const star5=(x,cx,cy,r,inner=0.38)=>{x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,rr=i%2?r*inner:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();x.fill();};
const nozzle=(g,m,mi,x,y,z,r0,r1,L,petals=16)=>{const n=P(g,new T.CylinderGeometry(r1,r0,L,petals,1,true).rotateX(PI/2),m,x,y,z);n.material.side=T.DoubleSide;
 P(g,new T.CircleGeometry(r0*0.92,24),mi,x,y,z-L*0.3);for(let i=0;i<petals;i++){const a=i/petals*2*PI;P(g,new T.BoxGeometry(0.012,0.02,L*0.96),m,x+Math.cos(a)*(r0+r1)*0.5,y+Math.sin(a)*(r0+r1)*0.5,z,0,0,a);}return n;};
const finish=g=>{g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
const stencil=(txt,col,font='bold 120px Arial')=>(x,w,h)=>{x.fillStyle=col;x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2);};

// ================= MQ-9A REAPER  L 11.0  span 20.1  H 3.8 (af.mil) =================
function mq9(){const g=new T.Group();g.name='MQ-9A';const gray='#a3a8ab';
 const K=skin({base:gray,nu:10,nv:14,seed:3,rough:0.55,metal:0.15,soot:true,doors:30});const W=skin({base:gray,nu:24,nv:6,seed:5,rough:0.55,metal:0.15,dbl:true,rep:1,doors:12});
 // fuselage: SATCOM bulge nose, deep slab-sided body, tapering to engine bay + prop hub
 const fus=loft([[-5.5,0.02,0.02,0.05,2],[-5.42,0.3,0.32,0.08,2],[-5.2,0.48,0.5,0.12,2.1],[-4.8,0.58,0.6,0.15,2.2],[-4.3,0.6,0.62,0.14,2.3],[-3.6,0.55,0.56,0.08,2.4],[-2.6,0.5,0.52,0.04,2.6],[-1.2,0.48,0.52,0.04,2.6],[0.4,0.47,0.5,0.06,2.6],[1.8,0.42,0.44,0.08,2.4],[3.0,0.34,0.36,0.1,2.2],[4.0,0.27,0.28,0.12,2],[4.8,0.2,0.2,0.12,2],[5.1,0.12,0.12,0.12,2]],K,48);g.add(fus);
 // engine air scoops (dorsal NACA + side), exhaust stacks
 P(g,new T.BoxGeometry(0.22,0.08,0.7),std(0x2a2c2e,0.8,0.1),0,0.66,2.3);for(const s of[1,-1]){P(g,new T.CylinderGeometry(0.06,0.07,0.3,10).rotateZ(s*PI/2),std(0x3b3530,0.5,0.8),s*0.37,0.05,3.6);}
 // chin MTS-B EO/IR turret + Lynx radar fairing
 const tur=new T.Group();tur.position.set(0,-0.62,-4.4);g.add(tur);P(tur,new T.CylinderGeometry(0.16,0.2,0.12,20),std(0x8d9295,0.5,0.3));P(tur,new T.SphereGeometry(0.24,24,16),std(0x9aa0a3,0.45,0.35),0,-0.24,0);
 P(tur,new T.CircleGeometry(0.11,20),std(0x101418,0.05,0.9,{emissive:0x0a1020}),0,-0.26,-0.22);P(tur,new T.CircleGeometry(0.06,16),std(0x2a1a10,0.05,0.9),0.12,-0.3,-0.18,0,0.4,0);
 P(g,new T.CapsuleGeometry(0.2,0.8,6,12).rotateX(PI/2),K,0,-0.5,-3.0).scale.set(1.2,0.6,1);// radar canoe
 // wing: straight, high-AR, high-mounted. root chord 1.45, tip 0.62, LE ~ straight
 const wp=[[0.45,-0.75],[10.05,-0.42],[10.05,0.2],[0.45,0.7]];for(const s of[1,-1]){const w=surf(s>0?wp:mx(wp),0.16,W);w.position.set(0,0.42,0);w.rotation.z=s*0.015;g.add(w);
  // flaperons + ailerons hinge lines, wingtip light
  P(g,new T.BoxGeometry(5.0,0.03,0.03),std(0x3a3d40,0.7,0.2),s*3.2,0.5,0.62);P(g,new T.BoxGeometry(3.2,0.03,0.03),std(0x3a3d40,0.7,0.2),s*7.8,0.55,0.15);
  P(g,new T.SphereGeometry(0.05,8,6),std(s>0?0x22ff44:0xff2222,0.4,0,{emissive:s>0?0x22ff44:0xff2222,emissiveIntensity:2}),s*10.06,0.58,-0.3);
  // 3 wing pylons per side (6 wing stations), Hellfire rail on outer two, GBU-12 inboard
  for(const [px,L] of [[1.7,1.0],[3.6,0.8],[5.5,0.7]]){P(g,new T.BoxGeometry(0.08,0.22,L),K,s*px,0.24,-0.05);}
  for(const px of[3.6,5.5]){P(g,new T.BoxGeometry(0.22,0.06,0.9),std(0x55595c,0.6,0.3),s*px,0.1,0);for(const d of[-0.08,0.08]){const h=new T.Group();h.position.set(s*px+d,0.0,0);g.add(h);P(h,new T.CylinderGeometry(0.0889,0.0889,1.63,12).rotateX(PI/2),std(0x4b5320,0.6,0.2));P(h,new T.SphereGeometry(0.0889,12,8,0,PI*2,0,PI/2).rotateX(-PI/2),std(0x22262a,0.2,0.6),0,0,-0.815);for(let k=0;k<4;k++)P(h,new T.BoxGeometry(0.012,0.24,0.18),std(0x4b5320,0.6,0.2),0,0,0.6,0,0,k*PI/2+PI/4);}}
  {const b=new T.Group();b.position.set(s*1.7,0.0,0);g.add(b);P(b,new T.CylinderGeometry(0.137,0.137,2.0,14).rotateX(PI/2),std(0x56602e,0.6,0.2));P(b,new T.ConeGeometry(0.137,0.5,14).rotateX(-PI/2),std(0x56602e,0.6,0.2),0,0,-1.25);P(b,new T.CylinderGeometry(0.07,0.07,0.25,10).rotateX(PI/2),std(0x9a9a9a,0.3,0.7),0,0,-1.6);for(let k=0;k<4;k++)P(b,new T.BoxGeometry(0.01,0.5,0.35),std(0x56602e,0.6,0.2),0,0,0.95,0,0,k*PI/2+PI/4);}}
 // Y-tail: two V ruddervators up at ~45 deg + ventral fin down (span each ~2.2 m)
 const vp=[[3.9,0],[4.75,2.0],[5.15,2.0],[5.15,0]];for(const s of[1,-1]){const f=fin(vp,0.1,W);f.position.set(0,0.25,0);f.rotation.z=-s*0.78;g.add(f);
  dec(g,stencil('CH','rgba(55,60,64,0.9)','bold 150px Arial'),0.5,0.25,[s*0.82,1.0,4.75],[0,s*PI/2,-s*0.78+(s>0?0:0)]);}
 const vf=fin([[4.0,0],[4.95,-1.25],[5.2,-1.25],[5.2,0]],0.1,W);vf.position.y=-0.15;g.add(vf);
 // 3-blade pusher prop dia 2.95 m + spinner
 const pr=new T.Group();pr.position.set(0,0.12,5.25);g.add(pr);P(pr,new T.ConeGeometry(0.15,0.38,16).rotateX(PI/2),std(0x9da2a5,0.4,0.4),0,0,0.18);
 for(let i=0;i<3;i++){const b=P(pr,new T.BoxGeometry(0.17,1.42,0.04),std(0x2b2d2f,0.55,0.2),0,0,0,0,0,i*2*PI/3);b.geometry.translate(0,0.75,0);b.rotation.y=0.25;P(pr,new T.BoxGeometry(0.17,0.08,0.042),std(0xd8c020,0.5,0.1),0,0,0,0,0,i*2*PI/3).geometry.translate(0,1.42,0);}
 g.userData.prop=pr;
 // landing gear stowed; markings: star-and-bar (low-vis) on wings + fuselage, serial, 'NO STEP'
 const insig=(x,w,h)=>{x.fillStyle='rgba(60,64,68,0.85)';x.beginPath();x.arc(w/2,h/2,h*0.32,0,7);x.fill();x.fillRect(w/2-h*0.64,h/2-h*0.11,h*1.28,h*0.22);x.fillStyle=gray;star5(x,w/2,h/2,h*0.3);};
 for(const s of[1,-1]){dec(g,insig,1.3,0.65,[s*7.5,0.53,-0.1],[-PI/2,0,0]);dec(g,insig,0.7,0.35,[s*0.49,0.1,-1.6],[0,s*PI/2,0]);
  dec(g,stencil('AF 09-129','rgba(45,48,52,0.9)','bold 90px Arial'),0.9,0.22,[s*0.48,0.0,1.2],[0,s*PI/2,0]);}
 return finish(g);}

// ================= SHAHED-136 / GERAN-2  L 3.5  span 2.5 =================
function shahed(black=false){const g=new T.Group();g.name='Shahed-136';const base=black?'#22252a':'#d7d9d5';
 const K=skin({base,nu:6,nv:8,seed:11,rough:0.7,metal:0.05,doors:6,pl:black?'rgba(0,0,0,0.6)':'rgba(70,72,74,0.4)'});
 const W=skin({base,nu:8,nv:6,seed:12,rough:0.75,metal:0.02,dbl:true,doors:8,pl:black?'rgba(0,0,0,0.6)':'rgba(70,72,74,0.35)',rep:1,
  extra:black?(x,w,h)=>{x.fillStyle='#e8c200';x.font='bold 70px Arial';x.save();x.translate(w*0.62,h*0.55);x.rotate(PI/2);x.fillText('Ы14979',0,0);x.fillText('ГЕРАНЬ-2',0,70);x.restore();}:null});
 // ogive nose (warhead) z -1.75 .. -1.05, cylindrical fuselage dia ~0.43, boat-tail to engine
 g.add(loft([[-1.75,0.01,0.01,0,2],[-1.68,0.09,0.09,0,2],[-1.55,0.15,0.15,0,2],[-1.35,0.2,0.2,0,2],[-1.1,0.215,0.215,0,2],[0.6,0.215,0.215,0,2],[1.1,0.2,0.2,0,2],[1.4,0.16,0.16,0,2],[1.6,0.12,0.12,0,2]],K,36));
 P(g,new T.TorusGeometry(0.216,0.006,6,36),std(0x222222,0.6,0.3),0,0,-1.1);// warhead joint seam
 // cropped delta wing: LE root at z -0.62, tip LE z 1.12 at x 1.25, tip TE z 1.62, root TE z 1.45 (DIA drawing)
 const wp=[[0.18,-0.62],[1.25,1.12],[1.25,1.62],[0.18,1.45]];for(const s of[1,-1]){const w=surf(s>0?wp:mx(wp),0.06,W,0.35);w.position.y=-0.02;g.add(w);
  // tip stabilisers above and below (OSMP)
  const f=fin([[1.0,-0.24],[1.12,0.38],[1.42,0.38],[1.62,0.06],[1.62,-0.24]],0.03,W,0.4);f.position.x=s*1.25;g.add(f);
  // GNSS/pitot boom and control surface lines
  P(g,new T.BoxGeometry(0.85,0.012,0.012),std(0x333333,0.7,0.2),s*0.75,0.015,1.42);}
 // MD-550 4-cyl engine with finned cylinders, 2-blade pusher prop dia 0.85
 const eng=new T.Group();eng.position.set(0,0,1.62);g.add(eng);P(eng,new T.CylinderGeometry(0.12,0.12,0.18,16).rotateX(PI/2),std(0x3a3a3a,0.5,0.6));
 for(const s of[1,-1])for(const z of[-0.03,0.05])P(eng,new T.CylinderGeometry(0.05,0.05,0.12,10).rotateZ(PI/2),std(0x6a6a6a,0.4,0.8),s*0.15,0,z);
 const pr=new T.Group();pr.position.set(0,0,1.8);g.add(pr);P(pr,new T.ConeGeometry(0.05,0.1,12).rotateX(PI/2),std(0x222222,0.5,0.3),0,0,0.04);
 for(let i=0;i<2;i++){const b=P(pr,new T.BoxGeometry(0.06,0.42,0.018),std(0x2a2520,0.6,0.1),0,0,0,0,0,i*PI);b.geometry.translate(0,0.22,0);b.rotation.y=0.3;}g.userData.prop=pr;
 // Iranian-style tricolour band on nose (IRGC exhibit) for grey; none for Geran-2
 if(!black)dec(g,(x,w,h)=>{x.fillStyle='#239f40';x.fillRect(0,0,w,h/3);x.fillStyle='#fff';x.fillRect(0,h/3,w,h/3);x.fillStyle='#da0000';x.fillRect(0,2*h/3,w,h/3);},0.22,0.12,[0,0.218,-1.0],[-PI/2,0,PI/2]);
 return finish(g);}

// ================= Su-57  L 20.1  span 14.1  H 4.6 =================
function su57(){const g=new T.Group();g.name='Su-57';
 // pixel ("digital") two-tone camo seen in refs/su57/photo1: light blue-grey base, dark grey blocks
 const pix=(x,w,h,r)=>{for(let i=0;i<260;i++){const cx=r()*w,cy=r()*h,n=4+r()*10|0;x.fillStyle=r()<0.7?'#2e3438':'#4c5560';for(let k=0;k<n;k++){const s=10+r()*26;x.fillRect(cx+(r()-0.5)*70|0,cy+(r()-0.5)*70|0,s|0,(s*(0.4+r()))|0);}}};
 const K=skin({base:'#aebbc6',camo:pix,nu:14,nv:20,seed:21,rough:0.6,metal:0.18,soot:true,S:2048});const W=skin({base:'#aebbc6',camo:pix,nu:12,nv:12,seed:22,rough:0.6,metal:0.18,dbl:true,rep:1,S:2048});
 const dark=std(0x2a2e33,0.7,0.2),inl=std(0x0b0c0d,0.95,0,{side:T.DoubleSide}),ti=std(0x6f655a,0.35,0.95),mi=std(0x1a1a1a,0.8,0.5);
 // forward fuselage (nose z -10.05) chined, then broad flat centre body
 g.add(loft([[-10.05,0.02,0.02,0.4,2],[-9.8,0.16,0.14,0.42,2.2],[-9.0,0.42,0.36,0.45,2.6],[-8.0,0.6,0.52,0.48,2.9],[-7.0,0.72,0.66,0.52,3.1,0.3],[-6.0,0.82,0.78,0.55,3.2,0.4],[-5.0,1.05,0.82,0.52,3.4,0.5],[-3.5,1.6,0.8,0.45,4,0.6],[-1.5,2.0,0.72,0.42,4.5,0.7],[1.5,2.1,0.62,0.38,4.5,0.7],[4.5,1.8,0.5,0.35,4,0.7],[7.0,1.2,0.38,0.35,3,0.6],[8.8,0.55,0.25,0.38,2.4,0.5],[9.6,0.2,0.12,0.4,2]],K,64));
 // canopy (bubble with frame bow) and IRST ball ahead of it, starboard of centreline
 P(g,new T.SphereGeometry(1,28,16,0,PI*2,0,PI/2),glassM(),0,1.15,-6.3).scale.set(0.52,0.62,1.9);
 P(g,new T.TorusGeometry(0.52,0.025,6,24,PI),dark,0,1.15,-5.5,0,0,0).scale.set(1,1.2,1);
 P(g,new T.SphereGeometry(0.15,16,12),std(0x30404a,0.05,0.9),0.15,1.12,-8.1);
 // engine nacelles AL-41F1: widely spaced (x ±1.55), tunnel between, intakes under LEVCON
 for(const s of[1,-1]){const n=loft([[-4.8,0.62,0.6,-0.2,3.2],[-3.5,0.66,0.66,-0.18,3],[0,0.66,0.66,-0.15,2.6],[4,0.64,0.64,-0.1,2.4],[7.5,0.6,0.6,-0.05,2.2],[9.1,0.55,0.55,-0.02,2.1]],K,36);n.position.x=s*1.55;g.add(n);
  P(g,new T.PlaneGeometry(1.15,1.05),inl,s*1.55,-0.2,-4.79).rotation.y=s*0.35;// trapezoidal intake face
  P(g,new T.BoxGeometry(0.06,1.2,1.2),K,s*2.2,-0.2,-4.3,0,0,0);
  nozzle(g,ti,mi,s*1.55,-0.02,9.55,0.52,0.48,0.9,18);}
 // LEVCON (leading-edge vortex controller) + wing. LE sweep ~48deg, TE slight fwd sweep. span 14.1
 const lev=[[0.9,-6.6],[2.55,-3.6],[2.55,-3.1],[1.2,-3.3]];const wp=[[2.4,-3.3],[7.05,3.2],[7.05,4.0],[4.6,4.6],[2.1,5.4]];
 for(const s of[1,-1]){const l=surf(s>0?lev:mx(lev),0.12,W);l.position.y=0.55;l.rotation.z=-s*0.04;g.add(l);const w=surf(s>0?wp:mx(wp),0.22,W);w.position.y=0.42;w.rotation.z=-s*0.03;g.add(w);
  // all-moving horizontal tails
  const ht=surf(s>0?[[2.0,6.0],[5.0,8.6],[5.0,9.4],[2.0,9.0]]:mx([[2.0,6.0],[5.0,8.6],[5.0,9.4],[2.0,9.0]]),0.12,W);ht.position.y=0.25;g.add(ht);
  // all-moving vertical tails canted outward ~26deg
  const vt=fin([[4.6,0],[6.9,2.75],[7.9,2.75],[8.4,0]],0.12,W);vt.position.set(s*1.95,0.8,0);vt.rotation.z=-s*0.45;g.add(vt);
  dec(g,(x,w,h)=>{x.fillStyle='#fff';star5(x,w/2,h/2,h*0.46,0.42);x.fillStyle='#c4161c';star5(x,w/2,h/2,h*0.38,0.42);},0.9,0.9,[s*(1.95+0.08)+s*0.95*0.45,0.8+1.6,7.2],[0,s*PI/2,-s*0.45]);
  dec(g,(x,w,h)=>{x.fillStyle='#fff';star5(x,w/2,h/2,h*0.46,0.42);x.fillStyle='#c4161c';star5(x,w/2,h/2,h*0.38,0.42);},1.3,1.3,[s*5.3,0.56,2.6],[-PI/2,0,0]);
  dec(g,stencil('054','rgba(30,36,46,0.95)','bold 170px Arial'),1.0,0.5,[s*0.78,0.5,-7.4],[0,s*PI/2-s*0.12,0]);
  // weapons-bay & ventral side-bay seams
  P(g,new T.BoxGeometry(0.02,0.02,4.2),dark,s*0.9,-0.08,1.0);}
 P(g,new T.CylinderGeometry(0.06,0.04,0.9,10).rotateX(PI/2),std(0x9aa0a6,0.3,0.8),0,0.4,-10.4);// nose pitot
 P(g,new T.CylinderGeometry(0.18,0.28,1.6,14).rotateX(PI/2),K,0,0.45,9.9);// central tail sting (EW/chute)
 return finish(g);}

// ================= J-20  L 21.2  span 13.01  H 4.69 =================
function j20(){const g=new T.Group();g.name='J-20';
 const K=skin({base:'#a9b1b8',nu:14,nv:22,seed:31,rough:0.48,metal:0.35,soot:true,S:2048,extra:(x,w,h)=>{x.fillStyle='rgba(90,98,106,0.35)';for(let i=0;i<22;i++)x.fillRect(0,i/22*h-2,w,4);}});const W=skin({base:'#a6aeb5',nu:12,nv:12,seed:32,rough:0.48,metal:0.35,dbl:true,rep:1});
 const dark=std(0x2a2e33,0.7,0.2),inl=std(0x0b0c0d,0.95,0,{side:T.DoubleSide}),ti=std(0x67615a,0.35,0.95),mi=std(0x1a1a1a,0.8,0.5);
 g.add(loft([[-10.6,0.02,0.02,0.35,2],[-10.2,0.2,0.16,0.37,2.4],[-9.0,0.5,0.42,0.42,3],[-7.6,0.7,0.62,0.48,3.4,0.3],[-6.4,0.8,0.78,0.52,3.6,0.4],[-5.0,0.9,0.86,0.5,3.8,0.5],[-3.0,1.4,0.9,0.42,4.2,0.6],[0,1.75,0.85,0.35,4.6,0.7],[3.5,1.8,0.75,0.3,4.6,0.7],[6.5,1.6,0.6,0.3,4,0.6],[8.5,1.45,0.5,0.3,3.4,0.5],[10.0,1.35,0.45,0.3,3,0.4],[10.6,1.3,0.42,0.3,3,0.4]],K,64));
 P(g,new T.SphereGeometry(1,28,16,0,PI*2,0,PI/2),glassM(),0,1.12,-6.0).scale.set(0.55,0.6,2.2);
 // caret intakes with DSI bumps (z -5.2..-3), LERX
 for(const s of[1,-1]){const ib=loft([[-5.4,0.32,0.62,0.0,2.6],[-4.6,0.5,0.66,0.0,3],[-3,0.6,0.66,0.0,3],[0,0.55,0.6,0.05,3]],K,24);ib.position.x=s*1.1;g.add(ib);
  P(g,new T.PlaneGeometry(0.62,1.2),inl,s*1.25,0.0,-5.38,0,s*0.5,0);P(g,new T.SphereGeometry(0.42,16,10),K,s*0.95,0.0,-4.9).scale.set(0.5,1.1,1.6);// DSI bump
  // canards: all-moving, slight dihedral, behind intakes
  const cn=[[1.4,-4.5],[3.75,-2.4],[3.75,-1.8],[1.4,-2.3]];const c=surf(s>0?cn:mx(cn),0.1,W);c.position.y=0.55;c.rotation.z=-s*0.1;g.add(c);
  // LERX + delta wing: span 13.01, LE sweep ~ 48deg
  const lx=[[1.5,-2.3],[2.6,-0.2],[2.6,0.5],[1.5,0.5]];const l=surf(s>0?lx:mx(lx),0.1,W);l.position.y=0.42;g.add(l);
  const wp=[[2.4,0.0],[6.5,4.4],[6.5,5.6],[4.0,6.4],[1.8,7.4]];const w=surf(s>0?wp:mx(wp),0.2,W);w.position.y=0.35;w.rotation.z=-s*0.03;g.add(w);
  // all-moving twin fins canted outward ~ 15deg, ventral fins canted outward
  const vt=fin([[6.4,0],[8.3,2.6],[9.3,2.6],[9.6,0]],0.12,W);vt.position.set(s*1.25,0.75,0);vt.rotation.z=-s*0.3;g.add(vt);
  const vf=fin([[7.6,0],[8.6,-0.9],[9.4,-0.9],[9.7,0]],0.08,W);vf.position.set(s*1.4,-0.1,0);vf.rotation.z=s*0.6;g.add(vf);
  nozzle(g,ti,mi,s*0.72,0.25,11.0,0.5,0.46,0.9,18);
  // PLAAF red star with bars on fins & wings, bort 78271
  const plaaf=(x,w,h)=>{x.fillStyle='#c4161c';x.fillRect(w*0.1,h*0.42,w*0.8,h*0.16);x.beginPath();x.arc(w/2,h/2,h*0.42,0,7);x.fill();x.fillStyle='#f2d21c';star5(x,w/2,h/2,h*0.3,0.42);x.fillStyle='#fff';x.fillRect(w/2-h*0.08,h*0.43,h*0.16,h*0.12);};
  dec(g,plaaf,1.2,0.6,[s*(1.25+0.07)+s*1.3*0.3,0.75+1.3,8.6],[0,s*PI/2,-s*0.3]);dec(g,plaaf,1.6,0.8,[s*4.6,0.47,4.8],[-PI/2,0,0]);
  dec(g,stencil('78271','rgba(30,30,32,0.92)','bold 150px Arial'),1.3,0.4,[s*0.79,0.65,-7.4],[0,s*PI/2-s*0.1,0]);}
 P(g,new T.CylinderGeometry(0.035,0.02,1.0,8).rotateX(PI/2),std(0x9aa0a6,0.3,0.8),0,0.36,-11.1);
 return finish(g);}

// ================= MiG-29 (9.12)  L 17.32 (incl. probe)  span 11.36  H 4.73 =================
function mig29(){const g=new T.Group();g.name='MiG-29';
 const camo=(x,w,h,r)=>{x.fillStyle='#8c99a6';for(let i=0;i<14;i++){x.beginPath();const cx=r()*w,cy=r()*h;x.moveTo(cx,cy);for(let k=0;k<7;k++)x.lineTo(cx+(r()-0.3)*w*0.35,cy+(r()-0.5)*h*0.25);x.fill();}};
 const K=skin({base:'#b7c1c8',camo,nu:12,nv:18,seed:41,rough:0.58,metal:0.2,soot:true,S:2048});const W=skin({base:'#b7c1c8',camo,nu:10,nv:10,seed:42,rough:0.58,metal:0.2,dbl:true,rep:1});
 const dark=std(0x2a2e33,0.7,0.2),inl=std(0x0b0c0d,0.95,0,{side:T.DoubleSide}),ti=std(0x6a6058,0.38,0.9),mi=std(0x1a1a1a,0.8,0.5),rad=std(0xd9d8cf,0.5,0.1);
 // drooped nose, radome white-grey (photo2), spine
 const fus=loft([[-7.9,0.02,0.02,0.05,2],[-7.6,0.22,0.22,0.08,2],[-6.8,0.42,0.42,0.14,2],[-5.8,0.55,0.58,0.22,2.2],[-4.6,0.62,0.7,0.32,2.4],[-3.4,0.66,0.74,0.38,2.6],[-2.0,0.62,0.66,0.42,2.4],[0,0.55,0.58,0.42,2.2],[2.5,0.5,0.5,0.4,2.2],[5.0,0.42,0.42,0.38,2],[7.0,0.25,0.3,0.4,2]],K,48);g.add(fus);
 P(g,new T.ConeGeometry(0.43,1.9,24).rotateX(-PI/2),rad,0,0.12,-7.75);// radome
 P(g,new T.CylinderGeometry(0.03,0.015,1.55,8).rotateX(PI/2),std(0xb0b4b8,0.3,0.8),0,0.12,-9.4);// probe → 17.32 overall
 P(g,new T.SphereGeometry(1,28,16,0,PI*2,0,PI/2),clearM(),0,0.98,-4.2).scale.set(0.5,0.55,1.7);
 P(g,new T.SphereGeometry(0.14,12,10),std(0x203038,0.05,0.9),0.18,0.92,-5.95);// KOLS IRST ball
 for(const s of[1,-1]){// separate engine nacelles + ramp intakes under LERX (negative stagger)
  const n=loft([[-3.6,0.52,0.58,-0.35,3.4],[-2.0,0.6,0.62,-0.3,3],[1.0,0.62,0.62,-0.18,2.6],[4.5,0.58,0.58,-0.05,2.4],[7.4,0.48,0.48,0.0,2.2]],K,32);n.position.x=s*1.05;g.add(n);
  P(g,new T.PlaneGeometry(0.95,0.95),inl,s*1.05,-0.35,-3.58,-0.35,0,0);
  nozzle(g,ti,mi,s*1.05,0.0,7.85,0.45,0.4,0.9,16);
  // LERX: long, from z -4.8 to wing root
  const lx=[[0.55,-4.9],[1.7,-1.8],[2.0,-0.5],[0.55,-0.5]];g.add((m=>{m.position.set(0,0.3,0);return m;})(surf(s>0?lx:mx(lx),0.1,W)));
  // wing: LE sweep 42deg, tip chord ~1.2 ; semi-span to 5.68
  const wp=[[1.9,-0.6],[5.68,3.6],[5.68,4.7],[3.7,4.9],[1.9,5.0]];const w=surf(s>0?wp:mx(wp),0.2,W);w.position.y=0.25;w.rotation.z=s*0.05;g.add(w);
  // tail booms + twin fins canted 6deg outward, height to 4.73 overall
  P(g,new T.BoxGeometry(0.28,0.3,4.2),K,s*1.75,0.25,5.9);const vt=fin([[4.7,0],[6.5,2.65],[7.5,2.65],[7.9,0]],0.12,W);vt.position.set(s*1.75,0.4,0);vt.rotation.z=-s*0.1;g.add(vt);
  P(g,new T.CylinderGeometry(0.1,0.12,1.6,10).rotateX(PI/2),K,s*1.75,0.3,8.4);// chaff/flare boom tails
  const ht=[[1.6,5.9],[3.89,7.6],[3.89,8.3],[1.6,8.3]];g.add((m=>{m.position.set(0,0.15,0);return m;})(surf(s>0?ht:mx(ht),0.1,W)));
  // markings: Russian red star (white/red border), blue bort "10"
  const rs=(x,w,h)=>{x.fillStyle='#fff';star5(x,w/2,h/2,h*0.47,0.42);x.fillStyle='#c4161c';star5(x,w/2,h/2,h*0.39,0.42);};
  dec(g,rs,1.1,1.1,[s*(1.75+0.07)+s*0.13,1.75,6.9],[0,s*PI/2,-s*0.1]);dec(g,rs,1.4,1.4,[s*4.0,0.37,3.1],[-PI/2,0,0]);
  dec(g,stencil('10','#2e5aa8','bold 190px Arial'),0.8,0.42,[s*0.66,0.3,-5.3],[0,s*PI/2-s*0.15,0]);}
 return finish(g);}

// ================= F/A-18E SUPER HORNET  L 18.31  span 13.62  H 4.88 (navy.mil 18.5/13.68/4.87) =================
function fa18e(){const g=new T.Group();g.name='F/A-18E';
 const K=skin({base:'#8e959b',nu:14,nv:22,seed:51,rough:0.62,metal:0.2,soot:true,S:2048,camo:(x,w,h)=>{x.fillStyle='#7c848b';x.fillRect(w*0.3,0,w*0.4,h);}});
 const W=skin({base:'#868d93',nu:12,nv:12,seed:52,rough:0.62,metal:0.2,dbl:true,rep:1});
 const dark=std(0x2a2d31,0.6,0.3),inl=std(0x0c0d0e,0.95,0,{side:T.DoubleSide}),ti=std(0x6e665c,0.35,0.95),mi=std(0x1a1a1a,0.8,0.5);
 g.add(loft([[-9.15,0.02,0.02,0.1,2],[-8.9,0.2,0.2,0.1,2],[-8.2,0.4,0.42,0.12,2],[-7.2,0.55,0.6,0.16,2.2],[-6.0,0.64,0.74,0.2,2.4],[-4.8,0.72,0.82,0.18,2.6],[-3.4,0.9,0.84,0.12,2.8],[-2.0,1.2,0.86,0.05,3.2],[0,1.45,0.88,0,3.4],[2.5,1.48,0.86,-0.02,3.4],[5.0,1.4,0.76,-0.05,3.2],[7.0,1.28,0.64,-0.08,3],[8.4,1.2,0.58,-0.08,2.8],[9.0,1.18,0.56,-0.08,2.8]],K,64));
 P(g,new T.ConeGeometry(0.41,1.0,24).rotateX(-PI/2),std(0x6b7176,0.6,0.2),0,0.1,-8.65);// radome (APG-79) slightly darker
 P(g,new T.SphereGeometry(1,28,16,0,PI*2,0,PI/2),glassM(),0,0.88,-5.1).scale.set(0.52,0.6,1.7);
 P(g,new T.TorusGeometry(0.5,0.03,6,24,PI),dark,0,0.9,-5.9);
 P(g,new T.CapsuleGeometry(0.42,5,6,16).rotateX(PI/2),K,0,0.72,-0.4).scale.set(1,0.5,1);// dorsal spine
 for(const s of[1,-1]){// rectangular "caliper" intakes (E/F), angled
  P(g,new T.PlaneGeometry(0.9,1.0),inl,s*1.45,-0.3,-2.6,0,s*0.25,0);P(g,new T.BoxGeometry(0.1,1.1,1.6),K,s*1.95,-0.3,-2.0,0,s*0.15,0);
  // LEX big, wing (LE sweep ~ 28deg with dogtooth), span 13.62
  const lex=[[0.6,-6.6],[1.05,-4.0],[1.75,-2.0],[2.2,-0.6],[0.6,-0.6]];g.add((m=>{m.position.set(0,0.36,0);return m;})(surf(s>0?lex:mx(lex),0.08,W)));
  const wp=[[2.1,-0.6],[4.2,0.6],[4.25,0.85],[6.81,2.2],[6.81,3.2],[4.6,3.6],[2.1,4.2]];const w=surf(s>0?wp:mx(wp),0.22,W);w.position.y=0.32;w.rotation.z=-s*0.04;g.add(w);
  P(g,new T.BoxGeometry(0.26,0.18,3.0),dark,s*6.85,0.3,2.3);// wingtip AIM-9X rail
  if(window.MSL_MODELS&&MSL_MODELS['AIM-9X']){try{const m=MSL_MODELS['AIM-9X']();m.position.set(s*6.85,0.18,2.0);g.add(m);}catch(e){}}
  else{const a=new T.Group();a.position.set(s*6.85,0.15,2.0);g.add(a);P(a,new T.CylinderGeometry(0.0635,0.0635,3.0,12).rotateX(PI/2),std(0xe6e6e2,0.5,0.1));P(a,new T.SphereGeometry(0.0635,12,8,0,PI*2,0,PI/2).rotateX(-PI/2),std(0x80a0b0,0.05,0.5),0,0,-1.5);for(let k=0;k<4;k++)P(a,new T.BoxGeometry(0.01,0.36,0.3),std(0xe6e6e2,0.5,0.1),0,0,1.3,0,0,k*PI/2+PI/4);}
  // stabilators, twin fins canted 20deg outward
  const ht=[[1.4,5.6],[4.0,7.8],[4.0,8.8],[1.4,8.9]];g.add((m=>{m.position.set(0,0.0,0);return m;})(surf(s>0?ht:mx(ht),0.12,W)));
  const vt=fin([[3.2,0],[5.6,3.0],[6.9,3.0],[7.1,0]],0.12,W);vt.position.set(s*1.05,0.8,0);vt.rotation.z=-s*0.35;g.add(vt);
  nozzle(g,ti,mi,s*0.62,-0.1,9.4,0.5,0.47,0.9,18);
  // markings: low-vis NAVY, star&bar, modex 200, tail code NE
  const ins=(x,w,h)=>{x.fillStyle='rgba(66,72,78,0.9)';x.beginPath();x.arc(w/2,h/2,h*0.3,0,7);x.fill();x.fillRect(w/2-h*0.62,h/2-h*0.1,h*1.24,h*0.2);x.fillStyle='rgba(150,156,162,0.95)';star5(x,w/2,h/2,h*0.28);};
  dec(g,ins,1.6,0.8,[s*1.47,0.0,3.4],[0,s*PI/2,0]);dec(g,ins,1.8,0.9,[s*4.4,0.45,2.0],[-PI/2,0,0]);
  dec(g,stencil('NAVY','rgba(30,33,36,0.92)','bold 150px Arial'),2.2,0.55,[s*1.47,-0.05,0.6],[0,s*PI/2,0]);
  dec(g,stencil('200','rgba(30,33,36,0.92)','bold 170px Arial'),0.9,0.4,[s*0.66,0.18,-7.0],[0,s*PI/2-s*0.18,0]);
  dec(g,stencil('NE','rgba(30,33,36,0.9)','bold 170px Arial'),1.0,0.5,[s*(1.05+0.07)+s*1.9*0.35,0.8+2.0,6.0],[0,s*PI/2,-s*0.35]);}
 P(g,new T.CylinderGeometry(0.05,0.05,1.0,8).rotateZ(PI/2).rotateY(0.1),std(0x9aa0a6,0.3,0.8),0.55,0.65,-6.3);// retractable refuelling probe fairing
 return finish(g);}

return {mq9,shahed,su57,j20,mig29,fa18e};})();
window.ENEMY_AC=ENEMY_AC;
// ---- game hooks (guarded so the file also loads in the studio harness) ----
if(typeof drone==='function'&&typeof targets!=='undefined'){
 const POOL=['shahed','mq9','su57','shahedB','j20','mig29'];let ci=0;const _dr=drone;
 const mk=()=>{const k=POOL[ci++%POOL.length];try{const m=k==='shahedB'?ENEMY_AC.shahed(true):ENEMY_AC[k]();m.userData.enemyType=k;
  if(k==='shahed'||k==='shahedB')m.scale.setScalar(2.2);// Shahed is 3.5 m: upscale for visibility at game ranges (hit radius unchanged)
  return m;}catch(e){console.warn('enemy model',e);return _dr();}};
 drone=mk;
 for(const t of targets){if(t.kind!=='drone')continue;const n=mk();n.position.copy(t.mesh.position);n.visible=t.mesh.visible;scene.remove(t.mesh);t.mesh=n;scene.add(n);}
 {const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{for(const t of targets)if(t.kind==='drone'&&t.alive&&t.mesh.userData.prop)t.mesh.userData.prop.rotation.z+=dt*60;}catch(e){}};}}
if(typeof jet==='function'){const _j2=jet;jet=function(c,fa18,kind){if(!fa18||(kind&&kind!=='fa18'))return _j2(c,fa18,kind);let g;try{g=ENEMY_AC.fa18e();}catch(e){console.warn('fa18e',e);return _j2(c,fa18,kind);}
 try{const fl=new THREE.Group();for(const sx of[-0.62,0.62]){const f=new THREE.Mesh(new THREE.ConeGeometry(0.5,1,12).rotateX(Math.PI/2).translate(0,0,0.5),flameMat);f.position.set(sx,-0.1,9.9);fl.add(f);}g.add(fl);g.userData.flame=fl;}catch(e){}
 try{const gear=new THREE.Group();gear.visible=false;g.add(gear);g.userData.gear=gear;}catch(e){}
 try{rigJet(g,'fa18');}catch(e){}return g;};}
//GDETAIL_ENEMY-END
