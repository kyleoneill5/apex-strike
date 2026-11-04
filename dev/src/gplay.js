// ===== DOMINION in-game UI v2: iOS view switcher, missile CHASE cam + camera blending, HUD cards, nose-cam HUD, glass controls, two-thumb landscape, HUD toggle =====
{const svg=s=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'>${s}</svg>`)}")`;
const I={fire:svg("<circle cx='12' cy='12' r='7.5'/><path d='M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4'/><circle cx='12' cy='12' r='1.8' fill='white'/>"),
 wpn:svg("<path d='M5 19L15.5 8.5'/><path d='M14 4l6 6-2.5 2.5-6-6z'/><path d='M7.5 13.5l3 3M4 20l1.5-1.5'/>"),
 cam:svg("<path d='M3 8.5h3.5L8.5 5.5h7l2 3H21v10.5H3z'/><circle cx='12' cy='13.5' r='3.6'/>"),
 ctx:svg("<path d='M12 2.5c3 2.4 4.5 5.8 4.5 9.5v4h-9v-4c0-3.7 1.5-7.1 4.5-9.5z'/><path d='M7.5 16l-2.5 3.5h3.5M16.5 16l2.5 3.5h-3.5M10 20.5h4'/><circle cx='12' cy='9.5' r='1.6'/>"),
 eye:svg("<path d='M1.8 12S5.5 5 12 5s10.2 7 10.2 7-3.7 7-10.2 7S1.8 12 1.8 12z'/><circle cx='12' cy='12' r='3.2'/>"),
 eyeoff:svg("<path d='M3 3l18 18'/><path d='M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10.2 7 10.2 7a17 17 0 0 1-3 3.8M6.3 6.4C3.4 8.3 1.8 12 1.8 12S5.5 19 12 19a9.6 9.6 0 0 0 4.3-1'/><path d='M9.9 9.9a3.2 3.2 0 0 0 4.3 4.3'/>"),
 pause:svg("<path d='M8.5 5v14M15.5 5v14' stroke-width='2.6'/>")};
const T0='calc(10px + var(--sat))';
const css=document.createElement('style');css.textContent=`
:root{--sat:env(safe-area-inset-top);--sab:env(safe-area-inset-bottom);--sal:env(safe-area-inset-left);--sar:env(safe-area-inset-right);--gl:rgba(18,24,34,.42);--gb:1px solid rgba(255,255,255,.16);--bl:blur(20px) saturate(170%);--sf:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Helvetica Neue",sans-serif}
#hl{visibility:hidden!important}
#hr{background:var(--gl)!important;-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);border:var(--gb)!important;border-radius:16px;padding:9px 12px!important;font:500 11.5px/1.5 "SF Mono",ui-monospace,Menlo,monospace!important;color:#e9f2ff!important;text-shadow:none!important;top:calc(56px + var(--sat))!important;transition:opacity .3s,transform .3s}
#hc{background:var(--gl)!important;-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);border:var(--gb)!important;border-radius:999px;padding:7px 16px!important;font:600 13px var(--sf)!important;letter-spacing:.04em;color:#fff!important;text-shadow:none!important;top:${T0}!important;transition:opacity .3s}
body.gbOn #hc{opacity:0}
#rodHud{background:var(--gl)!important;-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);border:var(--gb)!important;border-radius:14px!important;font:600 12px var(--sf)!important;color:#fff!important;text-shadow:none!important}
#hcards{position:fixed;left:calc(10px + var(--sal));top:calc(58px + var(--sat));display:flex;flex-direction:column;gap:6px;pointer-events:none;z-index:7;font-family:var(--sf);transition:opacity .3s,transform .3s cubic-bezier(.2,.9,.3,1.1);transform-origin:top left}
#hcards .hg{background:var(--gl);-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);border:var(--gb);border-radius:16px;padding:7px 11px 8px;min-width:118px;box-shadow:0 6px 18px rgba(0,0,0,.22)}
#hcards .hg>i{display:block;font-style:normal;font-size:9.5px;font-weight:700;letter-spacing:.16em;color:rgba(170,205,255,.85);margin-bottom:2px}
#hcards .hr{display:flex;align-items:baseline;gap:6px;justify-content:space-between;line-height:1.25}
#hcards .hr span{font-size:9.5px;font-weight:600;letter-spacing:.08em;color:rgba(220,230,245,.55)}
#hcards .hr b{font-size:16px;font-weight:600;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
#hcards .hr b small{font-size:10px;font-weight:500;color:rgba(230,238,255,.6);margin-left:2px}
#hcards .hr.main b{font-size:22px}
#hcards .st{display:flex;flex-wrap:wrap;gap:5px}#hcards .st div{font-size:11px;font-weight:700;letter-spacing:.06em;color:#fff;padding:5px 9px;border-radius:10px;background:var(--gl);border:var(--gb);-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl)}
#hcards .st div.w{background:rgba(255,80,60,.45);border-color:rgba(255,160,150,.5)}
@media (orientation:landscape) and (max-height:500px){#hcards{flex-direction:row;flex-wrap:wrap;max-width:46vw;align-items:flex-start}#hcards .hg{min-width:104px}#hcards .hr.main b{font-size:19px}}
/* view switcher */
#gbar{top:${T0}!important;gap:6px!important;font-family:var(--sf)!important;max-width:calc(100vw - 150px - var(--sal) - var(--sar));transition:opacity .25s}
#gbar .gb{padding:8px 12px!important;border-radius:999px!important;border:var(--gb)!important;background:var(--gl)!important;-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);color:#fff!important;font:600 12px var(--sf)!important;letter-spacing:.03em;transition:transform .15s cubic-bezier(.2,.9,.3,1.3),background .2s;touch-action:none}
#gbar .gb:active{transform:scale(.94);background:rgba(255,255,255,.2)!important}
#gNose{display:none!important}
#gView{position:relative;display:flex;padding:3px;border-radius:999px;background:var(--gl);border:var(--gb);-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);touch-action:none}
#gView .sg{position:relative;z-index:1;padding:7px 14px;font:600 12.5px var(--sf);letter-spacing:.03em;color:rgba(235,242,255,.8);border-radius:999px;transition:color .25s;min-width:52px;text-align:center}
#gView .sg.on{color:#0b1220}
#gView .pill{position:absolute;top:3px;bottom:3px;border-radius:999px;background:rgba(255,255,255,.93);box-shadow:0 3px 10px rgba(0,0,0,.3);transition:left .32s cubic-bezier(.3,1.2,.4,1),width .32s cubic-bezier(.3,1.2,.4,1)}
#gInfo{font:600 11px var(--sf)!important;color:rgba(230,240,255,.8)!important}
/* top bar + HUD toggle */
#topb{top:${T0}!important;gap:8px!important}
#topb div,#bHud{height:36px;min-width:36px;box-sizing:border-box;border-radius:999px!important;background:var(--gl)!important;border:var(--gb)!important;-webkit-backdrop-filter:var(--bl);backdrop-filter:var(--bl);color:#fff!important;font:600 11.5px var(--sf)!important;letter-spacing:.05em;display:flex;align-items:center;justify-content:center;padding:0 12px!important;transition:transform .15s cubic-bezier(.2,.9,.3,1.3),opacity .3s}
#bPause{font-size:0!important;padding:0!important;width:36px;background-image:${I.pause}!important;background-size:16px!important;background-position:center!important;background-repeat:no-repeat!important}
#bHud{position:fixed;left:calc(10px + var(--sal));top:${T0};z-index:31;padding:0!important;width:36px;pointer-events:auto;touch-action:none}
#bHud::before{content:'';width:19px;height:19px;background:${I.eye} center/contain no-repeat;transition:transform .25s}
body.hudOff #bHud::before{background-image:${I.eyeoff}}
#bHud:active,#topb div:active{transform:scale(.9)}
body.hudOff #hcards,body.hudOff #hr,body.hudOff #hc,body.hudOff #nhR{opacity:0!important;transform:scale(.96)}
/* glass controls */
.tb{background:rgba(255,255,255,.1)!important;-webkit-backdrop-filter:var(--bl)!important;backdrop-filter:var(--bl)!important;border:1px solid rgba(255,255,255,.24)!important;color:#fff!important;font:600 10px var(--sf)!important;letter-spacing:.06em;box-shadow:0 8px 22px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.2);transition:transform .14s cubic-bezier(.2,.9,.3,1.4),background .14s!important;flex-direction:column;gap:2px}
.tb.pr{transform:scale(.9)!important;background:rgba(255,255,255,.26)!important}
#bFire,#bWpn,#bCam,#bCtx{background-repeat:no-repeat!important;background-position:center 30%!important;padding-top:22px;box-sizing:border-box}
#bFire{width:92px!important;height:92px!important;background-color:transparent!important;background-image:${I.fire},radial-gradient(circle at 50% 35%,rgba(255,110,90,.7),rgba(205,30,30,.5))!important;background-size:34px,100%!important;background-position:center 28%,center!important;border-color:rgba(255,175,165,.6)!important;box-shadow:0 10px 30px rgba(220,40,40,.42),inset 0 1px 0 rgba(255,255,255,.3);font-size:11px!important;padding-top:40px}
#bWpn{background-image:${I.wpn}!important;background-size:22px!important}
#bCam{background-image:${I.cam}!important;background-size:21px!important}
#bCtx{background-image:${I.ctx}!important;background-size:22px!important;font-size:9px!important}
#knob{background:radial-gradient(circle at 40% 35%,rgba(255,255,255,.8),rgba(205,222,255,.38))!important;border:1px solid rgba(255,255,255,.55);box-shadow:0 6px 18px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.7)!important}
#thr{background:rgba(255,255,255,.08)!important;-webkit-backdrop-filter:var(--bl)!important;backdrop-filter:var(--bl)!important;border:1px solid rgba(255,255,255,.22)!important}
#thrf{background:linear-gradient(0deg,rgba(80,150,255,.8),rgba(150,205,255,.35))!important}
#thrl{font:600 11px var(--sf)!important;color:#e4efff!important}
/* ===layout=== */
/* ===== LAYOUT MAP (all offsets from safe-area vars; 8pt grid; every touch target >= 44pt) =====
 TOP ROW  y=sat+10, h=36 : [bHud @ left sal+10] ... [gbar view switcher / hc title, centered] ... [topb @ right sar+10]
 HUD      y=sat+56       : hcards column (portrait) / wrapped row (landscape) at left; hr weapons card at right. Non-interactive.
 LEFT     joyZone        : x 0..50%, y sat+56..bottom. Floating stick only; never under a button.
 RIGHT    thumb arc      : thr at right edge; FIRE big at the corner; WPN, LAUNCH(ctx), CAM fan around FIRE. All x > 50%.
*/
#joyZone{top:calc(var(--sat) + 56px)!important;width:50%!important;bottom:0!important}
#joy{left:calc(var(--sal) + 18px)!important;bottom:calc(var(--sab) + 22px)!important}
body #thr{right:calc(var(--sar) + 14px)!important;bottom:calc(var(--sab) + 22px)!important;width:58px!important;height:180px!important}
body #bFire{right:calc(var(--sar) + 84px)!important;bottom:calc(var(--sab) + 22px)!important;width:92px!important;height:92px!important}
body #bWpn{right:calc(var(--sar) + 98px)!important;bottom:calc(var(--sab) + 126px)!important;width:64px!important;height:64px!important}
body #bCtx{right:calc(var(--sar) + 98px)!important;bottom:calc(var(--sab) + 202px)!important;width:64px!important;height:64px!important}
body #bCam{right:calc(var(--sar) + 17px)!important;bottom:calc(var(--sab) + 214px)!important;width:52px!important;height:52px!important}
/* ===layout fixes=== */
#topb div,#bHud{height:44px!important;min-width:44px!important}#bPause,#bHud{width:44px!important}
#hc{left:calc(var(--sal) + 64px)!important;transform:none!important;top:calc(var(--sat) + 10px)!important;max-width:38vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:28px;box-sizing:border-box}
#hr{right:calc(var(--sar) + 10px)!important;top:calc(var(--sat) + 62px)!important}
#topb{right:calc(var(--sar) + 10px)!important}
#topb #bMute{position:static!important;margin:0!important;width:44px!important;height:44px!important;font-size:16px!important}
body #bFlr{right:calc(var(--sar) + 17px)!important;bottom:calc(var(--sab) + 278px)!important;width:52px!important;height:52px!important;left:auto!important;top:auto!important}
body #bRc{right:calc(var(--sar) + 17px)!important;bottom:calc(var(--sab) + 342px)!important;width:52px!important;height:52px!important;left:auto!important;top:auto!important}
/* two-thumb landscape: left half = floating stick, right thumb arc */
@media (orientation:landscape){
 body #bFire{right:calc(96px + var(--sar))!important;bottom:calc(26px + var(--sab))!important;width:100px!important;height:100px!important}
 body #bWpn{right:calc(210px + var(--sar))!important;bottom:calc(22px + var(--sab))!important;width:66px!important;height:66px!important}
 body #bCtx{right:calc(196px + var(--sar))!important;bottom:calc(104px + var(--sab))!important;width:66px!important;height:66px!important}
 body #bCam{right:calc(118px + var(--sar))!important;bottom:calc(140px + var(--sab))!important;width:58px!important;height:58px!important}
 body #thr{right:calc(16px + var(--sar))!important;bottom:calc(22px + var(--sab))!important;height:180px!important}
 body #bFlr{right:calc(var(--sar) + 292px)!important;bottom:calc(var(--sab) + 22px)!important}
 body #bRc{right:calc(var(--sar) + 270px)!important;bottom:calc(var(--sab) + 104px)!important}
 #hr{font-size:10.5px!important;line-height:1.35!important;padding:6px 10px!important}
 #hc{max-width:30vw}}
/* nose cam HUD */
#fpv>svg,#fpvT{display:none!important}
#nhud{position:absolute;inset:0;font-family:var(--sf);color:#bff4ff}
#nhud .scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(150,240,255,.035) 0 1px,transparent 1px 3px);mix-blend-mode:screen}
#nhud .glass{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 58%,rgba(0,10,20,.55)),linear-gradient(180deg,rgba(120,220,255,.05),transparent 30%,transparent 70%,rgba(120,220,255,.05))}
#nhud svg{position:absolute;left:50%;top:50%;width:min(92vw,92vh);height:min(92vw,92vh);transform:translate(-50%,-50%);overflow:visible;filter:drop-shadow(0 0 3px rgba(110,230,255,.75))}
#nhud .rd{position:absolute;top:50%;transform:translateY(-50%);padding:8px 12px;border-radius:12px;background:rgba(5,20,30,.32);border:1px solid rgba(140,235,255,.35);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);text-align:center;min-width:76px}
#nhud .rd span{display:block;font-size:9px;font-weight:700;letter-spacing:.2em;color:rgba(160,235,255,.7)}#nhud .rd b{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums;color:#e8fbff;text-shadow:0 0 8px rgba(110,230,255,.6)}#nhud .rd small{font-size:10px;color:rgba(190,240,255,.7);margin-left:2px}
#nhL{left:calc(14% + var(--sal))}#nhA{right:calc(14% + var(--sar))}
#nhR{position:absolute;left:50%;bottom:calc(16% + var(--sab));transform:translateX(-50%);display:flex;gap:10px;transition:opacity .3s}
#nhR .rd{position:static;transform:none}
#nhud .mode{position:absolute;left:50%;top:calc(58px + var(--sat));transform:translateX(-50%);font-size:10px;font-weight:700;letter-spacing:.32em;color:rgba(170,240,255,.8)}
`;document.head.appendChild(css);}
{
 {const mu=document.getElementById('bMute'),tb=document.getElementById('topb');if(mu&&tb)tb.insertBefore(mu,tb.firstChild);}
 // ---------- HUD toggle ----------
 const hb=document.createElement('div');hb.id='bHud';hb.setAttribute('aria-label','Toggle HUD');document.getElementById('hud').appendChild(hb);
 if(settings.hudOff)document.body.classList.add('hudOff');
 hb.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const on=!document.body.classList.toggle('hudOff');settings.hudOff=!on;saveSettings();sfx&&sfx('ui');});
 // ---------- view switcher segment ----------
 const bar=$('gbar');const seg=document.createElement('div');seg.id='gView';seg.innerHTML='<div class="pill"></div><div class="sg" data-v="follow">Follow</div><div class="sg" data-v="chase">Chase</div><div class="sg" data-v="nose">Nose</div>';bar.insertBefore(seg,bar.firstChild);
 const pill=seg.querySelector('.pill');let segV='';
 const viewOf=()=>GUIDE.nose?'nose':GUIDE.chase?'chase':'follow';
 const paint=()=>{const v=viewOf();if(v===segV&&pill.style.width)return;segV=v;seg.querySelectorAll('.sg').forEach(s=>{s.classList.toggle('on',s.dataset.v===v);if(s.dataset.v===v&&s.offsetWidth){pill.style.left=s.offsetLeft+'px';pill.style.width=s.offsetWidth+'px';}});};
 seg.querySelectorAll('.sg').forEach(s=>s.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const v=s.dataset.v;GUIDE.nose=v==='nose';GUIDE.chase=v==='chase';settings.mslView=v;saveSettings();sfx&&sfx('ui');paint();}));
 GUIDE.chase=settings.mslView==='chase';
 {const _add=addProj;addProj=function(o){const r=_add(o);if(camFollow===o&&!GUIDE.nose){GUIDE.chase=settings.mslView==='chase';}return r;};}
 // ---------- nose-cam HUD ----------
 const fp=$('fpv');const nh=document.createElement('div');nh.id='nhud';
 let lad='';for(let a=-90;a<=90;a+=10){if(!a)continue;const y=-a*4,w=a%30?34:52,neg=a<0;lad+=`<g transform="translate(0 ${y})"><path d="M${-w-30} 0H-30${neg?'':''}M30 0H${w+30}" stroke-dasharray="${neg?'6 5':''}"/><path d="M${-w-30} 0v${neg?-6:6}M${w+30} 0v${neg?-6:6}"/><text x="${w+36}" y="4" font-size="10" fill="#bff4ff" stroke="none">${Math.abs(a)}</text></g>`;}
 nh.innerHTML=`<div class="glass"></div><div class="scan"></div><div class="mode">MANUAL · NOSE CAM</div>
 <svg viewBox="-200 -200 400 400" fill="none" stroke="#9eefff" stroke-width="1.1" stroke-linecap="round">
  <defs><clipPath id="nhC"><circle r="150"/></clipPath></defs>
  <g clip-path="url(#nhC)"><g id="nhLad"><path d="M-400 0H-40M40 0H400" stroke-width="1.4"/>${lad}</g></g>
  <circle r="150" stroke-opacity=".22"/><path d="M-160 0h-12M160 0h12M0-160v-12M0 160v12" stroke-opacity=".6"/>
  <g id="nhRoll"><path d="M0-150v10" stroke-width="1.6"/></g>
  <path d="M-150-6 -150 6M150-6 150 6" stroke-opacity=".5"/>
  <path d="M-22 0h-14M22 0h14M0 -22v-10" stroke-width="1.6"/><circle r="5" stroke-width="1.4"/><circle r="1.4" fill="#e8fbff" stroke="none"/>
  <path d="M-58-44l-10 0 0 10M58-44l10 0 0 10M-58 44l-10 0 0-10M58 44l10 0 0-10" stroke-opacity=".55"/>
 </svg>
 <div class="rd" id="nhL"><span>SPEED</span><b id="nhS">—</b></div><div class="rd" id="nhA"><span>ALT</span><b id="nhAl">—</b></div>
 <div id="nhR"><div class="rd"><span>RNG GND</span><b id="nhRg">—</b></div><div class="rd"><span>TTI</span><b id="nhT">—</b></div><div class="rd"><span>LOAD</span><b id="nhG">—</b></div></div>`;
 fp.appendChild(nh);
 // ---------- HUD cards ----------
 const hc=document.createElement('div');hc.id='hcards';document.getElementById('hud').appendChild(hc);
 const GRP={SPD:'SPEED','SRF VEL':'SPEED','ORB VEL':'SPEED','H-SPD':'SPEED',MACH:'SPEED',ALT:'ALTITUDE',AGL:'ALTITUDE',DEPTH:'ALTITUDE','V/S':'ALTITUDE',APO:'ORBIT',PERI:'ORBIT',HDG:'FLIGHT',G:'FLIGHT',PITCH:'FLIGHT',Q:'FLIGHT',THR:'FLIGHT',RNG:'TARGET',TTI:'TARGET'};
 const ORDER=['SPEED','ALTITUDE','ORBIT','FLIGHT','TARGET'];
 const parse=txt=>{const rows=[],st=[];for(let ln of txt.split('\n')){ln=ln.trim();if(!ln)continue;
   const m=ln.match(/^(SRF VEL|ORB VEL|H-SPD|SPD|MACH|ALT|AGL|DEPTH|V\/S|APO|PERI|HDG|G|PITCH|Q|THR)\s*(.*)$/);
   if(m){let [,k,rest]=m;let extra='';const mm=rest.match(/\bM(\d+\.\d+)/);if(k==='SPD'&&mm){extra=mm[1];rest=rest.replace(mm[0],'');}
    const ab=/\bAB\b/.test(rest);if(ab){rest=rest.replace(/\bAB\b/,'');st.push(['AFTERBURNER','']);}
    rest=rest.replace(/\(.*?\)|MAX.*$|→.*$/g,'').trim();const pm=rest.match(/^(-?[\d.,]+)\s*([^\s\d]*)/);
    rows.push([k,pm?pm[1]:rest,pm?pm[2]:'']);if(extra)rows.push(['MACH',extra,'']);
    const thr=rest.match(/THR\s+(\d+)/);if(thr)rows.push(['THR',thr[1],'%']);}
   else st.push([ln.replace(/[▲⚠≈🛰]/g,'').trim(),/STALL|EMPTY/.test(ln)?'w':'']);}return{rows,st};};
 let sig='',nodes={},disp={},tHud=0;
 const fmt=(v,t)=>{const d=(t.split('.')[1]||'').length;return v.toFixed(d);};
 const updCards=(dt,txt)=>{const {rows,st}=parse(txt);const s=rows.map(r=>r[0]).join(',')+'|'+st.map(x=>x[0]).join(',');
  if(s!==sig){sig=s;nodes={};hc.innerHTML='';const g={};for(const r of rows){const k=GRP[r[0]]||'FLIGHT';(g[k]=g[k]||[]).push(r);}
   for(const k of ORDER){if(!g[k])continue;const c=document.createElement('div');c.className='hg';c.innerHTML='<i>'+k+'</i>';
    g[k].forEach((r,i)=>{const e=document.createElement('div');e.className='hr'+(i===0&&k!=='FLIGHT'?' main':'');e.innerHTML=`<span>${r[0]}</span><b></b>`;c.appendChild(e);nodes[r[0]]=e.querySelector('b');});hc.appendChild(c);}
   if(st.length){const c=document.createElement('div');c.className='st';st.forEach(x=>{const e=document.createElement('div');e.textContent=x[0];if(x[1])e.className=x[1];c.appendChild(e);});hc.appendChild(c);}}
  for(const [k,v,u] of rows){const n=nodes[k];if(!n)continue;const tv=parseFloat(String(v).replace(/,/g,''));let out=v;
   if(isFinite(tv)){const p=disp[k];disp[k]=p==null||Math.abs(tv-p)>Math.max(50,Math.abs(tv)*.5)?tv:p+(tv-p)*Math.min(1,dt*12);out=fmt(disp[k],String(v));}
   n.innerHTML=out+(u?'<small>'+u+'</small>':'');}};
 const mslTxt=o=>{const sp=o.vel.length();const gh=groundAt(o.pos.x,o.pos.z).h;let rng=NaN;if(o.vel.y<-0.5)rng=sp*((o.pos.y-gh)/-o.vel.y);
  return {sp,alt:o.pos.y,agl:o.pos.y-gh,rng,tti:isFinite(rng)?rng/Math.max(sp,1):NaN};};
 const fmtD=r=>!isFinite(r)?['—','']:r>=2000?[(r/1000).toFixed(1),'km']:[Math.round(r)+'','m'];
 // ---------- camera: chase cam + blended transitions ----------
 const CH={on:false,d:new THREE.Vector3(0,0,-1),p:new THREE.Vector3()};const BL={k:0,p:new THREE.Vector3(),q:new THREE.Quaternion(),key:''};
 const _pre=new THREE.Vector3(),_pq=new THREE.Quaternion(),_v=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0),_m=new THREE.Matrix4();
 const _uc=updCamera;updCamera=function(dt){_pre.copy(camera.position);_pq.copy(camera.quaternion);_uc(dt);window.__gpN=(window.__gpN||0)+1;try{gpCam(dt);}catch(e){window.__gpErr=String(e&&e.stack||e);}};
 const gpCam=function(dt){
  const o=camFollow,live=!!(o&&o.vel&&o.pos&&!blastCam);
  const key=[camMode,o?1:0,GUIDE.nose?1:0,GUIDE.chase?1:0,blastCam?1:0].join('');
  if(key!==BL.key){if(BL.key&&!(BL.key[2]!==key[2]))/*nose blend owned by gfpv*/{BL.k=1;BL.p.copy(_pre);BL.q.copy(_pq);}BL.key=key;}
  if(live&&GUIDE.chase&&!GUIDE.nose){const sp=o.vel.length();if(sp>1){_v.copy(o.vel).divideScalar(sp);if(!CH.on){CH.d.copy(_v);CH.on=true;}CH.d.lerp(_v,1-Math.exp(-dt*5)).normalize();}
   const L=o.type==='ballistic'?36:o.type==='rod'?16:o.type==='torpedo'?9:9;
   camera.position.copy(o.pos).addScaledVector(CH.d,-L).addScaledVector(_up,L*0.22);
   _v.copy(o.pos).addScaledVector(CH.d,L*1.6);camera.up.set(0,1,0);camera.lookAt(_v);}else CH.on=false;
  if(BL.k>0){BL.k=Math.max(0,BL.k-dt/0.45);const e=BL.k*BL.k*(3-2*BL.k);camera.position.lerp(BL.p,e);camera.quaternion.slerp(BL.q,e);}
  // UI per frame
  document.body.classList.toggle('gbOn',bar.style.display==='flex');if(bar.style.display==='flex')paint();
  tHud+=dt;if(tHud>0.05||!sig){const st=tHud;tHud=0;
   if(live){const m=mslTxt(o);const [rv,ru]=fmtD(m.rng);
    updCards(st,`SPD ${Math.round(m.sp*1.944)} kt M${(m.sp/340).toFixed(2)}\nALT ${Math.round(m.alt)} m\nAGL ${Math.round(m.agl)} m\nRNG ${rv} ${ru}\nTTI ${isFinite(m.tti)?m.tti.toFixed(1):'—'} s\n${(o.name||o.type||'').toString().toUpperCase()}`);
    if(GUIDE.nose){$('nhS').innerHTML=Math.round(m.sp*3.6)+'<small>km/h</small><br><small>M'+(m.sp/340).toFixed(1)+'</small>';$('nhAl').innerHTML=Math.round(m.alt)+'<small>m</small>';
     $('nhRg').innerHTML=rv+'<small>'+ru+'</small>';$('nhT').innerHTML=(isFinite(m.tti)?m.tti.toFixed(1):'—')+'<small>s</small>';$('nhG').innerHTML=(GUIDE.g||0).toFixed(0)+'<small>G</small>'+(GUIDE.boostT>0?' <small>BST</small>':'');}}
   else if(player)updCards(st,$('hl').textContent||'');}
  hc.style.display=player?'flex':'none';
  if(live&&GUIDE.nose){const f=_v.set(0,0,-1).applyQuaternion(camera.quaternion);const pitch=Math.asin(Math.max(-1,Math.min(1,f.y)))*180/Math.PI;
   const r=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),u=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);const roll=Math.atan2(r.y,u.y)*180/Math.PI;
   const L=$('nhLad');if(L)L.setAttribute('transform',`rotate(${roll.toFixed(1)}) translate(0 ${(pitch*4).toFixed(1)})`);const R=$('nhRoll');if(R)R.setAttribute('transform',`rotate(${roll.toFixed(1)})`);}
 };
}
