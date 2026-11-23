# Plano de Teste - Login (QA Lab Store)

## Application Overview

Plano da funcionalidade de login do QA Lab Store (http://localhost:3000/#/login, SPA com rotas por hash; API em /api, POST /api/auth/login, Swagger em /api-docs). Elaborado com exploracao real no navegador. Credenciais vindas de variaveis de ambiente (.env): TEST_CLIENTE_EMAIL / TEST_CLIENTE_PASSWORD (cliente, role customer) e TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD (admin, role admin). Todos os cenarios partem de contexto novo (sem sessionStorage) e abrem /#/login.

Observacoes reais: formulario #login-form com novalidate (sem validacao nativa do navegador). Campos: #email (input type=email, label "E-mail", autocomplete=username, aria-describedby=err-email) e #password (type=password, label "Senha", autocomplete=current-password, aria-describedby=err-password); botao button[type=submit] "Entrar"; area de erro #form-error (data-testid=form-error, role=alert). Cabecalho: data-testid nav-login ("Entrar"), nav-register ("Cadastrar"), nav-catalog, nav-cart, nav-orders ("Meus pedidos", oculto sem login), logout ("Sair", oculto sem login). Nao existem: mostrar/ocultar senha, esqueci a senha, lembrar-me nem link de cadastro dentro do formulario (cadastro so no cabecalho, #/register). Sessao fica em sessionStorage (chaves token e user; user = {id,name,email,role}); localStorage e cookies vazios. Mensagens: "Informe e-mail e senha" (validacao no cliente: campos vazios, e-mail com formato invalido); "E-mail ou senha inválidos" (401 da API); "Erro inesperado" (HTTP 500); "Failed to fetch" (falha de rede, texto tecnico em ingles). Apos login valido: redireciona para /#/ (Catalogo), cabecalho mostra "Olá, <nome>", "Meus pedidos" e "Sair". Rota protegida sem login: /#/orders -> /#/login; /#/checkout -> /#/login?reason=auth (exibe "Entre para continuar."). Rotas /#/admin* nao existem (h1 "Página não encontrada") para qualquer perfil. Unico erro de console no carregamento: 404 de /favicon.ico.

## Test Scenarios

### 1. 1. Caminho feliz

**Seed:** `tests/seed.spec.ts`

#### 1.1. 1.1 Renderizacao da tela de login

**File:** `tests/login/render.spec.ts`

**Steps:**
  1. Abrir http://localhost:3000/#/login em contexto limpo
    - expect: Titulo da pagina 'QA Lab Store' e h1 'Entrar'
    - expect: Campos #email (label 'E-mail') e #password (label 'Senha') e botao 'Entrar' visiveis
    - expect: #password com type=password (mascarado); #email com autocomplete=username e #password com current-password
    - expect: #form-error vazio
    - expect: Cabecalho com links 'Entrar' e 'Cadastrar'; sem 'Meus pedidos' e 'Sair' visiveis
    - expect: Nao ha mostrar/ocultar senha, esqueci a senha ou lembrar-me
    - expect: Unico erro de console tolerado: 404 de /favicon.ico

#### 1.2. 1.2 Login valido como cliente

**File:** `tests/login/login-cliente.spec.ts`

**Steps:**
  1. Preencher #email com TEST_CLIENTE_EMAIL e #password com TEST_CLIENTE_PASSWORD e clicar em 'Entrar'
    - expect: URL passa a /#/ e h1 'Catalogo' e exibido
    - expect: Cabecalho mostra 'Olá, Cliente Teste', 'Meus pedidos' e 'Sair'; 'Entrar' e 'Cadastrar' somem
    - expect: sessionStorage contem token e user com role 'customer'

#### 1.3. 1.3 Login valido como admin e diferencas por perfil

**File:** `tests/login/login-admin.spec.ts`

**Steps:**
  1. Fazer login com TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD
    - expect: Redireciona para /#/ com 'Olá, Admin Teste'
    - expect: sessionStorage.user.role = 'admin'
    - expect: Cabecalho identico ao do cliente (nao ha item de menu exclusivo de admin)
  2. Abrir /#/admin, /#/admin/products e /#/admin/orders
    - expect: Cada rota exibe h1 'Página não encontrada' (sem painel admin na UI atual)

#### 1.4. 1.4 Envio com a tecla Enter

**File:** `tests/login/enter-submit.spec.ts`

**Steps:**
  1. Preencher credenciais validas e pressionar Enter em #password
    - expect: Login ocorre como no clique, redirecionando para /#/

#### 1.5. 1.5 Sessao persiste apos recarregar

**File:** `tests/login/session-persist.spec.ts`

**Steps:**
  1. Logar como cliente e recarregar a pagina (F5)
    - expect: Continua autenticado: 'Sair' visivel e 'Olá, Cliente Teste'
    - expect: sessionStorage mantem token e user
  2. Navegar para /#/login ja logado
    - expect: O formulario 'Entrar' ainda e exibido (nao ha redirecionamento); registrar como comportamento observado

#### 1.6. 1.6 Logout encerra a sessao

**File:** `tests/login/logout.spec.ts`

**Steps:**
  1. Logar como cliente e clicar em 'Sair' (data-testid=logout)
    - expect: Vai para /#/, sessionStorage sem token/user, cabecalho volta a 'Entrar' e 'Cadastrar'
  2. Abrir /#/orders e usar o botao Voltar
    - expect: /#/orders redireciona para /#/login; Voltar nao concede acesso a area protegida

### 2. 2. Credenciais invalidas e validacao

**Seed:** `tests/seed.spec.ts`

#### 2.1. 2.1 Senha incorreta

**File:** `tests/login/wrong-password.spec.ts`

**Steps:**
  1. Informar TEST_CLIENTE_EMAIL e senha errada e enviar
    - expect: #form-error mostra 'E-mail ou senha inválidos' (401)
    - expect: Permanece em /#/login; sem token no sessionStorage
    - expect: Campos permanecem preenchidos (e-mail e senha nao sao limpos); botao habilitado

#### 2.2. 2.2 Usuario inexistente

**File:** `tests/login/unknown-user.spec.ts`

**Steps:**
  1. Informar naoexiste@qalab.com e qualquer senha
    - expect: Mesma mensagem 'E-mail ou senha inválidos' do cenario 2.1 (sem enumeracao de usuarios)

#### 2.3. 2.3 Campos vazios

**File:** `tests/login/empty-fields.spec.ts`

**Steps:**
  1. Clicar em 'Entrar' sem preencher nada
    - expect: #form-error mostra 'Informe e-mail e senha'
    - expect: Nenhuma chamada a /api/auth/login; sem redirecionamento
    - expect: Spans err-email/err-password permanecem vazios; aria-invalid nao e definido

#### 2.4. 2.4 Somente senha preenchida

**File:** `tests/login/only-password.spec.ts`

**Steps:**
  1. Preencher so a senha e enviar
    - expect: 'Informe e-mail e senha'; permanece em /#/login

#### 2.5. 2.5 Somente e-mail preenchido (comportamento inconsistente)

**File:** `tests/login/only-email.spec.ts`

**Steps:**
  1. Preencher so o e-mail valido, deixar senha vazia e enviar
    - expect: Observado: a requisicao vai a API e retorna 'E-mail ou senha inválidos' em vez de 'Informe e-mail e senha'
    - expect: Registrar como possivel defeito/inconsistencia de validacao; sem login

#### 2.6. 2.6 Formatos invalidos de e-mail

**File:** `tests/login/invalid-email-format.spec.ts`

**Steps:**
  1. Para cada valor (abc, a@x, 'a b@x.com') informar com senha qualquer e enviar
    - expect: Observado: '#form-error' mostra 'Informe e-mail e senha' (mensagem generica, sem mensagem especifica de formato)
    - expect: Sem login e sem validacao nativa (novalidate)

#### 2.7. 2.7 Correcao apos erro

**File:** `tests/login/retry-after-error.spec.ts`

**Steps:**
  1. Errar a senha, depois corrigir e reenviar
    - expect: Login ocorre e o usuario chega a /#/; mensagem de erro anterior nao permanece

### 3. 3. Comportamentos da UI

**Seed:** `tests/seed.spec.ts`

#### 3.1. 3.1 Estado do botao durante o envio

**File:** `tests/login/submit-state.spec.ts`

**Steps:**
  1. Interceptar **/api/auth/login com atraso de 1,5 s e enviar
    - expect: Observado: botao permanece habilitado com texto 'Entrar' e sem aria-busy durante a requisicao (sem estado de carregamento)
    - expect: Registrar risco de duplo envio; validar quantas requisicoes saem ao dar duplo clique

#### 3.2. 3.2 Redirecionamento com motivo de autenticacao

**File:** `tests/login/redirect-reason.spec.ts`

**Steps:**
  1. Sem login, abrir /#/checkout
    - expect: URL vira /#/login?reason=auth
    - expect: Texto 'Entre para continuar.' exibido no main
  2. Fazer login valido a partir desta tela
    - expect: Registrar para onde o app redireciona apos o login (observado nos logins diretos: /#/)

#### 3.3. 3.3 Navegacao por teclado e acessibilidade

**File:** `tests/login/keyboard-a11y.spec.ts`

**Steps:**
  1. Usar Tab a partir do campo E-mail ate o botao e enviar com Enter
    - expect: Ordem: E-mail, Senha, Entrar; foco visivel; login possivel so com teclado
    - expect: Campos com label associada; #form-error com role=alert

#### 3.4. 3.4 Link de cadastro no cabecalho

**File:** `tests/login/register-link.spec.ts`

**Steps:**
  1. Clicar em 'Cadastrar' (data-testid=nav-register) e voltar
    - expect: Navega para /#/register; ao voltar, login exibido limpo
    - expect: Nao ha link 'Esqueci a senha'

#### 3.5. 3.5 Viewport mobile

**File:** `tests/login/responsive.spec.ts`

**Steps:**
  1. Abrir o login em 375x667 e logar como cliente
    - expect: Layout utilizavel sem sobreposicao e login funcional

### 4. 4. Sessao e rotas protegidas

**Seed:** `tests/seed.spec.ts`

#### 4.1. 4.1 Rotas protegidas sem login

**File:** `tests/login/protected-routes.spec.ts`

**Steps:**
  1. Em contexto limpo abrir /#/orders e /#/checkout
    - expect: /#/orders -> /#/login
    - expect: /#/checkout -> /#/login?reason=auth

#### 4.2. 4.2 Cliente logado acessa rotas de admin

**File:** `tests/login/admin-routes-as-customer.spec.ts`

**Steps:**
  1. Logar como cliente e abrir /#/admin e /#/admin/products
    - expect: h1 'Página não encontrada'; nenhum dado administrativo exposto
    - expect: Rota inexistente /#/rota-xyz tem o mesmo comportamento

#### 4.3. 4.3 Cliente logado acessa area autenticada

**File:** `tests/login/orders-as-customer.spec.ts`

**Steps:**
  1. Logar como cliente e abrir /#/orders; abrir /#/checkout com carrinho vazio
    - expect: /#/orders exibe h1 'Meus pedidos'
    - expect: /#/checkout com carrinho vazio redireciona para /#/cart (h1 'Carrinho')

#### 4.4. 4.4 Sessao isolada por aba (sessionStorage)

**File:** `tests/login/session-scope.spec.ts`

**Steps:**
  1. Logar em uma aba e abrir o app em nova aba/contexto
    - expect: Nova aba nao esta autenticada (token em sessionStorage, nao em localStorage/cookie)

### 5. 5. Casos de borda e seguranca basica

**Seed:** `tests/seed.spec.ts`

#### 5.1. 5.1 E-mail em maiusculas

**File:** `tests/login/email-case.spec.ts`

**Steps:**
  1. Logar com ADMIN@QALAB.COM (TEST_ADMIN_EMAIL em maiusculas) e senha correta
    - expect: Login aceito (e-mail case-insensitive), user.email retornado em minusculas

#### 5.2. 5.2 Espacos nas bordas

**File:** `tests/login/whitespace.spec.ts`

**Steps:**
  1. E-mail com espacos antes/depois e senha correta
    - expect: Login aceito (e-mail sofre trim)
  2. Senha correta precedida de um espaco
    - expect: 'E-mail ou senha inválidos' (senha nao sofre trim)

#### 5.3. 5.3 Entradas muito longas

**File:** `tests/login/long-input.spec.ts`

**Steps:**
  1. E-mail com 5000 caracteres + @x.com e senha de 5000 caracteres
    - expect: 'E-mail ou senha inválidos', pagina sem travar, sem erro 500

#### 5.4. 5.4 XSS nos campos

**File:** `tests/login/xss.spec.ts`

**Steps:**
  1. E-mail '<img src=x onerror=alert(1)>@x.com' e senha '<script>alert(1)</script>'
    - expect: Nenhum dialogo/script executado; mensagem exibida como texto ('Informe e-mail e senha')

#### 5.5. 5.5 Injecao SQL

**File:** `tests/login/sqli.spec.ts`

**Steps:**
  1. E-mail "' OR '1'='1' --@x.com" e senha "' OR '1'='1"
    - expect: Login recusado, sem erro 500 ou mensagem tecnica

#### 5.6. 5.6 Credenciais fora da URL

**File:** `tests/login/credentials-exposure.spec.ts`

**Steps:**
  1. Enviar formulario e inspecionar URL, rede e storage
    - expect: Credenciais nao aparecem na URL; POST /api/auth/login com corpo JSON
    - expect: Senha nao fica em storage nem console

#### 5.7. 5.7 Falha do servidor e de rede

**File:** `tests/login/network-failure.spec.ts`

**Steps:**
  1. Interceptar /api/auth/login retornando 500
    - expect: #form-error mostra 'Erro inesperado'; sem sessao; formulario reutilizavel
  2. Abortar a requisicao (offline)
    - expect: Observado: '#form-error' mostra 'Failed to fetch' (mensagem tecnica em ingles, nao amigavel); registrar como melhoria

#### 5.8. 5.8 Tentativas repetidas

**File:** `tests/login/rate-limit.spec.ts`

**Steps:**
  1. Enviar 10 tentativas invalidas seguidas
    - expect: Registrar se ha bloqueio (429) ou atraso; sem quebra do app (nao explorado ainda)
