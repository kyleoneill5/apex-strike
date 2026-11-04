eval(require('fs').readFileSync(__dirname+'/orbit.js','utf8')+';global.OM=OM;global.DS=DS;');
const s=OM.create('starship');OM.launch(s);while(!(s.orbit&&!s.engine)&&s.t<900)OM.step(s,0.02);
for(let i=0;i<600;i++)OM.step(s,0.5); // coast
s.retro=true;while(s.peri>50000)OM.step(s,0.05);s.retro=false;console.log('deorbit done t',s.t|0,'peri',s.peri|0,'prop',s.stages[1].prop|0);
while(s.h>120000)OM.step(s,0.5);console.log('EI t',s.t|0,'h',s.h|0,'v',s.speed|0);
const SC={dry:120000,prop:s.stages[1].prop,fEng:2450e3,ispSL:330,ispVac:375,landEng:3,minThr:0.4,CdA:63.6,bellyCdA:500,flipT:1,radius:60,assist:true,successMsg:'SPLASHDOWN'};
const b=DS.fromOrbit(s,'ship',SC);b.phase='flip';const xp=DS.predictX(b);b.x=-xp;console.log('pred',xp|0,'vx',b.vx|0,'vh',b.vh|0);
let last=-99;while(!b.landed&&!b.crashed&&b.t<3000){DS.step(b,0.05);while(b.events.length)console.log(b.t.toFixed(1),b.events.shift(),'h',b.h|0,'x',b.x|0,'vx',b.vx|0,'vh',b.vh|0,'p',b.prop|0);
 if(b.t-last>60){last=b.t;console.log(`  t${b.t|0} ${b.phase} h${b.h|0} x${b.x|0} vx${b.vx|0} vh${b.vh|0} q${(b.q/1000).toFixed(1)} g${(b.g||0).toFixed(1)} plasma${b.plasma.toFixed(2)}`);}}
console.log('END',b.landed,b.crashed,JSON.stringify(b.td),b.prop|0);
