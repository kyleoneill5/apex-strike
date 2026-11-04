// ---------- smooth controls: deadzone + expo + exponential damping + rate limit ----------
const SMOOTH={dz:0.06,expo:0.55,s:{pitch:0,roll:0,yaw:0}};window.__smooth=SMOOTH;
function shapeIn(x){const a=Math.abs(x);if(a<SMOOTH.dz)return 0;const t=(a-SMOOTH.dz)/(1-SMOOTH.dz);return Math.sign(x)*(SMOOTH.expo*t*t*t+(1-SMOOTH.expo)*t);}
{const _ri=readInput;readInput=function(dt){_ri(dt);const c=player?player.def.cls:'air';const tau=c==='ship'||c==='sub'?0.32:c==='rocket'?0.22:c==='heli'?0.16:0.09;const maxRate=c==='ship'||c==='sub'?1.5:c==='rocket'?2.2:5;
 const k=1-Math.exp(-dt/tau);for(const ch of ['pitch','roll','yaw']){const tgt=shapeIn(inp[ch]);const cur=SMOOTH.s[ch];let d=(tgt-cur)*k;const lim=maxRate*dt;d=clamp(d,-lim,lim);SMOOTH.s[ch]=Math.abs(cur+d)<1e-4&&tgt===0?0:cur+d;inp[ch]=SMOOTH.s[ch];}};}
