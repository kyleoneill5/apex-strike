// ===== CAMERA v2: spring follow, free-look, launch cams | MIRV | manual rockets | HDRI =====
const FL={yaw:0,pitch:0,zoom:1,idle:99,ptr:new Map(),pinch0:0,z0:1,lastTap:0};let rcam=0;const RCN=['CHASE','FREE ORBIT','TOWER CAM','ONBOARD','BOOSTER CAM'];
const sOff=new THREE.Vector3(),sVel=new THREE.Vector3();let sKey=null;
function smoothDamp(cur,tgt,vel,w,dt){const x=w*dt,e=1/(1+x+0.48*x*x+0.235*x*x*x);const ch=_sd1.copy(cur).sub(tgt);const tmp=_sd2.copy(vel).addScaledVector(ch,w).multiplyScalar(dt);vel.addScaledVector(tmp,-w).multiplyScalar(e);cur.copy(tgt).add(ch.add(tmp).multiplyScalar(e));}
const _sd1=new THREE.Vector3(),_sd2=new THREE.Vector3(),_fq=new THREE.Quaternion(),_fa=new THREE.Vector3();
function flActive(){return Math.abs(FL.yaw)>0.002||Math.abs(FL.pitch)>0.002||Math.abs(FL.zoom-1)>0.003;}
function launchCtx(){return player&&(player.def.cls==='rocket'||player.def.cls==='silo'||(camFollow&&camFollow.type==='ballistic'));}
function applyFL(off,up){const l=off.length();_fq.setFromAxisAngle(up,FL.yaw);off.applyQuaternion(_fq);_fa.crossVectors(off,up);if(_fa.lengthSq()>1e-9){_fa.normalize();_fq.setFromAxisAngle(_fa,FL.pitch);off.applyQuaternion(_fq);}off.setLength(l*FL.zoom);return off;}
function flRecenter(){FL.yaw=FL.pitch=0;FL.zoom=1;FL.zoomT=1;FL.idle=99;if(FL.key)FL.zooms[FL.key]=1;}
FL.zooms={};FL.key='';function inOrbitView(){return player&&player.def.cls==='rocket'&&player.view==='ship'&&player.os.h>15000&&rcam!==2;}
function clampZ(z){return inOrbitView()?clamp(z,0.2,300000):clamp(z,0.15,25);}
function flKey(){if(!player)return;const k=player.def.cls+':'+(player.def.cls==='rocket'?rcam+(inOrbitView()?'o':'g'):camMode)+(camFollow?'f':'');if(k!==FL.key){if(FL.key)FL.zooms[FL.key]=FL.zoom;FL.key=k;FL.zoom=FL.zooms[k]||1;FL.zoom=clampZ(FL.zoom);FL.zoomT=FL.zoom;}else FL.zooms[k]=FL.zoom;}
function zoomBy(f){FL.zoomT=clampZ((FL.zoomT||FL.zoom)*f);FL.idle=0;}
{const el=renderer.domElement;el.style.touchAction='none';
 el.addEventListener('pointerdown',e=>{FL.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});try{el.setPointerCapture(e.pointerId);}catch(_){}
  if(FL.ptr.size===2){const [a,b]=[...FL.ptr.values()];FL.pinch0=Math.hypot(a.x-b.x,a.y-b.y);FL.z0=FL.zoomT||FL.zoom;}
  const n=performance.now();if(FL.ptr.size===1&&n-FL.lastTap<300)flRecenter();FL.lastTap=n;});
 el.addEventListener('pointermove',e=>{const p=FL.ptr.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(FL.ptr.size===1){FL.yaw-=dx*0.0045;FL.pitch=clamp(FL.pitch-dy*0.0038,-1.3,1.3);FL.idle=0;}
  else if(FL.ptr.size===2&&FL.pinch0>0){const [a,b]=[...FL.ptr.values()];FL.zoomT=clampZ(FL.z0*FL.pinch0/Math.max(10,Math.hypot(a.x-b.x,a.y-b.y)));FL.idle=0;}});
 const up=e=>{FL.ptr.delete(e.pointerId);if(FL.ptr.size<2)FL.pinch0=0;};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 el.addEventListener('wheel',e=>{e.preventDefault();FL.zoomT=clampZ((FL.zoomT||FL.zoom)*Math.exp(e.deltaY*0.0015));FL.idle=0;},{passive:false});
 const tb=document.createElement('div');tb.className='tb';tb.id='bRc';tb.textContent='⟲';tb.style.cssText='right:calc(166px + env(safe-area-inset-right));bottom:calc(82px + env(safe-area-inset-bottom));width:46px;height:46px';$('touch').appendChild(tb);
 tb.addEventListener('pointerdown',e=>{e.preventDefault();flRecenter();});
 const ap=document.createElement('div');ap.className='tb';ap.id='bAP';ap.textContent='AP';ap.style.cssText='right:calc(226px + env(safe-area-inset-right));bottom:calc(20px + env(safe-area-inset-bottom));width:46px;height:46px;display:none';$('touch').appendChild(ap);
 ap.addEventListener('pointerdown',e=>{e.preventDefault();if(player&&player.os)toggleAuto();});
 addEventListener('keydown',e=>{if(e.code==='KeyR'&&!e.repeat)flRecenter();if(e.code==='Equal'||e.code==='NumpadAdd')zoomBy(1/1.4);if(e.code==='Minus'||e.code==='NumpadSubtract')zoomBy(1.4);});
 for(const [id,f,b] of [['bZi',1/1.5,'142px'],['bZo',1.5,'196px']]){const z=document.createElement('div');z.className='tb';z.id=id;z.textContent=f<1?'+':'−';z.style.cssText=`display:none;right:calc(166px + env(safe-area-inset-right));bottom:calc(${b} + env(safe-area-inset-bottom));width:46px;height:46px;font-size:22px`;$('touch').appendChild(z);
  let iv=null;z.addEventListener('pointerdown',e=>{e.preventDefault();zoomBy(f);clearInterval(iv);iv=setInterval(()=>zoomBy(Math.pow(f,0.35)),90);});for(const u of ['pointerup','pointercancel','pointerleave'])z.addEventListener(u,()=>clearInterval(iv));}}
const _cycleCam0=cycleCam;
cycleCam=function(){if(player&&player.def.cls==='rocket'&&!camFollow&&!blastCam){let n=(rcam+1)%5;if(n===4&&!rec.booster)n=0;rcam=n;
  if(rcam===4)player.view='booster';else if(player.view==='booster')player.view=rec.shipDS?'shipDS':'ship';if(rcam===1)FL.idle=0;else flRecenter();msg('CAM: '+RCN[rcam],1.2);updateCtxLabel();return;}
 _cycleCam0();};
function focusPoint(v){if(camFollow)return camFollow.pos;if(v.def.cls==='rocket'){if(v.view!=='ship'&&rec[v.view]){const m=rec[v.view].mesh;return _fp.copy(m.position).addScaledVector(_fa.set(0,1,0).applyQuaternion(m.quaternion),30);}return _fp.copy(padRocket.position).add(_fa.set(0,35,0));}return v.mesh.position;}
const _fp=new THREE.Vector3(),_cq=new THREE.Quaternion(),_F2=new THREE.Vector3();
const _updCamera0=updCamera;
updCamera=function(dt){flKey();const v=player;const c=v.def.cls;const os=v.os;
 if(FL.zoomT==null)FL.zoomT=FL.zoom;{const zk=1-Math.exp(-dt*7);FL.zoom=Math.exp(Math.log(FL.zoom)+(Math.log(FL.zoomT)-Math.log(FL.zoom))*zk);}if(FL.idle<99&&FL.ptr.size===0){FL.idle+=dt;if(FL.idle>(launchCtx()?2.5:1.2)){const k=1-Math.exp(-dt*1.6);FL.yaw-=FL.yaw*k;FL.pitch-=FL.pitch*k;}}
 if(c==='rocket'&&v.view==='ship'&&!blastCam&&!camFollow){const rp=padRocket.position;const h=Math.max(0,os.h);
  if(rcam===2){camera.position.set(PAD.x-380,14,PAD.z+260);camera.up.set(0,1,0);camera.lookAt(rp.x,rp.y+30,rp.z);camera.fov=clamp(55*500/Math.max(500,camera.position.distanceTo(rp)),2.5,55);camera.updateProjectionMatrix();return;}
  if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}
  if(rcam===3){const u=_fa.set(0,1,0).applyQuaternion(padRocket.quaternion);camera.position.copy(rp).addScaledVector(u,62).add(_fp.set(6,0,4));camera.up.set(0,0,-1);camera.lookAt(_fp.copy(rp).addScaledVector(u,-200).add(V3(0,-200,0)));return;}}
 else if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}
 const sh=shake;shake=0;_updCamera0(dt);shake=sh;
 const fixed=blastCam||c==='silo'&&!camFollow||(camMode===1&&c!=='rocket'&&!camFollow);
 if(!fixed){const F=_F2.copy(focusPoint(v));const key=(camFollow?'f'+projs.indexOf(camFollow):v.kind||v.def.name)+':'+v.view+':'+c;const des=_sd1.copy(camera.position).sub(F);const desC=des.clone();
  const spd=camFollow?camFollow.vel.length():v.vel?v.vel.length():(os?Math.hypot(os.vs,os.vh):0);const w=clamp(7+spd*0.015,7,30);
  if(sKey!==key||sOff.distanceTo(desC)>desC.length()*3+300){sOff.copy(desC);sVel.set(0,0,0);sKey=key;}else smoothDamp(sOff,desC,sVel,w,dt);
  _cq.copy(camera.quaternion);const off=_fp.copy(sOff);
  if(flActive()){applyFL(off,V3(0,1,0));camera.position.copy(F).add(off);if(c!=='sub'){const gh=groundAt(camera.position.x,camera.position.z).h;if(camera.position.y<gh+2)camera.position.y=gh+2;}camera.up.set(0,1,0);camera.lookAt(F);}
  else{camera.position.copy(F).add(off);camera.quaternion.copy(_cq);}}
 if(shake>0.001){camera.position.add(V3(rnd(shake*4),rnd(shake*4),rnd(shake*4)));camera.rotateZ(rnd(shake*0.02));shake*=Math.exp(-dt*1.2);}};
render=function(rdt){flKey();const v=player;const rk=v.def.cls==='rocket'&&v.view==='ship';const h=rk?v.os.h:0;const tower=rk&&rcam===2&&h<90000;
 const useOrbit=rk&&h>15000&&!blastCam&&!tower;
 if(useOrbit){renderRocketCam(v,rdt);const rp=oRocket.position;const u=V3(v.os.x,v.os.y,0).normalize();
  if(rcam===3){const d=V3(u.y,-u.x,0);oCam.position.copy(rp).addScaledVector(u,0.06).addScaledVector(d,-0.05);oCam.up.copy(d);oCam.lookAt(V3(0,0,0).lerp(rp,0.9));}
  else if(flActive()&&camMode!==1){const off=oCam.position.clone().sub(rp);applyFL(off,u);oCam.position.copy(rp).add(off);oCam.up.copy(u);oCam.lookAt(rp);}
  renderFrame(oScene,oCam);}
 else{updCamera(rdt);updEnv(rdt);renderFrame(scene,camera);}};
// ---- manual rocket: roll visual + booster manual fly-back ----
const _updRocket0=updRocket;
updRocket=function(v,dt){const os=v.os;if(!os.auto)os.roll=(os.roll||0)+(inp.yaw||0)*1.2*dt;_updRocket0(v,dt);if(os.roll)padRocket.rotateY(os.roll);};
const _updRecovery0=updRecovery;
updRecovery=function(v,sim){for(const k of ['booster','shipDS']){const r=rec[k];if(!r)continue;const ds=r.ds;
  if(v.view===k&&!v.os.auto&&!ds.landed&&!ds.crashed){if(!ds.man){ds.man=true;ds.manAtt=ds.att;msg('MANUAL: stick L/R = attitude, up/down = fins, slider = thrust',2.5);}ds.auto=false;ds.manThr=inp.throttle;ds.manAtt=clamp(ds.manAtt-inp.roll*45*sim,-10,190);ds.manLat=inp.pitch*15;}
  else if(ds.man){ds.man=false;ds.auto=true;}}
 _updRecovery0(v,sim);};
// ---- attitude indicator / prograde marker ----
const adi=document.createElement('canvas');adi.width=adi.height=150;adi.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom));width:120px;height:120px;pointer-events:none;z-index:4;display:none';document.body.appendChild(adi);const ax2=adi.getContext('2d');
function drawADI(){const v=player;let show=v&&v.def.cls==='rocket'&&(v.os.launched||rec.booster);adi.style.display=show?'block':'none';$('bAP').style.display=v&&v.os?'flex':'none';$('bAP').style.background=v&&v.os&&v.os.auto?'rgba(80,255,120,.35)':'';if(!show)return;
 let nose,vel,lbl;if(v.view!=='ship'&&rec[v.view]){const ds=rec[v.view].ds;nose=ds.att;vel=Math.atan2(ds.vh,ds.vx)*180/Math.PI;lbl=v.view==='booster'?'BOOSTER':'SHIP';}
 else{const os=v.os;nose=os.pitch;const vh=os.h<60000?os.vh-OM.OMEGA*(OM.RE+os.h):os.vh;vel=Math.atan2(os.vs,vh)*180/Math.PI;lbl=os.auto?'AUTO':'MANUAL';}
 const c=ax2,R=60;c.clearRect(0,0,150,150);c.save();c.translate(75,75);c.fillStyle='rgba(0,20,10,.45)';c.beginPath();c.arc(0,0,R+8,0,7);c.fill();
 c.fillStyle='rgba(40,90,160,.35)';c.beginPath();c.arc(0,0,R,Math.PI,0);c.fill();c.fillStyle='rgba(120,80,40,.35)';c.beginPath();c.arc(0,0,R,0,Math.PI);c.fill();
 c.strokeStyle='#8dff9a';c.lineWidth=1.5;c.beginPath();c.moveTo(-R,0);c.lineTo(R,0);c.stroke();
 for(const a of [30,60]){c.globalAlpha=.4;c.beginPath();c.arc(0,0,R,-a*Math.PI/180-.03,-a*Math.PI/180+.03);c.stroke();}c.globalAlpha=1;
 const P=(deg,r)=>[Math.cos(deg*Math.PI/180)*r,-Math.sin(deg*Math.PI/180)*r];
 let [x,y]=P(nose,R);c.lineWidth=3;c.strokeStyle='#fff';c.beginPath();c.moveTo(0,0);c.lineTo(x,y);c.stroke();
 [x,y]=P(vel,R-6);c.strokeStyle='#ffe14a';c.lineWidth=2;c.beginPath();c.arc(x,y,6,0,7);c.stroke();c.beginPath();c.moveTo(x-11,y);c.lineTo(x-6,y);c.moveTo(x+6,y);c.lineTo(x+11,y);c.moveTo(x,y-6);c.lineTo(x,y-11);c.stroke();
 [x,y]=P(vel+180,R-6);c.strokeStyle='#ff7a4a';c.beginPath();c.arc(x,y,6,0,7);c.moveTo(x-4,y-4);c.lineTo(x+4,y+4);c.moveTo(x+4,y-4);c.lineTo(x-4,y+4);c.stroke();
 c.restore();c.fillStyle='#8dff9a';c.font='11px monospace';c.textAlign='center';c.fillText(lbl+' NOSE '+nose.toFixed(0)+'°',75,12);c.fillText('PRO '+vel.toFixed(0)+'°',75,146);}
const _updHUD0=updHUD;updHUD=function(){_updHUD0();drawADI();if(player&&player.def.cls==='rocket'&&!camFollow)$('hc').textContent+='  ['+RCN[rcam]+']';};
// ---- MIRV ----
const _updBallistic0=updBallistic;
updBallistic=function(o,dt){_updBallistic0(o,dt);
 if(o.name==='ICBM'&&o.t>o.boostT&&!o.done&&(o.vel.y<0||o.pos.y>78000)&&o.pos.y>40000){if(!o.mirv){o.mirv={n:0,next:0,rvs:[]};msg('POST-BOOST VEHICLE - MIRV DEPLOYMENT\n8 WARHEADS',3);sfx&&sfx.boom&&0;}
  o.mirv.next-=dt;if(o.mirv.next<=0&&o.mirv.n<8){const i=o.mirv.n++;o.mirv.next=0.7;const a=i/8*Math.PI*2+0.3,r=2500+(i%2)*2200;const tgt=o.tgt.clone().add(V3(Math.cos(a)*r,0,Math.sin(a)*r));
   const p=o.pos.clone();const vy=o.vel.y;const T=(vy+Math.sqrt(vy*vy+2*G*p.y))/G;const vel=V3((tgt.x-p.x)/T*1.08,vy,(tgt.z-p.z)/T*1.08);
   const m=icbm(1);m.position.copy(p);const rv=addProj({type:'ballistic',pos:p,vel,life:900,mesh:m,owner:o.owner,t:10,boostT:0,apex:0,name:'RV-'+(i+1),mach:0,tgt,sep:true});o.mirv.rvs.push(rv);
   for(let k=0;k<6;k++)fire.spawn(p,rnd(8),rnd(8),rnd(8),0.4,3,8,1,0.9,0.6,1);
   if(i===7){o.done=true;if(camFollow===o)camFollow=rv;msg('ALL 8 REENTRY VEHICLES RELEASED',2.5);}else if(camFollow===o&&i===0){}}}
 if(o.name&&o.name.startsWith('RV-')&&o.done){const nx=projs.find(q=>q!==o&&q.type==='ballistic'&&!q.done&&q.name&&q.name.startsWith('RV-'));if(nx&&!blastCam)camFollow=nx;}};
// ---- HDRI image-based lighting (Poly Haven, CC0) with procedural fallback ----
if(settings.quality!=='low')import('three/addons/loaders/RGBELoader.js').then(({RGBELoader})=>{new RGBELoader().load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_48d_partly_cloudy_puresky_1k.hdr',t=>{t.mapping=THREE.EquirectangularReflectionMapping;const env=pmrem.fromEquirectangular(t).texture;window.__envTex=env;scene.environment=settings.tod==='night'?null:env;scene.environmentIntensity=(typeof TOD!=='undefined'?TOD[settings.tod||'day'].env:0.9);t.dispose();window.__hdri=true;},undefined,()=>{});}).catch(()=>{});
Object.assign(window.__milsim,{FL,zoomBy,get rcam(){return rcam},cycleCam:()=>cycleCam(),flRecenter});
// ---- iOS: no tap flash / magnifier / callout ----
for(const ev of ['touchstart','touchmove'])document.addEventListener(ev,e=>{const t=e.target;if(t===renderer.domElement||(t.closest&&t.closest('#touch')))e.preventDefault();},{passive:false});
document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('selectstart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
renderer.domElement.style.background='#000';
