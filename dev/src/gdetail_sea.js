//GDETAIL_SEA-BEGIN  missile-standard detail pass: destroyer, patrol boats, submarine (+easy depth driving), airbase hangars/props/trees/ground vehicles
{const T=THREE,PI=Math.PI,DC={};
// ---------- shared canvas skins (cached, built once) ----------
function cv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;}
function tx(c,srgb,rx=1,ry=1){const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=8;return t;}
// steel plating: plate seams, weld beads, rivet rows, rust weeps, salt grime
function plating(key,base,plW,plH,rust){if(DC[key])return DC[key];const W=1024,H=512;
 const col=cv(W,H,(x)=>{x.fillStyle=base;x.fillRect(0,0,W,H);
  for(let i=0;i<1400;i++){x.fillStyle=`rgba(${Math.random()<0.5?'0,0,0':'255,255,255'},${Math.random()*0.03})`;x.fillRect(Math.random()*W,Math.random()*H,6+Math.random()*60,2+Math.random()*14);}
  x.lineWidth=2;for(let y=0;y<H;y+=plH){x.strokeStyle='rgba(0,0,0,0.42)';x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();x.strokeStyle='rgba(255,255,255,0.12)';x.beginPath();x.moveTo(0,y+2);x.lineTo(W,y+2);x.stroke();
   const off=(y/plH)%2?plW/2:0;for(let u=off;u<W;u+=plW){x.strokeStyle='rgba(0,0,0,0.38)';x.beginPath();x.moveTo(u,y);x.lineTo(u,y+plH);x.stroke();}}
  x.fillStyle='rgba(0,0,0,0.35)';for(let y=0;y<H;y+=plH)for(let u=0;u<W;u+=8){x.beginPath();x.arc(u,y+5,1.1,0,7);x.fill();}
  if(rust)for(let i=0;i<70;i++){const u=Math.random()*W,v=Math.random()*H,l=20+Math.random()*90;const g=x.createLinearGradient(0,v,0,v+l);g.addColorStop(0,`rgba(120,60,25,${0.25+Math.random()*0.3})`);g.addColorStop(1,'rgba(120,60,25,0)');x.fillStyle=g;x.fillRect(u,v,1.5+Math.random()*2.5,l);}});
 const rgh=cv(W,H,(x)=>{x.fillStyle='#909090';x.fillRect(0,0,W,H);for(let i=0;i<900;i++){const v=110+Math.random()*90|0;x.fillStyle=`rgb(${v},${v},${v})`;x.globalAlpha=0.25;x.fillRect(Math.random()*W,Math.random()*H,10+Math.random()*80,4+Math.random()*30);}x.globalAlpha=1;x.strokeStyle='#d0d0d0';x.lineWidth=3;for(let y=0;y<H;y+=plH){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}});
 const n=normalFrom(rgh,1.2,1);return DC[key]={map:tx(col,true),rough:tx(rgh,false),nrm:n};}
// bump/normal from a height canvas
function normalFrom(c,str){const w=c.width,h=c.height,s=c.getContext('2d').getImageData(0,0,w,h).data;const o=document.createElement('canvas');o.width=w;o.height=h;const ox=o.getContext('2d');const id=ox.createImageData(w,h);const H=(i,j)=>s[(((j+h)%h)*w+((i+w)%w))*4]/255;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i-1,j)-H(i+1,j))*str,dy=(H(i,j-1)-H(i,j+1))*str;const l=Math.hypot(dx,dy,1);const k=(j*w+i)*4;id.data[k]=(dx/l*0.5+0.5)*255;id.data[k+1]=(dy/l*0.5+0.5)*255;id.data[k+2]=(1/l*0.5+0.5)*255;id.data[k+3]=255;}ox.putImageData(id,0,0);return tx(o,false);}
const MATS={};function pm(key,o){return MATS[key]||(MATS[key]=new T.MeshStandardMaterial(o));}
function plMat(key,base,rx,ry,o={}){const P=plating(key,base,128,64,o.rust);const m=new T.MeshStandardMaterial(Object.assign({color:0xffffff,map:P.map.clone(),roughnessMap:P.rough.clone(),normalMap:P.nrm.clone(),normalScale:new T.Vector2(0.35,0.35),roughness:0.75,metalness:0.35},o.m||{}));for(const t of[m.map,m.roughnessMap,m.normalMap]){t.repeat.set(rx,ry);t.needsUpdate=true;}return m;}
const mesh=(g,geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
const S=(c,r=0.6,me=0.3)=>pm('s'+c+r+me,{color:c,roughness:r,metalness:me});
const GLS=pm('glass',{color:0x1c2a33,roughness:0.05,metalness:0.9,envMapIntensity:1.6});
const RUB=pm('rub',{color:0x151515,roughness:0.92,metalness:0});
const CHR=pm('chr',{color:0xcfd3d6,roughness:0.22,metalness:1});
const LIT=(c)=>MATS['l'+c]||(MATS['l'+c]=new T.MeshBasicMaterial({color:c}));
function decal(w,h,fn){const t=tx(cv(w,h,fn),true);t.wrapS=t.wrapT=T.ClampToEdgeWrapping;return new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.7,metalness:0.1,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});}
// instanced stanchion railing along a polyline (one draw call per railing set)
function railing(g,pts,h,key){const posts=[],rails=[];const m4=new T.Matrix4(),q=new T.Quaternion(),up=new T.Vector3(0,1,0);
 for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],d=b.clone().sub(a),L=d.length();const n=Math.max(1,Math.round(L/2.2));for(let k=0;k<n;k++)posts.push(a.clone().addScaledVector(d,k/n));
  for(const yy of[h,h*0.55]){q.setFromUnitVectors(up,d.clone().normalize());m4.compose(a.clone().add(b).multiplyScalar(0.5).setY(a.y+yy),q,new T.Vector3(1,L,1));rails.push(m4.clone());}}
 const pg=DC.postG||(DC.postG=new T.CylinderGeometry(0.035,0.035,1,5).translate(0,0.5,0)),rg=DC.railG||(DC.railG=new T.CylinderGeometry(0.025,0.025,1,4));
 const pi=new T.InstancedMesh(pg,S(0xb8bec2,0.5,0.7),posts.length);posts.forEach((p,i)=>{m4.compose(p,new T.Quaternion(),new T.Vector3(1,h,1));pi.setMatrixAt(i,m4);});
 const ri=new T.InstancedMesh(rg,S(0xb8bec2,0.5,0.7),rails.length);rails.forEach((m,i)=>ri.setMatrixAt(i,m));g.add(pi,ri);}

// ================= DESTROYER (Arleigh Burke Flight IIA) =================
{const _d=destroyer;let hullM,supM,deckM;
 destroyer=function(){const g=_d();
  hullM=hullM||plMat('hull','#7f8a94',14,3,{rust:true});supM=supM||plMat('sup','#86909a',6,3,{rust:true,m:{roughness:0.7}});deckM=deckM||plMat('deck','#4f565c',4,20,{m:{roughness:0.9,metalness:0.2}});
  g.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color||o.material.map)return;const h=o.material.color.getHex();
   if(h===0x7d8791){o.material=o.geometry.type==='ExtrudeGeometry'?hullM:supM;}else if(h===0x5a6168)o.material=deckM;});
  // boot-topping (black) waterline band + red antifouling under it
  for(const [y,c,hgt] of [[-0.6,0x111315,1.2]]){const b=new T.Mesh(new T.BoxGeometry(20.3,hgt,0.1),S(c,0.8,0.1));b.visible=false;g.add(b);} 
  // hull numbers both bows (white with black shadow), draft marks, navy hull letters at stern
  const num=decal(512,256,(x,w,h)=>{x.font='bold 200px "Arial Black",Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='rgba(0,0,0,.65)';x.fillText('87',w/2+8,h/2+8);x.fillStyle='#f4f4f4';x.fillText('87',w/2,h/2);});
  for(const s of[-1,1]){const p=mesh(g,new T.PlaneGeometry(9,4.5),num,s*8.3,2.2,-52);p.rotation.y=s*PI/2+s*0.12;}
  const drf=decal(64,512,(x,w,h)=>{x.fillStyle='#f0f0f0';x.font='bold 40px Arial';x.textAlign='center';for(let i=0;i<8;i++){x.fillText(String(28-i*2),w/2,30+i*62);x.fillRect(14,44+i*62,36,4);}});
  for(const s of[-1,1])for(const z of[-74,72]){const p=mesh(g,new T.PlaneGeometry(0.8,6.4),drf,s*(z<0?3.2:9.1),-1,z);p.rotation.y=s*PI/2;}
  const name=decal(1024,128,(x,w,h)=>{x.font='bold 84px Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2f2f2';x.fillText('MASON',w/2,h/2);});
  const nm=mesh(g,new T.PlaneGeometry(12,1.5),name,0,3.4,77.15);
  // deck edge safety railings + bow anchors + chain
  const rp=s=>[[0,-75],[3.4,-60],[6.8,-40],[8.6,-20],[9.6,0],[9.6,40],[9.6,76]].map(([x,z])=>new T.Vector3(s*x,6.2,z));railing(g,rp(1),1.1);railing(g,rp(-1),1.1);
  for(const s of[-1,1]){const a=mesh(g,new T.BoxGeometry(0.6,2.6,1.6),S(0x1d2023,0.6,0.6),s*4.6,3.8,-63);a.rotation.y=s*0.35;mesh(g,new T.CylinderGeometry(0.5,0.5,0.4,12),S(0x2a2e31,0.6,0.6),s*1.6,6.4,-60);}
  // RHIB davits, life-raft canister racks (instanced), Harpoon quad canisters, Mk 38 25mm, SATCOM domes, whip antennas
  {const cg=new T.CylinderGeometry(0.42,0.42,1.6,10).rotateZ(PI/2);const ci=new T.InstancedMesh(cg,S(0xeeeeec,0.5,0.1),24);const m4=new T.Matrix4();let k=0;for(const s of[-1,1])for(let i=0;i<12;i++){m4.makeTranslation(s*8.4,7.2+(i%2)*0.9,-30+Math.floor(i/2)*1.1);ci.setMatrixAt(k++,m4);}g.add(ci);}
  for(const s of[-1,1]){const hp=new T.Group();for(let i=0;i<4;i++)mesh(hp,new T.BoxGeometry(0.75,0.75,4.6),S(0x5d666e,0.6,0.4),(i%2-0.5)*0.85,Math.floor(i/2)*0.85,0);hp.rotation.x=0.26;hp.rotation.y=s*0.5;hp.position.set(s*4.2,12.6,30);g.add(hp);}
  for(const s of[-1,1]){const mk=new T.Group();mesh(mk,new T.CylinderGeometry(0.7,0.9,1.2,12),S(0x7d8791,0.6,0.4));mesh(mk,new T.CylinderGeometry(0.08,0.08,2.6,8).rotateX(PI/2),S(0x2b2e30,0.5,0.7),0,0.6,-1.4);mk.position.set(s*8,9.6,8);g.add(mk);
   const dm=mesh(g,new T.SphereGeometry(1.1,16,10,0,PI*2,0,PI/2),S(0xf2f2f2,0.4,0.05),s*2.8,39.5,6);mesh(g,new T.CylinderGeometry(1.1,1.1,0.9,16),S(0xf2f2f2,0.4,0.05),s*2.8,39,6);
   for(const z of[-20,10,40])mesh(g,new T.CylinderGeometry(0.03,0.06,9,4),S(0x222222,0.5,0.5),s*7.6,11+4.5,z);}
  // navigation lights (port red / starboard green), masthead white
  mesh(g,new T.SphereGeometry(0.22,8,6),LIT(0xff2a1a),-6.2,21,-8);mesh(g,new T.SphereGeometry(0.22,8,6),LIT(0x22ff55),6.2,21,-8);mesh(g,new T.SphereGeometry(0.2,8,6),LIT(0xffffff),0,47,-2);
  // phased-array panel frames: rivet-edged dark grey faces
  g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x6d7680)o.material=S(0x5a636b,0.55,0.5);});
  return g;};}

// ================= PATROL BOAT (Mk VI patrol-boat style, 26 m) =================
{let proto=null;
 function build(){const g=new T.Group();const hm=plMat('pbh','#6e7880',4,1,{rust:true});const dk=plMat('pbd','#3e4448',2,6,{m:{roughness:0.95}});
  // V-hull: extruded with deadrise, chine flats, red anti-fouling below water, black boot-top
  const hs=new T.Shape();hs.moveTo(-3.1,-13);hs.lineTo(3.1,-13);hs.lineTo(3.2,4);hs.quadraticCurveTo(2.4,11,0,13.5);hs.quadraticCurveTo(-2.4,11,-3.2,4);hs.closePath();
  const hg=new T.ExtrudeGeometry(hs,{depth:3.2,bevelEnabled:true,bevelThickness:0.25,bevelSize:0.25,bevelSegments:2,steps:1});hg.rotateX(PI/2);
  {const p=hg.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),z=p.getZ(i);if(y<-1.6){p.setX(i,p.getX(i)*0.45);}if(z>8&&y>-1)p.setY(i,y+(z-8)*0.08);}hg.computeVertexNormals();}
  const hull=mesh(g,hg,hm,0,1.7,0);hull.rotation.y=PI;
  mesh(g,new T.BoxGeometry(6.6,0.5,22),pm('pbred',{color:0x7a2620,roughness:0.85,metalness:0.1}),0,-1.3,0.5).scale.x=0.62;
  mesh(g,new T.BoxGeometry(6.55,0.35,25.5),pm('pbblk',{color:0x121416,roughness:0.8}),0,-0.85,0.3);
  mesh(g,new T.BoxGeometry(6.0,0.12,24),dk,0,1.78,1);
  // rubbing strake + fendering
  for(const s of[-1,1])mesh(g,new T.BoxGeometry(0.22,0.3,22),RUB,s*3.3,1.4,1);
  // deckhouse with raked windscreen, window frames, doors, wipers
  const ho=new T.Group();ho.position.set(0,1.8,2);g.add(ho);
  mesh(ho,new T.BoxGeometry(4.6,2.6,12),hm,0,1.3,2);
  const wsc=mesh(ho,new T.BoxGeometry(4.4,1.1,0.12),GLS,0,2.0,-4.15);wsc.rotation.x=-0.35;
  for(let i=-2;i<=2;i++){const f=mesh(ho,new T.BoxGeometry(0.1,1.2,0.16),S(0x2a2e31,0.5,0.6),i*1.1,2.0,-4.18);f.rotation.x=-0.35;}
  for(const s of[-1,1]){for(let k=0;k<3;k++)mesh(ho,new T.BoxGeometry(0.06,0.7,1.3),GLS,s*2.31,1.9,-2.4+k*1.5);mesh(ho,new T.BoxGeometry(0.05,1.9,0.9),S(0x5d666e,0.6,0.4),s*2.31,0.95,2.6);mesh(ho,new T.SphereGeometry(0.06,6,4),CHR,s*2.36,1.0,2.35);}
  mesh(ho,new T.BoxGeometry(4.8,0.15,12.4),hm,0,2.62,2);
  // radar mast, open-array radar, FLIR ball, whips, nav lights, searchlight
  mesh(ho,new T.CylinderGeometry(0.09,0.12,3,8),S(0x6e7880,0.5,0.5),0,4.1,1);mesh(ho,new T.BoxGeometry(2.4,0.18,0.3),S(0x1b1d1f,0.6,0.3),0,5.5,1).rotation.y=0.7;
  mesh(ho,new T.SphereGeometry(0.32,14,10),S(0x2b2e30,0.3,0.6),0,4.6,0.4);mesh(ho,new T.CylinderGeometry(0.22,0.18,0.35,12).rotateX(PI/2),CHR,1.6,2.9,-3.6);
  for(const s of[-1,1]){mesh(ho,new T.CylinderGeometry(0.02,0.04,4.5,4),S(0x1a1a1a,0.5,0.4),s*2.1,4.9,3.5);mesh(ho,new T.SphereGeometry(0.1,8,6),LIT(s<0?0xff2a1a:0x22ff55),s*2.4,2.5,-3.6);}
  // stabilised 25 mm gun forward + .50 cal mounts aft, ready-ammo boxes
  const gn=new T.Group();gn.position.set(0,1.85,-7.5);g.add(gn);mesh(gn,new T.CylinderGeometry(0.7,0.85,0.7,16),S(0x5d666e,0.5,0.5),0,0.35,0);const tu=mesh(gn,new T.BoxGeometry(1.1,0.8,1.4),S(0x5d666e,0.5,0.5),0,1.0,0);
  mesh(gn,new T.CylinderGeometry(0.06,0.08,2.6,10).rotateX(PI/2),S(0x25282a,0.4,0.8),0,1.1,-1.9);mesh(gn,new T.BoxGeometry(0.5,0.4,0.6),S(0x5c6b4a,0.7,0.2),0.75,1.0,0.2);
  for(const s of[-1,1]){const m=new T.Group();m.position.set(s*2.4,1.85,9);g.add(m);mesh(m,new T.CylinderGeometry(0.05,0.07,1.1,8),S(0x2b2e30,0.5,0.6),0,0.55,0);mesh(m,new T.BoxGeometry(0.14,0.18,1.6),S(0x1e2022,0.5,0.6),0,1.15,-0.3);mesh(m,new T.BoxGeometry(0.6,0.5,0.06),S(0x2b2e30,0.5,0.6),0,1.15,-0.35);mesh(m,new T.BoxGeometry(0.3,0.25,0.4),S(0x5c6b4a,0.7,0.2),0.18,1.0,0.1);}
  // life rafts, bollards, railings, hull number decal, flag
  for(const s of[-1,1]){mesh(g,new T.CylinderGeometry(0.35,0.35,1.2,10).rotateZ(PI/2),S(0xeeeeec,0.5,0.1),s*1.8,4.7,6);for(const z of[-10,0,11])mesh(g,new T.CylinderGeometry(0.12,0.14,0.4,8),S(0x2b2e30,0.5,0.6),s*2.7,2.05,z);}
  const rp=s=>[[0.4,-13],[2.2,-9],[3.1,-3],[3.1,12]].map(([x,z])=>new T.Vector3(s*x,1.85,z));railing(g,rp(1),0.9);railing(g,rp(-1),0.9);
  const nb=decal(256,128,(x,w,h)=>{x.font='bold 96px "Arial Black",Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#f2f2f2';x.fillText('PB 6',w/2,h/2);});
  for(const s of[-1,1]){const p=mesh(g,new T.PlaneGeometry(2.6,1.3),nb,s*3.33,0.9,-6.5);p.rotation.y=s*PI/2+s*0.1;}
  mesh(g,new T.CylinderGeometry(0.02,0.02,1.6,4),S(0x999999,0.3,0.8),0,2.6,12.6);
  const fl=decal(96,64,(x,w,h)=>{for(let i=0;i<7;i++){x.fillStyle=i%2?'#fff':'#b22234';x.fillRect(0,i*h/7,w,h/7);}x.fillStyle='#3c3b6e';x.fillRect(0,0,w*0.42,h*4/7);});fl.side=T.DoubleSide;mesh(g,new T.PlaneGeometry(0.9,0.6),fl,0,3.1,13.05).rotation.y=PI/2;
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
 boat=function(){if(!proto)proto=build();return proto.clone();};}// clone shares geometry+materials

// ================= SUBMARINE: detail + easy underwater driving =================
{const _s=sub;
 sub=function(){const g=_s();
  // white draft marks fore/aft, safety-track deck lines, hull-mounted sonar windows, bridge cockpit, sail number plate hidden (US practice), propulsor stator vanes
  const drf=decal(64,512,(x,w,h)=>{x.fillStyle='#e8e8e8';x.font='bold 40px Arial';x.textAlign='center';for(let i=0;i<8;i++){x.fillText(String(36-i*2),w/2,30+i*62);x.fillRect(14,44+i*62,36,4);}});
  for(const s of[-1,1])for(const z of[-50,50]){const p=mesh(g,new T.PlaneGeometry(0.7,5),drf,s*(z<0?3.3:2.0),0.2,z);p.rotation.y=s*PI/2;}
  const trk=pm('subtrk',{color:0x3a3f43,roughness:0.6,metalness:0.4});for(const s of[-1,1])mesh(g,new T.BoxGeometry(0.06,0.04,70),trk,s*0.6,5.12,-5);
  for(const s of[-1,1]){const w=mesh(g,new T.BoxGeometry(0.1,1.4,9),pm('sonw',{color:0x1e2a2e,roughness:0.3,metalness:0.6}),s*4.85,-1.2,10);w.rotation.z=s*0.15;}
  {const vg=new T.BoxGeometry(0.12,1.9,0.8);const vi=new T.InstancedMesh(vg,S(0x1e2124,0.7,0.3),9);const m4=new T.Matrix4(),q=new T.Quaternion();for(let i=0;i<9;i++){const a=i/9*PI*2;q.setFromAxisAngle(new T.Vector3(0,0,1),a);m4.compose(new T.Vector3(Math.sin(a)*-1.15,Math.cos(a)*1.15,58.3),q,new T.Vector3(1,1,1));vi.setMatrixAt(i,m4);}g.add(vi);}
  // bow/stern nav lights + sail-top masthead
  mesh(g,new T.SphereGeometry(0.15,8,6),LIT(0xffffff),0,13.7,-21);
  g.userData.hl=mesh(g,new T.SphereGeometry(0.25,10,8),LIT(0xfff4d0),0,-0.5,-56.5);
  return g;};
 const _u=updShip;
 updShip=function(v,dt){
  if(v&&v.def&&v.def.cls==='sub'&&!settings.advanced){// easy depth: any stick pitch dives/climbs smoothly, no 0.2 deadzone dead feel; stick released holds depth
   const p=inp.pitch;if(Math.abs(p)>0.05&&Math.abs(p)<=0.2)v.depthT=clamp(v.depthT-p*30*dt,0,450);else if(Math.abs(p)>0.2)v.depthT=clamp(v.depthT-p*18*dt,0,450);
   // faster, eased depth change (base caps at 3 m/s): pre-move toward target up to 6 m/s with easing
   const e=v.depthT-v.depth;v.depth+=clamp(e*0.9*dt,-3*dt,3*dt);
   // never lose all steering at low speed underwater
   if(v.depth>2&&Math.abs(v.spd)<3&&Math.abs(inp.roll+inp.yaw)>0.1)v.hdg-=(inp.roll+inp.yaw)*v.def.turn*0.35*dt;}
  _u(v,dt);
  if(v&&v.def&&v.def.cls==='sub'){// depth HUD readout
   if(!DC.dhud){const d=document.createElement('div');d.id='subDepth';d.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);font:600 13px -apple-system,system-ui;color:#cfe8ff;background:rgba(0,20,40,.45);padding:4px 12px;border-radius:12px;pointer-events:none;z-index:5;backdrop-filter:blur(6px)';document.body.appendChild(d);DC.dhud=d;}
   DC.dhud.style.display='';DC.dhud.textContent=`DEPTH ${v.depth.toFixed(0)} m → ${v.depthT.toFixed(0)} m · ${(v.spd*1.944).toFixed(0)} kn`;}
  else if(DC.dhud)DC.dhud.style.display='none';};}

// ================= AIRBASE: hangars, props, trees, ground vehicles =================
{const ab=scene.children.find(o=>o.isGroup&&o.children.some(c=>c.geometry&&c.geometry.type==='PlaneGeometry'&&c.geometry.parameters.height===3000));
 if(ab){// hide low-detail half-cylinder hangars and box buildings; rebuild at the same spots
  for(const c of ab.children){const p=c.geometry&&c.geometry.parameters;if(!p)continue;if(c.geometry.type==='CylinderGeometry'&&p.radiusTop===18)c.visible=false;if(c.geometry.type==='BoxGeometry'&&c.position.x>=230)c.visible=false;}
  const G=new T.Group();G.name='abDetail';scene.add(G);
  // corrugated metal (normal mapped) for hangars
  const cor=cv(256,256,(x,w,h)=>{for(let i=0;i<w;i++){const v=128+Math.sin(i/w*PI*32)*110;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,0,1,h);}});
  const corN=normalFrom(cor,3);corN.repeat.set(1,1);
  const corCol=cv(512,512,(x,w,h)=>{x.fillStyle='#8a8f86';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=16){x.fillStyle='rgba(0,0,0,0.08)';x.fillRect(i,0,8,h);}for(let i=0;i<60;i++){const u=Math.random()*w,v=Math.random()*h*0.3,l=40+Math.random()*200;const gr=x.createLinearGradient(0,v,0,v+l);gr.addColorStop(0,'rgba(90,60,30,0.35)');gr.addColorStop(1,'rgba(90,60,30,0)');x.fillStyle=gr;x.fillRect(u,v,2,l);}for(let y=0;y<h;y+=128){x.fillStyle='rgba(0,0,0,0.35)';x.fillRect(0,y,w,2);}});
  const corT=tx(corCol,true);const hangM=new T.MeshStandardMaterial({map:corT,normalMap:corN,roughness:0.55,metalness:0.6});
  const conc=cv(512,512,(x,w,h)=>{x.fillStyle='#8d8b86';x.fillRect(0,0,w,h);for(let i=0;i<6000;i++){const v=100+Math.random()*80|0;x.fillStyle=`rgba(${v},${v},${v-4},0.25)`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}x.strokeStyle='#5a5854';x.lineWidth=3;for(let i=0;i<=w;i+=128){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}for(let i=0;i<14;i++){x.fillStyle='rgba(25,22,18,0.25)';x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,10+Math.random()*30,6+Math.random()*16,Math.random()*3,0,7);x.fill();}});
  const concM=new T.MeshStandardMaterial({map:tx(conc,true,4,3),roughness:0.95});
  const doorM=new T.MeshStandardMaterial({map:tx(cv(512,256,(x,w,h)=>{x.fillStyle='#6b7068';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=64){x.fillStyle='rgba(0,0,0,0.35)';x.fillRect(i,0,3,h);x.fillStyle='rgba(255,255,255,0.12)';x.fillRect(i+3,0,2,h);}for(let y=0;y<h;y+=6){x.fillStyle='rgba(0,0,0,0.07)';x.fillRect(0,y,w,2);}x.fillStyle='#e8c21a';for(let i=0;i<w;i+=40)x.fillRect(i,h-14,20,14);}),true),roughness:0.6,metalness:0.55});
  const hangarGeo=new T.CylinderGeometry(20,20,48,32,1,true,0,PI).rotateZ(PI/2).rotateY(PI/2);// arch along x (opens toward runway)
  {const uv=hangarGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*10,uv.getY(i)*4);}
  for(let i=0;i<5;i++){const h=new T.Group();h.position.set(172,6,-600+i*300);G.add(h);
   const sh=mesh(h,hangarGeo,hangM,0,0,0);sh.material.side=T.DoubleSide;
   const back=mesh(h,new T.CircleGeometry(20,32,0,PI),S(0x7d8278,0.7,0.4),24,0,0);back.rotation.y=-PI/2;
   // front wall: header + sliding doors (half open), door tracks, number
   const fr=new T.Group();fr.position.x=-24;h.add(fr);
   const door=new T.PlaneGeometry(9.5,15);for(let k=0;k<4;k++){const d=mesh(fr,door,doorM,-0.2-(k%2)*0.4,7.5,-17+k*9.5+(k>1?6:-6));d.rotation.y=-PI/2;}
   const hdr=mesh(fr,new T.CircleGeometry(20,32,0,PI),S(0x7d8278,0.7,0.4),0.05,0,0);hdr.rotation.y=-PI/2;hdr.scale.set(1,1,1);hdr.geometry=DC.hdr||(DC.hdr=(()=>{const s=new T.Shape();s.absarc(0,0,20,0,PI);const hole=new T.Path();hole.moveTo(-19,0);hole.lineTo(19,0);hole.lineTo(19,15.5);hole.lineTo(-19,15.5);hole.closePath();s.holes.push(hole);return new T.ShapeGeometry(s,24);})());
   mesh(fr,new T.BoxGeometry(0.6,0.5,40),S(0x3b3e40,0.5,0.7),-0.3,15.6,0);mesh(fr,new T.BoxGeometry(0.6,0.15,40),S(0x2b2d2f,0.5,0.7),-0.3,0.08,0);
   const lbl=decal(512,256,(x,w,h)=>{x.fillStyle='#f2f2f2';x.font='bold 200px "Arial Black",Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(String(i+1),w/2,h/2);});const lp=mesh(fr,new T.PlaneGeometry(5,2.5),lbl,-0.65,17.7,0);lp.rotation.y=-PI/2;
   // interior dark + floodlights
   const inner=mesh(h,new T.PlaneGeometry(47,39).rotateX(-PI/2),S(0x1d1e1f,0.9,0),0,0.06,0);
   for(const z of[-12,12]){mesh(fr,new T.BoxGeometry(0.4,0.5,1),S(0x2b2d2f,0.5,0.6),-0.5,18.4,z);mesh(fr,new T.PlaneGeometry(0.8,0.3),LIT(0xfff3d0),-0.75,18.3,z).rotation.y=-PI/2;}
   // apron slab + yellow taxi lead-in + tie-down rings
   const ap=mesh(h,new T.PlaneGeometry(56,46).rotateX(-PI/2),concM,-50,0.12,0);ap.receiveShadow=true;
   const ld=mesh(h,new T.PlaneGeometry(26,0.5).rotateX(-PI/2),pm('yel',{color:0xe7c21b,roughness:0.8}),-37,0.14,0);
   h.traverse(o=>{if(o.isMesh){o.castShadow=o.material!==LIT(0xfff3d0);o.receiveShadow=true;}});}
  // ---- ops buildings (stucco, windows, AC units, signage) replacing grey boxes ----
  const win=cv(256,128,(x,w,h)=>{x.fillStyle='#c9c2b2';x.fillRect(0,0,w,h);for(let i=0;i<8;i++)for(let j=0;j<2;j++){x.fillStyle='#2a3640';x.fillRect(8+i*31,18+j*58,22,32);x.fillStyle='rgba(255,255,255,0.18)';x.fillRect(8+i*31,18+j*58,22,6);x.fillStyle='#8f887a';x.fillRect(6+i*31,50+j*58,26,3);}});
  const wM=new T.MeshStandardMaterial({map:tx(win,true),roughness:0.85});
  for(let i=0;i<8;i++){const w=30+hash(i,2)*30,hh=8+hash(i,3)*12,b=new T.Group();b.position.set(230+hash(i,1)*60,6,-900+i*240);G.add(b);
   const body=mesh(b,new T.BoxGeometry(w,hh,25),wM,0,hh/2,0);body.material=wM;mesh(b,new T.BoxGeometry(w+0.6,0.5,25.6),S(0x6e6a62,0.8,0.1),0,hh+0.25,0);
   for(let k=0;k<3;k++){mesh(b,new T.BoxGeometry(2,1.2,1.6),S(0xb9bcbc,0.5,0.5),-w/3+k*w/3,hh+1.1,4);mesh(b,new T.CylinderGeometry(0.6,0.6,0.1,12),S(0x333333,0.5,0.5),-w/3+k*w/3,hh+1.75,4);}
   mesh(b,new T.BoxGeometry(2.4,3,0.3),GLS,0,1.5,-12.6);mesh(b,new T.BoxGeometry(4,0.25,2),S(0x6e6a62,0.8,0.1),0,3.2,-13.3);
   b.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});}
  // ---- control tower upgrade: cab with mullions, catwalk, beacon ----
  {const t=new T.Group();t.position.set(150,6,500);G.add(t);mesh(t,new T.BoxGeometry(10.4,0.6,10.4),S(0x6e6a62,0.8,0.1),0,30,0);
   for(let k=0;k<8;k++){const a=k/8*PI*2;const m=mesh(t,new T.BoxGeometry(0.25,5,0.25),S(0x2b2d2f,0.4,0.7),Math.cos(a)*7.1,32.5,Math.sin(a)*7.1);}
   railing(t,[[-8,-8],[8,-8],[8,8],[-8,8],[-8,-8]].map(([x,z])=>new T.Vector3(x,30.3,z)),1.1);
   mesh(t,new T.BoxGeometry(16,0.3,16),S(0x5d5d58,0.7,0.4),0,30.15,0);mesh(t,new T.BoxGeometry(14.6,0.6,14.6),S(0x55524c,0.8,0.1),0,40.5,0);
   mesh(t,new T.CylinderGeometry(0.6,0.6,1,12),LIT(0x22ff55),0,41.5,0);mesh(t,new T.CylinderGeometry(0.05,0.05,6,4),S(0x222222,0.5,0.5),3,44,3);}
  // ---- ground vehicles: built once, cloned (shared geo/mats) ----
  const tyreG=new T.CylinderGeometry(0.55,0.55,0.4,16).rotateZ(PI/2),hubG=new T.CylinderGeometry(0.3,0.3,0.42,10).rotateZ(PI/2);
  function wheels(g,xs,zs,y=0.55){for(const x of xs)for(const z of zs){mesh(g,tyreG,RUB,x,y,z);mesh(g,hubG,S(0x9a9a94,0.4,0.7),x,y,z);}}
  function cab(g,col,w,h,l,z){const cm=S(col,0.45,0.3);mesh(g,new T.BoxGeometry(w,h,l),cm,0,0.9+h/2,z);mesh(g,new T.BoxGeometry(w-0.1,h*0.42,0.06),GLS,0,0.9+h*0.72,z-l/2-0.02);for(const s of[-1,1]){mesh(g,new T.BoxGeometry(0.06,h*0.38,l*0.5),GLS,s*(w/2+0.01),0.9+h*0.72,z-l*0.1);mesh(g,new T.BoxGeometry(0.1,0.3,0.25),S(0x111111,0.4,0.5),s*(w/2+0.25),0.9+h*0.7,z-l/2+0.2);mesh(g,new T.SphereGeometry(0.12,8,6),LIT(0xfff6e0),s*(w/2-0.3),1.15,z-l/2-0.02);}mesh(g,new T.BoxGeometry(w*0.7,0.4,0.05),S(0x222222,0.4,0.8),0,1.15,z-l/2-0.03);return cm;}
  const VEH={
   fuel(){const g=new T.Group();cab(g,0xd9d4c4,2.5,1.9,2.2,-3.6);mesh(g,new T.BoxGeometry(2.4,0.35,8.6),S(0x2a2a2a,0.6,0.5),0,0.95,0.4);const tk=mesh(g,new T.CylinderGeometry(1.2,1.2,6,24).rotateX(PI/2),pm('fuelT',{color:0xc8c9c4,roughness:0.35,metalness:0.8}),0,2.4,1.5);tk.scale.x=1.05;
    for(const z of[-1.3,1.5,4.3])mesh(g,new T.TorusGeometry(1.22,0.05,6,24),S(0x777777,0.4,0.8),0,2.4,z);mesh(g,new T.BoxGeometry(0.6,0.2,5),S(0x777777,0.4,0.8),0,3.65,1.5);
    const lb=decal(512,128,(x,w,h)=>{x.fillStyle='#c41e1e';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 70px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('JP-8  FLAMMABLE',w/2,h/2);});
    for(const s of[-1,1]){const p=mesh(g,new T.PlaneGeometry(4,1),lb,s*1.27,2.4,1.5);p.rotation.y=s*PI/2;}mesh(g,new T.CylinderGeometry(0.5,0.5,1.4,12).rotateZ(PI/2),S(0x1a1a1a,0.8,0.1),0,1.2,5.0);wheels(g,[-1.1,1.1],[-3.4,2.0,3.4]);return g;},
   tug(){const g=new T.Group();const m=S(0xe0b21a,0.5,0.3);mesh(g,new T.BoxGeometry(2.4,1.0,4.2),m,0,1.1,0);mesh(g,new T.BoxGeometry(2.2,0.3,0.6),S(0x222222,0.6,0.5),0,0.9,-2.3);mesh(g,new T.BoxGeometry(1.2,1.2,1.2),S(0x2a2a2a,0.5,0.3),0,2.2,1);mesh(g,new T.BoxGeometry(1.1,0.05,1.1),GLS,0,2.82,1);
    const st=decal(256,32,(x,w,h)=>{for(let i=-2;i<w/16;i++){x.fillStyle=i%2?'#111':'#e8c21a';x.beginPath();x.moveTo(i*16,h);x.lineTo(i*16+16,0);x.lineTo(i*16+32,0);x.lineTo(i*16+16,h);x.fill();}});mesh(g,new T.PlaneGeometry(2.4,0.3),st,0,0.8,-2.12).rotation.y=PI;
    mesh(g,new T.SphereGeometry(0.12,8,6),LIT(0xffa020),0.8,2.9,1.5);wheels(g,[-1.15,1.15],[-1.4,1.4]);return g;},
   fire(){const g=new T.Group();cab(g,0xb81a1a,2.6,2.1,2.6,-3.6);mesh(g,new T.BoxGeometry(2.6,2.4,6.4),S(0xb81a1a,0.45,0.3),0,2.1,1.2);for(let k=0;k<3;k++)for(const s of[-1,1])mesh(g,new T.BoxGeometry(0.05,1.6,1.8),S(0xc8c8c8,0.3,0.9),s*1.32,2.1,-0.9+k*2.1);
    mesh(g,new T.CylinderGeometry(0.15,0.15,2.2,8).rotateX(PI/2.4),CHR,0,3.6,-1.5);for(const s of[-1,1])mesh(g,new T.BoxGeometry(0.4,0.15,0.2),LIT(s<0?0xff2020:0x2040ff),s*0.5,3.0,-4.9);mesh(g,new T.BoxGeometry(2.62,0.15,6.4),S(0xf2f2f2,0.4,0.2),0,1.4,1.2);wheels(g,[-1.15,1.15],[-3.4,1.6,3.0],0.6);return g;},
   pickup(){const g=new T.Group();const m=S(0x3d4a2e,0.5,0.3);mesh(g,new T.BoxGeometry(2,0.9,5.2),m,0,1.15,0);cab(g,0x3d4a2e,1.95,1.0,2,-0.4);mesh(g,new T.BoxGeometry(1.9,0.5,2.2),S(0x2a3220,0.7,0.2),0,1.85,1.4);
    const lb=decal(256,128,(x,w,h)=>{x.fillStyle='#f0f0f0';x.font='bold 54px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('FOLLOW ME',w/2,h/2);});mesh(g,new T.PlaneGeometry(1.6,0.5),lb,0,2.95,-0.6).rotation.x=0;mesh(g,new T.BoxGeometry(1.6,0.5,0.4),S(0xe8c21a,0.5,0.2),0,2.65,-0.6);wheels(g,[-0.95,0.95],[-1.7,1.7],0.45);return g;}};
  const PROTO={};const veh=(k,x,z,ry)=>{const p=PROTO[k]||(PROTO[k]=VEH[k]());const v=p.clone();v.position.set(x,6,z);v.rotation.y=ry;v.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});G.add(v);return v;};
  for(let i=0;i<5;i++){veh(i%2?'fuel':'tug',138,-610+i*300,PI/2+0.3);veh('pickup',134,-580+i*300,-0.2);}veh('fire',120,480,PI/2);veh('fire',120,465,PI/2);veh('fuel',290,-1050,0);veh('fuel',300,-1050,0);
  // ---- props: jersey barriers (instanced), light masts, fuel farm, windsock ----
  {const bg=new T.BoxGeometry(0.6,0.8,3).translate(0,0.4,0);const bi=new T.InstancedMesh(bg,concM,120);const m4=new T.Matrix4();let k=0;for(let i=0;i<60;i++){m4.makeTranslation(205,6,-1100+i*3.1);bi.setMatrixAt(k++,m4);m4.makeTranslation(355,6,-1100+i*3.1);bi.setMatrixAt(k++,m4);}bi.receiveShadow=bi.castShadow=true;G.add(bi);}
  {const pg=new T.CylinderGeometry(0.15,0.25,22,8).translate(0,11,0);const n=12;const pi=new T.InstancedMesh(pg,S(0x9a9a94,0.4,0.8),n),hi=new T.InstancedMesh(new T.BoxGeometry(2.4,0.6,1.2),S(0x2b2d2f,0.4,0.6),n);const m4=new T.Matrix4();for(let i=0;i<n;i++){const z=-750+i*130;m4.makeTranslation(118,6,z);pi.setMatrixAt(i,m4);m4.makeTranslation(118,28,z);hi.setMatrixAt(i,m4);}G.add(pi,hi);}
  for(let i=0;i<4;i++){const f=new T.Group();f.position.set(300+(i%2)*28,6,-1150+Math.floor(i/2)*28);G.add(f);mesh(f,new T.CylinderGeometry(10,10,9,32),pm('ftk',{color:0xdcdcd4,roughness:0.5,metalness:0.6}),0,4.5,0);mesh(f,new T.CylinderGeometry(10.2,10.2,0.3,32),S(0x8a8a84,0.6,0.6),0,9.1,0);for(const y of[2.2,4.5,6.8])mesh(f,new T.TorusGeometry(10.02,0.06,4,48).rotateX(PI/2),S(0x8a8a84,0.6,0.6),0,y,0);
   mesh(f,new T.BoxGeometry(24,1,0.6),concM,0,0.5,12.5);mesh(f,new T.BoxGeometry(24,1,0.6),concM,0,0.5,-12.5);f.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});}
  {const w=new T.Group();w.position.set(-70,6,-1200);G.add(w);mesh(w,new T.CylinderGeometry(0.08,0.1,7,6),S(0xd8d8d8,0.4,0.6),0,3.5,0);const sk=mesh(w,new T.CylinderGeometry(0.5,0.18,3.4,12,4,true).rotateZ(-PI/2),new T.MeshStandardMaterial({map:tx(cv(64,64,(x)=>{for(let i=0;i<5;i++){x.fillStyle=i%2?'#f2f2f2':'#ff5a14';x.fillRect(0,i*12.8,64,12.8);}}),true),side:T.DoubleSide,roughness:0.9}),1.7,6.8,0);sk.geometry.rotateY(0);}
  // ---- trees: instanced 2-level LOD (crowns + trunks), placed on the island near the base ----
  {const N=isTouch?700:1400;const trunkG=new T.CylinderGeometry(0.18,0.3,4,6).translate(0,2,0);const crG=new T.IcosahedronGeometry(1,1);{const p=crG.attributes.position;for(let i=0;i<p.count;i++){const n=1+(hash(i,7)-0.5)*0.35;p.setXYZ(i,p.getX(i)*n,p.getY(i)*n*1.1,p.getZ(i)*n);}crG.computeVertexNormals();}
   const leaf=cv(128,128,(x,w,h)=>{x.fillStyle='#2f4a25';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){const g=50+Math.random()*60|0;x.fillStyle=`rgb(${g*0.55|0},${g},${g*0.4|0})`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,7);x.fill();}});
   const crM=new T.MeshStandardMaterial({map:tx(leaf,true,2,2),roughness:0.9,metalness:0});const trM=S(0x4a3a2a,0.95,0);
   const ti=new T.InstancedMesh(trunkG,trM,N),c1=new T.InstancedMesh(crG,crM,N),c2=new T.InstancedMesh(crG,crM,N);const m4=new T.Matrix4(),q=new T.Quaternion(),col=new T.Color();let k=0;
   for(let a=0;a<N*8&&k<N;a++){const x=380+hash(a,11)*900-((a%3)?0:700),z=-1500+hash(a,13)*3000;if(x>-60&&x<370)continue;const h=terrainH(x,z);if(h<6.5||h>140)continue;
    const s=0.8+hash(a,17)*0.9,ry=hash(a,19)*6.28;q.setFromAxisAngle(new T.Vector3(0,1,0),ry);m4.compose(new T.Vector3(x,h-0.2,z),q,new T.Vector3(s,s*(0.9+hash(a,23)*0.5),s));ti.setMatrixAt(k,m4);
    m4.compose(new T.Vector3(x,h+5*s,z),q,new T.Vector3(3.2*s,3.4*s,3.2*s));c1.setMatrixAt(k,m4);m4.compose(new T.Vector3(x+0.8*s,h+7.4*s,z-0.5*s),q,new T.Vector3(2.2*s,2.4*s,2.2*s));c2.setMatrixAt(k,m4);
    col.setHSL(0.24+hash(a,29)*0.08,0.35+hash(a,31)*0.2,0.6+hash(a,37)*0.4);c1.setColorAt(k,col);c2.setColorAt(k,col);k++;}
   for(const m of[ti,c1,c2]){m.count=k;m.castShadow=true;m.receiveShadow=true;G.add(m);}
   // distance LOD: hide small top crowns & trunks when camera far away
   const _ue=updEnv;updEnv=function(dt){_ue(dt);const d=camera.position.distanceTo(_abC);const far=d>3500;c2.visible=ti.visible=!far;G.visible=d<16000;};}
  window.__detailSea={G,VEH:Object.keys(VEH)};}
 var _abC=new T.Vector3(200,6,0);}
}
//GDETAIL_SEA-END
