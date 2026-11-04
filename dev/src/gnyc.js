// ---------- NYC landmarks + progressive building collapse ----------
const BLD=[];{const ch=scene.children;const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 for(let k=0;k<ch.length;k++){const im=ch[k];if(!im.isInstancedMesh||!cityMats.includes(im.material))continue;const roof=ch[k+1]&&ch[k+1].isInstancedMesh?ch[k+1]:null;
  for(let i=0;i<im.count;i++){im.getMatrixAt(i,m);m.decompose(p,q,s);BLD.push({im,roof,i,x:p.x,z:p.z,y0:p.y,h:s.y,h0:s.y,w:s.x,d:s.z,state:0,t:0});}}}
function bldAt(x,z){let b=null,bd=1e9;for(const o of BLD){const d=Math.hypot(o.x-x,o.z-z);if(d<bd){bd=d;b=o;}}return bd<60?b:null;}
function setBldH(b,h){const m=new THREE.Matrix4().makeScale(b.w,Math.max(0.01,h),b.d);m.setPosition(b.x,b.y0,b.z);b.im.setMatrixAt(b.i,m);b.im.instanceMatrix.needsUpdate=true;
 if(b.roof){const r=new THREE.Matrix4().makeScale(b.w*0.5/0.5*0.5/0.5*1,1,b.d);r.makeScale(b.w,h>2?1:0.001,b.d);r.setPosition(b.x,b.y0+h,b.z);b.roof.setMatrixAt(b.i,r);b.roof.instanceMatrix.needsUpdate=true;}
 const i=Math.floor((b.x-CITY.x0)/CITY.cs),j=Math.floor((b.z-CITY.z0)/CITY.cs);if(i>=0&&j>=0&&i<CITY.nx&&j<CITY.nz)CITY.h[i*CITY.nz+j]=h>0.5?b.y0+h:0;}
// landmarks (replace grid buildings at their sites)
const LM=new THREE.Group();scene.add(LM);
const lmGlass=new THREE.MeshStandardMaterial({color:0x8fa6b8,roughness:0.08,metalness:0.9,envMapIntensity:1.8}),lmStone=new THREE.MeshStandardMaterial({color:0xc9bfae,roughness:0.8,metalness:0.05}),lmSteel=new THREE.MeshStandardMaterial({color:0xd8dde2,roughness:0.25,metalness:1});
function clearSite(x,z,r=40){for(const b of BLD)if(Math.abs(b.x-x)<r&&Math.abs(b.z-z)<r){setBldH(b,0);b.state=9;}}
function cellXZ(i,j){return [CITY.x0+i*CITY.cs+30,CITY.z0+j*CITY.cs+30];}
const LMK={};
{// One World Trade Center (541 m incl. spire): square base twisting to rotated square top
 const [x,z]=cellXZ(10,5);clearSite(x,z,70);const g=new THREE.Group();const H=417;const geo=new THREE.CylinderGeometry(21,43,H,4,24,false);geo.rotateY(Math.PI/4);
 const pa=geo.attributes.position;for(let k=0;k<pa.count;k++){const y=pa.getY(k)/H+0.5;const a=y*Math.PI/4;const X=pa.getX(k),Z=pa.getZ(k);pa.setXYZ(k,X*Math.cos(a)-Z*Math.sin(a),pa.getY(k),X*Math.sin(a)+Z*Math.cos(a));}geo.computeVertexNormals();
 add(g,new THREE.BoxGeometry(62,56,62),lmGlass,0,28,0);add(g,geo,lmGlass,0,56+H/2,0);add(g,new THREE.CylinderGeometry(1.2,3,124,8),lmSteel,0,56+H+62,0);add(g,new THREE.CylinderGeometry(14,14,6,12),lmSteel,0,56+H+3,0);
 g.position.set(x,6,z);LM.add(g);CITY.h[10*CITY.nz+5]=6+56+H;LMK.wtc=g;}
{// Empire State Building (381 m roof, 443 m tip), Art Deco setbacks
 const [x,z]=cellXZ(15,30);clearSite(x,z,40);const g=new THREE.Group();let y=0;for(const [w,h] of [[56,26],[48,60],[42,190],[34,40],[26,14],[20,30]]){add(g,new THREE.BoxGeometry(w,h,w*0.75),lmStone,0,y+h/2,0);y+=h;}
 for(const s of[-1,1])for(let k=-2;k<=2;k++)add(g,new THREE.BoxGeometry(0.8,190,0.8),lmSteel,k*8,86+95,s*15.8);
 add(g,new THREE.CylinderGeometry(6,8,40,12),lmStone,0,y+20,0);add(g,new THREE.CylinderGeometry(0.8,2,62,8),lmSteel,0,y+71,0);
 g.position.set(x,6,z);LM.add(g);CITY.h[15*CITY.nz+30]=6+y+60;LMK.esb=g;}
{// Chrysler Building (319 m) with terraced steel crown and spire
 const [x,z]=cellXZ(20,33);clearSite(x,z,40);const g=new THREE.Group();add(g,new THREE.BoxGeometry(46,60,46),lmStone,0,30,0);add(g,new THREE.BoxGeometry(32,180,32),lmStone,0,150,0);
 let y=240;for(let k=0;k<6;k++){const r=15-k*2.2;const c=new THREE.Mesh(new THREE.SphereGeometry(r,16,8,0,Math.PI*2,0,Math.PI/2),lmSteel);c.position.set(0,y,0);c.scale.y=1.35;g.add(c);y+=8;}
 add(g,new THREE.ConeGeometry(2.2,46,8),lmSteel,0,y+20,0);g.position.set(x,6,z);LM.add(g);CITY.h[20*CITY.nz+33]=6+y+40;LMK.chrysler=g;}
{// Central Park reservoir + lakes on existing park
 const [x,z]=cellXZ(14,50);add(LM,new THREE.CircleGeometry(70,32).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a4a5a,roughness:0.1,metalness:0.4}),x+30,6.35,z+420);
 for(let k=0;k<160;k++){const t=add(LM,new THREE.SphereGeometry(4+Math.random()*4,6,5),M(0x2f5a2a,{roughness:1}),x+30+rnd(100),9,z+80+Math.random()*900);t.scale.y=0.8;}}
{// Statue of Liberty on Liberty Island (93 m incl. pedestal), harbour south of downtown
 const g=new THREE.Group();const LX=NYC.x-1300,LZ=NYC.z-4500;add(g,new THREE.CylinderGeometry(110,120,6,24),M(0x7d8a5c,{roughness:1}),0,3,0);
 const fort=new THREE.Mesh(new THREE.CylinderGeometry(42,46,10,11),lmStone);fort.position.y=11;g.add(fort);add(g,new THREE.BoxGeometry(20,27,20),lmStone,0,29,0);add(g,new THREE.BoxGeometry(14,14,14),lmStone,0,49,0);
 const cu=new THREE.MeshStandardMaterial({color:0x6fae9a,roughness:0.6,metalness:0.3});const body=add(g,new THREE.CylinderGeometry(3.2,6,30,12),cu,0,71,0);add(g,new THREE.SphereGeometry(2.4,12,10),cu,0,88,0);
 for(let k=0;k<7;k++){const r=add(g,new THREE.ConeGeometry(0.4,3.2,5),cu,Math.cos(k/7*Math.PI*2)*2.6,90,Math.sin(k/7*Math.PI*2)*2.6);r.rotation.set(Math.sin(k/7*6.28)*1.1,0,-Math.cos(k/7*6.28)*1.1);}
 const arm=add(g,new THREE.CylinderGeometry(0.8,1.1,13,8),cu,3.2,92,0);arm.rotation.z=-0.2;add(g,new THREE.CylinderGeometry(1.2,0.6,3,10),M(0xd8b04a,{metalness:1,roughness:0.3,emissive:0x664400}),4.6,100,0);add(g,new THREE.BoxGeometry(2,4,1),cu,-3.6,80,-1.5);
 g.position.set(LX,0,LZ);g.rotation.y=-0.6;scene.add(g);LMK.liberty=g;}
LM.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});window.__nyc={LMK,BLD};
// ---- collapse system ----
const COL=[];
function damageBuilding(b,frac,why){if(!b||b.state>=2||b.h<3)return;if(frac>=0.75){b.state=2;COL.push({b,t:0,dur:5+b.h/45,h0:b.h,fin:b.h*0.06+3});}else{b.state=1;COL.push({b,t:0,dur:2+b.h/120,h0:b.h,fin:b.h*(1-frac)});}}
function blastCity(p,R){if(p.distanceTo(CITY_C)>6000+R)return;for(const b of BLD){if(b.state>=2)continue;const d=Math.hypot(b.x-p.x,b.z-p.z);if(d>R)continue;const f=1-d/R;damageBuilding(b,f>0.35?1:f*2.1);}}
{const _ex=explosion;explosion=function(p,s=1){_ex(p,s);if(p.distanceTo(CITY_C)<5000){const b=bldAt(p.x,p.z);if(b&&p.y<b.y0+b.h+30)damageBuilding(b,Math.min(1,0.22*s+0.1));if(s>=2.5)blastCity(p,40*s);}};}
{const _nk=nukeDetonate;nukeDetonate=function(p,...a){const r=_nk(p,...a);const d=p.distanceTo(CITY_C);if(d<12000){NYC_WAVE.push({p:p.clone(),r:0});}return r;};}
const NYC_WAVE=[];const _dv=new THREE.Vector3();
{const _ue=updEnv;updEnv=function(dt=0.016){_ue(dt);
 for(let w=NYC_WAVE.length-1;w>=0;w--){const W=NYC_WAVE[w];const r0=W.r;W.r+=dt*340*(paused?0:1)*(typeof warp!=='undefined'?1:1);for(const b of BLD){if(b.state>=2)continue;const d=Math.hypot(b.x-W.p.x,b.z-W.p.z);if(d>=r0&&d<W.r){const f=clamp(1-d/7000,0,1);if(f>0.05)damageBuilding(b,f>0.45?1:f*1.8);}}if(W.r>8000)NYC_WAVE.splice(w,1);}
 for(let k=COL.length-1;k>=0;k--){const c=COL[k],b=c.b;c.t+=paused?0:dt;const u=clamp(c.t/c.dur,0,1);const e=u*u*(3-2*u);const h=c.h0+(c.fin-c.h0)*e;
  // pancake: roof drops floor by floor -> visual height steps every ~4m
  const hs=Math.max(c.fin,Math.floor(h/3.8)*3.8);if(Math.abs(hs-b.h)>0.1){b.h=hs;setBldH(b,hs);}
  const top=V3(b.x,b.y0+b.h,b.z);if(u<1&&Math.random()<(b.state===2?0.9:0.4)){
   smoke.spawn(top.clone().add(V3(rnd(b.w*0.5),0,rnd(b.d*0.5))),rnd(6),2+Math.random()*4,rnd(6),6+Math.random()*6,b.w*0.5,b.w*0.9,0.72,0.68,0.6,0.75,0.4,0.5);
   if(b.state===2)smoke.spawn(V3(b.x+rnd(b.w),b.y0+3,b.z+rnd(b.d)),rnd(25),1+Math.random()*3,rnd(25),9+Math.random()*8,b.w*0.6,b.w*2.2,0.7,0.66,0.58,0.6,0.25,0.2); // rolling ground dust
   fire.spawn(top.clone().add(V3(rnd(b.w*0.5),rnd(5),rnd(b.d*0.5))),rnd(8),rnd(4),rnd(8),0.5+Math.random()*0.6,0.6,0.2,0.85,0.92,1,0.9,0.2,-4); // glass glints falling
   if(Math.random()<0.3)fire.spawn(top.clone().add(V3(rnd(b.w*0.4),-Math.random()*8,rnd(b.d*0.4))),rnd(2),3,rnd(2),1+Math.random(),6,10,1,0.55,0.2,0.9,0.5,0,1,0.2,0);}
  if(u>=1){COL.splice(k,1);if(b.state===2){b.state=3;addRubble(b);}else b.state=0;b.burn=20+Math.random()*30;BURN.push(b);}}
 for(let k=BURN.length-1;k>=0;k--){const b=BURN[k];b.burn-=dt;if(Math.random()<0.25)fire.spawn(V3(b.x+rnd(b.w*0.4),b.y0+b.h+1,b.z+rnd(b.d*0.4)),rnd(2),3+Math.random()*3,rnd(2),0.8+Math.random()*0.6,4,8,1,0.5,0.15,0.9,0.4,0,1,0.2,0);
  if(Math.random()<0.3)smoke.spawn(V3(b.x+rnd(b.w*0.3),b.y0+b.h+4,b.z+rnd(b.d*0.3)),rnd(2),6+Math.random()*4,rnd(2),8,6,22,0.12,0.11,0.1,0.6,0.1,1);if(b.burn<=0)BURN.splice(k,1);}};}
const BURN=[];const rubbleGeo=new THREE.DodecahedronGeometry(1,0);const rubbleMat=new THREE.MeshStandardMaterial({color:0x8a8478,roughness:0.95});
const RUB=new THREE.InstancedMesh(rubbleGeo,rubbleMat,isTouch?2500:5000);RUB.count=0;RUB.castShadow=RUB.receiveShadow=true;RUB.frustumCulled=false;scene.add(RUB);
function addRubble(b){const n=Math.min(40,10+Math.floor(b.h0/6));const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
 for(let k=0;k<n&&RUB.count<RUB.instanceMatrix.count;k++){const r=Math.sqrt(Math.random());const a=Math.random()*6.28;const s=2+Math.random()*(4+b.h0/40);
  e.set(Math.random()*3,Math.random()*3,Math.random()*3);q.setFromEuler(e);m.compose(V3(b.x+Math.cos(a)*r*b.w*0.75,b.y0+s*0.3*(1-r)+b.h*0.5,b.z+Math.sin(a)*r*b.d*0.75),q,V3(s,s*0.6,s*0.8));RUB.setMatrixAt(RUB.count++,m);}
 RUB.instanceMatrix.needsUpdate=true;}
Object.assign(window.__milsim,{damageBuilding,blastCity,bldAt,BLD});
