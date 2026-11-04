import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// ===== garmy.js: enemy ground forces that fight back (target practice). Tanks, infantry squads, SPAAG and SAM sites. SAMs route through gweak's weak spawnSAM + shared reload. =====
const ARMY=(()=>{
 const T=THREE,PI=Math.PI;
 // ---------- PBR canvas textures: 3-tone disruptive camo, grain, edge wear, rain streaks, mud splash rising from the bottom ----------
 function camoSet(key,o){const S=512;const al=document.createElement('canvas'),ro=document.createElement('canvas');al.width=al.height=ro.width=ro.height=S;const a=al.getContext('2d'),r=ro.getContext('2d');
  a.fillStyle=o.base;a.fillRect(0,0,S,S);r.fillStyle='#b4b4b4';r.fillRect(0,0,S,S);
  const blob=(c,n,sz)=>{a.fillStyle=c;for(let i=0;i<n;i++){const x=Math.random()*S,y=Math.random()*S;a.beginPath();for(let k=0;k<9;k++){const an=k/9*6.283,rr=sz*(0.5+Math.random()*0.7);a.lineTo(x+Math.cos(an)*rr*1.6,y+Math.sin(an)*rr);}a.closePath();a.fill();
   for(const dx of[-S,S])if(x+sz*2>S||x-sz*2<0){a.save();a.translate(dx,0);a.fill();a.restore();}}};
  for(const [c,n,sz] of o.blobs||[])blob(c,n,sz);
  const im=a.getImageData(0,0,S,S),d=im.data,rm=r.getImageData(0,0,S,S),rd=rm.data;
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const k=(j*S+i)*4;const n=(Math.random()-0.5)*o.grain;const streak=Math.sin(i*0.9+Math.sin(j*0.02)*3)*Math.sin(i*0.13)*0.5;
   const mud=Math.max(0,(j/S-o.mudFrom)/(1-o.mudFrom))**1.4*(0.6+0.4*Math.sin(i*0.07+Math.random()*0.8));
   for(let c=0;c<3;c++){let v=d[k+c]*(1+n/255)-streak*7;v=v*(1-mud*0.85)+[96,78,56][c]*mud*0.85;d[k+c]=Math.max(0,Math.min(255,v));}
   rd[k]=rd[k+1]=rd[k+2]=Math.min(255,170+mud*70+n*0.5);}
  a.putImageData(im,0,0);r.putImageData(rm,0,0);
  // chipped paint on edges + scratches
  for(let i=0;i<260;i++){const e=Math.random()<0.5;const x=e?(Math.random()<0.5?Math.random()*14:S-Math.random()*14):Math.random()*S,y=!e?(Math.random()<0.5?Math.random()*14:S-Math.random()*14):Math.random()*S;
   a.fillStyle=`rgba(${Math.random()<0.5?'60,55,48':'120,112,95'},${0.4+Math.random()*0.4})`;a.fillRect(x,y,1+Math.random()*5,1+Math.random()*3);}
  a.strokeStyle='rgba(150,140,120,0.25)';for(let i=0;i<40;i++){a.lineWidth=0.6;a.beginPath();const x=Math.random()*S,y=Math.random()*S;a.moveTo(x,y);a.lineTo(x+(Math.random()-0.5)*60,y+(Math.random()-0.5)*20);a.stroke();}
  // mud splatter dots
  for(let i=0;i<500;i++){const y=S*(o.mudFrom+Math.random()*(1-o.mudFrom));a.fillStyle=`rgba(${70+Math.random()*30},${58+Math.random()*20},${40},${0.3+Math.random()*0.5})`;a.beginPath();a.arc(Math.random()*S,y,0.6+Math.random()*2.6,0,7);a.fill();}
  const mk=(cv,srgb)=>{const t=new T.CanvasTexture(cv);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;};
  const mt=new T.MeshStandardMaterial({map:mk(al,1),roughnessMap:mk(ro),bumpMap:mk(ro),bumpScale:o.bump||1.2,roughness:1,metalness:o.metal||0.25,envMapIntensity:0.9,...(o.extra||{})});mt.name=key;return mt;}
 const MAT={
  camo:camoSet('camo',{base:'#646a45',blobs:[['#4f5a37',7,120],['#73664a',5,95],['#3a3c2e',4,60]],grain:22,mudFrom:0.6}),
  camoClean:camoSet('camoC',{base:'#646a45',blobs:[['#4f5a37',7,120],['#73664a',5,95],['#3a3c2e',4,60]],grain:18,mudFrom:0.95}),
  sand:camoSet('sand',{base:'#9a8a62',blobs:[['#8a7a54',30,30],['#a99a72',20,26]],grain:30,mudFrom:0.8,metal:0.0}),
  mud:camoSet('mud',{base:'#3e382c',blobs:[['#544a38',40,20],['#2a2620',30,14]],grain:40,mudFrom:0.2,metal:0.4,bump:2}),
  cloth:camoSet('cloth',{base:'#5d6644',blobs:[['#4a5534',30,40],['#736a4c',20,30],['#383a2c',14,22]],grain:30,mudFrom:0.85,metal:0}),
  bag:camoSet('bag',{base:'#8c7c58',blobs:[['#7a6c4c',40,12]],grain:50,mudFrom:0.7,metal:0,bump:3}),
  steel:new T.MeshStandardMaterial({color:0x3c3e3a,roughness:0.55,metalness:0.8}),
  bright:new T.MeshStandardMaterial({color:0x8a8a84,roughness:0.35,metalness:0.95}),
  rub:new T.MeshStandardMaterial({color:0x1b1b1a,roughness:0.9,metalness:0}),
  black:new T.MeshStandardMaterial({color:0x111111,roughness:0.6,metalness:0.4}),
  canvas:new T.MeshStandardMaterial({color:0x4a4a36,roughness:1,metalness:0}),
  glass:glassMat,
  lens:new T.MeshStandardMaterial({color:0x550000,emissive:0x330000,roughness:0.15,metalness:0.2}),
  lamp:new T.MeshStandardMaterial({color:0xddddcc,emissive:0x222218,roughness:0.1,metalness:0.6}),
  skin:new T.MeshStandardMaterial({color:0xa07a5e,roughness:0.75,metalness:0}),
  wood:new T.MeshStandardMaterial({color:0x5b4630,roughness:0.95,metalness:0}),
  cable:new T.MeshStandardMaterial({color:0x2a2a28,roughness:0.5,metalness:0.7})};
 function decalMat(txt,w=256,h=128,col='#e8e4d8'){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.font=`bold ${h*0.8}px Arial Narrow,Arial`;x.textAlign='center';x.textBaseline='middle';
  x.fillStyle=col;x.fillText(txt,w/2,h/2+4);x.globalCompositeOperation='destination-out';for(let i=0;i<220;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.7})`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*4,1+Math.random()*3);}
  const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.85,metalness:0.1,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});}
 const DEC={n1:decalMat('214'),n2:decalMat('327'),n3:decalMat('118'),chev:decalMat('◣◢',256,128,'#e8e4d8'),sam:decalMat('512'),aa:decalMat('09')};
 const P=(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;};
 const B=(w,h,l)=>new T.BoxGeometry(w,h,l),CX=(r1,r2,l,s=12)=>new T.CylinderGeometry(r1,r2,l,s).rotateZ(PI/2),CZ=(r1,r2,l,s=12)=>new T.CylinderGeometry(r1,r2,l,s).rotateX(PI/2),CY=(r1,r2,l,s=12)=>new T.CylinderGeometry(r1,r2,l,s);
 // merge every direct mesh child of g by material -> few draw calls, full detail
 function bake(g){const by=new Map();for(const c of [...g.children])if(c.isMesh&&!c.userData.keep){c.updateMatrix();const geo=c.geometry.clone().applyMatrix4(c.matrix);const gg=geo.index?geo.toNonIndexed():geo;
   for(const k of Object.keys(gg.attributes))if(!['position','normal','uv'].includes(k))gg.deleteAttribute(k);if(!gg.attributes.uv)gg.setAttribute('uv',new T.BufferAttribute(new Float32Array(gg.attributes.position.count*2),2));
   (by.get(c.material)||by.set(c.material,[]).get(c.material)).push(gg);g.remove(c);}
  for(const [m,arr] of by){const o=new T.Mesh(mergeGeometries(arr),m);o.castShadow=true;o.receiveShadow=true;g.add(o);}return g;}
 const bakeAll=g=>{const gs=[];g.traverse(o=>{if(o.isGroup||o===g)gs.push(o);});gs.forEach(bake);return g;};
 // ---------- running gear: dished road wheels, bolts, rubber tyres, toothed sprocket, idler, rollers, articulated track ----------
 function wheel(g,x,y,z,s,r=0.42){P(g,CX(r,r,0.3,20),MAT.rub,x,y,z);P(g,CX(r*0.86,r*0.86,0.34,20),MAT.mud,x,y,z);P(g,CX(r*0.6,r*0.7,0.38,16),MAT.camo,x,y,z);
  P(g,CX(0.13,0.15,0.44,10),MAT.steel,x,y,z);for(let k=0;k<8;k++){const a=k/8*2*PI;P(g,CX(0.025,0.025,0.42,6),MAT.bright,x,y+Math.cos(a)*0.2,z+Math.sin(a)*0.2);}}
 function sprocket(g,x,y,z,r=0.36){P(g,CX(r,r,0.36,18),MAT.steel,x,y,z);P(g,CX(r*0.5,r*0.5,0.42,10),MAT.camo,x,y,z);for(let k=0;k<12;k++){const a=k/12*2*PI;P(g,B(0.32,0.09,0.09),MAT.steel,x,y+Math.cos(a)*(r+0.05),z+Math.sin(a)*(r+0.05),a);}}
 function track(g,x,zF,zR,yB,yT,rF,rR){const link=(px,py,pz,ang)=>{P(g,B(0.62,0.07,0.15),MAT.mud,px,py,pz,ang);P(g,B(0.06,0.12,0.08),MAT.steel,px,py+Math.cos(ang)*0.07,pz-Math.sin(ang)*0.07,ang);P(g,B(0.6,0.03,0.035),MAT.steel,px,py-Math.cos(ang)*0.045,pz+Math.sin(ang)*0.045,ang);};
  for(let z=zF;z<=zR;z+=0.17)link(x,yB,z,0);for(let z=zF;z<=zR;z+=0.17)link(x,yT+Math.sin((z-zF)/(zR-zF)*PI*4)*0.02,z,PI);
  const arc=(cz,cy,r,a0,a1)=>{for(let a=a0;a<=a1;a+=0.4)link(x,cy-Math.cos(a)*r,cz+Math.sin(a)*r*(cz<0?-1:1),a*(cz<0?-1:1));};arc(zR,(yB+yT)/2,(yT-yB)/2,0.3,2.8);arc(zF,(yB+yT)/2,(yT-yB)/2,0.3,2.8);}
 function hullT(len=6.7,wid=3.5,nW=6,ret=3,skirt=true){const h=new T.Group();h.name='hull';
  P(h,B(wid,0.82,len),MAT.camo,0,1.08,0);P(h,B(wid-0.7,0.55,len-0.4),MAT.camo,0,0.62,0);
  const gl=P(h,B(wid,0.14,1.5),MAT.camo,0,1.2,-len/2-0.55,-0.32);P(h,B(wid-0.6,0.12,1.3),MAT.mud,0,0.72,-len/2-0.45,0.62);
  P(h,B(wid,0.85,0.18),MAT.camo,0,1.0,len/2+0.05,-0.1); // rear plate
  for(const s of[-1,1]){const tx=s*(wid/2-0.28);
   for(let i=0;i<nW;i++)wheel(h,tx,0.48,-len/2+0.95+i*(len-1.9)/(nW-1),s);
   for(let i=0;i<ret;i++)P(h,CX(0.12,0.12,0.3,10),MAT.steel,tx,1.0,-len/2+1.6+i*(len-3.2)/Math.max(1,ret-1));
   sprocket(h,tx,0.78,len/2-0.15);P(h,CX(0.33,0.33,0.32,16),MAT.steel,tx,0.78,-len/2+0.1);P(h,CX(0.18,0.18,0.36,10),MAT.camo,tx,0.78,-len/2+0.1);
   track(h,tx,-len/2+0.1,len/2-0.15,0.05,1.17,0.36,0.36);
   P(h,B(0.66,0.05,len+0.3),MAT.camo,tx,1.5,0); // fender
   P(h,B(0.66,0.4,0.04),MAT.rub,tx,1.3,-len/2-0.12); // mud flap
   if(skirt){for(let i=0;i<6;i++){P(h,B(0.05,0.62,len/6-0.04),MAT.camo,s*(wid/2+0.07),1.2,-len/2+len/12+i*len/6);P(h,B(0.04,0.22,len/6-0.04),MAT.rub,s*(wid/2+0.07),0.79,-len/2+len/12+i*len/6);}
    for(let i=0;i<3;i++)P(h,B(0.14,0.5,0.62),MAT.camoClean,s*(wid/2+0.15),1.2,-len/2+0.4+i*0.66);}
   // tow cable along hull side, headlights, toolbox
   for(let i=0;i<10;i++)P(h,CZ(0.035,0.035,len*0.08,6),MAT.cable,s*(wid/2-0.6)+Math.sin(i)*0.03,1.53,-len*0.4+i*len*0.08);
   P(h,CY(0.1,0.1,0.12,12),MAT.black,s*1.25,1.6,-len/2+0.2);P(h,CZ(0.08,0.08,0.03,12),MAT.lamp,s*1.25,1.6,-len/2+0.12);
   P(h,B(0.55,0.32,1.1),MAT.camo,s*1.28,1.68,len/2-1.6);}
  // ERA grid on glacis (follows glacis slope)
  const era=new T.Group();era.position.copy(gl.position);era.rotation.x=-0.32;h.add(era);
  for(let r=0;r<2;r++)for(let i=0;i<8;i++){P(era,B(0.4,0.12,0.62),MAT.camoClean,-1.47+i*0.42,0.13,-0.33+r*0.66);P(era,B(0.08,0.02,0.08),MAT.bright,-1.47+i*0.42,0.2,-0.33+r*0.66);}
  // engine deck: grille slats, exhaust, log, drums
  for(let i=0;i<14;i++)P(h,B(2.2,0.04,0.06),MAT.black,0,1.52,len/2-1.9+i*0.12);
  P(h,B(0.8,0.35,0.15),MAT.black,-wid/2+0.3,1.15,len/2+0.1);P(h,CX(0.17,0.17,wid-0.4,12),MAT.wood,0,1.65,len/2+0.05);
  for(const s of[-1,1]){P(h,CZ(0.3,0.3,1.0,16),MAT.camo,s*0.9,1.65,len/2-0.1);P(h,CZ(0.31,0.31,0.05,16),MAT.steel,s*0.9,1.65,len/2-0.35);P(h,CZ(0.31,0.31,0.05,16),MAT.steel,s*0.9,1.65,len/2+0.15);}
  P(h,B(0.6,0.12,0.6),MAT.steel,-0.6,1.52,-len/2+0.9);P(h,B(0.25,0.08,0.18),MAT.glass,-0.6,1.6,-len/2+0.7); // driver hatch + periscope
  return h;}
 const tankT=(()=>{const g=new T.Group();g.add(hullT());
  const tu=new T.Group();tu.name='tu';tu.position.set(0,1.52,0.25);g.add(tu);
  const sh=new T.Shape();[[0,-2.0],[1.15,-1.7],[1.7,-0.6],[1.75,0.9],[1.3,1.65],[-1.3,1.65],[-1.75,0.9],[-1.7,-0.6],[-1.15,-1.7]].forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z));
  const tg=new T.ExtrudeGeometry(sh,{depth:0.72,bevelEnabled:true,bevelThickness:0.1,bevelSize:0.12,bevelSegments:2}).rotateX(PI/2).translate(0,0.82,0);P(tu,tg,MAT.camoClean,0,0,0);
  // Kontakt-style "brow" ERA wedges
  for(const s of[-1,1])for(let i=0;i<4;i++){P(tu,B(0.36,0.42,0.5),MAT.camoClean,s*(0.55+i*0.34),0.5,-1.75+i*0.17,0.15,s*0.55);P(tu,B(0.06,0.02,0.06),MAT.bright,s*(0.55+i*0.34),0.73,-1.75+i*0.17);}
  for(let i=0;i<9;i++)P(tu,B(0.34,0.1,0.42),MAT.camoClean,-1.3+i*0.32,0.9,-0.9+Math.abs(i-4)*0.07);
  // smoke dischargers, Shtora dazzlers, sights, cupola + HMG, antennas, bustle box, snorkel
  for(const s of[-1,1]){for(let i=0;i<6;i++)P(tu,CY(0.065,0.065,0.42,8).rotateX(-0.5),MAT.black,s*(1.25+i*0.08),0.58+i*0.04,-0.6+i*0.18,0,0,-s*0.6);
   P(tu,B(0.42,0.38,0.32),MAT.camo,s*0.75,0.32,-1.95);P(tu,new T.CircleGeometry(0.13,16),MAT.lens,s*0.75,0.32,-2.12,0,PI);}
  P(tu,B(0.5,0.42,0.6),MAT.camo,-0.75,1.0,-0.7);P(tu,B(0.42,0.25,0.04),MAT.glass,-0.75,1.04,-1.01);
  P(tu,CY(0.45,0.48,0.25,18),MAT.steel,0.62,0.93,0.15);P(tu,CY(0.42,0.42,0.06,18),MAT.camo,0.62,1.08,0.15);
  for(let k=0;k<6;k++){const a=k/6*2*PI;P(tu,B(0.1,0.08,0.06),MAT.glass,0.62+Math.cos(a)*0.46,0.98,0.15+Math.sin(a)*0.46,0,-a);}
  P(tu,CZ(0.03,0.03,1.3,8),MAT.black,0.62,1.32,-0.55);P(tu,B(0.14,0.18,0.5),MAT.black,0.62,1.32,0.05);P(tu,B(0.2,0.2,0.3),MAT.camo,0.82,1.25,0.0);P(tu,B(0.5,0.35,0.05),MAT.camo,0.62,1.35,-0.35);
  P(tu,CY(0.012,0.008,3.0,4),MAT.black,0.95,2.3,1.3);P(tu,CY(0.012,0.008,2.4,4),MAT.black,-0.95,2.0,1.3);
  P(tu,B(2.6,0.6,0.8),MAT.camo,0,0.55,2.05);for(let i=0;i<3;i++)P(tu,B(0.06,0.62,0.82),MAT.canvas,-0.9+i*0.9,0.56,2.05);
  P(tu,CY(0.18,0.18,1.6,12).rotateZ(PI/2),MAT.camo,0,1.0,2.2);
  P(tu,B(0.18,0.11,0.42),DEC.n1,1.86,0.55,0.7,0,PI/2).scale.set(1,1,1);
  // gun: canvas mantlet cover, thermal sleeve rings, bore evacuator, MRS, muzzle
  const gun=new T.Group();gun.name='gun';gun.position.set(0,0.55,-1.9);tu.add(gun);
  P(gun,B(0.9,0.6,0.5),MAT.canvas,0,0,0.1);for(let i=0;i<4;i++)P(gun,B(0.95,0.04,0.52),MAT.canvas,0,-0.24+i*0.16,0.1);
  P(gun,CZ(0.15,0.17,5.6,16),MAT.camoClean,0,0,-2.8);for(let i=0;i<4;i++)P(gun,CZ(0.175,0.175,0.07,16),MAT.steel,0,0,-0.6-i*1.25);
  P(gun,CZ(0.23,0.23,0.9,16),MAT.camoClean,0,0,-2.4);P(gun,CZ(0.16,0.2,0.12,16),MAT.steel,0,0,-1.9);P(gun,CZ(0.16,0.2,0.12,16),MAT.steel,0,0,-2.9);
  P(gun,CZ(0.17,0.15,0.35,16),MAT.steel,0,0,-5.6);P(gun,CZ(0.06,0.06,0.05,12),MAT.black,0,0,-5.8);P(gun,B(0.08,0.08,0.14),MAT.steel,0,0.2,-5.45);
  // decals on turret sides + rear hull chevron
  for(const s of[-1,1]){const d=P(tu,new T.PlaneGeometry(0.85,0.42),DEC.n1,s*1.79,0.45,0.4,0,s*PI/2);d.userData.keep=1;}
  {const d=P(g.children[0],new T.PlaneGeometry(1.2,0.6),DEC.chev,0,1.1,3.47);d.userData.keep=1;}
  return bakeAll(g);})();
 // ---------- ZSU-type SPAAG: hull, louvred turret, 4 x 23 mm with flash hiders & cooling jackets, folding dish ----------
 const spaagT=(()=>{const g=new T.Group();g.add(hullT(6.3,3.1,6,0,false));
  const tu=new T.Group();tu.name='tu';tu.position.set(0,1.5,0.4);g.add(tu);
  const sh=new T.Shape();[[0,-1.9],[1.4,-1.5],[1.45,1.6],[-1.45,1.6],[-1.4,-1.5]].forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z));
  P(tu,new T.ExtrudeGeometry(sh,{depth:1.0,bevelEnabled:true,bevelThickness:0.06,bevelSize:0.08,bevelSegments:1}).rotateX(PI/2).translate(0,1.06,0),MAT.camoClean);
  for(const s of[-1,1]){for(let i=0;i<7;i++)P(tu,B(0.05,0.05,0.35),MAT.black,s*1.47,0.35+i*0.1,0.9);P(tu,B(0.05,0.5,1.0),MAT.camo,s*1.5,0.6,-0.5);
   const d=P(tu,new T.PlaneGeometry(0.7,0.35),DEC.aa,s*1.535,0.7,0.6,0,s*PI/2);d.userData.keep=1;}
  for(let i=0;i<3;i++)P(tu,CY(0.22,0.24,0.14,12),MAT.steel,-0.6+i*0.6,1.15,0.9);P(tu,B(0.4,0.3,0.4),MAT.camo,0.8,1.2,-0.7);P(tu,B(0.3,0.15,0.04),MAT.glass,0.8,1.25,-0.91);
  const arm=new T.Group();arm.position.set(0,1.1,1.4);tu.add(arm);P(arm,CY(0.08,0.1,0.9,10),MAT.steel,0,0.45,0);
  const dish=new T.Group();dish.name='dish';dish.position.set(0,1.0,0);arm.add(dish);P(dish,new T.SphereGeometry(0.75,20,10,0,2*PI,0,1.0).rotateX(-PI/2),new T.MeshStandardMaterial({map:MAT.camo.map,roughness:0.8,metalness:0.3,side:T.DoubleSide}),0,0,0.35);P(dish,CZ(0.04,0.04,0.7,6),MAT.steel,0,0,-0.1);P(dish,B(0.16,0.16,0.16),MAT.black,0,0,-0.45);
  const gun=new T.Group();gun.name='gun';gun.position.set(0,0.75,-1.5);tu.add(gun);
  for(const sx of[-1.05,1.05])for(const sy of[-0.17,0.2]){P(gun,CZ(0.045,0.045,2.5,8),MAT.black,sx,sy,-1.3);P(gun,CZ(0.08,0.08,1.0,10),MAT.steel,sx,sy,-0.5);for(let k=0;k<5;k++)P(gun,CZ(0.09,0.09,0.03,10),MAT.black,sx,sy,-0.1-k*0.2);P(gun,CZ(0.07,0.06,0.28,10),MAT.black,sx,sy,-2.62);}
  for(const sx of[-1.05,1.05])P(gun,B(0.4,0.75,0.9),MAT.camoClean,sx,0,0.1);P(gun,CX(0.1,0.1,2.2,10),MAT.steel,0,0,0.1);
  return bakeAll(g);})();
 // ---------- 8x8 truck chassis: cab w/ glazing, grille, mirrors, tanks, wheels w/ hubs & bolts ----------
 function truck(g){P(g,B(2.5,0.45,10),MAT.steel,0,1.15,0);P(g,B(2.6,1.7,2.3),MAT.camo,0,2.15,-4.0);P(g,B(2.62,0.25,2.32),MAT.camoClean,0,3.1,-4.0);
  P(g,B(2.2,0.7,0.06),MAT.glass,0,2.55,-5.17);for(const s of[-1,1]){P(g,B(0.06,0.6,1.0),MAT.glass,s*1.31,2.55,-4.3);P(g,B(0.05,0.3,0.2),MAT.black,s*1.45,2.6,-5.0);P(g,CY(0.015,0.015,0.6,4),MAT.black,s*1.4,2.4,-5.0);
   P(g,CZ(0.08,0.08,0.03,10),MAT.lamp,s*0.95,1.55,-5.18);P(g,CX(0.35,0.35,1.4,14),MAT.camo,s*1.1,1.0,-2.3);P(g,B(0.9,0.12,0.8),MAT.black,s*1.25,0.85,-1.3);}
  for(let i=0;i<9;i++)P(g,B(1.6,0.05,0.04),MAT.black,0,1.3+i*0.07,-5.17);P(g,B(2.7,0.2,0.3),MAT.black,0,1.0,-5.2);
  for(const s of[-1,1])for(const z of[-4.1,-2.6,1.4,2.9]){const x=s*1.2;P(g,CX(0.62,0.62,0.48,22),MAT.rub,x,0.62,z);P(g,CX(0.4,0.4,0.5,16),MAT.mud,x,0.62,z);P(g,CX(0.16,0.2,0.56,10),MAT.steel,x,0.62,z);
   for(let k=0;k<8;k++){const a=k/8*2*PI;P(g,CX(0.025,0.025,0.54,6),MAT.bright,x,0.62+Math.cos(a)*0.28,z+Math.sin(a)*0.28);}
   P(g,B(0.6,0.06,1.5),MAT.camo,x,1.3,z);}
  // outrigger jacks
  for(const s of[-1,1])for(const z of[-2.8,4.4]){P(g,B(0.9,0.12,0.15),MAT.steel,s*1.55,0.9,z);P(g,CY(0.06,0.06,0.9,8),MAT.bright,s*1.95,0.5,z);P(g,CY(0.25,0.25,0.06,12),MAT.steel,s*1.95,0.04,z);}}
 const samT=(()=>{const g=new T.Group();const tel=new T.Group();g.add(tel);truck(tel);
  P(tel,B(2.4,0.35,6.4),MAT.camo,0,1.55,1.5);P(tel,B(2.0,0.8,1.2),MAT.camo,0,2.0,-2.3);for(let i=0;i<6;i++)P(tel,B(0.04,0.6,1.0),MAT.black,0.9,2.0,-2.3+(i-2.5)*0.18);
  const rack=new T.Group();rack.name='tu';rack.position.set(0,1.8,4.4);tel.add(rack);rack.rotation.x=0.08;
  for(const sx of[-0.64,0.64])for(const sz of[-0.66,0.0]){P(rack,CY(0.34,0.34,7.4,20),MAT.sand,sx,3.85,sz);for(let k=0;k<5;k++)P(rack,CY(0.365,0.365,0.12,20),MAT.steel,sx,0.6+k*1.6,sz);
   P(rack,CY(0.38,0.38,0.3,20),MAT.camo,sx,7.55,sz);P(rack,CY(0.38,0.38,0.3,20),MAT.camo,sx,0.2,sz);P(rack,new T.SphereGeometry(0.34,14,6,0,2*PI,0,0.6),MAT.camo,sx,7.62,sz);}
  P(rack,B(2.2,6.8,0.18),MAT.steel,0,3.7,0.48);for(let i=0;i<5;i++)P(rack,B(2.3,0.14,1.1),MAT.camo,0,0.8+i*1.5,-0.33);
  for(const s of[-1,1])P(rack,CY(0.1,0.1,3.0,10).rotateX(0.5),MAT.bright,s*0.9,-0.2,-1.3);
  {const d=P(tel,new T.PlaneGeometry(0.9,0.45),DEC.sam,1.32,2.1,-3.6,0,PI/2);d.userData.keep=1;}
  // radar truck: mast, phased array panel w/ elements, generator, cable run
  const rt=new T.Group();rt.position.set(16,0,-6);rt.rotation.y=0.6;g.add(rt);truck(rt);P(rt,B(2.5,1.6,5.2),MAT.camo,0,2.2,1.6);for(let i=0;i<8;i++)P(rt,B(0.04,1.2,0.05),MAT.black,1.27,2.2,-0.6+i*0.6);
  P(rt,CY(0.2,0.28,2.4,12),MAT.steel,0,4.1,1.8);const ant=new T.Group();ant.name='ant';ant.position.set(0,5.2,1.8);rt.add(ant);
  P(ant,B(3.6,2.6,0.28),MAT.camoClean,0,1.35,0,-0.25);for(let i=0;i<9;i++)for(let j=0;j<6;j++)P(ant,B(0.32,0.34,0.05),MAT.black,-1.6+i*0.4,0.48+j*0.37,-0.18+j*0.09,-0.25);
  P(ant,B(3.8,0.14,0.4),MAT.steel,0,0.05,0);P(ant,B(0.3,0.5,0.3),MAT.camo,1.9,1.3,0.1);
  P(g,B(2.0,1.4,1.4),MAT.camo,8,0.7,10);for(let i=0;i<6;i++)P(g,B(0.05,1.0,1.2),MAT.black,9.02,0.75,9.5+i*0.2-0.5);P(g,CY(0.08,0.08,1.2,8),MAT.black,8.5,1.8,10);
  for(let i=0;i<20;i++)P(g,CZ(0.04,0.04,1.0,6),MAT.cable,8+i*0.4,0.04,10-i*0.8,0,-0.45);
  // sandbag berm: individual bags, two staggered courses
  for(let L=0;L<3;L++){const n=72-L*4;for(let i=0;i<n;i++){const a=(i+(L%2)*0.5)/n*2*PI;if(Math.abs(a-PI*0.5)<0.3)continue;const R=12-L*0.25;P(g,new T.CapsuleGeometry(0.28,0.6,3,6).rotateZ(PI/2),MAT.bag,Math.cos(a)*R,0.25+L*0.42,Math.sin(a)*R,0,-a+PI/2,0).scale.set(1,0.75,1);}}
  return bakeAll(g);})();
 // ---------- infantry: boots, knee pads, plate carrier w/ mag pouches, pack, helmet w/ NVG mount & cover, AK-pattern rifle ----------
 const soldierT=(kneel)=>{const s=new T.Group();s.name='man';const leg=(x)=>{if(kneel&&x>0){P(s,CY(0.085,0.08,0.45,8),MAT.cloth,x,0.45,0.05,PI/2);P(s,CY(0.085,0.075,0.45,8),MAT.cloth,x,0.22,0.28);P(s,B(0.13,0.12,0.28),MAT.black,x,0.05,0.28);}
   else{const hy=kneel?0.25:0.65;P(s,CY(0.09,0.085,0.45,8),MAT.cloth,x,kneel?0.45:0.73,kneel?0.2:0,kneel?-0.9:0);P(s,CY(0.085,0.075,0.45,8),MAT.cloth,x,kneel?0.12:0.3,kneel?0.42:0,kneel?PI/2:0);
    P(s,B(0.13,0.12,0.28),MAT.black,x,0.06,kneel?0.7:-0.04);if(!kneel)P(s,B(0.12,0.12,0.06),MAT.black,x,0.5,-0.08);}};
  leg(-0.11);leg(0.11);const y0=kneel?-0.35:0;
  P(s,CY(0.2,0.17,0.6,10),MAT.cloth,0,1.2+y0,0);P(s,B(0.44,0.44,0.32),MAT.camoClean,0,1.22+y0,0);
  for(let i=0;i<3;i++)P(s,B(0.11,0.17,0.07),MAT.cloth,-0.13+i*0.13,1.12+y0,-0.19);P(s,B(0.14,0.1,0.07),MAT.black,0.15,1.38+y0,-0.18);
  P(s,B(0.36,0.42,0.2),MAT.cloth,0,1.25+y0,0.26);P(s,CX(0.1,0.1,0.34,8),MAT.canvas,0,1.5+y0,0.27);
  P(s,CY(0.06,0.06,0.1,8),MAT.skin,0,1.55+y0,0);P(s,new T.SphereGeometry(0.11,12,10),MAT.skin,0,1.68+y0,0);
  P(s,new T.SphereGeometry(0.145,14,8,0,2*PI,0,1.55),MAT.cloth,0,1.71+y0,0);P(s,B(0.06,0.05,0.04),MAT.black,0,1.78+y0,-0.14);P(s,B(0.18,0.04,0.03),MAT.black,0,1.66+y0,-0.11);
  const arm=(x,rx,rz)=>{P(s,CY(0.06,0.055,0.32,8),MAT.cloth,x,1.28+y0,-0.1,rx,0,rz);P(s,CY(0.055,0.05,0.3,8),MAT.cloth,x*0.7,1.24+y0,-0.32,PI/2,0,rz);P(s,new T.SphereGeometry(0.05,8,6),MAT.black,x*0.5,1.26+y0,-0.48);};
  arm(0.24,0.9,-0.2);arm(-0.22,1.1,0.3);
  const r=new T.Group();r.position.set(0.06,1.3+y0,-0.45);s.add(r);P(r,B(0.05,0.1,0.42),MAT.black,0,0,0);P(r,B(0.05,0.08,0.25),MAT.wood,0,-0.01,-0.32);P(r,CZ(0.012,0.012,0.4,6),MAT.black,0,0.02,-0.62);
  P(r,B(0.05,0.12,0.3),MAT.wood,0,-0.03,0.34);P(r,B(0.04,0.22,0.08),MAT.black,0,-0.13,-0.06,0.3);P(r,B(0.035,0.04,0.12),MAT.black,0,0.07,0.05);
  return s;};
 const MAN=[soldierT(false),soldierT(true)].map(bakeAll);
 const tank=()=>tankT.clone(),spaag=()=>spaagT.clone(),samSite=()=>samT.clone();
 function squad(){const g=new T.Group();for(let i=0;i<5;i++){const s=MAN[i%2].clone();s.position.set((i-2)*2.2+rnd(0.5),0,Math.abs(i-2)*1.4+rnd(0.5));s.rotation.y=rnd(0.35);g.add(s);}
  const radio=new T.Mesh(CY(0.008,0.006,1.1,4),MAT.black);radio.position.set(0.12,2.0,0.3);g.children[2].add(radio);return g;}
 function refs(g){const u={};g.traverse(o=>{if(o.name==='tu')u.tu=o;if(o.name==='gun')u.gun=o;if(o.name==='hull')u.hull=o;if(o.name==='dish')u.dish=o;if(o.name==='ant')u.ant=o;});u.men=g.children.filter(c=>c.name==='man');if(!u.gun)u.gun=u.tu;g.userData=u;return g;}
 const CHAR=new T.MeshStandardMaterial({color:0x14110e,roughness:0.95,metalness:0.15,map:MAT.mud.map});
 const KIND={tank:{name:'Enemy MBT',make:tank,r:2500,rel:7,score:200},spaag:{name:'SPAAG',make:spaag,r:3000,rel:0.12,score:250},sam:{name:'SAM site',make:samSite,r:7000,rel:30,score:300},inf:{name:'Infantry squad',make:squad,r:900,rel:1.6,score:100}};
 const LAND=[{x:ENEMY.x,z:ENEMY.z,R:1700,n:{tank:6,spaag:2,sam:1,inf:5}},{x:-9000,z:-7000,R:2000,n:{tank:5,spaag:2,sam:1,inf:4}},{x:-20000,z:-1500,R:2300,n:{tank:4,spaag:2,sam:1,inf:3}},{x:-11000,z:1500,R:1200,n:{tank:3,spaag:1,sam:1,inf:3}},{x:-6000,z:-1000,R:900,n:{tank:3,spaag:1,inf:2}}]; // GWORLD: sea sites rehomed onto US land (NM, TX, MS); NYC left clear;
 const U=[],shells=[],fires=[];const ch=(x,z)=>typeof cityH==='function'?cityH(x,z):0;
 let KO=null;function keepOut(){KO=[];const bb=new THREE.Box3();scene.updateMatrixWorld(true);for(const o of scene.children){if(o.userData.army)continue;o.traverse(m=>{if(!m.isMesh||!m.geometry)return;bb.setFromObject(m);const sx=bb.max.x-bb.min.x,sz=bb.max.z-bb.min.z;if((sx>1500&&sz>1500)||bb.isEmpty()||bb.min.y>300)return;
   if(!LAND.some(L=>Math.hypot((bb.min.x+bb.max.x)/2-L.x,(bb.min.z+bb.max.z)/2-L.z)<L.R+500))return;KO.push([bb.min.x-80,bb.min.z-80,bb.max.x+80,bb.max.z+80]);});}}
 const clear=(x,z)=>!KO||!KO.some(b=>x>b[0]&&x<b[2]&&z>b[1]&&z<b[3]);
 function place(u){const L=u.L;for(let k=0;k<60;k++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*L.R;const x=L.x+Math.cos(a)*r,z=L.z+Math.sin(a)*r;if(terrainH(x,z)>3&&ch(x,z)<=0&&clear(x,z)){u.pos.set(x,terrainH(x,z),z);return;}}u.pos.set(L.x,terrainH(L.x,L.z),L.z);}
 function mk(type,L){const d=KIND[type];const mesh=refs(d.make());const u={army:1,type,kind:d.name,def:d,L,mesh,pos:V3(),vel:V3(),hdg:Math.random()*6.28,alive:true,resp:0,phase:Math.random()*6.28,cd:Math.random()*d.rel,aim:0,spd:type==='tank'?4+Math.random()*3:type==='inf'?1.3:0};
  mesh.userData.army=1;place(u);mesh.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.m0=o.material;}});scene.add(mesh);U.push(u);targets.push(u);return u;}
 keepOut();
 for(const L of LAND)for(const [t,n] of Object.entries(L.n))for(let i=0;i<n;i++)mk(t,L);
 function revive(u){u.alive=true;u.mesh.visible=true;u.mesh.traverse(o=>{if(o.isMesh){o.material=o.userData.m0;o.visible=true;}});const ud=u.mesh.userData;if(ud.tu){ud.tu.position.copy(ud.tu.userData.p0||ud.tu.position);ud.tu.rotation.set(ud.tu.userData.rx||ud.tu.rotation.x,0,0);}u.fly=null;place(u);}
 for(const u of U){const tu=u.mesh.userData.tu;if(tu){tu.userData.p0=tu.position.clone();tu.userData.rx=tu.rotation.x;}}
 function wreck(u){u.mesh.visible=true;u.mesh.traverse(o=>{if(o.isMesh){if(o.material.transparent)o.visible=false;else o.material=CHAR;}});const tu=u.mesh.userData.tu;
  if(u.type==='tank'||u.type==='spaag')u.fly={o:tu,v:V3(rnd(5),14+Math.random()*8,rnd(5)),w:V3(rnd(3),rnd(3),rnd(3))}; // turret toss
  if(u.type==='inf')for(const s of u.mesh.userData.men)s.rotation.x=-1.5;
  explosion(u.pos.clone().setY(u.pos.y+2),u.type==='sam'?3:u.type==='inf'?0.8:2.2);sfx('boom',0.8);
  for(let k=0;k<20;k++)fire.spawn(u.pos,rnd(14),6+Math.random()*16,rnd(14),1+Math.random(),2,3,1,0.55,0.2,1,1.2,0,0.2,0.2,0.2); // secondary debris
  fires.push({p:u.pos.clone().setY(u.pos.y+1.5),t:u.type==='inf'?4:22,s:u.type==='sam'?2:1});}
 // hook into existing target pipeline (bullets/rockets/missiles/rods/nukes already hit targets[]); ghit + g8 wrappers give hitmarker, kill feed, Bus event
 {const _u=updTargets;updTargets=function(dt){const keep=[];for(let i=targets.length-1;i>=0;i--)if(targets[i].army){keep.push(targets[i]);targets.splice(i,1);}try{_u(dt);}finally{for(let i=keep.length-1;i>=0;i--)targets.push(keep[i]);}};}
 {const _r=respawnTarget;respawnTarget=function(t){if(t.army)return revive(t);_r(t);};}
 {const _k=killTarget;killTarget=function(t,b){if(!t.army)return _k(t,b);if(!t.alive)return;_k(t,b);score+=t.def.score-150;t.resp=45;wreck(t);const f=document.getElementById('kfeed');if(f&&f.firstChild&&f.firstChild.textContent.includes(t.kind))f.firstChild.textContent=f.firstChild.textContent.replace(/\+150$/,'+'+t.def.score);};}
 const EN=()=>player&&player.mesh&&player.alive!==false&&!mission&&settings.enemies!==false&&player.mesh.position.y<12000;
 function shoot(u,from,to,spd,kind){const d=to.clone().sub(from);const L=d.length();d.normalize();
  const miss=kind==='shell'?(25+L*0.02):(14+L*0.012);const aim=to.clone().add(V3(rnd(miss),rnd(miss),rnd(miss)));const v=aim.sub(from).normalize().multiplyScalar(spd);
  shells.push({p:from.clone(),v,life:L/spd+0.6,kind});const mz=from.clone();fire.spawn(mz,v.x*0.01,v.y*0.01,v.z*0.01,0.12,kind==='shell'?5:1.5,2,1,0.85,0.4,1);
  if(kind==='shell'){smoke.spawn(mz,rnd(2),1,rnd(2),2.5,4,9,0.8,0.78,0.72,0.5);if(camera.position.distanceTo(from)<3000)sfx('gun',0.35);}}
 const _p=V3(),_d=V3();
 let rechk=true;function upd(dt){if(rechk){rechk=false;keepOut();for(const u of U)if(!clear(u.pos.x,u.pos.z))place(u);}const P=player&&player.mesh?player.mesh.position:null;const on=EN();const cp=camera.position;
  for(const u of U){const m=u.mesh;const far=cp.distanceToSquared(u.pos)>9000*9000;
   if(u.fly){const f=u.fly;f.v.y-=9.8*dt;f.o.position.addScaledVector(f.v,dt);f.o.rotation.x+=f.w.x*dt;f.o.rotation.z+=f.w.z*dt;if(f.o.position.y<-0.5){f.o.position.y=-0.5;u.fly=null;}}
   if(!u.alive){if(!far)m.visible=true;continue;}
   m.visible=!far;
   if(u.spd){u.phase+=dt*0.05;u.hdg+=Math.sin(u.phase*1.3)*0.15*dt;const nx=u.pos.x-Math.sin(u.hdg)*u.spd*dt*20,nz=u.pos.z-Math.cos(u.hdg)*u.spd*dt*20;
    const away=Math.hypot(nx-u.L.x,nz-u.L.z)>u.L.R;if(terrainH(nx,nz)<4||ch(nx,nz)>0||away||!clear(nx,nz))u.hdg+=1.5*dt;else{u.pos.x-=Math.sin(u.hdg)*u.spd*dt;u.pos.z-=Math.cos(u.hdg)*u.spd*dt;}
    u.pos.y=terrainH(u.pos.x,u.pos.z);}
   u.vel.set(-Math.sin(u.hdg)*u.spd,0,-Math.cos(u.hdg)*u.spd);
   if(!far){m.position.copy(u.pos);m.rotation.y=u.hdg;
    if(u.type!=='inf'&&u.type!=='sam'){const s=0.02*Math.sin(simT*7+u.phase)*Math.min(1,u.spd);m.userData.hull.rotation.x=s;}
    if(u.type==='inf')for(const s of m.userData.men){s.position.y=Math.abs(Math.sin(simT*5+s.id))*0.06*u.spd;}
    if(u.type==='sam')m.userData.ant.rotation.y=simT*0.8;if(u.type==='spaag')m.userData.dish.rotation.z=simT*2;}
   u.cd-=dt;if(!on||!P)continue;const dist=u.pos.distanceTo(P);if(dist>u.def.r)continue;
   // turret slew toward player
   const ud=m.userData;if(ud.tu&&u.type!=='sam'){_d.copy(P).sub(u.pos);const want=Math.atan2(-_d.x,-_d.z)-u.hdg;ud.tu.rotation.y+=Math.atan2(Math.sin(want-ud.tu.rotation.y),Math.cos(want-ud.tu.rotation.y))*Math.min(1,1.6*dt);
    const el=Math.atan2(_d.y-3,Math.hypot(_d.x,_d.z));ud.gun.rotation.x=Math.max(-0.05,Math.min(u.type==='spaag'?1.4:0.3,el));}
   if(u.cd>0)continue;
   if(u.type==='tank'){if(P.y-u.pos.y>1500)continue;u.cd=u.def.rel*(0.8+Math.random()*0.5);ud.gun.getWorldPosition(_p);_p.addScaledVector(_d.copy(P).sub(_p).normalize(),6);shoot(u,_p,P,900,'shell');}
   else if(u.type==='spaag'){if(P.y>3500)continue;u.burst=(u.burst||0)+1;u.cd=u.burst%14==0?2.5:u.def.rel;ud.gun.getWorldPosition(_p);shoot(u,_p,P,1000,'aaa');}
   else if(u.type==='inf'){if(P.y-u.pos.y>500)continue;u.cd=u.def.rel*(0.6+Math.random());const s=ud.men[(Math.random()*5)|0];s.getWorldPosition(_p);_p.y+=1.3;shoot(u,_p,P,800,'rifle');}
   else if(u.type==='sam'){const air=player.def.cls==='air'||player.def.cls==='heli';if(!air||P.y>9000||EAD.reload>0||eMissiles.length>0){u.cd=3;continue;}
    EAD.reload=28;u.cd=u.def.rel;const o=u.pos.clone();o.y+=8;spawnSAM(o);smoke.spawn(o,0,4,0,3,6,14,0.9,0.9,0.88,0.7);}}
  // shells / tracers (weak: big dispersion, light damage)
  for(let i=shells.length-1;i>=0;i--){const s=shells[i];s.life-=dt;s.p.addScaledVector(s.v,dt);if(s.kind==='shell')s.v.y-=2*dt;
   fire.spawn(s.p,0,0,0,0.05,s.kind==='shell'?2.2:1.1,0.8,1,s.kind==='aaa'?0.75:0.9,s.kind==='aaa'?0.25:0.5,1);
   let dead=s.life<=0;if(P&&player.alive!==false){const hr=s.kind==='shell'?14:10;if(s.p.distanceToSquared(P)<hr*hr){dead=true;eadHit(s.kind==='shell'?6:s.kind==='aaa'?2:1,s.kind==='shell'?'TANK ROUND':s.kind==='aaa'?'AAA':'SMALL ARMS');if(window.__army)__army.hitsTaken++;}}
   if(!dead&&s.p.y<terrainH(s.p.x,s.p.z)+0.5){dead=true;if(s.kind==='shell')explosion(s.p,0.6);}
   if(dead)shells.splice(i,1);}
  for(let i=fires.length-1;i>=0;i--){const f=fires[i];f.t-=dt;if(Math.random()<dt*14)fire.spawn(f.p,rnd(1.5),3+Math.random()*3,rnd(1.5),0.5+Math.random()*0.5,2*f.s,4*f.s,1,0.5,0.15,1);
   if(Math.random()<dt*8)smoke.spawn(f.p,rnd(1.5)+2,6,rnd(1.5),5,4*f.s,18*f.s,0.12,0.11,0.1,0.75);if(f.t<=0)fires.splice(i,1);}}
 {const _gh=window.gameHook;window.gameHook=function(dt){_gh(dt);try{upd(dt);}catch(e){console.error('army',e);}};}
 return{U,LAND,get KO(){return KO},clearAt:(x,z)=>clear(x,z),shells,fires,KIND,hitsTaken:0,upd,kill:u=>killTarget(u,true),alive:()=>U.filter(u=>u.alive).length};})();
window.__army=ARMY;ARMY.clear=(x,z)=>true;
