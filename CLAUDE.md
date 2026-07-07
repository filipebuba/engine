# CLAUDE.md — edital-match-engine (repo git PRÓPRIO, aninhado)

Motor soberano do EDITAL MATCH: tipos, validação, elegibilidade dura e score de match
com juiz qwen local. Construído CONDUZIDO (planos TDD em `plans/`, loop local,
`harness/verify.sh` prova). A raiz `../` é o app Next.js de OUTRO fluxo — NUNCA
tocar lá; a raiz ignora `engine/` no git dela.

Por que repo separado: o loop faz reset_tree e apagaria trabalho não-commitado da
raiz; isolamento total é a única convivência segura.

Regras (lições rpa-saas + edital-match):
- npm install SEMPRE do WSL; node_modules contaminado (binário win32 no meio) =
  `rm -rf node_modules package-lock.json` + install do WSL (npm#4828).
- verify no padrão npx + `--passWithNoTests`; linha de base SEMPRE verde antes de loop.
- Repo novo conduzido nasce com harness completo: verify.sh + PROMPT.md + LESSONS.md.
- Scripts com node puro sobre dist/; 100% local (Ollama, num_ctx explícito).

Decisões de produto: `../docs/PRODUTO.md`.
