# QA Lab App

Loja virtual de demonstração criada para **praticar e demonstrar automação de testes**: E2E (Web), API, performance e mobile web. Tudo roda localmente com um comando, sem banco de dados nem serviços externos, e os dados voltam ao estado inicial quando você quiser.

> Projeto de estudo e portfólio. Não tem relação com nenhuma empresa ou produto real.

## Por que existe

Aplicações públicas de demonstração mudam, saem do ar ou limitam o uso. Este app dá um alvo estável e sob controle para os demais projetos do portfólio:

- sobe em segundos, local ou no CI;
- tem dados previsíveis (reset a qualquer momento);
- tem **bugs que podem ser ligados e desligados**, para provar que os testes realmente detectam defeitos;
- expõe uma API documentada (OpenAPI/Swagger) e um front com seletores acessíveis e `data-testid`.

## Como rodar

Requisitos: Node.js 20 ou superior.

```bash
npm install
npm start
```

- Aplicação: http://localhost:3000
- Documentação da API: http://localhost:3000/api-docs
- Outra porta: `PORT=4000 npm start`

Com Docker (arquivos incluídos, ainda não validados em uma máquina com Docker):

```bash
docker compose up --build
```

## Usuários de teste

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Cliente | `cliente@qalab.com` | `Senha@123` |
| Administrador | `admin@qalab.com` | `Admin@123` |

Também é possível criar contas pela tela de cadastro ou por `POST /api/auth/register`. A senha exige no mínimo 8 caracteres.

## Regras de negócio

- Catálogo com 12 produtos, busca por texto, filtro por categoria e paginação (8 por página).
- O produto "Suporte para Notebook" está **sem estoque** de propósito.
- Cada produto tem uma imagem (`image` na API, `data-testid="product-image"` no front). São ilustrações em SVG feitas para este projeto, então o app funciona offline.
- Carrinho exige login. Quantidade de 1 a 10 por produto, limitada ao estoque.
- Frete de R$ 29,90, **grátis a partir de R$ 500,00** de subtotal.
- Cupons: `QALAB10` (10%) e `QALAB20` (20%), aplicados sobre o subtotal.
- CEP no formato `00000-000` (o hífen é opcional).
- Pagamento por **cartão** ou **Pix** gera pedido `PAID`. **Boleto** gera `PENDING`.
- Cliente só acessa os próprios pedidos. `GET /api/admin/orders` é restrito ao administrador.

## Ajuda para os testes

| Recurso | Para quê |
| --- | --- |
| `POST /api/test/reset` | Restaura os dados e desliga todos os bugs. Use antes de cada teste. |
| `GET /api/test/bugs` | Mostra quais bugs estão ligados. |
| `POST /api/test/bugs` | Liga ou desliga bugs, por exemplo `{ "wrongTotal": true }`. |
| `BUGS=wrongTotal,slowCatalog npm start` | Sobe o servidor já com bugs ligados. |

Os bugs disponíveis estão em [docs/BUGS.md](docs/BUGS.md).

No front, os elementos têm rótulos acessíveis (`getByRole`, `getByLabel`) e `data-testid` nos pontos principais, como `product-card`, `cart-subtotal`, `order-total` e `error-cep`.

## Estrutura

```
src/
  server.ts     # inicialização
  app.ts        # rotas da API e regras de negócio
  store.ts      # dados em memória e carga inicial
  bugs.ts       # bugs propositais
public/         # front (HTML, CSS e JS sem etapa de build)
docs/
  openapi.json  # contrato da API
  BUGS.md       # catálogo de bugs
```

O CI do app fica na raiz do repositório, em `.github/workflows/app-ci.yml`.

## Projetos que usam este app

Cada projeto aponta para este app como alvo. Neste repositório, o app é usado pela automação Playwright + SDD da raiz (veja o [README principal](../README.md)).

| Projeto | Foco |
| --- | --- |
| Playwright + TypeScript | E2E Web com Page Object |
| Selenium + Java + TestNG + Cucumber | E2E Web em Java |
| Testes de API | Contrato e regras de negócio |
| k6 | Smoke, carga e thresholds |
| IA aplicada a QA | Geração de cenários e triagem de falhas |

## Autor

Humberto Dente Gouveia, QA Sênior em automação de testes.
