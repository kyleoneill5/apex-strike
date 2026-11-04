// ===== MIRV AUTO-LOCK + TAP-TO-SELECT (boxes only, no text near FIRE) =====
{const ML={locked:[],sel:new Set(),bus:null,cap:3};window.__mirvlock=ML;
const lay=document.createElement('div');lay.id='mirvLock';lay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:40';document.body.appendChild(lay);
const boxes=new Map();const _pv=new THREE.Vector3();
function box(t){let b=boxes.get(t);if(!b){b=document.createElement('div');b.style.cssText='position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border:2px solid #ff3;box-sizing:border-box;pointer-events:auto;touch-action:none';
 const h=e=>{e.preventDefault();e.stopPropagation();if(ML.sel.has(t))ML.sel.delete(t);else if(ML.sel.size<ML.cap)ML.sel.add(t);};b.addEventListener('touchstart',h,{passive:false});b.addEventListener('mousedown',h);lay.appendChild(b);boxes.set(t,b);}return b;}
function activeBus(){return projs.find(q=>q.name==='ICBM'&&!q.done&&q.owner===player)||projs.find(q=>q.name==='ICBM'&&!q.done)||null;}
function onScreen(t){_pv.copy(t.pos).project(camera);return _pv.z>=-1&&_pv.z<=1&&Math.abs(_pv.x)<=1&&Math.abs(_pv.y)<=1;}
function tick(){const bus=activeBus();ML.bus=bus;
 if(!bus){if(boxes.size){for(const b of boxes.values())b.remove();boxes.clear();}ML.locked=[];ML.sel.clear();return;}
 const c=bus.tgt||bus.pos;
 const ranked=targets.filter(t=>t.alive&&t.pos&&t.pos.distanceTo(c)<80000).sort((a,b)=>a.pos.distanceTo(c)-b.pos.distanceTo(c)).slice(0,ML.cap);
 ML.locked=ranked;
 for(const t of ML.sel)if(!t.alive||!ranked.includes(t))ML.sel.delete(t);
 for(const [t,b] of boxes)if(!ranked.includes(t)||!onScreen(t)){b.remove();boxes.delete(t);}
 for(const t of ranked){if(!onScreen(t))continue;const b=box(t);_pv.copy(t.pos).project(camera);
  b.style.display='block';b.style.left=((_pv.x+1)/2*innerWidth)+'px';b.style.top=((1-_pv.y)/2*innerHeight)+'px';
  const s=ML.sel.has(t);b.style.borderColor=s?'#f33':'#ff3';b.style.background=s?'rgba(255,40,40,.25)':'none';}}
setInterval(tick,60);(function raf(){requestAnimationFrame(raf);tick();})();
let idx=0;
const _ub=updBallistic;updBallistic=function(o,dt){
 if(o.sep&&o.name&&o.name.startsWith('RV-')&&!o._ml){o._ml=1;const bus=ML.bus;let pool=[...ML.sel].filter(t=>t.alive);
  if(!pool.length){const c=(bus&&bus.tgt)||o.tgt;pool=ML.locked.filter(t=>t.alive).sort((a,b)=>a.pos.distanceTo(c)-b.pos.distanceTo(c)).slice(0,ML.cap);}
  if(pool.length){const i=(parseInt(o.name.slice(3))-1)||0;const t=pool[i%pool.length];o.mlTarget=t;o.tgt=t.pos.clone();if(o.gsAim)o.gsAim.copy(t.pos);
   const p=o.pos,vy=o.vel.y;const T=(vy+Math.sqrt(vy*vy+2*G*Math.max(p.y,1)))/G;o.vel.x=(t.pos.x-p.x)/T;o.vel.z=(t.pos.z-p.z)/T;}}
 _ub(o,dt);
 if(o.mlTarget&&!o.done&&o.mlTarget.alive){const t=o.mlTarget,p=o.pos,vy=o.vel.y;const T=(vy+Math.sqrt(Math.max(0,vy*vy+2*G*Math.max(p.y-t.pos.y,1))))/G;if(T>0.5){const k=Math.min(1,dt*0.8);o.vel.x+=((t.pos.x-p.x)/T-o.vel.x)*k;o.vel.z+=((t.pos.z-p.z)/T-o.vel.z)*k;}}};
}
