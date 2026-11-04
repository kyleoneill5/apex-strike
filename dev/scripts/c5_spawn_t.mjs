import {open} from './c5_common.mjs';
const T=await open({width:844,height:390});const R={ok:[],bad:[]};
const ks=await T.ev(()=>__bay.kinds());R.ks=ks;
if(ks)for(const k of ks){const n0=T.errs.length;try{await T.sp(k);await T.st(10);const r=await T.ev(()=>!!__milsim.player);if(!r)R.bad.push(k+':noplayer');(T.errs.length===n0?R.ok:R.bad).push(k);}catch(e){R.bad.push(k+':'+String(e).slice(0,80));}}
console.log(JSON.stringify(R));console.log('ERR',JSON.stringify(T.errs));await T.b.close();
