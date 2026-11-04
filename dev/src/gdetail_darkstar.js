//GDETAIL_DARKSTAR-BEGIN  SR-72 "Darkstar" (Top Gun: Maverick design) at gmissiles.js standard. Nose -Z, metres, origin ~ CG.
{const T=THREE,PI=Math.PI;let SK=null;
function cvs(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;}
function tex(c,srgb){const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
// skin: u around/across, v along length (0 tail -> 1 nose). Matte charcoal RAM, sawtooth panel edges, fasteners, heat-staining aft, stencils
function skin(){if(SK)return SK;const W=1024,H=2048;const Y=v=>(1-v)*H;
 const ht=cvs(W,H,(x)=>{x.fillStyle='#808080';x.fillRect(0,0,W,H);x.strokeStyle='#5a5a5a';x.lineWidth=3;
  const saw=(y)=>{x.beginPath();x.moveTo(0,y);for(let u=0;u<=W;u+=32)x.lineTo(u,y+((u/32)%2?10:-10));x.stroke();};
  for(const v of[0.08,0.2,0.34,0.5,0.63,0.76,0.86,0.93])saw(Y(v));
  for(const u of[0.18,0.32,0.5,0.68,0.82]){x.beginPath();x.moveTo(u*W,0);x.lineTo(u*W,H);x.stroke();}
  x.fillStyle='#4a4a4a';for(const v of[0.2,0.34,0.5,0.63,0.76])for(let u=0;u<W;u+=12){x.beginPath();x.arc(u,Y(v)+18,1.6,0,7);x.fill();}
  for(let i=0;i<26;i++){const u=Math.random()*W*0.8+W*0.1,v=Math.random()*0.85+0.05,w=30+Math.random()*90,h=20+Math.random()*80;x.strokeRect(u,Y(v),w,h);}});
 const col=cvs(W,H,(x)=>{x.fillStyle='#1d1f22';x.fillRect(0,0,W,H);
  for(let i=0;i<2600;i++){x.fillStyle=`rgba(${Math.random()<0.5?'0,0,0':'90,95,100'},${Math.random()*0.05})`;x.fillRect(Math.random()*W,Math.random()*H,4+Math.random()*50,2+Math.random()*20);}
  x.globalAlpha=0.35;x.drawImage(ht,0,0);x.globalAlpha=1;
  // RAM patch tiles (slightly different shade)
  for(let i=0;i<40;i++){x.fillStyle=`rgba(${Math.random()<0.5?40:15},${Math.random()<0.5?42:17},${Math.random()<0.5?46:20},0.45)`;x.fillRect(Math.random()*W,Math.random()*H,20+Math.random()*70,20+Math.random()*70);}
  // heat bluing / soot toward tail
  const g=x.createLinearGradient(0,Y(0),0,Y(0.22));g.addColorStop(0,'rgba(60,45,70,0.55)');g.addColorStop(0.5,'rgba(70,55,40,0.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,Y(0.22),W,Y(0)-Y(0.22));
  // leading-edge thermal tint near nose
  const n=x.createLinearGradient(0,Y(1),0,Y(0.85));n.addColorStop(0,'rgba(55,50,48,0.6)');n.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=n;x.fillRect(0,0,W,Y(0.85));
  // stencils (low-vis grey)
  const st=(t,u,v,s,r=0,c='rgba(150,155,160,0.75)')=>{x.save();x.translate(u*W,Y(v));x.rotate(r);x.fillStyle=c;x.font=`bold ${s}px "DejaVu Sans Condensed",Arial Narrow,Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(t,0,0);x.restore();};
  st('NO STEP',0.3,0.55,22,PI/2);st('NO STEP',0.7,0.55,22,PI/2);st('NO STEP',0.3,0.4,22,PI/2);st('NO STEP',0.7,0.4,22,PI/2);
  st('▲ RESCUE',0.5,0.9,22,PI/2,'rgba(200,120,60,0.8)');st('CANOPY JETTISON →',0.42,0.86,16,PI/2,'rgba(200,120,60,0.8)');
  st('DANGER — INTAKE',0.5,0.62,20,PI/2,'rgba(190,60,50,0.8)');st('FUEL  JP-7',0.62,0.47,18,PI/2);st('GND',0.36,0.3,16,PI/2);st('APU',0.64,0.26,16,PI/2);
  st('SR-72',0.5,0.72,70,PI/2,'rgba(140,145,150,0.55)');});
 const rg=cvs(512,1024,(x,w,h)=>{x.fillStyle='#b8b8b8';x.fillRect(0,0,w,h);x.globalAlpha=0.5;x.drawImage(ht,0,0,w,h);x.globalAlpha=1;for(let i=0;i<500;i++){const v=150+Math.random()*90|0;x.fillStyle=`rgba(${v},${v},${v},0.25)`;x.fillRect(Math.random()*w,Math.random()*h,8+Math.random()*30,4+Math.random()*20);}});
 // normal map from height
 const nm=(()=>{const w=512,h=1024;const s=cvs(w,h,(x)=>x.drawImage(ht,0,0,w,h)).getContext('2d').getImageData(0,0,w,h).data;const o=cvs(w,h,()=>{});const ox=o.getContext('2d');const id=ox.createImageData(w,h);const H=(i,j)=>s[((((j+h)%h)*w)+((i+w)%w))*4]/255;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i-1,j)-H(i+1,j))*2.2,dy=(H(i,j-1)-H(i,j+1))*2.2,l=Math.hypot(dx,dy,1),k=(j*w+i)*4;id.data[k]=(dx/l*.5+.5)*255;id.data[k+1]=(dy/l*.5+.5)*255;id.data[k+2]=(1/l*.5+.5)*255;id.data[k+3]=255;}ox.putImageData(id,0,0);return o;})();
 return SK={map:tex(col,true),rough:tex(rg,false),nrm:tex(nm,false)};}
const MC={};const mat=(k,f)=>MC[k]||(MC[k]=f());
const ram=()=>mat('ram',()=>{const s=skin();return new T.MeshPhysicalMaterial({color:0xffffff,map:s.map,roughnessMap:s.rough,normalMap:s.nrm,normalScale:new T.Vector2(0.4,0.4),roughness:0.82,metalness:0.18,clearcoat:0.12,clearcoatRoughness:0.6,side:T.DoubleSide});});
const S=(c,r,m)=>mat('s'+c+r+m,()=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}));
const add=(g,geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
// loft along z: sections {z, w (half width), t (top height), b (bottom depth), n (superellipse exponent), y (centre offset)}
function loft(secs,seg=40){const pos=[],uv=[],idx=[];const z0=secs[0].z,z1=secs[secs.length-1].z;
 secs.forEach((s,i)=>{for(let k=0;k<=seg;k++){const a=k/seg*PI*2;const c=Math.cos(a),sn=Math.sin(a);const e=2/s.n;const X=Math.sign(c)*Math.pow(Math.abs(c),e)*s.w;const Yv=Math.sign(sn)*Math.pow(Math.abs(sn),e)*(sn>0?s.t:s.b)+(s.y||0);pos.push(X,Yv,s.z);uv.push(k/seg,1-(s.z-z0)/(z1-z0));}
  if(i)for(let k=0;k<seg;k++){const a=(i-1)*(seg+1)+k,b=a+seg+1;idx.push(a,b,a+1,b,b+1,a+1);}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// thin lifting surface from planform (x,z) with thickness tapering to sharp edges
function plate(pts,th,uvScale=1){const s=new T.Shape(pts.map(([x,z])=>new T.Vector2(x,z)));const g=new T.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*0.5,bevelSize:th*1.2,bevelSegments:2,steps:1});g.rotateX(PI/2);g.translate(0,th/2,0);
 const p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<p.count;i++)u.setXY(i,0.5+p.getX(i)/30*uvScale,1-(p.getZ(i)+14)/30);g.computeVertexNormals();return g;}
function darkstar(){const g=new T.Group(),m=ram();
 // ---- fuselage: needle nose -> wide flat chined body -> boat-tail. Proportions per TGM full-scale mock-up, scaled to sim length 26 m ----
 const secs=[];const P=[[-14.2,0.02,0.02,0.02,2.2],[-13.6,0.22,0.16,0.10,2.2],[-12.2,0.55,0.34,0.22,2.4],[-10.5,0.9,0.55,0.35,2.6],[-8.6,1.25,0.82,0.45,2.8],[-6.8,1.6,0.95,0.55,3.2],[-4.5,2.2,0.95,0.62,3.8],[-2,2.9,0.9,0.66,4.4],[1,3.4,0.86,0.66,4.6],[4,3.6,0.8,0.62,4.6],[7,3.5,0.72,0.56,4.2],[9.5,3.2,0.6,0.5,3.8],[11.3,2.9,0.5,0.46,3.6]];
 for(const [z,w,t,b,n] of P)secs.push({z,w,t,b,n});const body=add(g,loft(secs,56),m);
 // sharp chine line (leading edge strake) both sides: thin plates from nose to wing root
 for(const s of[-1,1]){const pts=[[0,-13.4],[s*0.6,-11],[s*1.5,-8],[s*2.25,-5.2],[s*2.9,-2],[s*0.6,-2],[0,-6]];add(g,plate(s<0?pts.slice().reverse():pts,0.05),m,0,-0.05,0);}
 // ---- cranked-arrow delta wing, low-set, sharp leading edges ----
 const wing=[[2.8,-3],[5.2,2.6],[8.6,8.6],[8.8,10.2],[6.2,10.4],[2.8,10.6]];
 for(const s of[-1,1]){const pts=wing.map(([x,z])=>[s*x,z]);add(g,plate(s<0?pts:pts.slice().reverse(),0.16),m,0,-0.15,0);
  // wing-tip edge fairing + trailing-edge elevons with hinge gaps
  const el=add(g,new T.BoxGeometry(2.8,0.1,0.9),m,s*6.6,-0.1,10.95);el.userData.elevon=s;
  add(g,new T.BoxGeometry(2.8,0.02,0.04),S(0x050505,0.9,0),s*6.6,-0.03,10.5);
  add(g,new T.BoxGeometry(1.9,0.1,0.8),m,s*4.0,-0.1,11.0);
  // leading-edge thermal strip (slightly lighter carbon-carbon)
  const le=new T.Vector3(s*2.8,0,-3),te=new T.Vector3(s*8.6,0,8.6),d=te.clone().sub(le);const lg=add(g,new T.CylinderGeometry(0.06,0.06,d.length(),6),S(0x2b2c2e,0.55,0.3),0,-0.07,0);lg.position.copy(le.clone().add(te).multiplyScalar(0.5)).setY(-0.07);lg.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 // ---- twin outward-canted vertical tails with rudders, mounted on nacelle shoulders ----
 const fm=mat('finram',()=>{const c=m.clone();c.map=null;c.color.set(0x303236);return c;});
 for(const s of[-1,1]){const t=new T.Group();t.position.set(s*2.3,0.5,7.2);t.rotation.z=-s*0.42;g.add(t);
  const fin=add(t,plate([[0,-0.6],[4.4,2.6],[4.4,3.7],[0,3.9]],0.09),fm);fin.rotation.z=PI/2;fin.rotation.y=0;fin.position.set(0,0,0);
  fin.rotation.set(0,0,PI/2);
  const rud=add(t,new T.BoxGeometry(0.08,2.4,0.7),fm,0,1.5,3.7);rud.userData.rudder=s;
  // low-vis markings on fin: star + "DARKSTAR"
  const dc=cvs(256,256,(x,w,h)=>{x.fillStyle='rgba(120,125,130,0.7)';x.font='bold 30px Arial';x.textAlign='center';x.fillText('DARKSTAR',w/2,200);x.beginPath();for(let i=0;i<10;i++){const r=i%2?22:55,a=-PI/2+i*PI/5;x.lineTo(w/2+Math.cos(a)*r,110+Math.sin(a)*r);}x.closePath();x.fill();});
  const dm=mat('findec',()=>new T.MeshStandardMaterial({map:tex(dc,true),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:0.8}));
  const dp=add(t,new T.PlaneGeometry(1.8,1.8),dm,s*0.07,2.6,1.8);dp.rotation.y=s*PI/2;}
 // ---- belly propulsion: two-dimensional variable intake ramp (forward), combined-cycle (turbine + scramjet) nacelles, rectangular SERN nozzles ----
 const nac=loft([[1.0,0.0],[-3,0.05],[-1,0.9],[3,1.0],[7,1.05],[10,1.05],[11.4,1.0]].slice(1).map(([z,w],i)=>({z,w:w*1.0,t:0.3,b:0.55*w+0.05,n:5,y:-0.6})),24);
 for(const s of[-1,1]){const n=add(g,nac,m,s*1.3,0,0);n.scale.x=0.95;}
 // intake: dark throat with splitter plate + ramp lines
 add(g,new T.BoxGeometry(4.4,0.9,0.12),S(0x050506,0.95,0),0,-1.0,-2.7);add(g,new T.BoxGeometry(4.6,0.05,1.8),S(0x2b2c2e,0.6,0.5),0,-0.52,-3.4);
 for(const s of[-1,1]){const r=add(g,new T.BoxGeometry(0.06,0.9,2.2),m,s*2.25,-1.0,-3.6);r.rotation.y=s*0.12;}
 // nozzles: rectangular, internal ceramic liner, afterburner glow ring, external expansion ramp under fuselage
 for(const s of[-1,1]){const nz=new T.Group();nz.position.set(s*1.3,-0.95,11.4);g.add(nz);
  add(nz,new T.BoxGeometry(2.0,1.0,0.8),S(0x3a3632,0.45,0.75),0,0,0);add(nz,new T.BoxGeometry(1.7,0.72,0.82),S(0x090808,0.9,0.2),0,0,0.02);
  const liner=add(nz,new T.PlaneGeometry(1.6,0.62),mat('liner',()=>new T.MeshStandardMaterial({color:0x6a4a38,emissive:0xff6a20,emissiveIntensity:0.0,roughness:0.6,metalness:0.6})),0,0,0.2);liner.rotation.y=PI;g.userData.liner=liner.material;
  for(let k=0;k<6;k++)add(nz,new T.BoxGeometry(0.02,0.74,0.4),S(0x5a524a,0.5,0.8),-0.7+k*0.28,0,0.25);
  // heat-tinted titanium petals
  const tp=add(nz,new T.BoxGeometry(2.04,0.06,1.0),S(0x4b3f4e,0.35,0.9),0,0.52,0.3);const bp=add(nz,new T.BoxGeometry(2.04,0.06,1.4),S(0x55474a,0.35,0.9),0,-0.52,0.5);bp.rotation.x=0.12;}
 // ---- cockpit: long narrow canopy faired into spine, gold-tinted glazing, frame bows ----
 const cg=loft([{z:-9.4,w:0.05,t:0.05,b:0.01,n:2.5,y:0.75},{z:-8.6,w:0.42,t:0.36,b:0.01,n:2.5,y:0.78},{z:-7.0,w:0.5,t:0.5,b:0.01,n:2.5,y:0.85},{z:-5.6,w:0.46,t:0.42,b:0.01,n:2.5,y:0.88},{z:-4.2,w:0.3,t:0.18,b:0.01,n:2.5,y:0.9}],32);
 add(g,cg,mat('canopy',()=>new T.MeshPhysicalMaterial({color:0x2a2418,metalness:0.85,roughness:0.04,clearcoat:1,clearcoatRoughness:0.02,envMapIntensity:1.8,iridescence:0.4})));
 for(const z of[-8.0,-6.2])add(g,new T.TorusGeometry(0.5,0.035,6,20,PI),S(0x111214,0.5,0.6),0,0.86,z);
 // dorsal spine + fuel dump, antennas, pitot/air-data probe, flush ports
 add(g,loft([{z:-4.2,w:0.3,t:0.15,b:0.01,n:3,y:0.86},{z:2,w:0.55,t:0.25,b:0.01,n:3,y:0.84},{z:9,w:0.5,t:0.18,b:0.01,n:3,y:0.7},{z:11.6,w:0.3,t:0.05,b:0.01,n:3,y:0.55}],24),m);
 add(g,new T.CylinderGeometry(0.015,0.035,1.4,6).rotateX(PI/2),S(0xb0b4b8,0.25,1),0,0,-14.8);
 for(const [x,z] of[[0,-1],[0,4],[-0.6,6]]){const a=add(g,new T.BoxGeometry(0.03,0.35,0.5),S(0x2a2b2d,0.6,0.3),x,1.25,z);a.rotation.x=-0.4;}
 for(const s of[-1,1])for(let k=0;k<3;k++)add(g,new T.CircleGeometry(0.06,10),S(0x4a4b4d,0.5,0.6),s*0.6,0.1,-12.2+k*0.35).rotation.y=s*PI/2;
 // formation strip lights (slime lights) + nav lights
 const slime=mat('slime',()=>new T.MeshBasicMaterial({color:0x9cff7a,transparent:true,opacity:0.55}));
 for(const s of[-1,1]){add(g,new T.BoxGeometry(0.03,0.08,1.2),slime,s*3.2,0.05,-1.6);add(g,new T.SphereGeometry(0.07,8,6),mat('nl'+s,()=>new T.MeshBasicMaterial({color:s<0?0xff2a1a:0x22ff55})),s*8.75,-0.08,9.6);}
 // landing gear doors outlines (closed) on belly
 for(const [x,z,w,l] of[[0,-9.5,0.6,1.8],[-2.6,4,0.9,2.6],[2.6,4,0.9,2.6]])add(g,new T.BoxGeometry(w,0.01,l),S(0x111214,0.9,0.1),x,-0.69,z);
 // engine flames compatible with gair (userData.flame, positions at nozzle exits)
 const fl=new T.Group();for(const sx of[-1.3,1.3]){const f=new T.Mesh(new T.ConeGeometry(0.55,1,10).rotateX(PI/2).translate(0,0,0.5),typeof flameMat!=='undefined'?flameMat:S(0xff8030,1,0));f.position.set(sx,-0.95,11.9);f.scale.set(1.4,0.8,1);fl.add(f);}g.add(fl);g.userData.flame=fl;
 g.traverse(o=>{if(o.isMesh&&!o.material.transparent){o.castShadow=true;o.receiveShadow=true;}});
 // simple LOD for phone: far proxy = body + wings only
 return g;}
const _j=jet;jet=function(c,fa18,kind){if(kind!=='darkstar')return _j(c,fa18,kind);try{const g=darkstar();
  // nozzle liner glows with throttle
  g.onBeforeRender=()=>{};g.userData.updLiner=t=>{const L=g.userData.liner;if(L)L.emissiveIntensity=t*2.5;};return g;}catch(e){console.warn('darkstar',e);return _j(c,fa18,kind);}};
window.__darkstar=darkstar;}
//GDETAIL_DARKSTAR-END
