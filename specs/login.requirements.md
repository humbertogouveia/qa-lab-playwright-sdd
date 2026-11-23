# Requisitos · Login

> **Status:** aprovado
> Este arquivo diz o que o login **deve** fazer. O plano de teste (`login.plan.md`) é derivado daqui, e o comportamento real da aplicação é comparado contra estes critérios.

## Objetivo

Permitir que um usuário cadastrado (cliente ou administrador) se autentique com e-mail e senha, mantenha uma sessão para acessar as áreas protegidas da loja e encerre essa sessão quando quiser.

## Fontes

| Código | Fonte | Peso |
| --- | --- | --- |
| `API` | Contrato da API: [qa-lab-app/docs/openapi.json](../qa-lab-app/docs/openapi.json) | Documentado |
| `README` | Regras de negócio: [qa-lab-app/README.md](../qa-lab-app/README.md#regras-de-negócio) | Documentado |
| `QA` | Boas práticas de login (usabilidade, segurança, acessibilidade) propostas pelo QA | **Proposto, validar** |

Critérios `QA` não estão em nenhuma documentação do produto. Eles só valem depois de aprovados. Se o comportamento real divergir de um critério `QA`, a divergência vira **pergunta** para o produto, não bug automático.

## Perfis

| Perfil | Descrição | Variáveis de teste |
| --- | --- | --- |
| Cliente | Compra na loja e vê os próprios pedidos | `TEST_CLIENTE_EMAIL` / `TEST_CLIENTE_PASSWORD` |
| Administrador | Vê todos os pedidos | `TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD` |
| Visitante (sem login) | Acessa a tela de login e as áreas públicas | — |

## Pré-condições

- Usuários cliente e administrador cadastrados (carga inicial do app, restaurada com `POST /api/test/reset`).
- Nenhuma sessão ativa no navegador, salvo quando o critério disser o contrário.

## Critérios de aceite

### Entrada de dados

| ID | Critério | Fonte |
| --- | --- | --- |
| LOGIN-01 | E-mail e senha são obrigatórios. A API responde **400** quando algum dos campos está ausente. | `API` |
| LOGIN-02 | Com algum campo vazio, a tela informa o que falta, **sem enviar** a requisição para a API. A regra vale igual para e-mail vazio, senha vazia ou ambos. | `QA` |
| LOGIN-03 | Um e-mail em formato inválido (ex.: `abc`, `a@`) é sinalizado na tela antes do envio. | `QA` |

### Autenticação

| ID | Critério | Fonte |
| --- | --- | --- |
| LOGIN-04 | Com credenciais válidas, a API responde **200** com um token Bearer e os dados do usuário. | `API` |
| LOGIN-05 | Com credenciais inválidas, a API responde **401**. | `API` |
| LOGIN-06 | Senha errada e e-mail não cadastrado exibem **a mesma mensagem**, sem revelar se o e-mail existe. | `QA` |
| LOGIN-07 | Credenciais trafegam só no corpo da requisição. A senha nunca aparece na URL, no armazenamento do navegador nem no console. | `QA` |

### Após o login

| ID | Critério | Fonte |
| --- | --- | --- |
| LOGIN-08 | Após o login, o usuário é levado ao catálogo e o cabeçalho passa a indicar que está autenticado (nome do usuário, acesso a "Meus pedidos" e opção de sair). | `QA` |
| LOGIN-09 | Se o login foi exigido ao tentar acessar uma área protegida (ex.: checkout), a tela explica o motivo e, após o login, o usuário volta para onde estava. | `QA` |
| LOGIN-10 | O perfil retornado define o acesso: o administrador consulta todos os pedidos (`GET /api/admin/orders`), e o cliente recebe **403** nesse recurso. | `API` `README` |

### Sessão

| ID | Critério | Fonte |
| --- | --- | --- |
| LOGIN-11 | Com token válido, `GET /api/auth/me` retorna o usuário (**200**). Sem token, retorna **401**. | `API` |
| LOGIN-12 | Carrinho, pedidos e checkout exigem login. Sem sessão, o usuário é levado ao login. | `README` `QA` |
| LOGIN-13 | A sessão se mantém ao recarregar a página. | `QA` |
| LOGIN-14 | Sair encerra a sessão: `POST /api/auth/logout` responde **204**, o token deixa de valer (`/api/auth/me` volta a dar **401**) e as áreas protegidas ficam inacessíveis, inclusive pelo botão Voltar do navegador. | `API` `QA` |

### Erros e usabilidade

| ID | Critério | Fonte |
| --- | --- | --- |
| LOGIN-15 | Em falha do servidor ou da rede, a tela mostra uma mensagem amigável, em português, e o formulário continua utilizável. | `QA` |
| LOGIN-16 | Durante o envio, a tela indica carregamento e impede um segundo envio (duplo clique). | `QA` |
| LOGIN-17 | Depois de um erro, uma nova tentativa válida funciona e a mensagem de erro anterior some. | `QA` |

### Acessibilidade e segurança

| ID | Critério | Fonte |
| --- | --- | --- |
| LOGIN-18 | Os campos têm rótulo associado, o erro é anunciado a leitores de tela e o login pode ser feito só pelo teclado (Tab até o botão e envio com Enter). | `QA` |
| LOGIN-19 | Entradas maliciosas (HTML/script, injeção SQL, textos muito longos) não são executadas, não derrubam a página e não geram erro 500. | `QA` |

## Perguntas em aberto

Pontos que a documentação não responde. Precisam de decisão antes de virar critério.

1. **Mensagens:** quais são os textos oficiais de erro (campos vazios, credenciais inválidas, falha do servidor)? Sem isso, os testes vão validar o texto que a tela mostra hoje.
2. **E-mail:** o login deve ignorar maiúsculas/minúsculas e espaços nas bordas?
3. **Tentativas:** existe bloqueio ou atraso após várias tentativas inválidas seguidas?
4. **Duração da sessão:** o token expira? A sessão deve valer só na aba atual ou em todas as abas?
5. **Usuário já logado:** ao abrir a tela de login com sessão ativa, ele deve ser redirecionado?
6. **Administrador na tela:** existe área administrativa na interface, ou o acesso de admin é só via API?
7. **Senha:** o mínimo de 8 caracteres do cadastro deve ser validado também no login, ou o login só verifica se a senha confere?

## Fora do escopo

- **Cadastro** (`POST /api/auth/register`): vai ter o próprio `register.requirements.md`.
- **Recuperação de senha, "lembrar-me" e mostrar/ocultar senha:** não existem na documentação. Se forem desejados, entram como nova funcionalidade.
- **Regras de cálculo:** não se aplicam ao login.

## Histórico

| Data | Alteração |
| --- | --- |
| 2026-11-23 | Rascunho inicial |
| 2026-11-23 | IDs renomeados de `CA-xx` para `LOGIN-xx`; estrutura alinhada ao template |
