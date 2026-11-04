// ===== MSL_SM3CAM (msl builder): Mk 41 VLS hatch + close 3rd-person launch camera for SM-3 (refs/sm3/launch_maya.jpg). No new buttons.
// Hatch opens (0.45 s, missile held in cell), Mk 72 ignites, missile clears the deck through the plenum cloud with flying hatch/frangible debris.
// Camera: deck-level, abeam of the cell, ~30 m out, tracks missile for 7 s then hands back to normal follow. =====
(()=>{const T=THREE;if(!window.__msl_sm3)return;const HOLD=0.45,CAMT=7;const live=[];
 const steel=new T.MeshStandardMaterial({color:0x6d747b,metalness:0.6,roughness:0.55}),dark=new T.MeshStandardMaterial({color:0x22262a,metalness:0.4,roughness:0.8});
 function hatch(o){const g=new T.Group();const ship=o.owner&&o.owner.mesh;if(ship)g.quaternion.copy(ship.quaternion);g.position.copy(o.pos).add(new T.Vector3(0,-0.2,0));
  // 8-cell module deck plate w/ 2x4 lids (one opens), raised frames
  const plate=new T.Mesh(new T.BoxGeometry(3.4,0.12,6.4),steel);plate.position.y=-0.06;g.add(plate);
  for(let i=0;i<8;i++){const x=(i%2?0.8:-0.8),z=-2.4+Math.floor(i/2)*1.6;const fr=new T.Mesh(new T.BoxGeometry(1.42,0.08,1.42),dark);fr.position.set(x,0.02,z);g.add(fr);
   if(i===3){const hinge=new T.Group();hinge.position.set(x-0.68,0.09,z);const lid=new T.Mesh(new T.BoxGeometry(1.34,0.09,1.34),steel);lid.position.x=0.67;hinge.add(lid);g.add(hinge);g.userData.hinge=hinge;g.userData.cell=new T.Vector3(x,0,z);}
   else{const lid=new T.Mesh(new T.BoxGeometry(1.34,0.09,1.34),steel);lid.position.set(x,0.09,z);g.add(lid);}}
  scene.add(g);g.updateMatrixWorld(true);return g;}
 const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);
  for(const o of projs){if(o.type!=='sm3'||o._vls)continue;o._vls=true;const H=hatch(o);const start=H.localToWorld(H.userData.cell.clone()).add(new T.Vector3(0,-6.3,0));
   live.push({o,H,start,t:0,open:false});o.pos.copy(start);o.mesh.position.copy(start);}
  for(const L of live){const o=L.o;if(!o.mesh.userData.plume){const g=new T.Group();const mk=(r,l,c,op)=>{const m=new T.Mesh(new T.ConeGeometry(r,l,20,1,true),new T.MeshBasicMaterial({color:c,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));m.position.y=-l/2;m.rotation.x=Math.PI;return m;};
    g.add(mk(0.2,2.6,0xfff4d8,0.95),mk(0.36,6.5,0xffa040,0.55),mk(0.55,11,0xff7020,0.18));o.mesh.add(g);o.mesh.userData.plume=g;}
   const pl=o.mesh.userData.plume;const on=L.t>=HOLD&&!o.done&&o.ph<4&&!(o.coast>0);pl.visible=on;if(on){const h=o.pos.y,f=1+0.12*Math.sin(L.t*60)+0.06*Math.random();const vac=Math.min(2.2,1+h/30000);pl.scale.set(vac*(o.ph?0.7:1),f*(o.ph?0.8:1)*vac,vac*(o.ph?0.7:1));}}
  for(let i=live.length-1;i>=0;i--){const L=live[i],o=L.o;L.t+=dt;const h=L.H.userData.hinge;if(o.ph!==L.ph){if(L.ph!==undefined&&o.ph<=2)L.sep=L.t;L.ph=o.ph;}
   if(h)h.rotation.z=Math.min(1,L.t/HOLD)*1.95;// lid swings ~110 deg
   if(L.t<HOLD){o.pos.copy(L.start);o.vel.set(0,30,0);o.t=0;o.burn=0;o.mesh.position.copy(L.start);if(Math.random()<0.4)smoke.spawn(L.start.clone().setY(L.start.y+6.4),0,1,0,0.6,1,3,0.9,0.9,0.92,0.4,0.05,0);}
   else if(!L.open){L.open=true;const P=L.start.clone().setY(L.start.y+6.5);for(let k=0;k<26;k++){const b=new T.Mesh(new T.BoxGeometry(0.05+Math.random()*0.15,0.02,0.05+Math.random()*0.2),dark);b.position.copy(P);scene.add(b);
     const v=new T.Vector3((Math.random()-0.5)*30,15+Math.random()*35,(Math.random()-0.5)*30);__msl_sm3.debris.push({m:b,v,w:new T.Vector3(Math.random()*9,Math.random()*9,Math.random()*9),t:0});}
    for(let k=0;k<40;k++)smoke.spawn(P,(Math.random()-0.5)*18,2+Math.random()*10,(Math.random()-0.5)*18,3,5,18,0.97,0.96,0.94,0.9,0.3,0);}
   // VLS exhaust cloud billowing around the missile for the first ~50 m (JS Maya ref); capped at 140 puffs/launch for iPhone
   if(L.open&&(L.puffs||0)<140){const up=o.pos.y-(L.start.y+6.3);if(up<50){const n=Math.min(6,140-(L.puffs||0));L.puffs=(L.puffs||0)+n;
    for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,r=0.5+Math.random()*2.5;const P=o.pos.clone().add(new T.Vector3(Math.cos(a)*r,-1-Math.random()*9,Math.sin(a)*r));
     smoke.spawn(P,Math.cos(a)*(2+Math.random()*4),1+Math.random()*4,Math.sin(a)*(2+Math.random()*4),8,10+Math.random()*6,7,0.98,0.97,0.95,0.9,0.6,0.4);}}}
   if(L.t>40){scene.remove(L.H);live.splice(i,1);}}};
 let N=0;const _uc=updCamera;updCamera=function(dt){_uc(dt);N++;if(window.__msl_camOff)return;const L=live.find(l=>l.o.owner===player&&!l.o.done&&!blastCam&&(l.t<CAMT+HOLD||(l.sep!==undefined&&l.t-l.sep<2.5)));if(!L)return;const o=L.o,ship=o.owner&&o.owner.mesh;
  if(L.sep!==undefined&&L.t-L.sep<2.5){// stage-sep chase: abeam, slightly aft, sees spent stage drop away
   const d=new T.Vector3(0,1,0).applyQuaternion(o.mesh.quaternion);const sd=new T.Vector3().crossVectors(d,new T.Vector3(0,0,1)).normalize();camera.position.copy(o.pos).addScaledVector(sd,16).addScaledVector(d,-9);camera.lookAt(o.pos.clone().addScaledVector(d,-5));camera.fov=40;camera.updateProjectionMatrix();return;}
  const side=new T.Vector3(1,0,0);if(ship)side.applyQuaternion(ship.quaternion);side.y=0;side.normalize();const fwd=new T.Vector3(0,0,1);if(ship)fwd.applyQuaternion(ship.quaternion);
  const base=L.start.clone().setY(L.start.y+6.3);
  // fixed deck-edge camera ~30 m abeam (like the launch photos); telephoto tracks the missile so it fills ~1/3 of frame height
  const cp=base.clone().addScaledVector(side,30).addScaledVector(fwd,-10).add(new T.Vector3(0,3,0));camera.position.copy(cp);
  if(L.t<HOLD){camera.lookAt(base.clone().add(new T.Vector3(0,2.5,0)));camera.fov=34;}
  else{const c=o.pos.clone().addScaledVector(new T.Vector3(0,1,0).applyQuaternion(o.mesh.quaternion),3.2);camera.lookAt(c);const d=cp.distanceTo(c);camera.fov=Math.max(1.2,Math.min(34,2*Math.atan(6.55*0.85*(window.__msl_camZoom||1)/d)*180/Math.PI));}
  camera.updateProjectionMatrix();};
 window.__msl_sm3cam={live,cam:camera,get n(){return N}};})();
