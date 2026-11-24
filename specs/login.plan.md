# Plano de Teste - Login (QA Lab Store)

## Application Overview

Plano da funcionalidade de login do QA Lab Store (http://localhost:3000/#/login; SPA com rotas por hash; API em /api; contrato em qa-lab-app/docs/openapi.json). Derivado dos requisitos aprovados em specs/login.requirements.md (LOGIN-01 a LOGIN-19). O requisito é a fonte da verdade: o "expect" descreve o comportamento ESPERADO pelo requisito; quando a tela diverge, a linha "DIVERGÊNCIA:" registra o que ocorre de fato. Cenários que dependem de pergunta em aberto trazem "PERGUNTA EM ABERTO N" e descrevem só o comportamento observado, sem afirmar o correto. Critérios de origem QA são propostas: divergência neles é pergunta ao produto, não bug automático.

Credenciais (somente nomes das variáveis do .env): TEST_CLIENTE_EMAIL / TEST_CLIENTE_PASSWORD (cliente) e TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD (admin). Todos os cenários partem de contexto novo (sem sessão) e de dados restaurados com POST /api/test/reset. Seed: tests/seed.spec.ts.

Comportamento observável usado como referência: formulário com campos "E-mail" e "Senha" e botão "Entrar" (type=submit), área de erro com role=alert (data-testid=form-error), sempre presente e vazia até haver erro. Sessão guardada em sessionStorage (chaves token e user); localStorage e cookies vazios. Após login válido a tela vai para /#/ (h1 "Catálogo") e o cabeçalho mostra "Olá, <nome>", "Meus pedidos" e "Sair" (data-testid=logout), ocultando "Entrar" e "Cadastrar". Rotas protegidas sem sessão (/#/cart, /#/orders, /#/checkout) redirecionam para /#/login?reason=auth, com o texto "Entre para continuar.". Rotas /#/admin* exibem "Página não encontrada". Mensagens vistas hoje: "Informe e-mail e senha" (API 400), "E-mail ou senha inválidos" (API 401), texto cru do servidor para outros erros (ex.: "Internal Server Error"), "Erro inesperado" (resposta não JSON) e "Failed to fetch" (rede). Cada 400/401 de login gera um erro de console de recurso (esperado, não é falha do cenário).

Matriz de rastreabilidade (critério → cenários):
- LOGIN-01 → 2.1, 3.4
- LOGIN-02 → 2.1
- LOGIN-03 → 2.2
- LOGIN-04 → 1.2, 1.3, 1.4, 3.4
- LOGIN-05 → 2.3, 3.4
- LOGIN-06 → 2.3
- LOGIN-07 → 1.2, 3.5
- LOGIN-08 → 1.2, 1.3
- LOGIN-09 → 3.1
- LOGIN-10 → 1.3, 3.4
- LOGIN-11 → 1.5, 3.4
- LOGIN-12 → 1.6, 3.1, 3.2
- LOGIN-13 → 1.5
- LOGIN-14 → 1.6, 3.4
- LOGIN-15 → 4.1
- LOGIN-16 → 4.2
- LOGIN-17 → 2.5
- LOGIN-18 → 1.1, 1.4, 5.1
- LOGIN-19 → 5.2, 5.3

Perguntas em aberto marcadas: 1 (cenários 2.1, 2.3, 4.1), 2 (2.4), 3 (4.3), 4 (3.3), 5 (1.5), 6 (1.3), 7 (2.3).

## Test Scenarios

### 1. 1. Caminho feliz e sessão básica

**Seed:** `tests/seed.spec.ts`

#### 1.1. 1.1 Renderização da tela de login

**File:** `tests/login/render.spec.ts`

**Steps:**
  1. Cobre: LOGIN-18. Abrir http://localhost:3000/#/login em contexto limpo.
    - expect: Título da página 'QA Lab Store' e h1 'Entrar'
    - expect: Campos 'E-mail' e 'Senha' localizáveis pelo rótulo e botão 'Entrar' visíveis
    - expect: Campo de senha mascarado (type=password); e-mail com autocomplete=username e senha com autocomplete=current-password
    - expect: Área de erro (role=alert, data-testid=form-error) presente e vazia
    - expect: Cabeçalho com 'Entrar' e 'Cadastrar'; 'Meus pedidos' e 'Sair' não visíveis
    - expect: Não há mostrar/ocultar senha, 'esqueci a senha' nem 'lembrar-me' (fora do escopo dos requisitos)
    - expect: Único erro de console tolerado: 404 de /favicon.ico

#### 1.2. 1.2 Login válido como cliente

**File:** `tests/login/login-cliente.spec.ts`

**Steps:**
  1. Cobre: LOGIN-04, LOGIN-07, LOGIN-08. Preencher 'E-mail' com TEST_CLIENTE_EMAIL e 'Senha' com TEST_CLIENTE_PASSWORD e clicar em 'Entrar', capturando a resposta de POST /api/auth/login.
    - expect: API responde 200 com token e user (id, name, email, role 'customer'); credenciais só no corpo da requisição
    - expect: URL passa a /#/ e h1 'Catálogo' é exibido
    - expect: Cabeçalho mostra 'Olá, Cliente Teste', 'Meus pedidos' e 'Sair'; 'Entrar' e 'Cadastrar' somem
    - expect: sessionStorage contém token e user; a senha não aparece em storage, URL ou console

#### 1.3. 1.3 Login válido como administrador e acesso por perfil

**File:** `tests/login/login-admin.spec.ts`

**Steps:**
  1. Cobre: LOGIN-04, LOGIN-08, LOGIN-10. PERGUNTA EM ABERTO 6 (área administrativa na interface). Fazer login com TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD.
    - expect: API responde 200 e user.role = 'admin'
    - expect: Redireciona para /#/ com 'Olá, Admin Teste', 'Meus pedidos' e 'Sair'
    - expect: Com o token do admin, GET /api/admin/orders responde 200
  2. Abrir /#/admin e /#/admin/orders.
    - expect: Observado (sem afirmar o correto, PERGUNTA EM ABERTO 6): as rotas exibem h1 'Página não encontrada'; o cabeçalho não tem item exclusivo de admin e o acesso a todos os pedidos só existe pela API

#### 1.4. 1.4 Envio do formulário com a tecla Enter

**File:** `tests/login/enter-submit.spec.ts`

**Steps:**
  1. Cobre: LOGIN-04, LOGIN-18. Preencher credenciais válidas do cliente e pressionar Enter no campo 'Senha'.
    - expect: Login ocorre como no clique (API 200) e o usuário vai para /#/ autenticado

#### 1.5. 1.5 Sessão persiste ao recarregar e /#/login com sessão ativa

**File:** `tests/login/session-persist.spec.ts`

**Steps:**
  1. Cobre: LOGIN-13, LOGIN-11. Logar como cliente e recarregar a página (F5) em /#/.
    - expect: Continua autenticado: 'Olá, Cliente Teste' e 'Sair' visíveis
    - expect: sessionStorage mantém token e user
    - expect: GET /api/auth/me com o token da sessão responde 200
  2. PERGUNTA EM ABERTO 5 (usuário já logado em /#/login). Com a sessão ativa, abrir /#/login diretamente e depois recarregar.
    - expect: Comportamento observado, sem afirmar o correto: não há redirecionamento; a URL permanece /#/login, o h1 'Entrar' e o formulário aparecem enquanto o cabeçalho segue mostrando 'Olá, Cliente Teste' e 'Sair'. O teste deve documentar o estado atual

#### 1.6. 1.6 Logout encerra a sessão e protege as áreas privadas

**File:** `tests/login/logout.spec.ts`

**Steps:**
  1. Cobre: LOGIN-14, LOGIN-12. Logar como cliente, abrir /#/orders e clicar em 'Sair'.
    - expect: POST /api/auth/logout responde 204
    - expect: Usuário vai para /#/; sessionStorage sem token e user; cabeçalho volta a 'Entrar' e 'Cadastrar'
    - expect: O token usado antes do logout deixa de valer: GET /api/auth/me responde 401
  2. Clicar no botão Voltar do navegador.
    - expect: Nenhum dado de pedidos é exibido; o app mostra /#/login?reason=auth (h1 'Entrar') com cabeçalho deslogado
  3. Sem sessão, abrir /#/orders.
    - expect: Redireciona para /#/login?reason=auth

### 2. 2. Validação de entrada e credenciais

**Seed:** `tests/seed.spec.ts`

#### 2.1. 2.1 Campos obrigatórios vazios

**File:** `tests/login/empty-fields.spec.ts`

**Steps:**
  1. Cobre: LOGIN-01, LOGIN-02. PERGUNTA EM ABERTO 1 (textos oficiais das mensagens). Monitorar requisições a /api/auth/login. Clicar em 'Entrar' com os campos vazios; repetir só com e-mail preenchido (TEST_CLIENTE_EMAIL) e só com senha preenchida.
    - expect: Nos 3 casos a tela informa o que falta e NENHUMA requisição é enviada à API; a regra é a mesma para e-mail vazio, senha vazia ou ambos
    - expect: Permanece em /#/login, sem token no sessionStorage
    - expect: DIVERGÊNCIA: a tela envia POST /api/auth/login nos 3 casos. Ambos vazios e só senha: API 400 e a tela mostra 'Informe e-mail e senha'. Só e-mail (senha vazia): API 401 e a tela mostra 'E-mail ou senha inválidos', mensagem diferente dos outros dois casos. Foco permanece no botão e não há aria-invalid nos campos
  2. Verificar o contrato: POST /api/auth/login sem o campo password (e sem email).
    - expect: API responde 400 (LOGIN-01); a API cumpre o critério

#### 2.2. 2.2 Formato inválido de e-mail

**File:** `tests/login/invalid-email-format.spec.ts`

**Steps:**
  1. Cobre: LOGIN-03. Para cada valor ('abc', 'a@') informar uma senha qualquer e enviar, monitorando a rede.
    - expect: A tela sinaliza o formato inválido do e-mail antes do envio (sem requisição à API)
    - expect: DIVERGÊNCIA: a requisição é enviada, a API responde 400 e a tela mostra 'Informe e-mail e senha' (mensagem enganosa, pois o campo está preenchido); não há mensagem específica de formato nem aria-invalid. O formulário tem novalidate, então a validação nativa do navegador não aparece

#### 2.3. 2.3 Credenciais inválidas: senha errada e e-mail não cadastrado

**File:** `tests/login/wrong-credentials.spec.ts`

**Steps:**
  1. Cobre: LOGIN-05, LOGIN-06. Informar TEST_CLIENTE_EMAIL com senha errada e enviar; depois informar 'naoexiste@qalab.com' com uma senha qualquer.
    - expect: Nos dois casos a API responde 401 e a tela mostra a MESMA mensagem ('E-mail ou senha inválidos', texto atual; PERGUNTA EM ABERTO 1), sem revelar se o e-mail existe
    - expect: Permanece em /#/login, sem token no sessionStorage, campos preenchidos e botão habilitado
  2. PERGUNTA EM ABERTO 7 (mínimo de 8 caracteres no login). Informar TEST_CLIENTE_EMAIL com senha curta ('x').
    - expect: Comportamento observado, sem afirmar o correto: a requisição é enviada e a tela mostra a mesma mensagem 'E-mail ou senha inválidos' (API 401), sem validação de tamanho mínimo

#### 2.4. 2.4 E-mail com maiúsculas e espaços nas bordas

**File:** `tests/login/email-case-whitespace.spec.ts`

**Steps:**
  1. Cobre: PERGUNTA EM ABERTO 2 (sem critério LOGIN associado; complementa LOGIN-04). Logar com TEST_CLIENTE_EMAIL em maiúsculas e senha correta; repetir com espaços antes e depois do e-mail.
    - expect: Comportamento observado, sem afirmar o correto: ambos os logins são aceitos (200), vão para /#/ e o user.email retornado vem em minúsculas

#### 2.5. 2.5 Nova tentativa válida após erro

**File:** `tests/login/retry-after-error.spec.ts`

**Steps:**
  1. Cobre: LOGIN-17. Errar a senha (mensagem de erro visível) e, sem recarregar, corrigir a senha e reenviar.
    - expect: Login funciona e o usuário chega a /#/ autenticado
    - expect: A mensagem de erro anterior não permanece (área de erro vazia ou tela trocada)

### 3. 3. Após o login, rotas protegidas e API

**Seed:** `tests/seed.spec.ts`

#### 3.1. 3.1 Redirecionamento com motivo e retorno ao destino

**File:** `tests/login/redirect-reason.spec.ts`

**Steps:**
  1. Cobre: LOGIN-09, LOGIN-12. Sem sessão, abrir /#/orders (repetir com /#/checkout).
    - expect: Redireciona para /#/login?reason=auth e a tela exibe o motivo 'Entre para continuar.'
  2. Fazer login válido do cliente a partir dessa tela.
    - expect: Após o login o usuário volta para a área que tentava acessar (/#/orders, h1 'Meus pedidos')
    - expect: DIVERGÊNCIA: a tela sempre redireciona para /#/ (Catálogo); o destino original é perdido

#### 3.2. 3.2 Áreas protegidas exigem login

**File:** `tests/login/protected-routes.spec.ts`

**Steps:**
  1. Cobre: LOGIN-12. Em contexto limpo abrir /#/cart, /#/orders e /#/checkout.
    - expect: Cada rota redireciona para /#/login?reason=auth; nenhum dado de carrinho ou pedidos é exibido
  2. Logado como cliente, abrir /#/orders e /#/checkout com carrinho vazio.
    - expect: /#/orders exibe h1 'Meus pedidos'; /#/checkout com carrinho vazio vai para /#/cart (h1 'Carrinho')

#### 3.3. 3.3 Escopo da sessão entre abas

**File:** `tests/login/session-scope.spec.ts`

**Steps:**
  1. Cobre: LOGIN-13. PERGUNTA EM ABERTO 4 (duração e escopo da sessão). Logar em uma aba e abrir o app em nova aba/contexto.
    - expect: Comportamento observado, sem afirmar o correto: a sessão fica em sessionStorage (token e user), então a nova aba não está autenticada; localStorage e cookies ficam vazios. Não foi observada expiração do token

#### 3.4. 3.4 Contrato da API de autenticação e perfis

**File:** `tests/login/api-auth-contract.spec.ts`

**Steps:**
  1. Cobre: LOGIN-01, LOGIN-04, LOGIN-05, LOGIN-10, LOGIN-11, LOGIN-14. Via request da API: POST /api/auth/login com credenciais válidas do cliente, inválidas e sem password.
    - expect: 200 com token e user; 401 para credenciais inválidas; 400 com campo ausente
  2. GET /api/auth/me com o token do cliente, sem token e com token 'invalido'.
    - expect: 200 com o usuário; 401 sem token; 401 com token inválido
  3. GET /api/admin/orders com token do cliente, com token do admin (TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD) e sem token.
    - expect: Cliente: 403; admin: 200; sem token: 401
  4. POST /api/auth/logout com o token do cliente e, em seguida, GET /api/auth/me com o mesmo token.
    - expect: Logout responde 204 e /api/auth/me passa a responder 401

#### 3.5. 3.5 Credenciais fora da URL, do storage e do console

**File:** `tests/login/credentials-exposure.spec.ts`

**Steps:**
  1. Cobre: LOGIN-07. Enviar o formulário com credenciais válidas e com senha errada, inspecionando URL, requisições, storage e console.
    - expect: Credenciais só no corpo JSON de POST /api/auth/login; nenhuma URL contém e-mail ou senha
    - expect: Senha ausente de sessionStorage, localStorage, cookies e mensagens de console

### 4. 4. Erros de servidor/rede e comportamento do envio

**Seed:** `tests/seed.spec.ts`

#### 4.1. 4.1 Falha do servidor e da rede

**File:** `tests/login/network-failure.spec.ts`

**Steps:**
  1. Cobre: LOGIN-15. PERGUNTA EM ABERTO 1 (textos oficiais). Interceptar /api/auth/login retornando 500 com JSON {"error":"Internal Server Error"}; depois abortar a requisição (falha de rede); depois responder 503 com corpo HTML.
    - expect: Em cada caso a tela mostra mensagem amigável em português, sem sessão criada, e o formulário continua utilizável (campos preenchidos, botão habilitado)
    - expect: DIVERGÊNCIA: 500 mostra o texto cru do servidor 'Internal Server Error' (inglês); falha de rede mostra 'Failed to fetch' (inglês, técnico); 503 com HTML mostra 'Erro inesperado'. O formulário continua utilizável nos três

#### 4.2. 4.2 Estado de carregamento e duplo envio

**File:** `tests/login/submit-state.spec.ts`

**Steps:**
  1. Cobre: LOGIN-16. Interceptar /api/auth/login com atraso de 2 s, preencher credenciais e dar duplo clique em 'Entrar'.
    - expect: Durante o envio a tela indica carregamento (botão desabilitado ou com texto/aria-busy de carregamento)
    - expect: Apenas 1 requisição POST /api/auth/login é enviada
    - expect: DIVERGÊNCIA: o botão continua habilitado com o texto 'Entrar', sem aria-busy, e 2 requisições são enviadas

#### 4.3. 4.3 Tentativas inválidas repetidas

**File:** `tests/login/rate-limit.spec.ts`

**Steps:**
  1. Cobre: PERGUNTA EM ABERTO 3 (sem critério LOGIN associado). Enviar 12 tentativas inválidas seguidas via API para TEST_CLIENTE_EMAIL e depois um login válido.
    - expect: Comportamento observado, sem afirmar o correto: as 12 respostas são 401, sem 429, sem bloqueio nem atraso; em seguida o login válido responde 200

### 5. 5. Acessibilidade e entradas maliciosas

**Seed:** `tests/seed.spec.ts`

#### 5.1. 5.1 Teclado e leitores de tela

**File:** `tests/login/keyboard-a11y.spec.ts`

**Steps:**
  1. Cobre: LOGIN-18. Em /#/login, usar Tab para percorrer 'E-mail', 'Senha' e 'Entrar'; enviar com Enter no botão. Depois provocar um erro de credenciais.
    - expect: Ordem do foco: E-mail, Senha, Entrar; login possível só com teclado
    - expect: Campos com rótulo associado (getByLabel 'E-mail' e 'Senha' funcionam)
    - expect: O erro aparece na região role=alert, anunciada a leitores de tela

#### 5.2. 5.2 XSS e injeção SQL nos campos

**File:** `tests/login/malicious-input.spec.ts`

**Steps:**
  1. Cobre: LOGIN-19. Registrar diálogos. Enviar e-mail '<script>alert(1)</script>@x.com' com senha '<img src=x onerror=alert(1)>'; e e-mail "admin@qalab.com'--" com senha "' OR '1'='1"; repetir via API POST /api/auth/login com os mesmos payloads.
    - expect: Nenhum diálogo ou script executado; nenhuma tag injetada no DOM; a mensagem de erro é exibida como texto
    - expect: Login recusado, página sem travar e nenhuma resposta 500 (a API responde 400 ou 401)

#### 5.3. 5.3 Entradas muito longas

**File:** `tests/login/long-input.spec.ts`

**Steps:**
  1. Cobre: LOGIN-19. Enviar e-mail com 10000 caracteres antes de '@x.com' e senha de 100000 caracteres; repetir com cada campo longo isoladamente (e-mail 100000 caracteres; senha 100000 caracteres) e via API.
    - expect: Página não trava e a resposta não é 500; tela mostra erro de credenciais ou de validação
    - expect: Campos longos isolados: API 401 e mensagem 'E-mail ou senha inválidos' (comportamento correto)
    - expect: DIVERGÊNCIA: com os dois campos longos juntos (corpo acima de cerca de 120 mil caracteres; confirmado com 60000 + 60000) a API responde 500 {"error":"Erro interno"} e a tela mostra 'Erro interno'
