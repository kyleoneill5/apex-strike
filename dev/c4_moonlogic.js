// run from src/: node ../c4_moonlogic.js
const fs=require('fs');eval(fs.readFileSync('moon_phys.js','utf8').replace('const MPH','globalThis.MPH'));
eval(fs.readFileSync('moon_flight.js','utf8').replace('const MFL','globalThis.MFL').replace("if(typeof module!=='undefined')module.exports=MFL;",''));
const F=MFL.create('apollo');const inp={auto:true,thr:1,go:true};let ph=[],t=0,dt=2;
for(let i=0;i<4e5&&F.ph!=='landed';i++){MFL.update(F,inp,dt);t+=dt;if(ph[ph.length-1]!==F.ph)ph.push(F.ph);}
console.log('phases',ph.join('>'));console.log('events',F.events.filter(e=>e.txt).map(e=>e.txt).join(' | '));console.log('dv',JSON.stringify(F.dvUsed),'t_h',(t/3600).toFixed(1));
