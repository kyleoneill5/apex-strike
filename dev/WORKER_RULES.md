# Shared rules for DOMINION builders (Oct 21)
- Game: DOMINION (three.js, iPhone). Source /workspace/milsim/src, build via src/build.sh. Full fix list: /workspace/milsim/KYLE_FIXES.md. Context: NEXT_SESSION.md, FINAL_MERGE.txt.
- Other builders work in parallel. Put your work in NEW module files with your own prefix. Make only minimal edits to shared core files, and note each one in your handoff.
- DO NOT edit src/build.sh, build_deploy.sh, index.html, final.html or /workspace/apex-pages. Build your own test copy with a private script (copy build.sh to /tmp/<you>_build.sh, add your modules, output to /workspace/milsim/test_<you>.html).
- Test in WebKit via Playwright, using your own static server on your assigned port and serving /workspace/milsim. Use flock /tmp/milsim_render.lock for screenshots.
- Kyle's standards:
  - Realistic graphics (#1 priority), missile-grade detail, real web references (save to refs/<thing>/ with sources.txt and compare.png).
  - Smooth on iPhone.
  - Clean UI with minimal text and no overlapping. Keep only FIRE, weapon switch and throttle by the thumb; the left stick stays fixed.
  - Polished screenshots only.
- Pass criteria: zero console errors, and all vehicles still spawn.
- When verified, append a handoff to /workspace/milsim/FINAL_MERGE.txt: files, the exact build.sh insert position, core edits, test results, screenshots, and what's unverified.
- Report back honestly: what works, what's unverified, screenshot paths.

- OVERALL BAR: graphics on par with Call of Duty Mobile; rival Battlefield/Call of Duty polish. Interface should feel like a CoD Mobile-grade HUD and menus.
- Port map: ui 8811, msl 8812, sub 8813, world 8814, navy 8815, wh 8816, ship 8817.
- RELEASE RULE: no build goes to Kyle until everything is merged, bug-fixed and mastered (see KYLE_FIXES.md). Report remaining bugs honestly in your handoff.

## SPEED RULE (added Oct 21 2:26 PM ET, Kyle: "work harder")
Render lock is the bottleneck (14 jobs queued). Effective now:
- Hold /tmp/milsim_render.lock ONLY for final screenshots. Run logic/physics/console-error tests WITHOUT the lock (headless, no screenshot).
- Batch all your shots into ONE locked render session, keep each under ~3 min, smallest viewport that shows the detail.
- Don't re-render unchanged scenes. Keep coding while waiting; never sit idle in the queue.

## ULTRA SPEED = MAIN PRIORITY (Kyle, Oct 21 2:27 PM ET)
- Ship a WORKING version of each item first (zero console errors, nothing broken), write FINAL_MERGE entry, THEN polish detail in passes.
- Max 1 locked screenshot session per item until the final pass. No exploratory renders.
- Reuse existing code/models/assets wherever possible instead of rebuilding.
- Don't block on other builders: stub their hooks and keep going.

## SPACE VISUAL QUALITY (Kyle, Oct 21 2:29 PM ET): "not pixelated in space, looks real and smooth"
Applies to world_, moon_, msl_, ship_ and anyone rendering space/orbit:
- No jagged/stair-stepped horizon or limb: enable MSAA/FXAA or SMAA on the space view, renderer pixelRatio = min(devicePixelRatio, 2), logarithmicDepthBuffer for planet scale (no z-fighting).
- Earth/Moon/planets: high-res textures (>=4k Earth day/night/clouds/specular, 4k Moon from NASA LRO, NASA planet maps), mipmaps + anisotropy max, smooth high-segment spheres or quadtree LOD, normal maps for Moon craters.
- Atmosphere limb: proper scattering shader, soft gradient, no banding (add dithering).
- Stars: real star catalog points, crisp not blocky; no texture stretching.
- Must hold smooth framerate on iPhone (dynamic resolution if needed, never below native-ish sharpness on the planet).
- Verify with a close-up screenshot of the horizon limb: zero visible stair-steps or banding.

## BOX LOAD RULE (Oct 21 2:43 PM ET): box is overloaded (load ~87, RAM 15/16 GB, 117 node/WebKit procs)
- Max ONE WebKit browser open per builder at a time. ALWAYS browser.close() in a finally block; kill your own leftover node/WebKit processes when a test ends or times out.
- Before any WebKit run, check `free -m`; if available < 2000 MB, wait (keep coding) instead of launching.
- Headless logic tests: smallest viewport (640x360), shortest run that proves it.
- Don't start extra http.servers; reuse yours on your port.
- Quality bar unchanged: fast AND detailed. Look at every screenshot yourself and fix what's off before reporting done.

## NOV 3 2026 RESTART (Kyle: "work fast" + "don't wait in line for shit")
- 6 parallel crews restart the full 28-item KYLE_FIXES.md list. Base = latest committed code (apex-pages HEAD 59e35e9 / milsim/test.html + src/).
- NO SHARED RENDER LOCK. Do NOT use /tmp/milsim_render.lock and never wait on any queue. Each crew uses its own port and its own single WebKit instance, takes its own screenshots, and moves on. If RAM is tight (free -m avail < 1500), use a smaller viewport (640x360) and keep going; never sit idle.
- Ship a working version first, then polish. Reuse existing wip/patch/module files from Oct 21 (mp_*, wpn_*, tank_*, moon_*, base_*, subx_*, nuke_*, ppl_*, etc.) instead of rebuilding.
- Crew ports: C1 ui/mp 8831, C2 msl/wpn 8832, C3 sub 8833, C4 world/space/moon/nuke 8834, C5 starship 8835, C6 navy/enemies/ground 8836.
- Each crew writes a FINAL_MERGE.txt handoff and builds its own test file test_c<N>.html. Don't touch apex-pages, index.html or final.html; integration comes after.
