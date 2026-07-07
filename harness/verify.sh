#!/usr/bin/env bash
# verify do edital-match: typecheck + testes (TDD) + exec-smoke, no padrão rpa-saas.
# Regras: vitest capturado (erro real alimenta o reparo do loop); exit-não-zero
# esperado SEMPRE na condição do if (descoberta 047).
set -euo pipefail
cd "$(dirname "$0")/.."

npx tsc --noEmit || { echo "FALHA: typecheck"; exit 1; }

if ! VOUT=$(npx vitest run --passWithNoTests 2>&1); then
  printf '%s\n' "$VOUT" | tail -30
  echo "FALHA: testes"; exit 1
fi
printf '%s\n' "$VOUT" | grep -E "Test Files|Tests " | head -2 || true  # sem testes ainda: grep vazio não é erro (classe 047)

# exec-smoke: quando o CLI existir, ele roda de verdade (sem args → uso, exit != 0)
if npx tsc -p tsconfig.build.json >/dev/null 2>&1 && [ -f dist/cli.js ]; then
  if node dist/cli.js >/dev/null 2>&1; then
    echo "FALHA: exec-smoke — CLI sem args deveria retornar erro de uso"; exit 1
  fi
fi

echo OK
exit 0
