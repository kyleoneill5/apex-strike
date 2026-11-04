//GSH_GRIDFIN-BEGIN  Super Heavy steel grid fin, rebuilt from photos (refs/starship/gridfin/*.jpg).
// Drop-in for grockets.js shFin(): returns outer Group containing inner 'grFixed' group, same frame as gridLattice(4.2,3.0,..) after rotation.z=-PI/2:
//   +X = radially outward (3.0 m), Z = tangential (4.2 m wide), -Y..+Y = blade depth (0.55 m, flow direction). Root at x=0.
// Real features modelled: 45-deg diamond cell lattice of thin welded steel blades (~0.6 m cell pitch), scalloped (arched) blade edges on both faces
// which give the fin its wavy edge in photos, thick perimeter frame plates, root hinge shaft + clevis brackets and the dark boxy actuator housing.
const SH_GRIDFIN=(()=>{const T=THREE,PI=Math.PI;
 const W=4.2,HT=3.0,D=0.55,P=0.6,TB=0.022,ARC=0.11,FR=0.06;
 let mats=null;function M(){if(mats)return mats;
  // weathered dark steel: canvas roughness/colour variation (gmissiles-style canvas texture)
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#4a4d51';x.fillRect(0,0,256,256);
  for(let i=0;i<900;i++){x.fillStyle=`rgba(${Math.random()<0.5?'20,20,22':'120,110,95'},${Math.random()*0.08})`;x.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*14,1+Math.random()*4);}
  for(let i=0;i<60;i++){x.fillStyle=`rgba(90,60,35,${Math.random()*0.12})`;x.beginPath();x.arc(Math.random()*256,Math.random()*256,2+Math.random()*10,0,7);x.fill();} // heat tint / scorch
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;
  mats={blade:new T.MeshStandardMaterial({color:0xffffff,map:t,metalness:0.85,roughness:0.5,side:T.DoubleSide}),
   frame:new T.MeshStandardMaterial({color:0xd8d8d8,map:t,metalness:0.85,roughness:0.42}),
   housing:new T.MeshStandardMaterial({color:0x2b2d30,metalness:0.6,roughness:0.6}),
   shaft:new T.MeshStandardMaterial({color:0xb9bdc2,metalness:1,roughness:0.25})};return mats;}
 // one blade segment: length L along unit u (in Z-X plane of the lattice face), thickness along n, depth along Y with arched cut-outs on both faces
 function segGeo(L){const s=new T.Shape();const n=10;s.moveTo(0,-D/2);
  for(let i=1;i<=n;i++){const q=i/n;s.lineTo(q*L,-D/2+ARC*Math.sin(PI*q));}s.lineTo(L,D/2);
  for(let i=n-1;i>=0;i--){const q=i/n;s.lineTo(q*L,D/2-ARC*Math.sin(PI*q));}s.closePath();
  const g=new T.ExtrudeGeometry(s,{depth:TB,bevelEnabled:false,curveSegments:1});g.translate(0,0,-TB/2);return g.index?g.toNonIndexed():g;}
 function lattice(){ // lattice face coords: a = radial (0..HT), b = tangential (-W/2..W/2)
  const lines=[];const k=P*Math.SQRT2;
  for(const sg of[1,-1])for(let c=-W/2-HT-k;c<=W/2+HT+k;c+=k)lines.push({sg,c}); // b = sg*a + c
  const inR=(a,b)=>a>1e-4&&a<HT-1e-4&&b>-W/2+1e-4&&b<W/2-1e-4;const pos=[],nor=[],uv=[];
  for(const Ln of lines){const ts=[];// parameter = a
   for(const a of[0,HT])ts.push(a);for(const b of[-W/2,W/2])ts.push(Ln.sg*(b-Ln.c));
   for(const O of lines)if(O.sg!==Ln.sg)ts.push((O.c-Ln.c)/(Ln.sg-O.sg));
   ts.sort((p,q)=>p-q);
   for(let i=0;i<ts.length-1;i++){const a0=ts[i],a1=ts[i+1];if(a1-a0<1e-3)continue;const am=(a0+a1)/2,bm=Ln.sg*am+Ln.c;if(!inR(am,bm))continue;
    const p0=[a0,Ln.sg*a0+Ln.c],p1=[a1,Ln.sg*a1+Ln.c];const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);const g=segGeo(L);
    const ua=(p1[0]-p0[0])/L,ub=(p1[1]-p0[1])/L;// local (s,y,e) -> world: x=a, z=b, y=depth
    const pa=g.attributes.position,na=g.attributes.normal;for(let v=0;v<pa.count;v++){const s=pa.getX(v),yy=pa.getY(v),e=pa.getZ(v);
     pos.push(p0[0]+s*ua-e*ub,yy,p0[1]+s*ub+e*ua);const ns=na.getX(v),ny=na.getY(v),ne=na.getZ(v);nor.push(ns*ua-ne*ub,ny,ns*ub+ne*ua);uv.push((p0[0]+s*ua)/HT,(p0[1]+s*ub)/W);}
    g.dispose();}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return geo;}
 let LAT=null;
 function build(){const m=M();if(!LAT)LAT=lattice();const outer=new T.Group(),inner=new T.Group();inner.name='grFixed';outer.add(inner);
  const fin=new T.Group();fin.position.x=0.3;inner.add(fin);
  const lm=new T.Mesh(LAT,m.blade);lm.castShadow=lm.receiveShadow=true;fin.add(lm);
  // perimeter frame: root spar (heavy), outboard edge, two side plates, all with the same arched depth profile look
  const add=(geo,mt,x,y,z)=>{const o=new T.Mesh(geo,mt);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;fin.add(o);return o;};
  add(new T.BoxGeometry(0.16,D*1.02,W+0.12),m.frame,0.0,0,0);            // root spar
  add(new T.BoxGeometry(FR,D,W+0.12),m.frame,HT,0,0);                   // outboard edge
  for(const s of[-1,1])add(new T.BoxGeometry(HT,D,FR),m.frame,HT/2,0,s*(W/2+0.03)); // side plates
  for(const s of[-1,1])for(let i=0;i<6;i++)add(new T.BoxGeometry(0.05,0.05,0.05),m.shaft,0.5+i*0.45,s*D*0.52,W/2*0.98); // weld bosses
  // root: hinge shaft through clevis brackets, actuator housing (dark box seen above fins in High Bay photo)
  const sh=add(new T.CylinderGeometry(0.16,0.16,W*0.7,24).rotateX(PI/2),m.shaft,-0.12,0,0);
  for(const z of[-1.25,-0.42,0.42,1.25]){add(new T.BoxGeometry(0.42,0.46,0.12),m.frame,-0.14,0,z);}
  add(new T.BoxGeometry(0.85,1.65,1.75),m.housing,-0.05,-0.35,0);
  add(new T.BoxGeometry(0.9,0.08,1.8),m.frame,-0.05,0.5,0);
  for(let i=0;i<4;i++)add(new T.CylinderGeometry(0.035,0.035,0.06,10).rotateZ(PI/2),m.shaft,0.38,-0.9+i*0.35,0.7);
  return outer;}
 return{build,dims:{W,HT,D,P}};})();
window.SH_GRIDFIN=SH_GRIDFIN;
//GSH_GRIDFIN-END
