#!/bin/bash
# fetch.sh <cand_dir>  : downloads urls.txt into the dir, 16 parallel
cd "$1" && xargs -P 16 -I{} sh -c 'f=$(basename {}); [ -s "$f" ] || curl -sS -m 60 -o "$f" "{}"' < urls.txt; ls *.jpg 2>/dev/null | wc -l
