# Specs

Planos de teste em Markdown: a fonte da verdade do fluxo SDD.

Cada plano é gerado pelo agente **playwright-test-planner** a partir da exploração real da aplicação e revisado manualmente antes de virar código. Os testes em `tests/` são gerados a partir destes arquivos pelo agente **playwright-test-generator**.

| Plano | Funcionalidade | Testes |
| --- | --- | --- |
| [login.plan.md](login.plan.md) | Login, sessão e rotas protegidas | `tests/login/` |

## Convenções

- Um arquivo por funcionalidade: `<funcionalidade>.plan.md`.
- Cada cenário indica o **Seed** (`tests/seed.spec.ts`) e o **File** de destino do teste.
- Comportamentos inesperados encontrados na exploração ficam marcados como "Observado" e "Registrar", para virar bug ou decisão de produto.
