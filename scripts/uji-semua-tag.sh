#!/usr/bin/env bash
# Menguji setiap tag bab pada salinan bersih: npm ci, npm test, (bila ada Astro) build.
set -u
REPO="$(git rev-parse --show-toplevel)"
TMP="$(mktemp -d)"
gagal=0
for tag in $(git tag -l 'bab-*' | sort); do
  rm -rf "$TMP/w" && git worktree add -q --detach "$TMP/w" "$tag" 2>/dev/null
  cp -r "$REPO/node_modules" "$TMP/w/node_modules"
  ( cd "$TMP/w"
    if [ -d tests ]; then out=$(npx vitest run 2>&1); st=$?; n=$(echo "$out" | grep -E "Tests " | sed 's/\x1b\[[0-9;]*m//g' | xargs); else st=0; n="(tanpa tes: templat/dokumen)"; fi
    b="-"
    if [ -f astro.config.mjs ]; then npx astro build >/dev/null 2>&1 && b="build ok" || { b="BUILD GAGAL"; st=1; }; fi
    printf "%-14s %s | %s | %s\n" "$tag" "$([ $st = 0 ] && echo LULUS || echo GAGAL)" "$n" "$b"
    exit $st )
  [ $? = 0 ] || gagal=1
  git worktree remove --force "$TMP/w"
done
exit $gagal
