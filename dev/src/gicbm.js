// ===== v4 fully player-flown ICBM: manual boost (3 stages, throttle, staging), post-boost bus with manual RV release, RV terminal steering =====
const ICBM_ST=[{t:62,a:30},{t:56,a:36},{t:48,a:44}];const BUS_DV=320;
const _icbmU=updBallistic;const _t2=new THREE.Vector3(),_ax=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0);
function icbmPredict(o){const p=o.pos,v=o.vel;const h=p.y-groundAt(p.x,p.z).h;const T=(v.y+Math.sqrt(Math.max(0,v.y*v.y+2*G*Math.max(h,0))))/G;return {pt:V3(p.x+v.x*T,0,p.z+v.z*T),T,apo:p.y+Math.max(0,v.y)**2/(2*G)};}
function icbmRelease(o){if(!o.bus||o.bus.n>=8)return null;const i=o.bus.n++;const p=o.pos.clone();const a=i/8*Math.PI*2;const vel=o.vel.clone().add(V3(Math.cos(a)*1.5,-0.5,Math.sin(a)*1.5));
 const m=icbm(1);m.position.copy(p);const rv={type:'ballistic',pos:p,vel,life:1800,mesh:m,owner:o.owner,t:10,boostT:0,apex:0,name:'RV-'+(i+1),mach:0,sep:true,rv:true};
 const pr=icbmPredict(rv);rv.tgt=pr.pt;const prevF=camFollow;addProj(rv);camFollow=prevF;for(let k=0;k<6;k++)fire.spawn(p,rnd(6),rnd(6),rnd(6),0.4,3,8,1,0.9,0.6,1);
 msg('RV-'+(i+1)+' RELEASED  ('+(8-o.bus.n)+' left)',1.2);if(o.bus.n>=8){o.done=true;if(camFollow===o)camFollow=rv;msg('ALL 8 REENTRY VEHICLES RELEASED\nSteer each warhead with the stick',2.5);}else if(camFollow===o)camFollow=o;return rv;}
updBallistic=function(o,dt){
 if((o.name==='ICBM'||o.name==='SLBM')&&o.man===undefined&&o.t<1){o.man=!mission&&settings.icbmAuto!==true&&!!player&&o.owner===player;if(o.man){o.phase='boost';o.stg=0;o.burn=0;o.dirT=V3(0,1,0);o.boostT=1e9;msg('MANUAL ICBM - STICK STEERS THRUST\nSlider = throttle  |  STAGE / AUTO in top bar',3);}}
 if(!o.man){_icbmU(o,dt);if(o.rv||(o.name&&o.name.startsWith('RV-')))rvFx(o,dt);return;}
 o.t+=dt;const p=o.pos,h=p.y,s=GUIDE.stick;const thr=clamp(inp.throttle,0,1);
 if(o.phase==='boost'){const S=ICBM_ST[o.stg];
  const right=_ax.crossVectors(o.dirT,_up);if(right.lengthSq()<1e-6)right.set(1,0,0);right.normalize();
  if(o.t>3){o.dirT.applyAxisAngle(right,(s.p||0)*0.35*dt).applyAxisAngle(_up,-clamp((s.r||0)+(s.y||0),-1,1)*0.35*dt).normalize();}
  const a=S.a*(o.t<3?1:Math.max(0.15,thr));o.vel.addScaledVector(o.dirT,a*dt);o.burn+=dt*(o.t<3?1:Math.max(0.15,thr));
  const rho=1.225*Math.exp(-h/8500),sp=o.vel.length();o.vel.multiplyScalar(1-Math.min(0.2,rho*sp*0.00001*dt));
  for(let k=0;k<3;k++){const b=_t2.copy(p).addScaledVector(o.dirT,-2-k*2);fire.spawn(b,rnd(3),rnd(3),rnd(3),0.35,(4+h/9000)*(1+sstep(5000,60000,h)*2),6+h/4000,1,0.75,0.4,1,0,0,1,0.3,0.1);}
  if(Math.random()<(h<30000?0.9:0.3))smoke.spawn(_t2.copy(p).addScaledVector(o.dirT,-6),rnd(3),rnd(3),rnd(3),h<30000?20:6,5+h/3000,10+h/1500,0.92,0.92,0.95,h<30000?0.55:0.25,0.05,0);
  if(o.burn>=S.t||o.stageReq){o.stageReq=false;icbmStage(o);}
  o.mesh.quaternion.setFromUnitVectors(_up,o.dirT);}
 else if(o.phase==='bus'){ // small attitude-controlled bus: stick trims velocity with limited delta-v
  const right=_ax.crossVectors(o.vel,_up).normalize();const fw=_t2.set(o.vel.x,0,o.vel.z).normalize();const dv=Math.min(o.bus.dv,12*dt);
  const ix=clamp((s.r||0)+(s.y||0),-1,1),iy=(s.p||0);if((Math.abs(ix)>0.05||Math.abs(iy)>0.05)&&o.bus.dv>0){o.vel.addScaledVector(right,ix*dv).addScaledVector(fw,iy*dv);o.bus.dv-=dv*Math.hypot(ix,iy);fire.spawn(p,rnd(1),rnd(1),rnd(1),0.15,1,0,1,0.9,0.7,1);}
  if(o.vel.y<0&&h<90000&&o.bus.n<8){msg('BUS DESCENDING - AUTO-RELEASING REMAINING RVs',2);while(o.bus.n<8&&!o.done)icbmRelease(o);}
  o.mesh.quaternion.setFromUnitVectors(_up,_t2.copy(o.vel).normalize());}
 o.vel.y-=G*dt;p.addScaledVector(o.vel,dt);o.mach=o.vel.length()/(h<11000?340-0.0039*h:295);
 const g=groundAt(p.x,p.z);if(p.y<=g.h+2&&o.t>5){o.done=true;nukeDetonate(p.clone().setY(g.h));camFollow=null;}};
function icbmStage(o){o.stg++;for(let k=0;k<20;k++)smoke.spawn(o.pos,rnd(10),rnd(10),rnd(10),3,6,10,0.9,0.9,0.9,0.5,0.05,0);
 if(o.stg>=ICBM_ST.length){o.phase='bus';o.bus={n:0,dv:BUS_DV};o.mesh.scale.set(0.45,0.3,0.45);msg('BURNOUT - POST-BOOST VEHICLE\nStick trims trajectory ('+BUS_DV+' m/s)  |  RELEASE RV in top bar',3);}
 else{o.burn=0;o.mesh.scale.set(1-o.stg*0.12,1-o.stg*0.3,1-o.stg*0.12);msg('STAGE '+(o.stg+1)+' IGNITION',1.5);}}
// re-entry plasma sheath on RVs (auto or manual)
const PLASMA_MAT=new THREE.MeshBasicMaterial({color:0xffb070,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
function rvFx(o,dt){if(!o.mesh)return;if(!o.pl){o.pl=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),PLASMA_MAT.clone());o.pl.scale.set(1.6,4,1.6);o.pl.position.y=1.5;o.mesh.add(o.pl);}
 const h=o.pos.y,sp=o.vel.length();const rho=1.225*Math.exp(-h/7200);const q=rho*sp*sp*sp*1e-9;const k=clamp(q*0.6,0,1)*(o.vel.y<0?1:0);o.pl.material.opacity=k*0.85;o.pl.material.color.setHSL(0.07-k*0.04,1,0.55+k*0.3);o.pl.scale.set(1.4+k,3+k*5,1.4+k);}
{const _u=updBallistic;updBallistic=function(o,dt){_u(o,dt);if(o.rv)rvFx(o,dt);};}
// top-bar controls
{const bar=$('gbar');const mk=(id,t,f)=>{const e=document.createElement('div');e.className='gb';e.id=id;e.textContent=t;e.style.display='none';bar.insertBefore(e,$('gInfo'));e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();f();});return e;};
 const cur=()=>{const o=camFollow;return o&&o.man&&!o.done?o:null;};
 mk('gStage','STAGE',()=>{const o=cur();if(o&&o.phase==='boost')o.stageReq=true;});
 mk('gRel','RELEASE RV',()=>{const o=cur();if(o&&o.phase==='bus')icbmRelease(o);});
 mk('gAuto','AUTOPILOT',()=>{const o=cur();if(!o)return;if(o.phase==='boost'){o.man=false;o.boostT=o.t+25;o.apex=o.apex||80000;o.tgt=o.tgt||ENEMY.clone();msg('ICBM AUTOPILOT ENGAGED',1.5);}else if(o.phase==='bus'){while(o.bus.n<8&&!o.done)icbmRelease(o);}});
 const _uc=updCamera;updCamera=function(dt){_uc(dt);const o=camFollow;const m=!!(o&&o.man&&!o.done&&!blastCam);$('gStage').style.display=m&&o.phase==='boost'?'block':'none';$('gRel').style.display=m&&o.phase==='bus'?'block':'none';$('gAuto').style.display=m?'block':'none';
  if(o&&!blastCam&&(o.man||o.rv)&&!o.done){const pr=icbmPredict(o);const tg=o.tgt||ENEMY;const miss=Math.hypot(pr.pt.x-tg.x,pr.pt.z-tg.z);
   $('gInfo').textContent=(o.man?(o.phase==='boost'?'STAGE '+(o.stg+1)+' '+Math.round(100*(1-o.burn/ICBM_ST[o.stg].t))+'% PROP':'BUS dV '+Math.round(o.bus.dv)+' m/s  RVs '+(8-o.bus.n)):o.name)+'  |  '+Math.round(o.vel.length())+' m/s  ALT '+(o.pos.y/1000).toFixed(1)+' km  APO '+(pr.apo/1000).toFixed(0)+' km  IMPACT '+(miss/1000).toFixed(1)+' km from target';}};}
Object.assign(window.__milsim,{icbmRelease,icbmStage});
