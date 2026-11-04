//GUI_THEME-BEGIN  UI overhaul (Kyle #1): military sci-fi HUD skin. CSS-only restyle of existing DOM; geometry (sizes/positions) untouched so thumb layout, fixed stick, pinch zoom and handlers are unchanged.
{const C='#3fd8ff';const css=`
:root{--gu-c:${C};--gu-c2:rgba(63,216,255,.55);--gu-c3:rgba(63,216,255,.18);--gu-bg:rgba(4,10,20,.62);--gu-bg2:rgba(6,14,28,.82);--gu-ln:1px solid rgba(63,216,255,.28);--gu-amb:#ffb43c;--gu-red:#ff4a3d;--gu-f:"Avenir Next Condensed","SF Pro Display","Roboto Condensed","Arial Narrow",-apple-system,system-ui,sans-serif;--gu-m:"SF Mono",ui-monospace,Menlo,monospace}
/* ---------- MENU ---------- */
html body #menu.ios{background:radial-gradient(90% 70% at 50% 0%,rgba(20,60,90,.55),transparent 70%),linear-gradient(180deg,#040912 0%,#02050b 100%)!important;font-family:var(--gu-f)!important}
html body #menu.ios::before{background:repeating-linear-gradient(0deg,rgba(63,216,255,.035) 0 1px,transparent 1px 44px),repeating-linear-gradient(90deg,rgba(63,216,255,.035) 0 1px,transparent 1px 44px),radial-gradient(40% 35% at 70% 30%,rgba(40,140,200,.14),transparent 70%)!important}
html body #menu.ios::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;background:linear-gradient(180deg,transparent 0,rgba(63,216,255,.06) 50%,transparent 100%);background-size:100% 6px;opacity:.25}
html body #menu.ios .dmLogo .a{font-family:var(--gu-f);font-weight:600!important;background:linear-gradient(180deg,#fff 0%,#cdefff 55%,#5fb8d8 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;filter:drop-shadow(0 0 14px rgba(63,216,255,.25))}
html body #menu.ios .dmLogo .b{color:var(--gu-c)!important;font-weight:600!important;opacity:.85}
html body #menu.ios .dmLogo .ln{background:linear-gradient(90deg,transparent,var(--gu-c),transparent)!important;height:1px}
html body #menu.ios .dmBtn,html body #menu.ios .dmPanel,html body #menu.ios .dmBack,html body #menu.ios .flBack,html body #menu.ios .flSeg,html body #menu.ios .flChip{background:var(--gu-bg)!important;border:var(--gu-ln)!important;border-radius:6px!important;box-shadow:inset 0 1px 0 rgba(63,216,255,.08),0 6px 22px rgba(0,0,0,.35)!important;color:#e6f6ff!important}
html body #menu.ios .dmBtn{text-transform:uppercase;letter-spacing:.12em!important;font-weight:600!important;position:relative;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))}
html body #menu.ios .dmBtn::before{content:"";position:absolute;left:0;top:18%;bottom:18%;width:2px;background:var(--gu-c);opacity:.7}
html body #menu.ios .dmBtn small{color:rgba(160,215,235,.6)!important;text-transform:none;letter-spacing:.04em}
html body #menu.ios .dmBtn.play{background:linear-gradient(90deg,rgba(63,216,255,.30),rgba(63,216,255,.08))!important;border-color:var(--gu-c2)!important;box-shadow:0 0 24px rgba(63,216,255,.18),inset 0 0 18px rgba(63,216,255,.12)!important}
html body #menu.ios .dmBtn .chev{color:var(--gu-c);opacity:.9!important}
html body #menu.ios .dmBtn.pr,html body #menu.ios .flCard.pr{background:rgba(63,216,255,.18)!important}
html body #menu.ios .dmTitle,html body #menu.ios .flT .h{text-transform:uppercase;letter-spacing:.1em!important;font-weight:600!important;font-family:var(--gu-f)}
html body #menu.ios .flT .s{color:var(--gu-c)!important}
html body #menu.ios .flTab{border-radius:4px!important;text-transform:uppercase;letter-spacing:.1em;font-size:12.5px!important;color:rgba(200,230,245,.62)!important;font-family:var(--gu-f)}
html body #menu.ios .flTab.on{background:var(--gu-c3)!important;color:#fff!important;box-shadow:inset 0 -2px 0 var(--gu-c),0 0 14px rgba(63,216,255,.15)!important}
html body #menu.ios .flDots i{background:rgba(63,216,255,.22)!important;border-radius:1px!important;height:3px!important}
html body #menu.ios .flDots i.on{background:var(--gu-c)!important}
html body #menu.ios .flCard{border-radius:8px!important;background:linear-gradient(160deg,rgba(14,32,52,.72),rgba(4,10,20,.72))!important;border:var(--gu-ln)!important;box-shadow:0 14px 34px rgba(0,0,0,.45)!important}
html body #menu.ios .flCard.sel{border-color:var(--gu-c)!important;box-shadow:0 0 0 1px rgba(63,216,255,.35),0 0 28px rgba(63,216,255,.22),0 14px 34px rgba(0,0,0,.45)!important;background:linear-gradient(160deg,rgba(20,60,85,.78),rgba(4,12,24,.78))!important}
html body #menu.ios .flArt{border-radius:4px!important;background:repeating-linear-gradient(0deg,rgba(63,216,255,.05) 0 1px,transparent 1px 16px),repeating-linear-gradient(90deg,rgba(63,216,255,.05) 0 1px,transparent 1px 16px),radial-gradient(80% 90% at 50% 100%,rgba(63,216,255,.22),transparent 70%),#050c17!important;border:1px solid rgba(63,216,255,.14)}
html body #menu.ios .flArt .tag{border-radius:2px!important;background:rgba(63,216,255,.14)!important;color:var(--gu-c)!important;border:1px solid rgba(63,216,255,.3)}
html body #menu.ios .flName{text-transform:uppercase;letter-spacing:.08em;font-family:var(--gu-f);font-weight:600!important}
html body #menu.ios .flDesc,html body #menu.ios .flStats{color:rgba(190,220,235,.7)!important}
html body #menu.ios .flStats b,html body #menu.ios .flSum b{color:var(--gu-c)!important}
html body #menu.ios .flGo,html body #menu.ios .flNext,html body #menu.ios #flLaunch,html body #menu.ios #flNext{border-radius:6px!important;background:linear-gradient(90deg,rgba(63,216,255,.85),rgba(30,150,210,.85))!important;color:#021018!important;border:1px solid #9eeeff!important;text-transform:uppercase;letter-spacing:.16em;font-weight:700!important;box-shadow:0 0 22px rgba(63,216,255,.35)!important}
html body #menu.ios .flChip.on{background:var(--gu-c3)!important;border-color:var(--gu-c)!important}
html body #menu.ios .flCard.flIn{animation:guIn .38s cubic-bezier(.2,.9,.25,1) both!important;opacity:1!important}
@keyframes guIn{0%{transform:translateX(16px)}100%{transform:none}}
/* ---------- HUD ---------- */
html body #hr,html body #hc,html body #hcards .hg,html body #hcards .st div,html body #rodHud,html body #gView,html body #topb div,html body #bHud,html body #gbar .gb,html body #adHud{background:var(--gu-bg)!important;border:var(--gu-ln)!important;border-radius:4px!important;box-shadow:inset 0 1px 0 rgba(63,216,255,.1)!important;color:#e6f6ff!important}
html body #hcards .hg{border-left:2px solid var(--gu-c2)!important}
html body #hcards .hg>i{color:var(--gu-c)!important;font-family:var(--gu-f)}
html body #hcards .hr span{color:rgba(160,210,230,.6)!important}
html body #hcards .hr b{font-family:var(--gu-m)!important;font-weight:500!important;color:#f2fbff!important}
html body #hcards .st div.w{background:rgba(255,74,61,.28)!important;border-color:var(--gu-red)!important;color:#ffd9d4!important}
html body #hr{font-family:var(--gu-m)!important;border-right:2px solid var(--gu-c2)!important}
html body #hc{font-family:var(--gu-f)!important;text-transform:uppercase;letter-spacing:.14em!important;font-size:12px!important}
html body #gView .pill{background:var(--gu-c3)!important;box-shadow:inset 0 -2px 0 var(--gu-c)!important;border-radius:3px!important}
html body #gView .sg{border-radius:3px!important;text-transform:uppercase;font-family:var(--gu-f)!important;color:rgba(200,230,245,.6)!important}
html body #gView .sg.on{color:#fff!important}
html body #cross{border-color:rgba(63,216,255,.65)!important}
html body #cross:after{background:var(--gu-c)!important}
html body #msg{color:#dff6ff!important;font-family:var(--gu-f)!important;text-transform:uppercase;letter-spacing:.14em!important;text-shadow:0 0 10px rgba(63,216,255,.4)!important}
html body #hud{color:#bfefff}
/* ---------- CONTROLS (colours only, geometry unchanged) ---------- */
html body .tb{background-color:rgba(4,12,24,.5)!important;border:1px solid rgba(63,216,255,.42)!important;box-shadow:0 0 14px rgba(63,216,255,.12),inset 0 0 12px rgba(63,216,255,.08)!important;font-family:var(--gu-f)!important;letter-spacing:.12em!important;color:#d8f5ff!important}
html body .tb.pr{background-color:rgba(63,216,255,.28)!important}
html body #bFire{border:1.5px solid rgba(255,90,70,.85)!important;box-shadow:0 0 22px rgba(255,74,61,.35),inset 0 0 18px rgba(255,74,61,.25)!important}
html body #bCtx{border-color:rgba(255,180,60,.7)!important;box-shadow:0 0 14px rgba(255,180,60,.18),inset 0 0 12px rgba(255,180,60,.1)!important}
html body #knob{background:radial-gradient(circle at 50% 45%,rgba(63,216,255,.55),rgba(10,40,60,.55))!important;border:1px solid var(--gu-c)!important;box-shadow:0 0 16px rgba(63,216,255,.35)!important}
html body #joy{border:1px solid rgba(63,216,255,.35)!important;background:radial-gradient(circle,rgba(63,216,255,.06),rgba(4,12,24,.25))!important}
html body #thr{background:rgba(4,12,24,.45)!important;border:1px solid rgba(63,216,255,.4)!important}
html body #thrf{background:linear-gradient(0deg,rgba(63,216,255,.75),rgba(63,216,255,.15))!important}
html body #ngSplash{font-family:var(--gu-f)!important}
`;
const add=()=>{let s=document.getElementById('guTheme');if(!s){s=document.createElement('style');s.id='guTheme';s.textContent=css;}document.head.appendChild(s);};
add();setTimeout(add,1500);setTimeout(add,6000);
}
//GUI_THEME-END
