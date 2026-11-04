// ===== TANK_BEGIN tank_core.js  #24 playable real-world armor (owner: tank). M1A2 SEPv3, M2A3 Bradley, M1126 Stryker, M109A7 Paladin, M142 HIMARS (drive), JLTV.
// Player (US, tan CARC) + enemy AI (same models, Red Coalition paint/flags). Tracked/wheeled physics, stabilised turret, AP/HE ballistic shells, coax, .50 RWS, smoke,
// armor model (front/side/rear), damage states (tracks off, turret disabled, catastrophic + turret toss + fire), crew via PPL.crew(). No new buttons.
const TANK=(()=>{const T=THREE,PI=Math.PI;if(typeof scene==='undefined'||typeof DEFS==='undefined')return null;
 const D2R=PI/180;
 // ---------- real-world specs (Army fact files / Jane's; see refs/tanks/sources.txt) ----------
 // L,W,H metres; spd m/s road; trav/elev rad/s; elev limits rad; armor RHA-equivalent rough mm (front/side/rear); hp
 const W={
  AP120:{id:'120 AP',lab:'AP',type:'shell',v:1650,pen:800,dmg:100,rel:6.0,ammo:22,cal:0.12},  // M829A4 APFSDS
  HE120:{id:'120 HE',lab:'HE',type:'shell',v:1410,pen:120,dmg:60,he:9,rel:6.0,ammo:14,cal:0.12}, // M1147 AMP
  AP25:{id:'25 AP',lab:'AP',type:'shell',v:1385,pen:60,dmg:7,rel:0.3,ammo:300,cal:0.025,auto:1},  // M919 APFSDS-T, 200 rpm
  HE25:{id:'25 HE',lab:'HE',type:'shell',v:1100,pen:15,dmg:5,he:3,rel:0.3,ammo:600,cal:0.025,auto:1}, // M792 HEI-T
  HE155:{id:'155 HE',lab:'HE',type:'shell',v:684,pen:150,dmg:100,he:22,rel:9,ammo:39,cal:0.155}, // M795, ~4 rpm burst
  GMLRS:{id:'GMLRS',lab:'GMLRS',type:'shell',v:900,pen:200,dmg:100,he:25,rel:3,ammo:6,cal:0.227,rocket:1},
  COAX:{id:'COAX',lab:'COAX',type:'mg',v:853,pen:8,dmg:1.2,rel:0.1,ammo:2400,cal:0.00762,auto:1}, // M240, 650 rpm
  M2:{id:'.50 CAL',lab:'.50',type:'mg',v:890,pen:25,dmg:2.5,rel:0.11,ammo:900,cal:0.0127,auto:1},  // M2HB in CROWS
  SMOKE:{id:'SMOKE',lab:'SMOKE',type:'smoke',rel:4,ammo:2}};
 for(const k in W)if(typeof AMMO!=='undefined')AMMO[W[k].id]=W[k].ammo;
 const S={
  abrams:{name:'M1A2 SEPv3 Abrams',desc:'Main battle tank. 120 mm AP/HE, coax, .50 CROWS, smoke.',track:1,L:7.93,Wd:3.66,H:2.44,spd:18.6,acc:2.6,turn:0.55,trav:0.7,elev:0.44,eMin:-9*D2R,eMax:20*D2R,arm:[900,250,90],hp:100,wpn:['AP120','HE120','COAX','M2','SMOKE'],wheels:7,barrel:5.6,trY:1.45,crew:4},
  bradley:{name:'M2A3 Bradley',desc:'Infantry fighting vehicle. 25 mm Bushmaster AP/HE, coax, smoke.',track:1,L:6.55,Wd:3.6,H:2.98,spd:18.3,acc:2.8,turn:0.7,trav:1.05,elev:1.0,eMin:-9*D2R,eMax:59*D2R,arm:[130,45,30],hp:70,wpn:['AP25','HE25','COAX','SMOKE'],wheels:6,barrel:2.8,trY:1.75,crew:3},
  stryker:{name:'M1126 Stryker',desc:'8x8 wheeled infantry carrier. .50 CAL CROWS, smoke. Fast on roads.',wheel:4,L:6.95,Wd:2.72,H:2.64,spd:27,acc:3.0,turn:0.5,trav:1.2,elev:1.0,eMin:-20*D2R,eMax:60*D2R,arm:[40,25,20],hp:55,wpn:['M2','SMOKE'],barrel:1.6,trY:2.3,crew:2},
  paladin:{name:'M109A7 Paladin',desc:'Self-propelled howitzer. 155 mm HE with high-arc ballistics, .50 CAL, smoke.',track:1,L:9.7,Wd:3.9,H:3.6,spd:17,acc:2.2,turn:0.5,trav:0.6,elev:0.25,eMin:-3*D2R,eMax:75*D2R,arm:[60,35,25],hp:75,wpn:['HE155','M2','SMOKE'],wheels:7,barrel:6.1,trY:1.75,crew:4},
  himarsd:{name:'M142 HIMARS (drive)',desc:'6x6 rocket artillery you drive yourself. GMLRS pod, smoke.',wheel:3,L:7.0,Wd:2.4,H:3.2,spd:23.6,acc:2.4,turn:0.45,trav:0.5,elev:0.3,eMin:0,eMax:60*D2R,arm:[25,15,15],hp:45,wpn:['GMLRS','SMOKE'],barrel:0,trY:1.6,crew:2},
  jltv:{name:'Oshkosh JLTV',desc:'Light tactical vehicle. .50 CAL CROWS, smoke. Fastest off-road.',wheel:2,L:6.2,Wd:2.5,H:2.6,spd:30,acc:3.6,turn:0.7,trav:1.2,elev:1.0,eMin:-20*D2R,eMax:60*D2R,arm:[20,12,10],hp:40,wpn:['M2','SMOKE'],barrel:1.6,trY:2.1,crew:2}};
 for(const k in S){S[k].cls='armor';S[k].weapons=S[k].wpn.map(w=>W[w].id);S[k].tank=k;DEFS[k]=S[k];}
 // ---------- materials (PBR canvas CARC + grime) ----------
 function carc(base,grime){const s=512,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,s,s);
  const id=x.getImageData(0,0,s,s),d=id.data;for(let j=0;j<s;j++)for(let i=0;i<s;i++){const k=(j*s+i)*4,n=(Math.random()-0.5)*14,m=Math.max(0,(j/s-0.55)/0.45)**1.5*grime;
   for(let q=0;q<3;q++)d[k+q]=Math.max(0,Math.min(255,d[k+q]*(1-m*0.6)+[86,70,50][q]*m*0.6+n-Math.sin(i*0.7)*Math.sin(j*0.013)*3));}
  x.putImageData(id,0,0);for(let i=0;i<300;i++){x.fillStyle=`rgba(${Math.random()<.5?'55,48,40':'200,190,165'},${.25+Math.random()*.35})`;x.fillRect(Math.random()*s,Math.random()*s,1+Math.random()*4,1+Math.random()*2);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.generateMipmaps=true;return new T.MeshStandardMaterial({map:t,roughness:0.82,metalness:0.18,envMapIntensity:0.8});}
 const M={us:carc('#a7916a',1),red:carc('#4a4b39',1.2),steel:new T.MeshStandardMaterial({color:0x3a3b38,roughness:0.5,metalness:0.85}),
  rub:new T.MeshStandardMaterial({color:0x161616,roughness:0.92}),trk:new T.MeshStandardMaterial({color:0x2c2a27,roughness:0.7,metalness:0.6}),
  blk:new T.MeshStandardMaterial({color:0x101010,roughness:0.6,metalness:0.3}),glass:new T.MeshStandardMaterial({color:0x223038,roughness:0.05,metalness:0.9,envMapIntensity:1.5}),
  lens:new T.MeshStandardMaterial({color:0x0a1420,roughness:0.05,metalness:1,emissive:0x061018}),char:new T.MeshStandardMaterial({color:0x141210,roughness:1}),
  flash:new T.MeshBasicMaterial({color:0xffcc66,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}),
  tracer:new T.MeshBasicMaterial({color:0xffaa44,blending:T.AdditiveBlending,transparent:true,depthWrite:false})};
 function decal(draw,w=128,h=128){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
  return new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.85,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});}
 // Red Coalition flag (same design as gnavy_enemy #10): crimson field, black diagonal, white star
 const redFlag=decal((x,w,h)=>{x.fillStyle='#8e0f16';x.fillRect(0,0,w,h);x.fillStyle='#111';x.beginPath();x.moveTo(0,h);x.lineTo(w*.35,h);x.lineTo(w,0);x.lineTo(w*.65,0);x.fill();x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?8:19;x.lineTo(34+Math.cos(a)*r,34+Math.sin(a)*r);}x.fill();},150,100);
 const redStar=decal((x,w,h)=>{x.fillStyle='#b01818';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?22:56;x.lineTo(64+Math.cos(a)*r,66+Math.sin(a)*r);}x.fill();x.strokeStyle='#111';x.lineWidth=5;x.stroke();});
 const usBump=n=>decal((x,w,h)=>{x.fillStyle='rgba(20,20,18,.85)';x.font='bold 44px Arial Narrow,Arial';x.textAlign='center';x.fillText(n,w/2,h*0.62);},256,96);
 const usStar=decal((x,w,h)=>{x.strokeStyle='rgba(25,25,22,.8)';x.lineWidth=6;x.beginPath();x.arc(64,64,54,0,7);x.stroke();x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,r=i%2?18:46;x.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);}x.closePath();x.stroke();});
 // ---------- geometry helpers ----------
 const P=(g,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o;};
 const B=(w,h,l)=>new T.BoxGeometry(w,h,l),CX=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s).rotateZ(PI/2),CZ=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s).rotateX(PI/2),CY=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s);
 function prof(pts,width){const sh=new T.Shape();pts.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));const g=new T.ExtrudeGeometry(sh,{depth:width,bevelEnabled:true,bevelThickness:0.03,bevelSize:0.03,bevelSegments:1});g.rotateY(-PI/2);g.translate(width/2,0,0);return g;}
 function plan(pts,hgt){const sh=new T.Shape();pts.forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z));const g=new T.ExtrudeGeometry(sh,{depth:hgt,bevelEnabled:true,bevelThickness:0.04,bevelSize:0.05,bevelSegments:2});g.rotateX(PI/2);g.translate(0,hgt,0);return g;}
 // merge static meshes by material (few draw calls on iPhone)
 function bake(g){const by=new Map();for(const c of [...g.children])if(c.isMesh&&!c.userData.keep&&!c.material.transparent){c.updateMatrix();const k=c.material.uuid;if(!by.has(k))by.set(k,{m:c.material,gs:[]});const gg=c.geometry.clone().applyMatrix4(c.matrix);if(gg.index)by.get(k).gs.push(gg.toNonIndexed());else by.get(k).gs.push(gg);g.remove(c);}
  for(const {m,gs} of by.values()){for(const x of gs){for(const a of Object.keys(x.attributes))if(!['position','normal','uv'].includes(a))x.deleteAttribute(a);if(!x.attributes.uv)x.setAttribute('uv',new T.BufferAttribute(new Float32Array(x.attributes.position.count*2),2));}
   const mg=mergeGeometries(gs,false);if(mg){const o=new T.Mesh(mg,m);o.castShadow=o.receiveShadow=true;g.add(o);}}}
 // ---------- track run: instanced links around sprocket/idler loop, animated by speed ----------
 function trackRun(g,x,len,wid,r,y0,n=84){const geo=B(wid,0.07,len/n*1.9*0.92);const im=new T.InstancedMesh(geo,M.trk,n);im.userData.keep=1;im.castShadow=true;g.add(im);
  const L=len,per=2*L+2*PI*r;const info={im,n,x,L,r,y0,per,off:0};setTrack(info);return info;}
 const _m4=new T.Matrix4(),_q=new T.Quaternion(),_v=new T.Vector3(),_s=new T.Vector3(1,1,1),_e=new T.Euler();
 function setTrack(t){for(let i=0;i<t.n;i++){let d=((i/t.n)*t.per+t.off)%t.per;if(d<0)d+=t.per;let z,y,a;
   if(d<t.L){z=-t.L/2+d;y=t.y0-t.r;a=0;}else if(d<t.L+PI*t.r){const u=(d-t.L)/t.r;z=t.L/2+Math.sin(u)*t.r;y=t.y0-Math.cos(u)*t.r;a=u;}else if(d<2*t.L+PI*t.r){z=t.L/2-(d-t.L-PI*t.r);y=t.y0+t.r;a=PI;}else{const u=(d-2*t.L-PI*t.r)/t.r;z=-t.L/2-Math.sin(u)*t.r;y=t.y0+Math.cos(u)*t.r;a=PI+u;}
   _q.setFromEuler(_e.set(a,0,0));_m4.compose(_v.set(t.x,y,z),_q,_s);t.im.setMatrixAt(i,_m4);}t.im.instanceMatrix.needsUpdate=true;}
 function roadWheel(g,x,y,z,r,w,fine){const k=new T.Group();k.position.set(x,y,z);g.add(k);P(k,CX(r,r,w,20),M.rub);P(k,CX(r*0.78,r*0.78,w+0.02,18),M.steel);
  for(let i=0;i<8;i++){const a=i/8*2*PI;P(k,CX(0.025,0.025,w+0.05,6),M.steel,0,Math.cos(a)*r*0.45,Math.sin(a)*r*0.45);}P(k,CX(r*0.22,r*0.26,w+0.08,12),M.steel);return k;}
 function tire(g,x,y,z,r,w){const k=new T.Group();k.position.set(x,y,z);g.add(k);const tor=new T.TorusGeometry(r*0.78,r*0.22,10,28).rotateY(PI/2);P(k,tor,M.rub);P(k,CX(r*0.6,r*0.6,w*0.7,20),M.rub);
  P(k,CX(r*0.5,r*0.5,w*0.75,16),M.steel);for(let i=0;i<10;i++){const a=i/10*2*PI;P(k,CX(0.03,0.03,w*0.8,6),M.blk,0,Math.cos(a)*r*0.32,Math.sin(a)*r*0.32);}
  for(let i=0;i<24;i++){const a=i/24*2*PI;P(k,B(w*0.92,0.06,0.09),M.rub,0,Math.cos(a)*r*0.99,Math.sin(a)*r*0.99,a);}return k;}
 function rws(g,x,y,z,paint){const c=new T.Group();c.position.set(x,y,z);g.add(c);P(c,CY(0.32,0.36,0.18,16),M.steel);P(c,B(0.5,0.42,0.55),paint,0,0.32,0);P(c,B(0.34,0.24,0.3),paint,0.38,0.34,-0.05);
  P(c,new T.CircleGeometry(0.08,16),M.lens,0.38,0.34,-0.205,0,PI);P(c,new T.CircleGeometry(0.05,12),M.lens,0.47,0.38,-0.205,0,PI);
  P(c,B(0.17,0.2,1.05),M.steel,-0.05,0.36,-0.45);P(c,CZ(0.03,0.03,1.15,10),M.steel,-0.05,0.38,-1.3);P(c,CZ(0.045,0.045,0.12,10),M.blk,-0.05,0.38,-1.85);for(let i=0;i<5;i++)P(c,CZ(0.045,0.045,0.03,10),M.steel,-0.05,0.38,-0.95-i*0.06);
  P(c,B(0.22,0.25,0.34),M.blk,-0.32,0.25,0.05);return c;}
 function smokeLaunchers(g,x,y,z,s,paint){for(let i=0;i<6;i++){P(g,CY(0.06,0.06,0.3,10).rotateX(-0.55),M.blk,x+s*i*0.1,y+Math.abs(i-2.5)*0.02,z+i*0.06,0,0,-s*0.5);}P(g,B(0.7,0.12,0.25),paint,x+s*0.25,y-0.12,z+0.12,0,s*0.4,0);}
 function antenna(g,x,y,z,h,flag){P(g,CY(0.05,0.07,0.12,8),M.blk,x,y,z);const a=P(g,CY(0.008,0.015,h,6),M.blk,x,y+h/2,z);a.userData.keep=1;if(flag){const f=P(g,new T.PlaneGeometry(0.75,0.5),flag,x,y+h-0.3,z+0.38,0,PI/2);f.material=f.material.clone();f.material.side=T.DoubleSide;f.userData.keep=1;}}
 // ---------- build one vehicle ----------
 function build(kind,side){const s=S[kind],red=side==='red',paint=red?M.red:M.us;const g=new T.Group(),hull=new T.Group(),tu=new T.Group();g.add(hull);hull.add(tu);
  const ud={kind,side,hull,tu,tracks:[],wheels:[],fine:[]};g.userData.tk=ud;const L=s.L,Wd=s.Wd;
  if(s.track){const hw=Wd*0.34;// hull: sloped glacis + upper hull + sponsons, side skirts with bolts, road wheels, sprocket rear, idler front
   if(kind==='abrams'){P(hull,prof([[-3.95,0.62],[-3.6,1.12],[-2.1,1.48],[3.85,1.46],[3.98,1.0],[3.6,0.55],[-3.3,0.45]],hw*2),paint);
    P(hull,B(Wd-0.02,0.12,7.6),paint,0,1.46,0.2);P(hull,B(Wd,0.82,7.4),paint,0,1.05,0.15,0,0,0);//sponsons
    for(const x of[-1,1]){P(hull,prof([[-3.7,0.62],[-3.5,1.08],[3.0,1.08],[3.0,0.5],[-3.4,0.5]],0.1),paint,x*(Wd/2+0.01),0,0);for(let i=0;i<7;i++)P(hull,B(0.02,0.36,0.03),M.steel,x*(Wd/2+0.07),0.82,-3+i*0.95);for(let i=0;i<14;i++)P(hull,CX(0.025,0.025,0.03,6),M.steel,x*(Wd/2+0.07),1.0,-3.4+i*0.48);}
    P(hull,B(1.5,0.08,1.8),M.blk,0,1.52,3.0);for(let i=0;i<10;i++)P(hull,B(1.45,0.03,0.05),M.steel,0,1.57,2.2+i*0.17);// turbine grille
    P(hull,B(0.8,0.06,0.5),M.steel,0,1.24,-2.9,-0.24);for(let i=0;i<3;i++)P(hull,B(0.18,0.08,0.06),M.glass,-0.2+i*0.2,1.3,-3.15,-0.24); // driver hatch + periscopes
    for(const x of[-1,1]){P(hull,B(0.35,0.15,0.1),M.lens,x*1.55,1.1,-3.85);P(hull,B(0.5,0.4,0.06),M.steel,x*1.4,0.8,-3.95);}//lights, tow eyes
    P(hull,B(1.8,0.5,0.15),paint,0,0.95,3.95);P(hull,B(0.4,0.25,0.05),M.blk,0.7,1.0,4.03);
   }else{const top=kind==='paladin'?1.85:1.75;P(hull,prof([[-L/2,0.55],[-L/2+0.25,1.25],[-L/2+1.4,top],[L/2,top],[L/2+0.02,0.6],[L/2-0.3,0.42],[-L/2+0.4,0.42]],Wd*0.92),paint);
    for(const x of[-1,1]){P(hull,B(0.08,0.65,L*0.85),paint,x*(Wd/2-0.02),1.08,0.1);for(let i=0;i<6;i++)P(hull,B(0.02,0.5,0.4),paint,x*(Wd/2+0.03),1.0,-L/2+1+i*L*0.14);}
    P(hull,B(0.9,1.2,0.08),M.steel,0.6,1.1,L/2+0.01);P(hull,B(0.3,0.4,0.06),M.blk,-0.5,1.2,L/2+0.03);for(let i=0;i<4;i++)P(hull,B(0.12,0.08,0.05),M.glass,-1+i*0.25,top+0.05,-L/2+1.5);}
   const n=s.wheels,r=0.36,len=L*0.78;for(const x of[-1,1]){for(let i=0;i<n;i++)ud.wheels.push(roadWheel(hull,x*hw,0.42,-len/2+0.2+i*(len-0.4)/(n-1),r,0.5));
    const sp=roadWheel(hull,x*hw,0.72,len/2+0.35,0.32,0.45);for(let i=0;i<11;i++){const a=i/11*2*PI;P(sp,B(0.46,0.07,0.07),M.steel,0,Math.cos(a)*0.33,Math.sin(a)*0.33,a);}ud.wheels.push(sp);
    ud.wheels.push(roadWheel(hull,x*hw,0.7,-len/2-0.3,0.3,0.45));if(kind!=='abrams')for(let i=0;i<3;i++)P(hull,CX(0.1,0.1,0.3,10),M.steel,x*hw,1.08,-len/3+i*len/3);
    ud.tracks.push(trackRun(hull,x*hw,len+0.5,0.64,0.39,0.4,96));}
  }else{// wheeled: hull (V-hull for Stryker), axles
   const ax=s.wheel,r=kind==='jltv'?0.52:0.6;
   if(kind==='stryker'){P(hull,prof([[-L/2,1.0],[-L/2+0.5,1.6],[-L/2+1.6,2.12],[L/2,2.12],[L/2,0.8],[L/2-0.6,0.55],[-L/2+0.9,0.55]],Wd),paint);P(hull,prof([[-L/2+0.8,0.55],[L/2-0.5,0.55],[L/2-0.6,0.3],[-L/2+1,0.3]],Wd*0.5),paint);
    for(const x of[-1,1]){for(let i=0;i<5;i++)P(hull,B(0.06,0.9,1.05),paint,x*(Wd/2+0.03),1.55,-2.4+i*1.15);for(let i=0;i<20;i++)P(hull,CX(0.022,0.022,0.04,6),M.steel,x*(Wd/2+0.06),1.95,-2.8+i*0.29);}
    P(hull,B(1.2,1.4,0.08),paint,0.5,1.3,L/2+0.02);for(let i=0;i<3;i++)P(hull,B(0.14,0.08,0.06),M.glass,-0.8+i*0.18,2.16,-L/2+1.7);}
   else if(kind==='jltv'){P(hull,prof([[-3.1,0.85],[-3.05,1.35],[-1.7,1.5],[-1.0,1.6],[0.9,1.62],[1.2,1.5],[3.1,1.5],[3.1,0.85]],Wd*0.96),paint);
    P(hull,prof([[-1.05,1.6],[-0.65,2.35],[1.0,2.38],[1.1,1.6]],Wd*0.9),paint);for(const x of[-1,1]){P(hull,B(0.02,0.48,0.62),M.glass,x*Wd*0.45,2.0,-0.35);P(hull,B(0.02,0.48,0.62),M.glass,x*Wd*0.45,2.0,0.45);P(hull,B(0.12,0.12,0.2),M.blk,x*(Wd/2+0.12),1.95,-0.9);}
    P(hull,B(Wd*0.82,0.5,0.03),M.glass,0,2.02,-0.82,-0.5);P(hull,B(1.8,0.35,0.1),M.blk,0,1.1,-3.12);for(let i=0;i<6;i++)P(hull,B(1.4,0.03,0.05),M.steel,0,1.0+i*0.05,-3.17);}
   else{// HIMARS: FMTV cab + launcher bed (pod + launcher-loader module)
    P(hull,prof([[-3.5,1.0],[-3.45,2.55],[-2.2,2.7],[-1.8,2.7],[-1.8,1.0]],Wd),paint);for(const x of[-1,1])P(hull,B(0.02,0.6,0.8),M.glass,x*Wd*0.5,2.1,-2.65);P(hull,B(Wd*0.85,0.55,0.02),M.glass,0,2.15,-3.47,-0.08);
    P(hull,B(Wd,0.3,5.0),M.steel,0,1.1,0.95);P(hull,B(Wd*0.95,0.35,0.4),paint,0,1.4,-1.5);}
   const axz=kind==='stryker'?[-2.5,-1.3,0.9,2.1]:kind==='jltv'?[-2.0,1.9]:[-2.6,0.8,2.2];
   for(let i=0;i<ax;i++)for(const x of[-1,1]){const t=tire(hull,x*(Wd/2-0.22),r,axz[i],r,0.42);t.userData.steer=i<(kind==='stryker'?2:1);ud.wheels.push(t);P(hull,B(0.3,0.15,0.3),M.steel,x*(Wd/2-0.55),r,axz[i]);}}
  // ---- turret / mount ----
  tu.position.set(0,s.trY,kind==='abrams'?0.35:kind==='paladin'?0.9:kind==='bradley'?-0.2:kind==='himarsd'?1.5:0.3);const gun=new T.Group();tu.add(gun);ud.gun=gun;
  if(kind==='abrams'){// faceted Chobham/DU turret, bustle rack, CITV, CROWS, gunner primary sight, wind sensor, APU
   P(tu,plan([[-0.6,-2.65],[0.6,-2.65],[1.85,-1.55],[1.9,1.2],[1.65,2.5],[-1.65,2.5],[-1.9,1.2],[-1.85,-1.55]],0.82),paint,0,0,0);
   P(tu,plan([[-1.7,2.5],[1.7,2.5],[1.6,3.4],[-1.6,3.4]],0.55),paint,0,0.15,0);for(let i=0;i<9;i++)P(tu,B(0.04,0.04,0.95),M.steel,-1.6+i*0.4,0.82,2.95);P(tu,B(3.3,0.04,0.04),M.steel,0,0.82,3.42);
   for(let i=0;i<5;i++)P(tu,B(0.5+Math.random()*0.2,0.3,0.4),M.blk,-1.2+i*0.6,0.85,3.0).material=paint;
   P(tu,B(0.55,0.42,0.55),paint,0.75,1.02,-1.2);P(tu,B(0.4,0.3,0.03),M.glass,0.75,1.02,-1.48);P(tu,B(0.12,0.12,0.04),M.lens,0.65,1.02,-1.5);// GPS
   const citv=new T.Group();citv.position.set(-0.9,0.82,-0.7);tu.add(citv);P(citv,CY(0.12,0.14,0.45,12),M.steel,0,0.22,0);P(citv,B(0.4,0.4,0.42),paint,0,0.62,0);P(citv,B(0.28,0.22,0.03),M.glass,0,0.64,-0.22);ud.citv=citv;
   P(tu,CY(0.45,0.48,0.15,20),M.steel,0.55,0.86,0.6);P(tu,CY(0.08,0.08,0.4,8),M.blk,1.2,1.1,0.0);// wind sensor
   ud.rws=rws(tu,0.55,0.95,0.6,paint);P(tu,CY(0.4,0.4,0.08,20),M.steel,-0.6,0.86,0.9);//loader hatch
   smokeLaunchers(tu,1.25,0.72,-1.0,1,paint);smokeLaunchers(tu,-1.25,0.72,-1.0,-1,paint);antenna(tu,-1.4,0.82,2.2,2.6,red?redFlag:null);antenna(tu,1.4,0.82,2.2,2.2);
   P(tu,B(0.6,0.4,0.03),usBump(red?'':'A-12'),1.92,0.45,1.0,0,PI/2).userData.keep=1;
   // 120 mm M256 smoothbore: mantlet, thermal shroud segments, bore evacuator, MRS
   gun.position.set(0,0.45,-2.6);P(gun,B(1.0,0.55,0.5),paint,0,0,0.15);P(gun,CZ(0.17,0.19,1.6,20),M.steel,0,0,-0.8);for(let i=0;i<4;i++)P(gun,CZ(0.155,0.16,0.9,20),paint,0,0,-1.3-i*0.95);
   P(gun,CZ(0.2,0.2,0.55,20),paint,0,0,-2.6);P(gun,CZ(0.12,0.12,0.4,16),M.steel,0,0,-5.4);P(gun,CZ(0.12,0.12,0.02,16),M.blk,0,0,-5.61);P(gun,B(0.12,0.1,0.18),M.steel,0,0.18,-5.3);
   P(gun,CZ(0.04,0.04,0.35,8),M.blk,0.4,0.05,-0.15);s.muz=-5.65;
  }else if(kind==='bradley'){P(tu,plan([[-0.95,-1.1],[0.95,-1.1],[1.15,-0.4],[1.15,1.1],[-1.15,1.1],[-1.15,-0.4]],0.85),paint);
   const tow=P(tu,B(0.55,0.5,1.4),paint,-1.45,0.6,0.1);P(tu,new T.CircleGeometry(0.15,16),M.blk,-1.3,0.6,-0.61,0,PI);P(tu,new T.CircleGeometry(0.15,16),M.blk,-1.6,0.6,-0.61,0,PI);
   P(tu,B(0.5,0.42,0.5),paint,0.55,1.05,-0.5);P(tu,B(0.4,0.3,0.03),M.glass,0.55,1.05,-0.76);// ISU
   const citv=new T.Group();citv.position.set(-0.4,0.85,0.4);tu.add(citv);P(citv,CY(0.1,0.1,0.3,10),M.steel,0,0.15,0);P(citv,B(0.36,0.34,0.36),paint,0,0.45,0);P(citv,B(0.24,0.18,0.03),M.glass,0,0.47,-0.19);
   smokeLaunchers(tu,0.9,0.7,-0.9,1,paint);smokeLaunchers(tu,-0.9,0.7,-0.9,-1,paint);antenna(tu,-0.9,0.85,0.9,2.4,red?redFlag:null);
   gun.position.set(0.15,0.45,-1.1);P(gun,B(0.55,0.4,0.4),paint,0,0,0);P(gun,CZ(0.08,0.08,0.8,14),M.steel,0,0,-0.5);P(gun,CZ(0.04,0.045,1.9,12),M.steel,0,0,-1.6);P(gun,CZ(0.06,0.06,0.2,12),M.steel,0,0,-2.5);s.muz=-2.6;
   for(const x of[-1,1])for(let i=0;i<4;i++)P(hull,B(0.05,0.8,1.3),paint,x*(Wd/2+0.05),1.25,-2.4+i*1.4);// BUSK side armor tiles
  }else if(kind==='paladin'){P(tu,plan([[-1.5,-1.6],[1.5,-1.6],[1.6,-1.0],[1.6,3.0],[-1.6,3.0],[-1.6,-1.0]],1.55),paint);for(let i=0;i<6;i++)P(tu,B(3.1,0.03,0.04),M.steel,0,1.56,-1.3+i*0.8);
   for(const x of[-1,1]){P(tu,B(0.03,1.0,0.9),M.steel,x*1.61,0.8,0.5);P(tu,B(0.04,0.04,0.04),M.lens,x*1.61,1.2,-1.2);}P(tu,B(1.0,0.2,1.2),paint,0,1.65,2.0);
   ud.rws=rws(tu,0.8,1.55,0.2,paint);P(tu,B(0.6,0.4,0.03),usBump(red?'':'B-23'),1.62,0.9,1.6,0,PI/2).userData.keep=1;antenna(tu,-1.3,1.55,2.6,2.8,red?redFlag:null);
   gun.position.set(0,0.85,-1.6);P(gun,B(0.9,0.75,0.6),paint,0,0,0);P(gun,CZ(0.2,0.22,1.2,18),M.steel,0,0,-0.8);P(gun,CZ(0.12,0.13,4.6,18),M.steel,0,0,-3.4);P(gun,CZ(0.17,0.17,0.6,18),M.steel,0,0,-4.0);
   P(gun,B(0.48,0.3,0.55),M.steel,0,0,-5.9);for(const x of[-1,1])P(gun,B(0.02,0.24,0.4),M.blk,x*0.25,0,-5.9);s.muz=-6.2;
  }else if(kind==='himarsd'){P(tu,B(Wd*0.95,0.25,4.6),M.steel,0,0.05,0);gun.position.set(0,0.25,1.9);const pod=new T.Group();pod.position.set(0,0.55,-2.2);gun.add(pod);
   P(pod,B(1.05,1.0,4.3),paint,0,0,0);for(let i=0;i<6;i++)P(pod,new T.CircleGeometry(0.15,16),M.blk,-0.3+(i%3)*0.3,0.18-Math.floor(i/3)*0.36,-2.16,0,PI);for(let i=0;i<5;i++)P(pod,B(1.07,0.05,0.05),M.steel,0,0.5,-2+i);
   P(gun,B(1.4,0.6,0.5),M.steel,0,0.3,0.25);s.muz=-4.4;
  }else{// Stryker / JLTV: CROWS RWS mount on roof
   gun.position.set(0,0,0);ud.rws=rws(tu,0,0,0,paint);s.muz=-1.9;if(kind==='stryker')antenna(hull,-1.0,2.12,2.8,2.6,red?redFlag:null);else antenna(hull,-0.9,2.38,0.6,2.2,red?redFlag:null);}
  if(ud.rws&&kind!=='stryker'&&kind!=='jltv')ud.rws.userData.sub=1;
  // markings: US subdued star / Red Coalition red star + flag on turret sides
  const mk=red?redStar:usStar;for(const x of[-1,1]){const d=P(kind==='stryker'||kind==='jltv'||kind==='himarsd'?hull:tu,new T.PlaneGeometry(0.75,0.75),mk,0,0,0,0,x*PI/2);d.userData.keep=1;
   if(kind==='stryker')d.position.set(x*(Wd/2+0.07),1.5,0.5);else if(kind==='jltv')d.position.set(x*(Wd/2+0.01),1.25,1.5);else if(kind==='himarsd')d.position.set(x*(Wd/2+0.01),2.0,-2.0);else d.position.set(x*(kind==='abrams'?1.93:kind==='paladin'?1.62:1.17),0.45,kind==='paladin'?-0.5:0.2);}
  // muzzle flash sprite
  const fl=new T.Mesh(new T.SphereGeometry(0.6,10,8),M.flash.clone());fl.userData.keep=1;fl.scale.set(1,1,2.2);fl.position.set(0,0,(s.muz||-2)-0.8);(ud.rws&&!s.barrel?ud.rws:gun).add(fl);ud.flash=fl;
  bake(hull);bake(tu);bake(gun);if(ud.citv)bake(ud.citv);if(ud.rws)bake(ud.rws);for(const w of ud.wheels)bake(w);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
 // ---------- vehicle state ----------
 const V=[];// all live armor (player + AI + remote)
 const RAD=1;
 function makeState(kind,side,mesh){const s=S[kind];return {kind,s,side,mesh,ud:mesh.userData.tk,pos:mesh.position,hdg:0,spd:0,tYaw:0,gEl:0,aimYaw:0,aimEl:0,hp:s.hp,trkL:1,trkR:1,turOK:1,dead:0,cd:0,wi:0,ammo:Object.fromEntries(s.wpn.map(w=>[w,W[w].ammo])),
  susY:0,susP:0,susR:0,pitch:0,roll:0,fireT:0,smoke:[],vel:V3(),alive:true,ai:null,id:Math.random().toString(36).slice(2,8)};}
 function hullQ(st,out){return out.setFromEuler(_e.set(st.pitch+st.susP,st.hdg,st.roll+st.susR,'YXZ'));}
 function syncMesh(st){st.mesh.position.copy(st.pos);hullQ(st,st.mesh.quaternion);const ud=st.ud;ud.tu.rotation.y=st.tYaw;ud.gun.rotation.x=st.gEl;if(ud.rws&&ud.rws.userData.sub)ud.rws.rotation.y=st.rwsYaw||0;if(ud.rws&&!st.s.barrel){ud.tu.rotation.y=0;ud.rws.rotation.y=st.tYaw;ud.rws.children.forEach(c=>{});}
  if(ud.rws&&!st.s.barrel)ud.rws.rotation.x=0;}
 // ---------- driving physics ----------
 function gh(x,z){const g=groundAt(x,z);return g.type==='water'?{h:0,w:1}:{h:g.h,w:0};}
 function drive(st,dt,thr,steer){const s=st.s;const mob=st.dead?0:(s.track?Math.min(st.trkL,st.trkR):1);
  const top=s.spd*(thr>=0?1:0.35);let tgt=thr*top*mob;if(s.track&&mob<1)tgt=0;
  const dv=tgt-st.spd,a=Math.sign(dv)===Math.sign(st.spd)||st.spd===0?s.acc:s.acc*2.4;const prev=st.spd;st.spd+=clamp(dv,-a*dt,a*dt);
  // slope: gravity along hull pitch
  st.spd-=Math.sin(st.pitch)*G*dt*0.35*(st.spd>=0?1:-1)*0;st.spd+=Math.sin(st.pitch)*G*dt*0.3;if(Math.abs(thr)<0.02&&Math.abs(st.spd)<0.6)st.spd=0;
  let tr;if(s.track){if(st.trkL<1&&st.trkR<1)tr=0;else tr=steer*s.turn*(1-Math.min(0.55,Math.abs(st.spd)/s.spd*0.55));if(st.trkL<1||st.trkR<1)tr=(st.trkL<1?-1:1)*0.15*Math.abs(thr);} // neutral steer
  else{const wb=s.L*0.55;tr=Math.abs(st.spd)>0.2?steer*st.spd/wb*Math.tan(0.5)*(1-Math.min(0.5,Math.abs(st.spd)/s.spd*0.5)):0;tr=clamp(tr,-s.turn,s.turn);}
  st.hdg-=tr*dt*(st.spd<-0.1&&!s.track?1:1);
  const fx=-Math.sin(st.hdg),fz=-Math.cos(st.hdg);const nx=st.pos.x+fx*st.spd*dt,nz=st.pos.z+fz*st.spd*dt;
  const ahead=gh(nx+fx*s.L*0.5*Math.sign(st.spd||1),nz+fz*s.L*0.5*Math.sign(st.spd||1));
  if(ahead.w||(st.pos.y>0&&ahead.h-st.pos.y>2.2)){st.spd=0;}else{st.pos.x=nx;st.pos.z=nz;}
  // terrain following: 4 contact samples -> pitch/roll; suspension spring-damper with accel squat/dive
  const rx=Math.cos(st.hdg),rz=-Math.sin(st.hdg),hl=s.L*0.42,hw=s.Wd*0.42;
  const hf=gh(st.pos.x+fx*hl,st.pos.z+fz*hl).h,hb=gh(st.pos.x-fx*hl,st.pos.z-fz*hl).h,hr=gh(st.pos.x+rx*hw,st.pos.z+rz*hw).h,hL=gh(st.pos.x-rx*hw,st.pos.z-rz*hw).h;
  const ty=Math.max((hf+hb+hr+hL)/4,gh(st.pos.x,st.pos.z).h-0.2);st.pos.y+=(ty-st.pos.y)*Math.min(1,dt*10);
  st.pitch+=(Math.atan2(hf-hb,2*hl)-st.pitch)*Math.min(1,dt*6);st.roll+=(Math.atan2(hL-hr,2*hw)*-1-st.roll)*Math.min(1,dt*6);
  const acc=(st.spd-prev)/Math.max(dt,1e-3);const k=s.track?0.012:0.02;st.susVP=(st.susVP||0)+((acc*k-st.susP)*60-(st.susVP||0)*9)*dt;st.susP+=st.susVP*dt;
  st.susVR=(st.susVR||0)+((-tr*st.spd*k*0.6-st.susR)*60-(st.susVR||0)*9)*dt;st.susR+=st.susVR*dt;
  st.vel.set(fx*st.spd,0,fz*st.spd);
  // running gear animation
  const ud=st.ud;for(const t of ud.tracks){const side=t.x<0?-1:1;const v=st.spd+side*tr*s.Wd*0.5;t.off-=v*dt;if((st.side==='us'&&st===PL)||nearCam(st.pos,250))setTrack(t);}
  for(const w of ud.wheels){const r=w.userData.r||0.4;w.rotation.x-=st.spd*dt/r;if(w.userData.steer)w.rotation.y=steer*0.45;}
  // dust
  if(Math.abs(st.spd)>4&&Math.random()<dt*Math.abs(st.spd)*0.6&&nearCam(st.pos,600)&&typeof smoke!=='undefined')smoke.spawn(V3(st.pos.x-fx*s.L*0.5+rnd(1.5),st.pos.y+0.4,st.pos.z-fz*s.L*0.5+rnd(1.5)),rnd(1),1+Math.random(),rnd(1),3+Math.random()*2,2.5,7,0.35,0.55,0.48,0.38,0.5);}
 const _cw=V3();function nearCam(p,r){return camera.position.distanceToSquared(p)<r*r;}
 // ---------- turret: stabilised, realistic slew limits ----------
 function slew(st,dt){if(st.dead||!st.turOK)return;const s=st.s;let want=st.aimYaw-st.hdg;want=Math.atan2(Math.sin(want-st.tYaw),Math.cos(want-st.tYaw));st.tYaw+=clamp(want,-s.trav*dt,s.trav*dt);
  const e=clamp(st.aimEl-st.pitch*Math.cos(st.tYaw),s.eMin,s.eMax);st.gEl+=clamp(e-st.gEl,-s.elev*dt,s.elev*dt);}
 function muzzle(st,o,d){st.mesh.updateMatrixWorld(true);const src=(st.ud.rws&&!st.s.barrel)?st.ud.rws:st.ud.gun;src.localToWorld(o.set(0,st.ud.rws&&!st.s.barrel?0.38:0,st.s.muz||-2));
  _q.setFromRotationMatrix(src.matrixWorld);d.set(0,0,-1).applyQuaternion(_q);return o;}
 function mgMuzzle(st,w,o,d){if(w.id==='.50 CAL'&&st.ud.rws){st.mesh.updateMatrixWorld(true);st.ud.rws.localToWorld(o.set(-0.05,0.38,-1.9));_q.setFromRotationMatrix(st.ud.rws.matrixWorld);d.set(0,0,-1).applyQuaternion(_q);
   if(st.ud.rws.userData.sub){ /* commander RWS follows gun line */ muzzle(st,V3(),d);} return o;}muzzle(st,o,d);st.ud.gun.localToWorld(o.set(0.4,0.05,-0.4));return o;}
 // ---------- weapons ----------
 const SH=[];const trGeo=new T.CylinderGeometry(0.05,0.05,6,5).rotateX(PI/2);const shGeo=new T.CylinderGeometry(0.09,0.09,1.6,6).rotateX(PI/2);
 function fireW(st){const wk=st.s.wpn[st.wi],w=W[wk];if(st.dead||st.cd>0)return;if(st.ammo[wk]<=0){return;}if(!st.turOK&&w.type==='shell'&&st.s.barrel)return;
  const unl=typeof settings!=='undefined'&&settings.unlimited;if(!unl)st.ammo[wk]--;st.cd=w.rel*(st.side==='red'?1.25:1);
  if(w.type==='smoke'){popSmoke(st);return;}
  const o=V3(),d=V3();if(w.type==='mg')mgMuzzle(st,w,o,d);else muzzle(st,o,d);
  const disp=w.type==='mg'?0.003:0.0004;d.x+=rnd(disp);d.y+=rnd(disp);d.z+=rnd(disp);d.normalize();
  const m=new T.Mesh(w.type==='mg'?trGeo:shGeo,M.tracer);m.position.copy(o);m.lookAt(o.clone().add(d));m.scale.setScalar(w.type==='mg'?0.4:1);scene.add(m);
  SH.push({p:o,v:d.multiplyScalar(w.v).add(st.vel),w,own:st,life:w.rocket?40:w.type==='mg'?3:12,m,rk:w.rocket});
  if(w.type==='shell'){st.fireT=0.35;st.ud.flash.material.opacity=1;if(st.s.barrel)st.recoil=1;if(st.side==='us'||nearCam(st.pos,1500)){if(typeof sfx==='function')sfx(w.cal>0.1?'boom':'hit',w.cal>0.1?0.5:0.25);if(st===PL&&typeof shake!=='undefined')shake=Math.max(shake,w.cal>0.1?0.6:0.1);}
   if(w.cal>0.1&&typeof smoke!=='undefined')for(let i=0;i<14;i++)smoke.spawn(o,rnd(4)+d.x*0.004,rnd(1.5)+1,rnd(4)+d.z*0.004,2+Math.random()*2,2,7,0.5,0.6,0.56,0.5,0.6);// muzzle blast + ground dust
   st.susVP=(st.susVP||0)+(w.cal>0.1?0.5:0.05);}
  else{st.ud.flash.material.opacity=0.6;}}
 function popSmoke(st){// M250/M257 grenades: 6 per side fan forward ~30 m, cloud blocks LOS 25 s
  const f=V3(-Math.sin(st.hdg+st.tYaw),0,-Math.cos(st.hdg+st.tYaw));for(let i=0;i<8;i++){const a=(i-3.5)*0.16;const c=V3(st.pos.x+(f.x*Math.cos(a)-f.z*Math.sin(a))*30,st.pos.y+1,st.pos.z+(f.z*Math.cos(a)+f.x*Math.sin(a))*30);st.smoke.push({c,t:25});CLOUDS.push({c,t:25,r:9});}
  if(typeof sfx==='function')sfx('hit',0.3);}
 const CLOUDS=[];
 function losBlocked(a,b){for(const c of CLOUDS){const ab=_cw.copy(b).sub(a);const L=ab.length();ab.divideScalar(L);const t=clamp(_v.copy(c.c).sub(a).dot(ab),0,L);if(a.clone().addScaledVector(ab,t).distanceTo(c.c)<c.r)return true;}return false;}
 // armor model: incoming direction vs hull frame -> front / side / rear; height -> tracks / turret modules
 function hitArmor(st,p,dir,w,attacker){if(st.dead)return;const inv=_q.copy(st.mesh.quaternion).invert();const l=_v.copy(p).sub(st.pos).applyQuaternion(inv);const di=dir.clone().applyQuaternion(inv);
  const az=Math.atan2(-di.x,di.z);// angle of travel; shot moving +z in hull frame = coming from front
  const fa=Math.abs(az);const face=fa<0.6?0:fa>2.5?2:1;let arm=st.s.arm[face];const onTur=l.y>st.s.trY+0.05&&st.s.barrel;if(onTur&&face===0)arm*=1.1;
  const pen=w.pen*(0.85+Math.random()*0.3);const pens=pen>arm;let dmg=pens?w.dmg:(w.he?w.dmg*0.12:w.dmg*0.04);if(w.type==='mg'&&!pens)dmg=0;
  if(w.he&&!pens&&st.s.arm[1]<w.pen*2)dmg+=w.dmg*0.2;
  st.hp-=dmg;st.lastHit=attacker;const big=w.cal>=0.1;
  if(big){if(typeof explosion==='function')explosion(p.clone(),pens?0.7:0.35);if(!pens&&typeof fire!=='undefined')for(let i=0;i<10;i++)fire.spawn(p,rnd(30),rnd(20)+5,rnd(30),0.3,0.3,0.6,1,0.9,0.6,1,1,0,1,0.3,0.1);}// ricochet sparks
  if(attacker===PL&&typeof hitTick==='function')try{hitTick(false);}catch(e){}
  // modules
  if((pens||w.he)&&big&&st.s.track&&l.y<0.95&&face===1&&Math.random()<0.75){if(l.x<0)st.trkL=0;else st.trkR=0;throwTrack(st,l.x<0?0:1);}
  if(pens&&big&&onTur&&st.hp>0&&Math.random()<0.5){st.turOK=0;st.smokeT=60;}
  if(st.hp<=0)kill(st,attacker,pens&&face===2||onTur&&pens);
  if(st===PL)msg(pens?(st.hp>0?'HIT  '+['FRONT','SIDE','REAR'][face]:''):'RICOCHET',0.8);}
 function throwTrack(st,i){const t=st.ud.tracks[i];if(!t||t.thrown)return;t.thrown=1;t.im.visible=false;// lay a flat broken track beside the hull
  const g=new T.Mesh(new T.BoxGeometry(0.64,0.07,st.s.L*0.7),M.trk);g.position.set(t.x*1.6,0.05,0.6);g.rotation.y=0.15;st.ud.hull.add(g);st.ud.thrownM=(st.ud.thrownM||[]).concat(g);}
 function kill(st,by,cook){if(st.dead)return;st.dead=1;st.alive=false;st.hp=0;st.spd=0;// catastrophic kill: ammo cook-off, turret toss, persistent fire
  st.mesh.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&!o.material.transparent){o.userData.m0=o.userData.m0||o.material;o.material=M.char;}});
  if(typeof explosion==='function')explosion(st.pos.clone().setY(st.pos.y+2),st.s.cal||2.4);
  const tu=st.ud.tu;st.toss={v:V3(rnd(4),12+Math.random()*10,rnd(4)),w:V3(rnd(2),rnd(2),rnd(2)),y0:tu.position.y};
  if(typeof fires!=='undefined')fires.push({p:st.pos.clone().setY(st.pos.y+1.6),t:45,s:1.2});
  if(st.tgt&&st.tgt.alive){st.tgt.__tkKill=1;try{killTarget(st.tgt,true);}catch(e){}st.tgt.__tkKill=0;st.mesh.visible=true;st.tgt.alive=false;}
  if(st===PL){msg('VEHICLE DESTROYED',3);setTimeout(()=>{if(player&&player.tk===st){player.alive=false;player.crashT=1.5;}},2500);}
  st.respT=st.side==='red'?40:0;}
 function upShells(dt){for(let i=SH.length-1;i>=0;i--){const b=SH[i];b.life-=dt;const p0=b.p.clone();b.v.y-=G*dt;if(b.rk)b.v.y+=G*dt*0.4;b.p.addScaledVector(b.v,dt);b.m.position.copy(b.p);b.m.lookAt(_v.copy(b.p).add(b.v));
   let dead=b.life<=0,hitP=null;const seg=b.p.distanceTo(p0),dir=_cw.copy(b.v).normalize();
   for(const st of V){if(st===b.own||st.dead||!st.mesh.visible)continue;const c=_v.copy(st.pos);c.y+=st.s.H*0.5;// swept sphere vs OBB-ish
    const t=clamp(c.clone().sub(p0).dot(dir),0,seg),q=p0.clone().addScaledVector(dir,t);const inv=new T.Quaternion().copy(st.mesh.quaternion).invert();const l=q.clone().sub(st.pos).applyQuaternion(inv);
    if(Math.abs(l.x)<st.s.Wd/2&&Math.abs(l.z)<st.s.L/2&&l.y>0&&l.y<st.s.H+0.2){hitArmor(st,q,dir,b.w,b.own);hitP=q;dead=true;break;}}
   if(!dead&&b.own===PL||(!dead&&b.own&&b.own.side==='us')){for(const t of targets){if(!t.alive||t.tankx)continue;const r=t.army?(t.type==='inf'?3:5):(t.kind==='boat'?14:10);if(t.pos.distanceToSquared(b.p)<(r+seg*0.5)**2||(b.w.he&&t.pos.distanceTo(b.p)<b.w.he&&b.p.y-groundAt(b.p.x,b.p.z).h<2)){if(b.w.type!=='mg'||t.type==='inf'||t.kind==='drone'||Math.random()<0.15){killTarget(t,b.w.cal>0.1);}hitP=b.p.clone();dead=true;break;}}}
   if(!dead){const g=groundAt(b.p.x,b.p.z);if(b.p.y<g.h){dead=true;hitP=b.p.clone().setY(g.h);if(g.type==='water'&&typeof splash==='function')splash(hitP,b.w.cal>0.1?1.5:0.3);
     else{if(b.w.type==='mg'){if(nearCam(hitP,500)&&typeof smoke!=='undefined')smoke.spawn(hitP,0,2,0,0.6,1,2,0.5,0.45,0.4,0.6);}else if(typeof explosion==='function')explosion(hitP,b.w.he?Math.min(3,b.w.he/8):0.4);}
     if(b.w.he)for(const st of V)if(!st.dead&&st.pos.distanceTo(hitP)<b.w.he)hitArmor(st,st.pos.clone().setY(st.pos.y+1),hitP.clone().sub(st.pos).negate().normalize(),{...b.w,dmg:b.w.dmg*0.5*(1-st.pos.distanceTo(hitP)/b.w.he),cal:0.01},b.own);}}
   if(dead){scene.remove(b.m);SH.splice(i,1);}}}
 // ---------- player ----------
 let PL=null;const aim={id:null,x:0,y:0};
 function onArmor(){return !!(PL&&player&&player.def&&player.def.cls==='armor'&&player.tk===PL);}
 addEventListener('touchstart',e=>{if(!onArmor())return;for(const t of e.changedTouches)if(t.clientX>innerWidth*0.45&&aim.id==null&&!(t.target.closest&&t.target.closest('.tb,#bFire,#bWpn,#bCtx,#bCam'))){aim.id=t.identifier;aim.x=t.clientX;aim.y=t.clientY;}},{passive:true});
 addEventListener('touchmove',e=>{if(!onArmor()||e.touches.length>1)return;for(const t of e.changedTouches)if(t.identifier===aim.id){const z=sightZ();PL.aimYaw-=(t.clientX-aim.x)*0.005*z;PL.aimEl=clamp(PL.aimEl-(t.clientY-aim.y)*0.004*z,PL.s.eMin,PL.s.eMax);aim.x=t.clientX;aim.y=t.clientY;}},{passive:true});
 addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===aim.id)aim.id=null;},{passive:true});
 addEventListener('mousemove',e=>{if(onArmor()&&e.buttons&1&&e.clientX>innerWidth*0.45){const z=sightZ();PL.aimYaw-=e.movementX*0.004*z;PL.aimEl=clamp(PL.aimEl-e.movementY*0.003*z,PL.s.eMin,PL.s.eMax);}});
 function zoomV(){return typeof FL!=='undefined'?(FL.zoomT||FL.zoom||1):1;}
 function view(){const z=zoomV();return PL&&PL.driver?'driver':z<0.32?'thermal':z<0.62?'gunner':'chase';}
 function sightZ(){const v=view();return v==='gunner'||v==='thermal'?0.25:1;}
 function spawnArmor(kind,loc){if(player&&player.mesh&&player.own)scene.remove(player.mesh);for(const o of projs)if(o.mesh)scene.remove(o.mesh);projs.length=0;camFollow=null;blastCam=null;
  const d=DEFS[kind];const mesh=build(kind,'us');const st=makeState(kind,'us',mesh);
  const sp=spawnPoint();st.pos.copy(sp.p);st.hdg=sp.h;st.aimYaw=sp.h;mesh.position.copy(sp.p);scene.add(mesh);
  const v={kind,loc,def:d,alive:true,vel:st.vel,weapons:d.weapons.slice(),wi:0,ammo:{},spd:0,own:true,onGround:true,throttle:0,crashT:0,mesh,tk:st};
  for(const w of d.wpn)v.ammo[W[w].id]=st.ammo[w];if(PL&&PL!==st)drop(PL);PL=st;V.push(st);player=v;st.driver=false;
  if(typeof inp!=='undefined')inp.throttle=0;camSmooth.copy(sp.p).add(V3(0,8,20));addCrew(st);try{updateCtxLabel();}catch(e){}$('rocketHud').style.display='none';const bw=$('bWarp');if(bw)bw.style.display='none';msg(d.name,2);ensureAI();return v;}
 function drop(st){const i=V.indexOf(st);if(i>=0)V.splice(i,1);if(st.mesh.parent&&st!==PL)scene.remove(st.mesh);}
 function spawnPoint(){// army base if base_ builder present; else friendly land facing the enemy army area
  const BS=window.__bases;if(BS&&BS.ARMY){const B=BS.ARMY;return {p:V3(B.cx+(B.spawn?B.spawn[0]:0)+12,0,B.cz+(B.spawn?B.spawn[1]:0)+12).setY(groundAt(B.cx+12,B.cz+12).h),h:0};}
  const E=(window.__army&&__army.LAND&&__army.LAND[0])||(typeof ENEMY!=='undefined'?ENEMY:{x:-5000,z:-5000});
  for(let r=2600;r<9000;r+=300)for(let a=0;a<6.28;a+=0.3){const x=E.x+Math.cos(a)*r,z=E.z+Math.sin(a)*r;const g=groundAt(x,z);if(g.type==='land'&&g.h<60&&flat(x,z)){return {p:V3(x,g.h,z),h:Math.atan2(-(E.x-x),-(E.z-z))};}}
  return {p:V3(0,groundAt(0,0).h,1300),h:0};}
 function flat(x,z){const a=groundAt(x,z).h;for(const [dx,dz] of[[12,0],[-12,0],[0,12],[0,-12]]){const g=groundAt(x+dx,z+dz);if(g.type!=='land'||Math.abs(g.h-a)>2)return false;}return true;}
 function addCrew(st){if(st.crewDone||!window.PPL||!PPL.crew)return;const go=()=>{try{const c=PPL.crew(st.ud.tu,{n:1,pose:'stand',kind:st.side==='red'?'enemy':'crew',at:[V3(st.kind==='abrams'?-0.6:0.4,st.kind==='paladin'?1.0:0.25,st.kind==='abrams'?0.9:0.3)]});if(c&&c[0]){c[0].root.scale.multiplyScalar(0.95);st.crew=c;}st.crewDone=1;}catch(e){}};
  if(st.kind==='stryker'||st.kind==='jltv'||st.kind==='himarsd')return;PPL.onReady?PPL.onReady(go):go();}
 // ---------- enemy AI (Red Coalition) : same models, red paint/flags/stars; drive + engage; no owner-only weapons ----------
 const AIK=['abrams','bradley','abrams','stryker'];let aiBuilt=false;
 function ensureAI(){if(aiBuilt)return;aiBuilt=true;const sp=PL?PL.pos:V3();for(let i=0;i<AIK.length;i++)spawnAI(AIK[i],i);}
 function spawnAI(kind,i){const mesh=build(kind,'red');const st=makeState(kind,'red',mesh);st.ai={mode:'move',t:0,wp:null,i};placeAI(st);scene.add(mesh);V.push(st);addCrew(st);
  const t={kind:'Red '+S[kind].name.split(' ')[0],pos:st.pos,vel:st.vel,alive:true,mesh,tankx:st,army:1,resp:1e9,hdg:0,phase:0,def:{score:250,name:'Red '+S[kind].name}};st.tgt=t;targets.push(t);return st;}
 function placeAI(st){const c=PL?PL.pos:V3();for(let k=0;k<60;k++){const a=Math.random()*6.28,r=1100+Math.random()*900;const x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;const g=groundAt(x,z);if(g.type==='land'&&flat(x,z)){st.pos.set(x,g.h,z);st.hdg=Math.atan2(-(c.x-x),-(c.z-z));st.aimYaw=st.hdg;return;}}
  st.pos.set(c.x+1500,groundAt(c.x+1500,c.z).h,c.z);}
 function revive(st){st.dead=0;st.alive=true;st.hp=st.s.hp;st.trkL=st.trkR=st.turOK=1;st.toss=null;st.ud.tu.position.y=st.s.trY;st.ud.tu.rotation.set(0,0,0);st.ud.tu.position.x=0;
  if(st.ud.tu.parent!==st.ud.hull)st.ud.hull.add(st.ud.tu);st.mesh.traverse(o=>{if(o.userData.m0)o.material=o.userData.m0;});for(const t of st.ud.tracks){t.thrown=0;t.im.visible=true;}for(const m of st.ud.thrownM||[])st.ud.hull.remove(m);st.ud.thrownM=[];
  for(const k in st.ammo)st.ammo[k]=W[k].ammo;placeAI(st);if(st.tgt){st.tgt.alive=true;st.mesh.visible=true;}}
 function aiTarget(st){// engage player armor / ground player / low aircraft in range, else nearest US armor
  let best=null,bd=3000;for(const o of V)if(o.side!==st.side&&!o.dead){const d=o.pos.distanceTo(st.pos);if(d<bd){bd=d;best={p:o.pos.clone().setY(o.pos.y+1.4),v:o.vel,st:o};}}
  if(!best&&player&&player.alive&&player.mesh&&player.def.cls!=='armor'&&player.kind!=='foot'){const p=player.mesh.position;const d=p.distanceTo(st.pos);if(d<2200&&p.y-groundAt(p.x,p.z).h<60)best={p:p.clone(),v:player.vel||V3(),pl:1};}return best;}
 function upAI(st,dt){const A=st.ai;A.t-=dt;const tg=aiTarget(st);let thr=0,steer=0;
  if(tg){const d=tg.p.distanceTo(st.pos);const w=W[st.s.wpn[0]];const tof=d/w.v;const lead=tg.p.clone().addScaledVector(tg.v,tof);const dx=lead.x-st.pos.x,dz=lead.z-st.pos.z,hz=Math.hypot(dx,dz);
   st.aimYaw=Math.atan2(-dx,-dz)+rnd(0.004);st.aimEl=Math.atan2(lead.y-(st.pos.y+st.s.trY)+0.5*G*tof*tof,hz);
   // approach to ~1200 m, then hold hull-down & angle front armor at target
   const want=Math.atan2(-dx,-dz);let e=Math.atan2(Math.sin(want-st.hdg),Math.cos(want-st.hdg));
   if(d>1300){thr=0.7;steer=clamp(-e*2,-1,1);}else if(Math.abs(e)>0.25){thr=0;steer=clamp(-e*2,-1,1);}
   const wy=st.hdg+st.tYaw,ae=Math.abs(Math.atan2(Math.sin(st.aimYaw-wy),Math.cos(st.aimYaw-wy)));
   if(ae<0.012&&Math.abs(st.aimEl-st.gEl-st.pitch*Math.cos(st.tYaw))<0.02&&st.cd<=0&&d<2600&&!losBlocked(st.pos.clone().setY(st.pos.y+2),tg.p)){st.wi=0;fireW(st);}
   if(st.hp<st.s.hp*0.5&&!A.smoked&&st.ammo.SMOKE>0){st.wi=st.s.wpn.indexOf('SMOKE');st.cd=0;fireW(st);A.smoked=1;st.wi=0;}}
  else{if(!A.wp||A.t<0||A.wp.distanceTo(st.pos)<30){A.t=20;const c=PL?PL.pos:st.pos;A.wp=V3(c.x+rnd(1500),0,c.z+rnd(1500));}const dx=A.wp.x-st.pos.x,dz=A.wp.z-st.pos.z;const e=Math.atan2(Math.sin(Math.atan2(-dx,-dz)-st.hdg),Math.cos(Math.atan2(-dx,-dz)-st.hdg));thr=0.5;steer=clamp(-e*2,-1,1);st.aimYaw=st.hdg;st.aimEl=0;}
  drive(st,dt,thr,steer);slew(st,dt);}
 // ---------- per-frame ----------
 let lastFire=false;
 function frame(dt){if(!V.length)return;if(typeof paused!=='undefined'&&paused)return;
  for(let i=CLOUDS.length-1;i>=0;i--){const c=CLOUDS[i];c.t-=dt;c.r=Math.min(14,c.r+dt*2);if(nearCam(c.c,2500)&&Math.random()<dt*6&&typeof smoke!=='undefined')smoke.spawn(c.c.clone().add(V3(rnd(c.r),rnd(2),rnd(c.r))),rnd(0.6),0.3,rnd(0.6),c.r*0.9,6,12,0.85,0.86,0.86,0.84,0.7);if(c.t<=0)CLOUDS.splice(i,1);}
  for(const st of V){st.cd-=dt;
   if(st.fireT>0){st.fireT-=dt;st.ud.flash.material.opacity=Math.max(0,st.fireT/0.35);}else st.ud.flash.material.opacity*=0.5;
   if(st.recoil){st.recoil=Math.max(0,st.recoil-dt*3);st.ud.gun.children.forEach(c=>{});st.ud.gun.position.z=(st.ud.gun.userData.z0??(st.ud.gun.userData.z0=st.ud.gun.position.z))+st.recoil*0.45;}
   if(st.toss){const tu=st.ud.tu;st.toss.v.y-=G*dt;tu.position.addScaledVector(st.toss.v,dt);tu.rotation.x+=st.toss.w.x*dt;tu.rotation.z+=st.toss.w.z*dt;const wp=tu.getWorldPosition(_v);if(wp.y<groundAt(wp.x,wp.z).h+0.3){st.toss.v.multiplyScalar(0);st.toss.w.multiplyScalar(0);}}
   if(st.dead){if(st.respT>0){st.respT-=dt;if(st.respT<=0)revive(st);}if(Math.random()<dt*4&&nearCam(st.pos,2000)&&typeof smoke!=='undefined')smoke.spawn(st.pos.clone().setY(st.pos.y+2.5),rnd(1),3,rnd(1),4,5,12,0.15,0.13,0.12,0.12,0.8);syncMesh(st);continue;}
   if(st.smokeT>0){st.smokeT-=dt;if(Math.random()<dt*3&&nearCam(st.pos,1500)&&typeof smoke!=='undefined')smoke.spawn(st.pos.clone().setY(st.pos.y+st.s.trY+1),0,2,0,1.5,3,8,0.3,0.28,0.26,0.25,0.7);}
   if(st.ai)upAI(st,dt);else if(st===PL&&player&&player.tk===st&&player.alive)upPlayer(st,dt);else if(st.remote)upRemote(st,dt);
   syncMesh(st);
   // LOD: hide running-gear detail / crew beyond 700 m
   const far=!nearCam(st.pos,700);for(const w of st.ud.wheels)w.visible=!far;if(st.crew)for(const c of st.crew)c.root.visible=!far;
   if(st.tgt){st.tgt.pos=st.pos;st.tgt.vel=st.vel;}}
  upShells(dt);}
 function upPlayer(st,dt){const thr=clamp(inp.pitch||0,-1,1),steer=clamp(inp.roll||0,-1,1);drive(st,dt,thr,steer);
  // owner aim assist (aimbot #17/mp_aim) if owner + present: snap aim to nearest red vehicle in front
  if(window.__ownerAim&&__ownerAim()){let b=null,bd=2500;for(const o of V)if(o.side==='red'&&!o.dead){const d=o.pos.distanceTo(st.pos);if(d<bd){bd=d;b=o;}}if(b){const w=W[st.s.wpn[st.wi]]||W.AP120;const tof=bd/(w.v||1000);const L=b.pos.clone().addScaledVector(b.vel,tof);st.aimYaw=Math.atan2(-(L.x-st.pos.x),-(L.z-st.pos.z));st.aimEl=Math.atan2(L.y+1.2-(st.pos.y+st.s.trY)+0.5*G*tof*tof,Math.hypot(L.x-st.pos.x,L.z-st.pos.z));}}
  slew(st,dt);const w=W[st.s.wpn[st.wi]];const f=!!inp.fire;if(f&&(w.auto||!lastFire))fireW(st);lastFire=f;
  player.spd=Math.abs(st.spd);player.onGround=true;for(const k of st.s.wpn)player.ammo[W[k].id]=st.ammo[k];player.wi=st.wi;
  if(st.cd>0&&w.type==='shell'&&!w.auto&&reticle)reticle.dataset.rl=1;}
 // ---------- camera: chase / gunner sight (pinch) / thermal (pinch further) / driver (CAM button) ----------
 const canvasEl=()=>document.querySelector('canvas');let reticle=null,curView='';
 function setView(v){if(v===curView)return;curView=v;const c=canvasEl();if(c)c.style.filter=v==='thermal'?'grayscale(1) contrast(1.9) brightness(1.15)':'';
  if(!reticle){reticle=document.createElement('div');reticle.id='tankSight';reticle.style.cssText='position:fixed;inset:0;pointer-events:none;display:none;z-index:5';
   reticle.innerHTML='<svg width="100%" height="100%" viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0"><g stroke="#e8ffe8" stroke-width="0.25" fill="none" opacity=".85"><path d="M-30 0H-3M3 0H30M0 3V25"/><path d="M-2 6h4M-1.5 9h3M-1 12h2"/><circle r="42" stroke="#000" stroke-width="18" opacity=".55"/></g></svg>';document.body.appendChild(reticle);}
  reticle.style.display=v==='gunner'||v==='thermal'?'block':'none';}
 {const _uc=updCamera;updCamera=function(dt){if(!onArmor()){if(curView)setView('');return _uc(dt);}const st=PL,v=view();setView(v);st.mesh.updateMatrixWorld(true);
  if(v==='gunner'||v==='thermal'){const o=V3(),d=V3();muzzle(st,o,d);const tp=st.ud.tu.localToWorld(V3(st.kind==='abrams'?0.75:0.5,st.s.barrel?1.0:0.5,st.kind==='abrams'?-1.3:-0.5));camera.position.copy(tp);camera.lookAt(tp.clone().add(d));camera.fov=v==='thermal'?6:14;camera.updateProjectionMatrix();return;}
  if(camera.fov!==55&&camera.userData.tk0==null)camera.userData.tk0=camera.fov;if(camera.userData.tk0!=null&&camera.fov!==camera.userData.tk0){camera.fov=camera.userData.tk0;camera.updateProjectionMatrix();}
  if(v==='driver'){const p=st.ud.hull.localToWorld(V3(st.s.track?0:-0.45,st.s.track?1.55:2.05,-st.s.L*0.38));camera.position.copy(p);camera.lookAt(st.ud.hull.localToWorld(V3(0,1.2,-st.s.L*3)));return;}
  const yaw=st.aimYaw,dist=(st.s.L*1.7+6)*Math.max(1,zoomV()),h=st.s.H+2.6;const want=V3(st.pos.x+Math.sin(yaw)*dist,st.pos.y+h,st.pos.z+Math.cos(yaw)*dist);const g=groundAt(want.x,want.z).h+1.5;if(want.y<g)want.y=g;
  camSmooth.lerp(want,Math.min(1,dt*6));camera.position.copy(camSmooth);camera.lookAt(st.pos.x-Math.sin(yaw)*30,st.pos.y+st.s.H*0.8+Math.tan(st.aimEl)*30,st.pos.z-Math.cos(yaw)*30);};}
 {const _cw2=cycleWeapon;cycleWeapon=function(){if(!onArmor())return _cw2();const st=PL;st.wi=(st.wi+1)%st.s.wpn.length;player.wi=st.wi;st.cd=Math.max(st.cd,0.4);msg(W[st.s.wpn[st.wi]].lab,0.8);try{updateCtxLabel();}catch(e){}};}
 {const _cc=cycleCam;cycleCam=function(){if(!onArmor())return _cc();PL.driver=!PL.driver;};}
 {const _f=fireWeapon;fireWeapon=function(v){if(v&&v.def&&v.def.cls==='armor')return false;return _f(v);};}
 {const _u=updateCtxLabel;updateCtxLabel=function(){if(onArmor()){const b=$('bCtx'),w=$('bWpn');if(b)b.textContent='—';if(w)w.textContent=W[PL.s.wpn[PL.wi]].lab;return;}_u();};}
 {const _s=spawn;spawn=function(kind,loc){if(!DEFS[kind]){try{msg('UNKNOWN VEHICLE',1.2);}catch(e){}return player;}if(DEFS[kind].cls==='armor')return spawnArmor(kind,loc);if(PL&&player&&player.tk===PL){drop(PL);scene.remove(PL.mesh);PL=null;try{setView('');}catch(e){}}return _s(kind,loc);};}
 {const _k=killTarget;killTarget=function(t,big){if(t&&t.tankx&&!t.__tkKill){hitArmor(t.tankx,t.pos.clone().setY(t.pos.y+1),V3(rnd(1),-0.3,rnd(1)).normalize(),{pen:big?900:400,dmg:big?100:45,cal:0.12,he:5},PL);return;}return _k(t,big);};}
 // enter/exit (base_ #22 owns it): long-press WPN when stopped -> dismount; parked tanks at the army base are props you tap to enter
 {const el=document.getElementById('bWpn');let t=null;const dn=()=>{if(!onArmor())return;t=setTimeout(()=>{const B=window.__base;if(!B||!B.goFoot||Math.abs(PL.spd)>1)return;const st=PL,m=st.mesh;const P={kind:st.kind,mesh:m,base:null};m.userData.__propRec=P;m.traverse(o=>{if(o.isMesh)o.userData.__prop=m;});
   if(B.props)B.props.push(P);drop(st);PL=null;player.own=false;setView('');const off=V3(-st.s.Wd/2-1.2,0,0).applyAxisAngle(V3(0,1,0),st.hdg);B.goFoot(m.position.x+off.x,m.position.z+off.z,st.hdg);msg('',0.1);},600);};const up=()=>clearTimeout(t);
  if(el){el.addEventListener('touchstart',dn,{passive:true});el.addEventListener('mousedown',dn);el.addEventListener('touchend',up);el.addEventListener('mouseup',up);}}
 function parkAtBase(){const BS=window.__bases,B=window.__base;if(!BS||!BS.ARMY||!B||!B.props)return false;const A=BS.ARMY;['abrams','bradley','stryker','jltv'].forEach((k,i)=>{const m=build(k,'us');const x=A.cx+30+i*9,z=A.cz-20;m.position.set(x,groundAt(x,z).h,z);scene.add(m);const P={kind:k,mesh:m,base:A};m.userData.__propRec=P;m.traverse(o=>{if(o.isMesh)o.userData.__prop=m;});B.props.push(P);});return true;}
 {let tries=0;const iv=setInterval(()=>{if(parkAtBase()||++tries>40)clearInterval(iv);},1500);}
 // ---------- multiplayer hooks for mp_ (#17): every player can drive one; host authoritative damage ----------
 function getState(){const st=PL;if(!st)return null;const s={k:st.kind,id:st.id,p:[+st.pos.x.toFixed(2),+st.pos.y.toFixed(2),+st.pos.z.toFixed(2)],h:+st.hdg.toFixed(3),sp:+st.spd.toFixed(2),ty:+st.tYaw.toFixed(3),ge:+st.gEl.toFixed(3),hp:Math.round(st.hp),tl:st.trkL,tr:st.trkR,to:st.turOK,dd:st.dead,wi:st.wi,sh:SHOUT.splice(0)};return s;}
 const SHOUT=[];{const _fw=fireW;}// shots fired by the local player are queued for sync
 const REM=new Map();
 function applyState(peer,s){if(!s)return;let st=REM.get(peer);if(!st||st.kind!==s.k){if(st){drop(st);scene.remove(st.mesh);}const m=build(s.k,s.side||'us');st=makeState(s.k,s.side||'us',m);st.remote=1;scene.add(m);V.push(st);REM.set(peer,st);}
  st.net={p:V3(...s.p),h:s.h,ty:s.ty,ge:s.ge,sp:s.sp};st.hp=s.hp;st.trkL=s.tl;st.trkR=s.tr;st.turOK=s.to;if(s.dd&&!st.dead)kill(st,null,1);if(!s.dd&&st.dead){st.dead=0;st.alive=true;st.mesh.traverse(o=>{if(o.userData.m0)o.material=o.userData.m0;});}
  for(const f of s.sh||[]){const w=W[f.w];const m=new T.Mesh(w.type==='mg'?trGeo:shGeo,M.tracer);m.position.set(...f.o);scene.add(m);SH.push({p:V3(...f.o),v:V3(...f.v),w,own:st,life:12,m});}}
 function upRemote(st,dt){const n=st.net;if(!n)return;st.pos.lerp(n.p,Math.min(1,dt*8));let dh=Math.atan2(Math.sin(n.h-st.hdg),Math.cos(n.h-st.hdg));st.hdg+=dh*Math.min(1,dt*8);st.tYaw+=(n.ty-st.tYaw)*Math.min(1,dt*10);st.gEl+=(n.ge-st.gEl)*Math.min(1,dt*10);st.spd=n.sp;
  const g=gh(st.pos.x,st.pos.z);st.pos.y=g.h;}
 // queue local shots for mp
 {const orig=fireW;}
 const _push=SH.push.bind(SH);SH.push=function(b){if(b.own===PL&&PL)SHOUT.push({w:Object.keys(W).find(k=>W[k]===b.w),o:b.p.toArray().map(x=>+x.toFixed(2)),v:b.v.toArray().map(x=>+x.toFixed(1))});if(SHOUT.length>20)SHOUT.shift();return _push(b);};
 window.tank_getState=getState;window.tank_applyState=applyState;window.tank_dropPeer=p=>{const st=REM.get(p);if(st){drop(st);scene.remove(st.mesh);REM.delete(p);}};
 {const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{frame(dt);}catch(e){console.error('tank',e);}};}
 return {get inp(){return inp},spawnK:(k)=>spawn(k),get player(){return player},A:()=>aiTarget,S,W,V,build,spawnArmor,get PL(){return PL},view,hitArmor,kill,CLOUDS,SH,revive,spawnAI,groundAt:(x,z)=>groundAt(x,z)};})();
window.__tank=TANK;
// TANK_END
