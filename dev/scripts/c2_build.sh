#!/bin/bash
# C2 private build: base = committed apex-pages/test.html (HEAD 59e35e9: has msl_sm3, msl_cutoff, msl_sm3cam, gwh, gwh_mirv, gnanfix, gmirvlock, #27b) + wpn_* (#21)
set -e; cd /workspace/milsim
python3 - <<'PY'
s=open('/workspace/apex-pages/test.html').read();i=s.rindex('</script>')
add=''.join(open('src/'+f).read()+'\n' for f in ['wpn_data.js','wpn_models.js','wpn_models2.js','wpn_fps.js'])
open('test_c2.html','w').write(s[:i]+add+s[i:])
a=s.index('<script type="module">')+22;t=open('test_c2.html').read();b=t.rindex('</script>');open('/tmp/c2.mjs','w').write(t[a:b])
PY
node --check /tmp/c2.mjs && echo BUILD_OK
