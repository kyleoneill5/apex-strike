cd /workspace/milsim
python3 - <<'P'
s=open('test.html').read();k='//UI_PRESTIGE-END\n';i=s.index(k)+len(k)
mods=''.join(open('src/'+f).read()+'\n' for f in ['mp_relay.js','mp_net.js','mp_aim.js','mp_save.js','mp_mod.js','mp_modes.js','mp_streak.js'])
o=s[:i]+mods+s[i:];o=o.replace('<head>','<head><link rel="icon" href="data:,">',1) if 'rel="icon"' not in o else o;open('test_c1.html','w').write(o)
a=o.index('<script type="module">')+22;b=o.rindex('</script>');open('/tmp/c1.mjs','w').write(o[a:b])
P
node --check /tmp/c1.mjs && echo BUILD_OK
