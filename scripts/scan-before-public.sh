#!/usr/bin/env bash
# scan-before-public.sh — hard gate before any publish or visibility change.
# Fails (exit 1) if anything private is present in the tracked tree, and — with
# --history — anywhere in git history (going public exposes every past commit).
#
# Usage:
#   scripts/scan-before-public.sh            # scan tracked files (HEAD)
#   scripts/scan-before-public.sh --history  # also scan the full history
#
# Enforces the top-level rule in ../../CLAUDE.md "Public / Private separation for demos".
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 2
FAIL=0
hit() { echo "  ✗ $1"; FAIL=1; }

echo "== scan-before-public: $(basename "$(pwd)") =="

# 1. Secrets — prefer gitleaks if installed, else a pattern fallback.
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --no-banner --redact -s . >/dev/null 2>&1 || hit "gitleaks found potential secrets (run: gitleaks detect -v)"
else
  echo "  (gitleaks not installed — using pattern fallback; installing gitleaks is recommended)"
fi
SECRETS='-----BEGIN (RSA|OPENSSH|EC|DSA|PGP)? ?PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|AIza[0-9A-Za-z_-]{30,}'
git grep -nIP "$SECRETS" -- . ':!*scan-before-public.sh' ':!.githooks/pre-push' >/dev/null 2>&1 && { git grep -nIP "$SECRETS" -- . ':!*scan-before-public.sh' ':!.githooks/pre-push'; hit "secret-like strings in tracked files"; }

# 2. Local machine paths (never belong in a public tree).
PATHS='/Users/[a-zA-Z]|/home/[a-z]|/private/tmp/|/var/folders/'
git grep -nIP "$PATHS" -- . ':!pnpm-lock.yaml' ':!*scan-before-public.sh' ':!.githooks/pre-push' >/dev/null 2>&1 && { git grep -nIP "$PATHS" -- . ':!pnpm-lock.yaml' ':!*scan-before-public.sh' ':!.githooks/pre-push' | head; hit "local machine paths in tracked files"; }

# 3. Internal codenames / other private projects / people (the vibe-coding class).
#    Keep this list in sync across demos; add project-specific terms as needed.
DENY='Kill Switch|kill-switch|demo-kill-switch|\bA[0-9]\b|\bB[0-9]\b|\bD[0-9]\b|Wave [0-9]|\bMike\b|MIKE-ASKS|GB-ASK|ASK-00[0-9]|KS-[0-9]|\bD[0-9]{3}\b|Chirdeep|Task [0-9]'
git grep -nIP "$DENY" -- . ':!pnpm-lock.yaml' ':!*scan-before-public.sh' ':!.githooks/pre-push' >/dev/null 2>&1 && { git grep -nIP "$DENY" -- . ':!pnpm-lock.yaml' ':!*scan-before-public.sh' ':!.githooks/pre-push' | head -20; hit "internal codenames / other-project references in tracked files"; }

# 4. Planning docs must not live in a public code repo (they belong in <repo>-workspace).
PLANNING='(^|/)(DECISIONS|DIRECTIONS|PRD|ROADMAP|MIKE-ASKS|.*-IMPROVEMENTS|venue-contract|RELEASE-CHECKLIST|release-pr-drafts)\.md$|(^|/)AGENTS\.md$'
git ls-files | grep -iE "$PLANNING" >/dev/null 2>&1 && { git ls-files | grep -iE "$PLANNING"; hit "planning/internal docs present (move to <repo>-workspace)"; }

# 5. History scan (opt-in; slow). Going public exposes all commits. Excludes the
#    guard files themselves (their denylist literally contains these terms) and
#    the lockfile, matching the working-tree checks above.
if [ "${1:-}" = "--history" ]; then
  echo "  -- scanning full history for paths/secrets/codenames --"
  hits=$(git rev-list --all --objects 2>/dev/null \
      | grep -vE 'scan-before-public\.sh|pre-push|pnpm-lock\.yaml' \
      | while read -r sha path; do
          [ -n "$path" ] || continue
          [ "$(git cat-file -t "$sha" 2>/dev/null)" = blob ] || continue
          git cat-file -p "$sha" 2>/dev/null | grep -qEm1 "$PATHS|$SECRETS|Kill Switch|demo-kill-switch" && echo "$path"
        done | sort -u | head -10)
  if [ -n "$hits" ]; then
    echo "$hits" | sed 's/^/     history: /'
    hit "history contains local paths / secrets / Kill Switch references (a fresh cut drops all history)"
  fi
fi

if [ "$FAIL" -eq 0 ]; then echo "== PASS: nothing private detected =="; else echo "== FAIL: resolve the items above before going public =="; fi
exit "$FAIL"
