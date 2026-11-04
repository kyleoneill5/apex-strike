import {open} from './c5_common.mjs';
const T=await open({width:640,height:360});const log=[];
const W=async(n,e,t,f)=>{await T.ev(([e,t,f])=>__shipCatch.shot(e,t,f),[e,t,f]);await T.pg.waitForTimeout(400);await T.S(n);log.push(n);};
try{
await T.sp('starship');await T.st(30);
const inf=await T.ev(()=>__shipCatch.info());const [px,pz]=inf.pad,ay=inf.armY,y0=inf.pr;
await T.hud(false);
await T.ev(()=>__shipCatch.pose());
for(const [n,dy,k] of [['catch_4_caught',0,1]]){await T.ev(([dy,k])=>{__shipCatch.arms(k);__shipCatch.dy(dy);},[dy,k]);await W(n,[px+32,ay+8,pz+45],[px-8,ay+(dy>10?10:0),pz],50);}
}catch(e){log.push('EXC '+String(e).slice(0,200));}finally{await T.b.close().catch(()=>{});}
console.log(JSON.stringify(log));console.log('ERR',JSON.stringify(T.errs))
