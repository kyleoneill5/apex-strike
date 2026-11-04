// ===== ppl_people.js (#20): realistic rigged/animated people. Enemy infantry (Red Coalition markings, from gnavy_enemy), crew/pilot hooks, OWNER elite commander kit (Kyle only).
// Asset: models/ppl_soldier.glb — original CC0 soldier (dev/LICENSES.md). Anims: Idle/Walk/Run. Bones: mixamorig* (colon form also accepted).
const PPL=(()=>{const T=THREE;let SRC=null,CLIPS=null;const live=[];const ready=[];
 const SU=(src)=>{const m=new Map(),c=src.clone(true);const a=[],b=[];src.traverse(o=>a.push(o));c.traverse(o=>b.push(o));a.forEach((o,i)=>m.set(o,b[i]));c.traverse(o=>{if(o.isSkinnedMesh){const s=o.skeleton;o.bind(new T.Skeleton(s.bones.map(x=>m.get(x)),s.boneInverses),o.bindMatrix);}});return c;};
 const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;};
 // Red Coalition flag = same art as gnavy_enemy.js (red field, black diagonal, white star)
 const flagTex=cv(150,100,(x,w,h)=>{x.fillStyle='#8e0f16';x.fillRect(0,0,w,h);x.fillStyle='#111';x.beginPath();x.moveTo(0,h);x.lineTo(w*0.35,h);x.lineTo(w,0);x.lineTo(w*0.65,0);x.fill();x.fillStyle='#fff';x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:17;x.lineTo(30+Math.cos(a)*r,28+Math.sin(a)*r);}x.fill();});
 const ownerTex=cv(128,128,(x,w,h)=>{x.fillStyle='#0a0a0a';x.fillRect(0,0,w,h);x.fillStyle='#b8860b';x.fillRect(14,14,100,100);x.strokeStyle='#d4a017';x.lineWidth=8;x.strokeRect(6,6,w-12,h-12);const F=[[[64,20],[40,46],[64,46]],[[64,20],[88,46],[64,46]],[[40,46],[64,110],[64,46]],[[88,46],[64,110],[64,46]],[[24,46],[40,46],[64,110]],[[104,46],[88,46],[64,110]],[[24,46],[40,46],[64,20]],[[104,46],[88,46],[64,20]]],C=['#ffffff','#cfefff','#9fd6f5','#e8f8ff','#7fbfe6','#b6e4fb','#dff4ff','#a8dcf7'];F.forEach((f,i)=>{x.fillStyle=C[i];x.beginPath();f.forEach(q=>x.lineTo(q[0],q[1]));x.fill();});});
 const KIT={enemy:{body:0x4a4e3c,visor:0x221a14,rough:0.85,patch:flagTex,band:0x8e0f16},
  owner:{body:0x0d0d0f,visor:0xd4a017,rough:0.45,patch:ownerTex,band:0xd4a017,glow:true},
  crew:{body:0x5a5f4a,visor:0x2a2218,rough:0.8,patch:flagTex,band:0x8e0f16}};
 const MC={};function mats(k){if(MC[k])return MC[k];const K=KIT[k];const r={};SRC.traverse(o=>{if(!o.isMesh)return;const n=o.material.clone();if(/Visor/.test(n.name)){n.color.setHex(K.visor);n.metalness=k==='owner'?0.9:0.3;n.roughness=k==='owner'?0.2:0.4;if(K.glow){n.emissive=new T.Color(0x6b4a00);}}else if(/Body/.test(n.name)){n.color.setHex(K.body);n.roughness=K.rough;if(K.glow){n.metalness=0.35;n.emissive=new T.Color(0x1a1408);}}r[o.material.name]=n;});return MC[k]=r;}
 function gear(root,k){const K=KIT[k];const bone=n=>root.getObjectByName('mixamorig'+n)||root.getObjectByName('mixamorig:'+n);
  const sp=bone('Spine2'),hd=bone('Head'),rh=bone('RightHand'),la=bone('LeftArm');const S=1/(root.userData.sc||1);
  const vestM=new T.MeshStandardMaterial({color:k==='owner'?0x111114:0x3b3d30,roughness:0.9});
  if(sp){const v=new T.Mesh(new T.BoxGeometry(34,30,22),vestM);v.position.set(0,8,2);sp.add(v);for(let i=-1;i<=1;i++){const p=new T.Mesh(new T.BoxGeometry(8,11,5),vestM);p.position.set(i*10,2,14);sp.add(p);}
   const patch=new T.Mesh(new T.PlaneGeometry(9,6),new T.MeshStandardMaterial({map:K.patch,roughness:0.8}));patch.position.set(-9,15,13.2);sp.add(patch);
   if(k==='owner'){const trim=new T.Mesh(new T.TorusGeometry(19,0.9,6,24),new T.MeshStandardMaterial({color:0xd4a017,metalness:1,roughness:0.25,emissive:0x5a3c00}));trim.rotation.x=Math.PI/2;trim.position.y=22;sp.add(trim);const dm=new T.MeshPhysicalMaterial({color:0xeaf8ff,metalness:0,roughness:0.02,transmission:0.6,ior:2.42,iridescence:0.6,emissive:0x2a4a66});for(let i=0;i<12;i++){const a=i/12*Math.PI*2,g=new T.Mesh(new T.OctahedronGeometry(1.4),dm);g.position.set(Math.cos(a)*19,22,Math.sin(a)*19);sp.add(g);}}}
  if(hd){const hm=new T.Mesh(new T.SphereGeometry(13,16,10,0,Math.PI*2,0,Math.PI*0.55),new T.MeshStandardMaterial({color:k==='owner'?0x0b0b0b:0x4e5240,roughness:k==='owner'?0.3:0.8,metalness:k==='owner'?0.5:0}));hm.position.set(0,12,1);hd.add(hm);
   if(k==='owner'){const vis=new T.Mesh(new T.SphereGeometry(11.5,16,8,-1.1,2.2,1.2,0.6),new T.MeshStandardMaterial({color:0xd4a017,metalness:1,roughness:0.08,emissive:0x3a2600}));vis.rotation.y=0;vis.position.set(0,9,2);hd.add(vis);}}
  if(la){const b=new T.Mesh(new T.CylinderGeometry(5.5,5.5,5,12,1,true),new T.MeshStandardMaterial({color:K.band,roughness:0.7,side:T.DoubleSide}));b.position.y=12;la.add(b);}
  if(rh){const gm=new T.MeshStandardMaterial({color:0x1a1a1a,roughness:0.55,metalness:0.6});const g=new T.Group();const P=(geo,x,y,z)=>{const m=new T.Mesh(geo,gm);m.position.set(x,y,z);g.add(m);};
   P(new T.BoxGeometry(4,6,42),0,0,8);P(new T.CylinderGeometry(0.9,0.9,26,8).rotateX(Math.PI/2),0,1.2,34);P(new T.BoxGeometry(3,12,4),0,-8,4);P(new T.BoxGeometry(3.2,7,14),0,-1,-14);g.position.set(2,-6,2);g.rotation.set(0.55,0.2,0.1);rh.add(g);}
  if(k==='owner'){root.traverse(o=>{if(o.isSkinnedMesh&&!/visor/.test(o.name)){const sh=o.clone();sh.material=new T.MeshBasicMaterial({color:0xffc83a,side:T.BackSide,transparent:true,opacity:0.35,depthWrite:false});sh.onBeforeRender=()=>{const t=performance.now()/1000;const k=Math.max(0,Math.sin(t*3.1))*Math.abs(Math.sin(t*7.3));sh.material.opacity=0.25+0.15*k;sh.material.color.setRGB(1,0.78+0.22*k,0.23+0.77*k*k);};sh.userData.outline=1;sh.scale.multiplyScalar(1.025);sh.frustumCulled=false;o.parent.add(sh);sh.bind(o.skeleton,o.bindMatrix);}});}}
 function make(k='enemy'){if(!SRC)return null;const r=SU(SRC);const M=mats(k);r.traverse(o=>{if(o.isMesh){o.material=M[o.material.name]||o.material;o.castShadow=true;o.frustumCulled=false;}});
  const wrap=new T.Group();wrap.add(r);gear(r,k);wrap.scale.setScalar(0.01);const mx=new T.AnimationMixer(r);const A={};for(const c of CLIPS)A[c.name]=mx.clipAction(c);
  const p={root:wrap,mixer:mx,A,k,state:'',dead:0,set(s){if(s===this.state)return;const n=A[s==='aim'?'Idle':s];if(!n)return;const o=A[this.state==='aim'?'Idle':this.state];n.reset().fadeIn(0.25).play();if(o&&o!==n)o.fadeOut(0.25);this.state=s;},
   kill(){this.dead=0.001;},revive(){this.dead=0;wrap.rotation.x=0;wrap.position.y=0;this.set('Idle');}};
  p.arm=r.getObjectByName('mixamorig:RightArm')||r.getObjectByName('mixamorigRightArm');p.set('Idle');mx.update(Math.random()*2);wrap.userData.ppl=p;live.push(p);return p;}
 function tick(dt){const cam=typeof camera!=="undefined"?camera:null;for(const p of live){if(!p.root.parent)continue;let d=0;if(cam){p.root.getWorldPosition(_v);d=_v.distanceTo(cam.position);}
   const far=d>80;if(!p.root.visible)continue;p._acc=(p._acc||0)+dt;if(far&&p._acc<0.2)continue;// LOD: far troops animate at 5 Hz, hidden past 900 m
   p.mixer.update(p._acc);p._acc=0;
   if(p.state==='Idle'||p.state==='aim'){const r=p.root.children[0];const q=(n,e)=>{const b=r&&(r.getObjectByName('mixamorig'+n)||r.getObjectByName('mixamorig:'+n));if(b)b.quaternion.setFromEuler(e);};
    q('LeftArm',p._eL||(p._eL=new T.Euler(0.2,0,-1.55)));q('RightArm',p._eR||(p._eR=new T.Euler(0.55,0.25,1.4)));
    q('LeftForeArm',p._eLF||(p._eLF=new T.Euler(0,0.5,0)));q('RightForeArm',p._eRF||(p._eRF=new T.Euler(0.35,-0.85,0.15)));}
   if(p.state==='aim'&&p.arm){p.arm.rotation.x-=0.9;}
   if(p.dead){p.dead=Math.min(1,p.dead+dt*1.6);p.root.rotation.x=-1.5*p.dead*p.dead;p.root.position.y=0.15*p.dead;p.mixer.timeScale=1-p.dead;}else p.mixer.timeScale=1;}}
 const _v=new T.Vector3();
 // ---- enemy infantry: replace garmy box-men inside each squad with rigged soldiers (keeps garmy targets/hit logic) ----
 function dressArmy(){const A=window.__army;const units=(A&&A.U)||(typeof targets!=='undefined'?targets.filter(t=>t.army&&t.type==='inf'):[]);let n=0;
  for(const u of units){if(u.type!=='inf'||u.ppl)continue;u.ppl=[];for(const m of u.mesh.userData.men||[]){const p=make('enemy');if(!p)break;p.root.position.copy(m.position);p.root.rotation.y=m.rotation.y;m.visible=false;m.userData.pplHidden=1;u.mesh.add(p.root);u.ppl.push(p);n++;}}
  return n;}
 function updArmy(){if(typeof targets==='undefined')return;for(const u of targets){if(!u.ppl)continue;for(const p of u.ppl){if(!u.alive){if(!p.dead)p.kill();}else{if(p.dead)p.revive();p.set(u.spd>0.5&&u.vel&&u.vel.lengthSq()>0.3?'Run':(Math.sin(u.phase+performance.now()/4000)>0?'aim':'Idle'));}}
   const near=nearU(u);for(const p of u.ppl)p.root.visible=near;for(const m of u.mesh.userData.men||[])if(m.userData.pplHidden)m.visible=!near;}}
 // LOD/impostor: skinned people only within 160 m of camera (max 4 squads = 20 skinned); farther squads fall back to garmy's baked low-poly men (shared geometry, ~0 cost), mixers skipped.
 const _w=new THREE.Vector3();function nearU(u){const cam=typeof camera!=='undefined'?camera:null;if(!cam)return false;u.mesh.getWorldPosition(_w);return _w.distanceTo(cam.position)<160;}
 // ---- crew/pilot hooks: other builders call PPL.crew(parentObj,{n,pose:'sit'|'stand',kind}) ----
 function crew(parent,o={}){const out=[];const n=o.n||1;for(let i=0;i<n;i++){const p=make(o.kind||'crew');if(!p)break;const s=(o.scale||1)*0.01;p.root.scale.setScalar(s);
   if(o.pose==='sit'){const r=p.root.children[0];const bn=s=>r.getObjectByName('mixamorig:'+s)||r.getObjectByName('mixamorig'+s);const th=bn('LeftUpLeg'),th2=bn('RightUpLeg'),k1=bn('LeftLeg'),k2=bn('RightLeg');p.sit=()=>{[th,th2].forEach(b=>b&&(b.rotation.x=-1.5));[k1,k2].forEach(b=>b&&(b.rotation.x=1.5));};const ou=p.mixer.update.bind(p.mixer);p.mixer.update=dt=>{ou(dt);p.sit();};}
   if(o.at)p.root.position.copy(o.at[i]||o.at[0]);else p.root.position.set((i-(n-1)/2)*1.4,0,0);parent.add(p.root);out.push(p);}return out;}
 function load(){new (window.__GLTFLoader||GLTFLoader)().load('models/ppl_soldier.glb',g=>{SRC=g.scene;CLIPS=g.animations;SRC.userData.sc=1;const k=dressArmy();window.__pplReady=true;console.log('[ppl] ready, infantry',k);ready.forEach(f=>f());},undefined,e=>console.warn('[ppl] model load failed',e&&e.message));}
 {const _gh=window.gameHook;window.gameHook=function(dt){_gh&&_gh(dt);try{tick(dt);updArmy();}catch(e){console.warn('ppl',e);}};}
 load();
 function igShot(){const u=targets.find(t=>t.ppl&&t.ppl.length);if(!u)return 'none';const R=__milsim.dbg.renderer;const c=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,20000);u.mesh.updateMatrixWorld(true);const w=u.mesh.getWorldPosition(new THREE.Vector3());c.position.set(w.x+7,w.y+2.2,w.z+9);c.lookAt(w.x,w.y+1.1,w.z);camera.position.copy(c.position);updArmy();tick(1/30);for(const p of u.ppl)p.root.visible=true;R.render(scene,c);return u.kind;}
 function place(){const u=targets.find(t=>t.ppl&&t.ppl.length);const w=u.mesh.getWorldPosition(new THREE.Vector3());camera.position.set(w.x+7,w.y+2,w.z+9);camera.lookAt(w);tick(1/30);updArmy();return u.ppl.filter(p=>p.root.visible).length;}
 return {place,igShot,T,make,crew,tick,dressArmy,onReady:f=>SRC?f():ready.push(f),live};})();
window.PPL=PPL;
// Owner (Kyle) elite commander avatar: black uniform, gold trim inlaid with diamonds, gold visor, gold insignia set with a faceted diamond, gold glow with diamond sparkle. Exclusive: mp builder must only call this for the owner peer.
window.ppl_ownerAvatar=function(){const p=PPL.make('owner');if(p)p.root.userData.owner=true;return p;};
