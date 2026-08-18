#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

run_with_timeout() {
  local timeout_value="$1"
  shift

  if command -v gtimeout >/dev/null 2>&1; then
    gtimeout --signal=TERM --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" "${timeout_value}" "$@"
    return $?
  fi

  if command -v timeout >/dev/null 2>&1; then
    timeout --signal=TERM --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" "${timeout_value}" "$@"
    return $?
  fi

  local timeout_seconds
  timeout_seconds="$(python3 - "$timeout_value" <<'PY'
import re, sys
value = sys.argv[1].strip()
match = re.fullmatch(r'(?i)(\d+)([smhd]?)', value)
if not match:
    raise SystemExit(f'Unsupported timeout value: {value}')
number = int(match.group(1))
unit = (match.group(2) or 's').lower()
scale = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}
print(number * scale[unit])
PY
)"

  python3 - "$timeout_seconds" "$@" <<'PY'
import subprocess, sys, time
limit = float(sys.argv[1])
cmd = sys.argv[2:]
process = subprocess.Popen(cmd)
start = time.monotonic()
try:
    while True:
        if process.poll() is not None:
            raise SystemExit(process.returncode)
        if time.monotonic() - start >= limit:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            raise SystemExit(124)
        time.sleep(0.1)
except KeyboardInterrupt:
    process.terminate()
    raise
PY
}

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded vinext build..."
run_with_timeout "${SITES_BUILD_TIMEOUT:-3m}" "${vinext}" build

"${script_dir}/validate-artifact.sh"
