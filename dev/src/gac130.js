// ===== AC-130J "GHOSTRIDER" gunship killstreak: auto left-hand orbit, stabilised thermal sensor, 25/40/105 mm guns =====
DEFS.ac130={name:'AC-130J Gunship',desc:'Killstreak: orbit the target area at 2,400 m AGL. Thermal sensor (WHT/BHT), 25 mm Gatling, 40 mm Bofors, 105 mm howitzer.',cls:'silo',weapons:['25MM','40MM','105MM']};
AMMO['25MM']=1e9;AMMO['40MM']=1e9;AMMO['105MM']=1e9;
// real-world figures: GAU-12 1,800 rpm / 1,040 m/s, Bofors L/60 120 rpm 4-rd clips / 880 m/s, M102 ~10 rpm hand loaded / 494 m/s
const ACG={'25MM':{name:'25 mm GAU-12/U',rate:30,mag:300,rel:4.0,v:1040,r:5,fov:34,spread:0.0016,tr:2},
 '40MM':{name:'40 mm L/60 BOFORS',rate:2,mag:4,rel:2.4,v:880,r:11,fov:18,spread:0.0007,tr:1},
 '105MM':{name:'105 mm M102',rate:1,mag:1,rel:5.5,v:494,r:32,fov:9,spread:0.0003,tr:1}};
const AC_ALT=2400,AC_R=2700,AC_SPD=120;
let AC=null;const AC_EYE=new THREE.Vector3();window.__ac130=()=>AC;
function acTex(){const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d');x.fillStyle='#5f6569';x.fillRect(0,0,1024,256);
 for(let i=0;i<500;i++){x.fillStyle=`rgba(${Math.random()<.5?30:140},${Math.random()<.5?34:146},${Math.random()<.5?38:150},.05)`;x.fillRect(Math.random()*1024,Math.random()*256,10+Math.random()*80,4+Math.random()*30);}
 x.strokeStyle='rgba(30,33,36,.55)';x.lineWidth=1;for(let i=0;i<24;i++){x.beginPath();x.moveTo(i*43,0);x.lineTo(i*43,256);x.stroke();}for(let j=1;j<4;j++){x.beginPath();x.moveTo(0,j*64);x.lineTo(1024,j*64);x.stroke();}
 x.fillStyle='rgba(25,28,30,.5)';for(let i=0;i<24;i++)for(let j=0;j<16;j++)x.fillRect(i*43+2,j*16+3,1.2,1.2); // rivet rows
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
// generic loft: rings of equal point count -> smooth skinned mesh (fuselage, wings, blades)
function acLoft(rings,closeU=true){const n=rings[0].length,m=rings.length,pos=[],uv=[],idx=[];
 for(let j=0;j<m;j++)for(let i=0;i<=n;i++){const q=rings[j][i%n];pos.push(q.x,q.y,q.z);uv.push(i/n,j/(m-1));}
 for(let j=0;j<m-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+1,c=a+n+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// NACA 4-digit symmetric section, t = thickness ratio
function acFoil(n,t){const P=[];for(let i=0;i<n;i++){const th=i/n*Math.PI*2;const x=(1+Math.cos(th))/2;const y=5*t*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x*x*x-0.1036*x*x*x*x)*(th<Math.PI?1:-1);P.push([x,y]);}return P;}
// surface (span along +X for wings): sections {s:span pos, le:leading edge z, c:chord, t, y, tw:twist}
function acSurf(secs,vert){const F=acFoil(36,1);const R=secs.map(S=>F.map(([x,y])=>{const tt=S.t*S.c/0.12*0.12;const zz=S.le-x*S.c;const yy=y*S.t/1*S.c;const tw=S.tw||0;const zr=zz,yr=yy;
  return vert?V3(yr,S.s,zr):V3(S.s,S.y+yr+(zr-S.le)*Math.sin(tw),zr);}));
 return acLoft(R);}
function acPanelTex(rep){const c=document.createElement('canvas');c.width=2048;c.height=1024;const x=c.getContext('2d');x.fillStyle='#6b7176';x.fillRect(0,0,2048,1024);
 for(let i=0;i<1400;i++){const v=Math.random();x.fillStyle=`rgba(${v<.5?40:150},${v<.5?44:156},${v<.5?48:160},${0.03+Math.random()*0.04})`;x.fillRect(Math.random()*2048,Math.random()*1024,8+Math.random()*140,4+Math.random()*50);}
 for(let i=0;i<220;i++){x.fillStyle=`rgba(20,22,24,${Math.random()*0.08})`;x.fillRect(Math.random()*2048,Math.random()*1024,2+Math.random()*6,30+Math.random()*120);} // streaks / exhaust staining
 x.strokeStyle='rgba(28,30,33,.6)';x.lineWidth=1.4;for(let i=0;i<=48;i++){x.beginPath();x.moveTo(i*42.7,0);x.lineTo(i*42.7,1024);x.stroke();}for(let j=0;j<=8;j++){x.beginPath();x.moveTo(0,j*128);x.lineTo(2048,j*128);x.stroke();}
 x.strokeStyle='rgba(28,30,33,.25)';x.lineWidth=1;for(let i=0;i<48;i++)for(let j=0;j<8;j++)if(Math.random()<.18){x.strokeRect(i*42.7+6,j*128+14,20+Math.random()*14,30+Math.random()*60);} // access panels
 x.fillStyle='rgba(22,24,26,.55)';for(let i=0;i<=48;i++)for(let j=0;j<128;j++)x.fillRect(i*42.7-1,j*8+2,1.6,1.6);for(let j=0;j<=8;j++)for(let i=0;i<256;i++)x.fillRect(i*8+2,j*128-1,1.6,1.6); // rivets
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=8;return t;}
function acRough(){const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');x.fillStyle='#a0a0a0';x.fillRect(0,0,512,512);for(let i=0;i<3000;i++){const v=120+Math.random()*120|0;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(Math.random()*512,Math.random()*512,2+Math.random()*14,2+Math.random()*14);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,2);return t;}
function ac130Mesh(){const g=new THREE.Group();const rg=acRough();
 const mk=(rep,col)=>new THREE.MeshStandardMaterial({color:col||0xc9ced2,map:acPanelTex(rep),roughnessMap:rg,metalness:0.12,roughness:0.66});
 const sk=mk([1,1]),skW=mk([3,1]),skN=mk([1,1]);
 const dk=new THREE.MeshStandardMaterial({color:0x2b2f33,metalness:0.4,roughness:0.5});const gl=new THREE.MeshPhysicalMaterial({color:0x0b1218,metalness:0.2,roughness:0.04,clearcoat:1,clearcoatRoughness:0.03,envMapIntensity:1.5});
 const bl=new THREE.MeshStandardMaterial({color:0x17191b,metalness:0.3,roughness:0.45});const mt=new THREE.MeshStandardMaterial({color:0x9aa0a5,metalness:0.95,roughness:0.25});const gm=new THREE.MeshStandardMaterial({color:0x3a3c3e,metalness:0.9,roughness:0.35});
 // fuselage loft: 29.8 m long, 4.3 m wide, upswept aft body to the cargo ramp
 const FS=[[15.0,0,0.05,0.05],[14.7,-0.05,0.55,0.5],[14.1,-0.05,1.05,0.95],[13.2,0.0,1.45,1.4],[12.2,0.15,1.8,1.75],[11.0,0.2,2.05,2.1],[9.5,0.2,2.15,2.2],[6,0.15,2.15,2.2],[-5,0.15,2.15,2.2],[-7.5,0.35,2.12,2.05],[-10,0.75,2.0,1.75],[-12.5,1.25,1.75,1.35],[-15,1.8,1.4,0.95],[-17.5,2.3,0.95,0.6],[-19.6,2.65,0.45,0.3],[-20.3,2.75,0.12,0.1]];
 const N=48;const rings=FS.map(([z,yc,w,h])=>{const r=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2;const c=Math.cos(a),s=Math.sin(a);const sq=s<0?1.08:1;const e=2.4;const px=Math.sign(c)*Math.pow(Math.abs(c),2/e)*w/2*2/2,py=Math.sign(s)*Math.pow(Math.abs(s),2/e)*h/2*2/2*sq;r.push(V3(px*1,yc+py,z));}return r;});
 rings.forEach(r=>r.forEach(p=>{p.x*=1;}));const fg=acLoft(rings.reverse());g.add(new THREE.Mesh(fg,mk([6,2])));
 // landing gear sponsons (blister fairings) + main wheel doors
 for(const s of[-1,1]){const sp=[];for(const [z,w,h] of[[3.2,0.05,0.05],[2.6,0.5,0.6],[1.4,0.85,0.95],[-2.8,0.9,1.0],[-4.4,0.6,0.7],[-5.3,0.05,0.05]]){const r=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;r.push(V3(s*(2.0+Math.cos(a)*w*0.9),-1.35+Math.sin(a)*h,z));}sp.push(r);}g.add(new THREE.Mesh(acLoft(s>0?sp:sp.reverse()),sk));
  for(const z of[0.9,-2.3])add(g,new THREE.BoxGeometry(0.03,0.9,1.4),dk,s*2.92,-1.45,z);}
 // cockpit: 6-pane windscreen, eyebrow windows, side windows, crew door, para doors
 const fr=new THREE.MeshStandardMaterial({color:0x3e4246,metalness:0.4,roughness:0.5});
 for(const s of[-1,1]){for(let i=0;i<3;i++){const w=add(g,new THREE.PlaneGeometry(0.62,0.62),gl,s*(0.35+i*0.55),1.42-i*0.09,13.25-i*0.36);w.rotation.set(-0.7+i*0.1,s*(0.18+i*0.42),0);}
  for(let i=0;i<2;i++){const w=add(g,new THREE.PlaneGeometry(0.5,0.3),gl,s*(0.45+i*0.6),1.95,12.6-i*0.2);w.rotation.set(-1.15,s*0.25,0);}
  for(let i=0;i<2;i++){const w=add(g,new THREE.PlaneGeometry(0.55,0.5),gl,s*1.06,1.2,12.0-i*0.6);w.rotation.y=s*Math.PI/2*0.88;}
  const dr=add(g,new THREE.PlaneGeometry(0.9,1.8),new THREE.MeshStandardMaterial({color:0x5b6064,roughness:0.6,metalness:0.3,polygonOffset:true,polygonOffsetFactor:-2}),s*1.085,-0.2,-11.2);dr.rotation.y=s*Math.PI/2;}
 const cd=add(g,new THREE.PlaneGeometry(1.0,1.75),new THREE.MeshStandardMaterial({color:0x585d61,roughness:0.6,polygonOffset:true,polygonOffsetFactor:-2}),1.09,-0.25,9.6);cd.rotation.y=Math.PI/2;
 for(let i=0;i<5;i++){for(const s of[-1,1]){const w=add(g,new THREE.CircleGeometry(0.19,20),gl,s*1.09,0.45,7.6-i*3.1-(i>1?1.2:0));w.rotation.y=s*Math.PI/2;const rn=add(g,new THREE.RingGeometry(0.19,0.25,20),fr,s*1.091,0.45,7.6-i*3.1-(i>1?1.2:0));rn.rotation.y=s*Math.PI/2;}}
 // radome (dark composite) + pitot/AOA probes
 const rd=add(g,new THREE.SphereGeometry(0.6,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x3a3d40,roughness:0.55}),0,-0.08,14.55);rd.rotation.x=Math.PI/2;rd.scale.set(1.0,0.75,0.9);
 for(const s of[-1,1])add(g,new THREE.CylinderGeometry(0.025,0.025,0.6,6).rotateX(Math.PI/2),mt,s*0.9,0.3,13.7);
 // wing: span 40.41 m, NACA 64A318 root -> 64A412 tip, dihedral 2.5 deg, chord 4.88 -> 2.7 m
 for(const s of[-1,1]){const secs=[];for(let k=0;k<=8;k++){const f=k/8;const sp=1.0+f*19.2;secs.push({s:s*sp,le:3.95-f*0.75,c:4.88-f*2.18,t:0.18-f*0.06,y:2.45+sp*Math.tan(0.0436)});}
  const wgm=acSurf(s>0?secs:secs.reverse());g.add(new THREE.Mesh(wgm,skW));
  const tip=add(g,new THREE.SphereGeometry(0.2,16,8),skW,s*20.2,2.45+20.2*0.0436,2.0);tip.scale.set(0.5,1,6.5);
  // flap / aileron hinge lines + actuator fairings
  for(const [a0,a1] of[[1.2,13],[13.2,19.6]]){const len=a1-a0;const hl=add(g,new THREE.BoxGeometry(len,0.02,0.02),bl,s*(a0+len/2),2.62+((a0+a1)/2)*0.0436,3.95-((a0+a1)/2/20)*0.75-(4.88-((a0+a1)/2/20)*2.18)*0.73);}
  for(const x of[3.2,7.7,12.3,15.8])add(g,new THREE.CapsuleGeometry(0.1,0.9,4,8).rotateX(Math.PI/2),skW,s*x,2.25+x*0.0436,-0.4-x*0.02);}
 add(g,new THREE.BoxGeometry(2.4,0.55,5.2),sk,0,2.38,1.5); // wing-root fairing
 // engines: 4x Rolls-Royce AE 2100D3 (4,591 shp) with 6-blade Dowty R391 scimitar props, 4.11 m dia
 const bladeG=(()=>{const F=acFoil(14,1);const R=[];for(let k=0;k<=10;k++){const f=k/10;const r=0.42+f*1.63;const c=(0.34+Math.sin(f*Math.PI)*0.12)*(1-f*0.45);const sw=f*f*0.35;const tw=0.9-f*0.75;R.push(F.map(([x,y])=>{const lx=(x-0.3)*c,ly=y*0.1*c;return V3(Math.cos(tw)*lx-Math.sin(tw)*ly-sw,r,Math.sin(tw)*lx+Math.cos(tw)*ly);}));}return acLoft(R);})();
 g.userData.props=[];for(const x of[-10.06,-5.16,5.16,10.06]){const n=new THREE.Group();n.position.set(x,2.55+Math.abs(x)*0.0436,1.5);g.add(n);
  const nR=[];for(const [z,w,h,yc] of[[3.3,0.3,0.3,0],[3.0,0.62,0.66,0],[2.0,0.72,0.82,-0.12],[0.5,0.74,1.02,-0.3],[-1.5,0.72,1.0,-0.25],[-3.4,0.6,0.85,-0.05],[-5.2,0.35,0.5,0.2],[-6.1,0.1,0.15,0.3]]){const r=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2;r.push(V3(Math.cos(a)*w,yc+Math.sin(a)*h,z));}nR.push(r);}
  n.add(new THREE.Mesh(acLoft(nR),skN));
  add(n,new THREE.BoxGeometry(0.55,0.35,1.0),bl,0,-1.15,2.0); // chin oil-cooler intake
  const ex=add(n,new THREE.CylinderGeometry(0.2,0.24,0.55,16,1,true).rotateZ(Math.PI/2),bl,(x>0?1:-1)*0.72,0.15,-1.6);
  add(n,new THREE.CylinderGeometry(0.17,0.17,0.02,16).rotateZ(Math.PI/2),new THREE.MeshBasicMaterial({color:0x050505}),(x>0?1:-1)*0.99,0.15,-1.6);
  const hub=new THREE.Group();hub.position.z=3.35;n.add(hub);
  const sp=add(hub,new THREE.LatheGeometry([[0,0.95],[0.18,0.8],[0.33,0.5],[0.42,0.15],[0.44,0]].map(a=>new THREE.Vector2(a[0],a[1])),32).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:0x2e3134,metalness:0.4,roughness:0.4}),0,0,0);
  for(let b=0;b<6;b++){const bm=new THREE.Mesh(bladeG,bl);bm.rotation.z=b*Math.PI/3;hub.add(bm);const tp=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.16,0.02),new THREE.MeshStandardMaterial({color:0xd8d8d0}));tp.position.set(-0.32,1.95,0);bm.add(tp);}
  const disc=new THREE.Mesh(new THREE.CircleGeometry(2.06,48),new THREE.MeshBasicMaterial({color:0x202224,transparent:true,opacity:0.0,depthWrite:false,side:THREE.DoubleSide}));disc.position.z=0.02;hub.add(disc);hub.userData.disc=disc;g.userData.props.push(hub);}
 // 1,400-gal external tanks on pylons between nacelles
 for(const s of[-1,1]){const tR=[];for(const [z,r] of[[4.2,0.02],[3.6,0.35],[2.4,0.6],[-1.5,0.6],[-3.6,0.35],[-4.6,0.05]]){const q=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;q.push(V3(s*7.6+Math.cos(a)*r,1.35+Math.sin(a)*r,z+0.8));}tR.push(q);}g.add(new THREE.Mesh(acLoft(tR),skN));add(g,new THREE.BoxGeometry(0.12,0.6,2.4),skN,s*7.6,2.05,1.0);}
 // tail: fin 11.8 m overall height incl. rudder line; tailplane 16 m span with elevator lines + dorsal fillet
 const finSecs=[];for(let k=0;k<=6;k++){const f=k/6;finSecs.push({s:2.3+f*7.1,le:-13.2-f*3.9,c:6.0-f*2.8,t:0.12});}g.add(new THREE.Mesh(acSurf(finSecs,true),sk));
 add(g,new THREE.BoxGeometry(0.02,6.6,0.02),bl,0.22,5.8,-18.6).rotation.x=-0.25;
 const dor=[];for(const [z,h] of[[-6,0.0],[-9,0.35],[-11.8,0.9]]){const r=[];for(let i=0;i<16;i++){const a=i/16*Math.PI;r.push(V3(Math.cos(a)*0.35,2.05+Math.sin(a)*h+(z+6)*-0.02,z));}dor.push(r);}
 for(const s of[-1,1]){const secs=[];for(let k=0;k<=5;k++){const f=k/5;secs.push({s:s*(0.6+f*7.4),le:-15.6-f*1.0,c:3.6-f*1.6,t:0.1,y:2.95});}g.add(new THREE.Mesh(acSurf(s>0?secs:secs.reverse()),sk));
  add(g,new THREE.BoxGeometry(7.0,0.02,0.02),bl,s*4.2,3.05,-18.0);}
 const arm=new THREE.Group();arm.scale.x=-1;g.add(arm); // mirrored to the PORT (+X) side
 // port-side armament (guns protrude from the left side, firing toward the orbit center)
 const barrel=(z,y,len,r,base)=>{const b=add(arm,new THREE.CylinderGeometry(r*0.9,r,len,20).rotateZ(Math.PI/2),gm,-2.15-len/2,y,z);const mzl=add(arm,new THREE.CylinderGeometry(r*1.25,r*1.25,len*0.12,16).rotateZ(Math.PI/2),gm,-2.15-len*0.97,y,z);add(arm,new THREE.CylinderGeometry(base,base*1.1,0.35,20).rotateZ(Math.PI/2),dk,-2.15,y,z);return b;};
 for(let k=0;k<5;k++){const a=k/5*Math.PI*2;barrel(7.2+Math.cos(a)*0.07,-0.95+Math.sin(a)*0.07,1.4,0.025,0.32);} // GAU-12 5-barrel cluster
 barrel(-6.6,-1.0,1.7,0.075,0.42);for(let k=0;k<6;k++)add(arm,new THREE.TorusGeometry(0.1,0.018,6,16).rotateY(Math.PI/2),gm,-2.6-k*0.18,-1.0,-6.6); // Bofors flash hider rings
 barrel(-9.4,-0.75,2.6,0.12,0.62);add(arm,new THREE.CylinderGeometry(0.2,0.2,0.45,16).rotateZ(Math.PI/2),gm,-4.55,-0.75,-9.4); // M102 + muzzle brake
 // EO/IR sensor balls (forward under crew door, aft behind gear), with windows
 const ball=(x,y,z,r)=>{const yk=add(arm,new THREE.CylinderGeometry(r*0.6,r*0.7,0.3,20),dk,x,y+r*0.95,z);add(arm,new THREE.SphereGeometry(r,32,20),mt,x,y,z);for(const [dy,dz,wr] of[[0,0,r*0.42],[r*0.5,r*0.3,r*0.18]]){const w=add(arm,new THREE.CircleGeometry(wr,20),gl,x-r*1.0,y+dy*0.2,z+dz);w.rotation.y=-Math.PI/2;}};
 ball(-1.15,-2.15,10.4,0.45);ball(-1.25,-2.35,-4.9,0.4);
 // AN/AAQ-24 LAIRCM turrets, chaff/flare dispensers, SATCOM blisters, antennas
 for(const s of[-1,1]){add(g,new THREE.SphereGeometry(0.22,16,10),dk,s*1.0,-1.2,12.6);add(g,new THREE.SphereGeometry(0.22,16,10),dk,s*0.75,2.55,-15.5);for(let k=0;k<3;k++)add(g,new THREE.BoxGeometry(0.06,0.35,0.5),bl,s*2.05,-1.95,-3.5-k*0.6);}
 const sat=add(g,new THREE.SphereGeometry(0.55,24,12,0,Math.PI*2,0,Math.PI/2),skN,0,2.15,-3.5);sat.scale.set(1,0.45,1.6);
 for(const [y,z,h] of[[2.2,8.5,0.55],[2.2,5.2,0.3],[-2.2,3.0,0.4],[-2.2,-1.0,0.3],[2.25,-6.0,0.45]]){const a=add(g,new THREE.BoxGeometry(0.04,h,0.45),dk,0,y+Math.sign(y)*h/2,z);a.rotation.x=0.35;}
 add(g,new THREE.CylinderGeometry(0.012,0.012,7.5,4).rotateX(Math.PI/2-0.08),bl,0,2.65,7.5); // HF wire
 // markings
 for(const s of[-1,1]){decal(g,decalTex((x,w,h)=>{x.fillStyle='#2f3337';x.font='bold 64px Arial';x.textAlign='center';x.fillText('U.S. AIR FORCE',w/2,78);},512,128),4.2,1.05,[s*1.1,0.95,4.4],[0,s*Math.PI/2,0],0.8);
  decal(g,decalTex((x,w,h)=>{x.fillStyle='#2f3337';x.font='bold 50px Arial';x.textAlign='center';x.fillText('AF 13-5701',w/2,60);x.font='bold 36px Arial';x.fillText('AFSOC',w/2,110);},256,128),1.8,0.9,[s*0.25,6.2,-17.0],[0,s*Math.PI/2,0],0.8);
  decal(g,decalTex((x,w,h)=>{x.fillStyle='rgba(47,51,55,.8)';x.beginPath();x.arc(64,64,52,0,7);x.lineWidth=7;x.strokeStyle='#2f3337';x.stroke();x.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*4*Math.PI/5;x.lineTo(64+Math.cos(a)*48,64+Math.sin(a)*48);}x.closePath();x.fill();x.fillRect(120,52,130,24);x.fillRect(-6,52,22,24);},256,128),1.8,0.9,[s*1.1,0.5,-6.2],[0,s*Math.PI/2,0],0.75);}
 // walkway lines on wing top, prop warning stripe
 for(const s of[-1,1])add(g,new THREE.BoxGeometry(0.03,0.03,4.6),new THREE.MeshStandardMaterial({color:0x2a2c2e}),s*2.5,2.0,1.4);
 const nav=(x,y,z,c)=>{add(g,new THREE.SphereGeometry(0.09,10,8),new THREE.MeshBasicMaterial({color:c}),x,y,z);};nav(-20.3,3.33,1.8,0xff2020);nav(20.3,3.33,1.8,0x20ff40);nav(0,2.75,-20.3,0xffffff);nav(0,9.35,-17.6,0xff3030);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
// ---- enemy ground convoy (hot targets in thermal) ----
const ACU_HOT=new THREE.MeshStandardMaterial({color:0x4a4a40,roughness:0.8,emissive:0xffffff,emissiveIntensity:0});
function acUnit(kind){const g=new THREE.Group();const b=new THREE.MeshStandardMaterial({color:kind==='tank'?0x5b5a44:0x55584a,roughness:0.85});const hot=ACU_HOT;
 if(kind==='tank'){add(g,new THREE.BoxGeometry(3.6,1.0,6.9),b,0,0.9,0);add(g,new THREE.BoxGeometry(3.3,0.7,2.0),hot,0,1.2,-2.6);for(const s of[-1,1]){add(g,new THREE.BoxGeometry(0.6,1.0,6.6),hot,s*1.75,0.5,0);}const t=add(g,new THREE.CylinderGeometry(1.25,1.45,0.8,12),b,0,1.8,0.4);add(g,new THREE.CylinderGeometry(0.1,0.13,5.5,8).rotateX(Math.PI/2),b,0,1.85,3.6);}
 else if(kind==='truck'){add(g,new THREE.BoxGeometry(2.4,1.6,4.6),b,0,1.6,-1.2);add(g,new THREE.BoxGeometry(2.4,1.7,2.0),hot,0,1.5,2.4);for(const z of[-2.6,-1.2,2.4])for(const s of[-1,1])add(g,new THREE.CylinderGeometry(0.55,0.55,0.4,12).rotateZ(Math.PI/2),hot,s*1.15,0.55,z);}
 else{for(let i=0;i<5;i++){const m=add(g,new THREE.CapsuleGeometry(0.22,1.2,4,8),hot,rnd(3),0.85,rnd(3));}}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function acLand(c){let best=null,bs=-1;for(let r=0;r<26000;r+=500)for(let a=0;a<6.28;a+=0.3){const x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;if(terrainH(x,z)<4)continue;let m=0;for(const d of[400,800,1200,1600])for(let k=0;k<8;k++){if(terrainH(x+Math.cos(k*0.785)*d,z+Math.sin(k*0.785)*d)>3)m++;}if(m>bs){bs=m;best=V3(x,terrainH(x,z),z);if(m===32)return best;}}return best||c.clone();}
function acSpawnUnits(c){const U=[];const kinds=['tank','tank','truck','truck','truck','inf','inf','inf','tank','truck','inf','truck','inf','tank'];
 kinds.forEach((k,i)=>{const m=acUnit(k);const p=V3(c.x+rnd(500),0,c.z+rnd(500));if(terrainH(p.x,p.z)<2){p.x=c.x+rnd(80);p.z=c.z+rnd(80);}p.y=groundAt(p.x,p.z).h;m.position.copy(p);m.rotation.y=Math.random()*6.28;scene.add(m);
  U.push({kind:k,mesh:m,pos:p,alive:true,hdg:m.rotation.y,spd:k==='inf'?1.2:k==='tank'?2.5:3.5,hp:k==='tank'?2:1,c});});return U;}
function acClear(){if(!AC)return;scene.remove(AC.plane);for(const u of AC.units)scene.remove(u.mesh);for(const s of AC.scars)scene.remove(s);AC.el.style.display='none';renderer.domElement.style.filter='';camera.fov=AC.fov0;camera.updateProjectionMatrix();camera.up.set(0,1,0);if(AC.eng)try{AC.eng.s.stop();}catch(e){}AC=null;}
{const _sp=spawn;spawn=function(kind,loc){if(kind!=='ac130'){acClear();return _sp(kind,loc);}
 acClear();_sp('silo',loc);const v=player;v.kind='ac130';v.def=DEFS.ac130;v.weapons=['25MM','40MM','105MM'];v.ammo={'25MM':1e9,'40MM':1e9,'105MM':1e9};v.wi=0;
 const c0=loc==='nyc'?NYC.clone():ENEMY.clone();const c=acLand(c0);c.y=groundAt(c.x,c.z).h;const plane=ac130Mesh();scene.add(plane);
 AC={c,aim:c.clone(),plane,ang:0,units:acSpawnUnits(c),scars:[],fov0:camera.fov,el:$('acHud'),mode:'WHT',mag:{'25MM':300,'40MM':4,'105MM':1},rel:{'25MM':0,'40MM':0,'105MM':0},cd:0,kills:0,shells:[]};
 AC.el.style.display='block';acPlace(0);v.mesh.position.copy(plane.position);acEngine();
 msg('AC-130J GUNSHIP ON STATION\nStick slews the sensor, pinch to zoom\nWPN switches gun, CTX toggles WHT/BHT',4);updateCtxLabel&&updateCtxLabel();};}
function acEngine(){const C=AU.ctx;if(!C||!SND.buf.jet||AC.eng)return;const s=C.createBufferSource();s.buffer=SND.buf.jet;s.loop=true;s.playbackRate.value=0.42;const f=C.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const g=C.createGain();g.gain.value=SND.muted?0:0.18;s.connect(f).connect(g).connect(C.destination);s.start(0,Math.random()*2);AC.eng={s,g};}
function acPlace(dt){AC.ang-=dt*AC_SPD/AC_R;const a=AC.ang,c=AC.c;// left-hand (counter-clockwise from above) pylon turn, guns face inward on the port side
 AC.plane.position.set(c.x+Math.cos(a)*AC_R,c.y+AC_ALT,c.z+Math.sin(a)*AC_R);const fw=V3(Math.sin(a),0,-Math.cos(a));const bank=Math.atan(AC_SPD*AC_SPD/(AC_R*9.81));
 AC.plane.lookAt(_t.copy(AC.plane.position).add(fw));AC.plane.rotateZ(-bank);// rolls port wing down toward the pylon point
 for(const p of AC.plane.userData.props){p.rotation.z+=dt*(AC.inspect?0.4:107);p.userData.disc.material.opacity=AC.inspect?0:0.1;}}
// HUD (original design)
{const d=document.createElement('div');d.id='acHud';d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:6;display:none;font:600 12px ui-monospace,Menlo,monospace;color:#e9f3ea;text-shadow:0 0 2px #000,0 0 4px #000;letter-spacing:.06em';
 d.innerHTML=`<canvas id="acNoise" style="position:absolute;inset:0;width:100%;height:100%;opacity:.14;mix-blend-mode:overlay"></canvas>
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)"></div>
<svg id="acRet" viewBox="-100 -100 200 200" style="position:absolute;left:50%;top:50%;width:min(80vw,46vh);height:min(80vw,46vh);transform:translate(-50%,-50%)" fill="none" stroke="#f2f6f2" stroke-width="1.3"></svg>
<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:6% 5%;width:90%;height:88%" fill="none" stroke="#f2f6f2" stroke-width=".35"><path d="M0 8V0H8M92 0H100V8M100 92V100H92M8 100H0V92"/></svg>
<div id="acTL" style="position:absolute;left:calc(7% + env(safe-area-inset-left));top:calc(9% + env(safe-area-inset-top));white-space:pre;line-height:1.5"></div>
<div id="acTR" style="position:absolute;right:7%;top:calc(9% + env(safe-area-inset-top));white-space:pre;text-align:right;line-height:1.5"></div>
<div id="acBL" style="position:absolute;left:7%;bottom:calc(18% + env(safe-area-inset-bottom));white-space:pre;line-height:1.5"></div>
<div id="acGun" style="position:absolute;left:50%;bottom:calc(14% + env(safe-area-inset-bottom));transform:translateX(-50%);white-space:pre;text-align:center;font-size:14px"></div>`;document.body.appendChild(d);}
const AC_RET={'25MM':'<path d="M-60 0H-14M14 0H60M0-60V-14M0 14V60"/><path d="M-6 0H6M0-6V6" stroke-width="1"/><path d="M-30-30h8M-30-30v8M30-30h-8M30-30v8M-30 30h8M-30 30v-8M30 30h-8M30 30v-8"/>',
 '40MM':'<rect x="-18" y="-18" width="36" height="36"/><path d="M-90 0H-18M18 0H90M0-90V-18M0 18V90"/><path d="M-50-4V4M50-4V4M-4-50H4M-4 50H4"/>',
 '105MM':'<path d="M-95 0H-40M40 0H95M0-95V-40M0 40V95"/><path d="M-40-40H-28M-40-40V-28M40-40H28M40-40V-28M-40 40H-28M-40 40V28M40 40H28M40 40V28"/><path d="M-8 0H8M0-8V8" stroke-width="1"/><circle r="22" stroke-dasharray="2 4"/>'};
function acNoise(){const cv=$('acNoise');if(!cv)return;if(cv.width!==200){cv.width=200;cv.height=400;}const x=cv.getContext('2d');const im=x.createImageData(200,400);const d=im.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}x.putImageData(im,0,0);}
// CTX = thermal polarity (capture so the silo LAUNCH action never runs for the gunship)
addEventListener('pointerdown',e=>{if(!AC||!player||player.kind!=='ac130')return;const t=e.target&&e.target.closest&&e.target.closest('#bCtx');if(t){e.stopPropagation();e.preventDefault();AC.mode=AC.mode==='WHT'?'BHT':'WHT';msg('THERMAL: '+(AC.mode==='WHT'?'WHITE HOT':'BLACK HOT'),1);}},true);
addEventListener('keydown',e=>{if(AC&&e.code==='KeyT')AC.mode=AC.mode==='WHT'?'BHT':'WHT';});
{const _ul=updateCtxLabel;updateCtxLabel=function(){_ul();if(player&&player.kind==='ac130'){$('bCtx').textContent=AC?AC.mode:'WHT';$('bWpn').textContent='GUN';}};}
{const _fw=fireWeapon;fireWeapon=function(v){if(v&&v.kind==='ac130')return false;return _fw(v);};}
const AC_TRM=new THREE.MeshBasicMaterial({color:0xffe7a0,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false});
function acFire(){const w=player.weapons[player.wi],G0=ACG[w];if(AC.rel[w]>0||AC.cd>0)return;
 AC.cd=1/G0.rate;AC.mag[w]--;if(AC.mag[w]<=0){AC.rel[w]=G0.rel;}
 const gz={'25MM':7.6,'40MM':-6.8,'105MM':-9.6}[w];const mz=AC.plane.localToWorld(V3(w==='105MM'?4.6:3.6,-0.9,gz));
 const tg=AC.aim.clone().add(V3(rnd(1)*G0.spread*AC_ALT*1.4,0,rnd(1)*G0.spread*AC_ALT*1.4));const d=tg.distanceTo(mz),T=d/G0.v*1.04;
 const vel=tg.clone().sub(mz).divideScalar(T);vel.y+=0.5*G*T; // gravity-compensated fire solution
 const len=w==='105MM'?1.2:w==='40MM'?0.9:0.6;const m=new THREE.Mesh(new THREE.CylinderGeometry(w==='105MM'?0.5:0.3,0.15,len*(w==='25MM'?26:16),6,1,true).rotateX(Math.PI/2),AC_TRM);m.position.copy(mz);m.lookAt(mz.clone().add(vel));scene.add(m);
 AC.shells.push({w,pos:mz.clone(),vel,mesh:m,t:0,T,tg});
 for(let k=0;k<(w==='105MM'?10:3);k++)fire.spawn(mz,rnd(3)-6,rnd(3),rnd(3),0.08,w==='105MM'?4:1.5,6,1,0.85,0.5,1);if(w==='105MM'){for(let k=0;k<12;k++)smoke.spawn(mz,-8+rnd(4),rnd(3),rnd(4),2.5,4,10,0.7,0.7,0.7,0.35,0.3,0);shake=Math.max(shake,0.5);}
 const r={'25MM':1.55+Math.random()*0.1,'40MM':0.85,'105MM':0.55}[w];if(w!=='25MM'||AC.mag[w]%3===0)play3D(w==='25MM'?'gun':'boom',null,w==='105MM'?0.9:w==='40MM'?0.6:0.28,r);
 if(AC.rel[w]>0&&w!=='105MM')msg(G0.name+' RELOADING',G0.rel*0.8);}
function acImpact(s){const p=s.pos,G0=ACG[s.w],gh=groundAt(p.x,p.z);p.y=gh.h;const big=s.w==='105MM'?1:s.w==='40MM'?0.45:0.12;
 if(gh.type==='water'){splash(p,big*4+0.4);}
 else{if(s.w!=='25MM')explosion(p,big*4);for(let k=0;k<(s.w==='25MM'?3:s.w==='40MM'?14:40);k++)smoke.spawn(p,rnd(18*big+3),4+Math.random()*(30*big+4),rnd(18*big+3),2+Math.random()*3*big+1,3+big*10,6+big*16,0.62,0.56,0.48,0.75,0.6,0.2);
  for(let k=0;k<(s.w==='25MM'?2:12);k++)fire.spawn(p,rnd(30*big+6),10+Math.random()*40*big,rnd(30*big+6),0.3+Math.random()*0.4,0.6+big,0,1,0.8,0.4,1,9.8);
  if(s.w!=='25MM'||Math.random()<0.25){const sc=new THREE.Mesh(new THREE.CircleGeometry(G0.r*(s.w==='25MM'?0.4:0.55),18).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x221d18,roughness:1,transparent:true,opacity:0.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));sc.position.set(p.x,p.y+0.15,p.z);scene.add(sc);AC.scars.push(sc);if(AC.scars.length>120)scene.remove(AC.scars.shift());}}
 if(s.w==='105MM'){play3D('explosion',p.clone(),0.9,0.9,400);play3D('debris',p.clone(),0.5,1,300);}else if(s.w==='40MM')play3D('explosion',p.clone(),0.45,1.35,300);
 let hit=false;window.__acLast={w:s.w,p:p.clone(),miss:s.tg?Math.hypot(s.tg.x-p.x,s.tg.z-p.z):-1,T:s.T,t:s.t,d:Math.min(...AC.units.filter(u=>u.alive).map(u=>Math.hypot(u.pos.x-p.x,u.pos.z-p.z)))};for(const u of AC.units){if(!u.alive)continue;const dd=Math.hypot(u.pos.x-p.x,u.pos.z-p.z);if(dd<G0.r){u.hp-=s.w==='25MM'?(u.kind==='tank'?0.08:0.5):s.w==='40MM'?(u.kind==='tank'?0.8:2):3;hit=true;if(u.hp<=0){u.alive=false;AC.kills++;acKill(u);}}}
 for(const t of targets){if(t.alive&&t.pos.distanceTo(p)<G0.r*1.3){killTarget(t,s.w==='105MM');hit=true;}}
 if(typeof BLD!=='undefined'&&s.w!=='25MM'){for(const b of BLD){const dd=Math.hypot(b.x-p.x,b.z-p.z);if(dd<G0.r*1.5)damageBuilding(b,s.w==='105MM'?0.35:0.12,'ac130');}}
 if(hit&&typeof hitTick==='function')hitTick(false);}
function acKill(u){const p=u.pos;explosion(p.clone().setY(p.y+1),u.kind==='inf'?0.6:2.2);u.mesh.visible=u.kind!=='inf';if(u.kind!=='inf'){u.mesh.traverse(o=>{if(o.isMesh)o.material=new THREE.MeshStandardMaterial({color:0x151310,roughness:1,emissive:0xff5520,emissiveIntensity:0.6});});u.burn=40;}
 if(typeof hitTick==='function')hitTick(true);if(typeof killFeed==='function')killFeed(`AC-130J  [${player.weapons[player.wi]}]  ${({tank:'Main battle tank',truck:'Supply truck',inf:'Infantry squad'})[u.kind]}  +${u.kind==='tank'?200:u.kind==='truck'?120:80}`);score+=u.kind==='tank'?200:u.kind==='truck'?120:80;play3D('explosion',p.clone(),0.7,1.0,300);}
{const _tick=tick;tick=function(dt){_tick(dt);if(!AC||!player||player.kind!=='ac130')return;acPlace(dt);player.mesh.position.copy(AC.plane.position);
 AC.cd=Math.max(0,AC.cd-dt);for(const w in AC.rel){if(AC.rel[w]>0){AC.rel[w]-=dt;if(AC.rel[w]<=0){AC.rel[w]=0;AC.mag[w]=ACG[w].mag;}}}
 if(inp.fire&&!camFollow)acFire();
 for(let i=AC.shells.length-1;i>=0;i--){const s=AC.shells[i];s.t+=dt;s.vel.y-=G*dt;s.pos.addScaledVector(s.vel,dt);s.mesh.position.copy(s.pos);s.mesh.lookAt(_t.copy(s.pos).add(s.vel));
  if(s.pos.y<=groundAt(s.pos.x,s.pos.z).h+0.5||s.t>20){acImpact(s);scene.remove(s.mesh);s.mesh.geometry.dispose();AC.shells.splice(i,1);}}
 for(const u of AC.units){if(u.alive){if(Math.random()<dt*0.2)u.hdg+=rnd(1.2);const dx=u.c.x-u.pos.x,dz=u.c.z-u.pos.z;if(Math.hypot(dx,dz)>600)u.hdg=Math.atan2(dx,dz);
   const nx=u.pos.x+Math.sin(u.hdg)*u.spd*dt,nz=u.pos.z+Math.cos(u.hdg)*u.spd*dt;if(terrainH(nx,nz)>2){u.pos.x=nx;u.pos.z=nz;}else u.hdg+=Math.PI*0.5;u.pos.y=groundAt(u.pos.x,u.pos.z).h;u.mesh.position.copy(u.pos);u.mesh.rotation.y=u.hdg;}
  else if(u.burn>0){u.burn-=dt;if(Math.random()<dt*14)smoke.spawn(_t.copy(u.pos).setY(u.pos.y+2),rnd(1),4+Math.random()*3,rnd(1),5,3,12,0.12,0.11,0.1,0.7,0.1,0.3);if(Math.random()<dt*10)fire.spawn(_t.copy(u.pos).setY(u.pos.y+1.5),rnd(1),2,rnd(1),0.5,1.5,1,1,0.6,0.2,1);}}
 if(AC.units.every(u=>!u.alive)){AC.units.forEach(u=>scene.remove(u.mesh));AC.units=acSpawnUnits(acLand(AC.c.clone().add(V3(rnd(1500),0,rnd(1500)))));msg('NEW CONVOY SPOTTED',2);}
 if(AC.eng)AC.eng.g.gain.value=SND.muted?0:0.18;else acEngine();};}
// sensor camera: gun-boresighted, ground-stabilised; aim point slews with stick, fov from weapon + pinch
{const _uc=updCamera;updCamera=function(dt){_uc(dt);if(!AC||!player||player.kind!=='ac130')return;const cv=renderer.domElement;
 if(camFollow||blastCam){AC.el.style.display='none';cv.style.filter='';return;}
 if(camMode===1||AC.inspect){AC.el.style.display='none';cv.style.filter='';const F=__milsim.FL;const I=AC.inspect||[F.yaw+0.9,F.pitch+0.25,F.zoom||1];const R=60*I[2];
  if(camera.fov!==40){camera.fov=40;camera.updateProjectionMatrix();}camera.up.set(0,1,0);const c=AC.plane.position;camera.position.set(c.x+Math.sin(I[0])*Math.cos(I[1])*R,c.y+Math.sin(I[1])*R,c.z+Math.cos(I[0])*Math.cos(I[1])*R);camera.lookAt(c);return;}
 AC.el.style.display='block';const w=player.weapons[player.wi],G0=ACG[w];
 const fov=clamp(G0.fov*((__milsim.FL&&__milsim.FL.zoom)||1),1.2,60);if(Math.abs(camera.fov-fov)>0.01){camera.fov=fov;camera.updateProjectionMatrix();}
 const s=GUIDE.stick;const ix=clamp((inp.roll||0)+(s.r||0)+(s.y||0),-1,1),iy=clamp((inp.pitch||0)+(s.p||0),-1,1);
 const eye=AC_EYE.copy(AC.plane.position).add(V3(0,-2.4,0));const dist=eye.distanceTo(AC.aim);const span=2*dist*Math.tan(fov*Math.PI/360);
 const f=V3().subVectors(AC.aim,eye).setY(0).normalize(),rt=V3(-f.z,0,f.x);const ps=Math.pow(Math.abs(ix),1.6)*Math.sign(ix),pp=Math.pow(Math.abs(iy),1.6)*Math.sign(iy);
 AC.aim.addScaledVector(rt,ps*span*0.55*dt).addScaledVector(f,pp*span*0.55*dt);const off=V3(AC.aim.x-AC.c.x,0,AC.aim.z-AC.c.z);if(off.length()>2200){off.setLength(2200);AC.aim.x=AC.c.x+off.x;AC.aim.z=AC.c.z+off.z;}
 AC.aim.y=groundAt(AC.aim.x,AC.aim.z).h;camera.up.set(0,1,0);camera.position.copy(eye);camera.lookAt(AC.aim);
 cv.style.filter=AC.mode==='WHT'?'grayscale(1) contrast(1.55) brightness(1.08)':'grayscale(1) contrast(1.55) brightness(1.08) invert(1)';
 ACU_HOT.emissiveIntensity=2.2;acNoise();
 const ret=$('acRet');if(ret.dataset.w!==w){ret.innerHTML=AC_RET[w];ret.dataset.w=w;}
 const rl=AC.rel[w]>0;const brg=((Math.atan2(AC.aim.x-eye.x,-(AC.aim.z-eye.z))*180/Math.PI)+360)%360;
 $('acTL').textContent=`AC-130J  ${AC.mode}\nALT ${(AC_ALT*3.281).toFixed(0)} FT AGL\nGS  ${(AC_SPD*1.944).toFixed(0)} KT  BANK 30\u00b0 L`;
 $('acTR').textContent=`SLANT ${(dist/1000).toFixed(2)} KM\nBRG ${brg.toFixed(0).padStart(3,'0')}\nFOV ${fov.toFixed(1)}\u00b0  ZOOM ${(G0.fov/fov).toFixed(1)}x`;
 $('acBL').textContent=`TOF ${(dist/G0.v).toFixed(1)} S\nKILLS ${AC.kills}\nTGT ${AC.units.filter(u=>u.alive).length}`;
 $('acGun').innerHTML=player.weapons.map(k=>`<span style="padding:3px 8px;margin:0 3px;border:1px solid ${k===w?'#f2f6f2':'transparent'};opacity:${k===w?1:0.5}">${k.replace('MM',' mm')}</span>`).join('')+`<br><span style="font-size:12px">${G0.name}  ${rl?'RELOADING '+AC.rel[w].toFixed(1)+' s':AC.mag[w]+' / '+G0.mag}</span>`;};}
window.__acFire=()=>acFire();
{const _ue=updEnv;updEnv=function(dt){_ue(dt);const on=AC&&player&&player.kind==='ac130'&&!camFollow&&!blastCam&&camMode!==1&&!AC.inspect;const h=$('hud');if(h)h.style.visibility=AC&&player&&player.kind==='ac130'?'hidden':'';if(on&&scene.fog&&scene.fog.density){AC.fd=scene.fog.density;scene.fog.density*=0.22;}};}
{const _rf=renderFrame;renderFrame=function(sc,cam){_rf(sc,cam);if(AC&&AC.fd&&scene.fog){scene.fog.density=AC.fd;AC.fd=0;}};}
window.__milsim.spawn=spawn;window.__milsim.fireWeapon=fireWeapon;window.__milsim.acG=ACG;
