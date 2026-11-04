// ===== mp_aim.js — OWNER-ONLY aim assist (single player + multiplayer). No buttons; toggle via __aim.on / mod menu / settings.aimbot.
{
const own=()=>window.__mp?__mp.ownerActive:false;
const AIM={on:settings.aimbot!==false,cone:Math.cos(30*Math.PI/180),range:9000,lock:null};
const _d=V3(),_f=V3(),_tp=V3();
function cands(){const out=[];for(const t of targets)if(t.alive&&t.pos)out.push({pos:t.pos,vel:t.vel||V3(),ref:t});
 if(window.__mp&&__mp._st)for(const r of __mp._st.remotes.values())if(r.alive){const b=r.buf,n=b.length;let v=V3();if(n>1){const A=b[n-2],B=b[n-1],dt=Math.max(1e-3,B.t-A.t);v.set((B.p[0]-A.p[0])/dt,(B.p[1]-A.p[1])/dt,(B.p[2]-A.p[2])/dt);}out.push({pos:r.mesh.position,vel:v,remote:r});}return out;}
function pick(p,f){let best=null,bs=-1;for(const c of cands()){_d.copy(c.pos).sub(p);const d=_d.length();if(d>AIM.range||d<5)continue;const dot=_d.dot(f)/d;if(dot<AIM.cone)continue;const sc=dot*2-d/AIM.range;if(sc>bs){bs=sc;best=c;}}return best;}
// lead: solve |P+V t - o| = s t (iterative)
function lead(o,s,c,shooterVel){_tp.copy(c.pos);let t=0;for(let i=0;i<4;i++){t=_tp.distanceTo(o)/Math.max(s,1);_tp.copy(c.pos).addScaledVector(c.vel,t);if(shooterVel)_tp.addScaledVector(shooterVel,-t);}return _tp;}
function hook(){if(typeof fireWeapon!=='function'||fireWeapon.__aim)return;const _f0=fireWeapon;
 fireWeapon=function(v){const n0=projs.length,r=_f0.apply(this,arguments);
  if(AIM.on&&own()&&v===player&&projs.length>n0){const p=v.mesh.position;fwdOf(v.mesh.quaternion,_f);const L=AIM._lc,c=L&&L.pos&&(L.ref||L.remote||{}).alive!==false?L:pick(p,_f);
   if(c)for(let i=n0;i<projs.length;i++){const o=projs[i];
    if(o.type==='bullet'){const s=o.vel.length(),bv=v.vel||V3();const aim=lead(o.pos,s-bv.dot(_f),c,bv);o.vel.copy(aim).sub(o.pos).normalize().multiplyScalar(s-bv.length()).add(bv);o.__aimed=1;}
    else if(!o.tg&&c.ref){o.tg=c.ref;o.__aimed=1;} // auto lock-on; manual steering code (if any) still overrides
    else if(c.remote){o.__aimR=c.remote;o.__aimed=1;}}}
  return r;};fireWeapon.__aim=1;}
// smooth homing for missiles locked on remote players (no hard snap: capped turn rate)
function tick(dt){hook();if(!own())return;for(const o of projs){const r=o.__aimR;if(!r||!r.alive||o.type==='bullet')continue;if(o.manual||(typeof camFollow!=="undefined"&&camFollow===o))continue;
  const s=o.vel.length();const aim=lead(o.pos,Math.max(s,300),{pos:r.mesh.position,vel:V3()});_d.copy(aim).sub(o.pos).normalize();_f.copy(o.vel).normalize();
  _f.lerp(_d,Math.min(1,2.5*dt)).normalize();o.vel.copy(_f).multiplyScalar(s);}
 if(player&&player.mesh){fwdOf(player.mesh.quaternion,_f);const c=pick(player.mesh.position,_f);AIM._lc=c;AIM.lock=c?(c.ref||c.remote):null;}}
let last=performance.now();(function loop(){requestAnimationFrame(loop);const n=performance.now(),dt=Math.min(.05,(n-last)/1000);last=n;try{tick(dt)}catch(e){}})();
window.__aim={get on(){return AIM.on&&own()},set on(v){AIM.on=!!v;settings.aimbot=AIM.on;saveSettings();},get lock(){return AIM.lock},cfg:AIM};
}
