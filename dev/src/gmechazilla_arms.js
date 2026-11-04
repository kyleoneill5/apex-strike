//GMZARMS-BEGIN  Mechazilla "chopstick" catch arms rebuilt from refs/mechazilla/photo1.jpg (IFT-5 catch, Oct 2024). Wrap-only: replaces arm children, keeps the arm groups/pivots used by catch logic.
// Arms: ~28 m from pivot (along +X), deep tapered Warren truss (≈5.5 m deep at the carriage, ≈1.6 m at the tip), heavy box top chord carrying the catch rail,
// tubular bottom chord sloping up to the tip, vertical posts + diagonals, inboard catch-rail shoe faces, hydraulic actuator at root, steel grey with rust/soot grime.
{const T=THREE,L=28,D0=5.5,D1=1.6,TOPH=2.2,TOPW=1.9;
 const cv=document.createElement('canvas');cv.width=512;cv.height=128;{const x=cv.getContext('2d');x.fillStyle='#4d5257';x.fillRect(0,0,512,128);for(let i=0;i<900;i++){const r=Math.random();x.fillStyle=r<0.35?`rgba(110,70,40,${Math.random()*0.12})`:r<0.7?`rgba(20,20,22,${Math.random()*0.12})`:`rgba(150,155,160,${Math.random()*0.08})`;x.fillRect(Math.random()*512,Math.random()*128,2+Math.random()*30,1+Math.random()*10);}
  x.strokeStyle='rgba(25,25,28,0.6)';x.lineWidth=2;for(let u=0;u<512;u+=64){x.beginPath();x.moveTo(u,0);x.lineTo(u,128);x.stroke();}}
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(4,1);tex.anisotropy=8;
 const steel=new T.MeshStandardMaterial({color:0xffffff,map:tex,metalness:0.75,roughness:0.55}),dark=new T.MeshStandardMaterial({color:0x2c2f33,metalness:0.7,roughness:0.5}),
  rail=new T.MeshStandardMaterial({color:0x9ca2a8,metalness:0.9,roughness:0.3}),hyd=new T.MeshStandardMaterial({color:0xc8ccd0,metalness:1,roughness:0.15}),pad=new T.MeshStandardMaterial({color:0x1a1a1a,metalness:0.1,roughness:0.85});
 const depth=x=>D0+(D1-D0)*(x/L);
 const beam=(g,a,b,r,m)=>{const d=new T.Vector3().subVectors(b,a),len=d.length();const me=new T.Mesh(new T.CylinderGeometry(r,r,len,8),m);me.position.copy(a).add(b).multiplyScalar(0.5);me.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(me);return me;};
 function arm(sz){const g=new T.Group();const V=(x,y,z)=>new T.Vector3(x,y,z);
  // top box chord + catch rail on top (booster hardpoints land on this rail)
  const tc=new T.Mesh(new T.BoxGeometry(L,TOPH,TOPW),steel);tc.position.set(L/2,0,0);g.add(tc);
  const rl=new T.Mesh(new T.BoxGeometry(L-3,0.35,0.9),rail);rl.position.set(L/2+1.5,TOPH/2+0.18,-sz*0.25);g.add(rl);
  const shoe=new T.Mesh(new T.BoxGeometry(L-6,1.0,0.25),pad);shoe.position.set(L/2+3,0.1,-sz*(TOPW/2+0.12));g.add(shoe); // inboard bumper face toward booster
  // two bottom chords (truss is a narrow triangular section in cross-section)
  const zb=TOPW*0.35,N=9;const bot=i=>{const x=i/N*L;return x;};
  for(const s of[-1,1])beam(g,V(0.6,-TOPH/2-D0+TOPH,s*zb),V(L-0.4,-TOPH/2-D1+TOPH,s*zb*0.6),0.32,steel);
  for(let i=0;i<=N;i++){const x=Math.min(L-0.4,Math.max(0.6,bot(i))),yb=-TOPH/2-depth(x)+TOPH,zz=zb*(1-0.4*x/L);
   for(const s of[-1,1]){beam(g,V(x,-TOPH/2,s*TOPW*0.4),V(x,yb,s*zz),0.2,steel); // posts
    if(i<N){const x2=Math.min(L-0.4,bot(i+1)),yb2=-TOPH/2-depth(x2)+TOPH,zz2=zb*(1-0.4*x2/L);beam(g,V(x,yb,s*zz),V(x2,-TOPH/2,s*TOPW*0.4),0.16,steel);}} // Warren diagonals
   beam(g,V(x,yb,-zz),V(x,yb,zz),0.14,steel);} // bottom cross ties
  // root: hinge knuckle + hydraulic open/close actuator back to carriage
  const hk=new T.Mesh(new T.CylinderGeometry(1.1,1.1,D0+0.6,16),dark);hk.position.set(0,-D0/2+TOPH/2,0);g.add(hk);
  const cyl=beam(g,V(-2.5,-1.6,sz*-1.8),V(4.5,-1.2,0),0.38,dark);const rod=beam(g,V(0.5,-1.3,sz*-0.8),V(4.5,-1.2,0),0.2,hyd);
  // tip cap + lights
  const tip=new T.Mesh(new T.BoxGeometry(0.8,TOPH+0.4,TOPW+0.3),dark);tip.position.set(L,0,0);g.add(tip);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;}
 function rebuild(){if(typeof mechazilla==='undefined'||!mechazilla.userData.arms)return;for(const a of mechazilla.userData.arms){if(a.userData.mzv2)continue;a.clear();a.add(arm(a.userData.sz||1));a.userData.mzv2=true;}}
 rebuild();
 if(typeof setupRocketModels==='function'){const _s=setupRocketModels;setupRocketModels=function(rk){_s(rk);rebuild();};}
 window.__mzArms={rebuild,L,D0,D1,mz:(typeof mechazilla!=="undefined"?mechazilla:null)};}
//GMZARMS-END
