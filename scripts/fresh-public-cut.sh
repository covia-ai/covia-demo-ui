#!/usr/bin/env bash
# fresh-public-cut.sh — produce a fresh, history-free repo from the clean working
# tree of THIS repo, ready to become a public repo. It never changes visibility
# (that is a human action) and never pushes — it only materialises a clean cut and
# gates it. See the top-level CLAUDE.md "Public / Private separation for demos".
#
# Why a fresh cut (not a visibility flip): this repo's git HISTORY still holds prior
# internal material (competitor/codename/planning refs). Flipping it public exposes
# every past commit. A fresh repo with a single clean commit carries no history, so
# nothing leaks — provided the working tree passes scan-before-public.sh.
#
# Usage:
#   scripts/fresh-public-cut.sh [OUT_DIR]      # default: ../<repo>-public
set -euo pipefail
SRC="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
NAME="$(basename "$SRC")"
OUT="${1:-$SRC/../${NAME}-public}"

echo "== 1/4  gate the source working tree =="
"$SRC/scripts/scan-before-public.sh" \
  || { echo "ABORT: working tree is not public-safe. Clean it (move planning to <repo>-workspace, scrub refs) first."; exit 1; }

echo "== 2/4  materialise ONLY tracked files at HEAD (no history, no untracked junk) =="
if [ -e "$OUT" ] && [ -n "$(ls -A "$OUT" 2>/dev/null)" ]; then
  echo "ABORT: $OUT exists and is not empty. Remove it or pass a different OUT_DIR."; exit 1
fi
mkdir -p "$OUT"
git -C "$SRC" archive --format=tar HEAD | tar -x -C "$OUT"

echo "== 3/4  fresh repo, single clean commit =="
cd "$OUT"
git init -q -b main
git add -A
# Uses your configured git identity (should be a noreply address). The initial
# commit is the ONLY commit — no prior history comes along.
git commit -q -m "Initial public release: ${NAME}"
git config core.hooksPath .githooks 2>/dev/null || true

echo "== 4/4  gate the fresh cut on the FULL history scan (one commit => history == HEAD) =="
./scripts/scan-before-public.sh --history \
  || { echo "ABORT: the fresh cut still trips the scan. Inspect $OUT before doing anything."; exit 1; }

cat <<EOF

✓ Fresh public-ready cut created: $OUT
  - one clean commit, no prior history
  - passes scan-before-public.sh --history

Remaining steps are YOURS (create-repo / push / visibility are human actions):
  1. Create the repo PRIVATE first and push:
       gh repo create covia-ai/${NAME} --private --source "$OUT" --remote origin --push
  2. Review it on GitHub. Re-run the scan if you like:  (cd "$OUT" && scripts/scan-before-public.sh --history)
  3. When satisfied, flip the repo to PUBLIC yourself in GitHub settings.

Nothing here is public yet.
EOF
