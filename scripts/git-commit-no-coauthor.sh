#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"type: message\"" >&2
  exit 1
fi

MSG="$1"
git commit -m "$MSG"

# Strip Cursor co-author trailers if hooks or tooling added them
if git log -1 --format='%B' | grep -qi 'Co-authored-by:'; then
  FILTERED="$(git log -1 --format='%B' | grep -vi 'Co-authored-by:')"
  git commit --amend -m "$FILTERED"
fi
