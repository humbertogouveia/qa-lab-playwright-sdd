# QA Lab · Playwright + SDD

[![Playwright Tests](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)](.github/workflows/playwright.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](playwright.config.ts)

Automação de testes E2E com **Playwright + TypeScript**, construída com **Spec-Driven Development (SDD)**: primeiro a especificação, depois o teste. Agentes de IA exploram a aplicação, escrevem o plano de teste, geram o código e corrigem testes quebrados.

O alvo é o **[QA Lab App](qa-lab-app/)**, uma loja virtual de demonstração que roda localmente e tem **bugs que podem ser ligados e desligados**. Assim dá para provar que a suíte detecta defeitos reais.

> Projeto de estudo e portfólio.

## O que este projeto mostra

- **SDD na prática:** cada funcionalidade tem um plano em `specs/`, gerado a partir da exploração real da tela e revisado antes de virar código.
- **IA aplicada a QA:** uso dos agentes oficiais do Playwright (planner, generator e healer) via MCP, com revisão humana em cada etapa.
- **Testes que pegam bugs:** a suíte roda contra o app com bugs desligados (tem que passar) e ligados (tem que falhar).
- **Pipeline completa:** o GitHub Actions sobe o app, roda os testes e publica o relatório HTML.
- **Boas práticas:** seletores acessíveis (`getByRole`, `getByLabel`), credenciais em variáveis de ambiente e reset do estado entre testes.

## Fluxo SDD

```
 1. Planejar            2. Revisar             3. Gerar               4. Curar
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ planner      │ ───▶ │ QA revisa o  │ ───▶ │ generator    │ ───▶ │ healer       │
│ explora o app│      │ plano em     │      │ escreve os   │      │ corrige      │
│ e escreve    │      │ specs/*.md   │      │ testes em    │      │ testes que   │
│ specs/*.md   │      │              │      │ tests/       │      │ falharem     │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
```

| Etapa | Agente | Entrada | Saída |
| --- | --- | --- | --- |
| Especificar | [requirements-writer](.claude/agents/requirements-writer.md) | Contrato da API + regras de negócio do app | `specs/<funcionalidade>.requirements.md` (validado pelo QA) |
| Planejar | [playwright-test-planner](.claude/agents/playwright-test-planner.md) | App rodando + `tests/seed.spec.ts` | `specs/<funcionalidade>.plan.md` |
| Gerar | [playwright-test-generator](.claude/agents/playwright-test-generator.md) | Um cenário do plano | `tests/<funcionalidade>/*.spec.ts` |
| Curar | [playwright-test-healer](.claude/agents/playwright-test-healer.md) | Teste falhando | Teste corrigido ou marcado com a causa |

Os agentes acessam o navegador pelo servidor MCP do Playwright, configurado em [.mcp.json](.mcp.json).

## Estrutura

```
qa-lab-playwright-sdd/
├── qa-lab-app/              # Aplicação testada (SUT): API + front, com bugs ligáveis
│   ├── src/                 #   servidor Express, regras de negócio, bugs
│   ├── public/              #   front sem build (HTML, CSS, JS)
│   └── docs/                #   OpenAPI e catálogo de bugs
├── specs/                   # Planos de teste (fonte da verdade do SDD)
│   └── login.plan.md
├── tests/                   # Testes Playwright gerados a partir dos planos
│   └── seed.spec.ts         #   ponto de partida dos agentes (reset + login)
├── .claude/agents/          # Agentes planner, generator e healer
├── .github/workflows/
│   ├── playwright.yml       #   CI da automação (sobe o app e roda os testes)
│   └── app-ci.yml           #   CI do app (typecheck + health check)
├── .mcp.json                # Servidor MCP do Playwright
├── .env.example             # Modelo das variáveis de ambiente
└── playwright.config.ts
```

## Como rodar

Requisitos: Node.js 20.12 ou superior.

```bash
# 1. Instalar dependências da automação, do app e o Chromium
npm run setup

# 2. Criar o .env a partir do modelo e preencher as credenciais
cp .env.example .env

# 3. Rodar os testes (o app sobe sozinho em http://localhost:3000)
npm test
```

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda a suíte em modo headless |
| `npm run test:headed` | Roda com o navegador visível |
| `npm run test:ui` | Abre o modo UI do Playwright |
| `npm run report` | Abre o último relatório HTML |
| `npm run app:start` | Sobe só o app, para explorar ou usar com os agentes |
| `npm run app:start:bugs` | Sobe o app com bugs ligados (`wrongTotal`, `loginAcceptsAnyPassword`) |

O Playwright sobe o app automaticamente pelo bloco `webServer` e reaproveita uma instância que já esteja rodando. Para testar outro ambiente, defina `BASE_URL` com a URL remota. Nesse caso o app local não é iniciado.

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `BASE_URL` | URL do app (padrão: `http://localhost:3000`) |
| `TEST_CLIENTE_EMAIL` / `TEST_CLIENTE_PASSWORD` | Usuário com perfil cliente |
| `TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD` | Usuário com perfil administrador |

Os usuários de teste da carga inicial estão no [README do app](qa-lab-app/README.md#usuários-de-teste).

Localmente, as credenciais ficam no `.env`, que não vai para o Git. No GitHub Actions, elas vêm dos **secrets** do repositório, com os mesmos nomes. `BASE_URL` não é sensível e fica direto no workflow.

## Validando a suíte com bugs propositais

1. Rode `npm test` com o app normal. Tudo deve passar.
2. Ligue um bug, por exemplo `loginAcceptsAnyPassword`:
   ```bash
   curl -X POST http://localhost:3000/api/test/bugs \
     -H 'content-type: application/json' -d '{"loginAcceptsAnyPassword": true}'
   ```
3. Rode de novo. Pelo menos um teste deve falhar. Se nenhum falhar, há uma lacuna de cobertura.
4. Restaure o estado com `POST /api/test/reset`.

Catálogo completo em [qa-lab-app/docs/BUGS.md](qa-lab-app/docs/BUGS.md).

## Cobertura

| Funcionalidade | Plano | Status |
| --- | --- | --- |
| Login, sessão e rotas protegidas | [specs/login.plan.md](specs/login.plan.md) | Plano pronto, testes em geração |
| Catálogo e busca | — | Próximo |
| Carrinho, cupons e frete | — | Próximo |
| Checkout e pedidos | — | Próximo |

## Stack

Playwright · TypeScript · Node.js · Playwright MCP · Claude Code (agentes) · GitHub Actions · Express (app)

## Autor

**Humberto Dente Gouveia**, QA Sênior em automação de testes.
