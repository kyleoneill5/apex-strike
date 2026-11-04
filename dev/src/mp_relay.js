// ===== mp_relay.js — TEST-ONLY PeerJS-compatible shim over a WebSocket relay (?mprelay=ws://host:port). Not for the release build.
{const R=new URLSearchParams(location.search).get('mprelay');if(R){
 class Ev{constructor(){this._h={}}on(e,f){(this._h[e]=this._h[e]||[]).push(f);return this;}_e(e,...a){for(const f of this._h[e]||[])f(...a);}}
 class Conn extends Ev{constructor(pr,peer){super();this.pr=pr;this.peer=peer;this.open=false;}send(d){this.pr._ws.send(JSON.stringify({op:'data',to:this.peer,d}));}close(){if(!this.open)return;this.open=false;this.pr._ws.send(JSON.stringify({op:'close',to:this.peer}));this.pr._c.delete(this.peer);this._e('close');}}
 window.Peer=class extends Ev{constructor(id){super();this.id=id||('p'+Math.random().toString(36).slice(2,10));this._c=new Map();const ws=this._ws=new WebSocket(R);
  ws.onopen=()=>ws.send(JSON.stringify({op:'reg',id:this.id}));ws.onclose=()=>this._e('disconnected');
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.op==='open')this._e('open',this.id);else if(m.op==='err')this._e('error',{type:m.type});
   else if(m.op==='conn'){const c=new Conn(this,m.from);this._c.set(m.from,c);this._e('connection',c);setTimeout(()=>{c.open=true;ws.send(JSON.stringify({op:'ack',to:m.from}));c._e('open');},0);}
   else if(m.op==='ack'){const c=this._c.get(m.from);if(c){c.open=true;c._e('open');}}
   else if(m.op==='data'){const c=this._c.get(m.from);if(c)c._e('data',m.d);}
   else if(m.op==='close'||m.op==='gone'){const c=this._c.get(m.from);if(c&&(c.open||m.op==='gone')){c.open=false;this._c.delete(m.from);c._e('close');}}};}
  connect(id){const c=new Conn(this,id);this._c.set(id,c);this._ws.send(JSON.stringify({op:'conn',to:id}));return c;}
  reconnect(){}destroy(){try{this._ws.close()}catch(e){}}};}}
