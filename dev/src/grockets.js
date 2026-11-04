// ===== GROCKETS: high-detail Falcon 9 Block 5 (+Crew Dragon / fairing) and Starship / Super Heavy, real scale, PBR skins, plumes =====
const GR=(()=>{const T=THREE,PI=Math.PI,cache={};
 const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];};
 const tex=(c,rep)=>{const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.wrapS=T.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t;};
 const dtex=(c)=>{const t=new T.CanvasTexture(c);t.anisotropy=8;t.wrapS=T.RepeatWrapping;return t;};
 const rnd=(a,b)=>a+Math.random()*(b-a);
 // ---------- Falcon 9 first stage skin: white paint, reuse soot (heavier on leeward side and toward the top), weld rings, raceway shadow, stencils ----------
 function f9s1(){if(cache.f9s1)return cache.f9s1;const W=1024,H=4096;const [c,x]=cv(W,H),[r,rx]=cv(W,H),[b,bx]=cv(W/2,H/2);
  x.fillStyle='#eef0f1';x.fillRect(0,0,W,H);rx.fillStyle='#7a7a7a';rx.fillRect(0,0,W,H);bx.fillStyle='#808080';bx.fillRect(0,0,W/2,H/2);
  // soot: vertical streaks from re-entry, stronger at u~0.5 (leeward) and in upper third
  for(let i=0;i<9000;i++){const u=Math.random(),v=Math.random();const side=Math.exp(-Math.pow((u-0.5)/0.22,2));const up=0.35+0.65*Math.pow(1-v,1.2);
   const a=0.05*side*up+0.008;x.fillStyle=`rgba(${30+rnd(0,20)|0},${26+rnd(0,16)|0},${20+rnd(0,12)|0},${a})`;x.fillRect(u*W,v*H,rnd(1,5),rnd(30,420));}
  for(let i=0;i<220;i++){const u=0.5+rnd(-0.3,0.3),y0=rnd(0,H*0.75);const g=x.createLinearGradient(0,y0,0,y0+rnd(300,1600));g.addColorStop(0,'rgba(25,22,18,0.35)');g.addColorStop(1,'rgba(25,22,18,0)');x.fillStyle=g;x.fillRect(u*W,y0,rnd(2,14),1600);}
  // bottom burn / scorched band above octaweb, top scorch near interstage
  let g=x.createLinearGradient(0,H,0,H*0.86);g.addColorStop(0,'rgba(35,30,25,0.85)');g.addColorStop(1,'rgba(35,30,25,0)');x.fillStyle=g;x.fillRect(0,H*0.86,W,H*0.14);
  g=x.createLinearGradient(0,0,0,H*0.12);g.addColorStop(0,'rgba(40,34,28,0.55)');g.addColorStop(1,'rgba(40,34,28,0)');x.fillStyle=g;x.fillRect(0,0,W,H*0.12);
  // paint chips / scuffs
  for(let i=0;i<600;i++){x.fillStyle=`rgba(${rnd(120,180)|0},${rnd(120,170)|0},${rnd(110,160)|0},0.5)`;x.fillRect(rnd(0,W),rnd(0,H),rnd(1,4),rnd(1,4));}
  // circumferential weld seams (barrel sections ~ every 2.7 m on 38.4 m tank) + LOX/RP-1 common dome band
  const L=38.4;for(let m=1.2;m<L;m+=2.74){const y=H*(1-m/L);x.fillStyle='rgba(0,0,0,0.30)';x.fillRect(0,y,W,3);x.fillStyle='rgba(255,255,255,0.25)';x.fillRect(0,y+3,W,2);bx.fillStyle='#5a5a5a';bx.fillRect(0,y/2,W/2,2);rx.fillStyle='#9a9a9a';rx.fillRect(0,y,W,6);}
  {const y=H*(1-24.5/L);x.fillStyle='rgba(60,60,60,0.35)';x.fillRect(0,y,W,8);}
  // vertical stringer welds
  for(let k=0;k<8;k++){const u=k/8*W+30;x.fillStyle='rgba(0,0,0,0.08)';x.fillRect(u,0,2,H);}
  // raceway shadow strips (u=0.25 and 0.75)
  for(const u of[0.25,0.75]){x.fillStyle='rgba(0,0,0,0.18)';x.fillRect(u*W-18,0,36,H);}
  // stencils: vertical "SPACEX" (generic font), US flag, small hazard stencils
  x.save();x.translate(W*0.0+150,H*0.32);x.rotate(PI/2);x.font='bold 150px "Helvetica Neue",Arial,sans-serif';x.fillStyle='rgba(20,22,26,0.92)';x.textBaseline='middle';x.fillText('S P A C E X',0,0);x.restore();
  x.save();x.translate(150,H*0.12);for(let i=0;i<13;i++){x.fillStyle=i%2?'#f2f2f2':'#b22234';x.fillRect(0,i*14,190,14);}x.fillStyle='#3c3b6e';x.fillRect(0,0,80,98);x.fillStyle='#fff';for(let i=0;i<5;i++)for(let j=0;j<6;j++)x.fillRect(6+j*12,6+i*18,4,4);x.restore();
  x.font='bold 22px Arial';x.fillStyle='rgba(30,30,30,0.85)';for(const [u,v,t] of [[0.55,0.93,'DANGER  RP-1  FUEL'],[0.55,0.62,'LOX'],[0.05,0.95,'B10xx'],[0.8,0.9,'NO STEP'],[0.3,0.97,'GSE QD  ►'],[0.8,0.55,'VENT']])x.fillText(t,u*W,v*H);
  cache.f9s1={map:tex(c),rough:dtex(r),bump:dtex(b)};return cache.f9s1;}
 function whiteSkin(key,L,labels,flag){if(cache[key])return cache[key];const W=1024,H=1024;const [c,x]=cv(W,H);x.fillStyle='#f3f4f5';x.fillRect(0,0,W,H);
  for(let i=0;i<2500;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.03})`;x.fillRect(rnd(0,W),rnd(0,H),rnd(2,30),rnd(2,8));}
  for(let m=1;m<L;m+=2.7){const y=H*(1-m/L);x.fillStyle='rgba(0,0,0,0.22)';x.fillRect(0,y,W,2);}
  for(const u of[0.25,0.75]){x.fillStyle='rgba(0,0,0,0.12)';x.fillRect(u*W-10,0,20,H);}
  x.font='bold 18px Arial';x.fillStyle='rgba(30,30,30,0.8)';for(const [u,v,t] of labels||[])x.fillText(t,u*W,v*H);
  cache[key]=tex(c);return cache[key];}
 function carbon(key,txt){if(cache[key])return cache[key];const W=1024,H=512;const [c,x]=cv(W,H);x.fillStyle='#141516';x.fillRect(0,0,W,H);
  for(let i=0;i<W;i+=4)for(let j=0;j<H;j+=4){x.fillStyle=((i+j)/4)%2?'rgba(255,255,255,0.025)':'rgba(0,0,0,0.05)';x.fillRect(i,j,4,4);}
  for(let i=0;i<1500;i++){x.fillStyle=`rgba(90,80,70,${Math.random()*0.05})`;x.fillRect(rnd(0,W),rnd(0,H),rnd(1,3),rnd(10,120));}
  x.fillStyle='rgba(0,0,0,0.5)';x.fillRect(0,H*0.5,W,2);if(txt){x.font='bold 64px "Helvetica Neue",Arial';x.fillStyle='rgba(235,235,235,0.9)';x.fillText(txt,W*0.08,H*0.62);}
  cache[key]=tex(c);return cache[key];}
 // ---------- stainless 304L skin for Starship: rolled rings, vertical welds, heat tint, grime; with roughness ----------
 function steel(key,L,o={}){if(cache[key])return cache[key];const W=1024,H=4096;const [c,x]=cv(W,H),[r,rx]=cv(W,H);const [bc,bx]=cv(512,2048);bx.fillStyle='#808080';bx.fillRect(0,0,512,2048);const bead=(X,Y,w,h)=>{bx.fillStyle='rgba(255,255,255,0.9)';bx.fillRect(X/2,Y/2,Math.max(1,w/2),Math.max(1,h/2));bx.fillStyle='rgba(200,200,200,0.5)';bx.fillRect(X/2-(w>h?0:1),Y/2-(w>h?1:0),w>h?w/2:w/2+2,w>h?h/2+2:h/2);}; // ship #15: raised weld-bead bump map
  x.fillStyle='#b9bec3';x.fillRect(0,0,W,H);rx.fillStyle='#4a4a4a';rx.fillRect(0,0,W,H);
  const ring=1.83;let k=0;for(let m=0;m<L;m+=ring,k++){const y0=H*(1-(m+ring)/L),y1=H*(1-m/L);const sh=rnd(-14,14);x.fillStyle=`rgb(${182+sh|0},${187+sh|0},${193+sh|0})`;x.fillRect(0,y0,W,y1-y0);
   // brushed grain
   for(let i=0;i<120;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*0.05})`;x.fillRect(0,rnd(y0,y1),W,1);}
   rx.fillStyle=`rgb(${60+rnd(-15,15)|0},0,0)`.replace(/,0,0\)/,`,${60|0},${60|0})`);rx.fillRect(0,y0,W,y1-y0);
   // circumferential weld (darker bead with heat tint)
   x.fillStyle='rgba(70,60,50,0.55)';x.fillRect(0,y0-2,W,4);x.fillStyle='rgba(170,130,70,0.18)';x.fillRect(0,y0-7,W,14);rx.fillStyle='#909090';rx.fillRect(0,y0-3,W,6);bead(0,y0-2,W,4);
   // vertical welds, staggered per ring (3 sheets per ring)
   for(let s=0;s<3;s++){const u=((s/3+(k%2)*0.17)%1)*W;x.fillStyle='rgba(70,60,50,0.5)';x.fillRect(u,y0,3,y1-y0);x.fillStyle='rgba(170,130,70,0.15)';x.fillRect(u-5,y0,13,y1-y0);bead(u,y0,3,y1-y0);}}
  // grime, streaks, frost marks
  for(let i=0;i<5000;i++){x.fillStyle=`rgba(40,35,30,${Math.random()*0.04})`;x.fillRect(rnd(0,W),rnd(0,H),rnd(1,3),rnd(20,260));}
  if(o.soot){const g=x.createLinearGradient(0,H,0,H*0.8);g.addColorStop(0,'rgba(30,28,25,0.8)');g.addColorStop(1,'rgba(30,28,25,0)');x.fillStyle=g;x.fillRect(0,H*0.8,W,H*0.2);
   const g2=x.createLinearGradient(0,H*0.82,0,H*0.6);g2.addColorStop(0,'rgba(150,110,60,0.25)');g2.addColorStop(1,'rgba(60,80,140,0)');x.fillStyle=g2;x.fillRect(0,H*0.6,W,H*0.22);}
  x.font='bold 30px Arial';x.fillStyle='rgba(20,20,20,0.75)';for(const [u,v,t] of o.labels||[])x.fillText(t,u*W,v*H);
  const ds=k=>{if(!(window.matchMedia&&matchMedia('(pointer:coarse)').matches))return k;const d=document.createElement('canvas');d.width=k.width/2;d.height=k.height/2;d.getContext('2d').drawImage(k,0,0,d.width,d.height);return d;}; // PREVIEW5: iPhone gets 512x2048 hull maps (4x less GPU memory)
  cache[key]={map:tex(ds(c)),rough:dtex(ds(r)),bump:dtex(bc)};return cache[key];}
 // hexagonal TPS tiles (pinned, gaps, a few missing / replaced lighter tiles)
 function tiles(){if(cache.tiles)return cache.tiles;const W=1024,H=1024;const [c,x]=cv(W,H),[r,rx]=cv(W,H);x.fillStyle='#050506';x.fillRect(0,0,W,H);rx.fillStyle='#ffffff';rx.fillRect(0,0,W,H);
  const s=16,hh=s*Math.sqrt(3);for(let row=0;row*hh/2<H+hh;row++)for(let col=0;col*s*3<W+s*3;col++){const cx=col*s*3+(row%2)*s*1.5,cy=row*hh/2;
   const miss=Math.random()<0.006,light=Math.random()<0.01;const l=miss?150:light?82:34+Math.random()*18;x.fillStyle=miss?'#9a9fa4':`rgb(${l|0},${l|0},${l+2|0})`;
   x.beginPath();for(let i=0;i<6;i++){const a=i/6*PI*2;x.lineTo(cx+Math.cos(a)*(s-1.3),cy+Math.sin(a)*(s-1.3));}x.closePath();x.fill();
   x.strokeStyle='rgba(150,155,160,0.22)';x.lineWidth=1.2;x.beginPath();for(let i=3;i<=6;i++){const a=i/6*PI*2;x.lineTo(cx+Math.cos(a)*(s-1.9),cy+Math.sin(a)*(s-1.9));}x.stroke();x.fillStyle='rgba(0,0,0,0.5)';x.beginPath();x.arc(cx,cy,1.1,0,PI*2);x.fill(); // lit upper bevel edge + centre retention pin
   rx.fillStyle=miss?'#555':`rgb(${200+Math.random()*40|0},0,0)`;rx.fill();}
  cache.tiles={map:tex(c,[22,30]),rough:dtex(r)};cache.tiles.rough.wrapT=T.RepeatWrapping;cache.tiles.map.wrapT=T.RepeatWrapping;cache.tiles.rough.repeat.set(22,30);return cache.tiles;}
 const MAT={};
 const mat=(k,f)=>MAT[k]||(MAT[k]=f());
 // ---------- grid fins (real lattice) ----------
 function gridLattice(w,h,n,m,t,depth){const g=new T.Group();const bars=[];const L=Math.hypot(w,h);
  const im=new T.InstancedMesh(new T.BoxGeometry(1,1,1),m,n*6+8);let k=0;const o=new T.Object3D();
  const put=(y,z,sy,sz,rx)=>{o.position.set(0,y,z);o.rotation.set(rx,0,0);o.scale.set(depth,sy,sz);o.updateMatrix();im.setMatrixAt(k++,o.matrix);};
  // 45-degree crossed blades, clipped exactly to the frame rectangle
  const step=(w+h)/(n*1.6);for(const sg of[1,-1])for(let c=-w/2-h;c<=w/2+h;c+=step){const P=[];
   for(const z of[-w/2,w/2]){const y=sg*z+c;if(y>=0&&y<=h)P.push([z,y]);}for(const y of[0,h]){const z=sg*(y-c);if(z>-w/2&&z<w/2)P.push([z,y]);}
   if(P.length<2)continue;const [a,b]=P;const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<0.05)continue;if(k>=im.count-0)break;put((a[1]+b[1])/2,(a[0]+b[0])/2,L,t,sg>0?PI/4:-PI/4);}
  im.count=k;g.add(im);
  // frame
  add(g,new T.BoxGeometry(depth*1.05,t*3,w),m,0,0,0);add(g,new T.BoxGeometry(depth*1.05,t*3,w),m,0,h,0);add(g,new T.BoxGeometry(depth*1.05,h,t*3),m,0,h/2,-w/2);add(g,new T.BoxGeometry(depth*1.05,h,t*3),m,0,h/2,w/2);
  return g;}
 // F9 grid fin: titanium, ~1.2 x 1.5 m; stowed pointing +Y, deploy rotation.z -> -PI/2 (game convention)
 function f9Fin(){ // Block 5 cast titanium: tapered thick frame, dense deep lattice, heat tint + soot, hinge, actuator pod, interstage mount fairing
  const m=mat('ti5',()=>{const [c,x]=cv(256,256);const g=x.createLinearGradient(0,0,256,256);g.addColorStop(0,'#7c7a76');g.addColorStop(0.45,'#6a655e');g.addColorStop(0.7,'#5b5067');g.addColorStop(1,'#4a4038');x.fillStyle=g;x.fillRect(0,0,256,256);
   for(let i=0;i<500;i++){x.fillStyle=`rgba(${Math.random()<0.6?'20,18,16':'150,120,80'},${Math.random()*0.12})`;x.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*6,2+Math.random()*20);}
   const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:t,color:0xffffff,metalness:0.8,roughness:0.5});});
  const dk=mat('ti5dk',()=>new T.MeshStandardMaterial({color:0x2a2928,metalness:0.6,roughness:0.6}));
  const g=new T.Group();const W=1.2,H=1.55,D=0.36;
  const lat=gridLattice(W-0.06,H-0.06,11,m,0.04,D);lat.position.set(0.25,0.18,0);g.add(lat);
  // tapered frame: thick root rail, thinner tip rail, side rails as wedges
  add(g,new T.BoxGeometry(D*1.25,0.11,W+0.08),m,0.25,0.16,0);add(g,new T.BoxGeometry(D*1.1,0.06,W+0.04),m,0.25,0.18+H-0.03,0);
  for(const sz of[-1,1]){const r=new T.Mesh(new T.CylinderGeometry(0.045,0.075,H,4,1),m);r.rotation.y=PI/4;r.scale.set(D*9,1,1);r.position.set(0.25,0.18+H/2,sz*(W/2+0.02));g.add(r);}
  // hinge shaft + clevis, actuator pod and interstage mount fairing
  const hg=new T.Mesh(new T.CylinderGeometry(0.07,0.07,0.7,14),dk);hg.rotation.x=PI/2;hg.position.set(0.12,0.12,0);g.add(hg);
  for(const z of[-0.28,0.28])add(g,new T.BoxGeometry(0.22,0.2,0.08),dk,0.16,0.12,z);
  const pod=new T.Mesh(new T.CylinderGeometry(0.17,0.2,0.62,16),dk);pod.position.set(0.02,-0.25,0);g.add(pod);
  const fr=new T.Mesh(new T.SphereGeometry(0.42,20,12,0,PI*2,0,PI/2),dk);fr.scale.set(0.5,1.1,0.9);fr.rotation.z=-PI/2;fr.position.set(-0.02,0.0,0);g.add(fr);
  return g;}
 // F9 landing leg: carbon composite A-frame with pusher, stowed along body (+Y), inner rotates to deploy
 function f9Leg(){const outer=new T.Group(),inner=new T.Group();inner.name='grLegInner';outer.add(inner);
  const cf=mat('legcf',()=>new T.MeshStandardMaterial({map:carbon('cfleg'),color:0x9a9a9a,roughness:0.55,metalness:0.2}));
  const sh=new T.Shape();sh.moveTo(-0.55,0);sh.lineTo(0.55,0);sh.lineTo(0.22,9.6);sh.lineTo(-0.22,9.6);sh.closePath();
  const geo=new T.ExtrudeGeometry(sh,{depth:0.32,bevelEnabled:true,bevelThickness:0.04,bevelSize:0.04,bevelSegments:2}).rotateY(PI/2).translate(0.0,0,0);
  add(inner,geo,cf,0.05,0,0);add(inner,new T.BoxGeometry(0.06,9.2,0.7),0x0d0d0e,0.37,4.8,0,{roughness:0.6}); // center rib
  add(inner,new T.CylinderGeometry(0.42,0.5,0.18,20),0x202022,0.25,9.65,0,{metalness:0.6,roughness:0.5}); // foot pad
  add(inner,new T.CylinderGeometry(0.11,0.11,5.8,10),0xb8bcc0,-0.05,5.6,0,{metalness:1,roughness:0.25}); // telescoping pusher
  add(inner,new T.CylinderGeometry(0.16,0.16,0.6,12).rotateX(PI/2),0x333335,0,0,0,{metalness:0.8,roughness:0.4}); // hinge
  return outer;}
 // ---------- Falcon 9 Block 5 ----------
 function f9(){const g=new T.Group(),s1=new T.Group(),s2=new T.Group(),fair=new T.Group();const R=1.83;
  const sk=f9s1();const body=new T.MeshStandardMaterial({map:sk.map,roughnessMap:sk.rough,bumpMap:sk.bump,bumpScale:0.6,roughness:0.62,metalness:0.08,envMapIntensity:0.9});
  add(s1,new T.CylinderGeometry(R,R,38.4,72,1,true),body,0,2.8+19.2,0);
  // octaweb / engine section with thermal blanket + heat shield
  const blk=mat('blk',()=>new T.MeshStandardMaterial({color:0x2b2a28,roughness:0.85,metalness:0.2}));
  add(s1,new T.CylinderGeometry(R,R*0.995,1.25,72,1,true),blk,0,2.15,0);add(s1,new T.CylinderGeometry(R*1.004,R*1.004,0.12,72),0x1a1918,0,2.8,0,{roughness:0.7});
  add(s1,new T.CylinderGeometry(R*0.99,R*0.99,0.14,72),M(0x3a3632,{roughness:0.9,metalness:0.1}),0,1.52,0);
  // octaweb structure visible beneath shield
  for(let i=0;i<8;i++){const a=i/8*PI*2;const b=add(s1,new T.BoxGeometry(1.6,0.25,0.12),0x5a5c60,Math.cos(a)*0.8,1.42,Math.sin(a)*0.8,{metalness:0.9,roughness:0.4});b.rotation.y=-a;}
  // 9 Merlin 1D (octaweb: 8 + center); gengine raptor() adds regen bells, pumps, gimbal pivots
  const glows=[];for(let i=0;i<9;i++){const a=i/8*PI*2,r=i===8?0:1.24;glows.push(raptor(s1,i===8?0:Math.cos(a)*r,1.35,i===8?0:Math.sin(a)*r,0.46,1.5));}
  // raceways + pressurization lines + GSE umbilical plates
  const rw=mat('rw',()=>new T.MeshStandardMaterial({color:0xe8e9ea,roughness:0.6,metalness:0.1}));
  for(const a of[PI/2,-PI/2]){const b=add(s1,new T.BoxGeometry(0.22,38,0.36),rw,Math.cos(a)*(R+0.09),22,Math.sin(a)*(R+0.09));b.rotation.y=-a;
   for(let y=4;y<41;y+=2.74){add(s1,new T.BoxGeometry(0.06,0.08,0.42),0x777777,Math.cos(a)*(R+0.21),y,Math.sin(a)*(R+0.21)).rotation.y=-a;}}
  add(s1,new T.BoxGeometry(0.1,0.9,0.7),0x555555,R+0.04,3.6,0.6,{metalness:0.6});add(s1,new T.BoxGeometry(0.1,0.9,0.7),0x555555,R+0.04,3.6,-0.6,{metalness:0.6});
  // composite interstage (black) 41.2..47.8 with cold-gas thruster pods
  const ist=new T.MeshStandardMaterial({map:carbon('ist'),roughness:0.5,metalness:0.25,envMapIntensity:1.2});
  add(s1,new T.CylinderGeometry(R*1.003,R*1.003,6.6,72,1,true),ist,0,44.5,0);add(s1,new T.CylinderGeometry(R*1.01,R*1.01,0.18,72),0x0b0b0b,0,41.25,0);add(s1,new T.CylinderGeometry(R*1.012,R*1.012,0.12,72),0x2d2d2d,0,47.75,0,{metalness:0.7});
  for(const a of[0,PI]){const p=add(s1,new T.BoxGeometry(0.25,0.6,0.5),0x121212,Math.cos(a)*(R+0.1),46.3,Math.sin(a)*(R+0.1));p.rotation.y=-a;for(let j=-1;j<=1;j+=2)add(s1,new T.CylinderGeometry(0.04,0.07,0.15,8).rotateZ(PI/2),0x888888,Math.cos(a)*(R+0.26),46.3+j*0.15,Math.sin(a)*(R+0.26));}
  // grid fins + legs (must be direct children of s1)
  const fins=[],legs=[];for(let i=0;i<4;i++){const a=i*PI/2+PI/4;
   const f=new T.Group();f.position.set(Math.cos(a)*R,45.4,Math.sin(a)*R);f.rotation.y=-a;f.add(f9Fin());fins.push(f);s1.add(f);
   const l=new T.Group();l.position.set(Math.cos(a)*(R+0.12),2.0,Math.sin(a)*(R+0.12));l.rotation.y=-a;l.add(f9Leg());legs.push(l);s1.add(l);}
  s1.userData={fins,legs,glows};
  // second stage: MVac (niobium skirt, glows dull grey) + tank
  const s2g=[raptor(s2,0,47.9,0,1.25,3.2,true)];
  const payload=(typeof settings!=='undefined'&&settings.f9Payload)||'dragon';const s2top=payload==='dragon'?61.0:57.6;
  const s2m=new T.MeshStandardMaterial({map:whiteSkin('s2_'+payload,s2top-47.8,[[0.2,0.5,'LOX'],[0.6,0.85,'RP-1']]),roughness:0.55,metalness:0.08});
  add(s2,new T.CylinderGeometry(R,R,s2top-47.8,72,1,true),s2m,0,(s2top+47.8)/2,0);add(s2,new T.CylinderGeometry(R*0.98,R*0.98,0.2,48),0x9a9a9a,0,47.8,0,{metalness:0.8});
  for(const a of[PI/2,-PI/2]){const b=add(s2,new T.BoxGeometry(0.18,s2top-48.5,0.3),rw,Math.cos(a)*(R+0.08),(s2top+48.2)/2,Math.sin(a)*(R+0.08));b.rotation.y=-a;}
  if(payload==='dragon')crewDragon(s2,s2top);else fairing(fair,s2,s2top);
  g.add(s1,s2,fair);g.userData={s1,s2,fair,s2base:47};return g;}
 function crewDragon(p,y0){const R=1.83;const w=mat('drw',()=>new T.MeshStandardMaterial({color:0xf4f5f6,roughness:0.42,metalness:0.05,envMapIntensity:1}));
  // trunk 3.7 m with body-mounted solar cells on one half + 4 aero fins
  const [c,x]=cv(1024,256);x.fillStyle='#f2f3f4';x.fillRect(0,0,1024,256);x.fillStyle='#0d1424';x.fillRect(0,18,512,220);x.strokeStyle='rgba(120,140,190,0.35)';for(let i=0;i<512;i+=16){x.beginPath();x.moveTo(i,18);x.lineTo(i,238);x.stroke();}for(let j=18;j<238;j+=20){x.beginPath();x.moveTo(0,j);x.lineTo(512,j);x.stroke();}
  x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(0,0,1024,3);x.fillRect(0,253,1024,3);
  const tm=new T.MeshStandardMaterial({map:tex(c),roughness:0.35,metalness:0.3});add(p,new T.CylinderGeometry(R,R,3.7,72,1,true),tm,0,y0+1.85,0);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4;const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(0,1.8);sh.lineTo(0.65,0.4);sh.lineTo(0.65,0);sh.closePath();
   const f=add(p,new T.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:false}).translate(0,0,-0.03),w,Math.cos(a)*R,y0+0.1,Math.sin(a)*R);f.rotation.y=-a;}
  // capsule: sidewall 15 deg, 4.0 m dia base, ~4.4 m tall incl nose cone
  const y1=y0+3.7;add(p,new T.CylinderGeometry(1.86,1.86,0.25,72),M(0x1a1714,{roughness:0.9}),0,y1+0.12,0); // PICA-X heat shield rim (trunk-capsule)
  const pts=[[1.86,0],[1.86,0.25],[1.6,1.3],[1.2,2.75],[1.02,3.05],[0.0,3.12]].map(([r,h])=>new T.Vector2(r,h));
  const [cc,cx]=cv(2048,512);cx.fillStyle='#f4f5f6';cx.fillRect(0,0,2048,512);for(let i=0;i<1600;i++){cx.fillStyle=`rgba(0,0,0,${Math.random()*0.025})`;cx.fillRect(rnd(0,2048),rnd(0,512),rnd(2,20),rnd(2,6));}
  // backshell panel lines, windows, SuperDraco pod doors, logo text
  cx.strokeStyle='rgba(0,0,0,0.25)';cx.lineWidth=2;for(let i=0;i<16;i++){cx.beginPath();cx.moveTo(i*128,120);cx.lineTo(i*128,512);cx.stroke();}
  cx.beginPath();cx.moveTo(0,250);cx.lineTo(2048,250);cx.stroke();
  for(let i=0;i<4;i++){const u=i*512+256;cx.fillStyle='#151820';cx.fillRect(u-46,300,92,80);cx.strokeStyle='rgba(0,0,0,0.5)';cx.strokeRect(u-60,288,120,104);
   cx.fillStyle='rgba(0,0,0,0.3)';cx.fillRect(u+150,170,70,150);cx.fillRect(u+150,330,70,90);} // SuperDraco pod hatches
  for(let i=0;i<2;i++){const u=i*1024+600;cx.fillStyle='#0a0c12';cx.beginPath();cx.ellipse(u,230,28,22,0,0,7);cx.fill();cx.strokeStyle='#666';cx.lineWidth=5;cx.stroke();} // windows
  cx.font='bold 54px "Helvetica Neue",Arial';cx.fillStyle='#1c1e22';cx.fillText('D R A G O N',800,440);cx.font='bold 26px Arial';cx.fillText('SPACEX',1500,440);
  const cm=new T.MeshStandardMaterial({map:tex(cc),roughness:0.4,metalness:0.05});const cap=new T.Mesh(new T.LatheGeometry(pts,96),cm);cap.position.y=y1;p.add(cap);
  // Draco thruster quads
  for(let i=0;i<4;i++){const a=i*PI/2+0.3;for(let j=0;j<2;j++)add(p,new T.CylinderGeometry(0.04,0.06,0.1,8).rotateZ(PI/2),0x303030,Math.cos(a+j*0.08)*1.55,y1+1.6,Math.sin(a+j*0.08)*1.55).rotation.y=-a;}
  // hinged nose cone (open slightly forward like on ascent: closed)
  const nc=new T.LatheGeometry([[1.03,0],[1.0,0.45],[0.82,0.8],[0.5,1.0],[0,1.05]].map(([r,h])=>new T.Vector2(r,h)),72);add(p,nc,w,0,y1+3.0,0);
  add(p,new T.CylinderGeometry(1.035,1.035,0.06,72),0x8f9296,0,y1+3.02,0,{metalness:0.8});}
 function fairing(fair,s2,y0){const R=1.83,FR=2.6;const [c,x]=cv(1024,2048);x.fillStyle='#f5f6f7';x.fillRect(0,0,1024,2048);
  for(let i=0;i<3000;i++){x.fillStyle=`rgba(0,0,0,${Math.random()*0.02})`;x.fillRect(rnd(0,1024),rnd(0,2048),rnd(2,40),rnd(2,6));}
  x.fillStyle='rgba(0,0,0,0.45)';x.fillRect(255,0,4,2048);x.fillRect(767,0,4,2048);x.fillStyle='rgba(0,0,0,0.2)';for(let y=200;y<2048;y+=380)x.fillRect(0,y,1024,2);
  x.save();x.translate(420,1250);x.rotate(PI/2);x.font='bold 120px "Helvetica Neue",Arial';x.fillStyle='#16181c';x.fillText('S P A C E X',0,0);x.restore();
  const fm=new T.MeshStandardMaterial({map:tex(c),roughness:0.45,metalness:0.05});
  add(s2,new T.CylinderGeometry(R*1.01,R*1.01,0.3,72),0x222222,0,y0,0);
  const pts=[[R,0],[FR,1.4],[FR,6.6]];for(let i=1;i<=20;i++){const t=i/20;pts.push([FR*Math.sqrt(1-t*t*0.98)*Math.pow(1-t,0.05),6.6+t*5.8]);}pts.push([0,12.45]);
  const m=new T.Mesh(new T.LatheGeometry(pts.map(([r,h])=>new T.Vector2(r,h)),96),fm);m.position.y=y0;fair.add(m);}
 // ---------- Super Heavy / Starship ----------
 function shFin(){if(window.SH_GRIDFIN)return SH_GRIDFIN.build();const m=mat('shfin',()=>new T.MeshStandardMaterial({color:0x6d7175,metalness:0.9,roughness:0.42}));const outer=new T.Group(),inner=new T.Group();inner.name='grFixed';outer.add(inner);
  // ~ 4.3 x 3.2 m steel grid fin, fixed out (horizontal) on Super Heavy
  const L=gridLattice(4.2,3.0,10,m,0.06,0.55);L.rotation.z=-PI/2;L.position.set(0.3,0,0);inner.add(L);
  add(inner,new T.BoxGeometry(0.8,1.6,1.6),0x3b3e42,0.25,-0.3,0,{metalness:0.8,roughness:0.5});return outer;}
 function superHeavy(s1){const R=4.5;const sk=steel('sh',70.6,{soot:true,labels:[[0.05,0.93,'B14-2'],[0.55,0.97,'GSE QD'],[0.3,0.4,'LOX'],[0.3,0.75,'CH4']]});
  const st=new T.MeshStandardMaterial({map:sk.map,roughnessMap:sk.rough,bumpMap:sk.bump,bumpScale:1.2,color:0xffffff,metalness:0.55,roughness:0.85,envMapIntensity:1.5});
  add(s1,new T.CylinderGeometry(R,R,67.6,96,1,true),st,0,3+33.8,0);
  // ring stiffeners (external lip at each weld) + stringers
  const rs=mat('rstiff',()=>new T.MeshStandardMaterial({color:0xa9aeb3,metalness:1,roughness:0.3}));
  for(let y=3+1.83;y<70.6;y+=1.83){const t=new T.Mesh(new T.TorusGeometry(R+0.012,0.03,4,96).rotateX(PI/2),rs);t.position.y=y;s1.add(t);}
  // aft skirt + engine shielding
  const dk=mat('shdark',()=>new T.MeshStandardMaterial({color:0x2a2b2d,metalness:0.6,roughness:0.6}));
  add(s1,new T.CylinderGeometry(R,R,3,96,1,true),dk,0,1.5,0);add(s1,new T.CylinderGeometry(R*0.99,R*0.99,0.3,96),dk,0,0.3,0);
  for(let i=0;i<20;i++){const a=(i+0.5)/20*PI*2;add(s1,new T.BoxGeometry(0.5,2.6,0.25),0x1e1f21,Math.cos(a)*(R+0.05),1.5,Math.sin(a)*(R+0.05),{metalness:0.6}).rotation.y=-a;} // outer engine shield bumps
  // 33 Raptor 2: 3 centre + 10 inner gimbal + 20 outer fixed
  const glows=[];const ring=(n,r,off)=>{for(let k=0;k<n;k++){const a=k/n*PI*2+off;glows.push(raptor(s1,Math.cos(a)*r,0.9,Math.sin(a)*r,0.65,2.1));}};ring(3,0.95,0);ring(10,2.45,0.1);ring(20,3.85,0.05);
  // chines / raceways, QD plate, chopstick catch pins (hardpoints), COPV pods
  for(const a of[0.35,0.35+PI]){add(s1,new T.BoxGeometry(0.5,62,0.7),st,Math.cos(a)*(R+0.2),37,Math.sin(a)*(R+0.2)).rotation.y=-a;}
  add(s1,new T.BoxGeometry(0.25,2.2,2.6),0x55595d,-(R+0.1),4.2,0,{metalness:0.8});
  for(const a of[PI/2,-PI/2]){const p=add(s1,new T.BoxGeometry(1.0,0.9,1.4),0x3d4044,Math.cos(a)*(R+0.5),66.6,Math.sin(a)*(R+0.5),{metalness:0.85,roughness:0.4});p.rotation.y=-a;
   add(s1,new T.CylinderGeometry(0.28,0.28,0.6,16).rotateZ(PI/2),0xc4c8cc,Math.cos(a)*(R+1.2),66.6,Math.sin(a)*(R+1.2),{metalness:1,roughness:0.2}).rotation.y=-a;}
  // grid fins (direct children)
  const fins=[];for(let i=0;i<4;i++){const a=i*PI/2+PI/4;const f=new T.Group();f.position.set(Math.cos(a)*R,67.4,Math.sin(a)*R);f.rotation.y=-a;f.add(shFin());fins.push(f);s1.add(f);}
  // forward dome cap + hot-staging ring (vented interstage)
  add(s1,new T.CylinderGeometry(R,R,0.25,96),st,0,70.6,0);
  const hs=new T.Group();hs.position.y=70.6;s1.add(hs);add(hs,new T.CylinderGeometry(R*0.97,R*0.97,2.4,96,1,true),M(0x0d0d0e,{roughness:0.9,side:THREE.DoubleSide}),0,1.2,0);
  add(hs,new T.CylinderGeometry(R,R,0.35,96,1,true),st,0,0.18,0);add(hs,new T.CylinderGeometry(R,R,0.35,96,1,true),st,0,2.22,0);
  for(let i=0;i<36;i++){const a=i/36*PI*2;add(hs,new T.BoxGeometry(0.3,1.75,0.42),st,Math.cos(a)*(R-0.1),1.2,Math.sin(a)*(R-0.1)).rotation.y=-a;}
  add(hs,new T.SphereGeometry(R*0.95,48,12,0,PI*2,0,PI*0.22),M(0x707478,{metalness:0.9,roughness:0.5}),0,-3.6,0); // heat shield dome
  s1.userData={fins,legs:[],glows};}
 function ship(s2){const R=4.5;const sk=steel('ss',48,{labels:[[0.78,0.6,'S33'],[0.82,0.35,'SPACEX']]});
  const st=new T.MeshStandardMaterial({map:sk.map,roughnessMap:sk.rough,bumpMap:sk.bump,bumpScale:1.2,color:0xffffff,metalness:0.55,roughness:0.85,envMapIntensity:1.6});
  const tl=tiles();const TM=new T.MeshStandardMaterial({map:tl.map,roughnessMap:tl.rough,roughness:0.95,metalness:0.0,emissive:new T.Color(0)});const tmR=(u,v)=>{const m=TM.clone();m.map=tl.map.clone();m.roughnessMap=tl.rough.clone();m.bumpMap=m.map;m.bumpScale=0.6;for(const t of[m.map,m.roughnessMap]){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(u,v);t.needsUpdate=true;}return m;};const TMB=tmR(1.2,2.6),TMF=tmR(0.077,0.09);
  // aft skirt with RVac shrouds
  add(s2,new T.CylinderGeometry(R,R,1.6,96,1,true),st,0,73.8,0);add(s2,new T.CylinderGeometry(R*0.99,R*0.99,0.2,96),0x2a2b2e,0,73.05,0);
  const glows=[];for(let i=0;i<3;i++){const a=i/3*PI*2;glows.push(raptor(s2,Math.cos(a)*1.3,73.5,Math.sin(a)*1.3,0.65,2.1));}
  for(let i=0;i<3;i++){const a=i/3*PI*2+PI/3;glows.push(raptor(s2,Math.cos(a)*3.05,74.0,Math.sin(a)*3.05,1.15,3.4));}
  // barrel 74.6..103, nose ogive 103..121 (18 m), total ship ~50 m incl. engines
  add(s2,new T.CylinderGeometry(R,R,28.4,96,1,true),st,0,74.6+14.2,0);
  const rs=mat('rstiff',()=>null)||new T.MeshStandardMaterial({color:0xa9aeb3,metalness:1,roughness:0.3});
  for(let y=74.6+1.83;y<103;y+=1.83){const t=new T.Mesh(new T.TorusGeometry(R+0.012,0.03,4,96,PI).rotateX(PI/2),rs);t.position.y=y;t.rotation.y=0;s2.add(t);}
  const np=[];for(let i=0;i<=40;i++){const t=i/40;np.push(new T.Vector2(Math.max(0.001,R*Math.pow(1-Math.pow(t,1.85),0.62)),t*18));}
  add(s2,new T.LatheGeometry(np,96),st,0,103,0);
  // windward heat shield (tile half, theta PI..2PI => -x side), also on nose
  const hs=new T.Mesh(new T.CylinderGeometry(R+0.04,R+0.04,30.2,96,1,true,PI*0.97,PI*1.06),TMB);hs.position.y=88.1;s2.add(hs);
  const np2=np.map(v=>new T.Vector2(v.x+0.04,v.y));const hn=new T.Mesh(new T.LatheGeometry(np2,96,PI*0.97,PI*1.06),TMB);hn.position.y=103;s2.add(hn);const tip=new T.Mesh(new T.LatheGeometry(np2.slice(35),96),TMB);tip.position.y=103;s2.add(tip);
  // flaps: 2 aft (large), 2 forward (small, swept), steel leeward faces, tiled windward faces; hinges & aerocovers
  const flap=(w,h,root,z,y,fwd)=>{const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(0,h);sh.lineTo(w,h-(fwd?h*0.55:root));sh.lineTo(w,fwd?h*0.1:0.4);sh.closePath();
   const geo=new T.ExtrudeGeometry(sh,{depth:0.45,bevelEnabled:true,bevelThickness:0.08,bevelSize:0.08,bevelSegments:2});geo.translate(0,0,-0.22);
   const f=new T.Group();const zz=Math.sign(z);f.position.set(-0.9,y,zz*(R-0.15));
   const a=new T.Mesh(geo,[st,st]);a.rotation.y=zz>0?-PI/2:PI/2;f.add(a);
   const tw=new T.Mesh(new T.ShapeGeometry(sh),TMF);tw.rotation.y=zz>0?-PI/2:PI/2;if(zz<0)tw.scale.z=-1;tw.position.x=-0.38;tw.material.side=T.DoubleSide;f.add(tw); // tiled windward face, flap-shaped
   add(f,new T.BoxGeometry(1.4,h*0.92,1.1),[st,TMF,st,st,st,st],0.2,h/2,0);f.name='grFlap'+(fwd?'F':'A')+(zz>0?'p':'n');s2.add(f);return f;};
  flap(4.6,10.5,2.2,1,75.2,false);flap(4.6,10.5,2.2,-1,75.2,false);flap(2.9,7.2,0,1,108.3,true);flap(2.9,7.2,0,-1,108.3,true);
  // ship catch pins, header-tank vent, RCS thrusters, QD
  for(const z of[1,-1]){add(s2,new T.BoxGeometry(0.9,0.8,1.2),0x3d4044,0,104.5,z*(R*0.92),{metalness:0.85});}
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4;add(s2,new T.CylinderGeometry(0.12,0.18,0.3,10).rotateZ(PI/2),0x333333,Math.cos(a)*(R+0.1),100.5,Math.sin(a)*(R+0.1)).rotation.y=-a;}
  add(s2,new T.BoxGeometry(0.3,1.6,2.2),0x55595d,R+0.12,75.8,0,{metalness:0.8});
  // chines along barrel
  for(const z of[1,-1])add(s2,new T.BoxGeometry(0.8,27,0.35),st,-0.6,88.5,z*(R+0.05));
  s2.userData={shield:hs,glows};}
 function starship(){const g=new T.Group(),s1=new T.Group(),s2=new T.Group(),fair=new T.Group();superHeavy(s1);ship(s2);g.add(s1,s2,fair);g.userData={s1,s2,fair,s2base:73};return g;}
 return {f9,starship,tiles};})();
f9Model=GR.f9;starshipModel=GR.starship;
// re-apply pad visuals if a model already exists
// ---- leg deploy (real F9 legs swing ~125 deg down/out) and Super Heavy fixed grid fins ----
{const _u=updRocket;updRocket=function(v,dt){_u(v,dt);const fix=(root)=>{if(!root)return;root.traverse(o=>{if(o.name==='grLegInner'){const p=o.parent.parent;const k=Math.min(1,Math.max(0,p.rotation.z/0.55));o.rotation.z=-p.rotation.z-k*2.2;}
  else if(o.name==='grFixed'){o.rotation.z=-o.parent.parent.rotation.z;}});};
 if(typeof rec!=='undefined'){for(const k of['booster','shipDS'])if(rec[k]&&rec[k].mesh)fix(rec[k].mesh);}};}
// ---- plumes: Merlin kerolox (orange, sooty edge, shock diamonds) / Raptor methalox (clear blue-violet, pink diamonds) ----
{const fs=`uniform float uT,uI,uVac,uMeth;varying vec2 vU;varying vec3 vN,vV;
 float h(float n){return fract(sin(n)*43758.5);}float ns(float x){float i=floor(x),f=fract(x);return mix(h(i),h(i+1.),f*f*(3.-2.*f));}
 void main(){float y=1.-vU.y;float rim=abs(dot(vN,vV));float core=pow(rim,uMeth>0.5?3.2:2.0);float sl=1.-uVac;
  float sp=mix(10.,24.,y);float dz=fract(y*sp*1.6);float dia=sl*pow(1.-abs(dz-0.5)*2.,8.)*smoothstep(0.6,0.02,y)*pow(rim,4.);
  float fl=0.82+0.18*ns(uT*45.+y*14.)+0.08*ns(uT*110.+vU.x*30.);
  float len=uMeth>0.5?mix(3.4,1.2,uVac):mix(2.0,0.9,uVac);
  float a=core*exp(-y*len)*fl;a*=smoothstep(0.,0.025,y);
  vec3 c;if(uMeth>0.5){float ed=pow(rim,2.2)*(0.75+0.25*ns(uT*6.+y*9.+vU.x*13.));float pr=1.-uVac;
   vec3 core3=vec3(0.62,0.66,1.0),vio=vec3(0.52,0.36,0.95),org=vec3(1.0,0.6,0.24);
   float hot=exp(-y*40.)*pow(rim,2.);float om=smoothstep(0.08,0.5,y)*pr*(1.-rim*0.5);
   vec3 yel=vec3(1.0,0.78,0.42);om=max(om,smoothstep(0.005,0.05,y)*pr);c=mix(mix(core3,vio,smoothstep(0.,0.06,y)),mix(yel,org,smoothstep(0.2,0.8,y)),om)+vec3(0.6,0.62,0.7)*hot*0.5;
   float dd=dia*pow(pr,4.)*0.3*(1.-smoothstep(0.,0.6,abs(vU.x-0.5)));c+=vec3(1.,0.95,1.)*dd;
   c+=vec3(0.25,0.2,0.1)*pow(rim,8.)*(1.-y);a=(ed*exp(-y*(1.9-uVac*0.9))*(0.7+0.3*om)+hot*0.55+dd*0.6)*fl*(1.-uVac*0.6);a*=smoothstep(0.,0.02,y)*(1.-smoothstep(0.75,1.,y));}
  else{vec3 o1=vec3(1.,0.85,0.55),o2=vec3(1.,0.45,0.12),sm=vec3(0.35,0.12,0.04);c=mix(o1,o2,smoothstep(0.03,0.35,y));c=mix(c,sm,smoothstep(0.35,0.9,y)*(1.-core));c=mix(c,vec3(1.,0.98,0.9),core*smoothstep(0.25,0.,y));c+=vec3(1.,0.9,0.7)*dia;a=a*1.1+dia*0.7;}
  if(uMeth>0.5){gl_FragColor=vec4(min(c,vec3(0.97)),clamp(a*uI*1.0,0.,0.8));return;}gl_FragColor=vec4(c*a*uI*2.6,min(1.,a*uI*1.4));}`;
 for(const p of PL){const m=p.material.clone();m.fragmentShader=fs;m.needsUpdate=true;p.material=m;}}
window.__grockets=GR;
// ===================== LC-39A (Crew Dragon era): Fixed Service Structure, Crew Access Arm, TE strongback, lightning mast + catenary, flame trench, water tower =====================
// Real numbers: FSS 40 ft (12.2 m) square, levels every 20 ft from 27 ft, roof 247 ft (75.3 m); lightning mast tip 347 ft (105.8 m); CAA 85 ft (26 m) long at the 217 ft (66 m) level.
const LC39A=(()=>{const T=THREE,PI=Math.PI;const FT=0.3048;const g=new T.Group();g.name='LC-39A';
 const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];};
 const paint=(base,key)=>{const [c,x]=cv(256,256);x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<900;i++){x.fillStyle=`rgba(${Math.random()<0.5?'60,45,30':'255,255,255'},${Math.random()*0.06})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,2+Math.random()*30);}
  for(let i=0;i<60;i++){x.fillStyle=`rgba(110,70,40,${Math.random()*0.18})`;x.fillRect(Math.random()*256,Math.random()*256,2,10+Math.random()*50);} // rust streaks
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
 const STL=new T.MeshStandardMaterial({map:paint('#7d8287'),color:0xffffff,metalness:0.55,roughness:0.72});      // gray-painted Apollo/Shuttle steel
 const STD=new T.MeshStandardMaterial({map:paint('#5a5f64'),color:0xffffff,metalness:0.5,roughness:0.75});
 const WHT=new T.MeshStandardMaterial({map:paint('#eceeef'),color:0xffffff,metalness:0.2,roughness:0.5});
 const GRT=new T.MeshStandardMaterial({color:0x4a4d50,metalness:0.6,roughness:0.8,transparent:true,opacity:0.92});
 const CON=new T.MeshStandardMaterial({map:paint('#a9a69d'),color:0xffffff,roughness:0.95,metalness:0});
 // instanced beam helper
 const beams=[];const B=(a,b,s,m=STL)=>beams.push([a,b,s,m]);
 const flush=(parent)=>{const by=new Map();for(const e of beams){if(!by.has(e[3]))by.set(e[3],[]);by.get(e[3]).push(e);}
  for(const [m,arr] of by){const im=new T.InstancedMesh(new T.BoxGeometry(1,1,1),m,arr.length);const o=new T.Object3D(),up=new T.Vector3(0,1,0);
   arr.forEach(([a,b,s],i)=>{const d=new T.Vector3().subVectors(b,a);const L=d.length();o.position.copy(a).addScaledVector(d,0.5);o.quaternion.setFromUnitVectors(up,d.normalize());o.scale.set(s,L,s);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
   im.castShadow=true;im.receiveShadow=true;parent.add(im);}beams.length=0;};
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 // --- FSS: 3x3 column grid, 12.2 m square, rocket on +x side ---
 const W=40*FT,hw=W/2,TOP=247*FT,fss=new T.Group();
 const cols=[-hw,0,hw];for(const cx of cols)for(const cz of cols)B(V(cx,0,cz),V(cx,TOP,cz),cx===0&&cz===0?0.5:0.75);
 const lv=[0];for(let f=27;f<=247;f+=20)lv.push(f*FT);lv.push(217*FT);lv.sort((a,b)=>a-b);
 for(let i=0;i<lv.length;i++){const y=lv[i];for(const c of cols){B(V(-hw,y,c),V(hw,y,c),0.55);B(V(c,y,-hw),V(c,y,hw),0.55);}
  if(i>0){const y0=lv[i-1];for(const face of[-hw,hw])for(let k=0;k<2;k++){const a=cols[k],b=cols[k+1];B(V(face,y0,a),V(face,y,b),0.32);B(V(face,y0,b),V(face,y,a),0.32);B(V(a,y0,face),V(b,y,face),0.32);B(V(b,y0,face),V(a,y,face),0.32);}}
  // grated floor
  if(i>0){const fl=new T.Mesh(new T.BoxGeometry(W,0.12,W),GRT);fl.position.y=y+0.3;fss.add(fl);}
  // railings
  for(const s of[-1,1]){B(V(-hw-0.6,y+1.1,s*(hw+0.6)),V(hw+0.6,y+1.1,s*(hw+0.6)),0.06,STD);B(V(s*(hw+0.6),y+1.1,-hw-0.6),V(s*(hw+0.6),y+1.1,hw+0.6),0.06,STD);}}
 // stairs (switchback, on -z face, outside)
 for(let i=1;i<lv.length;i++){const y0=lv[i-1],y1=lv[i],z=-hw-1.4,mid=(y0+y1)/2;B(V(-hw+0.5,y0,z),V(0,mid,z),0.5,STD);B(V(0,mid,z-1.2),V(-hw+0.5,y1,z-1.2),0.5,STD);
  const lnd=new T.Mesh(new T.BoxGeometry(1.4,0.15,2.6),GRT);lnd.position.set(0.6,mid,z-0.6);fss.add(lnd);}
 // elevator shaft (enclosed) on -x/+z corner + machine house
 {const e=new T.Mesh(new T.BoxGeometry(3,TOP+4,3),STD);e.position.set(-hw+1.6,(TOP+4)/2,hw-1.6);fss.add(e);
  for(let y=6;y<TOP;y+=6){const d=new T.Mesh(new T.BoxGeometry(0.1,2.4,1.6),new T.MeshStandardMaterial({color:0x2a2c2e,roughness:0.6}));d.position.set(-hw+3.15,lv.find(v=>v>=y)||y,hw-1.6);}
  const mh=new T.Mesh(new T.BoxGeometry(4,3,4),STD);mh.position.set(-hw+1.6,TOP+5,hw-1.6);fss.add(mh);}
 // cable trays + pipe runs up the +z face
 for(let k=0;k<4;k++)B(V(-3+k*0.9,0.5,hw+0.5),V(-3+k*0.9,TOP-6,hw+0.5),k<2?0.35:0.22,k<2?STD:WHT);
 // roof: hammerhead crane remnant and lightning mast (80 ft fiberglass on 20 ft steel base) -> tip at 347 ft
 {const roof=new T.Mesh(new T.BoxGeometry(W+1,0.6,W+1),STD);roof.position.y=TOP;fss.add(roof);
  for(const s of[-1,1])B(V(-hw-6,TOP+5.5,s*1.2),V(hw+12,TOP+5.5,s*1.2),0.9,STD);for(const cx of[-hw,hw])for(const cz of[-1.2,1.2])B(V(cx,TOP,cz),V(cx,TOP+5.5,cz),0.6,STD);
  const base=new T.Mesh(new T.CylinderGeometry(1.4,2.2,20*FT,12),STD);base.position.y=TOP+6+3;fss.add(base);
  const mast=new T.Mesh(new T.CylinderGeometry(0.35,1.0,80*FT,16),new T.MeshStandardMaterial({color:0xd6d0bc,roughness:0.55}));mast.position.y=347*FT-40*FT;fss.add(mast);
  const cap=new T.Mesh(new T.CylinderGeometry(0.5,0.5,1.2,12),new T.MeshStandardMaterial({color:0x222222,metalness:0.8}));cap.position.y=347*FT;fss.add(cap);
  // aircraft warning lights
  const lm=new T.MeshBasicMaterial({color:0xff2a1a});for(const y of[TOP+0.8,347*FT+0.8,150*FT])for(const s of[-1,1]){const l=new T.Mesh(new T.SphereGeometry(0.25,8,6),lm);l.position.set(s*hw,y,hw);fss.add(l);}}
 // slidewire escape baskets (moved to 217 ft level): platform + wire anchors
 {const p=new T.Mesh(new T.BoxGeometry(4,0.3,6),GRT);p.position.set(-hw-2.5,217*FT,0);fss.add(p);for(let i=0;i<4;i++){const bk=new T.Mesh(new T.BoxGeometry(1.4,1.3,1.4),new T.MeshStandardMaterial({color:0xd8b23a,roughness:0.6}));bk.position.set(-hw-3.5,217*FT+0.8,-2.1+i*1.4);fss.add(bk);}}
 flush(fss);
 // gray cladding panels (partial, as installed 2018-19) on the -x face upper third
 {const [c,x]=cv(512,1024);x.fillStyle='#8d9196';x.fillRect(0,0,512,1024);for(let y=0;y<1024;y+=64){x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(0,y,512,2);}for(let u=0;u<512;u+=32){x.fillStyle='rgba(0,0,0,0.12)';x.fillRect(u,0,2,1024);}
  for(let i=0;i<400;i++){x.fillStyle=`rgba(60,45,30,${Math.random()*0.12})`;x.fillRect(Math.random()*512,Math.random()*1024,2,10+Math.random()*80);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const cl=new T.Mesh(new T.PlaneGeometry(W,TOP*0.42),new T.MeshStandardMaterial({map:t,metalness:0.6,roughness:0.55,side:T.DoubleSide}));cl.rotation.y=-PI/2;cl.position.set(-hw-0.4,TOP*0.72,0);fss.add(cl);}
 // --- Crew Access Arm: 26 m enclosed white walkway with rectangular windows, hinge on FSS +x face, white room at Dragon hatch ---
 const caa=new T.Group();caa.name='CAA';{const L=24.2;
  const [c,x]=cv(2048,256);x.fillStyle='#eef0f1';x.fillRect(0,0,2048,256);x.fillStyle='rgba(0,0,0,0.18)';for(let u=0;u<2048;u+=128)x.fillRect(u,0,3,256);
  for(let u=40;u<2000;u+=128){const gr=x.createLinearGradient(0,70,0,150);gr.addColorStop(0,'#3d4a58');gr.addColorStop(1,'#101418');x.fillStyle=gr;x.fillRect(u,78,86,64);x.strokeStyle='#9aa0a6';x.lineWidth=3;x.strokeRect(u,78,86,64);}
  x.fillStyle='#c9ccce';x.fillRect(0,0,2048,10);x.fillRect(0,246,2048,10);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;
  const wm=new T.MeshStandardMaterial({map:t,roughness:0.45,metalness:0.15});
  const body=new T.Mesh(new T.BoxGeometry(L,3.2,2.8),[wm,wm,WHT,WHT,wm,wm]);body.position.set(L/2+1.2,0,0);caa.add(body);
  // roof ridge, underside truss, cable carrier
  const rr=new T.Mesh(new T.BoxGeometry(L,0.25,3.0),WHT);rr.position.set(L/2+1.2,1.7,0);caa.add(rr);
  for(let i=0;i<=12;i++){const xx=1.2+i*L/12;B(V(xx,-1.6,-1.3),V(xx,-3.0,0),0.14,WHT);B(V(xx,-1.6,1.3),V(xx,-3.0,0),0.14,WHT);}B(V(1.2,-3.0,0),V(L+1.2,-3.0,0),0.3,WHT);
  for(let i=0;i<12;i++){const x0=1.2+i*L/12,x1=x0+L/12;B(V(x0,-1.6,-1.3),V(x1,-3.0,0),0.08,WHT);B(V(x0,-1.6,1.3),V(x1,-3.0,0),0.08,WHT);}
  flush(caa);
  // hinge / rotary joint on the FSS
  const hg=new T.Mesh(new T.CylinderGeometry(1.1,1.1,5.2,24),STD);hg.position.set(0.4,-0.4,0);caa.add(hg);
  // white room: taller box with flared seal frame matching Dragon hatch
  const wr=new T.Mesh(new T.BoxGeometry(3.6,3.8,3.6),WHT);wr.position.set(L+3.0,0.2,0);caa.add(wr);
  const seal=new T.Mesh(new T.TorusGeometry(1.05,0.18,10,28),new T.MeshStandardMaterial({color:0x2b2b2b,roughness:0.8}));seal.rotation.y=PI/2;seal.position.set(L+4.85,0.1,0);caa.add(seal);
  const win=new T.Mesh(new T.PlaneGeometry(1.2,0.8),new T.MeshStandardMaterial({color:0x1b232c,metalness:0.6,roughness:0.15}));win.position.set(L+3.0,0.6,1.81);caa.add(win);
  const sx=new T.Mesh(new T.PlaneGeometry(1.6,0.3),new T.MeshBasicMaterial({color:0x111111}));sx.position.set(L+3.0,1.55,1.81);caa.add(sx);}
 caa.position.set(hw+0.6,66.1,0);fss.add(caa);
 // --- TE strongback (Falcon 9 transporter-erector) on the opposite side, with hold-down clamps ---
 const te=new T.Group();{const H=58;for(const z of[-1.3,1.3])for(const x of[0,2.4])B(V(x,0,z),V(x,H,z),0.45,STD);
  for(let y=0;y<H;y+=2.4){B(V(0,y,-1.3),V(0,y,1.3),0.2,STD);B(V(2.4,y,-1.3),V(2.4,y,1.3),0.2,STD);B(V(0,y,-1.3),V(2.4,y+2.4,-1.3),0.18,STD);B(V(0,y,1.3),V(2.4,y+2.4,1.3),0.18,STD);}
  for(const y of[12,26,40,47.6,56])for(const s of[-1,1])B(V(0,y,s*1.3),V(-1.4,y,s*1.9),0.22,STD); // umbilical/support arms
  flush(te);
  const tbl=new T.Mesh(new T.CylinderGeometry(3.2,3.6,1.6,32),STD);tbl.position.set(-3.0,0.8,0);te.add(tbl);
  for(let i=0;i<4;i++){const a=i*PI/2+PI/4;const cl=new T.Mesh(new T.BoxGeometry(0.6,1.4,0.8),new T.MeshStandardMaterial({color:0x2f3133,metalness:0.7,roughness:0.5}));cl.position.set(-3.0+Math.cos(a)*1.95,2.2,Math.sin(a)*1.95);cl.rotation.y=-a;te.add(cl);}
  for(let k=0;k<5;k++){const p=new T.Mesh(new T.CylinderGeometry(0.12,0.12,H,8),k%2?WHT:STD);p.position.set(1.2,H/2,-0.8+k*0.4);te.add(p);}}
 te.position.set(3.0+1.83,0,0);// rocket at origin, strongback just +x of it
 // --- pad deck, flame trench + deflector, sound suppression, water tower, catenary ---
 const deck=new T.Group();{const d=new T.Mesh(new T.BoxGeometry(120,1,120),CON);d.position.y=-0.5;deck.add(d);
  const tr=new T.Mesh(new T.BoxGeometry(14,10,140),new T.MeshStandardMaterial({color:0x3a3632,roughness:1}));tr.position.set(-3,-5.4,40);deck.add(tr);
  const dfl=new T.Mesh(new T.CylinderGeometry(7,7,14,24,1,false,0,PI/2).rotateZ(PI/2),new T.MeshStandardMaterial({color:0x2b2724,roughness:0.9,metalness:0.3}));dfl.position.set(-3,-10,-2);deck.add(dfl);
  // rainbirds / sound suppression piping
  const pm=new T.MeshStandardMaterial({color:0xcfd2d4,metalness:0.6,roughness:0.4});for(let i=0;i<6;i++){const a=i/6*PI*2;const p=new T.Mesh(new T.CylinderGeometry(0.5,0.5,22,12).rotateZ(PI/2),pm);p.position.set(Math.cos(a)*14,0.6,Math.sin(a)*14);p.rotation.y=-a;deck.add(p);
   const nz=new T.Mesh(new T.CylinderGeometry(0.6,0.9,3,12),pm);nz.position.set(Math.cos(a)*9,2,Math.sin(a)*9);deck.add(nz);}
  for(let k=0;k<3;k++){const p=new T.Mesh(new T.CylinderGeometry(0.35,0.35,60,10).rotateX(PI/2),k===1?WHT:pm);p.position.set(-16-k*1.2,0.5,-30);deck.add(p);}
  // water tower (~290 ft) to the north
  const wt=new T.Group();for(let i=0;i<6;i++){const a=i/6*PI*2;const l=new T.Mesh(new T.CylinderGeometry(0.4,0.6,70,8),STL);l.position.set(Math.cos(a)*6,35,Math.sin(a)*6);wt.add(l);}
  const tk=new T.Mesh(new T.SphereGeometry(10,32,20),new T.MeshStandardMaterial({map:paint('#e9eae6'),roughness:0.5,metalness:0.2}));tk.scale.y=0.8;tk.position.y=78;wt.add(tk);
  const ct=new T.Mesh(new T.CylinderGeometry(1,1,70,12),STL);ct.position.y=35;wt.add(ct);wt.position.set(-60,0,-150);deck.add(wt);}
 // catenary: cable over the mast to ground anchors 1100 ft north and south
 const cat=new T.Group();{const top=V(-hw-32,347*FT,0);const pts=[];for(const s of[-1,1]){const a=V(top.x,0,s*1100*FT);for(let i=0;i<=40;i++){const t=i/40;const p=new T.Vector3().lerpVectors(top,a,t);p.y-=Math.sin(t*PI)*6;pts.push(p.clone());if(i<40)pts.push(new T.Vector3().lerpVectors(top,a,(i+1)/40).setY(new T.Vector3().lerpVectors(top,a,(i+1)/40).y-Math.sin((i+1)/40*PI)*6));}}
  const geo=new T.BufferGeometry().setFromPoints(pts);cat.add(new T.LineSegments(geo,new T.LineBasicMaterial({color:0x2c2c2c})));
  for(const s of[-1,1]){const an=new T.Mesh(new T.BoxGeometry(3,2,3),CON);an.position.set(top.x,1,s*1100*FT);cat.add(an);}}
 fss.position.set(-(1.83+0.6+26.2+hw),0,0);
 g.add(fss,te,deck,cat);g.userData={caa,fss,te};g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;})();
{LC39A.position.set(PAD.x,10,PAD.z);scene.add(LC39A);
 // hide the old placeholder tower/arm/deck items of padModel
 for(const c of [...pad.children]){const p=c.position;if((p.x<-4&&p.x>-14)||c.geometry&&c.geometry.parameters&&c.geometry.parameters.width===120)c.visible=false,c.userData.grHidden=true;}
 const _s=setupRocketModels;setupRocketModels=function(rk){_s(rk);for(const c of pad.children)if(c.userData.grHidden)c.visible=false;LC39A.visible=rk!=='starship'&&pad.visible!==false;LC39A.userData.caa.rotation.y=0;};
 // CAA swings away (~-PI/2 rotation about its hinge) before launch
 const _u=updRocket;updRocket=function(v,dt){_u(v,dt);const os=v.os;if(!os||!LC39A.visible)return;const c=LC39A.userData.caa;const tgt=(os.launched||os.engine)?-1.45:0;c.rotation.y+=(tgt-c.rotation.y)*Math.min(1,dt*0.6);};}
window.__lc39a=LC39A;
// ===================== Recovery assist: Super Heavy ALWAYS caught by Mechazilla, Falcon 9 ALWAYS lands (auto + manual) =====================
{const _st=DS.step;DS.step=function(s,dt){const r=_st.apply(this,arguments);if(s.grAssist&&!s.landed&&!s.crashed&&s.phase==='landing'){
  const win=s.grAssist.win;if(Math.abs(s.x)<win&&s.h<2500){const k=Math.min(1,dt*(s.h<200?1.2:0.35));s.x-=s.x*k;s.vx-=s.vx*Math.min(1,dt*1.5);
   if(s.h<80){const vmax=Math.max(1.5,s.h*0.12);if(s.vh<-vmax)s.vh=-vmax;}}}
 return r;};
 const _ur=updRecovery;updRecovery=function(v,sim){for(const k of['booster','shipDS']){const r=rec[k];if(r&&k==='booster'&&!r.ds.grAssist){r.ds.grAssist={win:r.cfg.site==='tower'?40:60};if(r.cfg.site==='tower'){mechazilla.visible=true;}}}
  _ur(v,sim);const r=rec.booster;if(!r||r.cfg.site!=='tower')return;const ds=r.ds;
  if(r.caught){if(!r.gr){r.gr={t:0};const p=r.mesh.position;for(let i=0;i<40;i++){const a=Math.random()*6.28;smoke.spawn(_t.set(p.x+Math.cos(a)*5,p.y+1,p.z+Math.sin(a)*5),Math.cos(a)*14,-4+Math.random()*6,Math.sin(a)*14,6,14,18,0.92,0.92,0.94,0.65,0.3,0.4);}rocketMsgQ.push('BOOSTER: ENGINE SHUTDOWN - CATCH PINS ON ARMS');}
   r.gr.t+=sim;const t=r.gr.t;const drop=t<0.6?t/0.6*0.9:0.9-Math.min(0.3,(t-0.6)*0.6)+Math.sin(t*9)*Math.exp(-t*2)*0.12; // arms absorb load
   const armY=mechazilla.position.y+mechazilla.userData.arms[0].position.y+1.3;r.mesh.position.set(PAD.x,armY-66.6-0.45-drop,PAD.z);r.mesh.quaternion.slerp(new THREE.Quaternion(),Math.min(1,sim*3));
   mechazilla.userData.arms.forEach(a=>{a.position.y=98-drop*0.0;a.rotation.y+=(0-a.rotation.y)*Math.min(1,sim*2.2);});}
  else if(ds.phase==='landing'&&ds.h<400){// hydraulic close as it comes in
   const k=1-Math.max(0,Math.min(1,(ds.h-20)/380));mechazilla.userData.arms.forEach(a=>a.rotation.y=a.userData.sz*0.6*(1-k*0.6));
   // in the catch phase descend onto arm height rather than pad
   r.mesh.position.y=Math.max(r.mesh.position.y,mechazilla.position.y+98+1.3-66.6+ds.h*0.0);}};
 // detailed chopstick arms + carriage rails (keep arm group objects for catch logic)
 {const arms=mechazilla.userData.arms;const m=new THREE.MeshStandardMaterial({color:0x4a4e52,metalness:0.8,roughness:0.5}),w=new THREE.MeshStandardMaterial({color:0xd8d9d6,metalness:0.4,roughness:0.5}),hy=new THREE.MeshStandardMaterial({color:0xc8ccd0,metalness:1,roughness:0.2});
  for(const a of arms){a.clear();const sz=a.userData.sz;a.position.set(4,98,sz*5.6);
   // box-truss arm 28 m: top/bottom chords + diagonals
   for(const y of[-1.6,1.6])for(const z of[-0.9,0.9])add(a,new THREE.BoxGeometry(28,0.75,0.75),m,14,y,z);
   for(let i=0;i<14;i++){const d=add(a,new THREE.BoxGeometry(0.38,3.9,0.38),m,1+i*2,0,-0.9);d.rotation.z=(i%2?1:-1)*0.5;const d2=add(a,new THREE.BoxGeometry(0.38,3.9,0.38),m,1+i*2,0,0.9);d2.rotation.z=(i%2?-1:1)*0.6;}
   // catch rail (white, with shock-absorbing carts) on the inner top edge
   add(a,new THREE.BoxGeometry(22,0.5,0.9),w,16,1.55,-sz*0.4);for(const x of[12.5,16.5])add(a,new THREE.BoxGeometry(2.2,0.7,1.1),m,x,1.95,-sz*0.4);
   // hydraulic actuator to carriage
   const cyl=add(a,new THREE.CylinderGeometry(0.28,0.28,6,12).rotateZ(PI2h()),hy,2.2,-0.4,sz*1.0);const bar=add(a,new THREE.CylinderGeometry(0.4,0.4,4,12).rotateZ(PI2h()),m,0.2,-0.4,sz*1.0);
   add(a,new THREE.CylinderGeometry(0.9,0.9,3.2,20),m,0,0,0); // pivot
  }
  const car=mechazilla.userData.car;if(car){car.clear();add(car,new THREE.BoxGeometry(10,9,13),m,0,0,0);for(const s of[-1,1])add(car,new THREE.BoxGeometry(1.2,10,0.8),hy,-4.6,0,s*5.6);add(car,new THREE.BoxGeometry(10.4,0.6,13.4),w,0,4.8,0);}
  for(const s of[-1,1])add(mechazilla,new THREE.BoxGeometry(0.6,140,0.8),hy,4.8,74,s*3.2); // carriage rails on tower face
 }
 // Mechazilla tower body to OLIT-A proportions: ~9.5 m square, heavy box columns, dense X-bracing every 4.6 m bay, painted gray steel, top crane + lightning rod
 {const g=mechazilla;g.children.slice().forEach(c=>{if(c.geometry&&c.geometry.parameters&&(c.geometry.parameters.height===146||c.geometry.parameters.width===8.8||c.geometry.parameters.depth===8.8))c.visible=false;});
  const sm=new THREE.MeshStandardMaterial({color:0x6b7075,metalness:0.6,roughness:0.62});const lst=[];const V=(x,y,z)=>new THREE.Vector3(x,y,z);const B=(a,b,w)=>lst.push([a,b,w]);const h=4.75,TOP=146;
  for(const x of[-h,h])for(const z of[-h,h])B(V(x,0,z),V(x,TOP,z),1.5);
  for(let y=0;y<TOP;y+=4.6){const y1=Math.min(TOP,y+4.6);for(const s of[-h,h]){B(V(-h,y1,s),V(h,y1,s),0.6);B(V(s,y1,-h),V(s,y1,h),0.6);B(V(-h,y,s),V(h,y1,s),0.4);B(V(h,y,s),V(-h,y1,s),0.4);B(V(s,y,-h),V(s,y1,h),0.4);B(V(s,y,h),V(s,y1,-h),0.4);}}
  B(V(0,TOP,0),V(0,TOP+12,0),0.5);B(V(-h,TOP+3,0),V(h+14,TOP+3,0),1.0);
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),sm,lst.length);const o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  lst.forEach(([a,b,w],i)=>{const d=new THREE.Vector3().subVectors(b,a);const L=d.length();o.position.copy(a).addScaledVector(d,0.5);o.quaternion.setFromUnitVectors(up,d.normalize());o.scale.set(w,L,w);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
  im.castShadow=true;g.add(im);}
 function PI2h(){return Math.PI/2;}}
window.__GT=THREE;
