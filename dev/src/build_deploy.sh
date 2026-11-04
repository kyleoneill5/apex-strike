#!/bin/sh
# deploy build: build.sh order minus unverified files. Usage: sh build_deploy.sh "extra1.js extra2.js"
cd /workspace/milsim/src
EXTRA="$1"
ALL=$(grep -o "cat orbit.js[^;]*" build.sh | sed 's/^cat //')
KEEP=""
for f in $ALL; do
 case " orbit.js g1.js g2.js gair.js gships.js g3.js g4.js g5.js g6.js gearth.js g9.js gstar.js g8.js gx.js g7.js gcam.js gsmooth.js gguide.js ggfx.js gnav.js gengine.js gtouch.js gicbm.js gfpv.js gweak.js ghit.js gships2.js gplane2.js gsr71.js gsound.js gsnd2.js gnyc.js grods.js grods2.js grods3.js gmissiles.js gmslhook.js gairliners.js gshuttle.js gmenu.js gflow.js garmy.js gb2.js gairdef.js glaunchers.js gtorp.js gstick.js gadop.js gcruise.js gmirvlock.js gdeclutter.js gicbmstage.js gstaging.js $EXTRA " in *" $f "*) KEEP="$KEEP $f";; esac
done
echo "FILES:$KEEP"
{ cat head.html; echo '<div id="rocketHud"></div><script type="module">'; cat $KEEP; echo '</script></body></html>'; } > ../deploy.html
python3 -c "
s=open('../deploy.html').read();a=s.index('<script type=\"module\">')+22;b=s.rindex('</script>');open('/tmp/d.mjs','w').write(s[a:b])" && node --check /tmp/d.mjs && echo DEPLOY_BUILD_OK
