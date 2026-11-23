<!--
  COMO USAR ESTE TEMPLATE
  1. Copie para specs/<funcionalidade>.requirements.md (ex.: cart.requirements.md).
  2. Troque <PREFIXO> por uma sigla curta e única da funcionalidade (ex.: LOGIN, REG, CAT, CART, CHK).
  3. Preencha a partir das fontes documentadas primeiro; o que vier da sua experiência entra como `QA`.
  4. Nunca tire requisitos do código-fonte do app: o código mostra o que o app faz, não o que deveria fazer.
  5. Apague as seções opcionais que não se aplicam e todos os comentários como este.
-->

# Requisitos · <Nome da funcionalidade>

> **Status:** rascunho, aguardando validação do QA.
> Este arquivo diz o que a funcionalidade **deve** fazer. O plano de teste (`<funcionalidade>.plan.md`) é derivado daqui, e o comportamento real da aplicação é comparado contra estes critérios.

## Objetivo

<!-- Uma ou duas frases: quem usa, o que consegue fazer e por quê. -->

<Quem> consegue <fazer o quê> para <qual resultado>.

## Fontes

| Código | Fonte | Peso |
| --- | --- | --- |
| `API` | Contrato da API: [qa-lab-app/docs/openapi.json](../qa-lab-app/docs/openapi.json) | Documentado |
| `README` | Regras de negócio: [qa-lab-app/README.md](../qa-lab-app/README.md#regras-de-negócio) | Documentado |
| `BUGS` | Coluna "Comportamento correto" de [qa-lab-app/docs/BUGS.md](../qa-lab-app/docs/BUGS.md) | Documentado |
| `QA` | Boas práticas (usabilidade, segurança, acessibilidade) propostas pelo QA | **Proposto, validar** |

<!-- Remova `BUGS` se nenhum bug do catálogo afetar a funcionalidade. Acrescente outras fontes quando existirem (ex.: `US` para uma user story, `UX` para um protótipo). -->

Critérios `QA` não estão em nenhuma documentação do produto. Eles só valem depois de aprovados. Se o comportamento real divergir de um critério `QA`, a divergência vira **pergunta** para o produto, não bug automático.

## Perfis

| Perfil | O que pode fazer nesta funcionalidade | Variáveis de teste |
| --- | --- | --- |
| <Perfil> | <Permissões> | `<VARIAVEL_EMAIL>` / `<VARIAVEL_SENHA>` |

<!-- Se a funcionalidade for pública (sem login), escreva "Visitante (sem login)". -->

## Pré-condições

<!-- Opcional. Estado necessário antes de usar a funcionalidade. Ex.: usuário logado, carrinho com itens, produto com estoque. -->

- <Pré-condição>

## Critérios de aceite

<!--
  - Um comportamento verificável por linha, escrito como resultado observável ("a tela mostra...", "a API responde 409").
  - Agrupe em seções que façam sentido para a funcionalidade (ex.: Entrada de dados, Regras, Permissões, Erros).
  - IDs são permanentes: não renumere ao apagar um critério; marque-o como ~~removido~~.
-->

### <Grupo 1>

| ID | Critério | Fonte |
| --- | --- | --- |
| <PREFIXO>-01 | <Critério> | `API` |
| <PREFIXO>-02 | <Critério> | `QA` |

### <Grupo 2>

| ID | Critério | Fonte |
| --- | --- | --- |
| <PREFIXO>-03 | <Critério> | `README` |

### Erros e usabilidade

| ID | Critério | Fonte |
| --- | --- | --- |
| <PREFIXO>-04 | Em falha do servidor ou da rede, a tela mostra uma mensagem amigável, em português, e a funcionalidade continua utilizável. | `QA` |

### Acessibilidade e segurança

| ID | Critério | Fonte |
| --- | --- | --- |
| <PREFIXO>-05 | Os campos têm rótulo associado, os erros são anunciados a leitores de tela e a funcionalidade pode ser usada só pelo teclado. | `QA` |

## Regras de cálculo

<!--
  Opcional: use quando houver valores calculados (frete, desconto, total, paginação).
  Cada linha vira um teste orientado a dados. Inclua os limites (exatamente no valor de corte, um centavo abaixo).
-->

| ID | Entrada | Resultado esperado | Fonte |
| --- | --- | --- | --- |
| <PREFIXO>-C01 | <Valores de entrada> | <Valor esperado> | `README` |

## Perguntas em aberto

<!-- O que a documentação não responde. Cada pergunta respondida vira critério ou vai para "Fora do escopo". -->

1. **<Tema>:** <pergunta>?

## Fora do escopo

- **<Item>:** <por que não entra aqui ou onde será tratado>.

## Histórico

| Data | Alteração |
| --- | --- |
| <AAAA-MM-DD> | Rascunho inicial |
