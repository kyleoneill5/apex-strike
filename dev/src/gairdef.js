//GAIRDEF-BEGIN  THAAD + David's Sling batteries: real-scale detailed models + beatable enemy air defence. Metres; vehicles face -Z; missiles nose +Y in canister.
const AIRDEF=(()=>{const T=THREE,PI=Math.PI,C={};
// ---------------- textures / materials (cached, shared) ----------------
function cvs(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
function tx(c,srgb,r=1){const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(r,r);t.anisotropy=8;return t;}
// vehicle paint: CARC/IDF base, panel seams, rivets, dust gradient, chipping
function paint(key,base,dust){if(C[key])return C[key];const W=512,H=512;
 const col=cvs(W,H,(x)=>{x.fillStyle=base;x.fillRect(0,0,W,H);for(let i=0;i<2200;i++){x.fillStyle=`rgba(${Math.random()<0.5?'0,0,0':'255,255,255'},${Math.random()*0.04})`;x.fillRect(Math.random()*W,Math.random()*H,3+Math.random()*30,2+Math.random()*12);}
  x.strokeStyle='rgba(0,0,0,0.45)';x.lineWidth=2;for(let y=0;y<H;y+=128){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}for(let u=0;u<W;u+=170){x.beginPath();x.moveTo(u,0);x.lineTo(u,H);x.stroke();}
  x.fillStyle='rgba(0,0,0,0.45)';for(let y=0;y<H;y+=128)for(let u=0;u<W;u+=14){x.beginPath();x.arc(u,y+6,1.3,0,7);x.fill();}
  const g=x.createLinearGradient(0,H*0.55,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,dust);x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<120;i++){x.fillStyle='rgba(60,55,45,0.55)';x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*4,1+Math.random()*3);}});
 const rg=cvs(256,256,(x,w,h)=>{x.fillStyle='#c4c4c4';x.fillRect(0,0,w,h);for(let i=0;i<500;i++){const v=150+Math.random()*100|0;x.fillStyle=`rgba(${v},${v},${v},0.3)`;x.fillRect(Math.random()*w,Math.random()*h,4+Math.random()*24,3+Math.random()*12);}});
 return C[key]=new T.MeshStandardMaterial({map:tx(col,true),roughnessMap:tx(rg,false),roughness:0.85,metalness:0.25});}
const S=(c,r=0.6,m=0.3)=>C['s'+c+r+m]||(C['s'+c+r+m]=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}));
const GLS=()=>C.gls||(C.gls=new T.MeshStandardMaterial({color:0x1a242c,roughness:0.06,metalness:0.9,envMapIntensity:1.6}));
const LIT=c=>C['l'+c]||(C['l'+c]=new T.MeshBasicMaterial({color:c}));
function decal(key,w,h,fn){return C['d'+key]||(C['d'+key]=(()=>{const t=tx(cvs(w,h,fn),true);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;return new T.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:0.7});})());}
const add=(g,geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
const G=(k,f)=>C['g'+k]||(C['g'+k]=f());
// missile body skin (v along length: 0 tail -> 1 nose), same scheme as gmissiles.js
function mskin(key,o){if(C['m'+key])return C['m'+key];const W=512,H=2048,Y=v=>(1-v)*H;
 const c=cvs(W,H,(x)=>{x.fillStyle=o.base;x.fillRect(0,0,W,H);for(let i=0;i<900;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.03})`;x.fillRect(Math.random()*W,Math.random()*H,8+Math.random()*40,4+Math.random()*16);}
  for(const b of o.bands||[]){x.fillStyle=b.c;x.fillRect(0,Y(b.v1),W,Y(b.v0)-Y(b.v1));}
  for(const v of o.rings||[]){x.strokeStyle='rgba(0,0,0,0.55)';x.lineWidth=3;x.beginPath();x.moveTo(0,Y(v));x.lineTo(W,Y(v));x.stroke();x.fillStyle='rgba(0,0,0,0.45)';for(let u=0;u<W;u+=W/32){x.beginPath();x.arc(u,Y(v)+8,1.8,0,7);x.fill();}}
  for(const [u0,u1,v0,v1] of o.panels||[]){x.strokeStyle='rgba(0,0,0,0.5)';x.lineWidth=2;x.strokeRect(u0*W,Y(v1),(u1-u0)*W,Y(v0)-Y(v1));}
  for(const s of o.text||[]){x.save();x.translate(s.u*W,Y(s.v));x.rotate(PI/2);x.fillStyle=s.c||'#111';x.font=`bold ${s.s||26}px "DejaVu Sans Condensed",Arial Narrow,Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(s.t,0,0);x.restore();}});
 return C['m'+key]=new T.MeshStandardMaterial({map:tx(c,true),roughness:o.r||0.45,metalness:o.m||0.25});}
// lathe a profile [[r,y]] with uv v = y/len
function lathe(prof,mat,seg=32){const pts=prof.map(([r,y])=>new T.Vector2(r,y));const g=new T.LatheGeometry(pts,seg);const L=prof[prof.length-1][1]-prof[0][1];const p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<p.count;i++)u.setY(i,(p.getY(i)-prof[0][1])/L);return new T.Mesh(g,mat);}
function fin(pts,th,mat){const s=new T.Shape(pts.map(([a,b])=>new T.Vector2(a,b)));const g=new T.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*0.4,bevelSize:th*0.4,bevelSegments:1});g.translate(0,0,-th/2);return new T.Mesh(g,mat);}

// ================= INTERCEPTORS =================
// THAAD: 6.17 m, 0.34 m booster, flared aft skirt (0.46 m), clamshell KV shroud, 4 trapezoid tail fins (stowed-span), KV with divert ports
function thaadMsl(){const g=new T.Group();const sk=mskin('thaad',{base:'#d9d9d4',rings:[0.08,0.22,0.55,0.70,0.80],bands:[{v0:0.80,v1:1,c:'#2a2c2e'},{v0:0.545,v1:0.555,c:'#c9a227'}],panels:[[0.1,0.3,0.3,0.45],[0.6,0.8,0.3,0.45],[0.4,0.6,0.6,0.68]],
  text:[{t:'THAAD',u:0.5,v:0.4,s:42,c:'#1a1a1a'},{t:'U.S. ARMY',u:0.25,v:0.62,s:22},{t:'⚠ ROCKET MOTOR',u:0.75,v:0.3,s:18,c:'#a01818'},{t:'HANDLE WITH CARE',u:0.25,v:0.25,s:16}]});
 const L=6.17;const b=lathe([[0.0,0],[0.23,0],[0.23,0.02],[0.215,0.35],[0.17,0.7],[0.17,4.1],[0.165,4.15],[0.16,4.9],[0.12,5.6],[0.06,6.05],[0.012,L]],sk,40);g.add(b);
 // nozzle + skirt flare interior
 const nz=lathe([[0.09,-0.14],[0.13,-0.06],[0.10,0.02]],S(0x3a3532,0.4,0.8),24);g.add(nz);
 for(let i=0;i<4;i++){const f=fin([[0,0],[0.22,0.12],[0.22,0.55],[0,0.75]],0.012,S(0xcfcfca,0.5,0.4));f.position.set(0,0.75,0);const p=new T.Group();p.rotation.y=i*PI/2+PI/4;f.position.x=0.17;f.rotation.y=PI/2;p.add(f);g.add(p);}
 // shroud split line (clamshell)
 for(const s of[-1,1]){const l=add(g,new T.BoxGeometry(0.006,1.1,0.006),S(0x080808,0.9,0),s*0.135,5.4,0);l.rotation.z=s*0.11;}
 // wire tunnel / raceway
 add(g,new T.BoxGeometry(0.05,3.2,0.04),sk,0,2.4,0.172);
 g.userData={len:L};return g;}
// Stunner: 4.62 m, ~0.23 m body (0.33 m booster), asymmetric 'dolphin' nose (offset EO/IR window + radome), 3 forward strakes, 3 tail fins, 2-stage
function stunnerMsl(){const g=new T.Group();const sk=mskin('stun',{base:'#e6e4dc',rings:[0.08,0.38,0.42,0.72],bands:[{v0:0.38,v1:0.42,c:'#3b5f9a'},{v0:0,v1:0.06,c:'#2b2b2b'}],panels:[[0.15,0.35,0.5,0.62],[0.65,0.85,0.5,0.62]],
  text:[{t:'STUNNER',u:0.5,v:0.55,s:38,c:'#16243e'},{t:'RAFAEL',u:0.2,v:0.2,s:20},{t:'⚠ LIVE',u:0.8,v:0.2,s:20,c:'#a01818'}]});
 const L=4.62;const b=lathe([[0,0],[0.1525,0],[0.1525,1.75],[0.12,1.95],[0.115,3.9],[0.11,4.05],[0.0,4.06]],sk,36);g.add(b);
 // dolphin nose: scaled sphere offset downward + chin EO window (asymmetric)
 const ns=add(g,new T.SphereGeometry(0.115,24,16),sk,0,4.1,0);ns.scale.set(1,4.2,1);ns.position.y=4.12;
 const nose=add(g,new T.SphereGeometry(0.11,24,16,0,PI*2,0,PI/2),sk,0,4.47,-0.02);nose.scale.set(1,1.6,0.85);
 const ch=add(g,new T.SphereGeometry(0.075,20,12),S(0x2a3e50,0.05,0.9),0,4.4,0.055);ch.scale.set(1,2.2,0.7);// EO/IR window on 'chin'
 add(g,new T.BoxGeometry(0.004,0.4,0.03),S(0x111111,0.6,0.3),0,4.32,0.08);
 const rd=add(g,new T.SphereGeometry(0.04,12,8),S(0xd0c8b8,0.6,0.1),0,4.66,-0.03);rd.scale.y=1.8;
 // 3 long body strakes + 3 movable tail fins on KV, 3 booster fins
 for(let i=0;i<3;i++){const p=new T.Group();p.rotation.y=i*2*PI/3;g.add(p);
  const st=fin([[0,0],[0.06,0.25],[0.06,1.2],[0,1.4]],0.006,sk);st.rotation.y=PI/2;st.position.set(0.112,2.3,0);p.add(st);
  const tf=fin([[0,0],[0.14,0.05],[0.14,0.22],[0,0.32]],0.008,S(0xd8d6ce,0.5,0.4));tf.rotation.y=PI/2;tf.position.set(0.115,1.98,0);p.add(tf);
  const bf=fin([[0,0],[0.2,0.08],[0.2,0.32],[0,0.45]],0.01,S(0xd8d6ce,0.5,0.4));bf.rotation.y=PI/2;bf.position.set(0.1525,0.05,0);p.add(bf);}
 add(g,new T.CylinderGeometry(0.1,0.13,0.12,20),S(0x3a3532,0.4,0.8),0,-0.06,0);
 g.userData={len:L+0.12};return g;}

// ================= VEHICLES =================
const tyre=()=>G('tyre',()=>{const g=new T.CylinderGeometry(0.62,0.62,0.48,24).rotateZ(PI/2);return g;}),hub=()=>G('hub',()=>new T.CylinderGeometry(0.34,0.34,0.5,12).rotateZ(PI/2));
const tread=()=>C.tread||(C.tread=new T.MeshStandardMaterial({color:0x161616,roughness:0.95,map:tx(cvs(64,256,(x,w,h)=>{x.fillStyle='#1b1b1b';x.fillRect(0,0,w,h);x.fillStyle='#0a0a0a';for(let y=0;y<h;y+=16){x.fillRect(0,y,w*0.45,6);x.fillRect(w*0.55,y+8,w*0.45,6);}}),true)}));
function wheels(g,zs,half,pm){for(const z of zs)for(const s of[-1,1]){add(g,tyre(),tread(),s*half,0.62,z);add(g,hub(),pm,s*(half+0.02),0.62,z);for(let k=0;k<8;k++){const a=k/8*PI*2;add(g,G('nut',()=>new T.CylinderGeometry(0.025,0.025,0.06,6).rotateZ(PI/2)),S(0x222222,0.5,0.6),s*(half+0.27),0.62+Math.sin(a)*0.22,z+Math.cos(a)*0.22);}}}
// 8x8 heavy truck chassis (HEMTT A4 style) -> returns group and frame height
function truck8(pm,cabCol,len=12.0){const g=new T.Group();const W=2.44;
 add(g,new T.BoxGeometry(1.1,0.35,len-1),S(0x1e1e1c,0.7,0.5),0,1.15,0.4);// frame rails
 // cab-forward: flat front, two-piece windshield, grille, bumper, steps, mirrors, beacons
 const cab=new T.Group();cab.position.set(0,0,-len/2+1.2);g.add(cab);
 add(cab,new T.BoxGeometry(W,1.9,2.2),pm,0,2.35,0);add(cab,new T.BoxGeometry(W*0.96,0.25,2.0),pm,0,3.4,0.05);
 for(const s of[-1,1]){const w=add(cab,new T.BoxGeometry(1.05,0.75,0.04),GLS(),s*0.58,2.85,-1.11);w.rotation.x=-0.08;add(cab,new T.BoxGeometry(0.04,0.6,1.0),GLS(),s*1.23,2.85,-0.3);
  add(cab,new T.BoxGeometry(0.06,0.5,0.25),S(0x111111,0.4,0.5),s*1.45,2.9,-1.0);add(cab,new T.CylinderGeometry(0.015,0.015,0.6,4).rotateZ(PI/2),S(0x111111,0.4,0.5),s*1.33,2.9,-1.0);
  add(cab,new T.CylinderGeometry(0.14,0.14,0.05,16).rotateX(PI/2),LIT(0xfff5d8),s*0.95,1.75,-1.13);add(cab,new T.BoxGeometry(0.4,0.3,0.15),S(0x111111,0.5,0.5),s*0.95,1.75,-1.06);
  for(let k=0;k<3;k++)add(cab,new T.BoxGeometry(0.5,0.05,0.25),S(0x2a2a2a,0.6,0.6),s*1.05,0.7+k*0.4,-0.2);
  add(cab,new T.BoxGeometry(0.03,1.3,0.9),pm,s*1.23,2.15,0.4);add(cab,new T.BoxGeometry(0.04,0.04,0.2),S(0x111111,0.4,0.5),s*1.25,2.3,0.05);}
 add(cab,new T.BoxGeometry(1.6,0.9,0.05),G('grille',()=>new T.MeshStandardMaterial({color:0x222222,roughness:0.6,metalness:0.6,map:tx(cvs(64,64,(x,w,h)=>{x.fillStyle='#333';x.fillRect(0,0,w,h);x.fillStyle='#0d0d0d';for(let y=2;y<h;y+=6)x.fillRect(2,y,w-4,3);}),true)})),0,1.95,-1.12);
 add(cab,new T.BoxGeometry(W+0.2,0.35,0.3),S(0x1e1e1c,0.6,0.5),0,1.2,-1.25);add(cab,new T.CylinderGeometry(0.12,0.12,0.12,12),LIT(0xffa020),0.8,3.6,0.6);
 add(cab,new T.CylinderGeometry(0.1,0.1,1.6,10),S(0x2a2a2a,0.5,0.6),1.15,3.4,0.9);// exhaust stack
 // fuel tank, air tanks, toolboxes, spare tyre
 add(g,new T.BoxGeometry(0.7,0.7,1.4),S(0x8f9396,0.35,0.85),-1.0,1.25,-len/2+3.4);add(g,new T.BoxGeometry(0.6,0.6,1.2),pm,1.0,1.25,-len/2+3.4);
 add(g,tyre(),tread(),0,1.85,-len/2+2.7).rotation.set(0,0,PI/2);
 wheels(g,[-len/2+1.4,-len/2+3.0,len/2-2.6,len/2-1.05],W/2-0.12,pm);
 for(const s of[-1,1])for(const z of[-len/2+2.2,len/2-1.8]){const fd=add(g,new T.BoxGeometry(0.5,0.08,1.9),S(0x1e1e1c,0.7,0.4),s*1.08,1.42,z);}
 return g;}
// ---- THAAD M1120 HEMTT launcher: 8 canisters (2x4), elevating pack, rams, outriggers ----
function thaadLauncher(){const pm=paint('tan','#b3a684','rgba(150,130,95,0.4)');const g=truck8(pm,0,10.0);
 add(g,new T.BoxGeometry(2.4,0.4,7.8),pm,0,1.5,2.0);// launcher bed
 for(const s of[-1,1])for(const z of[-1.2,5.6]){const j=add(g,new T.CylinderGeometry(0.1,0.1,1.3,10),S(0x2b2b2b,0.4,0.7),s*1.35,0.75,z);add(g,new T.CylinderGeometry(0.3,0.3,0.06,16),S(0x2b2b2b,0.5,0.6),s*1.35,0.06,z);}
 add(g,new T.BoxGeometry(1.2,1.0,1.6),pm,0,2.2,-2.6);// launcher electronics / generator
 for(const s of[-1,1])for(let k=0;k<6;k++)add(g,new T.BoxGeometry(0.02,0.7,0.06),S(0x2a2a2a,0.5,0.6),s*0.61,2.2,-3.2+k*0.24);
 const piv=new T.Group();piv.position.set(0,1.9,5.8);g.add(piv);// rear hinge
 const pack=new T.Group();piv.add(pack);
 const can=G('tcan',()=>new T.BoxGeometry(0.52,7.5,0.52));const cm=paint('tan2','#bcae8a','rgba(150,130,95,0.3)');
 const cov=decal('tcov',128,128,(x,w,h)=>{x.fillStyle='#a89a78';x.fillRect(0,0,w,h);x.strokeStyle='#6a5f48';x.lineWidth=6;x.strokeRect(6,6,w-12,h-12);x.beginPath();x.moveTo(6,6);x.lineTo(w-6,h-6);x.moveTo(w-6,6);x.lineTo(6,h-6);x.stroke();});
 const cans=[];for(let r=0;r<2;r++)for(let c=0;c<4;c++){const x=(c-1.5)*0.56,y=0.32+r*0.56;const o=add(pack,can,cm,x,y,-3.75);o.rotation.x=PI/2;const cp=add(pack,G('cvp',()=>new T.PlaneGeometry(0.5,0.5)),cov,x,y,-7.51);cp.rotation.y=PI;cans.push({x,y,cover:cp});}
 // canister end rims + cable raceway + lifting lugs (ref photo: tan 2x4 canister pack, rimmed ends)
 const rim=S(0x9d906f,0.7,0.3);for(const c of cans){for(const z of[-7.45,-0.05]){for(const [w,h,dx,dy] of [[0.56,0.04,0,0.27],[0.56,0.04,0,-0.27],[0.04,0.56,0.27,0],[0.04,0.56,-0.27,0]])add(pack,G('trim'+w+h,()=>new T.BoxGeometry(w,h,0.1)),rim,c.x+dx,c.y+dy,z);}
  for(const z of[-5.6,-1.9])add(pack,G('tband',()=>new T.BoxGeometry(0.55,0.55,0.08)),rim,c.x,c.y,z);}
 for(const s of[-1,1]){add(pack,new T.CylinderGeometry(0.04,0.04,7.2,6).rotateX(PI/2),S(0x1a1a1a,0.7,0.2),s*1.15,1.12,-3.7);for(const z of[-6.8,-0.7])add(pack,new T.BoxGeometry(0.1,0.2,0.2),S(0x2d3022,0.6,0.5),s*1.17,1.25,z);}
 // pack frame, lifting lugs, stencils
 for(const z of[-0.3,-3.7,-7.2])add(pack,new T.BoxGeometry(2.35,1.2,0.12),S(0x2d3022,0.6,0.5),0,0.6,z);
 const st=decal('tst',512,128,(x,w,h)=>{x.fillStyle='#e8e8d8';x.font='bold 46px Arial Narrow,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('DANGER  ROCKET EXHAUST',w/2,h/2);});
 for(const s of[-1,1]){const p=add(pack,new T.PlaneGeometry(3.2,0.8),st,s*1.19,0.6,-4.5);p.rotation.y=s*PI/2;}
 // hydraulic elevation rams
 const rams=[];for(const s of[-1,1]){const r=add(g,G('ram',()=>new T.CylinderGeometry(0.09,0.09,1,10)),S(0xc8ccd0,0.25,0.9),s*0.8,0,0);rams.push(r);}
 g.userData.upd=(el)=>{piv.rotation.x=el;// ram from bed (z=2) to pack underside
  for(const r of rams){const a=new T.Vector3(r.position.x,1.7,1.6),b=new T.Vector3(r.position.x,0,-3.0).applyAxisAngle(new T.Vector3(1,0,0),el).add(piv.position);const d=b.clone().sub(a);r.position.copy(a.clone().add(b).multiplyScalar(0.5));r.scale.y=d.length();r.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}};
 g.userData.upd(0);g.userData.piv=piv;g.userData.cans=cans;g.userData.pack=pack;
 const um=decal('usa',256,64,(x,w,h)=>{x.fillStyle='#1c1c14';x.font='bold 44px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('U.S. ARMY',w/2,h/2);});
 for(const s of[-1,1]){const p=add(g,new T.PlaneGeometry(1.4,0.35),um,s*1.235,2.0,-5.0);p.rotation.y=s*PI/2;}
 const tl=decal('thlab',256,64,(x,w,h)=>{x.fillStyle='#1c1c14';x.font='bold 40px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('THAAD',w/2,h/2);});{const p=add(g,new T.PlaneGeometry(0.7,0.18),tl,-0.75,1.2,-5.07);p.rotation.y=PI;}
 for(const s of[-1,1]){add(g,new T.BoxGeometry(0.3,0.15,0.05),LIT(0xb01010),s*1.0,1.2,5.02);add(g,new T.BoxGeometry(0.55,0.6,0.03),S(0x111111,0.9,0),s*1.0,0.75,4.6);}
 return g;}
// ---- AN/TPY-2 X-band radar: antenna equipment unit on trailer (9.2 m x 4 m face), EEU, CEU, PU ----
function tpy2(){const pm=paint('tan','#b3a684','rgba(150,130,95,0.4)');const g=new T.Group();
 add(g,new T.BoxGeometry(3.0,0.5,12.5),pm,0,1.2,0);for(const z of[3.6,4.9])for(const s of[-1,1]){add(g,tyre(),tread(),s*1.3,0.62,z);add(g,hub(),pm,s*1.32,0.62,z);}
 add(g,new T.BoxGeometry(0.2,0.2,2.4),S(0x1e1e1c,0.6,0.6),0,0.9,-7.3);
 for(const s of[-1,1])for(const z of[-5.5,5.5]){add(g,new T.BoxGeometry(1.6,0.15,0.2),S(0x2b2b2b,0.5,0.6),s*1.9,0.9,z);add(g,new T.CylinderGeometry(0.08,0.08,1,8),S(0x2b2b2b,0.4,0.7),s*2.6,0.5,z);add(g,new T.CylinderGeometry(0.28,0.28,0.05,12),S(0x2b2b2b,0.5,0.6),s*2.6,0.03,z);}
 const ant=new T.Group();ant.position.set(0,1.5,-2.0);g.add(ant);const face=new T.Group();face.rotation.x=-0.18;ant.add(face);
 const tm=G('tile',()=>new T.MeshStandardMaterial({color:0xffffff,roughness:0.55,metalness:0.3,map:tx(cvs(512,256,(x,w,h)=>{x.fillStyle='#565a48';x.fillRect(0,0,w,h);for(let i=0;i<32;i++)for(let j=0;j<16;j++){const v=78+Math.random()*10|0;x.fillStyle=`rgb(${v},${v+3},${v-8})`;x.fillRect(i*16+1,j*16+1,14,14);}x.strokeStyle='#2c2e24';x.lineWidth=2;for(let i=0;i<=w;i+=64){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}for(let j=0;j<=h;j+=64){x.beginPath();x.moveTo(0,j);x.lineTo(w,j);x.stroke();}}),true)}));
 add(face,new T.BoxGeometry(4.4,2.6,1.2),pm,0,1.3,0.6);add(face,new T.BoxGeometry(8.4,0.9,2.2),pm,0,-0.2,1.6);const fp=add(face,new T.PlaneGeometry(4.2,2.4),tm,0,1.3,-0.01);fp.rotation.y=PI;fp.rotation.y=0;fp.position.z=-0.02;fp.scale.x=-1;
 add(face,new T.BoxGeometry(4.6,0.18,0.3),pm,0,2.62,-0.05);add(face,new T.BoxGeometry(4.6,0.18,0.3),pm,0,-0.02,-0.05);
 for(const x of[-1.6,1.6]){add(face,new T.BoxGeometry(0.3,0.3,3),S(0x2d3022,0.6,0.5),x,1.0,2.2);}
 // electronics (EEU) + cooling (CEU) + prime power (PU) shelters behind
 const sh=(x,z,w,l,lab)=>{const s=new T.Group();s.position.set(x,0,z);g.add(s);add(s,new T.BoxGeometry(w,2.4,l),pm,0,2.6,0);add(s,new T.BoxGeometry(w+0.1,0.1,l+0.1),S(0x2d3022,0.6,0.5),0,3.85,0);
  for(let k=0;k<4;k++)add(s,new T.BoxGeometry(0.05,1.6,0.4),S(0x1e1e1c,0.6,0.5),w/2+0.01,2.6,-l/2+0.6+k*0.7);return s;};
 const eeu=sh(0,4.0,2.6,3.5);const ceu=new T.Group();ceu.position.set(6.2,0,3);g.add(ceu);add(ceu,new T.BoxGeometry(2.4,2.2,5),pm,0,1.1,0);for(let k=0;k<3;k++){add(ceu,new T.CylinderGeometry(0.55,0.55,0.12,20),S(0x222222,0.5,0.5),0,2.27,-1.5+k*1.5);add(ceu,new T.BoxGeometry(1.0,0.03,0.08),S(0x444444,0.5,0.6),0,2.35,-1.5+k*1.5);}
 for(let k=0;k<6;k++)add(g,new T.CylinderGeometry(0.06,0.06,8,6).rotateZ(PI/2),S(0x111111,0.9,0),3.2,0.05,-1+k*0.12).scale.set(1,0.75,1);// cable runs
 g.userData.ant=ant;return g;}
// support: HEMTT with ISO shelter (fire-control / comms) and a mast antenna
function supportTruck(pm,lab){const g=truck8(pm,0,10.2);add(g,new T.BoxGeometry(2.44,2.3,5.6),pm,0,2.95,1.6);add(g,new T.BoxGeometry(2.5,0.12,5.7),S(0x2d3022,0.6,0.5),0,4.15,1.6);
 for(let k=0;k<3;k++)add(g,new T.BoxGeometry(0.9,0.6,0.7),S(0x8a8c80,0.5,0.4),0.6,4.5,-0.2+k*1.6);add(g,new T.CylinderGeometry(0.05,0.08,7,8),S(0x2a2a2a,0.5,0.6),-0.9,7.6,3.8);add(g,new T.SphereGeometry(0.35,14,10),S(0xe0e0d8,0.5,0.1),-0.9,11.2,3.8);
 add(g,new T.BoxGeometry(0.04,1.8,0.9),pm,1.23,2.6,3.6);const p=add(g,new T.PlaneGeometry(2.2,0.5),decal('sup'+lab,512,128,(x,w,h)=>{x.fillStyle='#1c1c14';x.font='bold 54px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(lab,w/2,h/2);}),1.235,3.6,1.6);p.rotation.y=PI/2;return g;}
// ---- David's Sling MML: 8x8 truck, 12-canister (2x6) launcher erected near-vertical ----
function mml(){const pm=paint('idf','#8a8466','rgba(150,130,95,0.45)');const g=truck8(pm,0,11.0);
 add(g,new T.BoxGeometry(2.4,0.35,6.8),pm,0,1.5,1.7);for(const s of[-1,1])for(const z of[-1.3,4.9]){add(g,new T.CylinderGeometry(0.1,0.1,1.3,10),S(0x2b2b2b,0.4,0.7),s*1.35,0.75,z);add(g,new T.CylinderGeometry(0.3,0.3,0.06,16),S(0x2b2b2b,0.5,0.6),s*1.35,0.06,z);}
 const piv=new T.Group();piv.position.set(0,1.9,5.0);g.add(piv);const pack=new T.Group();piv.add(pack);
 const cm=paint('idf2','#7f7a5e','rgba(150,130,95,0.25)');const can=G('dcan',()=>new T.BoxGeometry(0.42,5.6,0.42));
 const cov=decal('dcov',128,128,(x,w,h)=>{x.fillStyle='#6e6a50';x.fillRect(0,0,w,h);x.fillStyle='#2b2a20';x.beginPath();x.arc(w/2,h/2,w*0.38,0,7);x.fill();x.fillStyle='#8f8a6c';x.beginPath();x.arc(w/2,h/2,w*0.3,0,7);x.fill();});
 const cans=[];for(let r=0;r<2;r++)for(let c=0;c<6;c++){const x=(c-2.5)*0.44,y=0.27+r*0.46;const o=add(pack,can,cm,x,y,-2.8);o.rotation.x=PI/2;const cp=add(pack,G('dcvp',()=>new T.PlaneGeometry(0.4,0.4)),cov,x,y,-5.61);cp.rotation.y=PI;cans.push({x,y,cover:cp});}
 for(const z of[-0.2,-2.8,-5.4])add(pack,new T.BoxGeometry(2.75,1.05,0.1),S(0x5a563f,0.6,0.5),0,0.5,z);
 const st=decal('dst',512,128,(x,w,h)=>{x.fillStyle='#1a1a12';x.font='bold 48px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('קלע דוד  ·  DAVID\'S SLING',w/2,h/2);});
 for(const s of[-1,1]){const p=add(pack,new T.PlaneGeometry(3.0,0.75),st,s*1.39,0.5,-3.0);p.rotation.y=s*PI/2;}
 const rams=[];for(const s of[-1,1])rams.push(add(g,G('ram',()=>new T.CylinderGeometry(0.09,0.09,1,10)),S(0xc8ccd0,0.25,0.9),s*0.8,0,0));
 g.userData.upd=(el)=>{piv.rotation.x=el;for(const r of rams){const a=new T.Vector3(r.position.x,1.7,1.2),b=new T.Vector3(r.position.x,0,-2.4).applyAxisAngle(new T.Vector3(1,0,0),el).add(piv.position);const d=b.clone().sub(a);r.position.copy(a.clone().add(b).multiplyScalar(0.5));r.scale.y=d.length();r.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}};
 g.userData.upd(0);g.userData.piv=piv;g.userData.cans=cans;return g;}
// ---- EL/M-2084 MMR: rotating S-band AESA (~4.4 x 3 m) on 2-axle trailer + generator ----
function elm2084(){const pm=paint('olive','#4f5638','rgba(120,105,80,0.4)');const g=new T.Group();add(g,new T.BoxGeometry(2.5,0.45,7),pm,0,1.15,0);
 for(const z of[1.6,2.8])for(const s of[-1,1]){add(g,tyre(),tread(),s*1.1,0.62,z);add(g,hub(),pm,s*1.12,0.62,z);}add(g,new T.BoxGeometry(0.2,0.2,2),S(0x1e1e1c,0.6,0.6),0,0.9,-4.4);
 for(const s of[-1,1])for(const z of[-3,3])add(g,new T.CylinderGeometry(0.08,0.08,1.1,8),S(0x2b2b2b,0.4,0.7),s*1.3,0.6,z);
 add(g,new T.BoxGeometry(2.3,1.6,2.6),pm,0,2.2,1.8);for(let k=0;k<5;k++)add(g,new T.BoxGeometry(0.04,1.0,0.3),S(0x1e1e1c,0.6,0.5),1.16,2.2,0.9+k*0.45);
 const rot=new T.Group();rot.position.set(0,1.4,-1.4);g.add(rot);add(rot,new T.CylinderGeometry(0.7,0.9,0.6,24),S(0x4e4b3a,0.5,0.6),0,0.3,0);
 const ap=new T.Group();ap.position.y=0.6;ap.rotation.x=-0.22;rot.add(ap);for(const s of[-1,1])add(ap,new T.BoxGeometry(0.2,2.6,0.25),pm,s*1.0,1.1,0.4);
 const tm=G('mmr',()=>new T.MeshStandardMaterial({color:0xffffff,roughness:0.6,metalness:0.2,map:tx(cvs(256,256,(x,w,h)=>{x.fillStyle='#525a3a';x.fillRect(0,0,w,h);x.strokeStyle='#3a4028';x.lineWidth=2;for(let i=0;i<=w;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}x.fillStyle='rgba(0,0,0,0.12)';for(let i=0;i<w;i+=8)for(let j=0;j<h;j+=8)x.fillRect(i+3,j+3,2,2);}),true)}));
 add(ap,new T.BoxGeometry(3.0,4.4,0.55),pm,0,2.6,0.15);add(ap,new T.PlaneGeometry(2.9,4.3),tm,0,2.6,-0.13).rotation.y=PI;add(ap,new T.BoxGeometry(3.2,0.6,0.9),pm,0,0.3,0.2);for(const x of[-0.9,0,0.9])add(ap,new T.BoxGeometry(0.14,0.14,0.05),LIT(0xb02020),x,0.3,-0.27);
 
 g.userData.ant=rot;return g;}


// PAC-3 MSE: 5.2 m, 0.29 m dia (Lockheed Martin card); Ka radome, ACM ring (180 micro-motors), 4 large clipped-delta tail fins, 2-pulse SRM
function pac3mse(){const g=new T.Group();const sk=mskin('pac3',{base:'#e9e8e2',rings:[0.06,0.3,0.6,0.74,0.8],bands:[{v0:0.735,v1:0.745,c:'#c9a227'},{v0:0.29,v1:0.31,c:'#8a8a84'}],panels:[[0.1,0.3,0.4,0.55],[0.6,0.8,0.4,0.55]],
  text:[{t:'PAC-3 MSE',u:0.5,v:0.5,s:40,c:'#1a1a1a'},{t:'U.S. ARMY',u:0.25,v:0.66,s:22},{t:'⚠ LIVE ROCKET MOTOR',u:0.75,v:0.4,s:16,c:'#a01818'}]});
 const L=5.2;g.add(lathe([[0,0],[0.145,0],[0.145,4.15],[0.14,4.3],[0.11,4.75],[0.06,5.05],[0.012,L]],sk,40));
 // ACM section: ring of small attitude-control nozzles
 const nm=S(0x2a2a2a,0.5,0.6);for(let r=0;r<6;r++)for(let k=0;k<16;k++){const a=k/16*PI*2+r*0.2;add(g,G('acm',()=>new T.CylinderGeometry(0.012,0.012,0.012,6).rotateZ(PI/2)),nm,Math.cos(a)*0.146,4.0+r*0.035,Math.sin(a)*0.146).rotation.y=-a;}
 add(g,new T.CylinderGeometry(0.1,0.13,0.1,20),S(0x3a3532,0.4,0.8),0,-0.05,0);
 for(let i=0;i<4;i++){const p=new T.Group();p.rotation.y=i*PI/2+PI/4;g.add(p);const f=fin([[0,0],[0.3,0.06],[0.3,0.35],[0,0.62]],0.012,S(0xdcdcd6,0.5,0.4));f.rotation.y=PI/2;f.position.set(0.145,0.08,0);p.add(f);}
 g.userData={len:L};return g;}
// Tamir: 3 m, 0.16 m dia, 90 kg; EO seeker nose, 4 forward canards + 4 tail fins
function tamir(){const g=new T.Group();const sk=mskin('tamir',{base:'#d8d6cc',rings:[0.1,0.45,0.75],bands:[{v0:0.5,v1:0.53,c:'#2f5fa8'}],text:[{t:'TAMIR',u:0.5,v:0.35,s:40,c:'#16243e'},{t:'RAFAEL',u:0.25,v:0.62,s:20}]});
 g.add(lathe([[0,0],[0.08,0],[0.08,2.45],[0.07,2.7],[0.04,2.9],[0.01,3.0]],sk,32));const w=add(g,new T.SphereGeometry(0.03,12,8),S(0x203040,0.05,0.9),0,2.9,0);w.scale.y=1.6;
 for(let i=0;i<4;i++){const p=new T.Group();p.rotation.y=i*PI/2+PI/4;g.add(p);const c=fin([[0,0],[0.07,0.03],[0.07,0.1],[0,0.16]],0.006,sk);c.rotation.y=PI/2;c.position.set(0.08,2.3,0);p.add(c);
  const t=fin([[0,0],[0.14,0.04],[0.14,0.2],[0,0.3]],0.008,S(0xcfcdc4,0.5,0.4));t.rotation.y=PI/2;t.position.set(0.08,0.04,0);p.add(t);}
 g.userData={len:3.0};return g;}
// Patriot M903 with PAC-3 MSE one-packs: reuse glaunchers.js M903 (tractor/trailer/erector), swap PAC-2 canisters for 12 MSE canisters (2 stacks x 6)
function patriotMSE(){const g=LAUNCHERS.patriot({desert:0,elev:0.65});let E=null;g.traverse(o=>{if(o.name==='tu')E=o;});
 const tanM=paint('mse','#c2b48e','rgba(140,120,85,0.35)');const cans=[];
 if(E){for(const c of [...E.children])E.remove(c);const pack=new T.Group();pack.position.set(0,0,-6.3);E.add(pack);
  const cov=decal('msec',128,128,(x,w,h)=>{x.fillStyle='#b5a780';x.fillRect(0,0,w,h);x.fillStyle='#4d6fa3';x.fillRect(0,h*0.42,w,h*0.16);x.strokeStyle='#5d5440';x.lineWidth=6;x.strokeRect(5,5,w-10,h-10);});
  const st=decal('msest',512,96,(x,w,h)=>{x.fillStyle='#1a1a14';x.font='bold 40px Arial Narrow,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('GUIDED MISSILE  PAC-3 MSE',w/2,h/2);});
  for(let i=0;i<2;i++)for(let r=0;r<3;r++)for(let k=0;k<2;k++){const x=(i?0.62:-0.62)+(k-0.5)*0.5,y=0.45+r*0.5;add(pack,G('msecan',()=>new T.BoxGeometry(0.46,0.46,6.0)),tanM,x,y,0);
   for(let q=0;q<5;q++)add(pack,G('mserib',()=>new T.BoxGeometry(0.5,0.5,0.06)),tanM,x,y,-2.6+q*1.3);const cp=add(pack,G('msecp',()=>new T.PlaneGeometry(0.44,0.44)),cov,x,y,-3.01);cp.rotation.y=PI;cans.push({x,y:y+0.0,z:-9.4,cover:cp});
   if(r===2){const p=add(pack,new T.PlaneGeometry(2.6,0.45),st,x,y+0.235,-0.5);p.rotation.x=-PI/2;p.visible=k===0;}}
  add(pack,new T.BoxGeometry(2.6,0.18,6.0),S(0x3d4433,0.6,0.5),0,0.12,0);for(const s of[-1,1])add(pack,new T.BoxGeometry(0.12,1.6,0.25),S(0x3d4433,0.6,0.5),s*1.3,1.0,2.9);}
 const piv=E||new T.Group();g.userData.upd=(el)=>{};g.userData.piv=piv;g.userData.cans=cans;return g;}
// ECS: engagement control station shelter on FMTV-class truck (reuse support truck)
function ecs(pm){return supportTruck(pm,'ECS');}
// Iron Dome MFU: stationary frame launcher, 4 tan boxes x 5 Tamir (20), tilt ~70 deg, blue bands, telescopic antenna mast, electronics cabinet, 4 jacks
function ironDome(){const pm=paint('idt','#b9ab84','rgba(140,120,85,0.35)');const g=new T.Group();const dk=S(0x3a3a36,0.5,0.6),st=S(0xc8ccd0,0.25,0.9);
 // skid base: 2 long I-beams, cross members, diagonal braces, 4 outrigger jacks with pads (ref: RamatDavid photo)
 for(const s of[-1,1]){add(g,new T.BoxGeometry(0.22,0.34,7.6),pm,s*1.05,0.55,0);add(g,new T.BoxGeometry(0.3,0.05,7.6),pm,s*1.05,0.73,0);add(g,new T.BoxGeometry(0.3,0.05,7.6),pm,s*1.05,0.37,0);}
 for(let k=0;k<7;k++)add(g,new T.BoxGeometry(2.1,0.18,0.14),pm,0,0.55,-3.6+k*1.2);
 for(let k=0;k<6;k++){const d=add(g,new T.BoxGeometry(1.9,0.07,0.07),pm,0,0.6,-3.0+k*1.2);d.rotation.y=(k%2?1:-1)*0.45;}
 for(const s of[-1,1])for(const z of[-3.6,3.6]){add(g,new T.BoxGeometry(0.7,0.16,0.16),pm,s*1.4,0.55,z);add(g,new T.CylinderGeometry(0.12,0.12,0.8,12),dk,s*1.72,0.42,z);add(g,new T.CylinderGeometry(0.07,0.07,0.5,10),st,s*1.72,0.1,z);add(g,new T.BoxGeometry(0.5,0.05,0.5),dk,s*1.72,0.02,z);}
 // rear electronics cabinet with louvres, door handles, red beacon, side box
 const cab=new T.Group();cab.position.set(0.3,0.75,3.0);g.add(cab);add(cab,new T.BoxGeometry(1.5,2.3,1.2),pm,0,1.15,0);add(cab,new T.BoxGeometry(1.56,0.08,1.26),pm,0,2.32,0);
 for(let k=0;k<10;k++)add(cab,new T.BoxGeometry(0.9,0.025,0.03),S(0x5a5240,0.6,0.4),0,1.2+k*0.08,-0.62);
 for(const x of[-0.38,0.38]){add(cab,new T.BoxGeometry(0.7,1.9,0.02),S(0xa89a74,0.8,0.2),x,1.05,0.61);add(cab,new T.BoxGeometry(0.04,0.2,0.04),dk,x+(x<0?0.28:-0.28),1.1,0.63);}
 add(cab,new T.CylinderGeometry(0.08,0.09,0.2,12),LIT(0xd02020),0.5,2.46,0.3);add(cab,new T.BoxGeometry(0.9,0.9,0.6),pm,-0.9,0.45,0.2);add(cab,new T.BoxGeometry(0.4,0.3,0.05),S(0xd8d0b0,0.7,0.1),0.4,1.9,-0.62);
 // telescopic antenna mast (left front) with spiral cable + top antenna
 const mx=-1.8,mz=-2.6;for(let k=0;k<4;k++)add(g,new T.CylinderGeometry(0.11-k*0.02,0.12-k*0.02,2.6,12),st,mx,1.4+k*2.4,mz);add(g,new T.BoxGeometry(0.3,0.5,0.3),dk,mx,0.9,mz);add(g,new T.BoxGeometry(0.7,0.12,0.2),pm,-1.45,0.55,mz);
 {const pts=[];for(let i=0;i<=240;i++){const t=i/240,a=t*PI*2*22;pts.push(new T.Vector3(mx+Math.cos(a)*0.16,1.2+t*8.6,mz+Math.sin(a)*0.16));}add(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),480,0.015,4),S(0x1a1a1a,0.6,0.2));}
 add(g,new T.BoxGeometry(0.8,0.06,0.06),dk,mx,10.0,mz);add(g,new T.CylinderGeometry(0.01,0.01,0.8,4),dk,mx,10.4,mz);
 // launcher pack: 4 separate ribbed boxes (5 Tamir each), hinge at rear, raised ~70 deg
 const piv=new T.Group();piv.position.set(0,1.0,-0.6);g.add(piv);const pack=new T.Group();piv.add(pack);
 const bm=paint('idt2','#c3b58e','rgba(140,120,85,0.3)');const cans=[];const rib=S(0xa99c78,0.7,0.3);
 for(let c=0;c<4;c++){const x=(c-1.5)*0.62;add(pack,G('idbox',()=>new T.BoxGeometry(0.56,1.3,3.6)),bm,x,0.65,-1.8);
  for(let k=0;k<7;k++)add(pack,G('idrib2',()=>new T.BoxGeometry(0.06,1.34,0.08)),rib,x,0.65,-0.2-k*0.5);// transverse ribs
  for(const s of[-1,1])add(pack,G('idrail',()=>new T.BoxGeometry(0.05,0.05,3.6)),rib,x+s*0.26,1.32,-1.8);
  for(let k=0;k<5;k++){const y=0.14+k*0.255;const cp=add(pack,G('idcp',()=>new T.PlaneGeometry(0.5,0.23)),decal('idcv',64,32,(x2,w,h)=>{x2.fillStyle='#a89a74';x2.fillRect(0,0,w,h);x2.strokeStyle='#5a5240';x2.lineWidth=3;x2.strokeRect(2,2,w-4,h-4);}),x,y,-3.61);cp.rotation.y=PI;cans.push({x,y,z:-3.8,cover:cp});}}
 add(pack,new T.BoxGeometry(2.7,0.2,0.4),S(0x8c8060,0.6,0.5),0,-0.1,-0.2);add(pack,new T.BoxGeometry(2.7,0.12,0.3),S(0x8c8060,0.6,0.5),0,-0.06,-3.4);
 // twin hydraulic rams + A-frame support
 const rams=[];for(const s of[-1,1]){rams.push(add(g,G('ram',()=>new T.CylinderGeometry(0.09,0.09,1,10)),st,s*0.85,0,0));const af=add(g,new T.BoxGeometry(0.12,1.0,0.12),pm,s*1.0,1.1,-0.6);}
 const el=1.2;const upd=()=>{piv.rotation.x=el;for(const r of rams){const a=new T.Vector3(r.position.x,0.75,1.6),b=new T.Vector3(r.position.x,-0.1,-1.8).applyAxisAngle(new T.Vector3(1,0,0),el).add(piv.position);const d=b.clone().sub(a);r.position.copy(a.clone().add(b).multiplyScalar(0.5));r.scale.y=d.length();r.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}};
 upd();g.userData.upd=upd;g.userData.piv=piv;g.userData.cans=cans;return g;}

// ================= BATTERY LOGIC (beatable) =================
const SITES=[],MSL=[],LOG=[];let lastMslKill=-99;
const thaadProto=()=>C.tp||(C.tp=thaadMsl()),stunProto=()=>C.sp||(C.sp=stunnerMsl()),pacProto=()=>C.pp||(C.pp=pac3mse()),tamProto=()=>C.tm||(C.tm=tamir());

// ---- SEMI-STRONG hit-location damage ----
function eadZoneAir(p,d){if(d>7)return{sev:'light',part:'PROXIMITY'};const m=player&&player.mesh;if(!m)return{sev:'moderate',part:'HULL'};
 const lp=m.worldToLocal(p.clone());const L=Math.max(8,(player.def&&player.def.len)||16);
 if(lp.z<-L*0.22)return{sev:'heavy',part:'COCKPIT'};if(lp.z>L*0.3)return Math.abs(lp.y)>1.6||Math.abs(lp.x)>2.4?{sev:'moderate',part:'TAIL'}:{sev:'heavy',part:'ENGINE'};
 if(Math.abs(lp.x)>2)return{sev:'moderate',part:'WING'};return d<3?{sev:'heavy',part:'FUSELAGE'}:{sev:'light',part:'GLANCING'};}
function eadZoneMsl(t,p,d){if(d>9||!t.vel)return'prox';const f=t.vel.clone().normalize();const along=p.clone().sub(t.pos).dot(f);return along>-1.5?'kill':'fins';}
{const _ri=readInput;readInput=function(dt){_ri(dt);if(player&&player.impair>0){player.impair-=dt;const k=0.55;inp.pitch*=k;inp.roll=inp.roll*k+Math.sin(simT*1.7)*0.12;inp.yaw*=k;}};}
const TYPES={thaad:{name:'THAAD battery',score:400,range:14000,mrange:6000,spd:1250,turn:0.55,rel:22,dmg:5,proto:thaadProto,launcher:thaadLauncher,radar:tpy2,el:1.4,mk:'THAAD'},
 dsling:{name:"David's Sling battery",score:350,range:10000,mrange:5000,spd:950,turn:0.75,rel:18,dmg:4,proto:stunProto,launcher:mml,radar:elm2084,el:1.45,mk:'STUNNER'},
 patriot:{name:'Patriot battery',score:350,range:9000,mrange:5000,spd:1050,turn:0.6,rel:24,dmg:5,proto:pacProto,launcher:patriotMSE,radar:()=>(typeof LAUNCHERS!=='undefined'&&LAUNCHERS.mpq65?LAUNCHERS.mpq65({}):tpy2()),el:0.65,fixed:1,mk:'PAC-3 MSE',sup:['ECS','EPP']},
 idome:{name:'Iron Dome battery',score:300,range:7000,mrange:4000,spd:700,turn:0.9,rel:14,dmg:3,proto:tamProto,launcher:ironDome,radar:elm2084,el:1.2,fixed:1,mk:'TAMIR',sup:['BMC','COMMS']}};
function mkUnit(type,role,mesh,pos,hdg){const def=TYPES[type];const u={army:1,airdef:1,type,role,kind:role==='radar'?(type==='thaad'?'AN/TPY-2 radar':'EL/M-2084 radar'):def.name,def:{name:role==='radar'?'AD radar':def.name,score:def.score},mesh,pos:pos.clone(),vel:V3(),hdg,alive:true,resp:0,phase:0};
 if(!mesh.userData.ant){let a=null;mesh.traverse(o=>{if(!a&&o.name==='ant')a=o;});mesh.userData.ant=a||new T.Object3D();}mesh.position.copy(pos);mesh.rotation.y=hdg;mesh.userData.army=1;mesh.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.userData.m0=o.material;}});scene.add(mesh);targets.push(u);return u;}
const CHAR=new T.MeshStandardMaterial({color:0x15120f,roughness:0.95,metalness:0.1});
function findSpot(L,r0,r1){const A=window.__army;for(let k=0;k<200;k++){const a=Math.random()*PI*2,r=r0+Math.random()*(r1-r0);const x=L.x+Math.cos(a)*r,z=L.z+Math.sin(a)*r;const h=terrainH(x,z);
  if(h>4&&h<400&&(!A||!A.KO||A.clearAt(x,z))&&Math.abs(terrainH(x+15,z)-h)<4&&Math.abs(terrainH(x,z+15)-h)<4)return V3(x,h,z);}for(let k=0;k<400;k++){const a=Math.random()*PI*2,r=Math.random()*L.R;const x=L.x+Math.cos(a)*r,z=L.z+Math.sin(a)*r;const h=terrainH(x,z);if(h>4)return V3(x,h,z);}return V3(L.x,Math.max(6,terrainH(L.x,L.z)),L.z);}
function addSite(type,L){const def=TYPES[type];const c=findSpot(L,L.R*0.15,L.R*0.6);const hdg=Math.random()*PI*2;
 const fw=V3(-Math.sin(hdg),0,-Math.cos(hdg)),rt=V3(Math.cos(hdg),0,-Math.sin(hdg));const at=(f,r)=>{const p=c.clone().addScaledVector(fw,f).addScaledVector(rt,r);p.y=terrainH(p.x,p.z);return p;};
 const s={type,def,L,cd:5+Math.random()*8,el:0,elT:0,lch:[],nxt:0,warned:0};
 s.radar=mkUnit(type,'radar',def.radar(),at(-30,0),hdg);
 s.l=[mkUnit(type,'launcher',def.launcher(),at(25,-14),hdg+PI),mkUnit(type,'launcher',def.launcher(),at(25,14),hdg+PI)];
 const pm=type==='thaad'?paint('tan','#b3a684','rgba(150,130,95,0.4)'):type==='patriot'?paint('od','#4c5238','rgba(110,95,70,0.4)'):paint('idf','#8a8466','rgba(150,130,95,0.45)');
 const SL=def.sup||(type==='thaad'?['TFCC','POWER']:['BMC','COMMS']);s.sup=SL.map(l=>supportTruck(pm,l));s.sup.forEach((m,i)=>{const p=at(-55,(i?1:-1)*18);m.position.copy(p);m.rotation.y=hdg+PI/2;m.userData.army=1;m.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});scene.add(m);});
 SITES.push(s);return s;}
function spawnSites(){const A=window.__army;if(!A||!A.LAND)return;const L=A.LAND;if(L[1])addSite('thaad',L[1]);if(L[2])addSite('patriot',L[2]);if(L[0])addSite('idome',L[0]);if(L[3])addSite('dsling',L[3]);if(L[4])addSite('idome',L[4]);}
// ---- interceptor flight ----
const _a=new T.Vector3(),_b=new T.Vector3(),_q=new T.Quaternion(),UP=new T.Vector3(0,1,0);
function launch(s,lu,tgt,isMsl){const ud=lu.mesh.userData;if(!ud.cans||!ud.cans.length)ud.cans=[{x:0,y:1,z:-9,cover:{visible:true}}];const free=ud.cans.filter(c=>c.cover.visible);if(!free.length){ud.cans.forEach(c=>c.cover.visible=true);}// reload pack
 const cn=(free.length?free:ud.cans)[(Math.random()*(free.length||ud.cans.length))|0];cn.cover.visible=false;
 lu.mesh.updateMatrixWorld(true);const o=new T.Vector3(cn.x,cn.y,cn.z??-7.3).applyMatrix4(ud.piv.matrixWorld);const dir=new T.Vector3(0,0,-1).transformDirection(ud.piv.matrixWorld);
 if(dir.y<0.3){dir.y=0.6;dir.normalize();}o.y=Math.max(o.y,terrainH(o.x,o.z)+4);const m=s.def.proto().clone();m.scale.setScalar(1.6);// slight upscale for visibility at distance (real proportions kept)
 scene.add(m);const M={s,m,p:o.clone(),v:dir.clone().multiplyScalar(40),dir:dir.clone(),t:0,tgt,isMsl,life:22,spd:s.def.spd,turn:s.def.turn};MSL.push(M);
 // launch FX: hot-launch flash, ground dust ring, white exhaust bloom; sound
 for(let k=0;k<26;k++)smoke.spawn(o.clone().add(V3(rnd(3),rnd(1),rnd(3))),rnd(14),Math.random()*4,rnd(14),3+Math.random()*3,4,16,0.92,0.9,0.86,0.75);
 for(let k=0;k<10;k++)fire.spawn(o,rnd(6),rnd(6),rnd(6),0.25,4,1,1,0.75,0.35,1);
 if(typeof sfx==='function')sfx('missile',0.7);
 if(!isMsl&&simT-s.warned>6){s.warned=simT;msg('⚠ '+s.def.mk+' LAUNCH — BREAK TURN!',2.2);}return M;}
function updMsl(dt){const P=player&&player.mesh?player.mesh.position:null;
 for(let i=MSL.length-1;i>=0;i--){const M=MSL[i];M.t+=dt;M.life-=dt;let dead=M.life<=0;const tg=M.isMsl?(M.tgt&&projs.includes(M.tgt)?M.tgt.pos:null):P;
  // boost 0-4s accelerate; then coast with slow decel; guidance after 0.6 s; turn rate limited => dodgeable
  const sp=M.t<4?40+(M.spd-40)*Math.min(1,M.t/4):Math.max(M.spd*0.55,M.spd-(M.t-4)*25);
  if(tg&&M.t>0.6){_a.copy(tg).sub(M.p);if(!M.isMsl&&player.vel)_a.addScaledVector(player.vel,Math.min(3,_a.length()/sp)*0.6);_a.normalize();
   const ang=M.dir.angleTo(_a);const mx=M.turn*dt*(M.t<4?0.6:1);if(ang>1e-4){_b.crossVectors(M.dir,_a).normalize();M.dir.applyAxisAngle(_b,Math.min(ang,mx));}
   if(ang>1.4&&M.t>3)M.tgt=null;}// overshoot => lose lock
  M.p.addScaledVector(M.dir,sp*dt);_q.setFromUnitVectors(UP,M.dir);M.m.quaternion.copy(_q);M.m.position.copy(M.p);
  // exhaust: bright core + long white trail (booster), thinner after burnout
  if(M.t<4){fire.spawn(_a.copy(M.p).addScaledVector(M.dir,-6),0,0,0,0.08,2.6,0.5,1,0.8,0.45,1);smoke.spawn(_a.copy(M.p).addScaledVector(M.dir,-8),rnd(1),rnd(1),rnd(1),4+Math.random()*2,2.5,7,0.93,0.93,0.92,0.7);}
  else if(Math.random()<0.5)smoke.spawn(_a.copy(M.p).addScaledVector(M.dir,-6),0,0,0,2,1.2,3,0.85,0.85,0.85,0.35);
  if(tg){const d=M.p.distanceTo(tg);
   if(M.isMsl&&d<18){// zone hit vs player missile: warhead/guidance = kill, fins = deflected, proximity = light
    const z=eadZoneMsl(M.tgt,M.p,d);explosion(M.p.clone(),z==='kill'?0.9:0.5);
    if(z==='kill'){M.tgt.life=-1;M.tgt.pos.y=-1e4;for(let k=0;k<14;k++)fire.spawn(M.p,rnd(40),rnd(40),rnd(40),0.4,3,0,1,1,0.95,1);msg('✖ MISSILE KILLED: WARHEAD/GUIDANCE HIT ('+M.s.def.mk+')',1.8);}
    else if(z==='fins'){M.tgt.vel.applyAxisAngle(V3(0,1,0),rnd(0.35)).y+=rnd(25);M.tgt.finDmg=6;msg('⚠ FINS DAMAGED - STEERING IMPAIRED',1.5);}
    else msg('PROXIMITY BURST - MISSILE OK',1.2);dead=true;}
   else if(!M.isMsl&&d<16&&player.alive!==false){const z=eadZoneAir(M.p,d);const k={heavy:12,moderate:4,light:1}[z.sev];eadHit(M.s.def.dmg*k,M.s.def.mk+' · '+z.part);if(z.sev==='moderate'){player.impair=8;}explosion(M.p.clone(),0.8);dead=true;}}
  if(M.t>2.5&&M.p.y<terrainH(M.p.x,M.p.z)){explosion(M.p.clone(),0.7);dead=true;}
  if(M.life<=0&&!dead){explosion(M.p.clone(),0.5);dead=true;}// self-destruct
  if(dead){LOG.push([M.why||'',M.t.toFixed(1),M.p.y|0,terrainH(M.p.x,M.p.z)|0,M.life.toFixed(1)]);if(LOG.length>20)LOG.shift();scene.remove(M.m);MSL.splice(i,1);}}}
function wreck(u){u.wrecked=true;u.mesh.visible=true;u.mesh.traverse(o=>{if(o.isMesh)o.material=o.material.transparent?o.material:CHAR;});for(let k=0;k<25;k++)fire.spawn(u.pos,rnd(14),6+Math.random()*16,rnd(14),1+Math.random(),2,3,1,0.55,0.2,1);u.burn=25;}
function revive(u){u.alive=true;u.wrecked=false;u.mesh.visible=true;u.mesh.traverse(o=>{if(o.isMesh)o.material=o.userData.m0;});}
function upd(dt){if(paused)return;const P=player&&player.mesh?player.mesh.position:null;const air=player&&player.def&&(player.def.cls==='air'||player.def.cls==='heli');
 for(const s of SITES){
  for(const u of[s.radar,...s.l]){if(!u.alive&&!u.wrecked){wreck(u);u.resp=120;}if(u.wrecked){u.resp-=dt;if(u.burn>0){u.burn-=dt;if(Math.random()<dt*10)fire.spawn(u.pos.clone().setY(u.pos.y+2),rnd(1.5),3+Math.random()*3,rnd(1.5),0.6,2,4,1,0.5,0.15,1);if(Math.random()<dt*6)smoke.spawn(u.pos.clone().setY(u.pos.y+4),2,6,0,5,4,18,0.12,0.11,0.1,0.75);}if(u.resp<=0)revive(u);}}
  const near=P&&P.distanceTo(s.radar.pos)<20000;const ant=s.radar.mesh.userData.ant;if(near&&s.radar.alive&&ant)ant.rotation.y+=dt*(s.type==='dsling'?1.6:0.25*Math.sin(simT*0.3));
  s.cd-=dt;let want=0;
  if(s.radar.alive&&P){// threats: player missiles near the site (modest rate) or player aircraft in range
   let tgt=null,isMsl=false;
   if(simT-lastMslKill>9&&s.cd<s.def.rel*0.7){for(const o of projs){if(!o.pos||!['missile','moab','ballistic','nuke','aam','hyper','sam','cruise'].includes(o.type)&&!(o.mesh&&o.type!=='bullet'&&o.type!=='rocket'&&o.type!=='torpedo')||MSL.some(M=>M.tgt===o))continue;if(o.pos.distanceTo(s.radar.pos)<s.def.mrange&&o.pos.y>30){tgt=o;isMsl=true;break;}}}
   if(!tgt&&air&&P.y>150&&P.distanceTo(s.radar.pos)<s.def.range&&!MSL.some(M=>!M.isMsl))tgt=player;
   s.dbg={air,tgt:!!tgt,cd:s.cd,el:s.el,ra:s.radar.alive};s.trk=tgt?(s.trk||0)+dt:0;if(tgt){want=s.def.el;const lu=s.l.find(l=>l.alive);if(lu&&s.trk>3&&s.el>s.def.el*0.92&&s.cd<=0){if(isMsl){if(Math.random()<0.4)launch(s,lu,tgt,true);lastMslKill=simT;s.cd=6;}else{launch(s,lu,null,false);s.cd=s.def.rel;}}}}
  if(s.def.fixed){s.el=s.def.el;}else if(near||s.el>0.001){s.elT=want;s.el+=(s.elT-s.el)*Math.min(1,dt*0.35);for(const l of s.l)if(l.alive)l.mesh.userData.upd(s.el);}}
 updMsl(dt);}
{const _gh=window.gameHook;window.gameHook=function(dt){_gh&&_gh(dt);try{upd(dt);}catch(e){console.error('airdef',e);}};}
try{spawnSites();}catch(e){console.error('airdef spawn',e);}
return{T,LOG,SITES,MSL,TYPES,thaadMsl,stunnerMsl,pac3mse,tamir,patriotMSE,ironDome,thaadLauncher,tpy2,mml,elm2084,launch,upd};})();
window.__airdef=AIRDEF;
//GAIRDEF-END
