import {open} from './c5_common.mjs';
const T=await open({width:640,height:360});const R={ok:[],bad:[]};
T.pg.on('response',r=>{if(r.status()>=400)R.e404=(R.e404||[]).concat(r.url());});
R.names=await T.ev(()=>__c5.names());
R.menuHas=await T.ev(()=>{const t=document.body.innerText;return {shuttle:/Shuttle/.test(t),b2:/B-2/.test(t)};});
for(const k of Object.keys(R.names)){const n0=T.errs.length;try{await T.sp(k);await T.st(10);const r=await T.ev(()=>!!__milsim.player);if(!r)R.bad.push(k+':noplayer');else (T.errs.length===n0?R.ok:R.bad).push(k);}catch(e){R.bad.push(k+':'+String(e).slice(0,80));}}
console.log(JSON.stringify(R));console.log('ERR',JSON.stringify(T.errs));await T.b.close();
