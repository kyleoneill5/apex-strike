//GADOP-BEGIN  Air-defense operator mode: pick a battery from the Air Defense tab -> control it. Stick/drag slews, auto-lock, FIRE = interceptor (followed, stick steers via nose cam). Wrap-only.
{const T=THREE,A=()=>window.__airdef;const O={on:false,site:null,az:0,el:0.35,tg:[],ms:[],lock:null,fol:null,wave:0,kills:0,leaks:0,nxt:0,cd:0,t:0,drag:null};
 const hud=document.createElement('div');hud.id='adHud';hud.style.cssText='position:fixed;left:50%;top:calc(var(--sat,0px) + 8px);transform:translateX(-50%);z-index:60;display:none;font:600 13px -apple-system,system-ui;color:#fff;background:rgba(14,20,30,.55);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:999px;padding:7px 14px;white-space:nowrap;pointer-events:none';
 const ret=document.createElement('div');ret.id='adRet';ret.style.cssText='position:fixed;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border:2px solid rgba(120,255,160,.9);border-radius:50%;z-index:59;display:none;pointer-events:none';
 const box=document.createElement('div');box.id='adLock';box.style.cssText='position:fixed;width:40px;height:40px;margin:-20px 0 0 -20px;border:2px solid #ff4a3a;z-index:59;display:none;pointer-events:none';
 const ex=document.createElement('div');ex.id='adExit';ex.textContent='EXIT';ex.style.cssText='position:fixed;left:calc(var(--sal,0px) + 12px);top:calc(var(--sat,0px) + 54px);z-index:61;display:none;font:700 13px -apple-system,system-ui;color:#fff;background:rgba(14,20,30,.6);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:12px 16px';
 document.body.append(hud,ret,box,ex);
 const NM={thaad:'THAAD',dsling:"DAVID'S SLING",patriot:'PATRIOT',idome:'IRON DOME'};
 const sitePos=s=>(s.radar.pos||s.radar.mesh.position);
 function launcher(){const s=O.site;return (s.l.find(u=>u.alive)||s.l[0]);}
 function eye(){const m=launcher().mesh,d=aimDir();const h=new T.Vector3(d.x,0,d.z);if(h.lengthSq()<1e-6)h.set(0,0,-1);h.normalize();const e=m.position.clone().addScaledVector(h,-25).add(new T.Vector3(0,14,0));const g=terrainH(e.x,e.z)+3;if(e.y<g)e.y=g;return e;}// ~25 m behind + above the launcher so it stays in frame
 function spawnWave(){O.wave++;const c=sitePos(O.site),n=2+O.wave;for(let i=0;i<n;i++){const bal=i%2===1;const a=Math.random()*6.283,R=bal?26000:18000+Math.random()*6000;
   const p=new T.Vector3(c.x+Math.cos(a)*R,bal?14000:600+Math.random()*900,c.z+Math.sin(a)*R);
   const g=new T.Group();if(bal){const b=new T.Mesh(new T.CylinderGeometry(0.7,0.9,12,10),new T.MeshStandardMaterial({color:0xd8d8d0,roughness:0.5}));b.rotation.x=Math.PI/2;g.add(b);}
   else{const m=new T.MeshStandardMaterial({color:0x5a6066,roughness:0.6,metalness:0.4});const f=new T.Mesh(new T.ConeGeometry(1.1,16,8),m);f.rotation.x=-Math.PI/2;g.add(f);const w=new T.Mesh(new T.BoxGeometry(13,0.3,4),m);w.position.z=2;g.add(w);}
   g.scale.setScalar(2);g.position.copy(p);scene.add(g);const tgt=c.clone();tgt.y+=bal?0:120;const v=tgt.clone().sub(p).normalize().multiplyScalar(bal?900:240);
   O.tg.push({m:g,p,v,bal,alive:true});}
  msg('WAVE '+O.wave+' · '+n+' INBOUND',2.5);O.nxt=0;}
 function aimDir(){return new T.Vector3(-Math.sin(O.az)*Math.cos(O.el),Math.sin(O.el),-Math.cos(O.az)*Math.cos(O.el));}
 function fireI(){if(!O.on||O.cd>0)return;const s=O.site,lu=launcher();if(!lu||!lu.alive&&!lu.mesh)return;O.cd=s.type==='idome'?0.8:1.6;
  const proto=s.def.proto&&s.def.proto();const m=proto?proto.clone():new T.Mesh(new T.CylinderGeometry(0.3,0.3,5,8),new T.MeshStandardMaterial({color:0xeeeeee}));m.scale.setScalar(1.6);
  const p=lu.mesh.position.clone().add(new T.Vector3(0,6,0));const d=aimDir();if(d.y<0.25){d.y=0.25;d.normalize();}scene.add(m);
  const I={m,p,dir:d,t:0,tgt:O.lock,spd:Math.max(1500,(s.def.spd||1200)*1.5),turn:Math.max(2.5,(s.def.turn||1.2)*2.5),minD:1e9};O.ms.push(I);O.fol=I;O.lastI=I;
  for(let k=0;k<20;k++)smoke.spawn(p.clone(),(Math.random()-.5)*14,Math.random()*4,(Math.random()-.5)*14,3+Math.random()*3,4,14,0.92,0.9,0.86,0.75);
  if(typeof sfx==='function')sfx('missile',0.7);msg(O.lock?'INTERCEPTOR AWAY · LOCKED':'INTERCEPTOR AWAY · NO LOCK',1.5);}
 const UP=new T.Vector3(0,1,0),_q=new T.Quaternion(),_a=new T.Vector3(),_b=new T.Vector3();
 const segD=(a,b,c)=>{const ab=b.clone().sub(a),L=ab.lengthSq()||1;const k=Math.max(0,Math.min(1,c.clone().sub(a).dot(ab)/L));return a.clone().addScaledVector(ab,k).distanceTo(c);};
 function step(dt){O.t+=dt;O.cd-=dt;const c=sitePos(O.site);
  // slew: stick (rate) — when following an interceptor, the stick steers it instead
  const jx=(typeof joy!=='undefined'?joy.x:0),jy=(typeof joy!=='undefined'?joy.y:0);
  if(!O.fol){O.az-=jx*dt*1.2;O.el=Math.max(0.02,Math.min(1.45,O.el-jy*dt*0.9));}
  if(!O.tg.some(t=>t.alive)){O.nxt+=dt;if(O.nxt>3)spawnWave();}
  for(const t of O.tg){if(!t.alive)continue;if(t.bal)t.v.y-=9.8*dt*0.3;t.p.addScaledVector(t.v,dt);t.m.position.copy(t.p);_a.copy(t.v).normalize();t.m.quaternion.setFromUnitVectors(new T.Vector3(0,0,-1),_a);
   if(Math.random()<dt*20)smoke.spawn(t.p.clone(),0,0,0,t.bal?3:1.5,2,t.bal?8:3,0.9,0.9,0.9,0.6);
   const dh=Math.hypot(t.p.x-c.x,t.p.z-c.z);if(dh<300&&t.p.y<terrainH(t.p.x,t.p.z)+400||t.p.y<terrainH(t.p.x,t.p.z)){t.alive=false;scene.remove(t.m);O.leaks++;explosion(t.p.clone(),t.bal?3:1.5);msg('LEAKER · IMPACT',1.5);}}
  // auto-lock: nearest live target inside 14 deg of the aim line (or keep current)
  const d=aimDir(),e=eye();let best=null,bs=0.24;for(const t of O.tg){if(!t.alive)continue;_a.copy(t.p).sub(e);const L=_a.length();if(L>60000)continue;const ang=_a.normalize().angleTo(d);if(ang<bs){bs=ang;best=t;}}
  if(O.lock&&!O.lock.alive)O.lock=null;if(best)O.lock=best;
  for(let i=O.ms.length-1;i>=0;i--){const I=O.ms[i];I.t+=dt;const sp=I.t<3?120+(I.spd-120)*I.t/3:I.spd;
   if(I.tgt&&!I.tgt.alive)I.tgt=O.tg.find(t=>t.alive)||null;
   if(O.fol===I&&(Math.abs(jx)>0.1||Math.abs(jy)>0.1)){_b.crossVectors(I.dir,UP).normalize();I.dir.applyAxisAngle(UP,-jx*dt*1.4);I.dir.applyAxisAngle(_b,-jy*dt*1.4);I.dir.normalize();}
   else if(I.tgt&&I.t>0.5){_a.copy(I.tgt.p).addScaledVector(I.tgt.v,Math.min(4,I.tgt.p.distanceTo(I.p)/sp)).sub(I.p).normalize();const ang=I.dir.angleTo(_a),mx=I.turn*dt;if(ang>1e-4){_b.crossVectors(I.dir,_a).normalize();I.dir.applyAxisAngle(_b,Math.min(ang,mx));}}
   const p0=I.p.clone();I.p.addScaledVector(I.dir,sp*dt);I.m.position.copy(I.p);_q.setFromUnitVectors(UP,I.dir);I.m.quaternion.copy(_q);
   fire.spawn(I.p.clone().addScaledVector(I.dir,-5),0,0,0,0.08,2.2,0.5,1,0.8,0.45,1);if(Math.random()<0.7)smoke.spawn(I.p.clone().addScaledVector(I.dir,-7),0,0,0,2.5,2,5,0.92,0.92,0.92,0.7);
   let dead=I.t>40||I.p.y<terrainH(I.p.x,I.p.z);
   for(const t of O.tg){if(!t.alive)continue;const dd=segD(p0,I.p,t.p);if(t===I.tgt)I.minD=Math.min(I.minD,dd);if(dd<(t.bal?120:90)){t.alive=false;scene.remove(t.m);O.kills++;explosion(t.p.clone(),2);msg('SPLASH · TARGET DESTROYED',1.5);dead=true;break;}}
   if(dead){scene.remove(I.m);O.ms.splice(i,1);if(O.fol===I){O.fol=null;O.hold=1.2;}}}
  const lk=O.lock;hud.textContent=NM[O.site.type]+' · WAVE '+O.wave+' · KILLS '+O.kills+' · LEAKS '+O.leaks+(lk?' · LOCK '+(lk.bal?'TBM':'AIR')+' '+(lk.p.distanceTo(e)/1000).toFixed(1)+' km':' · SEARCHING')+(O.fol?' · FOLLOWING':'');}
 function cam(){const e=eye();if(O.fol){const I=O.fol;camera.position.copy(I.p).addScaledVector(I.dir,-14).addScaledVector(UP,3);camera.up.set(0,1,0);camera.lookAt(_a.copy(I.p).addScaledVector(I.dir,200));}
  else{camera.position.copy(e);camera.up.set(0,1,0);const lp=launcher().mesh.position;camera.lookAt(_a.copy(lp).add(new T.Vector3(0,4,0)).addScaledVector(aimDir(),90));}
  if(camera.far<80000){camera.far=80000;camera.updateProjectionMatrix();}
  if(O.lock){_a.copy(O.lock.p).project(camera);if(_a.z<1&&Math.abs(_a.x)<1.1&&Math.abs(_a.y)<1.1){box.style.display='block';box.style.left=((_a.x+1)/2*innerWidth)+'px';box.style.top=((1-_a.y)/2*innerHeight)+'px';}else box.style.display='none';}else box.style.display='none';}
 const _uc=updCamera;updCamera=function(dt){_uc(dt);if(!O.on)return;try{if(!paused)step(Math.min(dt||0.016,0.05));cam();}catch(e){console.warn('adop',e);}};
 // apply the battery/interceptor camera right before every render too (later camera code would otherwise overwrite it)
 {const R=(typeof renderer!=='undefined'&&renderer)||(window.__milsim&&__milsim.dbg&&__milsim.dbg.renderer);if(R){const _r=R.render.bind(R);R.render=function(sc,cm){if(O.on&&cm===camera){try{cam();}catch(e){}}return _r(sc,cm);};}}
 // keep the parked player jet idle while operating
 const _ri=readInput;readInput=function(){const r=_ri.apply(this,arguments);if(O.on&&typeof inp!=='undefined'){inp.throttle=0;}return r;};
 // drag on the scene slews the launcher
 addEventListener('pointerdown',e=>{if(!O.on)return;const id=e.target&&e.target.id;if(id==='bFire'){e.stopImmediatePropagation();e.preventDefault();fireI();return;}
  if(e.target&&e.target.tagName==='CANVAS'&&!O.fol)O.drag={x:e.clientX,y:e.clientY,az:O.az,el:O.el,id:e.pointerId};},true);
 addEventListener('pointermove',e=>{if(!O.on||!O.drag||e.pointerId!==O.drag.id)return;O.az=O.drag.az+(e.clientX-O.drag.x)*0.004;O.el=Math.max(0.02,Math.min(1.45,O.drag.el+(e.clientY-O.drag.y)*0.004));},true);
 addEventListener('pointerup',e=>{if(O.drag&&e.pointerId===O.drag.id)O.drag=null;},true);
 ex.addEventListener('pointerdown',e=>{e.stopPropagation();stop();});
 function clear(){for(const t of O.tg)scene.remove(t.m);for(const I of O.ms)scene.remove(I.m);O.tg=[];O.ms=[];O.lock=O.fol=null;}
 function start(type){const AD=A();const s=AD&&AD.SITES.find(x=>x.type===type);if(!s){msg('No '+(NM[type]||type)+' battery on this map',2);return false;}
  clear();Object.assign(O,{on:true,site:s,wave:0,kills:0,leaks:0,nxt:2,cd:0,el:0.35});const c=sitePos(s),m=launcher().mesh.position;O.az=Math.atan2(-(m.x-c.x)||-1e-3,-(m.z-c.z));
  document.body.classList.add('adop');[hud,ret,ex].forEach(x=>x.style.display='block');msg(NM[type]+' BATTERY · YOU HAVE CONTROL',2.5);return true;}
 function stop(){O.on=false;clear();document.body.classList.remove('adop');[hud,ret,ex,box].forEach(x=>x.style.display='none');}
 const st=document.createElement('style');st.textContent='body.adop #bWpn,body.adop #bCtx,body.adop #thr,body.adop #bCam,body.adop #bRc,body.adop #hr,body.adop #hcards{display:none!important}';document.head.appendChild(st);
 if(typeof spawn==='function'){const _sp=spawn;spawn=function(){if(O.on)stop();return _sp.apply(this,arguments);};}
 window.__adop={start,stop,O,fire:fireI,last:()=>O.lastI};}
//GADOP-END
