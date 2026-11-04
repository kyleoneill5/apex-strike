//BASE-BEGIN base_bases.js  #22 real-looking bases (Edwards AFB, NS Norfolk, Fort Hood, pad walkways). Refs: refs/bases/sources.txt
{const T=THREE;const BS={list:[],walk:[],solid:[],parked:[]};window.__bases=BS;
const W=window.__world;const xz=(lon,lat)=>W?W.xz(lon,lat):[lon*900,lat*900];
const th=(x,z)=>W&&W.th?W.th(x,z):terrainH(x,z);
const mat=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:0.85,metalness:0.05},o));
// procedural concrete / asphalt with expansion joints + stains (Edwards/Nellis aprons are PCC slabs 7.5 m)
const conc=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#9d9b94';x.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const g=140+Math.random()*40|0;x.fillStyle=`rgba(${g},${g-2},${g-8},0.25)`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}
 for(let i=0;i<14;i++){x.fillStyle='rgba(40,38,34,0.10)';x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,10+Math.random()*40,6+Math.random()*20,Math.random()*3,0,7);x.fill();}
 x.strokeStyle='rgba(50,48,44,0.55)';x.lineWidth=2;for(let k=0;k<=4;k++){x.beginPath();x.moveTo(k*w/4,0);x.lineTo(k*w/4,h);x.moveTo(0,k*h/4);x.lineTo(w,k*h/4);x.stroke();}},true,1);
const asph=canvasTex(512,512,(x,w,h)=>{x.fillStyle='#3a3b3d';x.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const g=45+Math.random()*40|0;x.fillStyle=`rgb(${g},${g},${g+2})`;x.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}
 for(let i=0;i<10;i++){x.fillStyle='rgba(15,15,15,0.35)';x.fillRect(w*0.38+Math.random()*w*0.24,Math.random()*h,8+Math.random()*10,40+Math.random()*90);}},true,1); // tyre marks in touchdown zone
const MC=mat(0xffffff,{map:conc}),MA=mat(0xffffff,{map:asph,roughness:0.92}),MW=mat(0xf2f2ee,{roughness:0.6}),MY=mat(0xe8b422,{roughness:0.6});
const MS=mat(0x8c9196,{metalness:0.6,roughness:0.45}),MG=mat(0x6f6a5c),MT=mat(0x3d4a38),MGl=mat(0x223344,{metalness:0.9,roughness:0.1}),MRed=mat(0xb02a22);
function slabTex(t,sx,sz){const c=t.clone();c.needsUpdate=true;c.repeat.set(sx,sz);return c;}
function box(g,w,h,l,m,x,y,z,ry=0){const o=new T.Mesh(new T.BoxGeometry(w,h,l),m);o.position.set(x,y,z);o.rotation.y=ry;o.castShadow=o.receiveShadow=true;g.add(o);return o;}
function slab(B,w,l,m,x,z,ry=0,tex){const mm=tex?new T.MeshStandardMaterial({map:slabTex(tex,w/30,l/30),roughness:0.9}):m;const o=box(B.g,w,1.2,l,mm,x,B.h-0.6,z,ry);o.castShadow=false;B.walk.push({x,z,hw:w/2,hl:l/2,ry,h:B.h});return o;}
function solid(B,w,h,l,x,z,ry=0){B.solid.push({x,z,hw:w/2+0.4,hl:l/2+0.4,ry,top:B.h+h});}
// runway markings per FAA AC 150/5340-1: threshold piano keys, designators, aiming points, TDZ bars, centreline 36 m dash
function rwyMarks(B,L,Wd,x0,z0,des){const g=new T.Group();g.position.set(x0,B.h+0.03,z0);B.g.add(g);const q=(w,l,x,z,m=MW)=>{const o=new T.Mesh(new T.PlaneGeometry(w,l).rotateX(-Math.PI/2),m);o.position.set(x,0,z);g.add(o);};
 for(let z=-L/2+120;z<L/2-120;z+=60)q(0.9,36,0,z);
 for(const s of[-1,1]){for(let i=0;i<8;i++){q(1.8,45,s*(Wd/2-4-i*3.6),-s*(L/2-30));q(1.8,45,-s*(Wd/2-4-i*3.6),-s*(L/2-30));}
  q(9,48,-9,-s*(L/2-400));q(9,48,9,-s*(L/2-400));for(let k=1;k<=3;k++){q(1.8,22,-12,-s*(L/2-150-k*150));q(1.8,22,12,-s*(L/2-150-k*150));}
  q(0.9,L,s*(Wd/2-1.5),0);}
 const dc=document.createElement('canvas');dc.width=256;dc.height=128;const c=dc.getContext('2d');c.fillStyle='#fff';c.font='bold 110px Arial';c.textAlign='center';c.fillText(des[0],128,108);
 const dt=new T.CanvasTexture(dc);const dm=new T.MeshBasicMaterial({map:dt,transparent:true,depthWrite:false,color:0xdddddd});const d1=new T.Mesh(new T.PlaneGeometry(22,11).rotateX(-Math.PI/2),dm);d1.position.set(0,0.02,L/2-90);d1.rotation.y=0;g.add(d1);}
// shared parametric buildings
function hangar(B,x,z,ry,w=60,l=50,h=18){const g=new T.Group();g.position.set(x,B.h,z);g.rotation.y=ry;B.g.add(g);box(g,w,h,l,MG,0,h/2,0);
 const roof=new T.Mesh(new T.CylinderGeometry(w*0.62,w*0.62,l,24,1,false,-0.9,1.8).rotateZ(Math.PI/2).rotateY(Math.PI/2),MS);roof.rotation.set(0,0,0);roof.position.set(0,h-w*0.62*Math.cos(0.9)+0.5,0);g.add(roof);
 for(let i=0;i<6;i++)box(g,w/6-0.4,h-2,0.4,MS,-w/2+w/12+i*w/6,h/2-1,l/2+0.2);box(g,w,1.2,0.6,MY,0,h-1,l/2+0.4);solid(B,w,h,l,x,z,ry);}
function has(B,x,z,ry){// TAB-VEE / HAS hardened aircraft shelter: semi-cylinder concrete, 22x37 m
 const g=new T.Group();g.position.set(x,B.h,z);g.rotation.y=ry;B.g.add(g);const s=new T.Mesh(new T.CylinderGeometry(12,12,36,20,1,false,Math.PI/2,Math.PI).rotateX(Math.PI/2),mat(0xaaa69a,{map:conc}));s.rotation.z=0;s.position.y=0;s.scale.set(1,0.62,1);g.add(s);
 box(g,22,7.2,1.2,MS,0,3.6,18.4);box(g,23,1.2,1.6,MY,0,7.6,18.6);B.solid.push({x,z,hw:12.5,hl:18.6,ry,top:B.h+8});}
function tower(B,x,z,h=40){const g=new T.Group();g.position.set(x,B.h,z);B.g.add(g);const sh=new T.Mesh(new T.CylinderGeometry(3.2,4,h,12),MC);sh.position.y=h/2;g.add(sh);
 const cab=new T.Mesh(new T.CylinderGeometry(7,5,6,8),MGl);cab.position.y=h+3;g.add(cab);const rf=new T.Mesh(new T.CylinderGeometry(7.8,7.8,0.8,8),MW);rf.position.y=h+6.4;g.add(rf);
 const bc=new T.Mesh(new T.SphereGeometry(0.6,8,6),new T.MeshBasicMaterial({color:0xff2200}));bc.position.y=h+9;g.add(bc);B.beacons.push(bc);box(g,24,6,16,MG,8,3,-12);solid(B,24,6,16,x+8,z-12);B.solid.push({x,z,hw:4.5,hl:4.5,ry:0,top:B.h+h+7});}
function inst(B,geo,m,arr){const im=new T.InstancedMesh(geo,m,arr.length);const o=new T.Object3D();arr.forEach((a,i)=>{o.position.set(a[0],B.h+(a[3]||0),a[1]);o.rotation.set(0,a[2]||0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);});im.castShadow=true;B.g.add(im);return im;}
function fence(B,cx,cz,hw,hl){const p=[];for(let x=-hw;x<=hw;x+=6){p.push([cx+x,cz-hl]);p.push([cx+x,cz+hl]);}for(let z=-hl;z<=hl;z+=6){p.push([cx-hw,cz+z]);p.push([cx+hw,cz+z]);}
 inst(B,new T.CylinderGeometry(0.05,0.05,2.6,4).translate(0,1.3,0),MS,p);const fm=new T.MeshStandardMaterial({color:0x9aa0a4,transparent:true,opacity:0.35,side:T.DoubleSide,metalness:0.5});
 for(const [w,x,z,r] of[[hw*2,cx,cz-hl,0],[hw*2,cx,cz+hl,0],[hl*2,cx-hw,cz,Math.PI/2],[hl*2,cx+hw,cz,Math.PI/2]]){const m=new T.Mesh(new T.PlaneGeometry(w,2.4),fm);m.position.set(x,B.h+1.3,z);m.rotation.y=r;B.g.add(m);}}
function lights(B,pts,col=0xffd28a){// apron light poles: instanced poles + one additive sprite cloud (no PointLights -> iPhone)
 inst(B,new T.CylinderGeometry(0.18,0.25,18,6).translate(0,9,0),MS,pts);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts.flatMap(p=>[p[0],B.h+18.3,p[1]]),3));
 const pm=new T.PointsMaterial({color:col,size:2.2,sizeAttenuation:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false});const P=new T.Points(g,pm);B.g.add(P);B.lamps=pm;}
function fuelTruck(B,x,z,ry){const g=new T.Group();g.position.set(x,B.h,z);g.rotation.y=ry;B.g.add(g);box(g,2.5,2.6,2.4,MY,0,1.8,3.8);box(g,2.5,2.4,6.8,MW,0,2,-1);box(g,2.6,0.25,9.6,mat(0x222222),0,0.8,0.6);
 for(const zz of[3.6,-0.8,-3])for(const s of[-1,1]){const w=new T.Mesh(new T.CylinderGeometry(0.55,0.55,0.4,12).rotateZ(Math.PI/2),mat(0x111111));w.position.set(s*1.2,0.55,zz);g.add(w);}solid(B,3,3,10,x,z,ry);}
function crane(B,x,z,ry){const g=new T.Group();g.position.set(x,B.h,z);g.rotation.y=ry;B.g.add(g);// pier portal crane (Norfolk 'Gantry' type)
 for(const a of[-6,6])for(const b of[-6,6])box(g,1,30,1,MRed,a,15,b);box(g,14,3,14,MRed,0,31,0);const j=box(g,1.6,1.6,48,MY,0,33,-18);j.rotation.x=-0.25;box(g,4,4,4,MW,0,34,4);}
function warehouse(B,x,z,ry,w=70,l=30,h=12){const g=new T.Group();g.position.set(x,B.h,z);g.rotation.y=ry;B.g.add(g);box(g,w,h,l,mat(0xb8b1a0),0,h/2,0);const r=box(g,w+1,0.8,l+1,MS,0,h+0.2,0);
 for(let i=0;i<4;i++)box(g,6,6,0.3,MS,-w/2+10+i*16,3,l/2+0.1);solid(B,w,h,l,x,z,ry);}
// ---- base factory ----
function mkBase(name,lon,lat,R,fn){const [x,z]=xz(lon,lat);const g=new T.Group();g.position.set(0,0,0);let h=0;for(let a=-R;a<=R;a+=R/4)for(let b=-R;b<=R;b+=R/4)h=Math.max(h,th(x+a,z+b));
 const B={name,cx:x,cz:z,R,h:Math.max(h,0)+1.2,g,walk:[],solid:[],beacons:[],parked:[],lon,lat};
 const L=new T.Group();L.position.set(x,0,z);L.add(g);scene.add(L);B.root=L;fn(B);
 // terrain skirt so the slab never floats over lower desert
 const sk=new T.Mesh(new T.BoxGeometry(R*2.1,B.h+40,R*2.1),mat(0x8c7d62,{roughness:1}));sk.position.set(0,(B.h-40)/2-1.25,0);sk.receiveShadow=true;if(fn.sea)sk.visible=false;else g.add(sk);
 for(const w of B.walk){w.x+=x;w.z+=z;}for(const s of B.solid){s.x+=x;s.z+=z;}for(const p of B.parked){p.x+=x;p.z+=z;}
 BS.list.push(B);BS.walk.push(...B.walk);BS.solid.push(...B.solid);return B;}
// Edwards AFB (34.905N 117.884W): Rwy 04R/22L 15,000 ft x 300 ft concrete, main base ramp SW of runway (refs/bases/edwards_*.jpg)
const AFB=mkBase('Edwards AFB',-117.884,34.905,1700,B=>{const r=-0.62;// ~040 deg true heading of 04R/22L
 const L=3000,Wd=60;slab(B,Wd,L,null,0,0,r,conc);const rg=new T.Group();rg.rotation.y=r;B.g.add(rg);const sub={g:rg,h:B.h,walk:[],solid:[]};rwyMarks(sub,L,Wd,0,0,['22']);
 const off=(a,b)=>[a*Math.cos(r)+b*Math.sin(r),-a*Math.sin(r)+b*Math.cos(r)];
 const tx=off(-180,0);slab(B,23,L,null,tx[0],tx[1],r,asph);for(const s of[-1,0.5,1]){const c=off(-90,s*L*0.45);slab(B,23,180,null,c[0],c[1],r+Math.PI/2,asph);}
 const ap=off(-420,-200);slab(B,420,900,null,ap[0],ap[1],r,conc);
 // yellow taxi centrelines
 const yl=new T.Mesh(new T.PlaneGeometry(0.3,L).rotateX(-Math.PI/2),MY);yl.position.set(tx[0],B.h+0.04,tx[1]);yl.rotation.y=r;B.g.add(yl);
 for(let i=0;i<5;i++){const p=off(-620,-560+i*110);hangar(B,p[0],p[1],r+Math.PI/2);}
 for(let i=0;i<6;i++){const p=off(-280,150+i*55);has(B,p[0],p[1],r+Math.PI/2);}
 const tw=off(-300,-700);tower(B,tw[0],tw[1]);
 for(let i=0;i<3;i++){const p=off(-330,-420+i*22);fuelTruck(B,p[0],p[1],r);}
 // ground equipment: tugs, power carts (instanced)
 const gse=[];for(let i=0;i<14;i++){const p=off(-250-(i%3)*10,-500+i*40);gse.push([p[0],p[1],r,0.6]);}inst(B,new T.BoxGeometry(1.6,1.2,2.6),MY,gse);
 const lp=[];for(let i=0;i<8;i++)for(const a of[-220,-620]){const p=off(a,-620+i*120);lp.push(p);}lights(B,lp);
 fence(B,0,0,1300,1650);
 // parked jets on the ramp (enterable): kind, local offset
 const pk=[['fighter',-380,-300],['fighter',-380,-250],['heli',-430,-120],['fighter',-280,150]];for(const [k,a,b] of pk){const p=off(a,b);B.parked.push({kind:k,x:p[0],z:p[1],ry:r+Math.PI/2*0+Math.PI,base:'afb'});}
 B.spawn=off(-360,-320);B.spawn=[B.spawn[0],B.spawn[1]];});
// Naval Station Norfolk (36.946N 76.313W): 13 finger piers on Willoughby Bay / Elizabeth River (refs/bases/norfolk_*.jpg)
const sea=B=>{B.h=3.2;// pier deck +3.2 m above MLW
 slab(B,900,160,null,0,-260,0,conc);for(let i=0;i<5;i++){const x=-360+i*180;slab(B,30,420,null,x,20,0,conc);
  const pil=[];for(let z=-180;z<=200;z+=12){pil.push([x-14,z+20,0,-6]);pil.push([x+14,z+20,0,-6]);}inst(B,new T.CylinderGeometry(0.5,0.5,9,6),MC,pil);
  crane(B,x+8,-80+i*10,Math.PI/2);B.parked.push({kind:i%2?'sub':'destroyer',x:x+(i%2?-34:46),z:40,ry:Math.PI,base:'nav',pier:{x,z:20}});}
 for(let i=0;i<4;i++)warehouse(B,-300+i*200,-310,0);tower(B,420,-300,22);
 const lp=[];for(let i=0;i<5;i++)for(let z=-150;z<=200;z+=70)lp.push([-360+i*180+12,z]);lights(B,lp,0xfff0c8);fence(B,0,-300,450,40);B.spawn=[-360,-230];};sea.sea=true;
const NAV=mkBase('NS Norfolk',-76.313,36.946,600,sea);
// Fort Hood / Fort Cavazos (31.13N 97.78W): motor pools, vehicle maintenance bays
const ARMY=mkBase('Fort Cavazos',-97.78,31.13,700,B=>{slab(B,700,500,null,0,0,0,conc);for(let i=0;i<4;i++)warehouse(B,-240+i*160,-200,0,110,34,10);
 const tk=[];for(let r=0;r<4;r++)for(let c=0;c<10;c++)tk.push([-250+c*28,-60+r*30,Math.PI]);inst(B,new T.BoxGeometry(3.6,2.4,7.9),MT,tk.map(a=>[a[0],a[1],a[2],1.2]));
 inst(B,new T.BoxGeometry(2.3,1.0,3.2),MT,tk.map(a=>[a[0],a[1]-0.8,a[2],2.9]));const lp=[];for(let i=0;i<6;i++)lp.push([-300+i*120,-120]);lights(B,lp);fence(B,0,0,350,250);B.spawn=[0,120];});
// existing pads: make LC-39A / Starbase / F9 / Shuttle pad decks walkable (crew access arm level)
BS.pads=[];try{const P=window.__pads;if(P){for(const G of[P.LC39,P.STARBASE]){if(!G)continue;G.updateMatrixWorld();const p=G.position;BS.walk.push({x:p.x,z:p.z,hw:90,hl:90,ry:0,h:p.y+0.5});BS.pads.push(G);}}}catch(e){}
// distance streaming: whole base hidden > 14 km, small detail hidden > 3.5 km (touch: 9 / 2.5 km)
const FAR=isTouch?9000:14000,NEAR=isTouch?2500:3500;let bt=0;
BS.update=dt=>{bt+=dt;const cp=camera.position;for(const B of BS.list){const d=Math.hypot(cp.x-B.cx,cp.z-B.cz)-B.R;B.root.visible=d<FAR;const near=d<NEAR;B.g.children.forEach(o=>{if(o.isInstancedMesh||o.isPoints)o.visible=near;});
 for(const b of B.beacons)b.visible=Math.sin(bt*4)>0;if(B.lamps)B.lamps.opacity=window.__gx&&__gx.night?1:0.35;}};
BS.surface=(x,z)=>{let best=null;for(const w of BS.walk){const dx=x-w.x,dz=z-w.z,c=Math.cos(-w.ry),s=Math.sin(-w.ry);const lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)<=w.hw&&Math.abs(lz)<=w.hl&&(!best||w.h>best))best=w.h;}return best;};
// flat runways/aprons for the flight model too
{const _g=groundAt;groundAt=function(x,z){const h=BS.surface(x,z);if(h!=null)return{h,type:'land'};return _g(x,z);};}
BS.AFB=AFB;BS.NAV=NAV;BS.ARMY=ARMY;
const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{BS.update(dt);}catch(e){}};}
//BASE-END
