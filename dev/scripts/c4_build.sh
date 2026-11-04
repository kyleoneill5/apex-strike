#!/bin/bash
# C4 private build: base test.html + world_space, world_land2, moon_*, nuke_fx, gnanfix (LAST)
set -e; cd /workspace/milsim
python3 - <<'PY'
s=open('test.html').read();i=s.rindex('</script>')
fs=['world_space.js','world_land2.js','moon_models.js','moon_phys.js','moon_flight.js','moon_hls.js','moon_mission.js','nuke_fx.js','gnanfix.js']
add=''.join(open('src/'+f).read()+'\n' for f in fs)
open('test_c4.html','w').write(s[:i]+add+s[i:])
a=s.index('<script type="module">')+22;t=open('test_c4.html').read();b=t.rindex('</script>');open('c4_check.mjs','w').write(t[a:b])
PY
node --check c4_check.mjs && echo BUILD_OK
