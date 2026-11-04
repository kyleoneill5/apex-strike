cd /workspace/milsim
while pgrep -f "node trods" >/dev/null; do sleep 3; done
timeout 600 node tclimb.mjs > s_climb3.log 2>&1
