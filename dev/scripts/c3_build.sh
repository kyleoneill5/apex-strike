#!/bin/sh
# C3 private build: base apex-pages/test.html (HEAD 59e35e9) + gsub.js + subx_sub.js inserted right BEFORE gnanfix.js
cd /workspace/milsim && python3 - <<'P'
import os
s=open('/workspace/apex-pages/test.html').read()
i=s.index(open('src/gnanfix.js').read()[:120])
extra=''.join('\n//C3:'+f+'\n'+open('src/'+f).read()+'\n' for f in 'gsub.js subx_sub.js'.split())
s=s[:i]+extra+s[i:]
open('test_c3.html','w').write(s)
a=s.index('<script type="module">')+22; b=s.rindex('</script>'); open('/tmp/c3_m.mjs','w').write(s[a:b])
P
node --check /tmp/c3_m.mjs && echo C3_BUILD_OK
