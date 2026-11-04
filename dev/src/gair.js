// ===== detailed aircraft (hand-built from real reference proportions) =====
function decalTex(draw,w=256,h=128){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function starPath(x,cx,cy,R){x.beginPath();for(let i=0;i<10;i++){const r=i%2?R*0.382:R,a=-Math.PI/2+i*Math.PI/5;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();}
const rndlTex=(lo)=>decalTex((x,w,h)=>{const c1=lo?'rgba(40,44,50,.85)':'#1d2f6b',c2=lo?'rgba(70,76,84,.8)':'#fff';x.fillStyle=c1;x.fillRect(w*0.06,h*0.36,w*0.88,h*0.3);x.fillStyle=c2;x.fillRect(w*0.08,h*0.4,w*0.84,h*0.22);if(!lo){x.fillStyle='#b22234';x.fillRect(w*0.1,h*0.47,w*0.8,h*0.08);}x.fillStyle=c1;x.beginPath();x.arc(w/2,h/2,h*0.42,0,7);x.fill();x.fillStyle=c2;starPath(x,w/2,h/2+2,h*0.4);x.fill();});
const RND_LO=rndlTex(true),RND_HI=rndlTex(false);
const tailTex=(code,num,col)=>decalTex((x,w,h)=>{x.fillStyle=col;x.font='bold 64px Arial';x.textAlign='center';x.fillText(code,w/2,72);x.font='bold 26px Arial';x.fillText(num,w/2,110);},256,128);
function decal(g,tex,w,h,pos,rot,op=0.9){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,transparent:true,opacity:op,roughness:0.6,metalness:0.2,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));m.position.set(...pos);m.rotation.set(...rot);g.add(m);return m;}
// fuselage: lathe profile [z,r] (nose -Z), squashed
function fuse(prof,sx,sy,mat,seg=20){const pts=prof.map(([z,r])=>new THREE.Vector2(Math.max(0.001,r),z));const geo=new THREE.LatheGeometry(pts,seg).rotateX(-Math.PI/2);geo.scale(sx,sy,1);geo.computeVertexNormals();return new THREE.Mesh(geo,mat);}
function wingX(pts,th,mat){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const geo=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*0.4,bevelSize:Math.min(0.12,th),bevelSegments:2,steps:1}).translate(0,0,-th/2).rotateX(-Math.PI/2);return new THREE.Mesh(geo,mat);}
function finX(pts,th,mat){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const geo=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*0.4,bevelSize:Math.min(0.08,th),bevelSegments:2,steps:1}).translate(0,0,-th/2).rotateY(Math.PI/2);return new THREE.Mesh(geo,mat);}
const mirror=(p)=>p.map(([a,b])=>[-a,b]);
function canopy(g,z,len,w,h,y,frame){const c=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),glassMat);c.scale.set(w,h,len);c.position.set(0,y,z);g.add(c);
 if(frame){const f=new THREE.Mesh(new THREE.TorusGeometry(1,0.06,6,16,Math.PI),M(frame));f.scale.set(w,h*1.02,1);f.position.set(0,y,z+len*0.15);g.add(f);}}
function aamMesh(g,x,y,z,l=3.6,r=0.09){const m=M(0xe8e8e2);add(g,cylZ(r,r,l,8),m,x,y,z);add(g,coneF(r,0.5,8),m,x,y,z-l/2-0.25);for(const a of [0,Math.PI/2])add(g,new THREE.BoxGeometry(0.42,0.02,0.3).rotateZ(a),m,x,y,z+l/2-0.3);}
function f35(c){const g=new THREE.Group(),m=M(c),md=M(c,DBL),dk=M(0x3a3f45);
 g.add(fuse([[-8.6,0],[-8,0.28],[-7,0.62],[-5.5,0.9],[-4,1.1],[-1,1.25],[2,1.25],[4.5,1.15],[6,0.85],[7.1,0.62]],1.3,0.8,m));
 // DSI bumps + caret intakes
 for(const s of [-1,1]){const b=add(g,new THREE.SphereGeometry(0.55,12,8),m,s*1.35,0.25,-4.2);b.scale.set(0.6,0.8,1.6);add(g,new THREE.BoxGeometry(0.5,0.8,0.12),dk,s*1.5,0.2,-3.5);
  const sd=add(g,new THREE.BoxGeometry(0.9,0.9,6),m,s*1.35,0.15,-0.8);sd.rotation.z=s*0.12;}
 const w=[[1.2,1.8],[5.35,-2.4],[5.35,-3.6],[1.2,-4.9]];g.add(wingX(w,0.16,m));g.add(wingX(mirror(w),0.16,m));
 for(const s of [-1,1]){const fl=wingX([[s*1.4,-4.9],[s*5.35,-3.55],[s*5.35,-3.75],[s*1.4,-5.2]],0.08,dk);fl.position.y=0.02;g.add(fl);}
 const hs=[[1,-5.6],[3.5,-6.9],[3.5,-7.9],[1,-7.6]];for(const p of [hs,mirror(hs)])g.add(wingX(p,0.1,m));
 for(const s of [-1,1]){const t=finX([[-3.6,0],[-5.6,2.4],[-6.6,2.4],[-6.9,0]],0.1,md);t.position.set(s*1.0,0.55,0);t.rotation.z=-s*0.44;g.add(t);
  decal(g,tailTex('OT','F-35A','rgba(60,66,74,.9)'),1.6,0.8,[s*(1.0+0.55)+s*0.07,1.65,-5.6],[0,s*Math.PI/2,-s*0.44]);}
 add(g,cylZ(0.62,0.72,0.9,16),M(0x2b2d30,{metalness:0.8,roughness:0.35}),0,0,7.4);
 canopy(g,-5.4,2.2,0.62,0.62,0.55,0x2e3236);
 decal(g,RND_LO,1.5,0.75,[3.6,0.14,-2.7],[-Math.PI/2,0,0]);decal(g,RND_LO,1.5,0.75,[-3.6,0.14,-2.7],[-Math.PI/2,0,0]);
 add(g,new THREE.SphereGeometry(0.08,6,4),M(0x111111),0,0.6,-8.0);
 return g;}
function fa18e(c){const g=new THREE.Group(),m=M(c),md=M(c,DBL),dk=M(0x2a2d31);
 g.add(fuse([[-9.4,0],[-8.8,0.3],[-7.6,0.62],[-6,0.86],[-4,0.95],[0,1.0],[4,1.05],[6.5,1.0],[8,0.8]],1.0,0.85,m));
 for(const s of [-1,1]){const n=add(g,new THREE.BoxGeometry(1.0,1.0,10),m,s*1.05,-0.35,1.8);add(g,new THREE.BoxGeometry(0.85,0.9,0.15),dk,s*1.05,-0.4,-3.25);
  const nz=add(g,cylZ(0.48,0.52,1.0,14),M(0x2b2d30,{metalness:0.8,roughness:0.35}),s*0.62,-0.1,7.4);}
 const lx=[[0.9,-3.2],[2.1,-0.6],[1.0,4.6]];g.add(wingX(lx.map(([a,b])=>[a,-b]),0.12,m));g.add(wingX(mirror(lx.map(([a,b])=>[a,-b])),0.12,m));
 const w=[[1.8,0.6],[6.8,-2.4],[6.8,-3.6],[1.8,-4.6]];g.add(wingX(w,0.18,m));g.add(wingX(mirror(w),0.18,m));
 const hs=[[1.2,-5.4],[4.1,-6.9],[4.1,-8.1],[1.2,-8.0]];for(const p of [hs,mirror(hs)])g.add(wingX(p,0.1,m));
 for(const s of [-1,1]){const t=finX([[-3.2,0],[-5.8,3.1],[-7.1,3.1],[-7.0,0]],0.1,md);t.position.set(s*1.2,0.6,0);t.rotation.z=-s*0.35;g.add(t);
  decal(g,tailTex('AG','VFA-103','#22252a'),1.8,0.9,[s*(1.2+0.6)+s*0.08,2.0,-5.6],[0,s*Math.PI/2,-s*0.35]);
  for(const x of [3.6,5.2])aamMesh(g,s*x,-0.45,-1.8);add(g,new THREE.BoxGeometry(0.12,0.4,1.6),m,s*3.6,-0.22,-1.8);add(g,new THREE.BoxGeometry(0.12,0.4,1.6),m,s*5.2,-0.22,-1.8);
  aamMesh(g,s*6.9,0,-2.7,3,0.07);}
 canopy(g,-5.6,2.6,0.6,0.7,0.6,0x2e3236);
 decal(g,RND_LO,1.6,0.8,[4.6,0.15,-2.0],[-Math.PI/2,0,0]);decal(g,RND_LO,1.6,0.8,[-4.6,0.15,-2.0],[-Math.PI/2,0,0]);
 decal(g,decalTex((x,w,h)=>{x.fillStyle='#202327';x.font='bold 70px Arial';x.textAlign='center';x.fillText('NAVY',w/2,90);}),2,1,[0,-0.05,2.5],[0,0,0]).visible=false;
 for(const s of [-1,1])decal(g,decalTex((x,w,h)=>{x.fillStyle='#202327';x.font='bold 70px Arial';x.textAlign='center';x.fillText('NAVY',w/2,90);}),1.6,0.8,[s*1.3,0,1.5],[0,s*Math.PI/2,0]);
 return g;}
function darkstarM(c){const g=new THREE.Group(),m=M(c,{roughness:0.75,metalness:0.2}),md=M(c,{roughness:0.75,metalness:0.2,side:THREE.DoubleSide});
 g.add(fuse([[-14,0],[-12,0.35],[-9,0.8],[-6,1.2],[-2,1.45],[3,1.5],[8,1.4],[11,1.2]],1.5,0.55,m,28));
 // blended chines + delta
 const ch=[[0.4,14],[2.2,6],[4.2,1],[7.6,-6],[7.6,-9],[0.8,-11.2]];g.add(wingX(ch.map(([a,b])=>[a,b-2]),0.25,m));g.add(wingX(mirror(ch.map(([a,b])=>[a,b-2])),0.25,m));
 for(const s of [-1,1]){const n=add(g,new THREE.BoxGeometry(1.4,0.8,13),m,s*1.9,-0.45,1.5);add(g,new THREE.BoxGeometry(1.3,0.6,0.2),M(0x0a0a0a),s*1.9,-0.45,-5.0);
  const t=finX([[-6,0],[-9.6,2.9],[-11,2.9],[-11.2,0]],0.12,md);t.position.set(s*1.9,0.2,0);t.rotation.z=-s*0.5;g.add(t);
  add(g,cylZ(0.6,0.6,0.6,14),M(0x2a2420,{metalness:0.8,roughness:0.4}),s*1.0,-0.2,11.2);}
 canopy(g,-8.2,2.6,0.6,0.42,0.38,0x111111);
 decal(g,RND_LO,1.4,0.7,[4.8,0.1,-4],[-Math.PI/2,0,0],0.5);decal(g,RND_LO,1.4,0.7,[-4.8,0.1,-4],[-Math.PI/2,0,0],0.5);
 return g;}
const _jet0=jet;
jet=function(c,fa18,kind){let g;try{g=kind==='darkstar'?darkstarM(c):fa18?fa18e(c):f35(c);}catch(e){console.warn('model',e);return _jet0(c,fa18);}
 const fl=new THREE.Group();const zN=kind==='darkstar'?11.6:7.9;for(const sx of (fa18?[-0.62,0.62]:kind==='darkstar'?[-1,1]:[0])){const f=new THREE.Mesh(new THREE.ConeGeometry(fa18?0.5:0.65,1,8).rotateX(Math.PI/2).translate(0,0,0.5),flameMat);f.position.set(sx,fa18?-0.1:0,zN);fl.add(f);}g.add(fl);g.userData.flame=fl;
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
