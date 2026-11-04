#!/bin/sh
# C1b private build: base test.html + current src ui_* blocks + mp_* + c1_glue.js -> test_c1b.html
cd /workspace/milsim && python3 - <<'P'
import os
s=open('test.html').read()
for n,f in [('UI_PRESTIGE','ui_prestige.js'),('UI_MW2','ui_mw2.js'),('UI_CARDS','ui_cards.js')]:
    c=open('src/'+f).read().rstrip('\n')
    a=s.index('//%s-BEGIN'%n); b=s.index('//%s-END'%n)+len('//%s-END'%n)
    s=s[:a]+c+s[b:]
extra=''.join(open('src/'+f).read()+'\n' for f in 'mp_relay.js mp_net.js mp_aim.js mp_save.js mp_mod.js mp_modes.js mp_streak.js c1_glue.js'.split())
i=s.rindex('</script>'); s=s[:i]+extra+s[i:]
open('test_c1b.html','w').write(s)
a=s.index('<script type="module">')+22; b=s.rindex('</script>'); open('/tmp/c1/m.mjs','w').write(s[a:b])
P
node --check /tmp/c1/m.mjs && echo C1B_BUILD_OK
