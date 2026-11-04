//UI_PRESTIGE-BEGIN  Kyle #11: MW2(2009)-style rank 1-70 + 10 prestiges. XP comes from in-game score gains (score var). Original SVG badges (no CoD art). Persists in localStorage 'dmProg'.
const PRG=(()=>{const K='dmProg',MAXL=70,MAXP=10;
 let d={xp:0,lvl:MAXL,p:MAXP,tot:0,owner:true,title:'GOLD DIAMOND · CEO',emblem:'owner',tier:'diamond',unlocks:{all:true}};let raw=null;try{raw=localStorage.getItem(K);if(raw)Object.assign(d,JSON.parse(raw));}catch(e){} // no save yet = Kyle's owner profile (P10, L70, all unlocked)
 if(!d.unlocks)d.unlocks={};
 const need=l=>600+l*90; // XP needed to go from level l to l+1 (scaled so 70 is reachable in a few sessions)
 const save=()=>{try{localStorage.setItem(K,JSON.stringify(d));}catch(e){}};
 const subs=[];const emit=(ev,x)=>subs.forEach(f=>{try{f(ev,x)}catch(e){}});
 const add=n=>{if(!(n>0))return;d.tot+=n;if(d.lvl>=MAXL){d.xp=0;save();emit('xp',n);return;}d.xp+=n;let up=0;while(d.lvl<MAXL&&d.xp>=need(d.lvl)){d.xp-=need(d.lvl);d.lvl++;up=1;}if(d.lvl>=MAXL)d.xp=0;save();emit('xp',n);if(up)emit('rank',d.lvl);};
 const canPrestige=()=>d.lvl>=MAXL&&d.p<MAXP;
 const prestige=()=>{if(!canPrestige())return false;d.p++;d.lvl=1;d.xp=0;save();emit('prestige',d.p);return true;};
 // ---- original badge art: rank chevrons (by tier) and prestige crests (10 distinct shapes) ----
 const tierCol=['#8a8f86','#b9c0b0','#d8d28a','#e7b955','#f08c3a','#ff6a3a','#e9e9e9'];
 const rankSvg=(l,sz=40)=>{const tier=Math.min(6,Math.floor((l-1)/10)),n=((l-1)%10)%3+1,c=tierCol[tier];let ch='';for(let i=0;i<n;i++){const y=26-i*7;ch+=`<path d='M8 ${y} L20 ${y-7} L32 ${y} L32 ${y+4} L20 ${y-3} L8 ${y+4}Z' fill='${c}'/>`;}
  const star=tier>=3?`<path d='M20 4l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z' fill='${c}'/>`:'';
  return `<svg viewBox='0 0 40 40' width='${sz}' height='${sz}'><rect x='3' y='3' width='34' height='34' rx='3' fill='rgba(0,0,0,.55)' stroke='${c}' stroke-opacity='.6'/>${star}${ch}</svg>`;};
 const PC=['#7fd36b','#58c7e8','#9a7cff','#ff8a3d','#ff4d6d','#e8e8e8','#46e0b5','#ffd23f','#ff5a1f','#c9f3ff'];
 const shapes=[
  "M20 3L35 12V28L20 37L5 28V12Z", // hex
  "M20 2L38 20L20 38L2 20Z", // diamond
  "M20 2L24 15L38 15L27 23L31 37L20 29L9 37L13 23L2 15L16 15Z", // star
  "M6 4H34V22C34 30 27 35 20 38C13 35 6 30 6 22Z", // shield
  "M20 2L37 11V29L20 38L3 29V11ZM20 9L30 14V26L20 31L10 26V14Z", // double hex
  "M2 20L12 6H28L38 20L28 34H12Z", // stretched hex
  "M20 2L26 14L38 20L26 26L20 38L14 26L2 20L14 14Z", // compass rose
  "M4 8L20 2L36 8L32 30L20 38L8 30Z", // pentashield
  "M20 2A18 18 0 1 1 19.9 2ZM20 8L31 26H9Z", // ring + delta
  "M20 1L25 9L35 6L32 16L39 20L32 24L35 34L25 31L20 39L15 31L5 34L8 24L1 20L8 16L5 6L15 9Z"]; // sun
 const prestigeSvg=(p,sz=40)=>{if(!p)return rankSvg(d.lvl,sz);const c=PC[(p-1)%10],s=shapes[(p-1)%10];
  return `<svg viewBox='0 0 40 40' width='${sz}' height='${sz}'><defs><linearGradient id='pg${p}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff' stop-opacity='.9'/><stop offset='.45' stop-color='${c}'/><stop offset='1' stop-color='#111'/></linearGradient></defs><path d='${s}' fill='url(#pg${p})' fill-rule='evenodd' stroke='${c}' stroke-width='1.2'/><text x='20' y='24.5' text-anchor='middle' font-family='Barlow Condensed,Arial Narrow,sans-serif' font-weight='700' font-size='12' fill='#0a0d0a' stroke='rgba(255,255,255,.25)' stroke-width='.4'>${p}</text></svg>`;};
 const ownerSvg=(sz=40)=>`<svg viewBox='0 0 40 40' width='${sz}' height='${sz}' class='owDia'><defs><linearGradient id='owG' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#ffffff'/><stop offset='.35' stop-color='#cfefff'/><stop offset='.65' stop-color='#7cc8f2'/><stop offset='1' stop-color='#2a5f8a'/></linearGradient><linearGradient id='owS' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#fff' stop-opacity='0'/><stop offset='.5' stop-color='#fff' stop-opacity='.85'/><stop offset='1' stop-color='#fff' stop-opacity='0'/><animate attributeName='x1' values='-1;1' dur='3.2s' repeatCount='indefinite'/><animate attributeName='x2' values='0;2' dur='3.2s' repeatCount='indefinite'/></linearGradient></defs><linearGradient id='owAu' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff3b8'/><stop offset='.45' stop-color='#e0a92a'/><stop offset='.75' stop-color='#9a6a12'/><stop offset='1' stop-color='#f3cf63'/></linearGradient><path d='M20 1L37 8V22C37 31 29 36 20 39C11 36 3 31 3 22V8Z' fill='url(#owAu)'/><path d='M20 3.6L34.6 9.6V22C34.6 29.8 27.7 34.2 20 36.8C12.3 34.2 5.4 29.8 5.4 22V9.6Z' fill='#06101a'/><g fill='#eaf8ff' stroke='#7cc8f2' stroke-width='.3'><path d='M6.5 11l1.3-1.3 1.3 1.3-1.3 1.3z'/><path d='M30.9 11l1.3-1.3 1.3 1.3-1.3 1.3z'/><path d='M6.5 24l1.3-1.3 1.3 1.3-1.3 1.3z'/><path d='M30.9 24l1.3-1.3 1.3 1.3-1.3 1.3z'/></g><g><path d='M11 14H29L33 19L20 34L7 19Z' fill='url(#owG)'/><path d='M11 14L15 19H25L29 14M7 19H33M15 19L20 34L25 19M20 14L15 19M20 14L25 19' fill='none' stroke='#eaf8ff' stroke-width='.7' stroke-opacity='.9'/><path d='M11 14H29L33 19L20 34L7 19Z' fill='url(#owS)'/></g><path d='M20 4.5l.9 2 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z' fill='#f6d35a' stroke='#fff3b8' stroke-width='.3'/></svg>`;
 const badge=(sz)=>d.emblem==='owner'&&d.owner?ownerSvg(sz):prestigeSvg(d.p,sz);
 // ---- public API for other modules (mp_ etc.) ----
 const get=()=>JSON.parse(JSON.stringify(d));
 const set=o=>{if(!o)return get();if(o.lvl!=null)d.lvl=Math.max(1,Math.min(MAXL,o.lvl|0));if(o.p!=null)d.p=Math.max(0,Math.min(MAXP,o.p|0));if(o.xp!=null)d.xp=Math.max(0,o.xp|0);['title','emblem','owner'].forEach(k=>{if(o[k]!==undefined)d[k]=o[k];});if(o.unlocks)Object.assign(d.unlocks,o.unlocks);save();emit('set',get());return get();};
 const isUnlocked=(cat,id)=>!!(d.unlocks.all||d.unlocks[cat+':'+id]||d.unlocks[cat+':*']);
 const unlock=(cat,id)=>{d.unlocks[cat+':'+id]=true;save();emit('unlock',cat+':'+id);};
 const unlockAll=()=>{d.unlocks.all=true;['weapons','attachments','killstreaks','titles','emblems','camos'].forEach(c=>d.unlocks[c+':*']=true);save();emit('unlock','all');};
 const ownerProfile=()=>set({owner:true,p:MAXP,lvl:MAXL,xp:0,title:'GOLD DIAMOND · CEO',emblem:'owner',tier:'diamond',unlocks:{all:true}});
 // XP from score gains
 let last=null;setInterval(()=>{let s;try{s=score;}catch(e){return;}if(typeof s!=='number')return;if(last===null||s<last){last=s;return;}if(s>last){add(s-last);last=s;}},250);
 return {get d(){return d},get,set,isUnlocked,unlock,unlockAll,ownerProfile,ownerSvg,need,add,canPrestige,prestige,badge,rankSvg,prestigeSvg,on:f=>subs.push(f),MAXL,MAXP};})();
window.__prog=PRG;
//UI_PRESTIGE-END