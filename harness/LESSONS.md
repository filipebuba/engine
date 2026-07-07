# MANDATORY LESSONS (distilled from real failures — do not repeat)

Rules extracted from mistakes made by local executors in previous loops
(evolution/001–012). The loop injects this file into EVERY iteration.
Maximum 12 rules — when a new one enters, the least-triggered one leaves.

1. Imports: the PLAN's spec for the task decides which imports each file has —
   copy them EXACTLY (no extra, no missing). If the plan does not specify,
   default: implementation `.ts` has ZERO imports; test `.test.ts` has exactly:
     `import { describe, it, expect } from 'vitest';`
     `import { <fn> } from './<name>';`
   Bare `test`/`expect` globals fail typecheck; unused imports fail lint.
   (`normalize` does NOT exist in `node:util` — accents:
   `str.normalize("NFD").replace(/[̀-ͯ]/g, "")`.)
2. Execute the task shown under "ACTIVE TASK" — never another one, never a
   task already marked `[x]`, never the first spec you happen to see.
3. Emit the COMPLETE content of each file between `=== FILE: path ===` and
   `=== END ===`, with NO ``` fences anywhere in your reply.
4. If the task asks for a file + test, emit BOTH blocks, at the exact paths
   quoted in the task line.
5. Copy the test cases from the plan LITERALLY — do not invent cases, do
   not rename describes, do not "improve" expects.
6. If the spec gives a ready-made expression (e.g. `"+" + cleaned.slice(2)`),
   transcribe it EXACTLY — never recompute indices in your head.
7. `BLOCKED: <reason>` goes on its own line, with NO fence, and nothing
   else in the reply.
8. Touch ONLY the files the ACTIVE TASK names. If the task says to REWRITE or
   modify a named file, doing so is REQUIRED (never a rule violation). What is
   forbidden is touching `plans/`, `harness/`, configs, or ANY file the task
   does not name.
9. NEVER reply BLOCKED claiming the ACTIVE TASK "is already done". If it
   appears as ACTIVE TASK, it is NOT done — the plan checkboxes are the
   only source of truth about state.
10. Campos numéricos de API externa (CoinGecko etc.) podem vir null — declare o tipo como number|null e proteja TODA leitura com (x ?? 0) antes de toFixed/toLocaleString/comparação. Tipo honesto faz o typecheck virar o guarda permanente.
