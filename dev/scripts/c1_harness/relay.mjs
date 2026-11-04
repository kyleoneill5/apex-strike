import {WebSocketServer} from '/workspace/milsim/node_modules/ws/wrapper.mjs';
const w=new WebSocketServer({port:+process.argv[2]||8931});const P=new Map();
w.on('connection',s=>{let id;s.on('message',r=>{const m=JSON.parse(r);if(m.op==='reg'){if(P.has(m.id))return s.send(JSON.stringify({op:'err',type:'unavailable-id'}));id=m.id;P.set(id,s);s.send(JSON.stringify({op:'open'}));return;}
 const t=P.get(m.to);if(!t){if(m.op==='conn')s.send(JSON.stringify({op:'err',type:'peer-unavailable'}));return;}m.from=id;delete m.to;t.send(JSON.stringify(m));});
 s.on('close',()=>{if(id){P.delete(id);for(const o of P.values())o.send(JSON.stringify({op:'gone',from:id}));}});});
console.log('relay up');
