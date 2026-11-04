#!/bin/sh
# usage: run.sh file_with_code ; waits for output
n=$(ls /tmp/c1/cmd*.mjs 2>/dev/null | grep -v out | wc -l); cp "$1" /tmp/c1/cmd$n.mjs
while [ ! -f /tmp/c1/cmd$n.mjs.out ]; do sleep 1; done; cat /tmp/c1/cmd$n.mjs.out
