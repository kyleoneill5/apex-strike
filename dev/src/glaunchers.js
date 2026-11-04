//GLAUNCHERS-BEGIN  realistic ground launchers: Minuteman III silo (LF), Patriot M903 launcher + MPQ-65 radar (replaces army SAM site look), M142 HIMARS.
const LAUNCHERS=(()=>{const T=THREE,PI=Math.PI;
// ---------- textures ----------
function cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
const TX={};function tex(c,srgb=true,rep=1){const t=new T.CanvasTexture(c);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=8;return t;}
function noise(x,w,h,n,a,col){for(let i=0;i<n;i++){x.fillStyle=`rgba(${col},${Math.random()*a})`;const s=1+Math.random()*6;x.fillRect(Math.random()*w,Math.random()*h,s,s);}}
function camoTex(key,cols,blobs=60){if(TX[key])return TX[key];const S=1024;
 const r=cv(S,S,(x)=>{x.fillStyle='#909090';x.fillRect(0,0,S,S);noise(x,S,S,9000,0.25,'255,255,255');});
 const c=cv(S,S,(x)=>{x.fillStyle=cols[0];x.fillRect(0,0,S,S);
  for(let i=0;i<blobs;i++){x.fillStyle=cols[1+i%(cols.length-1)];x.beginPath();let cx=Math.random()*S,cy=Math.random()*S,R=40+Math.random()*120;for(let k=0;k<=14;k++){const a=k/14*2*PI,rr=R*(0.6+Math.random()*0.6);k?x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*0.6):x.moveTo(cx+rr,cy);}x.fill();}
  noise(x,S,S,14000,0.06,'0,0,0');noise(x,S,S,5000,0.05,'255,240,210');
  // dust/mud gradient & streaks
  for(let i=0;i<220;i++){x.fillStyle=`rgba(80,62,40,${Math.random()*0.08})`;const X=Math.random()*S;x.fillRect(X,Math.random()*S,1+Math.random()*3,30+Math.random()*160);}
  const g=x.createLinearGradient(0,S*0.6,0,S);g.addColorStop(0,'rgba(110,90,60,0)');g.addColorStop(1,'rgba(110,90,60,0.35)');x.fillStyle=g;x.fillRect(0,0,S,S);});
 return TX[key]={map:tex(c,true,1),rough:tex(r,false,1)};}
function concreteTex(){if(TX.conc)return TX.conc;const S=1024;const c=cv(S,S,(x)=>{x.fillStyle='#8e8b84';x.fillRect(0,0,S,S);noise(x,S,S,30000,0.12,'0,0,0');noise(x,S,S,15000,0.1,'255,255,250');
  for(let i=0;i<40;i++){x.strokeStyle=`rgba(30,30,30,${0.15+Math.random()*0.25})`;x.lineWidth=1;x.beginPath();let px=Math.random()*S,py=Math.random()*S;x.moveTo(px,py);for(let k=0;k<12;k++){px+=(Math.random()-0.5)*40;py+=(Math.random()-0.5)*40;x.lineTo(px,py);}x.stroke();}
  for(let i=0;i<30;i++){x.fillStyle=`rgba(60,50,40,${Math.random()*0.15})`;x.beginPath();x.ellipse(Math.random()*S,Math.random()*S,20+Math.random()*90,10+Math.random()*50,Math.random()*3,0,7);x.fill();}
  x.strokeStyle='rgba(20,20,20,0.6)';x.lineWidth=3;for(let k=0;k<=4;k++){x.beginPath();x.moveTo(k*S/4,0);x.lineTo(k*S/4,S);x.stroke();x.beginPath();x.moveTo(0,k*S/4);x.lineTo(S,k*S/4);x.stroke();}});
 return TX.conc=tex(c,true,1);}
function tireTex(){if(TX.tire)return TX.tire;const c=cv(512,128,(x,w,h)=>{x.fillStyle='#1b1b1b';x.fillRect(0,0,w,h);for(let i=0;i<32;i++){x.fillStyle='#0b0b0b';const X=i*16;x.beginPath();x.moveTo(X,0);x.lineTo(X+9,h*0.48);x.lineTo(X,h);x.lineTo(X+6,h);x.lineTo(X+14,h*0.48);x.lineTo(X+6,0);x.fill();}noise(x,w,h,3000,0.12,'120,100,80');});
 return TX.tire=tex(c,true,1);}
function stencil(txt,w=512,h=96,col='#111',bg=null,font='bold 64px "DejaVu Sans Condensed",Arial Narrow,Arial'){const c=cv(w,h,(x)=>{if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h);}x.fillStyle=col;x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2);});
 return new T.MeshStandardMaterial({map:tex(c),transparent:!bg,roughness:0.8,metalness:0,polygonOffset:true,polygonOffsetFactor:-2});}
// ---------- materials ----------
const camoNATO=camoTex('nato',['#4b5232','#2e3322','#5b4a33','#1d1d1a']),camoTan=camoTex('tan',['#b19f78','#a48f68','#bba985']);
const M={
 green:new T.MeshStandardMaterial({map:camoNATO.map,roughnessMap:camoNATO.rough,roughness:0.85,metalness:0.15}),
 tan:new T.MeshStandardMaterial({map:camoTan.map,roughnessMap:camoTan.rough,roughness:0.85,metalness:0.12}),
 steel:new T.MeshStandardMaterial({color:0x5c5f5e,roughness:0.45,metalness:0.85}),
 chrome:new T.MeshStandardMaterial({color:0xd8dadb,roughness:0.12,metalness:1}),
 dark:new T.MeshStandardMaterial({color:0x1f2020,roughness:0.7,metalness:0.4}),
 rub:new T.MeshStandardMaterial({map:tireTex(),roughness:0.95,metalness:0}),
 glass:new T.MeshPhysicalMaterial({color:0x1a2730,roughness:0.05,metalness:0.1,clearcoat:1}),
 conc:new T.MeshStandardMaterial({map:concreteTex(),roughness:0.92,metalness:0}),
 conc2:new T.MeshStandardMaterial({map:concreteTex(),color:0xb8b4aa,roughness:0.95,metalness:0}),
 rail:new T.MeshStandardMaterial({color:0x6b5a4a,roughness:0.55,metalness:0.8}),
 cable:new T.MeshStandardMaterial({color:0x151515,roughness:0.6,metalness:0}),
 yel:new T.MeshStandardMaterial({color:0xd4a514,roughness:0.6,metalness:0.1}),
 red:new T.MeshStandardMaterial({color:0xa01818,roughness:0.6,metalness:0.1}),
 fence:new T.MeshStandardMaterial({color:0x9a9c9c,roughness:0.4,metalness:0.9,transparent:true,opacity:0.55,side:T.DoubleSide}),
 gravel:new T.MeshStandardMaterial({color:0x7b766c,roughness:1,metalness:0}),
 soot:new T.MeshStandardMaterial({color:0x151310,roughness:1,metalness:0}),
};
const P=(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;};
const B=(w,h,l)=>new T.BoxGeometry(w,h,l),CX=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s).rotateZ(PI/2),CZ=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s).rotateX(PI/2),CY=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s);
// box-projected UVs (world-ish metres) so camo/concrete tiles at real scale
function boxUV(geo,s=0.25){geo=geo.index?geo.toNonIndexed():geo;const p=geo.attributes.position,n=geo.attributes.normal,uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let u,v;if(ax>=ay&&ax>=az){u=p.getZ(i);v=p.getY(i);}else if(ay>=az){u=p.getX(i);v=p.getZ(i);}else{u=p.getX(i);v=p.getY(i);}uv[i*2]=u*s;uv[i*2+1]=v*s;}
 geo.setAttribute('uv',new T.BufferAttribute(uv,2));return geo;}
// merge all meshes in a subtree by material (keeps named groups as separate pivots)
function bake(g,uvs){const by=new Map();for(const c of [...g.children]){if(!c.isMesh||c.userData.keep)continue;c.updateMatrix();let geo=c.geometry.clone().applyMatrix4(c.matrix);geo=geo.index?geo.toNonIndexed():geo;
  if(uvs&&uvs.has(c.material))geo=boxUV(geo,uvs.get(c.material));if(!geo.attributes.uv)geo.setAttribute('uv',new T.BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
  for(const k of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(k))geo.deleteAttribute(k);
  if(!by.has(c.material))by.set(c.material,[]);by.get(c.material).push(geo);g.remove(c);}
 for(const [m,list] of by){let n=0;for(const q of list)n+=q.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
  for(const q of list){pos.set(q.attributes.position.array,o*3);nor.set(q.attributes.normal.array,o*3);uv.set(q.attributes.uv.array,o*2);o+=q.attributes.position.count;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));
  const mm=new T.Mesh(geo,m);mm.castShadow=mm.receiveShadow=true;g.add(mm);}
 for(const c of g.children)if(c.isGroup)bake(c,uvs);return g;}
const UVS=()=>new Map([[carc,0.12],[M.green,0.12],[M.tan,0.12],[M.conc,0.05],[M.conc2,0.08]]);
// ---------- running gear ----------
function wheel(g,x,y,z,r=0.6,w=0.42,body=M.green){const t=new T.LatheGeometry([[r*0.62,-w/2],[r*0.93,-w/2],[r,-w*0.38],[r,w*0.38],[r*0.93,w/2],[r*0.62,w/2]].map(p=>new T.Vector2(p[0],p[1])),28).rotateZ(PI/2);
 P(g,t,M.rub,x,y,z);const s=Math.sign(x)||1;P(g,CX(r*0.62,r*0.62,w*0.9,24),body,x,y,z);P(g,CX(r*0.3,r*0.34,w*0.98,16),M.dark,x,y,z);P(g,CX(r*0.12,r*0.12,w*1.08,10),M.steel,x,y,z);
 for(let k=0;k<10;k++){const a=k/10*2*PI;P(g,CX(0.022,0.022,w*1.02,6),M.chrome,x,y+Math.cos(a)*r*0.22,z+Math.sin(a)*r*0.22);}
 // CTIS hose
 P(g,CZ(0.012,0.012,r*0.5,4),M.cable,x+s*w*0.52,y+r*0.15,z);}
function cab(g,z,len=2.6,w=2.45,body=M.green,h=2.0){// armoured cab (LMTV/HEMTT style)
 P(g,B(w,h*0.55,len),body,0,1.55,z);P(g,B(w*0.98,h*0.5,len*0.82),body,0,2.4,z+len*0.05);P(g,B(w*0.96,0.08,len*0.84),body,0,2.68,z+len*0.05);
 P(g,B(w*0.86,0.62,0.05),M.glass,0,2.35,z-len*0.36,-0.12);for(const s of[-1,1]){P(g,B(0.05,0.5,0.9),M.glass,s*w*0.49,2.38,z-0.1);P(g,B(0.06,0.9,0.05),body,s*w*0.3,2.35,z-len*0.37);
  P(g,B(0.04,0.28,0.18),M.dark,s*(w/2+0.25),2.35,z-len*0.45);P(g,CX(0.015,0.015,0.3,4),M.dark,s*(w/2+0.12),2.4,z-len*0.45);// mirrors
  P(g,CZ(0.09,0.09,0.04,12),M.chrome,s*w*0.38,1.35,z-len*0.5-0.01);P(g,B(0.3,0.1,0.05),M.dark,s*w*0.38,1.55,z-len*0.5-0.01);// lamps, blackout
  P(g,B(0.5,0.05,0.35),M.dark,s*w*0.48,1.0,z+0.1);P(g,B(0.08,0.9,0.08),M.steel,s*(w/2+0.06),1.3,z+0.6);}// steps, grab
 for(let i=0;i<10;i++)P(g,B(w*0.7,0.04,0.04),M.dark,0,1.12+i*0.08,z-len/2-0.02);// grille
 P(g,B(w+0.15,0.3,0.35),M.dark,0,0.95,z-len/2-0.1);// bumper
 P(g,CY(0.08,0.08,1.6,10),M.dark,w*0.46,2.3,z+len/2-0.1);P(g,CY(0.1,0.08,0.15,10),M.soot,w*0.46,3.15,z+len/2-0.1);// exhaust stack
 for(const s of[-1,1])P(g,CY(0.012,0.004,2.2,4),M.dark,s*w*0.45,3.7,z+len*0.3);}// whip antennas
function frame(g,z0,z1,y=0.95){for(const s of[-1,1])P(g,B(0.2,0.32,z1-z0),M.dark,s*0.5,y,(z0+z1)/2);for(let z=z0;z<z1;z+=1.2)P(g,B(1.0,0.18,0.12),M.dark,0,y,z);}
function outrigger(g,x,z,body){P(g,B(0.8,0.16,0.2),body,x*0.75,0.95,z);P(g,CY(0.07,0.07,0.8,10),M.chrome,x,0.5,z);P(g,CY(0.1,0.1,0.5,10),body,x,0.95,z);P(g,CY(0.28,0.3,0.06,16),M.steel,x,0.06,z);}
function hydraulic(g,a,b,r=0.09){const d=b.clone().sub(a),L=d.length();const mid=a.clone().add(b).multiplyScalar(0.5);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());
 const c1=P(g,CY(r,r,L*0.55,12),M.dark,0,0,0);c1.position.copy(a).addScaledVector(d,0.28);c1.quaternion.copy(q);const c2=P(g,CY(r*0.55,r*0.55,L*0.55,10),M.chrome,0,0,0);c2.position.copy(a).addScaledVector(d,0.72);c2.quaternion.copy(q);}
function decal(g,mat,w,h,x,y,z,ry=0){const d=P(g,new T.PlaneGeometry(w,h),mat,x,y,z,0,ry,0);d.userData.keep=1;d.receiveShadow=true;return d;}

// =================== M142 HIMARS — rebuilt from refs/himars (L 6.94, W 2.44, H 3.18; FMTV 6x6; armoured LMTV-style cab; LPC pod 2x3 + reload boom) ===================
const carc=(()=>{const S=1024;const c=cv(S,S,(x)=>{x.fillStyle='#4a5136';x.fillRect(0,0,S,S);noise(x,S,S,16000,0.07,'0,0,0');noise(x,S,S,6000,0.05,'255,250,220');
  for(let i=0;i<260;i++){x.fillStyle=`rgba(90,72,48,${Math.random()*0.09})`;x.fillRect(Math.random()*S,Math.random()*S,1+Math.random()*3,20+Math.random()*140);}
  const g=x.createLinearGradient(0,S*0.65,0,S);g.addColorStop(0,'rgba(120,96,64,0)');g.addColorStop(1,'rgba(120,96,64,0.4)');x.fillStyle=g;x.fillRect(0,0,S,S);});
 const r=cv(256,256,(x)=>{x.fillStyle='#b0b0b0';x.fillRect(0,0,256,256);noise(x,256,256,4000,0.2,'0,0,0');});
 return new T.MeshStandardMaterial({map:tex(c,true,1),roughnessMap:tex(r,false,1),roughness:0.82,metalness:0.12});})();
function extrudeSide(pts,w,mat){// side profile pts [z,y] extruded across x (width w)
 const sh=new T.Shape();pts.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:w,bevelEnabled:true,bevelSize:0.03,bevelThickness:0.03,bevelSegments:1});
 g.translate(0,0,-w/2);g.rotateY(-PI/2);return new T.Mesh(g,mat);}// shape x->z, y->y, depth->x
function himars(o={}){const body=carc;const g=new T.Group();g.name='M142 HIMARS';
 frame(g,-3.3,3.4,0.95);
 // armoured cab: faceted wedge (side profile traced from photo), 2.44 wide, 3.0 tall
 const cabM=extrudeSide([[-3.47,0.85],[-3.5,1.55],[-3.3,2.15],[-2.75,2.98],[-1.3,2.98],[-1.3,0.85]],2.44,body);g.add(cabM);
 for(const s of[-1,1]){const side=extrudeSide([[-3.3,1.0],[-3.05,0.75],[-1.4,0.75],[-1.4,1.0]],0.2,body);side.position.x=s*1.12;g.add(side);}// lower side armour skirts
 // windscreen (2 panes on the sloped face), side windows, door outlines, roof hatch, lights, grille, bumper, tow hooks
 const slope=Math.atan2(2.98-2.15,3.3-2.75);
 for(const s of[-1,1]){const w=P(g,B(0.85,0.55,0.03),M.glass,s*0.52,2.55,-3.05,-(PI/2-slope),0,0);
  P(g,B(0.03,0.5,0.75),M.glass,s*1.235,2.45,-2.2);P(g,B(0.03,1.6,0.03),M.dark,s*1.24,1.85,-1.9);P(g,B(0.03,0.03,1.2),M.dark,s*1.24,1.05,-2.45);// door seam
  P(g,B(0.03,0.08,0.25),M.steel,s*1.25,1.9,-2.0);// handle
  P(g,CZ(0.1,0.1,0.05,14),M.chrome,s*0.95,1.25,-3.52);P(g,B(0.22,0.08,0.05),new T.MeshStandardMaterial({color:0xff9a20,emissive:0x552200,roughness:0.4}),s*0.95,1.45,-3.52);// head/marker lamps
  P(g,B(0.05,0.32,0.22),M.dark,s*1.42,2.45,-3.0);P(g,CX(0.015,0.015,0.2,4),M.dark,s*1.32,2.6,-3.0);// mirror
  for(let k=0;k<3;k++)P(g,B(0.08,0.05,0.05),new T.MeshStandardMaterial({color:0xffa030,emissive:0x331100}),s*(0.25+k*0.25),2.99,-2.7);}// roof marker lights
 for(let i=0;i<7;i++)P(g,B(1.0,0.04,0.04),M.dark,0,1.15+i*0.07,-3.52);// grille
 P(g,B(2.5,0.32,0.3),body,0,0.85,-3.62);for(const s of[-1,1])P(g,new T.TorusGeometry(0.07,0.025,6,10),M.dark,s*0.7,0.82,-3.8);
 P(g,CY(0.25,0.25,0.05,16),body,0.5,3.0,-2.0);
 // wheels: front axle + tandem rear (traced spacing), 395/85R20 tyres
 for(const z of[-2.55,1.2,2.6])for(const s of[-1,1])wheel(g,s*1.0,0.6,z,0.6,0.42,body);
 for(const s of[-1,1]){P(g,B(0.5,0.08,1.4),body,s*1.05,1.3,-2.55);P(g,B(0.5,0.08,2.8),body,s*1.05,1.3,1.9);}
 P(g,B(0.65,0.7,1.1),body,-1.0,1.25,-0.6);P(g,B(0.6,0.6,1.0),body,1.0,1.25,-0.6);// fuel tank / battery-tool boxes
 for(const s of[-1,1])P(g,B(0.06,0.06,1.2),M.steel,s*1.35,1.25,-0.6);
 // launcher-loader module (LLM): base turret, cage with LPC pod, reload boom (U-frame)
 const L=new T.Group();L.name='tu';L.position.set(0,1.25,1.7);g.add(L);
 P(L,B(2.3,0.55,3.2),body,0,0.28,0);P(L,CY(0.95,0.95,0.2,28),M.dark,0,0.6,0.6);
 const cage=new T.Group();cage.position.set(0,0.7,1.55);cage.rotation.x=(o.elev??0.55);L.add(cage);// pivot at rear; pod points forward/up
 const pod=new T.Group();cage.add(pod);
 P(pod,B(1.25,0.95,4.3),body,0,0.5,-2.15);// pod shell
 for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=-0.38+i*0.38,y=0.28+j*0.42;P(pod,CZ(0.16,0.16,0.04,18),new T.MeshStandardMaterial({color:0xe8e6e0,roughness:0.6}),x,y,-4.31);P(pod,CZ(0.175,0.175,0.03,18),M.dark,x,y,-4.3);}// white frangible end caps
 for(let k=0;k<5;k++)P(pod,B(1.3,1.0,0.06),body,0,0.5,-0.3-k*0.95);// stiffener frames
 P(pod,B(1.3,0.06,0.1),M.yel,0,1.02,-4.2);
 // reload boom: two arms + crossbar at pod front-top
 for(const s of[-1,1]){P(pod,B(0.14,1.0,0.18),body,s*0.62,1.4,-3.9,0.15,0,0);P(pod,B(0.14,0.18,0.9),body,s*0.62,1.95,-3.5);}
 P(pod,B(1.4,0.18,0.18),body,0,1.95,-3.05);P(pod,CY(0.04,0.04,0.6,8),M.steel,0,1.6,-3.05);P(pod,B(0.25,0.15,0.2),M.dark,0,1.3,-3.05);// hoist
 hydraulic(L,new T.Vector3(0.45,0.55,-0.6),new T.Vector3(0.45,0.7+Math.sin(o.elev??0.55)*2.3,1.55-Math.cos(o.elev??0.55)*2.3));hydraulic(L,new T.Vector3(-0.45,0.55,-0.6),new T.Vector3(-0.45,0.7+Math.sin(o.elev??0.55)*2.3,1.55-Math.cos(o.elev??0.55)*2.3));
 decal(pod,stencil('M31A1 GMLRS   LPC   LOT 07',512,64,'#e8e4d0'),1.6,0.2,0.63,0.5,-2.0,PI/2);
 for(const s of[-1,1])outrigger(g,s*1.4,3.3,body);
 decal(g,stencil('U.S. ARMY',512,96,'#d8d4c0'),1.0,0.2,1.236,1.7,-2.3,PI/2);decal(g,stencil('U.S. ARMY',512,96,'#d8d4c0'),1.0,0.2,-1.236,1.7,-2.3,-PI/2);
 decal(g,stencil('3-27 FA  C-12',512,96,'#d8d4c0'),0.7,0.13,0.6,0.86,-3.78,0);
 for(let i=0;i<14;i++)P(g,CZ(0.02,0.02,0.4,4),M.cable,0.3+Math.sin(i)*0.1,1.25,-0.4+i*0.2);
 const out=bake(g,UVS());out.userData.cage=cage;out.userData.muzzle=()=>{cage.updateMatrixWorld(true);return [new T.Vector3(0,0.5,-4.4).applyMatrix4(pod.matrixWorld),new T.Vector3(0,0,-1).transformDirection(pod.matrixWorld)];};
 return out;}

// =================== Patriot M903 launching station (on M860 semitrailer) + HEMTT M983 tractor ===================
function patriot(o={}){const body=o.desert?M.tan:M.green;const g=new T.Group();g.name='Patriot M903';
 // tractor (front, -Z)
 const tr=new T.Group();tr.position.z=-8.2;g.add(tr);frame(tr,-1.8,3.4);cab(tr,-0.6,2.6,2.5,body,2.2);
 for(const z of[-1.0,0.6,2.0,3.2])for(const s of[-1,1])wheel(tr,s*1.05,0.6,z,0.6,0.45,body);
 P(tr,B(2.0,1.3,1.4),body,0,1.8,1.2);P(tr,CY(0.7,0.7,0.2,20),M.steel,0,1.3,3.0);// crane base/fifth wheel
 // trailer
 frame(g,-6.5,4.8,1.15);P(g,B(2.5,0.25,10.5),body,0,1.35,-0.8);for(const z of[3.0,4.3])for(const s of[-1,1]){wheel(g,s*1.02,0.6,z,0.6,0.45,body);wheel(g,s*0.55,0.6,z,0.6,0.45,body);}
 P(g,B(2.2,1.5,1.6),body,0,2.2,-5.3);for(let i=0;i<8;i++)P(g,B(0.04,1.1,0.05),M.dark,1.11,2.2,-5.9+i*0.17);// generator (EPP)
 P(g,B(1.2,1.0,1.0),body,-0.6,1.95,-3.8);P(g,B(0.6,0.6,0.08),M.dark,-0.6,2.0,-4.31);// LCS electronics
 for(const s of[-1,1])for(const z of[-6.2,4.9])outrigger(g,s*1.7,z,body);
 // erector + 4 canisters (PAC-2 single-round canisters 5.8 x 0.9 x 1.1)
 const E=new T.Group();E.name='tu';E.position.set(0,1.6,4.4);g.add(E);const el=o.elev??0.65;E.rotation.x=el;
 const C=new T.Group();C.position.set(0,0,-6.3);E.add(C);
 for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=-0.58+i*1.16,y=0.6+j*1.15;P(C,B(1.08,1.08,6.0),M.tan,x,y,0);
  for(let k=0;k<6;k++)P(C,B(1.12,1.12,0.09),M.tan,x,y,-2.7+k*1.08);// stiffener ribs
  P(C,B(1.0,1.0,0.03),M.dark,x,y,-3.01);P(C,B(0.9,0.06,0.02),M.yel,x,y+0.45,-3.03);// frangible cover
  for(const s of[-1,1])P(C,CZ(0.05,0.05,0.25,8),M.steel,x+s*0.5,y-0.5,-3.0);}
 P(C,B(2.5,0.2,6.0),M.dark,0,0.0,0);for(const s of[-1,1])P(C,B(0.12,2.4,0.2),M.dark,s*1.2,1.2,3.0);
 decal(C,stencil('GUIDED MISSILE  PATRIOT  MIM-104D GEM-T',768,72,'#151515'),3.2,0.22,1.125,1.75,0,PI/2);decal(C,stencil('⚠ DANGER  BACKBLAST AREA',512,72,'#a01010'),2.0,0.2,1.125,0.6,0.5,PI/2);
 hydraulic(g,new T.Vector3(0.6,1.5,0.4),new T.Vector3(0.6,1.6+Math.sin(el)*3.6,4.4-Math.cos(el)*3.6));hydraulic(g,new T.Vector3(-0.6,1.5,0.4),new T.Vector3(-0.6,1.6+Math.sin(el)*3.6,4.4-Math.cos(el)*3.6));
 for(let i=0;i<18;i++)P(g,CZ(0.025,0.025,0.6,5),M.cable,-1.2+Math.sin(i*0.7)*0.15,0.03,-6+i*0.55,0,0.1);
 decal(g,stencil('U.S. ARMY',512,96,'#ddd'),1.0,0.22,1.26,2.3,-8.6,PI/2);
 return bake(g,UVS());}
// AN/MPQ-65 radar set (on M860 trailer)
function mpq65(o={}){const body=o.desert?M.tan:M.green;const g=new T.Group();g.name='AN/MPQ-65';frame(g,-4,4,1.15);P(g,B(2.5,2.3,6.6),body,0,2.45,0.4);
 for(const z of[2.9,4.0])for(const s of[-1,1])wheel(g,s*1.02,0.6,z,0.6,0.45,body);for(let i=0;i<10;i++)P(g,B(0.04,1.8,0.05),M.dark,1.26,2.5,-2.4+i*0.6);
 const A=new T.Group();A.name='ant';A.position.set(0,3.6,-3.0);g.add(A);
 const face=new T.Group();face.rotation.x=-0.45;A.add(face);P(face,new T.CylinderGeometry(1.25,1.25,0.35,8).rotateX(PI/2),body,0,1.3,0);P(face,new T.CircleGeometry(1.08,8),M.dark,0,1.3,-0.18,0,PI,0);
 for(let i=0;i<9;i++)for(let j=0;j<9;j++){const x=-1+i*0.25,y=0.3+j*0.25;if(Math.hypot(x,y-1.3)<1.0)P(face,B(0.2,0.2,0.02),M.steel,x,y,-0.19);}
 P(face,CY(0.32,0.32,0.3,16).rotateX(PI/2),body,0,2.75,0.05);P(face,new T.CircleGeometry(0.28,16),M.dark,0,2.75,-0.11,0,PI,0);// IFF/guidance
 for(const s of[-1,1])for(const z of[-3.4,3.8])outrigger(g,s*1.7,z,body);
 for(let i=0;i<24;i++)P(g,CZ(0.03,0.03,0.7,5),M.cable,1.6+i*0.25,0.03,i*0.5,0,-0.5);
 return bake(g,UVS());}
// Patriot battery site (replaces garmy 'SAM site' visual; keeps 'tu' and 'ant' pivots for its turret/radar logic)
function samSite(){const g=new T.Group();const l1=patriot({desert:1});l1.rotation.y=0.25;g.add(l1);const l2=patriot({desert:1,elev:0.5});l2.position.set(-12,0,8);l2.rotation.y=0.9;l2.traverse(o=>{if(o.name==='tu')o.name='tu2';});g.add(l2);
 const r=mpq65({desert:1});r.position.set(14,0,-4);r.rotation.y=-0.3;g.add(r);
 // revetment berm
 const bm=new T.Mesh(new T.TorusGeometry(22,1.6,6,40,PI*1.6),M.gravel);bm.rotation.x=-PI/2;bm.rotation.z=PI*0.7;bm.scale.z=0.6;bm.receiveShadow=true;g.add(bm);
 return g;}

// =================== Minuteman III Launch Facility (LF) ===================
// ~ 12 ft (3.7 m) tube ID, 110-ton sliding concrete door on rails, launch support building, hardened antenna, security fence.
function siloLF(){const g=new T.Group();g.name='LF';
 P(g,B(70,0.6,60),M.gravel,0,0.0,4);P(g,CY(9,10,1.6,40),M.conc,0,0.8,0);// headworks apron
 // launch tube opening with liner, shock-isolated launcher platform rim, and hot-launch exhaust vents (flame deflection channel)
 const tube=new T.Group();g.add(tube);const liner=new T.Mesh(new T.CylinderGeometry(2.2,2.2,30,48,1,true),new T.MeshStandardMaterial({color:0x6e6e66,roughness:0.85,metalness:0.4,side:T.BackSide}));liner.position.y=-13.4;tube.add(liner);
 P(g,new T.TorusGeometry(2.3,0.18,10,48).rotateX(PI/2),M.steel,0,1.62,0);for(let k=0;k<24;k++){const a=k/24*2*PI;P(g,CY(0.06,0.06,0.08,6),M.chrome,Math.cos(a)*2.55,1.64,Math.sin(a)*2.55);}
 for(let k=0;k<4;k++){const a=PI/4+k*PI/2;P(g,B(1.2,0.3,0.8),M.soot,Math.cos(a)*3.4,1.62,Math.sin(a)*3.4,0,-a,0);for(let i=0;i<5;i++)P(g,B(0.06,0.32,0.75),M.steel,Math.cos(a)*3.4+Math.cos(a+PI/2)*(-0.5+i*0.25),1.64,Math.sin(a)*3.4+Math.sin(a+PI/2)*(-0.5+i*0.25),0,-a,0);}
 // flame/exhaust trench running out to the side
 P(g,B(3,0.4,14),M.soot,0,0.25,-15);for(const s of[-1,1])P(g,B(0.5,1.4,14),M.conc,s*1.75,0.7,-15);
 // rails for door (door slides +X)
 for(const z of[-2.4,2.4]){P(g,B(22,0.25,0.35),M.rail,7,1.72,z);for(let x=-3;x<18;x+=1.2)P(g,B(0.3,0.12,0.7),M.steel,x,1.65,z);}
 P(g,B(1.2,1.6,6.5),M.conc,17.5,2.4,0);// door stop/bumper block
 // launch support building (underground, roof hatch) + personnel access hatch
 P(g,B(8,1.0,6),M.conc2,-12,1.1,6);P(g,CY(0.8,0.8,0.6,20),M.steel,-12,1.9,6);P(g,new T.TorusGeometry(0.85,0.08,8,20).rotateX(PI/2),M.yel,-12,2.2,6);
 // hardened UHF antenna & sensors
 P(g,CY(0.25,0.35,3.5,12),M.conc2,-8,2.4,-6);P(g,CY(0.06,0.06,3,8),M.steel,-8,5.6,-6);for(let k=0;k<3;k++)P(g,CY(0.25,0.25,0.05,12),M.steel,-8,4.6+k*0.8,-6);
 P(g,CY(0.15,0.15,2.4,10),M.steel,10,1.6,10);P(g,B(0.6,0.35,0.3),M.dark,10,2.9,10);// IR intrusion sensor post
 P(g,B(1.6,2.0,1.2),M.conc2,12,1.6,12);// HVAC/ power vault
 // perimeter security fence w/ posts and outriggers
 const fz=[[-30,-24],[30,-24],[30,30],[-30,30],[-30,-24]];for(let i=0;i<4;i++){const [x0,z0]=fz[i],[x1,z1]=fz[i+1];const L=Math.hypot(x1-x0,z1-z0),n=Math.round(L/4);
  for(let k=0;k<=n;k++){const t=k/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;P(g,CY(0.05,0.05,2.6,6),M.steel,x,1.6,z);P(g,B(0.04,0.5,0.04),M.steel,x,3.1,z,0.5,0,0);}
  const f=new T.Mesh(new T.PlaneGeometry(L,2.2),M.fence);f.position.set((x0+x1)/2,1.4,(z0+z1)/2);f.rotation.y=-Math.atan2(z1-z0,x1-x0);f.userData.keep=1;g.add(f);
  for(const h of[2.95,3.15,3.35]){const w=P(g,CX(0.008,0.008,L,3),M.steel,(x0+x1)/2,h,(z0+z1)/2,0,-Math.atan2(z1-z0,x1-x0),0);w.userData.keep=1;}}
 P(g,B(4,0.05,0.4),M.yel,0,1.62,-6);decal(g,stencil('LF-07   DEADLY FORCE AUTHORIZED',768,96,'#c01010','#e8e6dc'),3.2,0.4,0,1.9,30.05);
 // the door itself: separate pivot named door (110 t reinforced concrete slab on steel carriage w/ wheels)
 const door=new T.Group();door.name='door';g.add(door);P(door,B(7.2,1.4,6.6),M.conc,0,2.45,0);P(door,B(7.4,0.35,7.0),M.steel,0,1.9,0);
 for(const x of[-2.8,0,2.8])for(const z of[-2.4,2.4])P(door,CX(0.32,0.32,0.4,16),M.dark,x,1.95,z);
 for(let i=0;i<4;i++)P(door,B(7.2,0.06,0.15),M.steel,0,3.18,-2.4+i*1.6);P(door,B(0.4,0.25,0.4),M.yel,3.4,3.1,0);
 g.userData.door=door;bake(g,UVS());bake(door,UVS());return g;}

// ---------- install ----------
function install(){try{
 // 1) ICBM silo: swap the geometry inside the existing 'silo' group (keeps its door API used by g4/g5)
 if(typeof silo!=='undefined'&&silo&&!silo.userData.lf){const lf=siloLF();for(const c of [...silo.children])silo.remove(c);
  lf.position.y=-1.6;silo.add(lf);const d=lf.userData.door;// existing code sets door.position.x = 0 (closed) / 8 (open)
  const proxy={position:{set x(v){d.position.x=v;},get x(){return d.position.x;}}};silo.userData.door=proxy;silo.userData.lf=true;}
 // 2) enemy SAM sites: rebuild visual with Patriot battery, keep turret/radar pivots
 if(window.__army&&__army.KIND&&__army.KIND.sam){const make=()=>{const g=samSite();g.userData.army=1;return g;};__army.KIND.sam.make=make;
  for(const u of __army.U){if(u.type!=='sam')continue;const old=u.mesh,m=make();m.position.copy(old.position);m.quaternion.copy(old.quaternion);m.visible=old.visible;
   const ud={};m.traverse(o=>{if(o.name==='tu')ud.tu=o;if(o.name==='ant')ud.ant=o;if(o.isMesh){o.castShadow=true;o.userData.m0=o.material;}});Object.assign(m.userData,ud,{army:1});
   if(old.parent){old.parent.add(m);old.parent.remove(old);}u.mesh=m;}}
 // 3) friendly HIMARS + Patriot display near the silo complex / airbase
 if(typeof SILO!=='undefined'){const h=himars({elev:0.6});h.position.set(SILO.x+60,6,SILO.z-30);h.rotation.y=-0.6;scene.add(h);const p=patriot({elev:0.65});p.position.set(SILO.x-70,6,SILO.z+40);p.rotation.y=2.4;scene.add(p);LAUNCHERS.placed=[h,p];}
}catch(e){console.error('launchers',e);}}
// ---------- player-usable HIMARS: GMLRS (M31), PrSM, game-only tactical 'mini-nuke' ----------
const HM={};
function setupPlayer(){if(typeof DEFS==='undefined'||DEFS.himars)return;
 DEFS.himars={name:'M142 HIMARS',desc:'Wheeled rocket artillery. GPS-guided M31 GMLRS (6/pod), PrSM deep-strike (2/pod), game-only tactical nuke.',cls:'silo',weapons:['GMLRS','PRSM','TACNUKE']};
 AMMO.GMLRS=6;AMMO.PRSM=2;AMMO.TACNUKE=1;
 const _sp=spawn;spawn=function(kind,...a){const r=_sp(kind,...a);if(kind==='himars'&&player){const h=himars({elev:0.15});const x=SILO.x+120,z=SILO.z+60;h.position.set(x,groundAt(x,z).h,z);h.rotation.y=0.5;scene.add(h);
   if(HM.mesh)scene.remove(HM.mesh);HM.mesh=h;HM.elev=0.15;player.mesh=h;player.own=true;player.himars=true;}else if(HM.mesh&&kind!=='himars'){scene.remove(HM.mesh);HM.mesh=null;}return r;};
 const _fw=fireWeapon;fireWeapon=function(v){const w=v.weapons[v.wi];if(!v.himars||!['GMLRS','PRSM','TACNUKE','ICBM'].includes(w))return _fw(v);
  if(w==='ICBM')return false;if(!(v.ammo[w]>0)||simT<(v.cool||0))return false;v.cool=simT+(w==='GMLRS'?1.2:3);v.ammo[w]--;
  const [o,d]=HM.mesh.userData.muzzle();const prsm=w==='PRSM';
  const tg=nearestTarget(o,null,['boat','drone'],prsm?120000:80000,-1)||(typeof targets!=='undefined'?targets.filter(t=>t.alive&&t.army).sort((a,b)=>a.pos.distanceTo(o)-b.pos.distanceTo(o))[0]:null);
  addProj({type:'missile',pos:o.clone(),vel:d.clone().multiplyScalar(60),life:prsm?200:120,mesh:missileMesh(4,0.12),owner:v,maxSpd:prsm?1700:1050,acc:prsm?260:200,turn:prsm?0.7:1.0,tg,arm:2.5,boost:3.0,mslName:prsm?'prsm':'gmlrs',tacnuke:w==='TACNUKE',himarsRound:true});
  for(let k=0;k<30;k++)smoke.spawn(o,rnd(4)-d.x*8,rnd(4)-d.y*8,rnd(4)-d.z*8,3,5,14,0.85,0.83,0.8,0.8,0.05,0.2);explosion(o,0.6);if(typeof shake!=='undefined')shake=Math.max(shake,0.8);
  if(typeof play3D==='function')play3D('missile',o.clone(),1.4,0.8,600);msg(w==='GMLRS'?'GMLRS AWAY - M31 GPS/INS':w==='PRSM'?'PrSM AWAY - DEEP STRIKE':'☢ TACTICAL WARHEAD AWAY',1.6);return true;};
 // pod elevation animates up when a weapon is ready to fire; chase camera when not following a round
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);if(!HM.mesh||!player||!player.himars)return;const want=0.95;HM.elev+=(want-HM.elev)*Math.min(1,dt*0.6);HM.mesh.userData.cage.rotation.x=HM.elev;
  // detect tactical-nuke impact
  for(const o of projs)if(o.tacnuke&&!o._tracked){o._tracked=true;HM.live=HM.live||[];HM.live.push(o);}
  if(HM.live)for(let i=HM.live.length-1;i>=0;i--){const o=HM.live[i];if(!projs.includes(o)){HM.live.splice(i,1);if(window.NFX&&NFX.smallNuke)NFX.smallNuke(o.pos.clone());}}};
 const _uc=updCamera;updCamera=function(dt){_uc(dt);if(!HM.mesh||!player||!player.himars||camFollow||(window.NFX&&NFX.IC&&NFX.IC.a))return;const m=HM.mesh;const a=(typeof FL!=='undefined'&&FL.yaw)||0;
  const back=new T.Vector3(Math.sin(m.rotation.y+0.6+a)*18,7,Math.cos(m.rotation.y+0.6+a)*18);camera.position.copy(m.position).add(back);camera.lookAt(m.position.x,m.position.y+2.5,m.position.z);};}
return {himars,patriot,mpq65,samSite,siloLF,install,M,setupPlayer,HM};})();
window.LAUNCHERS=LAUNCHERS;LAUNCHERS.install();try{LAUNCHERS.setupPlayer();}catch(e){console.error('himars',e);}
//GLAUNCHERS-END
