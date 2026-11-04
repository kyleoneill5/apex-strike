// Stage engines: nozzle bells, aft skirt, interstage. Parent is the flight wrapper
// (not the clipped stage mesh), frustum culling is off, and the particle plume
// starts aft of the exit so the bell stays readable from the follow camera.
// Minuteman III / SLBM, the MIRV bus, SM-3 (Mk 72 / Mk 104 / Mk 136), launchers.
(()=>{const T=THREE;
 const metal=new T.MeshStandardMaterial({color:0xb7b3ad,metalness:0.86,roughness:0.28,side:T.DoubleSide});
 const innerM=new T.MeshStandardMaterial({color:0x2a211c,metalness:0.45,roughness:0.72,side:T.DoubleSide,emissive:0x1a0c08,emissiveIntensity:0.35});
 const skirtM=new T.MeshStandardMaterial({color:0x2a2c30,metalness:0.7,roughness:0.38,side:T.DoubleSide});
 const throatM=new T.MeshStandardMaterial({color:0x100c0a,metalness:0.2,roughness:0.95,side:T.DoubleSide});
 const hotM=new T.MeshBasicMaterial({color:0xfff1c8,transparent:true,opacity:0.95,depthWrite:false,blending:T.AdditiveBlending});
 const coreMat=new T.MeshBasicMaterial({color:0xfff6df,transparent:true,opacity:0.9,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 const outerMat=new T.MeshBasicMaterial({color:0xffb15a,transparent:true,opacity:0.28,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
 const diaMat=()=>new T.MeshBasicMaterial({color:0xfff8ee,transparent:true,opacity:0.55,depthWrite:false,blending:T.AdditiveBlending});
 function nocull(o){o.traverse(c=>{c.frustumCulled=false;if(c.isMesh){c.renderOrder=Math.max(c.renderOrder||0,6);if(c.material)c.material.fog=false;}});}
 function bell(rThroat,rExit,len){const g=new T.Group();const pts=[];
  for(let i=0;i<=14;i++){const t=i/14;pts.push(new T.Vector2(rThroat+(rExit-rThroat)*Math.pow(t,0.55),-t*len));}
  const wall=new T.Mesh(new T.LatheGeometry(pts,32),metal);g.add(wall);
  const inn=new T.Mesh(new T.LatheGeometry(pts.map(p=>new T.Vector2(p.x*0.86,p.y+0.001)),28),innerM);g.add(inn);
  const cap=new T.Mesh(new T.CircleGeometry(rThroat*0.7,20),throatM);cap.rotation.x=Math.PI/2;cap.position.y=-0.003;g.add(cap);
  const lip=new T.Mesh(new T.TorusGeometry(rExit*0.98,Math.max(0.008,rExit*0.07),8,28),skirtM);lip.rotation.x=Math.PI/2;lip.position.y=-len;g.add(lip);
  const skirt=new T.Mesh(new T.CylinderGeometry(rExit*1.08,rThroat*1.7,Math.max(0.05,len*0.28),24,1,true),skirtM);skirt.position.y=len*0.06;g.add(skirt);
  const glow=new T.Mesh(new T.CircleGeometry(rThroat*0.62,16),hotM);glow.rotation.x=Math.PI/2;glow.position.y=-0.012;glow.visible=false;g.add(glow);g.userData.core=glow;
  const plume=new T.Group();const cLen=Math.max(0.55,len*1.6);
  const core=new T.Mesh(new T.ConeGeometry(rExit*0.22,cLen,16,1,true),coreMat);core.position.y=-len*0.15-cLen/2;plume.add(core);
  const oLen=Math.max(1.2,len*4.2);const outer=new T.Mesh(new T.ConeGeometry(rExit*0.7,oLen,16,1,true),outerMat.clone());outer.position.y=-len*1.15-oLen/2;plume.add(outer);
  plume.visible=false;g.add(plume);g.userData.plume=plume;g.userData.outer=outer;
  const dias=new T.Group();for(let i=0;i<5;i++){const s=new T.Mesh(new T.SphereGeometry(Math.max(0.02,rExit*0.2),8,6),diaMat());s.scale.y=2.6;dias.add(s);}dias.visible=false;g.add(dias);g.userData.dias=dias;
  nocull(g);return g;}
 function cluster(n,spread,rt,re,len){const g=new T.Group();g.name='stageEngines';
  if(n<=1)g.add(bell(rt,re,len));
  else{for(let i=0;i<n;i++){const a=Math.PI/4+i*Math.PI*2/n;const b=bell(rt,re,len);b.position.set(Math.cos(a)*spread,0,Math.sin(a)*spread);g.add(b);}
   const hub=new T.Mesh(new T.CylinderGeometry(spread*0.42,spread*0.62,0.07,20),skirtM);hub.frustumCulled=false;g.add(hub);}
  const band=new T.Mesh(new T.TorusGeometry(Math.max(spread,re)*1.28+0.04,0.03,8,28),skirtM);band.rotation.x=Math.PI/2;band.position.y=0.03;band.frustumCulled=false;g.add(band);
  nocull(g);return g;}
 function mmEngines(){const root=new T.Group();root.name='mmEng';
  const s1=cluster(4,0.42,0.09,0.2,0.5);s1.position.y=-0.02;root.add(s1);
  const s2=cluster(1,0,0.16,0.3,0.46);s2.position.y=-0.02;s2.visible=false;root.add(s2);
  const s3=cluster(1,0,0.12,0.24,0.4);s3.position.y=-0.02;s3.visible=false;root.add(s3);
  const bus=cluster(4,0.16,0.028,0.05,0.12);bus.position.y=-0.02;bus.visible=false;root.add(bus);
  root.userData.sets=[s1,s2,s3,bus];return root;}
 function lightSet(root,h){const thin=Math.min(1,Math.max(0,(h-2500)/30000));
  root.traverse(o=>{if(!o.userData)return;if(o.userData.plume){o.userData.plume.visible=true;const s=1+thin*2.8;o.userData.plume.scale.set(s,1+thin*1.5,s);}
   if(o.userData.outer&&o.userData.outer.material)o.userData.outer.material.opacity=0.22+thin*0.25;
   if(o.userData.dias){o.userData.dias.visible=h>8000;const k=Math.min(1,(h-8000)/22000);o.userData.dias.children.forEach((s,i)=>{s.position.y=-(0.45+i*(0.38+k*1.5));s.material.opacity=(0.7-i*0.1)*(0.45+k*0.5);});}
   if(o.userData.core)o.userData.core.visible=true;});}
 function darkSet(root){root.traverse(o=>{if(!o.userData)return;if(o.userData.plume)o.userData.plume.visible=false;if(o.userData.dias)o.userData.dias.visible=false;if(o.userData.core)o.userData.core.visible=false;});}
 function showSet(root,i,lit,h){const sets=root.userData.sets;sets.forEach((s,k)=>{s.visible=k===i;if(k===i&&lit)lightSet(s,h);else darkSet(s);});}
 const dressed=new WeakSet();
 function dressMM(o){if(!o.mesh||dressed.has(o.mesh))return;if(!(o.name==='ICBM'||o.name==='SLBM')||o.rv)return;
  const nz=o.mesh.userData&&o.mesh.userData.nozzles;if(nz)nz.forEach(n=>{n.visible=false;});
  const e=mmEngines();o.mesh.add(e);o.mesh.userData._engLive=e;dressed.add(o.mesh);}
 function dressSegs(){const S=window.__gstaging;if(!S)return;for(const s of S.segs){if(!s.m||s.m.userData._eng)continue;const four=s.h>5;
  const e=cluster(four?4:1,four?0.38:0,four?0.09:0.14,four?0.2:0.28,0.48);e.position.y=-s.h/2-0.03;darkSet(e);s.m.add(e);s.m.userData._eng=1;}}
 function dressSM3(o){const U=o.mesh&&o.mesh.userData;if(!U||!U.parts||U._eng)return;U._eng=1;const P=U.parts;
  (U.nz||[]).forEach(g=>{g.children.forEach(c=>{c.visible=false;});if(!g.userData._bell){const b=bell(0.04,0.09,0.26);b.position.y=-0.04;g.add(b);g.userData._bell=b;}nocull(g);});
  if(P.S2&&!P.S2.userData._bell){const b=bell(0.07,0.15,0.32);b.position.y=-0.02;b.visible=false;P.S2.add(b);P.S2.userData._bell=b;}
  if(P.S3&&!P.S3.userData._bell){const b=bell(0.045,0.1,0.24);b.position.y=-0.04;b.visible=false;P.S3.add(b);P.S3.userData._bell=b;}
  if(U.n3)U.n3.visible=false;}
 // Particles that would spawn inside the bell get pushed aft of the lip and kept narrow.
 const _fs=fire.spawn.bind(fire);
 fire.spawn=function(p,...a){const o=window.camFollow;if(o&&o.pos&&p&&p.distanceTo&&!o.rv&&!o.done&&(o.type==='ballistic'||o.type==='sm3')){
  const d=(o.dir&&o.dir.lengthSq()>0.2)?o.dir:(o.vel&&o.vel.lengthSq()>1?o.vel:null);
  if(d){const dir=d.clone().normalize();const along=p.clone().sub(o.pos).dot(dir);if(along>-1.7&&p.distanceTo(o.pos)<16){p=p.clone().addScaledVector(dir,-1.75-along);if(typeof a[4]==='number')a[4]=Math.min(a[4],0.42);if(typeof a[5]==='number')a[5]=Math.min(a[5],0.9);}}}
  return _fs(p,...a);};
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
  for(const o of projs){if(o.done||!o.mesh)continue;
   if((o.name==='ICBM'||o.name==='SLBM')&&!o.rv){dressMM(o);const e=o.mesh.userData._engLive;if(e){const st=o.gs?o.gs.stg:(o.stg||0);const bus=o.gs&&o.gs.bus;const lit=!(o.gs&&o.gs.coast>0)&&!(o.coastT>0)&&!(o.gs&&o.gs.bus);showSet(e,bus?3:Math.min(2,st),lit,o.pos.y);}}
   if(o.type==='sm3'){dressSM3(o);const U=o.mesh.userData,P=U.parts;const lit=o.coast<=0&&o.ph<4;const h=o.pos.y;
    (U.nz||[]).forEach(g=>{if(g.userData._bell){if(lit&&o.ph===0)lightSet(g.userData._bell,h);else darkSet(g.userData._bell);}});
    if(P&&P.S2&&P.S2.userData._bell){P.S2.userData._bell.visible=o.ph>=1;if(lit&&o.ph===1)lightSet(P.S2.userData._bell,h);else darkSet(P.S2.userData._bell);}
    if(P&&P.S3&&P.S3.userData._bell){P.S3.userData._bell.visible=o.ph>=2&&o.ph<4;if(lit&&o.ph>=2)lightSet(P.S3.userData._bell,h);else darkSet(P.S3.userData._bell);}}}
  dressSegs();
  const S=window.__gstaging;if(S){for(const s of S.segs){if(s.pl&&s.pl[1])s.pl[1].constant+=0.95;}for(const o of S.live){if(o._stPl&&o._stPl[0])o._stPl[0].constant+=0.9;}}
  if(typeof padRocket!=='undefined'&&padRocket&&!padRocket.userData._engCull){padRocket.userData._engCull=1;padRocket.traverse(o=>{if(!o.isMesh)return;const nm=(o.name||'')+(o.parent&&o.parent.name||'');if(/noz|bell|merlin|raptor|engine/i.test(nm)||(o.geometry&&o.geometry.type==='LatheGeometry'&&o.position.y<12)){o.frustumCulled=false;o.renderOrder=Math.max(o.renderOrder||0,5);if(o.material)o.material.fog=false;}});}};
 window.__mslEng={bell,cluster};})();
