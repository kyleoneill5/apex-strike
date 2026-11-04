#!/usr/bin/env python3
"""Build dev/merged.html (release, no relay) and dev/test_mp.html (C1 order + test relay).

Base is apex-pages test.html @59e35e9 (repo root test.html).
"""
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / 'dev' / 'src'
BASE = (ROOT / 'test.html').read_text()

def read(name):
    return (SRC / name).read_text().rstrip() + '\n'

def splice_marker(s, begin, end, body):
    a = s.index(begin)
    b = s.index(end, a) + len(end)
    return s[:a] + body.rstrip('\n') + s[b:]

# Mesh.position is read-only. Object.assign(..., {position}) throws.
# Same bug C5's build script papered over for the Darkstar nacelle (already
# position.set in gdetail_f35.js). These four are the copies still in the
# baked enemy aircraft (MiG-29 LERX/tail, F/A-18E LEX/stabilator).
POS_FIXES = [
    ("g.add(Object.assign(surf(s>0?lx:mx(lx),0.1,W),{position:new T.Vector3(0,0.3,0)}));",
     "g.add((m=>{m.position.set(0,0.3,0);return m;})(surf(s>0?lx:mx(lx),0.1,W)));"),
    ("g.add(Object.assign(surf(s>0?ht:mx(ht),0.1,W),{position:new T.Vector3(0,0.15,0)}));",
     "g.add((m=>{m.position.set(0,0.15,0);return m;})(surf(s>0?ht:mx(ht),0.1,W)));"),
    ("g.add(Object.assign(surf(s>0?lex:mx(lex),0.08,W),{position:new T.Vector3(0,0.36,0)}));",
     "g.add((m=>{m.position.set(0,0.36,0);return m;})(surf(s>0?lex:mx(lex),0.08,W)));"),
    ("g.add(Object.assign(surf(s>0?ht:mx(ht),0.12,W),{position:new T.Vector3(0,0.0,0)}));",
     "g.add((m=>{m.position.set(0,0.0,0);return m;})(surf(s>0?ht:mx(ht),0.12,W)));"),
]

def common(s):
    for a, b in POS_FIXES:
        if a not in s:
            sys.exit('missing enemy position pattern: ' + a[:60])
        s = s.replace(a, b, 1)
    s = splice_marker(s, '//UI_PRESTIGE-BEGIN', '//UI_PRESTIGE-END', read('ui_prestige.js'))
    s = splice_marker(s, '//UI_MW2-BEGIN', '//UI_MW2-END', read('ui_mw2.js'))
    s = splice_marker(s, '//UI_CARDS-BEGIN', '//UI_CARDS-END', read('ui_cards.js'))
    mirv_a = s.index('// ===== MIRV AUTO-LOCK')
    mirv_b = s.index('//GDECLUTTER-BEGIN', mirv_a)
    s = s[:mirv_a] + read('gmirvlock.js') + s[mirv_b:]
    s = s.replace('navigator.vibrate&&navigator.vibrate(8)', 'navigator.vibrate&&window.__tapOK&&navigator.vibrate(8)')
    # Unknown vehicle names must not drop the current vehicle (and must not null the tank).
    spawn_old = "function spawn(kind,loc=settings.loc||'airbase'){if(player){if(player.mesh&&player.own)scene.remove(player.mesh);}"
    spawn_new = "function spawn(kind,loc=settings.loc||'airbase'){if(!DEFS[kind]){try{msg('UNKNOWN VEHICLE',1.2);}catch(e){}return player;}if(player){if(player.mesh&&player.own)scene.remove(player.mesh);}"
    if spawn_old not in s:
        sys.exit('spawn guard anchor missing')
    s = s.replace(spawn_old, spawn_new, 1)
    # Red forces engage every player class and the US ships. Deep subs stay immune to ASM (#26).
    tick_old = "function tickAll(dt){clock+=dt;try{padTick(dt);}catch(e){console.warn('pad',e);}"
    tick_new = ("function pickEngage(from,pp,R){const deep=player&&player.def&&player.def.cls==='sub'&&player.mesh&&player.mesh.position.y<-18;if(fightOn()&&pp&&!deep&&from.distanceTo(pp)<R)return pp;let b=null,bd=R;if(typeof NAVY_FLEET!=='undefined')for(const s of NAVY_FLEET.ships){if(!s.m)continue;const d=s.m.position.distanceTo(from);if(d>80&&d<bd){bd=d;b=s.m.position;}}return b;}\n"
                "function tickAll(dt){clock+=dt;try{padTick(dt);}catch(e){console.warn('pad',e);}")
    if tick_old not in s:
        sys.exit('tickAll anchor missing')
    s = s.replace(tick_old, tick_new, 1)
    red_fixes = [
        ("if(u.rl<=0&&d<14000&&((sea&&!(pc==='sub'&&pp.y<-18))||(air&&pp.y<600))&&W.filter(w=>w.u===u).length<1){u.rl=22+Math.random()*12;fireW(u,'cruise',m.position.clone().add(V3(0,12,0)),pp);}",
         "if(u.rl<=0&&W.filter(w=>w.u===u).length<1){const aim=pickEngage(m.position,pp,28000);if(aim){u.rl=8+Math.random()*6;fireW(u,'cruise',m.position.clone().add(V3(0,12,0)),aim);}}"),
        ("if(u.kind==='sub'&&u.rl<=0&&d<9000&&W.filter(w=>w.u===u).length<1){u.rl=30+Math.random()*15;if(sea&&d<5000)fireW(u,'torpedo',m.position.clone().add(V3(0,-2,0)),pp);else if((sea&&!(pc==='sub'&&pp.y<-18))||(air&&pp.y<500))fireW(u,'cruise',m.position.clone().setY(2),pp);}",
         "if(u.kind==='sub'&&u.rl<=0&&W.filter(w=>w.u===u).length<1){const aim=pickEngage(m.position,pp,24000);if(aim){u.rl=10+Math.random()*6;const surf=aim===pp&&sea&&!(pc==='sub'&&pp.y<-18);if(surf&&m.position.distanceTo(aim)<6000)fireW(u,'torpedo',m.position.clone().add(V3(0,-2,0)),aim);else fireW(u,'cruise',m.position.clone().setY(2),aim);}}"),
        ("const hunt=fightOn()&&(air?u.pos.distanceTo(pp)<18000:(sea&&u.pos.distanceTo(pp)<20000));",
         "const aimP=pickEngage(u.pos,pp,26000);const hunt=!!aimP;"),
        ("let goal;if(hunt){goal=air?pp.clone():pp.clone().setY(1800);}else{",
         "let goal;if(hunt){goal=aimP.clone();}else{"),
        ("if(sea&&dist<12000&&u.cmT<=0&&W.filter(w=>w.w==='cruise').length<2){u.cmT=30+Math.random()*15;fireW(u,'cruise',u.pos.clone().add(V3(0,-2,0)),pp);}",
         "if(hunt&&!(air&&aimP===pp)&&dist<26000&&u.cmT<=0&&W.filter(w=>w.w==='cruise').length<3){u.cmT=10+Math.random()*6;fireW(u,'cruise',u.pos.clone().add(V3(0,-2,0)),aimP);}"),
    ]
    for a, b in red_fixes:
        if a not in s:
            sys.exit('red anchor missing: ' + a[:70])
        s = s.replace(a, b, 1)
    # #28 inner layer: RAM and CIWS fire even when an SM-2/ESSM is already guiding.
    # CIWS also leaves a kind:'ciws' round so the pass can see the gun, not only sparks.
    ad_fixes = [
        ("ADF.I.push({tgt,kind,pos:o,vel:V3(0,kind==='ram'?300:200,0),spd:kind==='sm2'?1100:kind==='ram'?700:650,mesh,life:kind==='sm2'?40:14});",
         "ADF.I.push({tgt,kind,pos:o,vel:V3(0,kind==='ram'||kind==='ciws'?300:200,0),spd:kind==='sm2'?1100:kind==='ram'?700:kind==='ciws'?1000:650,mesh,life:kind==='sm2'?40:kind==='ciws'?5:14});"),
        ("for(const e of W){if(e.uw||claimed(e))continue;const d=e.pos.distanceTo(P);\n    if(sub){if(e.u!==player&&d<4500&&d>400&&ADF.samT<=0){ADF.samT=3;launch(e,'sam');msg('IDAS AWAY',0.8);}continue;}\n    if(d<30000&&d>2500&&ADF.vls<=0){ADF.vls=1.2;launch(e,d>12000?'sm2':'essm');msg(d>12000?'SM-2 AWAY':'ESSM AWAY',0.8);}\n    else if(d<=2500&&d>600&&ADF.ramT<=0){ADF.ramT=1.5;launch(e,'ram');msg('RAM AWAY',0.8);}}",
         "for(const e of W){if(e.uw)continue;const d=e.pos.distanceTo(P);\n    if(sub){if(e.u!==player&&d<4500&&d>400&&ADF.samT<=0&&!claimed(e)){ADF.samT=3;launch(e,'sam');msg('IDAS AWAY',0.8);}continue;}\n    if(d<30000&&d>2500&&ADF.vls<=0&&!claimed(e)){ADF.vls=1.2;launch(e,d>12000?'sm2':'essm');msg(d>12000?'SM-2 AWAY':'ESSM AWAY',0.8);}\n    if(d<=2600&&d>350&&ADF.ramT<=0&&!ADF.I.some(i=>i.kind==='ram'&&i.tgt===e)){ADF.ramT=0.6;launch(e,'ram');msg('RAM AWAY',0.8);}}"),
        ("if(ship){let near=null,nd=1800;for(const e of W){if(e.uw)continue;const d=e.pos.distanceTo(P);if(d<nd){nd=d;near=e;}}\n    if(near){ADF.ciwsT-=dt;if(ADF.ciwsT<=0){ADF.ciwsT=0.06;const o=P.clone().add(V3(0,18,0));const dd=near.pos.clone().sub(o);const L=dd.length();dd.normalize();\n     for(let k=0;k<2;k++)fire.spawn(_t.copy(o).addScaledVector(dd,L*Math.random()).add(V3(rnd(4),rnd(4),rnd(4))),dd.x*900,dd.y*900,dd.z*900,0.25,0.8,0,1,0.85,0.3,1);\n     if(Math.random()<dt*(nd<900?2.2:1.1)){near.life=0;near.padKill=true;ADF.kills++;msg('CIWS SPLASH',1);}}}",
         "if(ship){let near=null,nd=2700;for(const e of W){if(e.uw)continue;const d=e.pos.distanceTo(P);if(d<nd){nd=d;near=e;}}\n    if(near){ADF.ciwsT-=dt;if((ADF._ciwsL||0)>0)ADF._ciwsL-=dt;if(ADF.ciwsT<=0){ADF.ciwsT=0.06;const o=P.clone().add(V3(0,18,0));const dd=near.pos.clone().sub(o);const L=dd.length()||1;dd.normalize();\n     for(let k=0;k<2;k++)fire.spawn(_t.copy(o).addScaledVector(dd,L*Math.random()).add(V3(rnd(4),rnd(4),rnd(4))),dd.x*900,dd.y*900,dd.z*900,0.25,0.8,0,1,0.85,0.3,1);\n     if(!(ADF._ciwsL>0)){ADF._ciwsL=0.4;launch(near,'ciws');}\n     if(Math.random()<dt*(nd<1200?6:3)){near.life=0;near.padKill=true;ADF.kills++;msg('CIWS SPLASH',1);}}}"),
        # Rockets: autopilot on so a launch flies the real-time gravity turn through staging.
        # Manual mode used to kill the engine at MECO (~2.3 km/s) and never light stage 2.
        ("v.os=OM.create(d.rk||'rocket');v.os.auto=false;v.os.throttle=1;",
         "v.os=OM.create(d.rk||'rocket');v.os.auto=true;v.os.throttle=1;"),
        ("if(st.prop<=rsv){s.engine=s.auto?s.engine:false;s.events.push(s.stage===0?'MECO - STAGE 1 DEPLETED':'SECO - FUEL DEPLETED');}",
         "if(st.prop<=rsv){if(s.stage>=s.stages.length-1)s.engine=false;s.events.push(s.stage===0?'MECO - STAGE 1 DEPLETED':'SECO - FUEL DEPLETED');}"),
        ("if(s.auto&&s.launched&&s.engine)guide(s,h,q);",
         "if(s.auto&&s.launched&&s.engine)guide(s,h,q);if(!s.auto&&s.launched&&s.stage<s.stages.length-1){const stM=s.stages[s.stage];if(stM&&stM.prop<=(stM.reserve||0)){if(!s._mSep)s._mSep=s.t;if(s.t-s._mSep>2){stageSep(s);s._mSep=0;s.engine=true;}}}"),
        ("origin = 32N 83W (Warner Robins, GA)",
         "origin = 32N 83W (Warner Robins, GA)\nW.coast=US;"),
        # Stage 1 accel 24 m/s^2: 61 s burn reaches ~26 km, not ~38 km, and not the forced 130 m test cut.
        ("const ICBM_ST=[{t:61,a:30},{t:66,a:32},{t:61,a:36}];/*#27 Minuteman III burn times*/",
         "const ICBM_ST=[{t:61,a:24},{t:66,a:32},{t:61,a:36}];/*#27 Minuteman III burn times, stage-1 accel set so sep is ~25-30 km*/"),
        # SM-3 plume starts aft of the nozzle bell so the engine stays visible
        ("const b=_v.copy(o.pos).addScaledVector(o.dir,-0.4-k*1.2);fire.spawn(b,",
         "const b=_v.copy(o.pos).addScaledVector(o.dir,-1.15-k*1.2);fire.spawn(b,"),
        # Horizon limb: thin white-cyan edge over a deeper blue airglow
        ("vec3 col=vec3(0.22,0.48,1.0)*dens*1.6*(1.0-hit)+vec3(0.6,0.8,1.0)*exp(-max(alt,0.0)/2.0)*0.6*(1.0-hit);",
         "vec3 col=vec3(0.05,0.22,0.85)*dens*1.15*(1.0-hit)+vec3(0.75,0.92,1.0)*exp(-max(alt,0.0)/1.15)*0.85*(1.0-hit)+vec3(1.0,0.86,0.62)*exp(-max(alt,0.0)/0.45)*0.35*(1.0-hit)*lit;"),
    ]
    for a, b in ad_fixes:
        if a not in s:
            sys.exit('anchor missing: ' + a[:80])
        s = s.replace(a, b, 1)
    if '<base ' not in s:
        s = s.replace('<head>', '<head><base href="../"><link rel="icon" href="data:,">', 1)
    return s

# Crew insert order, immediately before gnanfix so msl_sm3cam stays last.
# C4 world_space is already in the base (just above gnanfix).
# C6 gdetail_enemy / gnavy / gnavy_enemy are already in the base, before the UI blocks.
MERGE_BEFORE = [
    'world_space.js', 'world_land2.js',
    'moon_models.js', 'moon_phys.js', 'moon_flight.js', 'moon_hls.js', 'moon_mission.js',
    'nuke_fx.js',
    'wpn_data.js', 'wpn_models.js', 'wpn_models2.js', 'wpn_fps.js',
    'ppl_people.js', 'tank_core.js', 'base_bases.js', 'base_walk.js', 'c6_wire.js',
    'c5_ship.js',
    'mp_net.js', 'mp_aim.js', 'mp_save.js', 'mp_mod.js', 'mp_modes.js', 'mp_streak.js',
    # C3: immediately before the baked gnanfix. gsub_ocean.js is not included.
    'gsub.js', 'subx_sub.js',
    'msl_eng.js', 'coast_vec.js',
]

def build_merged():
    s = common(BASE)
    mark = '// ===== GNANFIX'
    i = s.index(mark)
    extra = '\n' + ''.join('//MERGE:' + n + '\n' + read(n) for n in MERGE_BEFORE)
    s = s[:i] + extra + s[i:]
    i = s.rindex('</script>')
    s = s[:i] + '\n' + read('c1_glue.js') + s[i:]
    if 'mp_relay.js' in s or "get('mprelay')" in s.split('c1_glue')[0][-500:]:
        pass
    if read('mp_relay.js')[:40] in s:
        sys.exit('relay leaked into merged.html')
    out = ROOT / 'dev' / 'merged.html'
    out.write_text(s)
    return out, s

def build_mp():
    """C1 handoff order: UI blocks (already spliced), relay, mp_*, c1_glue last."""
    s = common(BASE)
    i = s.rindex('</script>')
    names = ['mp_relay.js', 'mp_net.js', 'mp_aim.js', 'mp_save.js', 'mp_mod.js', 'mp_modes.js', 'mp_streak.js', 'c1_glue.js']
    extra = '\n' + ''.join('//C1:' + n + '\n' + read(n) for n in names)
    s = s[:i] + extra + s[i:]
    out = ROOT / 'dev' / 'test_mp.html'
    out.write_text(s)
    return out, s

def check(label, html):
    a = html.index('<script type="module">') + len('<script type="module">')
    b = html.rindex('</script>')
    p = pathlib.Path('/tmp') / (label + '.mjs')
    p.write_text(html[a:b])
    import subprocess
    r = subprocess.run(['node', '--check', str(p)], capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        sys.exit(label + ' SYNTAX FAIL')
    print(label, 'SYNTAX_OK', p.stat().st_size)

if __name__ == '__main__':
    mo, ms = build_merged()
    to, ts = build_mp()
    check('merged', ms)
    check('test_mp', ts)
    print('WROTE', mo, mo.stat().st_size)
    print('WROTE', to, to.stat().st_size)
