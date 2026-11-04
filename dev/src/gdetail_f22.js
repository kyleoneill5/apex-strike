// ===== F-22A Raptor — fresh build traced from refs/f22 (USAF 3-view 060411-F-ZZ000-159 + USAF photo 03-042 Langley).
// Real: L 18.92 m, span 13.56 m, H 5.08 m, wing LE 42°, TE -17°, verticals canted 28°. Nose -Z, metres.
{const T=THREE,PI=Math.PI;
// ---------- skin: soft two-tone air-superiority gray (FS36170/36320 look from photo), silvery RAM sheen, panel lines w/ sawtooth doors ----------
function cvs(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
function tex(c,srgb){const t=new T.CanvasTexture(c);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.anisotropy=8;return t;}
let SK=null;
function skinTex(){if(SK)return SK;const N=2048;let sd=7;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
 // world XZ planar map: u=(x+10)/20, v=(z+10)/20  (1 px ~ 1 cm)
 const W=(x)=>(x+10)/20*N, H=(z)=>(z+10)/20*N;
 const col=cvs(N,N,(x)=>{x.fillStyle='#b3bac1';x.fillRect(0,0,N,N);
  // large soft-edged blotches in darker gray (photo: big organic patches)
  const bl=[[0,-6,1.1],[1.2,-2.5,1.4],[-1.5,-1,1.2],[3.5,1.5,1.5],[-4,2,1.6],[5.5,3.8,1.0],[-6,4.2,1.1],[0.5,3.5,1.5],[2.8,7.5,1.2],[-2.8,8,1.2],[0,6,1.0],[-0.8,-4.2,0.9],[4.6,8.6,0.8],[-4.2,8.8,0.8]];
  for(const [bx,bz,r] of bl){const g=x.createRadialGradient(W(bx),H(bz),0,W(bx),H(bz),r*N/20);g.addColorStop(0,'rgba(136,144,153,.95)');g.addColorStop(.72,'rgba(136,144,153,.85)');g.addColorStop(1,'rgba(136,144,153,0)');
   x.save();x.translate(W(bx),H(bz));x.scale(1+R()*0.6,0.7+R()*0.5);x.rotate(R()*3);x.translate(-W(bx),-H(bz));x.fillStyle=g;x.beginPath();x.arc(W(bx),H(bz),r*N/20,0,7);x.fill();x.restore();}
  for(let i=0;i<6000;i++){x.fillStyle=`rgba(${R()<.5?0:255},${R()<.5?0:255},${R()<.5?0:255},.018)`;x.fillRect(R()*N,R()*N,3+R()*14,1+R()*3);}
  // panel lines (thin, subtle), sawtooth access doors along spine & bays
  x.strokeStyle='rgba(80,86,94,.42)';x.lineWidth=1.6;
  for(const z of[-6.5,-4.6,-2.4,-0.6,1.6,3.8,6.2,7.8]){x.beginPath();x.moveTo(W(-1.85),H(z));x.lineTo(W(1.85),H(z));x.stroke();}
  for(const xx of[-1.2,-0.45,0.45,1.2]){x.beginPath();x.moveTo(W(xx),H(-6.5));x.lineTo(W(xx),H(8.5));x.stroke();}
  const saw=(x0,z0,x1,z1,n)=>{x.beginPath();for(let i=0;i<=n;i++){const t=i/n;x.lineTo(W(x0+(x1-x0)*t)+(i%2?6:-6),H(z0+(z1-z0)*t)+(i%2?6:-6));}x.stroke();};
  for(const s of[-1,1]){x.strokeRect(W(s>0?0.5:-1.3),H(-1.6),0.8*N/20,1.6*N/20);saw(s*0.5,0.2,s*1.3,0.2,7);saw(s*0.6,4.2,s*1.5,4.2,8);
   // wing panels: flaperon/aileron hinge lines, LE flap line
   x.beginPath();x.moveTo(W(s*2.0),H(4.55));x.lineTo(W(s*6.5),H(5.35));x.stroke();x.beginPath();x.moveTo(W(s*2.2),H(0.1));x.lineTo(W(s*6.6),H(4.75));x.stroke();
   x.beginPath();x.moveTo(W(s*4.4),H(4.85));x.lineTo(W(s*4.5),H(5.2));x.stroke();}
  // fasteners
  x.fillStyle='rgba(70,76,84,.35)';for(let i=0;i<4000;i++){x.beginPath();x.arc(R()*N,R()*N,1.1,0,7);x.fill();}
  // RAM edge tape: lighter strips on wing/stab LEs come from separate geometry; fuel/air-refuel receptacle door (dorsal) sawtooth
  x.strokeStyle='rgba(70,76,84,.6)';saw(-0.3,1.0,0.3,1.0,4);saw(-0.3,1.8,0.3,1.8,4);});
 const rough=cvs(512,512,(x)=>{x.fillStyle='#7a7a7a';x.fillRect(0,0,512,512);for(let i=0;i<3000;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.06})`;x.fillRect(Math.random()*512,Math.random()*512,4,2);}});
 SK={map:tex(col,true),rough:tex(rough,false)};return SK;}
const uvWorld=g=>{const p=g.attributes.position,a=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){a[i*2]=(p.getX(i)+10)/20;a[i*2+1]=1-(p.getZ(i)+10)/20;}g.setAttribute('uv',new T.BufferAttribute(a,2));return g;};
// ---------- fuselage loft (sections traced from the 3-view; s = metres from nose) ----------
const lerpT=(t,s)=>{if(s<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(s<=t[i][0]){const a=t[i-1],b=t[i],u=(s-a[0])/(b[0]-a[0]),k=u*u*(3-2*u);return a[1]+(b[1]-a[1])*k;}return t[t.length-1][1];};
const HW=[[0,0],[0.6,0.2],[1.2,0.45],[2.3,0.8],[4.0,1.25],[5.6,1.75],[6.2,1.86],[13,1.86],[15.5,1.7],[17.3,1.35],[18.3,1.0],[18.92,0.9]];// half-width at chine
const TOP=[[0,0],[0.6,0.12],[1.5,0.3],[3,0.55],[4.6,0.72],[6.5,0.8],[8.5,0.78],[11,0.62],[14,0.5],[17,0.36],[18.92,0.3]];
const BOT=[[0,0],[0.6,0.1],[1.5,0.24],[3,0.4],[4.6,0.5],[5.8,0.85],[11,0.85],[14,0.7],[17,0.42],[18.92,0.3]];
const YC=[[0,-0.05],[3,0],[6,0.02],[18.92,0.0]];
function fuselage(m){const S=90,P=[];const n=16;
 const prof=(s)=>{const w=lerpT(HW,s),t=lerpT(TOP,s),b=lerpT(BOT,s),y=lerpT(YC,s);const ins=Math.min(1,s/6);// inlet shoulders get flatter tops
  return [[w,y],[w*0.86,y+t*0.18],[w*0.62,y+t*(0.42+0.1*ins)],[w*0.36,y+t*0.8],[w*0.14,y+t*0.98],[0,y+t],[-w*0.14,y+t*0.98],[-w*0.36,y+t*0.8],[-w*0.62,y+t*(0.42+0.1*ins)],[-w*0.86,y+t*0.18],
   [-w,y],[-w*0.84,y-b*0.55],[-w*0.42,y-b*0.96],[0,y-b],[w*0.42,y-b*0.96],[w*0.84,y-b*0.55]];};
 for(let i=0;i<=S;i++){const s=18.92*Math.pow(i/S,1.12);for(const [x,y] of prof(s))P.push(x,y,s-9.46);}
 const idx=[];for(let i=0;i<S;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=a+n,d=b+n;idx.push(a,c,b,b,c,d);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setIndex(idx);
 const ng=g.toNonIndexed();ng.computeVertexNormals();uvWorld(ng);return new T.Mesh(ng,m);}// non-indexed = crisp facets (stealth shaping)
// thin bevelled planform plate in (x,z)
function plate(pts,t,m){const sh=new T.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
 const g=new T.ExtrudeGeometry(sh,{depth:t*0.4,bevelEnabled:true,bevelThickness:t*0.3,bevelSize:Math.min(0.05,t*0.5),bevelSegments:2,steps:1});g.translate(0,0,-t*0.2);g.rotateX(PI/2);uvWorld(g);g.computeVertexNormals();return new T.Mesh(g,m);}
const mir=pts=>pts.map(([x,z])=>[-x,z]);
function decalMat(W,H,f){const c=cvs(W,H,f);return new T.MeshStandardMaterial({map:tex(c,true),transparent:true,roughness:.55,metalness:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});}
function raptor(){const g=new T.Group();g.name='F-22A';const TV=[];const S=skinTex();
 const m=new T.MeshPhysicalMaterial({map:S.map,roughnessMap:S.rough,roughness:.42,metalness:.5,envMapIntensity:1.25,side:T.DoubleSide,sheen:.6,sheenRoughness:.35,sheenColor:new T.Color(0xc8d0d8),clearcoat:.15,clearcoatRoughness:.5});
 const ram=new T.MeshStandardMaterial({color:0x9aa1a8,roughness:.5,metalness:.55});
 const inner=new T.MeshStandardMaterial({color:0x0e0f11,roughness:.95,side:T.DoubleSide});
 const hot=new T.MeshStandardMaterial({color:0x5a534c,metalness:.9,roughness:.35});
 const fus=fuselage(m);g.add(fus);
 // wings: traced (root LE z-0.36 x1.84 -> tip LE z4.6 x6.78; tip TE z5.66; root TE z4.86 x2.72)
 const WG=[[1.6,-0.6],[6.78,4.05],[6.6,5.2],[2.6,4.95],[1.6,4.8]];
 for(const s of[-1,1]){const pts=s>0?WG:mir(WG).reverse();const w=plate(pts,0.14,m);w.position.y=0.02;w.rotation.z=s*0.03;g.add(w);
  const le=plate((s>0?[[1.62,-0.6],[6.78,4.05],[6.7,4.15],[1.62,-0.42]]:mir([[1.62,-0.6],[6.78,4.05],[6.7,4.15],[1.62,-0.42]]).reverse()),0.12,ram);le.position.y=0.02;le.rotation.z=s*0.03;g.add(le);}
 // horizontal stabilators (clipped diamond, traced)
 const ST=[[1.5,5.4],[4.14,6.6],[4.3,7.9],[2.5,9.25],[1.5,8.6]];
 for(const s of[-1,1]){const st=plate(s>0?ST:mir(ST).reverse(),0.1,m);st.position.y=-0.02;g.add(st);}
 // vertical tails, 28° outboard cant (rotation from horizontal 62°)
 const VT=[[0,3.66],[3.1,5.28],[3.1,6.98],[0,8.05]];
 const tailM=decalMat(512,512,(d,W,H)=>{d.textAlign='center';d.fillStyle='rgba(58,63,70,.95)';d.font='bold 220px Arial';d.fillText('FF',W/2,290);d.font='bold 50px Arial';d.fillText('AF',W*0.28,370);d.fillText('03',W*0.28,420);d.font='bold 105px Arial';d.fillText('042',W*0.6,418);
  // 1st FW emblem (stylised shield) above code
  d.beginPath();d.moveTo(W/2,40);d.lineTo(W/2+34,58);d.lineTo(W/2+28,100);d.lineTo(W/2,122);d.lineTo(W/2-28,100);d.lineTo(W/2-34,58);d.closePath();d.fill();});
 const band=decalMat(512,96,(d,W,H)=>{d.fillStyle='rgba(54,58,64,.95)';d.fillRect(0,10,W,H-20);d.fillStyle='rgba(170,175,180,.95)';d.font='bold 44px Arial';d.textAlign='center';d.fillText('LANGLEY',W/2,64);});
 for(const s of[-1,1]){const q=new T.Group();q.rotation.z=s>0?(PI/2-0.49):(PI/2+0.49);q.position.set(s*1.5,0.45,0);g.add(q);
  const f=plate(VT,0.12,m);q.add(f);const rud=plate([[0.25,7.95],[2.9,7.0],[2.9,7.2],[0.25,8.15]],0.13,ram);q.add(rud);
  const lef=plate([[0,3.66],[3.1,5.28],[3.05,5.36],[0,3.8]],0.13,ram);q.add(lef);
  const r=new T.Vector3(0,0,-s),u=new T.Vector3(1,0,0),nn=new T.Vector3().crossVectors(r,u);const B=new T.Matrix4().makeBasis(r,u,nn);
  const d=new T.Mesh(new T.PlaneGeometry(1.35,1.35),tailM);d.quaternion.setFromRotationMatrix(B);d.position.set(1.5,0,6.0).addScaledVector(nn,0.12);q.add(d);
  const bd=new T.Mesh(new T.PlaneGeometry(1.6,0.3),band);bd.quaternion.setFromRotationMatrix(B);bd.position.set(2.85,0,6.15).addScaledVector(nn,0.12);q.add(bd);}
 // caret inlets: canted trapezoid mouths, flush with the forebody shoulder (front view: inboard edge leans in at top)
 for(const s of[-1,1]){const ig=new T.Group();ig.position.set(s*1.62,-0.38,-4.55);ig.rotation.y=-s*0.55;g.add(ig);
  const sh=new T.Shape();sh.moveTo(-0.42,0.42);sh.lineTo(0.5,0.4);sh.lineTo(0.42,-0.46);sh.lineTo(-0.34,-0.42);sh.closePath();
  const face=new T.Mesh(new T.ShapeGeometry(sh),inner);face.scale.x=s;face.rotation.y=PI;ig.add(face);
  const lip=new T.Mesh(new T.TorusGeometry(0.62,0.025,4,4),ram);lip.rotation.z=PI/4;lip.scale.set(0.74,0.7,1);ig.add(lip);}
 // F119 2D thrust-vectoring nozzles: flat rectangular, upper/lower flaps with sawtooth trailing edges
 for(const s of[-1,1]){const nz=new T.Group();nz.position.set(s*0.72,0.0,9.0);g.add(nz);
  const fair=new T.CylinderGeometry(0.42,0.5,0.9,24,1,true).rotateX(-PI/2);fair.scale(1.25,0.62,1);nz.add(new T.Mesh(fair,m));
  for(const v of[-1,1]){const sh=new T.Shape();sh.moveTo(-0.52,0);sh.lineTo(0.52,0);for(let k=0;k<=6;k++){const x=0.52-k*(1.04/6);sh.lineTo(x,0.55+(k%2?-0.18:0));}sh.closePath();
   const fg=new T.ExtrudeGeometry(sh,{depth:0.04,bevelEnabled:false});fg.rotateX(PI/2);const fl=new T.Mesh(fg,m);const hp=new T.Group();hp.position.set(0,v*0.27,0.4);hp.add(fl);hp.userData.v=v;nz.add(hp);TV.push(hp);}
  for(const v of[-1,1]){const sw=new T.Mesh(new T.BoxGeometry(0.04,0.5,0.6),m);sw.position.set(v*0.52,0,0.65);nz.add(sw);}
  const lin=new T.Mesh(new T.PlaneGeometry(1.0,0.45),hot);lin.position.z=0.5;nz.add(lin);
  const thr=new T.Mesh(new T.PlaneGeometry(0.9,0.38),new T.MeshStandardMaterial({color:0x2a160c,emissive:0x5a1e08,emissiveIntensity:.6,roughness:1}));thr.position.z=0.3;nz.add(thr);}
 // single-piece frameless bubble canopy, gold ITO tint
 const cg=new T.SphereGeometry(1,48,24,0,PI*2,0,PI/2);const can=new T.Mesh(cg,new T.MeshPhysicalMaterial({color:0xd8c08a,metalness:.35,roughness:.04,clearcoat:1,clearcoatRoughness:.02,transparent:true,opacity:.55,iridescence:.35,envMapIntensity:1.5}));
 can.scale.set(0.52,0.72,1.9);can.position.set(0,0.62,-5.6);g.add(can);
 const seat=new T.Mesh(new T.BoxGeometry(0.45,0.7,0.45),new T.MeshStandardMaterial({color:0x2a2c2e,roughness:.8}));seat.position.set(0,0.85,-5.1);g.add(seat);
 const helm=new T.Mesh(new T.SphereGeometry(0.15,16,12),new T.MeshStandardMaterial({color:0x8c8f8a,roughness:.5}));helm.position.set(0,1.12,-5.25);g.add(helm);
 // markings: low-vis star-and-bar on left wing top + right wing lower; stencils
 const ins=decalMat(512,256,(d,W,H)=>{d.fillStyle='rgba(98,104,112,.92)';d.beginPath();d.arc(W/2,H/2,H*.32,0,7);d.fill();d.fillRect(W/2-H*.66,H/2-H*.11,H*1.32,H*.22);d.fillStyle='rgba(190,196,202,.95)';d.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?H*.11:H*.29;d.lineTo(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r);}d.fill();});
 const top=(mt,w,h,x,y,z,rz=0)=>{const d=new T.Mesh(new T.PlaneGeometry(w,h),mt);d.rotation.set(-PI/2,0,rz);d.position.set(x,y,z);g.add(d);return d;};
 top(ins,1.7,0.85,-4.0,0.11,2.6,0);
 {const b=top(ins,1.7,0.85,4.0,-0.02,2.6,0);b.rotation.x=PI/2;b.rotation.z=PI;}
 for(const s of[-1,1]){const d=new T.Mesh(new T.PlaneGeometry(1.1,0.55),ins);d.position.set(s*1.42,-0.15,-1.6);d.rotation.y=s*PI/2;d.rotation.z=s*0.12;g.add(d);}
 const st=(txt,c)=>decalMat(512,96,(d,W,H)=>{d.fillStyle=c;d.font='bold 56px Arial';d.textAlign='center';d.textBaseline='middle';d.fillText(txt,W/2,H/2);});
 const ns=st('NO STEP','rgba(80,86,94,.8)');for(const s of[-1,1]){top(ns,0.9,0.18,s*3.4,0.11,3.6,0);top(ns,0.7,0.15,s*2.6,-0.0,7.3,0);}
 // formation strip lights, nav lights
 const glow=new T.MeshBasicMaterial({color:0x9cff9c,transparent:true,opacity:.6});
 for(const s of[-1,1]){const f3=new T.Mesh(new T.BoxGeometry(0.04,0.02,0.7),glow);f3.position.set(s*1.75,0.12,-1.5);g.add(f3);}
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 // afterburner: flat 2D-nozzle plume (own mesh). userData.flame is left empty so the generic round-nozzle fire puffs don't spawn.
 const pm=new T.MeshBasicMaterial({color:0xffb060,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});
 const plume=new T.Group();for(const s of[-1,1])for(let k=0;k<3;k++){const p=new T.Mesh(new T.PlaneGeometry(0.85-k*0.15,3.2-k*0.6).rotateX(-PI/2).translate(0,0,1.6-k*0.3),pm);p.position.set(s*0.72,0,9.6);p.rotation.z=k*PI/3;plume.add(p);}
 g.userData.tv=TV;g.add(plume);g.userData.flame=new T.Group();g.add(g.userData.flame);g.userData.plume={grp:plume,mat:pm};
 return g;}
window.__f22=raptor;
{const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{const v=player;const tv=v&&v.mesh&&v.mesh.userData.tv;if(tv){const spd=v.vel?v.vel.length():0;const tgt=-(inp.pitch||0)*0.349;v._tv=(v._tv||0)+(tgt-(v._tv||0))*Math.min(1,dt*6);for(const h of tv)h.rotation.x=v._tv+h.userData.v*0.08;if(!v.onGround&&spd<160&&Math.abs(inp.pitch||0)>0.05){const k=(1-spd/160)*0.35*(inp.throttle||0);v.mesh.rotateX((inp.pitch||0)*k*dt);}}
 const pl=v&&v.mesh&&v.mesh.userData.plume;if(pl){const ab=Math.max(0,(inp.throttle-0.85)/0.15);pl.mat.opacity=ab*0.55*(0.85+Math.random()*0.15);pl.grp.scale.set(1,1,0.8+ab*0.6);}}catch(e){}};}
DEFS.f22={name:'F-22A Raptor',desc:'5th-gen air dominance fighter. F119 2D thrust vectoring, supercruise Mach 1.8, internal bays: AIM-120D, AIM-9X.',cls:'air',thrust:40,vstall:60,vrot:80,dragK:8e-5,col:0x7d858c,weapons:['GUN','AAM','HYPERSONIC'],maxMach:2.25};
{const _j=jet;jet=function(c,fa18,kind){if(kind==='f22')return raptor();return _j(c,fa18,kind);};}
}
