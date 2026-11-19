#!/usr/bin/env bash
# Atomic micro-commits. Same shape as the AvenPing brand-forwarders script.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
COMMIT="$ROOT/scripts/git-commit-no-coauthor.sh"
chmod +x "$COMMIT" "$ROOT/scripts/micro-commit-all.sh" 2>/dev/null || true

commit_paths() {
  local msg="$1"
  shift
  local paths=("$@")
  local existing=()
  for p in "${paths[@]}"; do
    if [[ -e "$p" ]] || git ls-files --error-unmatch "$p" >/dev/null 2>&1; then
      existing+=("$p")
    fi
  done
  if [[ ${#existing[@]} -eq 0 ]]; then
    echo "skip (missing): $msg"
    return 0
  fi
  git add -- "${existing[@]}"
  if git diff --cached --quiet; then
    echo "skip (no changes): $msg"
    return 0
  fi
  "$COMMIT" "$msg"
  echo "committed: $msg"
}

commit_paths "chore: add nothing palette" nothing.py
commit_paths "feat: add card frame" frame.py
commit_paths "feat: add contributions sample" sample.json
commit_paths "feat: add contributions renderer" render.py
commit_paths "feat: add rendered modes" dist
commit_paths "docs: describe the five modes" README.md index.html

commit_paths "feat: load any github username" github_user.py
commit_paths "feat: add size variants" nothing.py frame.py render.py
commit_paths "docs: dummy readme of every variant" DUMMY.md dist
