import {open} from './c5_common.mjs';
const T=await open({width:844,height:390});const R={};
try{
await T.sp('shuttle');await T.st(20);
R.sh=await T.ev(()=>{const B=__bay;const r={pre:!!B.where()};B.forceShuttle(1);r.f=[];for(let i=0;i<3;i++){r.f.push(B.fire());B.cyc();}r.follow=!!B.follow;r.ammo=Object.assign({},B.ammo);r.proj=B.nproj();return r;});
await T.st(150,1/30);R.sh.after=await T.ev(()=>({s:__bay.shs(),proj:__bay.nproj(),follow:!!__bay.follow}));
await T.sp('starship');await T.st(20);
R.st=await T.ev(()=>{const B=__bay;const r={ammo0:Object.assign({},B.ammo)};B.forceStar();r.f0=B.fire();B.door=1;r.f1=B.fire();r.ammo=B.ammo;r.follow=!!B.follow;return r;});
R.tap=await T.ev(()=>{const B=__bay;B.forceStar();B.door=0;B.doorT=0;const w0=B.wi;const b=document.getElementById('bWpn');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return {wi0:w0,wi1:B.wi};});
await T.pg.keyboard.down('Space');await T.pg.keyboard.down('Space');R.tap.dbg=await T.ev(()=>{__bay.pin=1;__milsim.step(3);__bay.pin=0;return {last:__bay.last,dT:__bay.doorT,inp:__milsim.inp.fire};});await T.pg.keyboard.up('Space');R.tap.doorT=await T.ev(()=>__bay.doorT);
await T.sp('f22');await T.st(10);R.f22=await T.ev(()=>({where:__bay.where()}));
}catch(e){R.EXC=String(e).slice(0,300);}
console.log(JSON.stringify(R));console.log('ERR',JSON.stringify(T.errs));await T.b.close();
