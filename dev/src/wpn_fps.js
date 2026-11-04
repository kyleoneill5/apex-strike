// ===== wpn_fps.js (#21): first-person ON-FOOT mode + MW2 arsenal. Existing controls only: left stick move, right-drag look, FIRE, weapon switch
// (tap = next slot, double-tap = reload; empty mag auto-reloads), pinch = ADS (snipers/launchers also ADS while FIRE held, shoot on release).
// API for base_/mp_/ui_: window.WPF.spawnOnFoot(pos), despawn(), getPos(), setLoadout({p,s,lethal,tac,att}), give(id), throwEquip(), state()
const WPF=(()=>{const T=THREE;const S={on:false,pos:new T.Vector3(),yaw:0,pitch:0,vy:0,load:{p:'m4a1',s:'usp',lethal:'frag',tac:'flash',att:{m4a1:['reddot']}},slot:0,
 mag:{},res:{},cool:0,rel:0,ads:0,adsT:false,heldT:0,kick:0,streak:0,kills:0,ks:[],ksReady:null,vm:null,vmId:null,flash:null,tracers:[],lastTap:0,near0:null,hm:0,st:0,stH:1.7,sw:null};
 const STH=[1.7,1.1,.45],STV=[1,.55,.25];
 const V=()=>new T.Vector3();const _d=V(),_o=V(),_t=V();
 const slots=()=>{const a=[S.load.p,S.load.s,'@'+S.load.lethal];if(S.ksReady)a.push('#'+S.ksReady);return a;};
 const cur=()=>slots()[S.slot%slots().length];const W=id=>WPN.W[id];
 const fill=id=>{const w=W(id);if(!w)return;const x=(S.load.att[id]||[]).includes('xmags')?1.5:1;S.mag[id]=Math.round(w.mag*x);S.res[id]=w.cls==='ln'?(WPN.owner()?99:2):Math.round(w.mag*x)*4;};
 // ---------- audio (synthesized) ----------
 let AC=null;const buf={};function snd(k){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!buf[k]){const sr=AC.sampleRate,len=k==='rel'?.25:k==='sn'||k==='sg'?.6:.28,b=AC.createBuffer(1,sr*len,sr),d=b.getChannelData(0);let lp=0;
   if(k==='hm'){const sr=AC.sampleRate,b=AC.createBuffer(1,sr*.06,sr),d=b.getChannelData(0);for(let i=0;i<d.length;i++){const t=i/sr;d[i]=(Math.sin(t*2*Math.PI*2600)*.7+(Math.random()*2-1)*.3)*Math.exp(-t*90);}buf[k]=b;}else{
   const cut=k==='hg'||k==='mp'?.5:k==='sn'?.12:k==='rel'?.9:.3;for(let i=0;i<d.length;i++){const t=i/sr;let n=Math.random()*2-1;lp+=cut*(n-lp);
    d[i]=k==='rel'?((i%4000<300)?n*.6:0)*Math.exp(-t*6):(lp*.9+Math.sin(t*2*Math.PI*(k==='sn'?55:90))*.6)*Math.exp(-t*(k==='sn'?7:k==='sg'?9:22));}buf[k]=b;}}
  const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf[k];s.playbackRate.value=.92+Math.random()*.16;g.gain.value=k==='hm'?.35:(S.load.att[cur()]||[]).includes('silencer')&&k!=='rel'?.18:.55;s.connect(g).connect(AC.destination);s.start();}catch(e){}}
 // ---------- viewmodel ----------
 function setVM(){const id=cur();if(S.vmId===id)return;if(S.vm)camera.remove(S.vm);S.vmId=id;
  let g;if(id[0]==='@')g=WPNM.equip(id.slice(1));else if(id[0]==='#'){g=new T.Group();const t=new T.Mesh(new T.BoxGeometry(.07,.13,.02),WPNM.M.blk);t.add(new T.Mesh(new T.BoxGeometry(.06,.1,.001),WPNM.M.glass).translateZ(-.011));g.add(t);}
  else{g=WPNM.attach(WPNM.get(id),W(id),S.load.att[id]);}
  const isG=id[0]!=='@'&&id[0]!=='#';const A=WPNM.arms?WPNM.arms(g,{oneHand:!isG}):null;S.lArm=A&&A.L;S.rArm=A&&A.R;if(A&&A.L){A.L.userData.p0=A.L.position.clone();}
  if(g.userData.mag)g.userData.mag.userData.p0=g.userData.mag.position.clone();
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.frustumCulled=false;o.renderOrder=999;}});
  const fl=new T.Mesh(new T.PlaneGeometry(.12,.12),new T.MeshBasicMaterial({color:0xffc060,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:2}));fl.position.copy(g.userData.muzzle||new T.Vector3(0,.08,-.6));g.add(fl);S.flash=fl;
  S.vm=g;camera.add(g);if(!camera.parent)scene.add(camera);}
 // ---------- spawn / despawn ----------
 function spawnOnFoot(pos){const p=pos||(()=>{const x=(typeof SILO!=='undefined'?SILO.x:0)+60,z=(typeof SILO!=='undefined'?SILO.z:0)+40;return new T.Vector3(x,0,z);})();
  S.on=true;S.pos.copy(p);const gh=typeof groundAt==='function'?groundAt(S.pos.x,S.pos.z).h:0;S.pos.y=Math.max(gh,0)+1.7;S.vy=0;S.slot=0;S.vmId=null;
  [S.load.p,S.load.s].forEach(fill);if(S.near0==null)S.near0=camera.near;camera.near=.03;camera.updateProjectionMatrix();setVM();hud(true);return S.pos;}
 function despawn(){S.on=false;if(S.vm){camera.remove(S.vm);S.vm=null;S.vmId=null;}if(S.near0!=null){camera.near=S.near0;camera.updateProjectionMatrix();}camera.fov=65;camera.updateProjectionMatrix();hud(false);}
 // ---------- HUD (ammo bottom-right above thumb cluster, crosshair, hitmarker) ----------
 let H=null;function hud(show){if(!H){H=document.createElement('div');H.id='wpnHud';H.innerHTML='<div id="wpnX"></div><div id="wpnHM"></div><div id="wpnA"><b></b><span></span><i></i></div>';
   const st=document.createElement('style');st.textContent='#wpnHud{position:fixed;inset:0;pointer-events:none;z-index:6;font:600 13px system-ui;color:#e8f0e8}#wpnX{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px;background:linear-gradient(#cfe 0 0) 50% 0/2px 7px no-repeat,linear-gradient(#cfe 0 0) 50% 100%/2px 7px no-repeat,linear-gradient(#cfe 0 0) 0 50%/7px 2px no-repeat,linear-gradient(#cfe 0 0) 100% 50%/7px 2px no-repeat;opacity:.85}#wpnHM{position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px;opacity:0;background:linear-gradient(45deg,transparent 45%,#fff 45% 55%,transparent 55%),linear-gradient(-45deg,transparent 45%,#fff 45% 55%,transparent 55%)}#wpnA{position:absolute;right:calc(env(safe-area-inset-right) + 150px);top:calc(env(safe-area-inset-top) + 14px);text-align:right;text-shadow:0 1px 2px #000}#wpnA b{font-size:20px;color:#fff}#wpnA span{opacity:.7;margin-left:4px}#wpnA i{display:block;font-style:normal;font-size:11px;color:#9fdc8a;letter-spacing:.06em}';
   document.head.appendChild(st);document.body.appendChild(H);}H.style.display=show?'block':'none';}
 function hudUpd(){if(!H||!S.on)return;const id=cur(),w=W(id);const a=H.querySelector('#wpnA');
  a.children[0].textContent=w?S.mag[id]:id[0]==='@'?'1':'';a.children[1].textContent=w?'/ '+S.res[id]:'';a.children[2].textContent=(w?w.name:id[0]==='@'?(WPN.EQUIP.find(e=>e[0]===id.slice(1))||[])[1]:WPN.KS.find(k=>k[0]===id.slice(1))[1]).toUpperCase()+(S.rel>0?' · RELOAD':'');
  H.querySelector('#wpnX').style.opacity=S.ads>.6?0:.85;H.querySelector('#wpnHM').style.opacity=S.hm>0?1:0;}
 // ---------- look input (right drag) + pinch ADS ----------
 const tp=new Map();let pinch0=0;
 const isLook=e=>S.on&&e.target&&(e.target.tagName==='CANVAS')&&e.clientX>innerWidth*.35;
 addEventListener('pointerdown',e=>{if(!isLook(e))return;tp.set(e.pointerId,{x:e.clientX,y:e.clientY});if(tp.size===2){const [a,b]=[...tp.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);S.sw={y:(a.y+b.y)/2,d:pinch0,done:false};}},{passive:true});
 addEventListener('pointermove',e=>{const q=tp.get(e.pointerId);if(!q)return;if(tp.size===1){const k=.0045*(1-S.ads*.6);S.yaw-=(e.clientX-q.x)*k;S.pitch=Math.max(-1.45,Math.min(1.45,S.pitch-(e.clientY-q.y)*k));}
  q.x=e.clientX;q.y=e.clientY;if(tp.size===2&&pinch0){const [a,b]=[...tp.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(S.sw&&!S.sw.done&&Math.abs(d-S.sw.d)<30){const my=(a.y+b.y)/2-S.sw.y;if(Math.abs(my)>70){S.st=Math.max(0,Math.min(2,S.st+(my>0?1:-1)));S.sw.done=true;pinch0=0;}}if(!pinch0){}else if(d-pinch0>40){S.adsT=true;pinch0=d;}else if(pinch0-d>40){S.adsT=false;pinch0=d;}}},{passive:true});
 const pu=e=>{tp.delete(e.pointerId);if(tp.size<2){pinch0=0;S.sw=null;}};addEventListener('pointerup',pu);addEventListener('pointercancel',pu);
 addEventListener('keydown',e=>{if(!S.on)return;if(e.code==='KeyR')reload();if(e.code==='KeyZ')S.adsT=!S.adsT;if(e.code==='KeyC')S.st=(S.st+1)%3;if(e.code==='KeyJ')S.yaw+=.1;if(e.code==='KeyL')S.yaw-=.1;if(e.code==='KeyI')S.pitch+=.05;if(e.code==='KeyK')S.pitch-=.05;});
 // ---------- weapon actions ----------
 function reload(){const id=cur(),w=W(id);if(!w||S.rel>0)return;const full=Math.round(w.mag*((S.load.att[id]||[]).includes('xmags')?1.5:1));if(S.mag[id]>=full||S.res[id]<=0)return;S.rel=w.reload*(w.cls==='lmg'&&WPN.owner()?.6:1);S.relT=S.rel;S.relId=id;S.dropped=false;snd('rel');}
 function finishReload(){const id=S.relId,w=W(id);if(!w)return;const full=Math.round(w.mag*((S.load.att[id]||[]).includes('xmags')?1.5:1));const n=Math.min(full-S.mag[id],S.res[id]);S.mag[id]+=n;if(!(settings&&settings.unlimited))S.res[id]-=n;}
 function cycle(){const now=performance.now();if(now-S.lastTap<320){S.slot=S.prevSlot;S.lastTap=0;reload();return;}S.prevSlot=S.slot;S.lastTap=now;S.slot=(S.slot+1)%slots().length;S.rel=0;S.adsT=false;}
 function tgts(){const out=[];if(typeof targets!=='undefined')for(const t of targets)if(t.alive)out.push({p:t.pos,r:t.kind==='boat'?9:t.kind==='drone'?4:6,t});
  if(window.PPL&&PPL.live)for(const p of PPL.live)if(!p.dead&&p.root&&p.root.visible!==false)out.push({p:p.root.getWorldPosition(_t.clone()).add(new T.Vector3(0,1,0)),r:.7,ppl:p});return out;}
 function hurt(h,dmg){if(S.hm<.05)snd('hm');S.hm=.15;if(h.ppl){h.ppl.hp=(h.ppl.hp==null?100:h.ppl.hp)-dmg;if(h.ppl.hp<=0&&h.ppl.kill){h.ppl.kill();kill();}return;}
  const t=h.t;t._hp=(t._hp==null?(t.kind==='boat'?300:120):t._hp)-dmg;if(t._hp<=0){t._hp=null;if(typeof killTarget==='function')killTarget(t);kill();}}
 function kill(){S.kills++;S.streak++;if(window.PRG&&PRG.add)try{PRG.add(100);}catch(e){}if(window.UIMW2&&UIMW2.xp)try{UIMW2.xp(100);}catch(e){}
  const req=(S.ksSel||['uav','pred','ac130']).map(k=>WPN.KS.find(x=>x[0]===k));for(const k of req)if(k&&S.streak===k[2]){S.ksReady=k[0];if(typeof msg==='function')msg(k[1].toUpperCase()+' READY',1.4);}}
 function ray(o,d,range,dmg,pen){let best=null,bd=range;for(const h of tgts()){_o.copy(h.p).sub(o);const tc=_o.dot(d);if(tc<0||tc>bd)continue;const d2=_o.lengthSq()-tc*tc;if(d2<h.r*h.r){bd=tc;best=h;}}
  const gh=typeof groundAt==='function'?groundAt:null;let hitP=o.clone().addScaledVector(d,best?bd:range);
  if(best)hurt(best,dmg);tracer(o,hitP);return best;}
 function tracer(a,b){const g=new T.BufferGeometry().setFromPoints([a.clone(),b.clone()]);const l=new T.Line(g,new T.LineBasicMaterial({color:0xffd890,transparent:true,opacity:.9}));scene.add(l);S.tracers.push({l,t:.06});}
 function fireOnce(){const id=cur(),w=W(id);camera.getWorldDirection(_d);const o=camera.getWorldPosition(V());
  if(id[0]==='@')return throwEquip();if(id[0]==='#')return useKS(id.slice(1));
  if(!w||S.rel>0)return;if(S.mag[id]<=0){reload();return;}
  const att=S.load.att[id]||[];const own=WPN.owner();const aim=window.__aim&&__aim.on&&own;
  if(aim){let b=null,bs=.94;for(const h of tgts()){_o.copy(h.p).sub(o);const L=_o.length();if(L>(w.range*6))continue;const s=_o.dot(_d)/L;if(s>bs){bs=s;b=h;}}if(b)_d.copy(b.p).sub(o).normalize();}
  if(!(settings&&settings.unlimited)||!own)S.mag[id]--;
  if(w.cls==='ln'){const mo=o.clone().addScaledVector(_d,1.5);const tg=typeof nearestTarget==='function'?nearestTarget(mo,_d,[...new Set(targets.map(t=>t.kind))],6000,.85):null;
   if(id==='thumper'){const h=ray(o,_d,300,0);const p=h?h.p:o.clone().addScaledVector(_d,120);explosion(p,.5);boom(p,8,150);}
   else if(typeof addProj==='function'&&typeof missileMesh==='function')addProj({type:'missile',pos:mo,vel:_d.clone().multiplyScalar(id==='stinger'?60:40),life:20,mesh:missileMesh(1.2,.05),owner:player,maxSpd:id==='stinger'?750:id==='javelin'?300:200,acc:200,turn:id==='rpg7'||id==='at4'?0:2,tg:id==='rpg7'||id==='at4'?null:tg,arm:.3,boost:2,mslName:'hellfire'});
   S.kick=.5;snd('sn');}
  else{const pel=w.m.pellets||1;const spread=(w.cls==='sg'?.05:.012)*(S.ads>.5?.25:1)*(att.includes('grip')?.7:1)*(aim?0:1);
   for(let i=0;i<pel;i++){const dd=_d.clone().add(new T.Vector3((Math.random()-.5)*spread,(Math.random()-.5)*spread,(Math.random()-.5)*spread)).normalize();ray(o.clone().addScaledVector(dd,.6),dd,w.range*(att.includes('fmj')?8:6),w.dmg[0]*(att.includes('fmj')?1.1:1));}
   const rk=({sn:.06,lmg:.012,ar:.01,smg:.008,mp:.012,sg:.05,hg:.025})[w.cls]*(att.includes('grip')?.6:1)*(own&&aim?.3:1)*[1,.75,.5][S.st];S.pitch+=rk;S.yaw+=(Math.random()-.5)*rk*.6;S.kick=1;snd(w.cls==='sn'?'sn':w.cls==='sg'?'sg':w.cls==='hg'||w.cls==='mp'?'hg':'ar');}
  if(S.flash&&!att.includes('silencer')){S.flash.material.opacity=1;S.flash.rotation.z=Math.random()*3;}
  S.cool=60/(w.rpm*(att.includes('rapid')?1.4:1));if(w.m.burst&&!S.bn){S.bn=w.m.burst-1;}else if(S.bn){S.bn--;S.cool=S.bn?60/w.rpm:.25;}
  if(S.mag[id]<=0&&S.res[id]>0)setTimeout(reload,150);}
 function boom(p,r,dmg){for(const h of tgts())if(h.p.distanceTo(p)<r+h.r)hurt(h,dmg);}
 function throwEquip(){const id=(cur()[0]==='@'?cur().slice(1):S.load.lethal);camera.getWorldDirection(_d);const o=camera.getWorldPosition(V()).addScaledVector(_d,.5);
  const m=WPNM.equip(id);m.position.copy(o);scene.add(m);const g={m,v:_d.clone().multiplyScalar(id==='knife'?30:16).add(new T.Vector3(0,id==='knife'?1:4,0)),t:id==='knife'?3:id==='semtex'?2.5:id==='frag'?3:id==='c4'||id==='claymore'?6:1.6,id};S.thrown=(S.thrown||[]);S.thrown.push(g);S.cool=.8;S.slot=0;}
 function useKS(k){S.ksReady=null;S.streak=0;S.slot=0;camera.getWorldDirection(_d);const o=camera.getWorldPosition(V());const aimP=(()=>{const h=ray(o,_d,6000,0);return h?h.p.clone():o.clone().addScaledVector(_d,800).setY(0);})();
  const strike=(n,step)=>{for(let i=0;i<n;i++)setTimeout(()=>{const p=aimP.clone().add(new T.Vector3((Math.random()-.5)*step*4,0,(i-n/2)*step));explosion(p,1.4);boom(p,25,400);},300+i*180);};
  if(typeof msg==='function')msg((WPN.KS.find(x=>x[0]===k)||[,k])[1].toUpperCase(),1.5);
  if(k==='uav'||k==='cuav'||k==='emp'){S.uavT=30;return;}
  if(k==='pred'&&typeof addProj==='function'&&typeof missileMesh==='function'){const pr=addProj({type:'missile',pos:aimP.clone().add(new T.Vector3(0,2500,0)),vel:new T.Vector3(0,-150,0),life:40,mesh:missileMesh(3,.18),owner:player,maxSpd:400,acc:120,turn:1,tg:typeof nearestTarget==='function'?nearestTarget(aimP,null,[...new Set(targets.map(t=>t.kind))],3000,-1):null,arm:.5,boost:20,mslName:'hellfire'});if(typeof camFollow!=='undefined')camFollow=pr;return;}
  if(k==='nuke'){if(window.NFX&&NFX.smallNuke)NFX.smallNuke(aimP.clone().setLength(Math.max(3000,aimP.length())));else strike(20,30);return;}
  strike(k==='stealth'?14:k==='ac130'||k==='chopper'?10:6,k==='stealth'?40:20);}
 const drops=[];function dropMag(mg){try{if(!mg.children.length)return;mg.updateWorldMatrix(true,true);const c=mg.clone();c.visible=true;mg.matrixWorld.decompose(c.position,c.quaternion,c.scale);c.traverse(o=>{o.renderOrder=0;});scene.add(c);
  const v=new T.Vector3(.4,-1.2,.3).applyQuaternion(camera.quaternion);drops.push({m:c,v,t:8,spin:new T.Vector3(Math.random()*4,Math.random()*3,Math.random()*4)});if(drops.length>6){const o=drops.shift();scene.remove(o.m);}}catch(e){}}
function updDrops(dt){for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.t-=dt;const gy=Math.max(0,typeof groundAt==='function'?groundAt(d.m.position.x,d.m.position.z).h:0)+.02;
  if(d.m.position.y>gy){d.v.y-=9.8*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.spin.x*dt;d.m.rotation.z+=d.spin.z*dt;}else{d.m.position.y=gy;d.v.set(0,0,0);}
  if(d.t<=0){scene.remove(d.m);drops.splice(i,1);}}}
let SC=null;function sHud(){const w=W(cur());const on=S.on&&w&&S.vm&&S.vm.userData.scope&&S.ads>.8;if(!SC){if(!on)return;SC=document.createElement('div');SC.id='wpnScope';
  SC.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;background:radial-gradient(circle at 50% 50%,transparent 0 33vmin,rgba(0,0,0,.55) 33.4vmin,#000 34.5vmin);';
  SC.innerHTML='<div style="position:absolute;left:0;right:0;top:50%;height:1px;background:#000"></div><div style="position:absolute;top:0;bottom:0;left:50%;width:1px;background:#000"></div><div style="position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px;border:1px solid #c00;border-radius:50%"></div>';document.body.appendChild(SC);}
 SC.style.display=on?'block':'none';}
// ---------- per-frame ----------
 function update(dt){if(!S.on)return;const id=cur(),w=W(id);setVM();
  // move
  const sp=(w&&w.cls==='lmg'?4.2:w&&w.cls==='sn'?4:5.2)*(S.ads>.5?.45:1)*STV[S.st]*(S.sprint=(Math.hypot(joy.x,joy.y)>.95&&S.ads<.1&&S.st===0&&S.rel<=0))*0+((w&&w.cls==='lmg'?4.2:w&&w.cls==='sn'?4:5.2)*(S.ads>.5?.45:1)*STV[S.st]*(S.sprint?1.4:1));
  if(S.st===2&&Math.hypot(joy.x,joy.y)>.98&&S.ads<.1){S.proneSprT=(S.proneSprT||0)+dt;if(S.proneSprT>.6){S.st=0;S.proneSprT=0;}}else S.proneSprT=0;
  S.stH+=(STH[S.st]-S.stH)*Math.min(1,dt*8);
  const fx=-Math.sin(S.yaw),fz=-Math.cos(S.yaw);const mx=(joy.y*fx-joy.x*fz),mz=(joy.y*fz+joy.x*fx);
  S.pos.x+=mx*sp*dt;S.pos.z+=mz*sp*dt;const gh=Math.max(0,typeof groundAt==='function'?groundAt(S.pos.x,S.pos.z).h:0)+S.stH;S.pos.y+=(gh-S.pos.y)*Math.min(1,dt*12);
  if(player){if(player.mesh)player.mesh.position.copy(S.pos).setY(S.pos.y-1.7);player.vel&&player.vel.set(mx*sp,0,mz*sp);player.spd=Math.hypot(mx,mz)*sp;}
  // fire / ads
  const f=!!inp.fire;if(f&&S.sprint)S.sprint=false;const holdAds=w&&(w.cls==='sn'||id==='javelin'||id==='stinger');
  if(f)S.heldT+=dt;const want=(holdAds?(f&&S.heldT>.12):false)||S.adsT;S.ads+=((want?1:0)-S.ads)*Math.min(1,dt*10);
  S.cool-=dt;if(S.rel>0){S.rel-=dt;if(S.rel<=0)finishReload();}
  if(holdAds){if(!f&&S.prevF&&S.cool<=0)fireOnce();}else if(f&&S.cool<=0&&(!w||w.rpm>200||!S.prevF||w.cls==='sg'||w.cls==='ln'))fireOnce();else if(S.bn&&S.cool<=0)fireOnce();
  if(!f)S.heldT=0;S.prevF=f;
  // thrown items
  if(S.thrown)for(let i=S.thrown.length-1;i>=0;i--){const g=S.thrown[i];g.v.y-=9.8*dt;g.m.position.addScaledVector(g.v,dt);const gy=Math.max(0,typeof groundAt==='function'?groundAt(g.m.position.x,g.m.position.z).h:0);if(g.m.position.y<gy+.05){g.m.position.y=gy+.05;g.v.multiplyScalar(g.id==='semtex'||g.id==='knife'?0:.4);g.v.y=Math.abs(g.v.y)*.3;}
   g.m.rotation.x+=dt*6;g.t-=dt;if(g.t<=0){scene.remove(g.m);S.thrown.splice(i,1);if(['frag','semtex','c4','claymore'].includes(g.id)){explosion(g.m.position.clone(),.5);boom(g.m.position,7,200);}else if(g.id==='knife'){boom(g.m.position,1.2,200);}else if(g.id==='smoke'&&typeof smoke!=='undefined'){for(let k=0;k<40;k++)smoke.spawn(g.m.position,(Math.random()-.5)*3,1+Math.random(),(Math.random()-.5)*3,8,6,14,.85,.85,.85,.9,.05,.1);}else if(g.id==='flash'||g.id==='stun'){S.flashT=g.id==='flash'?1:.4;}}}
  for(let i=S.tracers.length-1;i>=0;i--){const t=S.tracers[i];t.t-=dt;if(t.t<=0){scene.remove(t.l);t.l.geometry.dispose();t.l.material.dispose();S.tracers.splice(i,1);}}
  if(S.flash)S.flash.material.opacity*=.5;S.hm-=dt;S.kick*=Math.exp(-dt*14);if(S.uavT>0)S.uavT-=dt;}
 function cam(dt){if(!S.on||(typeof camFollow!=='undefined'&&camFollow))return;const bob=Math.hypot(joy.x,joy.y)*Math.sin(performance.now()*.011)*.03*(1-S.ads);
  camera.position.set(S.pos.x,S.pos.y+bob,S.pos.z);camera.rotation.set(S.pitch,S.yaw,0,'YXZ');const w=W(cur());const zf=w&&w.cls==='sn'?20:w&&(S.load.att[cur()]||[]).includes('acog')?40:52;
  const fov=65+(zf-65)*S.ads;if(Math.abs(camera.fov-fov)>.05){camera.fov=fov;camera.updateProjectionMatrix();}
  S.spT=(S.spT||0)+((S.sprint&&!inp.fire?1:0)-(S.spT||0))*Math.min(1,dt*8);
  if(S.vm){const ud=S.vm.userData||{};const rl=S.rel>0&&S.relT?1-S.rel/S.relT:-1;const sm=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
   const tilt=rl<0?0:sm(rl/.15)*(1-sm((rl-.85)/.15));const sc=w&&ud.scope&&S.ads>.8;S.vm.visible=!sc;
   const hip=w&&ud.pistol?[.1,-.115,-.26]:[.115,-.125,-.25],ad=[0,-(ud.sightY||.12),-.2];const a=S.ads;
   S.vm.position.set(hip[0]+(ad[0]-hip[0])*a,hip[1]+(ad[1]-hip[1])*a+bob*.5*(1-a*.8)-tilt*.02,hip[2]+(ad[2]-hip[2])*a+S.kick*(.03-a*.015));
   S.vm.rotation.set(S.kick*(.07-a*.05)+tilt*.35-S.spT*.25,(-.035*(1-a))+S.spT*.7-tilt*.15,tilt*.55+S.spT*.3);S.vm.position.x-=S.spT*.05;
   const mg=ud.mag,la=S.lArm;if(mg&&mg.userData.p0){const p0=mg.userData.p0;let dy=0,vis=true;
    if(rl>=0){if(rl<.3)dy=-sm((rl-.12)/.18)*.2;else if(rl<.55){vis=false;}else dy=-(1-sm((rl-.55)/.22))*.2;
     if(rl>=.3&&!S.dropped){S.dropped=true;dropMag(mg);}}
    mg.position.set(p0.x,p0.y+dy,p0.z);mg.visible=vis;
    if(la&&la.userData.p0){const lp=la.userData.p0;let ly=0;if(rl>=0){ly=rl<.12?-sm(rl/.12)*.06:rl<.3?dy-.06:rl<.55?-.06-sm((rl-.3)/.12)*.25+sm((rl-.43)/.12)*.1:rl<.77?dy-.04:-.04*(1-sm((rl-.77)/.15));}
     la.position.set(lp.x,lp.y+ly,lp.z+(ly<-.1?.05:0));}}
   if(rl>.82&&rl<.9)S.vm.position.z+=.015*Math.sin((rl-.82)/.08*Math.PI);}
  updDrops(dt);sHud();
  hudUpd();}
 // ---------- hook into game ----------
 function hook(){if(typeof DEFS==='undefined'||DEFS.infantry)return;
  DEFS.infantry={name:'Infantry (on foot)',desc:'First-person soldier. Full MW2 arsenal: rifles, SMGs, LMGs, snipers, shotguns, pistols, launchers, equipment, killstreaks.',cls:'silo',weapons:['GUN']};
  const _sp=spawn;spawn=function(kind,...a){if(!DEFS[kind]){try{msg('UNKNOWN VEHICLE',1.2);}catch(e){}return player;}if(S.on&&kind!=='infantry')despawn();const r=_sp(kind,...a);if(kind==='infantry'&&player){player.foot=true;player.mesh=new T.Group();scene.add(player.mesh);player.own=true;spawnOnFoot();}return r;};
  const _fw=fireWeapon;fireWeapon=function(v){if(v&&v.foot)return false;return _fw.apply(this,arguments);};
  const _cw=cycleWeapon;cycleWeapon=function(){if(S.on)return cycle();return _cw.apply(this,arguments);};
  const _ca=ctxAction;ctxAction=function(){if(S.on)return throwEquip();return _ca.apply(this,arguments);};
  const _gh=window.gameHook;window.gameHook=function(dt){if(_gh)_gh(dt);try{update(dt);}catch(e){console.warn('wpn',e);}};
  const _uc=updCamera;updCamera=function(dt){_uc(dt);cam(dt);};
  try{if(window.__milsim)Object.assign(__milsim,{cycleWeapon,ctxAction,spawn});}catch(e){}}
 hook();
 function setLoadout(o){Object.assign(S.load,o||{});if(o&&o.att)S.load.att=Object.assign({},S.load.att,o.att);[S.load.p,S.load.s].forEach(fill);S.vmId=null;}
 function give(id){if(!WPN.W[id])return false;if(!WPN.owner()&&!WPN.unlocked('weapons',id,WPN.W[id].lvl))return false;const w=WPN.W[id];if(['hg','mp','sg','ln'].includes(w.cls)&&!['sg'].includes(w.cls))S.load.s=id;else S.load.p=id;fill(id);S.slot=S.load.p===id?0:1;S.vmId=null;return true;}
 return {_defs:()=>DEFS,spawnOnFoot,despawn,getPos:()=>S.pos.clone(),setLoadout,give,throwEquip,reload,cycle,fire:fireOnce,state:()=>({on:S.on,cur:cur(),mag:S.mag[cur()],res:S.res[cur()],ads:S.ads,kills:S.kills,streak:S.streak,ksReady:S.ksReady,stance:['stand','crouch','prone'][S.st],sprint:!!S.sprint}),setKillstreaks:a=>S.ksSel=a,_S:S};})();
window.WPF=WPF;
window.__wpnT=THREE;
