// ===== engine sound v2: layered rumble / RPM-pitched turbine whine / afterburner roar+crackle, light-off thump, cockpit muffle, per-engine character =====
const ENG_CHAR={sr71:{r:0.78,w:0.85,ab:1.3},fighter:{r:1,w:1.15,ab:1},f35:{r:1,w:1.15,ab:1},fa18:{r:0.95,w:1.05,ab:1},darkstar:{r:0.85,w:0.9,ab:1.2}};
{const _ue=updEnv;let abOn=false,rpm=0;updEnv=function(dt=0.016){_ue(dt);const C=AU.ctx;if(!C||!SND.ready||!player||paused||player.alive===false)return;if(player.def.cls!=='air'){if(SND.loops.flyby)setLoop('flyby',0,1);return;}
 const ch=ENG_CHAR[player.kind]||ENG_CHAR.fighter;const th=inp.throttle;rpm+=(th-rpm)*Math.min(1,dt*1.4); // spool lag
 const cock=camMode===1&&!camFollow;const near=camFollow?0.35:1;const m=cock?0.45:1;
 setLoop('jet',SND.muted?0:(0.2+0.55*rpm)*near*m,(0.7+rpm*0.45)*ch.r);
 setLoop('flyby',SND.muted?0:(0.08+0.22*rpm)*near*(cock?0.7:1),(1.25+rpm*0.6)*ch.w);           // turbine whine layer
 const ab=th>0.85;setLoop('rocket_deep',SND.muted?0:(ab?0.55*ch.ab:0)*near*m,1.15*ch.r);setLoop('rocket',SND.muted?0:(ab?0.3:0)*near*m,1.3*ch.r); // AB roar + crackle
 if(ab&&!abOn)play3D('boom',null,0.35,1.7,10);abOn=ab;
 if(cock)SND.air.frequency.setTargetAtTime(Math.min(SND.air.frequency.value,2200),C.currentTime,0.1);};}
