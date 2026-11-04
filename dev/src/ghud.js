// ===== DOMINION HUD: premium iOS-glass pass (CSS + SVG only, no logic changes) =====
{const svg=s=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>${s}</svg>`)}")`;
const I={fire:svg("<circle cx='12' cy='12' r='7'/><path d='M12 2v4M12 18v4M2 12h4M18 12h4'/><circle cx='12' cy='12' r='1.6' fill='white'/>"),
 wpn:svg("<path d='M4 17l9-9 3-1-1 3-9 9z'/><path d='M14 6l4 4M5 20l-1 1'/>"),
 cam:svg("<path d='M3 8h4l2-3h6l2 3h4v11H3z'/><circle cx='12' cy='13' r='3.5'/>")};
const css=document.createElement('style');css.textContent=`
#hud{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Mono",ui-monospace,sans-serif;color:#eaf6ff;text-shadow:0 1px 2px rgba(0,0,0,.55);font-variant-numeric:tabular-nums}
#hl,#hr,#hc{background:rgba(14,20,30,.38);-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);border:1px solid rgba(255,255,255,.12)!important;border-radius:16px;padding:8px 12px;box-shadow:0 8px 24px rgba(0,0,0,.25);font-size:12.5px;line-height:1.45;letter-spacing:.02em}
#hc{font-size:14px;font-weight:600;letter-spacing:.06em}
#msg{font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:600;font-size:17px;letter-spacing:.12em;color:#fff;padding:10px 18px;border-radius:18px;background:rgba(14,20,30,.42);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.14)}
#cross{width:46px;height:46px;margin:-23px;border:1.5px solid rgba(255,255,255,.75);box-shadow:0 0 0 1px rgba(0,0,0,.25),0 0 12px rgba(120,190,255,.35)}
#cross:after{width:4px;height:4px;background:#fff;box-shadow:0 0 6px #8cf}
#cross:before{content:'';position:absolute;inset:-8px;background:linear-gradient(#fff,#fff) 50% 0/1.5px 7px no-repeat,linear-gradient(#fff,#fff) 50% 100%/1.5px 7px no-repeat,linear-gradient(#fff,#fff) 0 50%/7px 1.5px no-repeat,linear-gradient(#fff,#fff) 100% 50%/7px 1.5px no-repeat;opacity:.8}
.tb,#bPause,#bWarp,#topb div{background:rgba(255,255,255,.1)!important;-webkit-backdrop-filter:blur(20px) saturate(170%);backdrop-filter:blur(20px) saturate(170%);border:1px solid rgba(255,255,255,.2)!important;color:#fff!important;font-family:-apple-system,BlinkMacSystemFont,sans-serif!important;font-weight:600!important;letter-spacing:.06em;box-shadow:0 8px 22px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18);transition:transform .12s cubic-bezier(.2,.9,.3,1.3),background .12s}
#topb div{border-radius:12px!important}
.tb:active,.tb.on,.tb.pr{transform:scale(.93);background:rgba(255,255,255,.22)!important}
#bFire{background:radial-gradient(circle at 50% 35%,rgba(255,110,90,.65),rgba(200,30,30,.45))!important;border-color:rgba(255,170,160,.55)!important;box-shadow:0 10px 30px rgba(220,40,40,.4),inset 0 1px 0 rgba(255,255,255,.3);font-size:11px!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
#bFire::before{content:'';width:30px;height:30px;background:${I.fire} center/contain no-repeat}
#bWpn{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px!important;gap:1px}
#bWpn::before{content:'';width:20px;height:20px;background:${I.wpn} center/contain no-repeat}
#bCam{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px!important}
#bCam::before{content:'';width:18px;height:18px;background:${I.cam} center/contain no-repeat}
#joy{background:radial-gradient(circle,rgba(255,255,255,.04) 0 55%,rgba(255,255,255,.1) 56% 100%)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.22)!important;box-shadow:0 10px 30px rgba(0,0,0,.25),inset 0 0 0 10px rgba(255,255,255,.03)}
#knob{background:radial-gradient(circle at 40% 35%,rgba(255,255,255,.75),rgba(200,220,255,.35))!important;box-shadow:0 6px 18px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.5)}
#thr{background:rgba(255,255,255,.08)!important;-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.2)!important;overflow:visible}
#thrf{background:linear-gradient(0deg,rgba(80,150,255,.75),rgba(140,200,255,.35))!important;box-shadow:0 0 18px rgba(80,150,255,.45)}
#thrl{font:600 11px -apple-system,sans-serif!important;color:#dfeeff!important;letter-spacing:.08em}
#kfeed div{background:rgba(14,20,30,.45)!important;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12)!important;border-radius:12px!important;font-family:-apple-system,BlinkMacSystemFont,sans-serif!important;font-weight:600;letter-spacing:.03em;animation:hudIn .35s cubic-bezier(.2,.9,.25,1.2) both}
@keyframes hudIn{0%{opacity:0;transform:translateX(16px)}100%{opacity:1;transform:none}}
#hitm{filter:drop-shadow(0 0 4px rgba(0,0,0,.6)) drop-shadow(0 0 8px rgba(255,255,255,.35))}
`;document.head.appendChild(css);}
