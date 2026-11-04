// ===== MSL_CUTOFF (msl builder, Kyle #14): throttle-to-zero engine cutoff, no new buttons.
// Rockets (Starship/Super Heavy, Falcon 9, Shuttle, generic) flown manually: throttle -> 0 = full shutdown (MECO puff + msg; thrust/plume/sound already gate on throttle>0).
// Throttle back up = relight: ignition flash, engines light in sequence over ~1.2 s (thrust ramps with lit-engine fraction).
// Jets: throttle 0 = flight idle (6 %). Autopilot (os.auto, retro/deorbit, recovery/landing burns, staging) keeps its own engine control. Solid ICBMs can't shut down (unchanged).
// HOOK for plume/Raptor code: window.ENGINE_CUT.state(v) -> {cut:bool, lit:0..1}; render ceil(n*lit) engines lit (staggered), none when cut. =====
(()=>{const ST=new WeakMap();const IGN=1.2,IDLE=0.06;
 const st=v=>{let s=ST.get(v);if(!s){s={cut:false,lit:1,t:0};ST.set(v,s);}return s;};
 const manual=v=>v&&v.os&&v.os.launched&&!v.os.auto&&!v.os.retro&&!rec.shipDS;
 window.ENGINE_CUT={state:v=>{const s=v&&ST.get(v);return s?{cut:s.cut,lit:s.cut?0:s.lit}:{cut:false,lit:1};}};
 const base=v=>{const m=padRocket;if(!m)return null;const p=m.position.clone();const pr=v.os.pitch*Math.PI/180;return p.addScaledVector(V3(Math.cos(pr),Math.sin(pr),0),v.os.stage===0?-1:(m.userData.s2base||0)-1);};
 const _ur=updRocket;updRocket=function(v,dt){const os=v.os;if(!manual(v)||!os.engine)return _ur(v,dt);
  const s=st(v),thr=inp.throttle;
  if(thr<=0.001&&!s.cut){s.cut=true;s.lit=0;msg((os.stage===0?'MECO':'SECO')+' - ALL ENGINES CUTOFF',1.6);const b=base(v);if(b)for(let k=0;k<26;k++)smoke.spawn(b,rnd(8),-6+rnd(8),rnd(8),1.6,6,16,0.92,0.92,0.94,0.55,0.1,0);}
  else if(thr>0.001&&s.cut){s.cut=false;s.lit=0;s.t=0;msg('ENGINE RELIGHT - IGNITION SEQUENCE',1.4);}
  if(!s.cut&&s.lit<1){s.t+=dt;const nl=Math.min(1,s.t/IGN);const b=base(v);
   if(b&&Math.floor(nl*9)>Math.floor(s.lit*9))for(let k=0;k<10;k++)fire.spawn(b,rnd(5),-10+rnd(5),rnd(5),0.25,4,9,1,0.9,0.75,1);
   s.lit=nl;const keep=inp.throttle;inp.throttle=keep*(0.15+0.85*nl);try{return _ur(v,dt);}finally{inp.throttle=keep;}}
  return _ur(v,dt);};
 // BUG FIX (silo/pad falls): a manual launch always starts at full throttle (pad throttle 0 would cut engines at liftoff).
 const _ol=OM.launch;OM.launch=function(s){if(!s.launched&&inp.throttle<1)inp.throttle=1;return _ol(s);};
 const _ua=updAir;updAir=function(v,dt){if(!(inp.throttle<IDLE))return _ua(v,dt);const keep=inp.throttle;inp.throttle=IDLE;try{return _ua(v,dt);}finally{inp.throttle=keep;}};
})();
