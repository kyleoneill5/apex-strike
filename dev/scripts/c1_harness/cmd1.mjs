await A.evaluate(()=>document.getElementById('mwMP').click());await A.waitForTimeout(2500);
await A.screenshot({path:'/workspace/milsim/progress/c1b_mp.png'});
const ctx=A.context();const B=await ctx.newPage();const base=A.url().split('?')[0];
const r={};
await A.goto(base+'?mptest&mprelay=ws://localhost:8931',{timeout:400000});await B.goto(base+'?mptest&mprelay=ws://localhost:8931',{timeout:400000});
for(const P of [A,B])await P.waitForFunction(()=>window.__mp&&document.getElementById('flPlay'),null,{timeout:400000});
r.host=await A.evaluate(async()=>{const c=await (__mp.host?__mp.host():null);return {c,st:__mp.state,keys:Object.keys(__mp)}});
return JSON.stringify(r);
