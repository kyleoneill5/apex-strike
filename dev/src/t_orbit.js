eval(require('fs').readFileSync(__dirname+'/orbit.js','utf8')+';global.OM=OM;');
const s=OM.create(process.argv[2]||'rocket');OM.launch(s);let last=0;
for(let i=0;i<20000*50;i++){OM.step(s,0.02);while(s.events.length)console.log(s.t.toFixed(1),s.events.shift(),'h',(s.h/1000).toFixed(1),'v',s.speed.toFixed(0));
 if(s.t-last>30){last=s.t;console.log(`t${s.t.toFixed(0)} h${(s.h/1e3).toFixed(1)} vs${s.vs.toFixed(0)} vh${s.vh.toFixed(0)} p${s.pitch.toFixed(1)} apo${(s.apo/1e3).toFixed(0)} peri${(s.peri/1e3).toFixed(0)} g${s.gforce.toFixed(2)} q${(s.q/1e3).toFixed(1)} f1 ${s.stages[0].prop.toFixed(0)} f2 ${s.stages[1].prop.toFixed(0)}`);}
 if(s.crashed){console.log('CRASH');break;} if(s.t>1200)break;}
