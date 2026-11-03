#!/usr/bin/env bash
# Runs typecheck, lint, tests, build. Prints PASS or FAIL: <step> with the log tail.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p .logs
for step in typecheck lint test build; do
  log=".logs/$step.log"
  if ! pnpm -s "$step" >"$log" 2>&1; then
    echo "FAIL: $step"
    tail -n 30 "$log"
    echo "full log: $log"
    exit 1
  fi
done
echo PASS
