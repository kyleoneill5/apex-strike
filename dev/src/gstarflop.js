// ===== GSTARFLOP: Starship ship belly-flop (60-90 m/s, active flap trim), flip at ~550 m (aft flaps fold, fwd tuck, Raptor relight, ~3 s rotation), landing burn; strong flap control authority (auto + manual w/ assist) =====
(()=>{const T=THREE,FLIP_ALT=560,FLIP_T=3.2;
 const _st=DS.step;DS.step=function(s,dt){if(s.mode!=='ship'&&!(s.bellyCdA&&s.CdA===63.6&&s.dry===120000)){return _st.apply(this,arguments);}
  const prev=s.phase;let L0=s.manLat,C0=s.bellyCdA,K0=s.CdA;if((prev==='belly'||prev==='aero')&&s.h>FLIP_ALT)s.CdA=s.bellyCdA; // stay in belly drag until the flip
  if(s.man&&(prev==='belly'||prev==='coast')){const pin=(s.manLat||0)/15;s.manLat=pin*48;s.bellyCdA=C0*(1+0.45*Math.abs(pin)+0.25*Math.abs(((s.manAtt??90)-90)/90));} // flaps: differential fore/aft -> strong glide + drag (descent-rate) authority
  if(s.man&&s.fl){const vd=-(Math.max(0,s.h)*0.14+2.5);s.manThr=s.vh<vd?1:(s.vh>vd+3?0:0.45);} // throttle assist after flip
  let E0=s.landEng;if(!s.man&&s.auto&&prev==='landing'&&s.mode==='ship'){ // FIX (ship #13): 3 Raptors at min throttle out-thrust the ship's weight, so the old controller climbed (~+36 m/s at 273 m) and burned out. Engine-out throttling: light only as many Raptors as needed (3 -> 2 -> 1, like real ship flips/landings).
   const m=s.dry+s.prop,an=Math.max(1,s.fEng*E0/m*0.6-9.80665),vd=-Math.max(1.5,Math.sqrt(2*an*Math.max(0,s.h))),Tq=m*(9.80665+(vd-s.vh)*6);
   s.landEng=Math.max(1,Math.min(E0,Math.ceil(Tq/(s.fEng*0.95)),s.h>220?3:(s.h>45?2:1)));if(s.vh>vd&&Tq<s.fEng*s.minThr)s.landEng=1;s._le0=E0;}
  const r=_st.apply(this,arguments);if(s._le0){s.landEng=s._le0;s._le0=0;}s.manLat=L0;s.bellyCdA=C0;s.CdA=K0;
  if(s.phase==='landing'&&!s.fl){if(s.h>FLIP_ALT&&(prev==='belly'||prev==='aero')){s.phase='belly';s.leg=false;if(s.events.length&&/FLIP/.test(s.events[s.events.length-1]))s.events.pop();}
   else{s.fl={t0:s.t,h0:s.h,v0:s.vh};s.events.push('FLIP: AFT FLAPS FOLD, FWD FLAPS TUCK - RAPTOR RELIGHT');}}
  if(s.fl&&!s.landed&&!s.crashed){const ft=s.t-s.fl.t0;if(ft<0.7&&!s.man){s.thr=0;}
   if(s.h<FLIP_ALT&&s.fl.t0<s.t-0.7){const vd=-(Math.max(0,s.h)*0.14+2.5);if(s.vh<vd)s.vh+=(vd-s.vh)*Math.min(1,dt*(s.h<120?6:1.6));s.vx-=s.vx*Math.min(1,dt*0.8);} // manual landing assist
   if(!s.fl.log&&s.landed===false&&s.h<=0.5){s.fl.log=1;}}
  if(s.landed||s.crashed){if(!s.flLog){s.flLog=1;window.__gsflopLog=(window.__gsflopLog||[]).concat([{flipAlt:s.fl&&s.fl.h0,flipV:s.fl&&s.fl.v0,td:s.td,landed:s.landed}]);}}
  return r;};
 // ---- visuals on the recovering ship mesh ----
 const _q1=new T.Quaternion(),_q2=new T.Quaternion(),_e=new T.Euler(),X=new T.Vector3(1,0,0);
 function flaps(m){if(!m.userData.flaps){const f=[];m.traverse(o=>{if(o.name&&o.name.startsWith('grFlap'))f.push(o);});m.userData.flaps=f;}return m.userData.flaps;}
 function poseFlaps(m,ds,ip,dt){const k=Math.min(1,dt*8);for(const f of flaps(m)){const fwd=f.name[6]==='F',sz=f.name[7]==='p'?1:-1;let tg=0;
   if(ds.phase==='belly'||ds.phase==='coast'){const trim=Math.sin(ds.t*1.7+(fwd?0:1.3))*0.08;tg=(fwd?1:-1)*(ip.p*0.55)+sz*ip.r*0.45+trim+(fwd?0.15:-0.1);}
   else if(ds.phase==='landing'){tg=fwd?-1.25:1.3;}
   f.rotation.y+=(sz*tg-f.rotation.y)*k;}}
 const _ur=updRecovery;updRecovery=function(v,sim){_ur(v,sim);const r=rec.shipDS;if(!r)return;const ds=r.ds,m=r.mesh;const ip={p:ds.man?clamp(inp.pitch||0,-1,1):Math.max(-1,Math.min(1,-(ds.vx||0)/120)),r:ds.man?clamp(inp.roll||0,-1,1):0};
  poseFlaps(m,ds,ip,sim);
  if(ds.phase==='belly'||ds.phase==='coast'){_q1.setFromEuler(_e.set(ip.r*0.35,ip.r*0.2,-ip.p*0.3));m.quaternion.multiply(_q1);r.hq=m.quaternion.clone();}
  else if(ds.fl&&r.hq){const k=Math.min(1,(ds.t-ds.fl.t0)/FLIP_T);const e=k*k*(3-2*k);_q2.copy(m.quaternion);m.quaternion.copy(r.hq).slerp(_q2,e);}};
 // ---- test + pose hooks (for trk scripts) ----
 window.__gsflop={test(man){const s=DS.create(Object.assign({},SHIPCFG,{mode:'ship',phase:'belly',h:20000,vh:-300,vx:150,x:-2000,prop:30000,auto:!man,man:!!man,manThr:0,manAtt:90,manLat:0,assist:true}));const out=[];let vmin=1e9,vt=[];
   for(let i=0;i<200000&&!s.landed&&!s.crashed;i++){if(man){s.manLat=Math.max(-15,Math.min(15,-(s.x*0.01+s.vx*0.2)));s.manThr=s.phase==='landing'?0.8:0;}DS.step(s,0.02);if(s.phase==='belly'&&s.h<3000&&s.h>1000)vt.push(-s.vh);while(s.events.length)out.push(s.events.shift()+' @h='+s.h.toFixed(0)+' vh='+s.vh.toFixed(1));}
   return {events:out,beltV:vt.length?(vt.reduce((a,b)=>a+b)/vt.length).toFixed(1):null,fl:s.fl,td:s.td,landed:s.landed,x:s.x.toFixed(1)};},
  pose(pad){const m=shipFromModel(pad||padRocket);m.position.set(0,3000,0);m.quaternion.setFromAxisAngle(new T.Vector3(0,0,1),Math.PI/2);scene.add(m);for(const f of flaps(m)){const fwd=f.name[6]==='F',sz=f.name[7]==='p'?1:-1;f.rotation.y=sz*(fwd?0.3:-0.2);}return m;}};
})();
