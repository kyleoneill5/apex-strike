// ---------- MISSILE FOLLOW + MANUAL GUIDANCE (TV/nose cam, warhead pick) ----------
const GUIDE={on:true,nose:false,stick:{p:0,r:0,y:0},types:['missile','hyper','torpedo','nuke','ballistic','sam'],active:false};
window.__guide=GUIDE;
const guidable=o=>o&&!o.done&&GUIDE.types.includes(o.type);
{const _add=addProj;addProj=function(o){const r=_add(o);if(player&&o.owner===player&&guidable(o)&&settings.autoFollow!==false){camFollow=o;GUIDE.nose=false;}return r;};}
{const _ri=readInput;readInput=function(dt){_ri(dt);GUIDE.active=!!(camFollow&&guidable(camFollow)&&(GUIDE.on||!settings.advanced));
 if(GUIDE.active){GUIDE.stick.p=inp.pitch;GUIDE.stick.r=inp.roll;GUIDE.stick.y=inp.yaw;inp.pitch=0;inp.roll=0;inp.yaw=0;
  if(Math.abs(GUIDE.stick.p)+Math.abs(GUIDE.stick.r)+Math.abs(GUIDE.stick.y)>0.05&&camFollow.tg&&camFollow.type!=='torpedo'){camFollow._tg=camFollow.tg;camFollow.tg=null;}}};}
const _gq=new THREE.Quaternion(),_gv=new THREE.Vector3(),_gr=new THREE.Vector3(),_gu=new THREE.Vector3(0,1,0);
function guideStep(dt){GUIDE.boostT=Math.max(0,(GUIDE.boostT||0)-dt);GUIDE.cd=Math.max(0,(GUIDE.cd||0)-dt);const o=camFollow;if(!GUIDE.active||!o||!o.vel)return;const s=GUIDE.stick;const sp=o.vel.length();if(sp<1)return;
 const dir=_gv.copy(o.vel).divideScalar(sp);_gr.crossVectors(dir,_gu);if(_gr.lengthSq()<1e-6)_gr.set(1,0,0);_gr.normalize();
 const gl=o.type==='rod'?3:o.type==='torpedo'?0:o.type==='nuke'?6:o.type==='ballistic'?(o.t<o.boostT?0:25):o.type==='hyper'?30:o.type==='sam'?45:40;const bst=GUIDE.boostT>0?2:1;let rate=o.type==='torpedo'?0.7:Math.min(3.2,gl*9.81/Math.max(sp,60))*bst;
 const yawIn=clamp(s.r+s.y,-1,1),pitIn=o.type==='torpedo'?0:clamp(s.p,-1,1);
 if(yawIn)o.vel.applyAxisAngle(_gu,-yawIn*rate*dt);if(pitIn)o.vel.applyAxisAngle(_gr,pitIn*rate*dt);GUIDE.g=Math.hypot(yawIn,pitIn)*rate*sp/9.81;if(GUIDE.g>10&&Math.random()<0.6)smoke.spawn(o.pos,rnd(1),rnd(1),rnd(1),1.2,1.5,3,1,1,1,0.45,0,0.2);
 if(o.type==='ballistic'&&o.t>=o.boostT&&o.tgt)o.tgt.addScaledVector(_gr,yawIn*dt*400).addScaledVector(V3(dir.x,0,dir.z).normalize(),pitIn*dt*400);
 // proximity fuse vs any target for manually steered weapons
 if(!o.tg&&o.type!=='nuke'&&o.type!=='ballistic'){for(const t of targets){if(!t.alive)continue;const d=t.pos.distanceTo(o.pos);if(d<(o.type==='hyper'?60:o.type==='torpedo'?25:40)){o.tg=t;break;}}}}
{const _tick=tick;tick=function(dt){_tick(dt);if(player)guideStep(dt);};}
{const _uc=updCamera;updCamera=function(dt){_uc(dt);const o=camFollow;if(GUIDE.nose&&o&&o.vel&&!blastCam){const d=_gv.copy(o.vel).normalize();camera.up.set(0,1,0);camera.position.copy(o.pos).addScaledVector(d,o.type==='torpedo'?4:3).add(V3(0,o.type==='torpedo'?0.6:0.4,0));camera.lookAt(_gr.copy(o.pos).addScaledVector(d,500));}
 const bar=$('gbar');if(bar){const f=!!(o&&!blastCam);bar.style.display=f?'flex':'none';if(f){const rvs=projs.filter(q=>q.type==='ballistic'&&!q.done&&q.name&&q.name.startsWith('RV-'));$('gNext').style.display=rvs.length>1?'block':'none';$('gGuide').style.display=settings.advanced?'block':'none';$('gGuide').textContent='GUIDE: '+(GUIDE.on?'ON':'OFF');$('gNose').textContent=GUIDE.nose?'CHASE CAM':'NOSE CAM';
  $('gInfo').textContent=(o.name||o.type.toUpperCase())+'  '+Math.round(o.vel.length()*3.6)+' km/h  ALT '+Math.round(o.pos.y)+' m'+(GUIDE.active?'  - STEER WITH STICK':'');}}};}
{const css=document.createElement('style');css.textContent='#gbar{position:fixed;top:44px;left:50%;transform:translateX(-50%);display:none;gap:6px;z-index:30;align-items:center;flex-wrap:wrap;justify-content:center;font:12px monospace;-webkit-tap-highlight-color:transparent}#gbar .gb{padding:7px 10px;border:1px solid #7f7;color:#bfb;background:rgba(0,20,0,.55);border-radius:6px;user-select:none;-webkit-user-select:none}#gInfo{color:#9f9;text-shadow:0 0 3px #000;width:100%;text-align:center}#bCtx{right:calc(192px + env(safe-area-inset-right))!important;bottom:calc(106px + env(safe-area-inset-bottom))!important}#bCam{right:calc(197px + env(safe-area-inset-right))!important;bottom:calc(24px + env(safe-area-inset-bottom))!important}#bRc{right:calc(268px + env(safe-area-inset-right))!important;bottom:calc(70px + env(safe-area-inset-bottom))!important}#bAP{right:calc(268px + env(safe-area-inset-right))!important;bottom:calc(126px + env(safe-area-inset-bottom))!important}';document.head.appendChild(css);
 const b=document.createElement('div');b.id='gbar';b.innerHTML='<div class="gb" id="gBack">&#8617; VEHICLE</div><div class="gb" id="gNose">NOSE CAM</div><div class="gb" id="gNext">NEXT WARHEAD</div><div class="gb" id="gGuide">GUIDE: ON</div><div id="gInfo"></div>';document.body.appendChild(b);
 const tap=(id,f)=>{const e=$(id);e.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();f();});};
 tap('gBack',()=>{camFollow=null;GUIDE.nose=false;});tap('gNose',()=>{GUIDE.nose=!GUIDE.nose;});tap('gGuide',()=>{GUIDE.on=!GUIDE.on;});
 tap('gNext',()=>{const rvs=projs.filter(q=>q.type==='ballistic'&&!q.done&&q.name&&q.name.startsWith('RV-'));if(!rvs.length)return;const i=rvs.indexOf(camFollow);camFollow=rvs[(i+1)%rvs.length];msg('STEERING '+camFollow.name,1.2);});}
Object.assign(window.__milsim,{GUIDE,guideNext:()=>$('gNext').dispatchEvent(new PointerEvent('pointerdown'))});Object.defineProperty(window.__milsim,'camFollow',{get(){return camFollow},set(v){camFollow=v},configurable:true});
