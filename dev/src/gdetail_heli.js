//GDETAIL_HELI-BEGIN  AH-64D Apache Longbow, missile-standard detail (real scale, metres, nose -Z, wheels at y≈-1.75)
{const T=THREE,PI=Math.PI,HC={};
const cvs=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c;};
const ctex=(c,srgb,wrap=true)=>{const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;if(wrap)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;};
function nrmFrom(c,str){const w=c.width,h=c.height,s=c.getContext('2d').getImageData(0,0,w,h).data;return ctex(cvs(w,h,(x)=>{const id=x.createImageData(w,h);const H=(i,j)=>s[(((j+h)%h)*w+((i+w)%w))*4]/255;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i-1,j)-H(i+1,j))*str,dy=(H(i,j-1)-H(i,j+1))*str,l=Math.hypot(dx,dy,1),k=(j*w+i)*4;id.data[k]=(dx/l*.5+.5)*255;id.data[k+1]=(dy/l*.5+.5)*255;id.data[k+2]=(1/l*.5+.5)*255;id.data[k+3]=255;}x.putImageData(id,0,0);}),false);}
// ---- Apache skin: canvas X = along body (nose->tail), canvas Y = around ring (top, starboard, bottom, port) ----
function skin(key,o){if(HC[key])return HC[key];const W=o.W||2048,H=o.H||1024;
 const panelsX=o.px||[],panelsY=o.py||[0.18,0.32,0.68,0.82];
 const col=cvs(W,H,(x)=>{x.fillStyle=o.base;x.fillRect(0,0,W,H);
  for(let i=0;i<2600;i++){const l=Math.random()<0.5;x.fillStyle=`rgba(${l?'255,255,230':'20,18,8'},${Math.random()*0.04})`;x.fillRect(Math.random()*W,Math.random()*H,8+Math.random()*90,3+Math.random()*24);}
  // touch-up paint patches (slightly different OD batches)
  for(let i=0;i<26;i++){x.fillStyle=`rgba(${70+Math.random()*20|0},${76+Math.random()*16|0},${40+Math.random()*12|0},0.35)`;x.fillRect(Math.random()*W,Math.random()*H,40+Math.random()*160,30+Math.random()*80);}
  // exhaust soot & oil streaks running aft
  for(let i=0;i<120;i++){const y=Math.random()*H,x0=Math.random()*W,l=60+Math.random()*400;const g=x.createLinearGradient(x0,0,x0+l,0);g.addColorStop(0,'rgba(10,10,6,0.22)');g.addColorStop(1,'rgba(10,10,6,0)');x.fillStyle=g;x.fillRect(x0,y,l,1+Math.random()*3);}
  const line=(x0,y0,x1,y1)=>{x.strokeStyle='rgba(0,0,0,0.5)';x.lineWidth=2;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();x.strokeStyle='rgba(255,255,220,0.10)';x.beginPath();x.moveTo(x0+1.5,y0+1.5);x.lineTo(x1+1.5,y1+1.5);x.stroke();};
  for(const p of panelsX){line(p*W,0,p*W,H);x.fillStyle='rgba(0,0,0,0.45)';for(let y=0;y<H;y+=11){x.beginPath();x.arc(p*W+6,y,1.3,0,7);x.fill();x.beginPath();x.arc(p*W-6,y,1.3,0,7);x.fill();}}
  for(const p of panelsY){line(0,p*H,W,p*H);x.fillStyle='rgba(0,0,0,0.4)';for(let u=0;u<W;u+=12){x.beginPath();x.arc(u,p*H+6,1.2,0,7);x.fill();}}
  // access doors with fasteners (Dzus)
  for(const d of o.doors||[]){const [u,v,w,h]=d;x.strokeStyle='rgba(0,0,0,0.6)';x.lineWidth=2.5;x.strokeRect(u*W,v*H,w*W,h*H);x.fillStyle='rgba(0,0,0,0.55)';
   for(let k=0;k<=8;k++){for(const [a,b] of [[u+w*k/8,v],[u+w*k/8,v+h]]){x.beginPath();x.arc(a*W,b*H,2.2,0,7);x.fill();}}for(let k=1;k<4;k++){for(const a of [u,u+w]){x.beginPath();x.arc(a*W,(v+h*k/4)*H,2.2,0,7);x.fill();}}}
  // stencils: draw on both flanks with the correct orientation (stbd mirrored X, port mirrored Y)
  const side=(u,v,f,stbd)=>{x.save();x.translate(u*W,v*H);if(stbd)x.scale(-1,1);else x.scale(1,-1);f(x);x.restore();};
  for(const s of o.sten||[])for(const st of [true,false])side(s.u,st?s.v:1-s.v,s.f,st);});
 const rgh=cvs(W/2,H/2,(x,w,h)=>{x.drawImage(col,0,0,w,h);const d=x.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const l=(d.data[i]+d.data[i+1]+d.data[i+2])/3;const v=Math.min(255,150+(90-l)*1.2+Math.random()*12);d.data[i]=d.data[i+1]=d.data[i+2]=v;}x.putImageData(d,0,0);});
 const bump=cvs(W/2,H/2,(x,w,h)=>{x.fillStyle='#808080';x.fillRect(0,0,w,h);x.strokeStyle='#202020';x.lineWidth=1.5;for(const p of panelsX){x.beginPath();x.moveTo(p*w,0);x.lineTo(p*w,h);x.stroke();}for(const p of panelsY){x.beginPath();x.moveTo(0,p*h);x.lineTo(w,p*h);x.stroke();}
  for(const d of o.doors||[]){x.strokeRect(d[0]*w,d[1]*h,d[2]*w,d[3]*h);}x.fillStyle='#b0b0b0';for(const p of panelsX)for(let y=0;y<h;y+=5.5){x.beginPath();x.arc(p*w+3,y,0.8,0,7);x.fill();}});
 const m=new T.MeshStandardMaterial({map:ctex(col,true),roughnessMap:ctex(rgh,false),normalMap:nrmFrom(bump,2.2),normalScale:new T.Vector2(0.6,0.6),roughness:1,metalness:0.12,color:0xffffff,envMapIntensity:0.7});
 return HC[key]=m;}
const OD='#4d5226';
const txt=(s,font,color='rgba(20,20,12,0.92)',al='center')=>x=>{x.font=font;x.fillStyle=color;x.textAlign=al;x.textBaseline='middle';x.fillText(s,0,0);};
const star=(r)=>x=>{x.strokeStyle='rgba(20,20,12,0.85)';x.lineWidth=4;x.beginPath();x.arc(0,0,r,0,7);x.stroke();x.fillStyle='rgba(20,20,12,0.85)';x.beginPath();for(let i=0;i<10;i++){const a=-PI/2+i*PI/5,q=i%2?r*0.38:r*0.95;x.lineTo(Math.cos(a)*q,Math.sin(a)*q);}x.fill();x.fillRect(r*0.9,-r*0.18,r*1.1,r*0.36);x.fillRect(-r*2,-r*0.18,r*1.1,r*0.36);};
// ---- lofted rounded-rect / superellipse body. sec = [z, halfW, yTop, yBot, exponent] ----
function loft(secs,mat,N=40,uv=[0,1],flat=false){const pos=[],uvs=[],idx=[];const z0=secs[0][0],z1=secs[secs.length-1][0];
 secs.forEach(([z,w,yt,yb,e],j)=>{const cy=(yt+yb)/2,hh=Math.max(0.002,(yt-yb)/2),ww=Math.max(0.002,w),ex=2/(e||2.6);
  for(let i=0;i<=N;i++){const a=i/N*2*PI;const s=Math.sin(a),c=Math.cos(a);const x=Math.sign(s)*Math.pow(Math.abs(s),ex)*ww,y=cy+Math.sign(c)*Math.pow(Math.abs(c),ex)*hh;pos.push(x,y,z);uvs.push(uv[0]+(uv[1]-uv[0])*(z-z0)/(z1-z0),1-i/N);}});
 for(let j=0;j<secs.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new T.Mesh(g,mat);if(flat)m.material.flatShading=true;return m;}
const capE=(m,z,flip)=>m; // ends are covered by nose turret / tail cone
const MAT={};const pm=(k,o)=>MAT[k]||(MAT[k]=new T.MeshStandardMaterial(o));
const S=(c,r=0.6,me=0.3)=>pm('s'+c+'_'+r+'_'+me,{color:c,roughness:r,metalness:me});
const BLK=S(0x1a1b18,0.7,0.3),GUN=S(0x2a2b2a,0.45,0.85),RUB=S(0x121212,0.92,0),ALU=S(0x9a9c98,0.35,0.9),SOOT=S(0x0b0b0a,0.95,0.2),HOT=pm('hot',{color:0x3a2a20,roughness:0.6,metalness:0.7,emissive:0x220800});
const GLS=new T.MeshPhysicalMaterial({color:0x30362e,metalness:0.2,roughness:0.05,transmission:0,transparent:true,opacity:0.55,clearcoat:1,clearcoatRoughness:0.03,envMapIntensity:2.2,side:T.DoubleSide});
const SENS=new T.MeshPhysicalMaterial({color:0x2a1830,metalness:0.9,roughness:0.05,clearcoat:1,iridescence:0.8,iridescenceIOR:1.6,envMapIntensity:2.5});
const LITE=(c)=>MAT['l'+c]||(MAT['l'+c]=new T.MeshBasicMaterial({color:c}));
const mk=(g,geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
const cylZ=(r1,r2,l,s=16,open=false)=>new T.CylinderGeometry(r1,r2,l,s,1,open).rotateX(PI/2);
const cylX=(r1,r2,l,s=16)=>new T.CylinderGeometry(r1,r2,l,s).rotateZ(PI/2);
// airfoil blade: extrude NACA-ish section along +X
function blade(len,chord,th,mat,tipSweep=0.35){const sh=new T.Shape();const n=14;const P=[];for(let i=0;i<=n;i++){const t=i/n,xc=t*t;const yt=5*th*(0.2969*Math.sqrt(xc)-0.126*xc-0.3516*xc*xc+0.2843*xc**3-0.1015*xc**4);P.push([xc,yt]);}
 sh.moveTo(chord*(P[n][0]-0.25),0);for(let i=n;i>=0;i--)sh.lineTo(chord*(P[i][0]-0.25),P[i][1]*chord);for(let i=1;i<=n;i++)sh.lineTo(chord*(P[i][0]-0.25),-P[i][1]*chord*0.6);
 const g=new T.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,steps:12});g.rotateY(PI/2);// span along +X, chord along Z
 const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),f=x/len;if(f>0.93){const k=(f-0.93)/0.07;p.setZ(i,p.getZ(i)*(1-0.45*k)+k*chord*tipSweep);p.setY(i,p.getY(i)*(1-0.5*k));}}g.computeVertexNormals();return new T.Mesh(g,mat);}
function bladeMat(){if(MAT.blade)return MAT.blade;const c=cvs(1024,64,(x,w,h)=>{x.fillStyle='#262824';x.fillRect(0,0,w,h);for(let i=0;i<300;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.03})`;x.fillRect(Math.random()*w,Math.random()*h,30+Math.random()*120,2);}
 x.fillStyle='#8f8f86';x.fillRect(0,0,w,5);/* stainless leading-edge strip */x.fillStyle='#3a3b36';x.fillRect(w*0.94,0,w*0.06,h);x.strokeStyle='rgba(0,0,0,0.5)';for(let u=60;u<w;u+=90){x.beginPath();x.moveTo(u,6);x.lineTo(u,h);x.stroke();}
 x.fillStyle='#c9b23a';x.fillRect(w*0.955,0,w*0.012,h);});return MAT.blade=new T.MeshStandardMaterial({map:ctex(c,true,false),roughness:0.55,metalness:0.35,side:T.DoubleSide});}
// M261 19-tube Hydra 70 pod end face
function podFace(){if(MAT.pod)return MAT.pod;const c=cvs(256,256,(x,w)=>{x.fillStyle=OD;x.fillRect(0,0,w,w);const r=w*0.075;const pts=[[0,0]];for(let i=0;i<6;i++)pts.push([Math.cos(i*PI/3)*2.1*r,Math.sin(i*PI/3)*2.1*r]);for(let i=0;i<12;i++)pts.push([Math.cos(i*PI/6+PI/12)*4.1*r,Math.sin(i*PI/6+PI/12)*4.1*r]);
 for(const [a,b] of pts){x.fillStyle='#0b0b08';x.beginPath();x.arc(w/2+a,w/2+b,r,0,7);x.fill();x.strokeStyle='#6a6b55';x.lineWidth=2;x.stroke();x.fillStyle='#776b3a';x.beginPath();x.arc(w/2+a,w/2+b,r*0.45,0,7);x.fill();}});return MAT.pod=new T.MeshStandardMaterial({map:ctex(c,true,false),roughness:0.7,metalness:0.2});}
function blurMat(){if(MAT.blur)return MAT.blur;const c=cvs(256,256,(x,w)=>{const g=x.createRadialGradient(w/2,w/2,w*0.05,w/2,w/2,w/2);g.addColorStop(0,'rgba(30,30,28,0)');g.addColorStop(0.1,'rgba(30,30,28,0.5)');g.addColorStop(0.92,'rgba(40,40,36,0.35)');g.addColorStop(0.97,'rgba(150,150,140,0.5)');g.addColorStop(1,'rgba(40,40,36,0)');x.fillStyle=g;x.fillRect(0,0,w,w);});
 return MAT.blur=new T.MeshBasicMaterial({map:ctex(c,true,false),transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0});}

function apache(){const g=new T.Group();g.name='AH-64D Apache Longbow';
 const L0=-6.5,L1=8.9;const U=z=>(z-L0)/(L1-L0);
 const body=skin('ah64',{base:OD,px:[U(-5.6),U(-4.6),U(-3.4),U(-2.1),U(-0.9),U(0.5),U(1.8),U(3.1),U(4.6),U(6.1),U(7.4)],
  doors:[[U(-2.0),0.25,0.07,0.1],[U(-2.0),0.65,0.07,0.1],[U(-0.8),0.22,0.08,0.12],[U(-0.8),0.66,0.08,0.12],[U(3.3),0.28,0.06,0.07],[U(3.3),0.65,0.06,0.07]],
  sten:[{u:U(4.2),v:0.27,f:txt('U.S. ARMY','bold 44px Arial')},{u:U(6.4),v:0.27,f:txt('09-05600','bold 30px Arial')},{u:U(1.0),v:0.31,f:star(20)},
   {u:U(-1.4),v:0.38,f:txt('NO STEP','bold 14px Arial')},{u:U(2.4),v:0.37,f:txt('DANGER  ROTOR','bold 15px Arial','rgba(120,20,10,0.85)')},{u:U(-2.4),v:0.42,f:txt('RESCUE ▸','bold 15px Arial','rgba(150,120,20,0.9)')},
   {u:U(5.2),v:0.4,f:txt('JET A / JP-8','12px Arial')}]});
 // fuselage: flat-sided Apache centre section blending into the tail boom
 const F=loft([[-6.45,0.26,-0.02,-0.5,2.4],[-6.05,0.47,0.16,-0.78,3],[-5.4,0.58,0.3,-0.92,3.6],[-4.4,0.63,0.36,-1.0,4],[-3.3,0.68,0.52,-1.03,4],[-2.2,0.8,0.8,-1.06,4.4],[-1.2,0.86,1.02,-1.07,4.6],
  [0.2,0.86,1.06,-1.04,4.6],[1.4,0.78,1.0,-0.92,4.2],[2.4,0.58,0.88,-0.55,3.4],[3.4,0.42,0.8,-0.22,2.8],[5.0,0.35,0.75,-0.04,2.6],[7.0,0.29,0.72,0.08,2.5],[8.4,0.24,0.71,0.17,2.4],[8.9,0.12,0.66,0.3,2.2]],body,48);g.add(F);
 mk(g,new T.SphereGeometry(0.2,16,10),body,0,0.48,8.88).scale.set(0.6,0.9,0.5);
 // upper "doghouse": rotor pylon / transmission fairing with louvres
 const D=loft([[-2.6,0.08,0.82,0.6,2],[-2.1,0.5,1.42,0.7,3.2],[-0.6,0.6,1.62,0.8,3.6],[0.8,0.58,1.6,0.8,3.6],[1.9,0.42,1.38,0.75,3],[2.6,0.12,1.0,0.75,2.4]],body,32);g.add(D);
 for(const s of[-1,1])for(let i=0;i<7;i++)mk(g,new T.BoxGeometry(0.02,0.05,0.42),SOOT,s*0.57,1.3-i*0.065,0.95);
 // tandem canopy: flat faceted glass, CPG front / pilot rear, with framing
 const can=loft([[-5.95,0.05,0.25,0.22,1.4],[-5.5,0.5,0.75,0.24,1.6],[-4.6,0.6,0.98,0.3,1.7],[-4.0,0.62,1.02,0.34,1.7],[-3.7,0.62,1.2,0.4,1.7],[-3.0,0.64,1.42,0.48,1.8],[-2.4,0.62,1.42,0.7,1.8],[-2.15,0.4,1.1,0.8,1.8]],GLS,8);g.add(can);
 const fr=new T.LineSegments(new T.EdgesGeometry(can.geometry,8),new T.LineBasicMaterial({color:0x1d1f15}));g.add(fr);
 for(const z of[-4.3,-3.75,-2.45]){const b=mk(g,new T.TorusGeometry(0.62,0.035,6,24,PI),BLK,0,0.62,z);b.scale.set(1,z>-3?1.3:0.65,1);}
 // cockpit interior hints: seats, MPDs glowing, helmets
 for(const [z,y] of [[-4.5,0.45],[-2.9,0.75]]){mk(g,new T.BoxGeometry(0.55,0.75,0.12),BLK,0,y,z+0.45);mk(g,new T.SphereGeometry(0.15,12,10),S(0x3b3e2c,0.6,0.1),0,y+0.5,z+0.28);
  const pnl=mk(g,new T.BoxGeometry(0.9,0.3,0.05),BLK,0,y-0.05,z-0.55);pnl.rotation.x=-0.5;for(const sx of[-0.22,0.22])mk(g,new T.PlaneGeometry(0.17,0.17),LITE(0x3c8a3a),sx,y-0.03,z-0.58).rotation.set(-0.5+PI,PI,0);}
 // wire strike protection: upper canopy cutter + lower nose cutter + deflectors
 mk(g,new T.BoxGeometry(0.04,0.3,0.12),ALU,0,1.55,-2.25).rotation.x=-0.5;mk(g,new T.BoxGeometry(0.04,0.04,1.9),ALU,0,1.07,-4.7).rotation.x=0.33;
 mk(g,new T.BoxGeometry(0.04,0.35,0.1),ALU,0,-1.2,-5.0).rotation.x=0.4;
 // TADS/PNVS nose: PNVS on top (rotating head), TADS drum with day/night sensor windows below
 const pn=new T.Group();pn.position.set(0,0.18,-6.4);g.add(pn);mk(pn,new T.CylinderGeometry(0.17,0.2,0.3,20),BLK);mk(pn,new T.SphereGeometry(0.17,16,10,0,2*PI,0,PI/2),BLK,0,0.15,0);mk(pn,new T.PlaneGeometry(0.16,0.12),SENS,0,0.02,-0.2).rotation.y=PI;
 const td=new T.Group();td.position.set(0,-0.42,-6.55);g.add(td);mk(td,new T.SphereGeometry(0.33,24,16),body);mk(td,cylX(0.28,0.28,0.95,24),BLK);
 for(const s of[-1,1]){const pod=mk(td,new T.BoxGeometry(0.3,0.44,0.5),body,s*0.62,0,-0.06);mk(td,new T.CircleGeometry(0.11,20),SENS,s*0.62,0.07,-0.315).rotation.y=PI;mk(td,new T.PlaneGeometry(0.2,0.12),SENS,s*0.62,-0.11,-0.315).rotation.y=PI;mk(td,new T.BoxGeometry(0.32,0.03,0.52),BLK,s*0.62,0.23,-0.06);}
 mk(td,new T.CircleGeometry(0.1,20),SENS,0,0,-0.335).rotation.y=PI;
 // avionics bays (EFAB cheek fairings)
 for(const s of[-1,1]){const c=loft([[-4.9,0.02,-0.3,-0.75,3],[-4.4,0.14,-0.2,-0.85,4],[-2.6,0.17,-0.15,-0.9,4],[-1.6,0.04,-0.2,-0.85,3]],body,20);c.position.x=s*0.66;g.add(c);}
 // M230 30mm chain gun: turret, receiver, barrel w/ cooling holes, flash suppressor, ammo chute
 const gun=new T.Group();gun.position.set(0,-1.1,-4.35);g.add(gun);mk(gun,new T.CylinderGeometry(0.28,0.24,0.22,20),GUN);mk(gun,new T.BoxGeometry(0.26,0.22,0.9),GUN,0,-0.12,-0.25);
 mk(gun,cylZ(0.055,0.055,1.65,12),GUN,0,-0.12,-1.4);mk(gun,cylZ(0.085,0.085,0.85,14),S(0x1d1d1c,0.5,0.8),0,-0.12,-1.05);mk(gun,cylZ(0.07,0.07,0.15,10),GUN,0,-0.12,-2.25);
 for(let i=0;i<8;i++)mk(gun,new T.TorusGeometry(0.087,0.008,4,12),SOOT,0,-0.12,-0.7-i*0.1);
 g.userData.gun=gun;
 // T700-GE-701D engine nacelles with intakes, particle separators and Black Hole IR suppressors
 for(const s of[-1,1]){const n=loft([[-1.75,0.3,1.33,0.73,2.2],[-1.5,0.4,1.43,0.63,2.4],[0,0.43,1.47,0.6,2.6],[1.3,0.4,1.42,0.66,2.4],[1.9,0.3,1.32,0.78,2.2]],body,28);n.position.x=s*1.12;g.add(n);
  mk(g,new T.TorusGeometry(0.27,0.05,8,24),S(0x3f4321,0.55,0.4),s*1.12,1.03,-1.76);mk(g,new T.CircleGeometry(0.26,24),SOOT,s*1.12,1.03,-1.72).rotation.y=PI;mk(g,new T.CylinderGeometry(0.08,0.12,0.12,14).rotateX(-PI/2),ALU,s*1.12,1.03,-1.68);
  mk(g,new T.BoxGeometry(0.16,0.16,0.7),body,s*0.78,1.05,-0.8);// engine pylon link
  const ex=new T.Group();ex.position.set(s*1.2,1.06,2.0);ex.rotation.y=-s*0.32;g.add(ex);mk(ex,new T.BoxGeometry(0.46,0.42,0.75),body);
  for(let i=0;i<3;i++)mk(ex,new T.BoxGeometry(0.02,0.3,0.6),SOOT,s*0.235,0,0).position.y=-0.12+i*0.12;mk(ex,new T.PlaneGeometry(0.38,0.34),HOT,0,0,0.38);
  for(let i=0;i<4;i++)mk(g,new T.BoxGeometry(0.02,0.06,0.5),SOOT,s*1.54,1.2-i*0.11,0.0);}
 // mast, swashplate, Longbow FCR dome
 mk(g,new T.CylinderGeometry(0.17,0.2,0.85,20),ALU,0,2.0,-0.62);mk(g,new T.CylinderGeometry(0.42,0.42,0.08,24),GUN,0,1.72,-0.62);mk(g,new T.CylinderGeometry(0.36,0.36,0.06,24),ALU,0,1.82,-0.62);
 const fcr=new T.Group();fcr.position.set(0,3.08,-0.62);g.add(fcr);mk(fcr,new T.CylinderGeometry(0.14,0.18,0.42,16),BLK,0,-0.32,0);
 const dome=mk(fcr,new T.SphereGeometry(0.62,32,18),skin('fcr',{base:'#55592e',W:512,H:256,px:[0.25,0.5,0.75]}));dome.scale.set(1,0.38,1);mk(fcr,new T.TorusGeometry(0.62,0.025,8,40).rotateX(PI/2),BLK);
 // main rotor: fully articulated hub, elastomeric laminates, pitch links, 4 swept-tip blades (r=7.3 m)
 const rot=new T.Group();rot.position.set(0,2.5,-0.62);g.add(rot);mk(rot,new T.CylinderGeometry(0.38,0.42,0.28,24),GUN);mk(rot,new T.CylinderGeometry(0.2,0.24,0.2,16),ALU,0,0.22,0);
 const BM=bladeMat();
 for(let i=0;i<4;i++){const a=new T.Group();a.rotation.y=i*PI/2;rot.add(a);mk(a,new T.BoxGeometry(0.75,0.16,0.2),GUN,0.65,0,0);for(let k=0;k<4;k++)mk(a,new T.BoxGeometry(0.03,0.15,0.16),RUB,0.4+k*0.07,0,0);
  mk(a,new T.CylinderGeometry(0.03,0.03,0.45,8),ALU,0.55,-0.22,0.17);mk(a,new T.BoxGeometry(0.4,0.12,0.12),GUN,1.15,0,0);
  const b=blade(5.95,0.53,0.1,BM);b.position.set(1.35,0.03,0);b.rotation.x=-0.07;b.castShadow=true;a.add(b);}
 const disc=new T.Mesh(new T.CircleGeometry(7.35,64).rotateX(-PI/2),blurMat().clone());disc.position.y=0.03;disc.renderOrder=3;rot.add(disc);
 g.userData.rotor=rot;let prevA=0;disc.onBeforeRender=()=>{const da=Math.abs(rot.rotation.y-prevA);prevA=rot.rotation.y;const k=Math.min(1,da/0.35);disc.material.opacity=k*0.55;};
 // tail: swept vertical fin, T-ish all-moving stabilator, tail-wheel, tail-rotor gearbox + driveshaft cover
 const fin=loft([[7.5,0.05,0.72,0.6,2],[7.9,0.13,1.4,0.6,2.2],[8.4,0.13,2.4,0.65,2.2],[9.0,0.11,2.75,0.65,2.2],[9.35,0.04,2.75,0.7,2]],body,16);g.add(fin);
 mk(g,new T.BoxGeometry(0.2,0.12,3.2),body,0,0.84,6.0);// driveshaft cover
 const stab=new T.Group();stab.position.set(0,0.82,8.75);g.add(stab);mk(stab,new T.BoxGeometry(3.4,0.07,0.75),body);for(const s of[-1,1]){mk(stab,new T.BoxGeometry(0.04,0.2,0.75),body,s*1.7,0,0);}
 mk(g,new T.SphereGeometry(0.22,16,12),GUN,-0.18,2.18,9.0).scale.set(0.8,1,1.2);
 const tr=new T.Group();tr.position.set(-0.36,2.18,9.0);g.add(tr);mk(tr,cylX(0.1,0.1,0.18,14),GUN);
 for(let i=0;i<4;i++){const p=new T.Group();p.rotation.x=i*PI/2+(i%2?0.96:0);tr.add(p);const b=blade(1.25,0.25,0.12,BM,0.1);b.rotation.z=PI/2;b.position.set(-0.03,0.1,0);p.add(b);}
 g.userData.trotor=tr;
 // stub wings with 4 pylons, wingtip ATAS rails & lights
 const W=pm('wing',{color:0x4d5226,roughness:0.75,metalness:0.15});
 for(const s of[-1,1]){const wg=loft([[-1.4,0.07,0.12,-0.02,2],[-1.3,0.08,0.13,-0.04,2.5],[-0.3,0.06,0.11,-0.02,2.5],[0.15,0.01,0.07,0.04,2]],body,12);
  const wp=new T.Group();wp.position.set(s*0.8,0.18,0);wp.scale.set(1,1,1);g.add(wp);const wm=wg.clone();wm.rotation.z=s*PI/2;wm.scale.set(1,1,1);
  const span=1.85;const box=mk(wp,new T.BoxGeometry(span,0.14,1.25),body,s*span/2,0,-0.6);box.rotation.z=-s*0.06;
  mk(wp,new T.BoxGeometry(0.12,0.24,0.3),S(0x2b2d26,0.6,0.3),s*(span+0.02),0.02,-0.6);mk(wp,new T.SphereGeometry(0.04,8,6),LITE(s>0?0x22ff44:0xff2222),s*(span+0.06),0.1,-0.75);
  for(const [x,kind] of [[0.65,'hydra'],[1.45,'hf']]){const py=mk(wp,new T.BoxGeometry(0.14,0.4,0.9),S(0x3b3f1f,0.7,0.2),s*x,-0.25,-0.6);
   if(kind==='hydra'){const p=new T.Group();p.position.set(s*x,-0.68,-0.6);wp.add(p);mk(p,cylZ(0.21,0.21,1.68,24),body);mk(p,new T.CircleGeometry(0.21,24),podFace(),0,0,-0.845).rotation.y=PI;mk(p,new T.ConeGeometry(0.21,0.25,24).rotateX(PI/2),body,0,0,0.96);
    for(const z of[-0.6,0.5])mk(p,new T.TorusGeometry(0.212,0.012,6,24),BLK,0,0,z);}
   else{const r=new T.Group();r.position.set(s*x,-0.58,-0.6);wp.add(r);mk(r,new T.BoxGeometry(0.62,0.08,1.25),S(0x3b3f1f,0.7,0.2));for(const lx of[-0.2,0.2])mk(r,new T.BoxGeometry(0.06,0.5,1.2),S(0x3b3f1f,0.7,0.2),lx,-0.24,0);
    for(const [lx,ly] of [[-0.18,-0.17],[0.18,-0.17],[-0.18,-0.42],[0.18,-0.42]]){let m;try{m=MSL_MODELS.hellfire();}catch(e){m=new T.Mesh(cylZ(0.089,0.089,1.63,14),S(0x50542e));}m.position.set(lx+(lx<0?-0.09:0.09),ly,-0.05);r.add(m);}}}}
 // main landing gear: trailing arms, oleos, wheels with tyres; tail wheel
 for(const s of[-1,1]){const lg=new T.Group();lg.position.set(s*0.85,-0.75,-2.45);g.add(lg);const arm=mk(lg,new T.BoxGeometry(0.12,0.12,0.9),GUN,s*0.18,-0.25,0.35);arm.rotation.x=0.55;arm.rotation.z=s*0.2;
  mk(lg,new T.CylinderGeometry(0.06,0.06,0.65,10),ALU,s*0.25,-0.35,-0.05).rotation.z=s*0.25;mk(lg,new T.CylinderGeometry(0.09,0.09,0.4,10),GUN,s*0.18,-0.12,-0.05).rotation.z=s*0.25;
  const wh=new T.Group();wh.position.set(s*0.38,-0.67,0.0);lg.add(wh);mk(wh,new T.TorusGeometry(0.25,0.11,14,28).rotateY(PI/2),RUB);mk(wh,cylX(0.2,0.2,0.2,20),ALU);mk(wh,cylX(0.07,0.07,0.26,10),GUN);}
 {const tw=new T.Group();tw.position.set(0,0.0,7.7);g.add(tw);mk(tw,new T.BoxGeometry(0.08,1.1,0.1),GUN,0,-0.5,0.1).rotation.x=-0.22;mk(tw,new T.BoxGeometry(0.1,0.14,0.42),GUN,0,-1.05,0.0);
  const w=new T.Group();w.position.set(0,-1.38,0.08);tw.add(w);for(const s of[-1,1]){mk(w,new T.TorusGeometry(0.14,0.07,10,20).rotateY(PI/2),RUB,s*0.09,0,0);mk(w,cylX(0.1,0.1,0.1,14),ALU,s*0.09,0,0);}}
 // sensors, antennae, lights, steps, mirrors
 mk(g,cylZ(0.015,0.015,0.9,6),ALU,0.52,-0.1,-6.3);mk(g,cylZ(0.015,0.015,0.9,6),ALU,-0.52,-0.1,-6.3);// air data probes
 for(const [x,y,z] of [[0,1.62,0.4],[0,-1.08,0.9],[0,0.77,4.5]]){const a=mk(g,new T.BoxGeometry(0.02,0.3,0.14),BLK,x,y+(y<0?-0.15:0.15),z);a.rotation.x=0.4;}
 mk(g,new T.SphereGeometry(0.06,10,8),LITE(0xff2a1a),0,2.78,9.1);mk(g,new T.SphereGeometry(0.05,10,8),LITE(0xffffff),0,0.62,9.0);// anti-coll / tail light
 for(const s of[-1,1]){mk(g,new T.BoxGeometry(0.12,0.12,0.12),SENS,s*0.5,1.0,2.8);/* RWR/LWR */mk(g,new T.BoxGeometry(0.1,0.03,0.2),BLK,s*0.73,-0.55,-3.8);mk(g,new T.BoxGeometry(0.1,0.03,0.2),BLK,s*0.79,-0.05,-2.9);}
 mk(g,new T.BoxGeometry(0.28,0.22,0.35),body,0,1.0,3.2);mk(g,new T.CylinderGeometry(0.06,0.06,0.25,12),BLK,0,1.16,3.2);// ALQ-144 IR jammer
 mk(g,new T.BoxGeometry(0.34,0.14,0.42),BLK,-0.3,1.72,0.9);// UTA / UHF datalink
 g.traverse(o=>{if(o.isMesh&&o!==disc&&o.material!==GLS){o.castShadow=true;o.receiveShadow=true;}});
 return g;}
const _hOld=heli;heli=function(){try{return apache();}catch(e){console.error('apache detail',e);return _hOld();}};
window.__apache=apache;}
//GDETAIL_HELI-END
