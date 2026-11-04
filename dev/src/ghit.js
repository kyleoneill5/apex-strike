// ===== hitmarkers + kill feed (original style) =====
{const css=document.createElement('style');css.textContent=`#hitm{position:fixed;left:50%;top:50%;width:44px;height:44px;margin:-22px;pointer-events:none;z-index:7;opacity:0;transition:opacity .25s ease,transform .25s ease}
#hitm.on{opacity:1;transform:scale(1.15);transition:none}#hitm.kill path{stroke:#ff5a4a}
#kfeed{position:fixed;right:calc(10px + env(safe-area-inset-right));top:calc(64px + env(safe-area-inset-top));z-index:7;pointer-events:none;display:flex;flex-direction:column;gap:4px;align-items:flex-end;font:bold 12px system-ui}
#kfeed div{background:rgba(10,16,22,.55);color:#e8f4ff;padding:4px 9px;border-radius:6px;border-left:3px solid #6fd3ff;animation:kf 4s forwards}
@keyframes kf{0%{opacity:0;transform:translateX(20px)}8%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}`;document.head.appendChild(css);
 const h=document.createElement('div');h.id='hitm';h.innerHTML='<svg viewBox="-22 -22 44 44"><path d="M-16-16L-7-7M16-16L7-7M-16 16L-7 7M16 16L7 7" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';document.body.appendChild(h);
 const f=document.createElement('div');f.id='kfeed';document.body.appendChild(f);}
function hitTick(kill){const h=$('hitm');h.classList.toggle('kill',!!kill);h.classList.add('on');clearTimeout(h._t);h._t=setTimeout(()=>h.classList.remove('on'),90);
 const C=AU.ctx;if(C&&!SND.muted){const t=C.currentTime;const o=C.createOscillator(),g=C.createGain();o.type='square';o.frequency.setValueAtTime(kill?1900:2600,t);o.frequency.exponentialRampToValueAtTime(kill?900:1700,t+0.05);g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.07);o.connect(g).connect(C.destination);o.start(t);o.stop(t+0.08);}}
function killFeed(txt){const d=document.createElement('div');d.textContent=txt;const f=$('kfeed');f.prepend(d);while(f.children.length>5)f.lastChild.remove();setTimeout(()=>d.remove(),4100);}
{const _k=killTarget;killTarget=function(t,big){const was=t.alive;_k(t,big);if(was&&!t.alive&&player){hitTick(true);const w=player.weapons&&player.weapons[player.wi]||player.def.name;killFeed(`${player.def.name}  [${w}]  ${({boat:'Patrol boat',drone:'Target drone'})[t.kind]||t.kind}  +${t.kind==='boat'?100:150}`);}};}
window.__hit={hitTick,killFeed};
