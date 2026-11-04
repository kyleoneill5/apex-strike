// Stage engines: nozzle bells, aft skirt, interstage. Parent is the flight wrapper
// (not the clipped stage mesh), frustum culling is off, and the particle plume
// starts aft of the exit so the bell stays readable from the follow camera.
// Minuteman III / SLBM, the MIRV bus, SM-3 (Mk 72 / Mk 104 / Mk 136), launchers.
(()=>{const T=THREE;
 const metal=new T.MeshStandardMaterial({color:0xc8c4bc,metalness:0.92,roughness:0.22,side:T.DoubleSide});
 const innerM=new T.MeshStandardMaterial({color:0x3a2418,metalness:0.4,roughness:0.55,side:T.DoubleSide,emissive:0x2a1008,emissiveIntensity:0.4});
 const skirtM=new T.MeshStandardMaterial({color:0x2a2c30,metalness:0.7,roughness:0.38,side:T.DoubleSide});
 const rimM=new T.MeshStandardMaterial({color:0xf4f1ea,metalness:1,roughness:0.12,emissive:0x6a655c,emissiveIntensity:0.55,side:T.DoubleSide});
 const rimBright=new T.MeshBasicMaterial({color:0xfff8ee});
 const throatM=new T.MeshStandardMaterial({color:0x140c0a,metalness:0.15,roughness:0.9,side:T.DoubleSide,emissive:0x1a0804,emissiveIntensity:0.3});
 const hotM=new T.MeshBasicMaterial({color:0xffe6b0,transparent:true,opacity:0.95,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 const coreMat=new T.MeshBasicMaterial({color:0xfff6df,transparent:true,opacity:0.9,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 const outerMat=new T.MeshBasicMaterial({color:0xffb15a,transparent:true,opacity:0.28,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 const diaMat=()=>new T.MeshBasicMaterial({color:0xfff8ee,transparent:true,opacity:0.55,depthWrite:false,blending:T.AdditiveBlending});
 function nocull(o){o.traverse(c=>{c.frustumCulled=false;if(c.isMesh){c.renderOrder=Math.max(c.renderOrder||0,6);if(c.material)c.material.fog=false;}});}
 function bell(rThroat,rExit,len){const g=new T.Group();const pts=[];
  for(let i=0;i<=16;i++){const t=i/16;pts.push(new T.Vector2(rThroat+(rExit-rThroat)*Math.pow(t,0.72),-t*len));}
  const wallMat=metal.clone(),innMat=innerM.clone();
  const wall=new T.Mesh(new T.LatheGeometry(pts,36),wallMat);g.add(wall);
  const inn=new T.Mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(0.01,p.x*0.9),p.y+0.002)),28),innMat);g.add(inn);g.userData.inner=innMat;
  const cap=new T.Mesh(new T.CircleGeometry(rThroat*0.72,24),throatM.clone());cap.rotation.x=Math.PI/2;cap.position.y=-0.01;g.add(cap);
  // Bright lip, clearly past the skirt. A basic ring so it stays readable against the plume.
  const lip=new T.Mesh(new T.TorusGeometry(rExit*1.02,Math.max(0.02,rExit*0.11),10,32),rimM.clone());lip.rotation.x=Math.PI/2;lip.position.y=-len;g.add(lip);
  const lip2=new T.Mesh(new T.TorusGeometry(rExit*1.02,Math.max(0.008,rExit*0.035),8,28),rimBright);lip2.rotation.x=Math.PI/2;lip2.position.y=-len-0.004;g.add(lip2);
  // Hot throat: a short glowing liner you can see from the side, not only up the bore.
  const liner=new T.Mesh(new T.CylinderGeometry(rThroat*0.7,rExit*0.42,len*0.62,20,1,true),hotM.clone());liner.position.y=-len*0.38;liner.visible=false;g.add(liner);
  const glow=new T.Mesh(new T.CircleGeometry(rThroat*0.78,20),hotM.clone());glow.rotation.x=Math.PI/2;glow.position.y=-0.03;glow.visible=false;g.add(glow);g.userData.core=glow;g.userData.liner=liner;
  const plume=new T.Group();const cLen=Math.max(0.8,len*1.3);
  const core=new T.Mesh(new T.ConeGeometry(rExit*0.28,cLen,16,1,true),coreMat);core.position.y=-len-0.04-cLen/2;plume.add(core);
  const oLen=Math.max(1.6,len*3.2);const outer=new T.Mesh(new T.ConeGeometry(rExit*0.62,oLen,16,1,true),outerMat.clone());outer.position.y=-len-0.35-oLen/2;plume.add(outer);
  plume.visible=false;g.add(plume);g.userData.plume=plume;g.userData.outer=outer;
  const dias=new T.Group();for(let i=0;i<5;i++){const s=new T.Mesh(new T.SphereGeometry(Math.max(0.02,rExit*0.2),8,6),diaMat());s.scale.y=2.6;dias.add(s);}dias.visible=false;g.add(dias);g.userData.dias=dias;
  nocull(g);return g;}
 function cluster(n,spread,rt,re,len,cant){const g=new T.Group();g.name='stageEngines';
  if(n<=1)g.add(bell(rt,re,len));
  else{for(let i=0;i<n;i++){const a=Math.PI/4+i*Math.PI*2/n;const b=bell(rt,re,len);b.position.set(Math.cos(a)*spread,0,Math.sin(a)*spread);
    const axis=new T.Vector3(-Math.sin(a),0,Math.cos(a));b.quaternion.setFromAxisAngle(axis,cant||0.12);b.userData._axis=axis;b.userData._cant=cant||0.12;g.add(b);}
   const hub=new T.Mesh(new T.CylinderGeometry(spread*0.55,spread*0.85,0.08,24),skirtM);hub.position.y=0.02;hub.frustumCulled=false;g.add(hub);}
  const bandR=n<=1?re*1.15:Math.max(spread+re,0.7);
  const band=new T.Mesh(new T.TorusGeometry(bandR,0.045,8,32),skirtM);band.rotation.x=Math.PI/2;band.position.y=0.05;band.frustumCulled=false;g.add(band);
  nocull(g);return g;}
 // Minuteman III: stage 1 is four gimbaled bells under a 1.68 m body. Stages 2 and 3 are one larger bell each.
 // Bells hang entirely below the skirt plane (wrapper y=0 is the tail).
 function mmEngines(){const root=new T.Group();root.name='mmEng';
  const s1=cluster(4,0.36,0.13,0.34,1.05,0.16);s1.position.y=-0.08;root.add(s1);
  const s2=cluster(1,0,0.2,0.52,1.15);s2.position.y=-0.08;s2.visible=false;root.add(s2);
  const s3=cluster(1,0,0.16,0.42,0.98);s3.position.y=-0.08;s3.visible=false;root.add(s3);
  const bus=cluster(4,0.16,0.028,0.05,0.14,0.08);bus.position.y=-0.04;bus.visible=false;root.add(bus);
  root.userData.sets=[s1,s2,s3,bus];return root;}
 function lightSet(root,h){const thin=Math.min(1,Math.max(0,(h-2500)/30000));
  root.traverse(o=>{if(!o.userData)return;if(o.userData.plume){o.userData.plume.visible=true;const s=1+thin*0.55;o.userData.plume.scale.set(s,1+thin*0.8,s);}
   if(o.userData.outer&&o.userData.outer.material)o.userData.outer.material.opacity=0.18+thin*0.28;
   if(o.userData.dias){o.userData.dias.visible=h>8000;const k=Math.min(1,(h-8000)/22000);o.userData.dias.children.forEach((s,i)=>{s.position.y=-(0.7+i*(0.55+k*1.6));s.material.opacity=(0.75-i*0.1)*(0.4+k*0.5);});}
   if(o.userData.core)o.userData.core.visible=true;if(o.userData.liner)o.userData.liner.visible=true;
   if(o.userData.inner){o.userData.inner.emissive.setHex(0xff5a12);o.userData.inner.emissiveIntensity=1.6;}});}
 function darkSet(root){root.traverse(o=>{if(!o.userData)return;if(o.userData.plume)o.userData.plume.visible=false;if(o.userData.dias)o.userData.dias.visible=false;if(o.userData.core)o.userData.core.visible=false;if(o.userData.liner)o.userData.liner.visible=false;
  if(o.userData.inner){o.userData.inner.emissive.setHex(0x2a1008);o.userData.inner.emissiveIntensity=0.35;}});}
 function showSet(root,i,lit,h){const sets=root.userData.sets;sets.forEach((s,k)=>{s.visible=k===i;if(k===i&&lit)lightSet(s,h);else darkSet(s);});}
 const dressed=new WeakSet();
 function dressMM(o){if(!o.mesh||dressed.has(o.mesh))return;if(!(o.name==='ICBM'||o.name==='SLBM')||o.rv)return;
  hideStock(o.mesh);hideStock(o.mesh.children&&o.mesh.children[0]);
  const e=mmEngines();o.mesh.add(e);o.mesh.userData._engLive=e;dressed.add(o.mesh);}
 function hideStock(root){if(!root)return;const nz=root.userData&&root.userData.nozzles;if(nz)nz.forEach(n=>{n.visible=false;});root.children&&root.children.forEach(c=>{if(c.userData&&c.userData.nozzles)c.userData.nozzles.forEach(n=>{n.visible=false;});});}
 function dressSegs(){const S=window.__gstaging;if(!S)return;for(const s of S.segs){if(!s.m||s.m.userData._eng)continue;hideStock(s.m);hideStock(s.m.children&&s.m.children[0]);const four=s.h>5;
  const e=four?cluster(4,0.36,0.13,0.34,1.05,0.16):cluster(1,0,0.18,0.48,1.05);e.position.y=-s.h/2-0.02;darkSet(e);s.m.add(e);s.m.userData._eng=1;}}
 function dressSM3(o){const U=o.mesh&&o.mesh.userData;if(!U||!U.parts||U._eng)return;U._eng=1;const P=U.parts;
  (U.nz||[]).forEach(g=>{g.children.forEach(c=>{c.visible=false;});if(!g.userData._bell){const b=bell(0.04,0.09,0.26);b.position.y=-0.04;g.add(b);g.userData._bell=b;}nocull(g);});
  if(P.S2&&!P.S2.userData._bell){const b=bell(0.07,0.15,0.32);b.position.y=-0.02;b.visible=false;P.S2.add(b);P.S2.userData._bell=b;}
  if(P.S3&&!P.S3.userData._bell){const b=bell(0.045,0.1,0.24);b.position.y=-0.04;b.visible=false;P.S3.add(b);P.S3.userData._bell=b;}
  if(U.n3)U.n3.visible=false;}
 // Particles that would spawn inside the bell get pushed aft of the lip and kept narrow.
 const _fs=fire.spawn.bind(fire);
 fire.spawn=function(p,...a){const o=window.camFollow;if(o&&o.pos&&p&&p.distanceTo&&!o.rv&&!o.done&&(o.type==='ballistic'||o.type==='sm3')){
  const d=(o.dir&&o.dir.lengthSq()>0.2)?o.dir:(o.vel&&o.vel.lengthSq()>1?o.vel:null);
  if(d){const dir=d.clone().normalize();const along=p.clone().sub(o.pos).dot(dir);if(along>-2.4&&p.distanceTo(o.pos)<22){p=p.clone().addScaledVector(dir,-2.5-along);if(typeof a[4]==='number')a[4]=Math.min(a[4],0.55);if(typeof a[5]==='number')a[5]=Math.min(a[5],1.1);}}}
  return _fs(p,...a);};
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
  for(const o of projs){if(o.done||!o.mesh)continue;
   if((o.name==='ICBM'||o.name==='SLBM')&&!o.rv){dressMM(o);const e=o.mesh.userData._engLive;if(e){const man=!!o.man;const st=man?(o.stg||0):(o.gs?o.gs.stg:(o.stg||0));const bus=!man&&o.gs&&o.gs.bus;const coast=man?(o.coastT>0):(o.gs&&o.gs.coast>0);showSet(e,bus?3:Math.min(2,st),!coast&&!bus,o.pos.y);}}
   if(o.type==='sm3'){dressSM3(o);const U=o.mesh.userData,P=U.parts;const lit=o.coast<=0&&o.ph<4;const h=o.pos.y;
    (U.nz||[]).forEach(g=>{if(g.userData._bell){if(lit&&o.ph===0)lightSet(g.userData._bell,h);else darkSet(g.userData._bell);}});
    if(P&&P.S2&&P.S2.userData._bell){P.S2.userData._bell.visible=o.ph>=1;if(lit&&o.ph===1)lightSet(P.S2.userData._bell,h);else darkSet(P.S2.userData._bell);}
    if(P&&P.S3&&P.S3.userData._bell){P.S3.userData._bell.visible=o.ph>=2&&o.ph<4;if(lit&&o.ph>=2)lightSet(P.S3.userData._bell,h);else darkSet(P.S3.userData._bell);}}}
  dressSegs();
  const S=window.__gstaging;if(S){for(const s of S.segs){if(s.pl&&s.pl[1])s.pl[1].constant+=0.06;}for(const o of S.live){if(o._stPl&&o._stPl[0])o._stPl[0].constant+=0.05;}}
  if(typeof padRocket!=='undefined'&&padRocket&&!padRocket.userData._engCull){padRocket.userData._engCull=1;padRocket.traverse(o=>{if(!o.isMesh)return;const nm=(o.name||'')+(o.parent&&o.parent.name||'');if(/noz|bell|merlin|raptor|engine/i.test(nm)||(o.geometry&&o.geometry.type==='LatheGeometry'&&o.position.y<12)){o.frustumCulled=false;o.renderOrder=Math.max(o.renderOrder||0,5);if(o.material)o.material.fog=false;}});}};
 window.__mslEng={bell,cluster};})();
