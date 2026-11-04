eval(require('fs').readFileSync(__dirname+'/orbit.js','utf8')+';global.OM=OM;global.DS=DS;');
const BCFG={
 falcon9:{dry:25600,fEng:914e3,ispSL:282,ispVac:311,bbEng:3,entryEng:3,landEng:1,minThr:0.4,CdA:12.6,flipT:10,boostback:true,aim:0,entryBurn:true,entryAlt:55000,entryV:1000,landProp:4000,radius:45,successMsg:'FALCON LANDED',assist:true},
 starship:{dry:200000,fEng:2450e3,ispSL:327,ispVac:350,bbEng:13,entryEng:13,landEng:3,landEngHi:13,minThr:0.4,CdA:63.6,flipT:6,boostback:true,aim:0,entryBurn:true,entryAlt:45000,entryV:700,landStartMax:4000,landProp:22000,radius:15,successMsg:'CAUGHT',assist:true}};
for(const k of ['falcon9','starship']){const s=OM.create(k);OM.launch(s);while(!s.sepState&&s.t<400)OM.step(s,0.02);
 const ss={x:s.sepState.x,y:s.sepState.y,vx:s.sepState.vx,vy:s.sepState.vy,t:s.sepState.t};
 const b=DS.fromOrbit(ss,'booster',{...BCFG[k],prop:s.sepState.prop});
 if(k==='falcon9'){const xp=DS.predictX(b);b.x=-xp*0.5;console.log('pred range',xp|0);}else b.x=b.dr;
 console.log(k,'sep h',b.h|0,'vx',b.vx|0,'vh',b.vh|0,'x',b.x|0,'prop',b.prop|0);
 let last=-99;while(!b.landed&&!b.crashed&&b.t<1000){DS.step(b,0.02);while(b.events.length)console.log(b.t.toFixed(1),b.events.shift(),'h',b.h|0,'x',b.x|0,'vx',b.vx|0,'vh',b.vh|0,'prop',b.prop|0);
  if(b.t-last>(b.phase==="landing"&&b.h<400?0.3:20)){last=b.t;console.log(`  t${b.t|0} ${b.phase} h${b.h|0} x${b.x|0} vx${b.vx|0} vh${b.vh|0} p${b.prop|0} q${(b.q/1000).toFixed(1)} thr${b.thr.toFixed(2)} att${b.att.toFixed(0)} e${b.eng}`);}}
 console.log('END',b.landed,b.crashed,JSON.stringify(b.td),'x',b.x.toFixed(1),'prop',b.prop|0);}
