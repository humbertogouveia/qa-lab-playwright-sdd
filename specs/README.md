# Specs

Requisitos e planos de teste em Markdown: a fonte da verdade do fluxo SDD.

## Fluxo

1. **Requisitos** (`<funcionalidade>.requirements.md`): o que a funcionalidade deve fazer, escrito e aprovado pelo QA a partir do [template](_template.requirements.md).
2. **Plano** (`<funcionalidade>.plan.md`): gerado pelo agente **playwright-test-planner** a partir dos requisitos aprovados e da exploração real da aplicação, depois revisado.
3. **Testes** (`tests/<funcionalidade>/`): gerados pelo agente **playwright-test-generator** a partir do plano.

## Funcionalidades

| Funcionalidade | Requisitos | Plano | Testes |
| --- | --- | --- | --- |
| Login, sessão e rotas protegidas | [login.requirements.md](login.requirements.md) (rascunho) | [login.plan.md](login.plan.md) (anterior aos requisitos) | `tests/login/` |

## Convenções

- Arquivos nomeados pela funcionalidade: `login`, `register`, `catalog`, `cart`, `checkout`.
- Cada critério tem ID com prefixo da funcionalidade (`LOGIN-01`, `CART-03`) e indica a fonte (`API`, `README` ou `QA`).
- IDs são permanentes: um critério removido fica riscado, nunca renumerado.
- Cada cenário do plano cita o(s) critério(s) que cobre, para rastrear requisito → cenário → teste.
- Divergências entre o critério e o comportamento real ficam marcadas no plano e viram bug ou ajuste no requisito.
