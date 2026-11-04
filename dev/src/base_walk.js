//BASE-BEGIN base_walk.js  #22 on-foot + enter/exit. No new buttons: tap vehicle / CTX shows ENTER; long-press WPN exits (only stopped/landed/docked).
{const T=THREE;const BS=window.__bases||{list:[],parked:[],solid:[],surface:()=>null};const EX={on:false,anim:null,yaw:0,pitch:0,props:[]};window.__base=EX;
const FOOT={name:'On Foot',cls:'foot',weapons:[]};DEFS.foot=FOOT;
const mk=k=>k==='heli'?heli():k==='sub'?sub():k==='destroyer'?destroyer():jet(0x5d6873,false,k);
function addProp(kind,x,z,ry,base){const m=mk(kind);const g=groundAt(x,z);m.position.set(x,kind==='sub'||kind==='destroyer'?0:g.h+(kind==='heli'?1.8:2),z);m.rotation.set(0,ry,0);scene.add(m);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.__prop=m;}});
 const P={kind,mesh:m,base};m.userData.__propRec=P;EX.props.push(P);return P;}
let built=false;function build(){built=true;for(const B of BS.list)for(const p of B.parked)addProp(p.kind,p.x,p.z,p.ry,B);}
// body: owner gold/diamond avatar if ppl_ builder present, else simple stub
function body(){try{if(window.ppl_ownerAvatar){const a=ppl_ownerAvatar();if(a&&a.root)return a.root;}}catch(e){}const g=new T.Group();const m=new T.MeshStandardMaterial({color:0x222222});const b=new T.Mesh(new T.CapsuleGeometry(0.3,1.1,4,8),m);b.position.y=0.85;g.add(b);return g;}
function goFoot(x,z,yaw){const g=groundAt(x,z);const v={kind:'foot',loc:'base',def:FOOT,alive:true,vel:V3(),weapons:[],wi:0,ammo:{},spd:0,own:false,onGround:true,throttle:0,crashT:0};
 v.mesh=EX.body||(EX.body=body());if(!v.mesh.parent)scene.add(v.mesh);v.mesh.visible=true;v.mesh.position.set(x,g.h,z);EX.yaw=yaw;EX.pitch=0;player=v;EX.on=true;camFollow=null;blastCam=null;
 if(window.__wpnFP&&__wpnFP.start)try{__wpnFP.start(v);}catch(e){}updateCtxLabel();}
EX.goFoot=goFoot;
EX.spawnAt=b=>{if(!built)build();const B=b==='nav'?BS.NAV:b==='army'?BS.ARMY:BS.AFB;paused=false;goFoot(B.cx+B.spawn[0],B.cz+B.spawn[1],0);};
// --- walking (fallback when wpn_ FP not loaded): left stick = move, right-half drag = look, sprint at full stick
const look={id:null,x:0,y:0};addEventListener('touchstart',e=>{if(!EX.on)return;for(const t of e.changedTouches)if(t.clientX>innerWidth*0.5&&look.id==null&&!(t.target.closest&&t.target.closest('.tb'))){look.id=t.identifier;look.x=t.clientX;look.y=t.clientY;look.t0=performance.now();look.sx=t.clientX;look.sy=t.clientY;}},{passive:true});
addEventListener('touchmove',e=>{if(!EX.on)return;for(const t of e.changedTouches)if(t.identifier===look.id){EX.yaw-=(t.clientX-look.x)*0.006;EX.pitch=clamp(EX.pitch-(t.clientY-look.y)*0.005,-1.3,1.3);look.x=t.clientX;look.y=t.clientY;}},{passive:true});
addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===look.id){look.id=null;if(performance.now()-look.t0<250&&Math.hypot(t.clientX-look.sx,t.clientY-look.sy)<12)tapAt(t.clientX,t.clientY);}},{passive:true});
addEventListener('mousemove',e=>{if(EX.on&&e.buttons&1){EX.yaw-=e.movementX*0.005;EX.pitch=clamp(EX.pitch-e.movementY*0.004,-1.3,1.3);}});
const rc=new T.Raycaster();function tapAt(cx,cy){if(!EX.on||EX.anim)return;rc.setFromCamera(new T.Vector2(cx/innerWidth*2-1,-cy/innerHeight*2+1),camera);rc.far=60;
 const hit=rc.intersectObjects(EX.props.map(p=>p.mesh),true)[0];if(hit){let o=hit.object;while(o&&!o.userData.__propRec)o=o.parent;if(o)enter(o.userData.__propRec);}}
EX.tapAt=tapAt;
function nearest(){if(!player)return null;const p=player.mesh.position;let b=null,bd=1e9;for(const P of EX.props){const r=P.kind==='destroyer'?95:P.kind==='sub'?60:18;const d=P.mesh.position.distanceTo(p)-r;if(d<bd){bd=d;b=P;}}return bd<10?b:null;}
EX.nearest=nearest;
function collide(p){for(const s of BS.solid){if(p.y>s.top-0.2)continue;const dx=p.x-s.x,dz=p.z-s.z,c=Math.cos(-s.ry),sn=Math.sin(-s.ry);let lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<s.hw&&Math.abs(lz)<s.hl){
 const ox=s.hw-Math.abs(lx),oz=s.hl-Math.abs(lz);if(ox<oz)lx=Math.sign(lx)*s.hw;else lz=Math.sign(lz)*s.hl;p.x=s.x+lx*Math.cos(s.ry)-lz*Math.sin(-s.ry)*-1*0+(lx*0);p.x=s.x+lx*c+lz*sn;p.z=s.z-lx*sn+lz*c;}}
 for(const P of EX.props){const q=P.mesh.position,r=P.kind==='destroyer'||P.kind==='sub'?0:4.5;if(!r)continue;const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<r){p.x=q.x+(p.x-q.x)/d*r;p.z=q.z+(p.z-q.z)/d*r;}}}
function walk(dt){const v=player,p=v.mesh.position;const f=inp.pitch,s=inp.roll;const m=Math.min(1,Math.hypot(f,s));const spd=m>0.95?6.5:3.2*m/Math.max(m,1e-3)*m;
 if(window.__wpnFP&&__wpnFP.ownsMove)return;const sy=Math.sin(EX.yaw),cy=Math.cos(EX.yaw);if(m>0.02){const dx=(-sy*f+cy*s)/Math.max(m,1),dz=(-cy*f-sy*s)/Math.max(m,1);p.x+=dx*spd*dt;p.z+=dz*spd*dt;}
 if(inp.yaw)EX.yaw-=inp.yaw*1.8*dt;collide(p);const g=groundAt(p.x,p.z);const sh=BS.surface(p.x,p.z);let gh=sh!=null?sh:g.h;
 // decks of docked ships are walkable: hull top ~ +11 m destroyer, +6 m sub
 for(const P of EX.props){if(P.kind!=='destroyer'&&P.kind!=='sub')continue;const q=P.mesh.position;const l=V3(p.x-q.x,0,p.z-q.z).applyAxisAngle(V3(0,1,0),-P.mesh.rotation.y);if(Math.abs(l.x)<(P.kind==='sub'?4:8)&&Math.abs(l.z)<(P.kind==='sub'?38:70))gh=Math.max(gh,q.y+(P.kind==='sub'?4.5:9));}
 if(g.type==='water'&&sh==null&&gh<=0.5){gh=0;}p.y+=(gh-p.y)*Math.min(1,dt*12);v.mesh.rotation.y=EX.yaw;v.spd=spd*m;}
EX.walk=walk;EX.dbg={get player(){return player},inp,spawn,get paused(){return paused},set paused(x){paused=x}};
// ---- enter: short boarding move (ladder climb / gangway walk / crew-arm), then hand control to the vehicle
function enter(P){if(EX.anim||!EX.on)return;const q=P.mesh.position,ry=P.mesh.rotation.y;const air=P.kind!=='destroyer'&&P.kind!=='sub';
 const side=V3(air?-2.2:-10,0,air?-3:10).applyAxisAngle(V3(0,1,0),ry).add(q);const top=air?q.clone().add(V3(0,1.6,0)):q.clone().add(V3(0,P.kind==='sub'?7:22,0));
 EX.anim={P,t:0,dur:air?1.6:2.2,from:player.mesh.position.clone(),side,top,air};}
EX.enter=enter;
function finishEnter(P){const k=P.kind,pos=P.mesh.position.clone(),ry=P.mesh.rotation.y;scene.remove(P.mesh);EX.props.splice(EX.props.indexOf(P),1);if(EX.body)EX.body.visible=false;EX.on=false;
 if(window.__wpnFP&&__wpnFP.stop)try{__wpnFP.stop();}catch(e){}
 spawn(k,'airbase');const v=player;v.mesh.position.copy(pos);v.mesh.rotation.set(0,ry,0);v.mesh.quaternion.setFromEuler(v.mesh.rotation);v.vel.set(0,0,0);v.onGround=true;v.hdg=ry;v.yaw=ry;v.fromBase=P.base;inp.throttle=0;camSmooth.copy(pos).add(V3(0,20,60));}
// ---- exit: long-press WPN (0.6 s) in a vehicle; only when stopped/landed/docked
function canExit(){const v=player;if(!v||EX.on||!v.alive)return false;const c=v.def.cls;const sp=v.vel?v.vel.length():0;
 if(c==='air'||c==='heli')return v.onGround&&sp<3;if(c==='ship'||c==='sub'){if((v.spd||0)>1.2||(v.depth||0)>2)return false;return true;}return false;}
EX.canExit=canExit;
function exitV(){if(!canExit()){msg('Stop first',1.2);return false;}const v=player,c=v.def.cls,m=v.mesh;const P={kind:v.kind,mesh:m,base:v.fromBase};
 if(v.kind==='carrier'||!v.own||c==='rocket')return false;m.userData.__propRec=P;m.traverse(o=>{if(o.isMesh)o.userData.__prop=m;});EX.props.push(P);
 const off=V3(c==='air'||c==='heli'?-6:0,0,c==='air'||c==='heli'?0:0).applyAxisAngle(V3(0,1,0),m.rotation.y);let x=m.position.x+off.x,z=m.position.z+off.z;
 if(c==='ship'||c==='sub'){// step off onto nearest pier/deck, else the ship's deck
  let best=null,bd=1e9;for(const w of BS.walk){const d=Math.hypot(w.x-m.position.x,w.z-m.position.z)-Math.max(w.hw,w.hl);if(d<bd){bd=d;best=w;}}
  if(best&&bd<120){const a=Math.atan2(best.x-m.position.x,best.z-m.position.z);x=m.position.x+Math.sin(a)*Math.min(Math.hypot(best.x-m.position.x,best.z-m.position.z),c==='sub'?12:16)+0;z=m.position.z+Math.cos(a)*Math.min(Math.hypot(best.x-m.position.x,best.z-m.position.z),16);}}
 player.own=false;goFoot(x,z,m.rotation.y);return true;}
EX.exit=exitV;
{const el=document.getElementById('bWpn');let t=null,lp=false;const dn=e=>{lp=false;if(EX.on)return;t=setTimeout(()=>{lp=true;exitV();},600);};const up=e=>{clearTimeout(t);if(lp){e.stopImmediatePropagation();e.preventDefault();}};
 if(el){el.addEventListener('touchstart',dn,{capture:true,passive:true});el.addEventListener('mousedown',dn,true);el.addEventListener('touchend',up,true);el.addEventListener('mouseup',up,true);el.addEventListener('click',e=>{if(lp){e.stopImmediatePropagation();lp=false;}},true);}}
// CTX shows ENTER when near a vehicle on foot (existing button relabelled, no new button)
{const _u=updateCtxLabel;updateCtxLabel=function(){if(player&&player.kind==='foot'){const n=nearest();$('bCtx').textContent=n?'ENTER':'—';$('bWpn').textContent='WPN';return;}_u();};
 const _c=ctxAction;ctxAction=function(){if(player&&player.kind==='foot'){const n=nearest();if(n)enter(n);return;}_c();};}
{const _f=fireWeapon;fireWeapon=function(v){if(v&&v.kind==='foot')return;return _f(v);};}
// camera: first-person eye (wpn_ may override), third-person orbit during boarding
const _e=new T.Euler(0,0,0,'YXZ');
{const _uc=updCamera;updCamera=function(dt){const v=player;if(!v||v.kind!=='foot'){_uc(dt);return;}const p=v.mesh.position;
 if(EX.anim){const A=EX.anim;const P=A.from.clone().lerp(A.side,Math.min(1,A.t/(A.dur*0.45)));if(A.t>A.dur*0.45)P.lerp(A.top,(A.t/A.dur-0.45)/0.55);p.copy(P);EX.body.visible=true;
  const c=A.top.clone().add(V3(Math.sin(A.t*0.6+1)*(A.air?14:60),A.air?5:28,Math.cos(A.t*0.6+1)*(A.air?14:60)));camera.position.lerp(c,Math.min(1,dt*4));camera.lookAt(P);return;}
 if(window.__wpnFP&&__wpnFP.camera){try{__wpnFP.camera(camera,v,EX);return;}catch(e){}}
 EX.body.visible=false;camera.position.set(p.x,p.y+1.65,p.z);_e.set(EX.pitch,EX.yaw,0);camera.quaternion.setFromEuler(_e);};}
{const _sf=spawn;spawn=function(k,loc){if(k==='foot'){try{setPaused(false);}catch(e){}const q=player&&player.mesh&&player.mesh.position;goFoot(q?q.x:0,q?q.z:1200,0);return player;}return _sf(k,loc);};}
const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);if(!built&&BS.list.length)build();
 if(player&&player.kind==='foot'){if(EX.anim){EX.anim.t+=dt;if(EX.anim.t>=EX.anim.dur){const P=EX.anim.P;EX.anim=null;finishEnter(P);}}else walk(dt);if((EX.lt=(EX.lt||0)+dt)>0.25){EX.lt=0;updateCtxLabel();}}};}
//BASE-END
