#!/usr/bin/env bash
# Run this once after copying the folder (macOS, Linux, Git Bash).
# It installs what is needed, confirms a browser works, and runs the self-test.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  echo "Python 3.10 or newer is needed. Install it, then run this again."
  exit 1
fi
"$PY" poster.py setup
echo
"$PY" poster.py test
