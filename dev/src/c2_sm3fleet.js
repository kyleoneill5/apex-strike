// ===== c2_sm3fleet.js (C2, Kyle fix #7): SM-3 Block IIA on every US Navy Aegis surface combatant (Burke, Ticonderoga, Zumwalt-class
// and any Navy ship crew C6 adds with a SAM), not carriers/subs/enemy ships. Re-checks DEFS at spawn so later modules' ships get it too.
(()=>{const ok=(k,d)=>d&&d.cls==='ship'&&!d.enemy&&!/carrier|nimitz|ford|sub|enemy|red|pla|russ/i.test(k+' '+(d.name||''))&&Array.isArray(d.weapons)&&(d.weapons.includes('SAM')||/burke|ticonderoga|cruiser|destroyer|zumwalt|aegis|constellation/i.test(d.name||''));
 const fit=()=>{for(const k in DEFS){const d=DEFS[k];if(ok(k,d)&&!d.weapons.includes('SM3')){const i=d.weapons.indexOf('SAM');d.weapons.splice(i>=0?i+1:1,0,'SM3');}}};
 fit();setTimeout(fit,0);const M=window.__milsim;if(M&&M.spawn){const s0=M.spawn;M.spawn=function(...a){fit();return s0.apply(this,a);};}
 window.__c2sm3fleet={fit,ships:()=>Object.keys(DEFS).filter(k=>DEFS[k].weapons&&DEFS[k].weapons.includes('SM3'))};})();
