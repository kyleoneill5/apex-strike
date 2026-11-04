//GMSLSND – per-type procedural missile audio tuned to refs/audio/sources.txt (AIM-9, AIM-120, AGM-65, AGM-114, Tomahawk, JASSM, SM-2, Hydra, hypersonic + arrival crack)
const MSND={P:{
 aim9:    {crack:1.0,thump:0.5,roar:[2.4,3600,1.0],crackle:0.9,tail:0.9},
 aim120:  {crack:0.8,thump:0.6,roar:[3.0,2300,0.9],crackle:0.5,tail:1.4,sustain:[2.5,1500,0.35]},
 maverick:{crack:0.7,thump:1.0,roar:[3.0,1700,1.0],crackle:0.5,tail:1.0},
 hellfire:{crack:0.9,thump:0.6,roar:[1.9,2800,0.9],crackle:0.8,tail:0.7},
 tomahawk:{crack:0.6,thump:1.0,roar:[5.0,900,1.1],crackle:0.4,tail:1.0,whine:[4.0,3200,0.25]},
 jassm:   {crack:0.0,thump:0.2,roar:[0.0,0,0],crackle:0,tail:0.2,whine:[4.0,2900,0.3],spool:1},
 sam:     {crack:1.0,thump:1.2,roar:[4.5,1200,1.2],crackle:0.7,tail:1.6},
 hydra:   {crack:0.6,thump:0.3,roar:[1.0,3000,0.8],crackle:1.0,tail:0.5},
 hyper:   {crack:1.2,thump:0.8,roar:[2.2,1600,1.1],crackle:0.6,tail:0.4,hiss:[4.5,7500,0.32],fastFade:1},
 harr:    {nwave:1,hiss:[2.2,6500,0.45]}},ready:false};
{function synth(C,P){const sr=C.sampleRate;const dur=Math.max(0.6,(P.roar?P.roar[0]:0)+(P.tail||0)+(P.sustain?P.sustain[0]:0)+(P.hiss?P.hiss[0]:0)+(P.whine?P.whine[0]:0)*0.5+0.4);
  const O=new OfflineAudioContext(1,Math.ceil(dur*sr),sr);const nb=O.createBuffer(1,Math.ceil(dur*sr),sr),nd=nb.getChannelData(0);let b=0;for(let i=0;i<nd.length;i++){const w=Math.random()*2-1;b=(b+0.02*w)/1.02;nd[i]=w*0.6+b*3;}
  const noise=()=>{const s=O.createBufferSource();s.buffer=nb;return s;};const G=(t)=>{const g=O.createGain();g.gain.value=0;return g;};let t0=0;
  // ignition crack (igniter pyrogen / squib) + low thump
  if(P.crack){const s=noise(),hp=O.createBiquadFilter();hp.type='highpass';hp.frequency.value=1800;const g=G();g.gain.setValueAtTime(0,0);g.gain.linearRampToValueAtTime(P.crack,0.002);g.gain.exponentialRampToValueAtTime(0.001,0.09);s.connect(hp).connect(g).connect(O.destination);s.start(0);}
  if(P.thump){const o=O.createOscillator();o.frequency.setValueAtTime(90,0);o.frequency.exponentialRampToValueAtTime(35,0.25);const g=G();g.gain.setValueAtTime(P.thump*0.9,0.005);g.gain.exponentialRampToValueAtTime(0.001,0.35);o.connect(g).connect(O.destination);o.start(0);o.stop(0.4);}
  if(P.nwave){for(const [tt,a] of[[0,1.2],[0.11,-1]]){const s=noise(),bp=O.createBiquadFilter();bp.type='lowpass';bp.frequency.value=5000;const g=G();g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(Math.abs(a),tt+0.001);g.gain.exponentialRampToValueAtTime(0.001,tt+0.06);s.connect(bp).connect(g).connect(O.destination);s.start(0);}
   const o=O.createOscillator();o.frequency.setValueAtTime(55,0);const g=G();g.gain.setValueAtTime(1,0.002);g.gain.exponentialRampToValueAtTime(0.001,0.5);o.connect(g).connect(O.destination);o.start(0);o.stop(0.6);t0=0.15;}
  // motor roar: band-limited noise with crackle AM, pitch falls as it recedes
  if(P.roar&&P.roar[0]>0){const [d,fc,a]=P.roar;const s=noise(),lp=O.createBiquadFilter();lp.type='lowpass';lp.Q.value=0.7;lp.frequency.setValueAtTime(fc*1.3,0.02);lp.frequency.exponentialRampToValueAtTime(fc*0.45,d+(P.tail||0));
   const pk=O.createBiquadFilter();pk.type='peaking';pk.frequency.value=fc*0.35;pk.gain.value=6;const g=G();g.gain.setValueAtTime(0,0.01);g.gain.linearRampToValueAtTime(a,0.06);
   if(P.fastFade){g.gain.exponentialRampToValueAtTime(a*0.15,d*0.8);g.gain.exponentialRampToValueAtTime(0.001,d+(P.tail||0));}else{g.gain.setValueAtTime(a*0.85,d*0.6);g.gain.exponentialRampToValueAtTime(a*0.25,d);g.gain.exponentialRampToValueAtTime(0.001,d+(P.tail||0));}
   const am=O.createGain();am.gain.value=1;if(P.crackle){const cs=noise(),cl=O.createBiquadFilter();cl.type='lowpass';cl.frequency.value=40;const cg=O.createGain();cg.gain.value=P.crackle*1.6;cs.connect(cl).connect(cg).connect(am.gain);cs.start(0,0.37);}
   s.connect(lp).connect(pk).connect(am).connect(g).connect(O.destination);s.start(0);t0=d;}
  if(P.sustain){const [d,fc,a]=P.sustain;const s=noise(),lp=O.createBiquadFilter();lp.type='lowpass';lp.frequency.value=fc;const g=G();g.gain.setValueAtTime(0,t0*0.7);g.gain.linearRampToValueAtTime(a,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+d);s.connect(lp).connect(g).connect(O.destination);s.start(0,0.11);}
  // turbofan / turbojet whine (Tomahawk F107, JASSM J402)
  if(P.whine){const [d,f,a]=P.whine;const st=P.spool?0:Math.max(0,t0-1.5);for(const [m,k] of[[1,1],[2.02,0.4],[0.5,0.3]]){const o=O.createOscillator();o.type=m===1?'sawtooth':'sine';o.frequency.setValueAtTime(f*m*(P.spool?0.35:1),st);o.frequency.exponentialRampToValueAtTime(f*m,st+(P.spool?2.2:0.5));const bp=O.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*m;bp.Q.value=4;const g=G();g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(a*k,st+0.8);g.gain.setValueAtTime(a*k,st+d);g.gain.linearRampToValueAtTime(0,st+d+0.4);o.connect(bp).connect(g).connect(O.destination);o.start(st);o.stop(st+d+0.5);}
   const s=noise(),hp=O.createBiquadFilter();hp.type='highpass';hp.frequency.value=1200;const g=G();g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(a*0.6,st+0.8);g.gain.linearRampToValueAtTime(0,st+d+0.4);s.connect(hp).connect(g).connect(O.destination);s.start(st,0.2);}
  // glide hiss / screech (hypersonic): thin, high, no low end
  if(P.hiss){const [d,f,a]=P.hiss;const st=Math.max(0,t0*0.6);const s=noise(),bp=O.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(f,st);bp.frequency.linearRampToValueAtTime(f*1.25,st+d);bp.Q.value=2.2;const hp=O.createBiquadFilter();hp.type='highpass';hp.frequency.value=3500;
   const g=G();g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(a,st+0.35);g.gain.setValueAtTime(a*0.8,st+d*0.6);g.gain.exponentialRampToValueAtTime(0.001,st+d);s.connect(bp).connect(hp).connect(g).connect(O.destination);s.start(st,0.3);
   const o=O.createOscillator();o.frequency.setValueAtTime(f*1.4,st);o.frequency.linearRampToValueAtTime(f*1.1,st+d);const og=G();og.gain.setValueAtTime(0,st);og.gain.linearRampToValueAtTime(a*0.06,st+0.5);og.gain.exponentialRampToValueAtTime(0.0005,st+d);o.connect(og).connect(O.destination);o.start(st);o.stop(st+d);}
  return O.startRendering();}
 MSND.build=()=>{if(MSND.ready||MSND.busy||!AU.ctx)return;MSND.busy=1;const C=AU.ctx;Promise.all(Object.entries(MSND.P).map(([k,P])=>synth(C,P).then(b=>{{let pk=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a;}}if(pk>0.9){const g=0.9/pk;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=g;}}}SND.buf['m_'+k]=b;}))).then(()=>{MSND.ready=true;}).catch(e=>{console.warn('msnd',e);});};
 MSND.pick=o=>{const n=String(o.name||o.wpn||'').toUpperCase();if(o.type==='hyper')return 'hyper';if(o.tlam||/TOMAHAWK|TLAM/.test(n))return 'tomahawk';if(/JASSM/.test(n))return 'jassm';if(/AGM-65|MAVERICK/.test(n))return 'maverick';if(/HELLFIRE|AGM-114/.test(n))return 'hellfire';if(/AIM-9|SIDEWINDER/.test(n))return 'aim9';if(/AIM-120|AMRAAM/.test(n))return 'aim120';
  if(o.type==='sam')return 'sam';if(o.type==='rocket')return 'hydra';const ow=o.owner;if(ow&&ow.def&&ow.def.cls==='heli')return 'hellfire';const tg=o.tgt&&o.tgt.pos?o.tgt.pos:o.tgt;if(tg&&o.pos&&tg.distanceTo&&o.pos.distanceTo(tg)<9000)return 'aim9';return 'aim120';};
 const _ap=addProj;addProj=function(o){const mis=o&&(o.type==='missile'||o.type==='hyper'||o.type==='sam'||o.type==='rocket');if(!mis||!MSND.ready)return _ap(o);const keep=SND.buf.missile;SND.buf.missile=null;let r;try{r=_ap(o);}finally{SND.buf.missile=keep;}
  const k=MSND.pick(o);o._snd=k;const pl=o.owner===player;play3D('m_'+k,o.pos&&o.pos.clone(),k==='sam'||k==='tomahawk'?1.5:1.2,0.94+Math.random()*0.12,k==='sam'||k==='tomahawk'?250:60);if(k==='hyper')MSND.track.add(o);return r;};
 MSND.track=new Set();
 const _tk=tick;tick=function(dt){_tk(dt);if(!MSND.ready)MSND.build();for(const o of MSND.track){if(projs.includes(o)){o._lp=(o._lp||o.pos.clone()).copy(o.pos);continue;}MSND.track.delete(o);const p=o._lp||o.pos;if(p&&p.distanceTo(camera.position)<12000)play3D('m_harr',p.clone(),1.5,1,4000);}};
}
try{window.__milsim.msnd=MSND;MSND.bufs=()=>SND.buf;MSND.ctx=()=>AU.ctx;}catch(e){}
