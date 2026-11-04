// ===== moon_models.js : Saturn V (AS-506 livery), LC-39A pad + LUT, Apollo CSM, Apollo LM, lunar terrain. Units metres, +Y up. Refs: refs/saturnv, refs/lm =====
const MMOD=(()=>{const T=THREE;
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;};
const std=(o)=>new T.MeshStandardMaterial(Object.assign({roughness:0.55,metalness:0.05},o));
// grime/panel noise
function grime(g,w,h,a){for(let i=0;i<w*h/90;i++){g.fillStyle=`rgba(60,55,50,${Math.random()*a})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*6);}}
function vtext(g,txt,x,y0,size,step){g.save();g.fillStyle='#111';g.font=`bold ${size}px Arial Narrow, Arial, sans-serif`;g.textAlign='center';for(let i=0;i<txt.length;i++)g.fillText(txt[i],x,y0+i*step);g.restore();}
// S-IC skin: U=around (0..1), V=bottom->top; stage 42 m. Black roll pattern: lower 4 alternating stripes; intertank black/white quadrants; 'USA' vertical at base, 'UNITED STATES' high
const sicTex=cv(1024,2048,(g,w,h)=>{g.fillStyle='#f2f1ec';g.fillRect(0,0,w,h);const Y=m=>h-m/42*h;
 for(let q=0;q<4;q++){const x=q*w/4;if(q%2===0){g.fillStyle='#141414';g.fillRect(x+w/16,Y(12.5),w/8,Y(3)-Y(12.5));}}// lower roll-pattern stripes
 for(let q=0;q<4;q++){g.fillStyle=q%2?'#141414':'#f2f1ec';g.fillRect(q*w/4,Y(27.5),w/4,Y(24.8)-Y(27.5));}// intertank
 g.fillStyle='#141414';g.fillRect(0,Y(3),w,Y(0)-Y(3));// thrust structure black
 g.fillStyle='#2a2a2a';g.fillRect(0,Y(42),w,Y(40.6)-Y(42));// forward skirt
 for(let i=0;i<64;i++){g.fillStyle=i%2?'#e2e1dc':'#d6d5d0';g.fillRect(i*w/64,Y(42),w/64,Y(40.6)-Y(42)+0);} // corrugated fwd skirt shading
 g.fillStyle='#e9e8e2';for(let i=0;i<64;i++)g.fillRect(i*w/64,Y(3),2,Y(0)-Y(3));
 for(const q of [0.125,0.625]){vtext(g,'USA',q*w-0*w,Y(11.6),44,48);}
 for(const q of [0.375,0.875]){vtext(g,'UNITED',q*w,Y(38),30,32);vtext(g,'STATES',q*w,Y(38)+7*32,30,32);}
 g.strokeStyle='rgba(0,0,0,.18)';for(const m of [3,12.5,24.8,27.5,40.6])g.strokeRect(0,Y(m),w,1);grime(g,w,h,0.06);});
const siiTex=cv(1024,1024,(g,w,h)=>{g.fillStyle='#f2f1ec';g.fillRect(0,0,w,h);const Y=m=>h-m/24.9*h; // includes S-IC/S-II interstage at bottom 0-5.6
 for(let q=0;q<4;q++){g.fillStyle=q%2?'#141414':'#f2f1ec';g.fillRect(q*w/4,Y(5.6),w/4,Y(0)-Y(5.6));} // interstage roll pattern
 g.fillStyle='#141414';g.fillRect(0,Y(24.9),w,Y(23.5)-Y(24.9));
 for(const q of [0.375,0.875]){vtext(g,'UNITED',q*w,Y(21),24,28);vtext(g,'STATES',q*w,Y(21)+7*28,24,28);}
 g.strokeStyle='rgba(0,0,0,.2)';for(let m=6;m<24;m+=1.5)g.strokeRect(0,Y(m),w,.6);grime(g,w,h,0.05);});
const sivbTex=cv(512,1024,(g,w,h)=>{g.fillStyle='#f2f1ec';g.fillRect(0,0,w,h);const Y=m=>h-m/17.8*h;
 for(let q=0;q<4;q++){g.fillStyle=q%2?'#141414':'#f2f1ec';g.fillRect(q*w/4,Y(17.8),w/4,Y(14.2)-Y(17.8));} // fwd roll pattern
 g.fillStyle='#141414';g.fillRect(0,Y(4.8),w,Y(3.6)-Y(4.8));for(let q=0;q<4;q++){g.fillStyle=q%2?'#141414':'#f2f1ec';g.fillRect(q*w/4,Y(3.6),w/4,Y(0)-Y(3.6));}
 g.fillStyle='#c8c8c0';g.fillRect(w*0.06,Y(12),w*0.05,Y(5)-Y(12));grime(g,w,h,0.05);});
const foil=cv(512,512,(g,w,h)=>{for(let i=0;i<2600;i++){const c=150+Math.random()*90|0;g.fillStyle=`rgb(${c+20|0},${c*0.72|0},${c*0.22|0})`;g.beginPath();const x=Math.random()*w,y=Math.random()*h,r=4+Math.random()*16;g.moveTo(x,y);for(let k=0;k<5;k++)g.lineTo(x+(Math.random()-.5)*r*2,y+(Math.random()-.5)*r*2);g.fill();}
 g.fillStyle='rgba(20,20,20,.5)';for(let i=0;i<60;i++)g.fillRect(Math.random()*w,Math.random()*h,1,Math.random()*30);});
const steelTex=cv(256,256,(g,w,h)=>{g.fillStyle='#b9bcc0';g.fillRect(0,0,w,h);for(let i=0;i<400;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.12})`;g.fillRect(0,Math.random()*h,w,1);}});
const M={white:std({map:null,color:0xf0efe9,roughness:0.6}),black:std({color:0x151515,roughness:0.7}),steel:std({color:0x9aa0a6,metalness:0.8,roughness:0.35}),
 bell:std({color:0x2a2622,metalness:0.6,roughness:0.5,side:T.DoubleSide}),bellIn:std({color:0x4a3a30,metalness:0.4,roughness:0.6,side:T.BackSide}),
 csm:std({map:steelTex,color:0xd8dade,metalness:0.85,roughness:0.28}),cm:std({color:0xd9dde2,metalness:0.95,roughness:0.15}),
 foil:std({map:foil,color:0xffffff,metalness:0.85,roughness:0.35,emissive:0x2a1500,emissiveIntensity:0.15}),
 lmgray:std({color:0x8a8c8e,roughness:0.6,metalness:0.3}),lmblack:std({color:0x1d1d1f,roughness:0.5,metalness:0.4}),
 red:std({color:0xb2321c,roughness:0.7,metalness:0.2}),grey:std({color:0x7d7f80,roughness:0.9}),conc:std({color:0xb7b2a6,roughness:0.95})};
function cyl(rt,rb,h,mat,seg=48,y=0,open=false){const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg,1,open),mat);m.position.y=y+h/2;return m;}
// F-1 engine: 3.76 m exit, 5.8 m tall, turbine exhaust manifold, nozzle extension (black), heat-exchanger, gimbal
function F1(){const g=new T.Group();const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push(new T.Vector2(0.55+1.33*Math.pow(t,0.72),-t*5.0));}
 g.add(new T.Mesh(new T.LatheGeometry(pts,40),M.bell));g.add(new T.Mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(p.x*0.985,p.y)),40),M.bellIn));
 const man=new T.Mesh(new T.TorusGeometry(1.25,0.13,8,40),M.bell);man.rotation.x=Math.PI/2;man.position.y=-2.6;g.add(man);
 for(let i=0;i<60;i++){const tb=new T.Mesh(new T.BoxGeometry(0.04,2.3,0.06),M.steel);const a=i/60*Math.PI*2;const r=0.95+0.0;tb.position.set(Math.cos(a)*(r+0.12),-1.3,Math.sin(a)*(r+0.12));tb.rotation.z=-Math.cos(a)*0.17;tb.rotation.x=Math.sin(a)*0.17;g.add(tb);}// regen tubes
 const tp=cyl(0.35,0.35,1.6,M.steel,16,-1.2);tp.position.x=0.9;g.add(tp);const hx=cyl(0.28,0.28,0.9,M.black,12,-0.4);hx.position.set(-0.7,0,0.5);g.add(hx);
 g.add(cyl(0.6,0.55,1.0,M.steel,24,0));const dome=new T.Mesh(new T.SphereGeometry(0.62,20,10,0,Math.PI*2,0,Math.PI/2),M.steel);dome.position.y=1.0;g.add(dome);return g;}
function J2(scale=1){const g=new T.Group();const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new T.Vector2(0.25+0.75*Math.pow(t,0.7),-t*2.6));}g.add(new T.Mesh(new T.LatheGeometry(pts,32),M.bell));
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const tb=new T.Mesh(new T.BoxGeometry(0.025,1.3,0.03),M.steel);tb.position.set(Math.cos(a)*0.55,-0.8,Math.sin(a)*0.55);g.add(tb);}
 const tp=cyl(0.18,0.18,0.8,M.steel,12,-0.2);tp.position.x=0.5;g.add(tp);const tp2=tp.clone();tp2.position.x=-0.5;g.add(tp2);g.add(cyl(0.3,0.25,0.6,M.steel,16,0));g.scale.setScalar(scale);return g;}
function RCSquad(){const g=new T.Group();g.add(new T.Mesh(new T.BoxGeometry(0.35,0.35,0.25),M.lmgray));for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]]){const n=new T.Mesh(new T.ConeGeometry(0.06,0.22,10,1,true),M.bell);n.position.set(d[0]*0.25,d[1]*0.25,0.05);n.lookAt(n.position.clone().multiplyScalar(3));n.rotateX(Math.PI/2);g.add(n);}return g;}
// ---- CSM (CM 3.9 m dia x 3.2 m, SM 3.9 m x 7.5 m incl. SPS) ----
function CSM(){const g=new T.Group();const sm=cyl(1.96,1.96,6.7,M.csm,48,0);g.add(sm);
 for(let i=0;i<6;i++){const p=new T.Mesh(new T.BoxGeometry(0.02,2.6,1.5),std({color:0xe9ebee,metalness:0.2,roughness:0.5}));const a=i/6*Math.PI*2+0.3;p.position.set(Math.cos(a)*1.97,4.2,Math.sin(a)*1.97);p.rotation.y=-a;g.add(p);} // radiator panels
 for(let i=0;i<4;i++){const q=RCSquad();const a=i/4*Math.PI*2+Math.PI/4;q.position.set(Math.cos(a)*2.05,5.3,Math.sin(a)*2.05);q.rotation.y=-a+Math.PI/2;g.add(q);}
 const sps=[];for(let i=0;i<=12;i++){const t=i/12;sps.push(new T.Vector2(0.35+0.9*Math.pow(t,0.75),-t*2.9));}const b=new T.Mesh(new T.LatheGeometry(sps,32),std({color:0x6c6f73,metalness:0.7,roughness:0.4,side:T.DoubleSide}));g.add(b);
 const hg=new T.Group();for(let i=0;i<4;i++){const d=new T.Mesh(new T.SphereGeometry(0.4,12,8,0,Math.PI*2,0,0.9),std({color:0xdddddd,side:T.DoubleSide}));d.position.set((i%2-.5)*0.85,(i>1?.42:-.42),0);d.rotation.x=-Math.PI/2;hg.add(d);}hg.position.set(0,0.2,-3.2);g.add(hg);const boom=new T.Mesh(new T.CylinderGeometry(0.05,0.05,1.6),M.steel);boom.position.set(0,0.6,-2.6);boom.rotation.x=1.1;g.add(boom);
 const cm=new T.Mesh(new T.CylinderGeometry(0.42,1.96,3.2,48,1),M.cm);cm.position.y=6.7+1.6;g.add(cm);const ap=new T.Mesh(new T.CylinderGeometry(0.42,0.42,0.4,24),M.cm);ap.position.y=6.7+3.4;g.add(ap);
 const win=new T.Mesh(new T.BoxGeometry(0.35,0.35,0.05),M.lmblack);win.position.set(0,8.2,1.38);win.rotation.x=-0.5;g.add(win);g.userData.top=10.0;return g;}
// ---- LES: tower truss + motor + canard + BPC ----
function LES(){const g=new T.Group();const H=4.6;for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const l=new T.Mesh(new T.CylinderGeometry(0.05,0.05,H),M.red);l.position.set(Math.cos(a)*0.55,H/2,Math.sin(a)*0.55);g.add(l);
  for(let k=0;k<4;k++){const br=new T.Mesh(new T.CylinderGeometry(0.03,0.03,0.9),M.red);const b=a+Math.PI/4;br.position.set(Math.cos(b)*0.4,k*1.1+0.6,Math.sin(b)*0.4);br.rotation.set(0,-b,0.9*(k%2?1:-1));g.add(br);}}
 const mot=cyl(0.33,0.33,4.4,M.white,24,H);g.add(mot);const nose=new T.Mesh(new T.ConeGeometry(0.33,1.4,24),M.white);nose.position.y=H+4.4+0.7;g.add(nose);const spike=new T.Mesh(new T.CylinderGeometry(0.03,0.05,0.9),M.black);spike.position.y=H+6.3;g.add(spike);
 for(let i=0;i<4;i++){const n=new T.Mesh(new T.ConeGeometry(0.16,0.4,10),M.black);const a=i/4*Math.PI*2;n.position.set(Math.cos(a)*0.36,H+0.4,Math.sin(a)*0.36);n.rotation.z=Math.cos(a)*2.4;n.rotation.x=-Math.sin(a)*2.4;g.add(n);}
 const bpc=new T.Mesh(new T.CylinderGeometry(0.45,2.0,3.3,40,1,true),std({color:0xf4f3ee,side:T.DoubleSide}));bpc.position.y=-1.55;g.add(bpc);return g;}
// ---- LM (Apollo 11 'Eagle' style) ----
function LM(){const g=new T.Group();const ds=new T.Group();g.add(ds);
 const oct=new T.Mesh(new T.CylinderGeometry(2.1,2.1,1.65,8),M.foil);oct.rotation.y=Math.PI/8;oct.position.y=1.9;ds.add(oct);
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const box=new T.Mesh(new T.BoxGeometry(1.2,1.5,0.5),M.foil);box.position.set(Math.cos(a)*1.85,1.9,Math.sin(a)*1.85);box.rotation.y=-a+Math.PI/2;ds.add(box);}
 const dps=[];for(let i=0;i<=10;i++){const t=i/10;dps.push(new T.Vector2(0.3+0.45*t,-t*1.4));}const db=new T.Mesh(new T.LatheGeometry(dps,24),M.bell);db.position.y=1.2;ds.add(db);
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2;const c=Math.cos(a),s=Math.sin(a);const leg=new T.Group();ds.add(leg);
  const st=new T.Mesh(new T.CylinderGeometry(0.09,0.09,2.9),std({color:0xc7a33a,metalness:0.8,roughness:0.3}));st.position.set(c*3.1,1.25,s*3.1);st.lookAt(c*2.0,2.6,s*2.0);st.rotateX(Math.PI/2);leg.add(st);
  for(const o of [-1,1]){const sec=new T.Mesh(new T.CylinderGeometry(0.04,0.04,2.4),M.steel);const bx=c*2.2-s*o*0.9,bz=s*2.2+c*o*0.9;sec.position.set((bx+c*3.6)/2,0.95,(bz+s*3.6)/2);sec.lookAt(bx,1.4,bz);sec.rotateX(Math.PI/2);leg.add(sec);}
  const pad=new T.Mesh(new T.CylinderGeometry(0.47,0.42,0.18,24),M.foil);pad.position.set(c*3.85,0.09,s*3.85);leg.add(pad);
  if(i!==0){const pr=new T.Mesh(new T.CylinderGeometry(0.015,0.015,1.7),M.steel);pr.position.set(c*3.85,-0.75,s*3.85);leg.add(pr);}
  else{for(let k=0;k<8;k++){const r=new T.Mesh(new T.BoxGeometry(0.5,0.03,0.12),M.foil);r.position.set(c*2.8,0.6+k*0.22,s*2.8);r.rotation.y=-a;leg.add(r);}}}
 const as=new T.Group();as.position.y=2.75;g.add(as);
 const cab=new T.Mesh(new T.CylinderGeometry(1.2,1.25,1.9,10),M.lmgray);cab.position.y=1.0;as.add(cab);
 const front=new T.Mesh(new T.BoxGeometry(1.9,1.4,1.0),M.lmgray);front.position.set(0,1.1,1.05);front.rotation.x=0.08;as.add(front);
 for(const o of [-1,1]){const w=new T.Mesh(new T.BoxGeometry(0.5,0.45,0.04),M.lmblack);w.position.set(o*0.52,1.45,1.57);w.rotation.set(-0.3,o*0.35,0);as.add(w);}
 const hatch=new T.Mesh(new T.BoxGeometry(0.85,0.85,0.04),M.lmblack);hatch.position.set(0,0.62,1.57);as.add(hatch);
 const aft=new T.Mesh(new T.BoxGeometry(1.6,1.2,1.0),M.lmblack);aft.position.set(0,1.0,-1.25);as.add(aft);
 for(const o of [-1,1]){const tank=new T.Mesh(new T.SphereGeometry(0.55,16,12),M.lmgray);tank.position.set(o*1.35,0.75,-0.2);as.add(tank);}
 const tun=cyl(0.45,0.5,0.55,M.lmgray,20,1.95);as.add(tun);
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const q=RCSquad();q.position.set(Math.cos(a)*1.75,1.7,Math.sin(a)*1.75);q.rotation.y=-a+Math.PI/2;as.add(q);const arm=new T.Mesh(new T.BoxGeometry(0.6,0.08,0.08),M.lmgray);arm.position.set(Math.cos(a)*1.4,1.7,Math.sin(a)*1.4);arm.rotation.y=-a;as.add(arm);}
 const rr=new T.Mesh(new T.SphereGeometry(0.35,16,8,0,Math.PI*2,0,1.1),std({color:0xeeeeee,side:T.DoubleSide}));rr.position.set(0,2.3,0.9);rr.rotation.x=1.2;as.add(rr);
 const sb=new T.Mesh(new T.SphereGeometry(0.45,16,8,0,Math.PI*2,0,1.0),std({color:0xdcdcdc,side:T.DoubleSide}));sb.position.set(0.9,2.4,-0.5);sb.rotation.z=-0.9;as.add(sb);
 const aps=new T.Mesh(new T.ConeGeometry(0.35,0.6,16,1,true),M.bell);aps.position.y=0.05;aps.rotation.x=Math.PI;as.add(aps);
 g.userData={ds,as};return g;}
// ---- Saturn V stack (heights: S-IC 0-42, S-II 42-66.9 (incl. interstage 42-47.6), S-IVB 66.9-84.7, IU 84.7-85.6, SLA 85.6-94.1, CSM 94.1-104.1, LES 104.1-110.6) ----
function SaturnV(){const R=5.03,root=new T.Group();const P={};
 const sic=new T.Group();P.sic=sic;root.add(sic);sic.add(cyl(R,R,42,std({map:sicTex,roughness:0.55}),64,0));
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const fair=new T.Mesh(new T.ConeGeometry(1.2,6.5,20),M.white);fair.position.set(Math.cos(a)*R,1.0,Math.sin(a)*R);fair.rotation.x=Math.PI;sic.add(fair);
  const fin=new T.Mesh(new T.BoxGeometry(0.3,4.5,3.6),M.white);fin.position.set(Math.cos(a)*(R+2.2),1.4,Math.sin(a)*(R+2.2));fin.rotation.y=-a;sic.add(fin);
  const tip=new T.Mesh(new T.BoxGeometry(0.32,1.2,3.6),M.black);tip.position.set(Math.cos(a)*(R+2.2),3.8,Math.sin(a)*(R+2.2));tip.rotation.y=-a;sic.add(tip);}
 const hs=new T.Mesh(new T.CylinderGeometry(R,R*0.96,0.6,64),M.black);hs.position.y=-0.3;sic.add(hs);
 for(const p of [[0,0],[3.3,0],[-3.3,0],[0,3.3],[0,-3.3]]){const e=F1();e.position.set(p[0],-0.6,p[1]);sic.add(e);}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const r=new T.Mesh(new T.BoxGeometry(0.3,42,0.12),std({color:0xe6e5df}));r.position.set(Math.cos(a)*(R+0.05),21,Math.sin(a)*(R+0.05));r.rotation.y=-a;if(i%2)sic.add(r);} // tunnels
 const inter=new T.Group();P.inter=inter;root.add(inter);const it=cyl(R,R,5.6,std({map:null,color:0xffffff,roughness:0.6}),64,42);it.material=std({map:siiTex,roughness:0.6});
 // separate interstage: use bottom part of siiTex via UV offset
 const itm=it.material.clone();itm.map=siiTex.clone();itm.map.repeat.set(1,5.6/24.9);itm.map.needsUpdate=true;it.material=itm;inter.add(it);
 const sii=new T.Group();P.sii=sii;root.add(sii);const st=cyl(R,R,19.3,std({map:(()=>{const t=siiTex.clone();t.offset.set(0,5.6/24.9);t.repeat.set(1,19.3/24.9);t.needsUpdate=true;return t;})()}),64,47.6);sii.add(st);
 for(const p of [[0,0],[1.8,0],[-1.8,0],[0,1.8],[0,-1.8]]){const e=J2(1);e.position.set(p[0],47.6,p[1]);sii.add(e);}
 const thr=new T.Mesh(new T.CylinderGeometry(R*0.95,2.2,1.5,32,1,true),M.black);thr.position.y=48.3;sii.add(thr);
 const sivb=new T.Group();P.sivb=sivb;root.add(sivb);const ad=new T.Mesh(new T.CylinderGeometry(3.3,R,5.5,64,1,true),std({map:(()=>{const t=sivbTex.clone();return t;})(),color:0xffffff,side:T.DoubleSide}));ad.material.map=null;ad.material.color.set(0xf0efe9);ad.position.y=66.9+2.75;
 sii.add(ad);// S-II/S-IVB interstage belongs to S-II (separates with it)
 sivb.add(cyl(3.3,3.3,17.8,std({map:sivbTex}),48,66.9));const j=J2(1);j.position.y=66.9;sivb.add(j);
 for(const o of [-1,1]){const ap=new T.Mesh(new T.BoxGeometry(1.2,3.6,0.9),M.white);ap.position.set(o*3.45,68.5,0);sivb.add(ap);}
 const iu=cyl(3.3,3.3,0.9,std({color:0xe4e3dd}),48,84.7);sivb.add(iu);
 P.sla=[];for(let i=0;i<4;i++){const pn=new T.Mesh(new T.CylinderGeometry(1.96,3.3,8.5,16,1,true,i*Math.PI/2,Math.PI/2),std({color:0xf3f2ed,side:T.DoubleSide,roughness:0.65}));const pg=new T.Group();pg.position.y=85.6;pn.position.y=4.25;pg.add(pn);root.add(pg);P.sla.push(pg);}
 const lm=LM();lm.scale.setScalar(0.82);lm.position.y=86.0;root.add(lm);P.lm=lm; // folded legs approximated by scale inside SLA
 const csm=CSM();csm.position.y=94.1+2.9;csm.scale.setScalar(1);root.add(csm);P.csm=csm;csm.position.y=94.1;
 const les=LES();les.position.y=104.1;root.add(les);P.les=les;
 root.userData.P=P;return root;}
// ---- LC-39A: pad hardstand, flame trench, Mobile Launcher with LUT (136 m), swing arms, hammerhead crane ----
function Pad(){const g=new T.Group();const gr=new T.Mesh(new T.CircleGeometry(4000,64),std({color:0x5d6a45,roughness:1}));gr.rotation.x=-Math.PI/2;gr.position.y=-14.5;g.add(gr);
 const sea=new T.Mesh(new T.PlaneGeometry(20000,20000),std({color:0x1f4766,roughness:0.25,metalness:0.2}));sea.rotation.x=-Math.PI/2;sea.position.set(12000,-14.8,0);g.add(sea);
 const hill=new T.Mesh(new T.CylinderGeometry(120,190,14,8),M.conc);hill.position.y=-7.5;g.add(hill);
 const trench=new T.Mesh(new T.BoxGeometry(18,8,200),std({color:0x2b2b2b}));trench.position.set(0,-4,0);g.add(trench);
 const ml=new T.Mesh(new T.BoxGeometry(49,7.6,41),M.grey);ml.position.y=-3.8;g.add(ml);const hole=new T.Mesh(new T.BoxGeometry(14,7.8,14),std({color:0x111111}));hole.position.y=-3.8;g.add(hole);
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;const hd=new T.Mesh(new T.BoxGeometry(1.4,2,1.4),M.grey);hd.position.set(Math.cos(a)*6.6,1,Math.sin(a)*6.6);g.add(hd);}
 const lut=new T.Group();lut.position.set(-22,0,0);g.add(lut);const tw=12,H=122;
 for(const x of [-tw/2,tw/2])for(const z of [-tw/2,tw/2]){const c=new T.Mesh(new T.BoxGeometry(0.9,H,0.9),M.red);c.position.set(x,H/2,z);lut.add(c);}
 for(let y=6;y<H;y+=6.1){for(const z of [-tw/2,tw/2]){const b=new T.Mesh(new T.BoxGeometry(tw,0.5,0.5),M.red);b.position.set(0,y,z);lut.add(b);const d=new T.Mesh(new T.BoxGeometry(0.3,8.6,0.3),M.red);d.position.set(0,y-3,z);d.rotation.z=(y/6|0)%2?0.78:-0.78;lut.add(d);}
  for(const x of [-tw/2,tw/2]){const b=new T.Mesh(new T.BoxGeometry(0.5,0.5,tw),M.red);b.position.set(x,y,0);lut.add(b);const d=new T.Mesh(new T.BoxGeometry(0.3,8.6,0.3),M.red);d.position.set(x,y-3,0);d.rotation.x=(y/6|0)%2?0.78:-0.78;lut.add(d);}
  const fl=new T.Mesh(new T.BoxGeometry(tw-1,0.2,tw-1),std({color:0x55595c}));fl.position.y=y;if((y/6|0)%3===0)lut.add(fl);}
 const arms=[[18,0],[34,1],[49,0],[60,1],[68,0],[78,1],[86,0],[92,1],[98,1]];g.userData.arms=[];
 for(const [y,big] of arms){const arm=new T.Group();arm.position.set(tw/2,y,0);const len=12.5;const b=new T.Mesh(new T.BoxGeometry(len,big?2.4:1.4,big?2.2:1.4),M.red);b.position.x=len/2;arm.add(b);
  if(y===98){const wr=new T.Mesh(new T.BoxGeometry(2.6,2.6,2.6),std({color:0xe8e8e8}));wr.position.x=len;arm.add(wr);}lut.add(arm);g.userData.arms.push(arm);}
 const crane=new T.Mesh(new T.BoxGeometry(26,2.2,2.2),std({color:0xd8b23a}));crane.position.set(4,H+2,0);lut.add(crane);const cab=new T.Mesh(new T.BoxGeometry(4,3,3),std({color:0xd8b23a}));cab.position.set(-6,H+1.5,0);lut.add(cab);
 const ant=new T.Mesh(new T.CylinderGeometry(0.15,0.15,14),M.steel);ant.position.set(0,H+9,0);lut.add(ant);
 const wt=new T.Mesh(new T.SphereGeometry(9,20,14),std({color:0xe8e8e6}));wt.position.set(240,40,-160);g.add(wt);const wl=new T.Mesh(new T.CylinderGeometry(1,1,40),M.grey);wl.position.set(240,12,-160);g.add(wl);
 return g;}
// ---- Plume (additive layered cones, shock diamonds) ----
function Plume(r,len,col,diamonds=true){const g=new T.Group();const mk=(rr,l,c,op)=>{const m=new T.Mesh(new T.ConeGeometry(rr,l,24,1,true),new T.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));m.position.y=-l/2;m.rotation.x=Math.PI;return m;};
 g.add(mk(r*1.0,len,col,0.55));g.add(mk(r*0.7,len*0.7,0xffffff,0.55));g.add(mk(r*1.6,len*1.6,col,0.18));
 if(diamonds)for(let i=1;i<5;i++){const d=new T.Mesh(new T.SphereGeometry(r*0.35,10,8),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.35,blending:T.AdditiveBlending,depthWrite:false}));d.scale.y=1.8;d.position.y=-i*len*0.16;g.add(d);}
 g.userData.base=len;return g;}
// ---- lunar terrain patch (mare with craters, boulders) ----
function craterH(u,v){let h=0;for(const c of CR){const d=Math.hypot(u-c[0],v-c[1])/c[2];if(d<1.6)h+=c[3]*(d<1?(d*d-0.75):0.25*Math.cos((d-1)/0.6*Math.PI/2)**2);}h+=6*Math.sin(u*0.0021)*Math.cos(v*0.0017)+2*Math.sin(u*0.011+v*0.007);return h;}
const CR=[];{let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<220;i++){const r=i<6?250+rnd()*500:8+Math.pow(rnd(),3)*180;let u=(rnd()-.5)*9000,v=(rnd()-.5)*9000;if(Math.hypot(u,v)<r+90)u+=r+200;CR.push([u,v,r,r*0.18]);}}
function Terrain(tex){const S=9000,N=isTouch?160:256;const geo=new T.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=-p.getZ(i);p.setY(i,craterH(u,v)-craterH(0,0));}geo.computeVertexNormals();
 const reg=cv(512,512,(g,w,h)=>{const id=g.createImageData(w,h);for(let i=0;i<w*h;i++){const n=118+Math.random()*40;id.data[i*4]=n;id.data[i*4+1]=n;id.data[i*4+2]=n*0.98;id.data[i*4+3]=255;}g.putImageData(id,0,0);});reg.wrapS=reg.wrapT=T.RepeatWrapping;reg.repeat.set(90,90);
 const m=new T.Mesh(geo,new T.MeshStandardMaterial({map:reg,color:0xa8a6a2,roughness:1,metalness:0}));
 const rk=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:0x8e8c88,roughness:1}),isTouch?400:900);const mt=new T.Matrix4();for(let i=0;i<rk.count;i++){const u=(Math.random()-.5)*600,v=(Math.random()-.5)*600;const sc=0.2+Math.pow(Math.random(),4)*2.5;mt.compose(new T.Vector3(u,craterH(u,v)-craterH(0,0)+sc*0.3,-v),new T.Quaternion().random(),new T.Vector3(sc,sc*0.7,sc));rk.setMatrixAt(i,mt);}m.add(rk);
 return m;}
const terrainH=u=>craterH(u,0)-craterH(0,0);
return{SaturnV,Pad,CSM,LM,LES,Plume,Terrain,terrainH,M};})();
// ---- Starship HLS (returnable variant): reuses ship_ builder model (GR.starship via starshipModel) + HLS hardware. Ship spans y 73..121 in that model.
MMOD.HLS=function(){const T=THREE,M=MMOD.M;const g=(typeof starshipModel==='function')?starshipModel():new T.Group();const ud=g.userData||{};const s2=ud.s2||g,s1=ud.s1||null;const R=4.5;
 const wht=new T.MeshStandardMaterial({color:0xeef0f2,roughness:0.5,metalness:0.1});
 const up=new T.Mesh(new T.CylinderGeometry(R+0.03,R+0.03,16,96,1,true,-Math.PI*0.45,Math.PI*0.9),wht);up.position.y=103-8+8;up.rotation.y=Math.PI/2;s2.add(up); // white leeward upper hull
 const np=[];for(let i=0;i<=30;i++){const t=i/30;np.push(new T.Vector2(Math.max(0.001,(R+0.03)*Math.pow(1-Math.pow(t,1.85),0.62)),t*18));}const nose=new T.Mesh(new T.LatheGeometry(np,96,-Math.PI*0.45+Math.PI/2,Math.PI*0.9),wht);nose.position.y=103;s2.add(nose);
 const nzM=new T.MeshStandardMaterial({color:0x2b2b2d,metalness:0.7,roughness:0.4});const lt=[];
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const pod=new T.Mesh(new T.BoxGeometry(0.9,1.6,0.7),wht);pod.position.set(Math.cos(a)*(R+0.3),99,Math.sin(a)*(R+0.3));pod.rotation.y=-a;s2.add(pod);
  for(const o of [-0.22,0.22]){const n=new T.Mesh(new T.ConeGeometry(0.17,0.55,12,1,true),nzM);n.position.set(Math.cos(a)*(R+0.55)-Math.sin(a)*o,98.0,Math.sin(a)*(R+0.55)+Math.cos(a)*o);n.rotation.x=0;s2.add(n);lt.push(n.position.clone());}}
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+0.26;const leg=new T.Group();const st=new T.Mesh(new T.CylinderGeometry(0.22,0.22,9),M.steel);st.position.set(Math.cos(a)*(R+1.6),73.5,Math.sin(a)*(R+1.6));st.rotation.z=Math.cos(a)*0.32;st.rotation.x=-Math.sin(a)*0.32;leg.add(st);
  const ft=new T.Mesh(new T.CylinderGeometry(0.9,1.0,0.35,16),M.steel);ft.position.set(Math.cos(a)*(R+3.0),69.2,Math.sin(a)*(R+3.0));leg.add(ft);s2.add(leg);}
 const sa=new T.MeshStandardMaterial({color:0x1a2a5a,metalness:0.6,roughness:0.3,emissive:0x050a20});
 for(const z of [1,-1]){const p=new T.Mesh(new T.BoxGeometry(0.08,9,3.2),sa);p.position.set(0.4,93,z*(R+1.8));p.rotation.x=z*0.08;s2.add(p);const arm=new T.Mesh(new T.BoxGeometry(0.15,0.15,1.4),M.steel);arm.position.set(0.4,93,z*(R+0.6));s2.add(arm);}
 for(let i=0;i<5;i++){const w=new T.Mesh(new T.BoxGeometry(0.06,0.6,0.5),M.lmblack);const a=-0.35+i*0.17;w.position.set(Math.cos(a)*(R+0.03),111.5,Math.sin(a)*(R+0.03));w.rotation.y=-a;s2.add(w);}
 const al=new T.Mesh(new T.BoxGeometry(0.2,2.6,1.8),wht);al.position.set(R+0.1,106,0);s2.add(al);const ad=new T.Mesh(new T.BoxGeometry(0.08,2.0,1.2),M.lmgray);ad.position.set(R+0.22,106,0);s2.add(ad);
 const rail=new T.Mesh(new T.BoxGeometry(0.15,34,0.15),M.steel);rail.position.set(R+0.35,88,0.9);s2.add(rail);const rail2=rail.clone();rail2.position.z=-0.9;s2.add(rail2);
 const elev=new T.Group();const plat=new T.Mesh(new T.BoxGeometry(2.0,0.2,2.0),M.lmgray);elev.add(plat);const cage=new T.Mesh(new T.BoxGeometry(2.0,2.4,2.0),new T.MeshStandardMaterial({color:0xcccccc,wireframe:true}));cage.position.y=1.2;elev.add(cage);elev.position.set(R+1.4,104.8,0);s2.add(elev);
 const dock=new T.Mesh(new T.CylinderGeometry(0.8,0.9,0.6,32),M.lmgray);dock.position.y=120.6;s2.add(dock);
 const plasma=new T.Mesh(new T.SphereGeometry(1,32,24),new T.MeshBasicMaterial({color:0xff7a30,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));plasma.scale.set(10,30,10);plasma.position.set(-3,97,0);s2.add(plasma);
 g.userData.hls={s1,s2,elev,lt,plasma,shield:s2.userData&&s2.userData.shield};return g;};
MMOD.Dust=function(){const T=THREE;const n=isTouch?120:260;const g=new T.BufferGeometry();const p=new Float32Array(n*3);g.setAttribute('position',new T.BufferAttribute(p,3));const m=new T.PointsMaterial({color:0xb9b4aa,size:6,transparent:true,opacity:0.5,depthWrite:false});const o=new T.Points(g,m);o.userData.v=Array.from({length:n},()=>[Math.random()*Math.PI*2,Math.random()]);o.frustumCulled=false;return o;};
