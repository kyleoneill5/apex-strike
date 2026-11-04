//UI_CARDS-BEGIN  vehicle cards: real in-game render thumbnails (thumbs/<key>.jpg, cut from progress/ renders), short copy that never truncates, Air Defense tab hidden in multiplayer (becomes a killstreak). Adds no buttons.
{const TH=new Set(['fighter','fa18','f22','darkstar','heli','destroyer','carrier','sub','silo','rocket','falcon9','starship','sr71','rods','b738','a320','b77w','shuttle','tr3b','saucer','ad_thaad','ad_dsling','ad_patriot','ad_idome']);
const SH={fighter:'Multirole strike fighter. Guns, AAMs, bombs.',fa18:'Carrier fighter. Fast, rugged, heavy load.',f22:'Stealth air-superiority fighter.',darkstar:'Hypersonic recon jet. Mach 6+.',heli:'Attack helicopter. Hellfires and rockets.',destroyer:'Guided-missile destroyer. VLS and gun.',carrier:'Supercarrier. Launch and recover jets.',sub:'Attack sub. Torpedoes and cruise missiles.',silo:'ICBM silo. MIRV strike, tap to pick targets.',rocket:'Orbital launch vehicle.',falcon9:'Reusable booster. Land it on the drone ship.',starship:'Super heavy rocket. Tower catch.',sr71:'Mach 3 spy plane.',rods:'Orbital kinetic rods. Steer to impact.',b738:'Narrow-body airliner.',a320:'Narrow-body airliner.',b77w:'Wide-body long-haul airliner.',shuttle:'Space Shuttle. SRB staging to orbit.',b2:'Stealth bomber (WIP).',himars:'Mobile rocket artillery.',tr3b:'Black triangle craft. Easy hover flight.',saucer:'Saucer craft. Easy hover flight.',ad_thaad:'Run the THAAD battery yourself.',ad_dsling:"Run David's Sling yourself.",ad_patriot:'Run the Patriot battery yourself.',ad_idome:'Run Iron Dome yourself.'};
const css=document.createElement('style');css.textContent=`
#menu.ios .flArt.uiTh{background-size:cover!important;background-position:center!important}
#menu.ios .flArt.uiTh svg{display:none!important}
#menu.ios .flArt.uiTh::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.55));pointer-events:none}
#menu.ios .flDesc{-webkit-line-clamp:unset!important;display:block!important;overflow:visible!important;white-space:normal!important;min-height:0!important}
body.mp #menu.ios .flTab[data-c="airdef"],body.mp #menu.ios .flCard[data-c="airdef"]{display:none!important}`;document.head.appendChild(css);
const isMP=()=>!!(window.__mp&&__mp.active)||document.body.classList.contains('mp');
const apply=()=>{document.body.classList.toggle('mp',isMP());const m=document.getElementById('menu');if(!m)return;
 m.querySelectorAll('.flCard').forEach(c=>{const k=c.dataset.k;const a=c.querySelector('.flArt');if(a&&TH.has(k)&&!a.classList.contains('uiTh')){a.classList.add('uiTh');a.style.backgroundImage=`url(thumbs/${k}.jpg)`;}
  const d=c.querySelector('.flDesc');if(d&&SH[k]&&d.textContent!==SH[k])d.textContent=SH[k];});
 const s=m.querySelector('.flSum .flArt');if(s){let k=null;try{k=settings.lastVeh;}catch(e){}const sel=m.querySelector('.flCard.sel');if(sel)k=sel.dataset.k;if(k&&TH.has(k)){s.classList.add('uiTh');s.style.backgroundImage=`url(thumbs/${k}.jpg)`;}}};
let q=0;const mo=new MutationObserver(()=>{if(q)return;q=1;requestAnimationFrame(()=>{q=0;mo.disconnect();try{apply();}finally{const m=document.getElementById('menu');if(m)mo.observe(m,{childList:true,subtree:true});}});});
const m0=document.getElementById('menu');if(m0){apply();mo.observe(m0,{childList:true,subtree:true});}
window.__uiCards={apply,isMP};}
//UI_CARDS-END