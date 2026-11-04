import {open} from './c5_common.mjs';
const T=await open({width:640,height:360});const R={};
try{
R.catch=await T.ev(()=>{const r=__shipCatch.test();return JSON.stringify(r).slice(0,400);});
R.flop=await T.ev(()=>{const r=__gsflop.test();return JSON.stringify(r).slice(0,400);});
R.kinds=await T.ev(()=>__bay.kinds());
R.menu=await T.ev(()=>[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/shuttle|b-2|spirit/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,40)).slice(0,10));
}catch(e){R.EXC=String(e).slice(0,300);}
console.log(JSON.stringify(R));console.log('ERR',JSON.stringify(T.errs));await T.b.close();
