#!/bin/bash
# C5 private build: base = committed test.html (59e35e9, already has gstarflop/gship_catch/gship_bay/graptor3/gplume/gmechazilla_arms) + c5_ship.js + gnanfix.js (LAST)
set -e; cd /workspace/milsim
python3 - <<'PY'
s=open('test.html').read();i=s.rindex('</script>')
add=''.join(open('src/'+f).read()+'\n' for f in ['c5_ship.js','gnanfix.js'])
o=s[:i]+add+s[i:]
# C5 build-time fix (darkstar spawn TypeError): Mesh.position is read-only, Object.assign can't replace it
o=o.replace("K.body,32),{position:new T.Vector3(s*1.25,-0.55,0)}));","K.body,32),{}));g.children[g.children.length-1].position.set(s*1.25,-0.55,0);",1)
open('test_c5.html','w').write(o)
a=s.index('<script type="module">')+22;t=open('test_c5.html').read();b=t.rindex('</script>');open('/tmp/c5.mjs','w').write(t[a:b])
PY
node --check /tmp/c5.mjs && echo BUILD_OK
