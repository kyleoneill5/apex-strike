// ===== mp_streak.js — MP killstreak: AIR DEFENSE BATTERY (7 kills). AI THAAD/David's Sling battery ~60 s near the player.
// Engages enemy players (air, heli, ship, ground/tank, on-foot), enemy AI targets, and hostile projectiles. SAM (air) + diving ground-attack missiles + C-RAM gun (<1.5 km).
// Never targets teammates or the owner. Owner: all streaks unlocked (earned at 0 kills). Mod menu: __streak.grant().
{
const NEED=7,LIFE=60,RNG=7000,CRAM_R=1500;
const S={kills:0,ready:false,bats:[]};const mp=()=>window.__mp,on=()=>mp()&&mp().state==='on';
const hostile=id=>{const m=mp();if(id===m.ownerId)return false;if(window.__gm){const g=__gm.state;if(__gm.MODES[g.mode]&&__gm.MODES[g.mode].team&&__gm.team(id)===__gm.team(m.id))return false;if(g.mode==='coop')return false;}return true;};
function mesh(){const AD=window.__airdef;let g=null;try{g=AD&&AD.thaadLauncher&&AD.thaadLauncher();}catch(e){}
 if(!g){g=new THREE.Group();const m=new THREE.MeshStandardMaterial({color:0x6b6f4e,roughness:.8});const b=new THREE.Mesh(new THREE.BoxGeometry(3,2.5,12),m);b.position.y=1.5;g.add(b);const c=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.2,7),m);c.position.set(0,3.6,-1);c.rotation.x=-0.5;g.add(c);}
 return g;}
function deploy(){if(!player||!player.mesh)return false;const p=player.mesh.position.clone();p.x+=60;p.z+=60;p.y=Math.max(0,typeof waveH==='function'?0:0)+2;
 const g=mesh();g.position.copy(p);scene.add(g);const b={g,p,t:LIFE,cd:0,gun:0};S.bats.push(b);S.ready=false;S.kills=0;
 if(typeof killFeed==='function')killFeed('AIR DEFENSE BATTERY ONLINE');if(on())mp().send({t:'ads',p:[p.x,p.y,p.z]});return true;}
// visual-only battery for other clients
if(window.__mp)__mp.on('ads',m=>{if(m.from===__mp.id)return;const g=mesh();g.position.set(...m.p);scene.add(g);setTimeout(()=>scene.remove(g),LIFE*1000);});
const shots=[];
function shoot(b,tgt,kind){const from=b.p.clone();from.y+=6;const vis=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,kind==='CRAM'?1.5:5,6),new THREE.MeshBasicMaterial({color:kind==='CRAM'?0xffd27a:0xeeeeee}));vis.position.copy(from);scene.add(vis);
 shots.push({vis,pos:from,tgt,kind,spd:kind==='CRAM'?1100:900,life:kind==='CRAM'?2:14,ground:kind==='GND',up:kind==='GND'?1.5:0});}
function tPos(t){return t.remote?t.remote.mesh.position:t.ai?t.ai.pos:t.proj?t.proj.pos:null;}
function targetsNear(p){const out=[];
 if(on())for(const r of mp()._st.remotes.values())if(r.alive&&hostile(r.id)){const d=r.mesh.position.distanceTo(p);if(d<RNG)out.push({remote:r,d,air:r.mesh.position.y>60});}
 for(const t of targets)if(t.alive&&t.pos){const d=t.pos.distanceTo(p);if(d<RNG)out.push({ai:t,d,air:t.pos.y>60});}
 for(const o of projs)if(o.owner&&o.owner!==player&&o.pos&&o.type!=='bullet'){const d=o.pos.distanceTo(p);if(d<RNG)out.push({proj:o,d,air:true});}
 return out.sort((a,b)=>a.d-b.d);}
function upd(dt){if(S.kills>=NEED||(on()&&mp().isOwner)||(!on()&&mp()&&mp().ownerActive))S.ready=S.ready||S.kills>=NEED||!!(mp()&&mp().ownerActive);
 for(let i=S.bats.length-1;i>=0;i--){const b=S.bats[i];b.t-=dt;b.cd-=dt;b.gun-=dt;if(b.t<=0){scene.remove(b.g);S.bats.splice(i,1);continue;}
  const ts=targetsNear(b.p);if(!ts.length)continue;const c=ts[0];
  if(c.d<CRAM_R&&b.gun<=0){b.gun=0.12;shoot(b,c,'CRAM');}
  else if(b.cd<=0){b.cd=1.6;shoot(b,c,c.air?'SAM':'GND');}}
 for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;const tp=tPos(s.tgt);if(!tp||s.life<=0){scene.remove(s.vis);shots.splice(i,1);continue;}
  const dir=tp.clone().sub(s.pos);if(s.ground&&s.up>0){s.up-=dt;dir.set(dir.x*.2,dir.length(),dir.z*.2);} // loft then dive
  const L=dir.length();if(L<(s.kind==='CRAM'?20:30)){hit(s);scene.remove(s.vis);shots.splice(i,1);continue;}
  s.pos.addScaledVector(dir.normalize(),Math.min(L,s.spd*dt));s.vis.position.copy(s.pos);s.vis.lookAt(tp);s.vis.rotateX(Math.PI/2);}}
function hit(s){const t=s.tgt,w=s.kind==='CRAM'?'CRAM':'SAMSTREAK';
 if(t.remote){mp().hit(t.remote.id,w);}else if(t.ai){if(s.kind!=='CRAM'||Math.random()<.2)killTarget(t.ai);}else if(t.proj){t.proj.life=0;}
 if(s.kind!=='CRAM'&&typeof explosion==='function')explosion(s.pos.clone(),1);}
if(window.__mp)__mp.on('k',m=>{if(m.killer===__mp.id){S.kills++;if(S.kills>=NEED)S.ready=true;}if(m.victim===__mp.id){S.kills=0;if(!(mp()&&mp().ownerActive))S.ready=false;}});
{const iv=setInterval(()=>{if(typeof killTarget!=='function')return;clearInterval(iv);const _k=killTarget;killTarget=function(t){const w=t.alive;const r=_k.apply(this,arguments);if(w&&!t.alive&&on())S.kills++;return r;};},500);}
let last=performance.now();(function loop(){requestAnimationFrame(loop);const n=performance.now(),dt=Math.min(.05,(n-last)/1000);last=n;try{upd(dt)}catch(e){console.warn(e)}})();
// Activation (no new buttons): ui builder's killstreak slot calls __streak.use(); returns false if not earned.
window.__streak={NEED,get kills(){return S.kills},get ready(){return S.ready},use(){if(!S.ready)return false;return deploy();},grant(){if(mp()&&mp().ownerActive){S.ready=true;return true;}return false;},icon:'<svg viewBox="0 0 40 40"><path d="M6 32h28M10 32l4-10h12l4 10M20 22V8l6 6" stroke="#f2f2ea" stroke-width="3" fill="none"/></svg>',state:S};
}
