# Plano de Teste - Login (QA Lab Store)

## Application Overview

Plano da funcionalidade de login do QA Lab Store (http://localhost:3000/#/login, SPA com rotas por hash; API em /api, POST /api/auth/login, Swagger em /api-docs). Revisado com nova exploracao real no navegador. Credenciais vindas de variaveis de ambiente (.env): TEST_CLIENTE_EMAIL / TEST_CLIENTE_PASSWORD (cliente, role customer) e TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD (admin, role admin). Todos os cenarios partem de contexto novo (sem sessionStorage) e abrem /#/login.

Observacoes reais: formulario #login-form com novalidate (sem validacao nativa do navegador). Campos: #email (input type=email, label "E-mail", autocomplete=username, aria-describedby=err-email) e #password (type=password, label "Senha", autocomplete=current-password, aria-describedby=err-password); botao button[type=submit] "Entrar"; area de erro #form-error (data-testid=form-error, role=alert). data-testid existentes no app: brand, nav-catalog, nav-cart, cart-icon, cart-count, nav-orders ("Meus pedidos", oculto sem login), nav-login ("Entrar"), nav-register ("Cadastrar"), user-name, logout ("Sair", oculto sem login), toast, form-error, error-email, error-password. Nao existem: mostrar/ocultar senha, esqueci a senha, lembrar-me nem link de cadastro dentro do formulario (cadastro so no cabecalho, #/register). Sessao fica em sessionStorage (chaves token e user; user = {id,name,email,role}); localStorage e cookies vazios. Mensagens: "Informe e-mail e senha" (validacao no cliente: campos vazios, e-mail com formato invalido); "E-mail ou senha inválidos" (401 da API); "Erro inesperado" (HTTP 500); "Failed to fetch" (falha de rede, texto tecnico em ingles); para outros erros o app exibe o texto cru recebido (ex.: corpo 429 'Too many' e, com 200 e JSON invalido, "Cannot destructure property 'token'..."). Apos login valido: redireciona SEMPRE para /#/ (Catalogo), cabecalho mostra "Olá, <nome>", "Meus pedidos" e "Sair"; o app nao retorna a rota originalmente pedida. Rotas protegidas sem login: /#/orders e /#/checkout redirecionam ambas para /#/login?reason=auth (exibe "Entre para continuar."); (CORRECAO: o plano anterior indicava /#/login para /#/orders). Rotas /#/admin* nao existem (h1 "Página não encontrada") para qualquer perfil. Unico erro de console no carregamento: 404 de /favicon.ico; cada 401 de login gera um erro de console de recurso (esperado).

## Test Scenarios

### 1. 1. Caminho feliz

**Seed:** `tests/seed.spec.ts`

#### 1.1. 1.1 Renderizacao da tela de login

**File:** `tests/login/render.spec.ts`

**Steps:**
  1. Abrir http://localhost:3000/#/login em contexto limpo
    - expect: Titulo da pagina 'QA Lab Store' e h1 'Entrar'
    - expect: Campos #email (label 'E-mail') e #password (label 'Senha') e botao 'Entrar' visiveis
    - expect: #password com type=password (mascarado); #email com autocomplete=username e #password com current-password; #login-form com novalidate
    - expect: #form-error (role=alert) vazio
    - expect: Cabecalho com links 'Entrar' e 'Cadastrar'; sem 'Meus pedidos' e 'Sair' visiveis (elementos existem no DOM com hidden)
    - expect: Nao ha mostrar/ocultar senha, esqueci a senha ou lembrar-me
    - expect: Unico erro de console tolerado: 404 de /favicon.ico

#### 1.2. 1.2 Login valido como cliente

**File:** `tests/login/login-cliente.spec.ts`

**Steps:**
  1. Preencher #email com TEST_CLIENTE_EMAIL e #password com TEST_CLIENTE_PASSWORD e clicar em 'Entrar'
    - expect: URL passa a /#/ e h1 'Catálogo' e exibido
    - expect: Cabecalho mostra 'Olá, Cliente Teste', 'Meus pedidos' e 'Sair'; 'Entrar' e 'Cadastrar' somem
    - expect: sessionStorage contem exatamente as chaves token e user (role 'customer'); localStorage e cookies vazios

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

#### 1.5. 1.5 Sessao persiste apos recarregar e /#/login ja logado

**File:** `tests/login/session-persist.spec.ts`

**Steps:**
  1. Logar como cliente e recarregar a pagina (F5)
    - expect: Continua autenticado: 'Sair' visivel e 'Olá, Cliente Teste'
    - expect: sessionStorage mantem token e user
  2. Navegar para /#/login ja logado (via URL, hash ou recarregando em /#/login)
    - expect: Observado (3 repeticoes): NAO ha redirecionamento; URL permanece /#/login, h1 'Entrar' e formulario exibidos, enquanto o cabecalho continua mostrando 'Olá, Cliente Teste' e 'Sair' (estado incoerente)
    - expect: Registrar como possivel defeito de UX; o teste deve documentar o comportamento atual
    - expect: Nota: em uma execucao isolada inicial o app ficou em /#/ apos o goto; nao reproduzido em 6 tentativas posteriores (provavel corrida com o redirecionamento do login)

#### 1.6. 1.6 Logout encerra a sessao

**File:** `tests/login/logout.spec.ts`

**Steps:**
  1. Logar como cliente e clicar em 'Sair' (data-testid=logout)
    - expect: Vai para /#/, sessionStorage sem token/user, cabecalho volta a 'Entrar' e 'Cadastrar'
  2. Abrir /#/orders e usar o botao Voltar
    - expect: /#/orders redireciona para /#/login?reason=auth; Voltar permanece em /#/login?reason=auth e nao concede acesso a area protegida
  3. Logar, abrir /#/orders, clicar em 'Sair' e usar Voltar
    - expect: Observado: Voltar leva a /#/login?reason=auth (entrada do historico criada pelo redirecionamento), cabecalho deslogado; nenhum dado de pedidos exibido

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
    - expect: Spans err-email/err-password permanecem vazios; aria-invalid nao e definido nos campos
    - expect: Foco permanece no botao (nao vai para o primeiro campo invalido)

#### 2.4. 2.4 Somente senha preenchida

**File:** `tests/login/only-password.spec.ts`

**Steps:**
  1. Preencher so a senha e enviar
    - expect: 'Informe e-mail e senha'; permanece em /#/login; sem chamada a API

#### 2.5. 2.5 Somente e-mail preenchido (comportamento inconsistente)

**File:** `tests/login/only-email.spec.ts`

**Steps:**
  1. Preencher so o e-mail valido, deixar senha vazia e enviar, monitorando requisicoes
    - expect: Confirmado: 1 requisicao POST /api/auth/login com corpo {"email":"<TEST_CLIENTE_EMAIL>","password":""}
    - expect: #form-error mostra 'E-mail ou senha inválidos' em vez de 'Informe e-mail e senha'
    - expect: Registrar como defeito/inconsistencia de validacao no cliente; sem login
  2. Repetir com senha contendo apenas espacos ('   ')
    - expect: Tambem chama a API e retorna 'E-mail ou senha inválidos' (senha so de espacos nao e tratada como vazia)

#### 2.6. 2.6 Formatos invalidos de e-mail

**File:** `tests/login/invalid-email-format.spec.ts`

**Steps:**
  1. Para cada valor (abc, a@x, 'a b@x.com') informar com senha qualquer e enviar
    - expect: Confirmado: '#form-error' mostra 'Informe e-mail e senha' (mensagem generica e enganosa, pois o campo esta preenchido; sem mensagem especifica de formato)
    - expect: Sem login e sem validacao nativa (novalidate); error-email permanece vazio

#### 2.7. 2.7 Correcao apos erro

**File:** `tests/login/retry-after-error.spec.ts`

**Steps:**
  1. Errar a senha, depois corrigir e reenviar
    - expect: Login ocorre e o usuario chega a /#/; mensagem de erro anterior nao permanece

#### 2.8. 2.8 Mensagem de erro persiste ao digitar

**File:** `tests/login/error-persistence.spec.ts`

**Steps:**
  1. Provocar 'E-mail ou senha inválidos' (somente e-mail preenchido), depois digitar na senha e em seguida limpar o e-mail
    - expect: Observado: #form-error NAO some nem muda enquanto o usuario digita ou limpa campos; so e substituido/limpo no proximo envio
    - expect: Registrar como melhoria de UX (erro obsoleto permanece visivel)

### 3. 3. Comportamentos da UI

**Seed:** `tests/seed.spec.ts`

#### 3.1. 3.1 Estado do botao e duplo envio

**File:** `tests/login/submit-state.spec.ts`

**Steps:**
  1. Interceptar **/api/auth/login com atraso de 1,5 s, preencher credenciais validas e clicar em 'Entrar'; apos 300 ms inspecionar o botao
    - expect: Observado: botao permanece habilitado, texto 'Entrar', sem aria-busy no botao nem no formulario (sem estado de carregamento)
  2. Clicar uma segunda vez em 'Entrar' enquanto a primeira requisicao esta pendente
    - expect: Observado: 2 requisicoes POST /api/auth/login sao enviadas (sem protecao contra duplo envio); o usuario termina logado em /#/
  3. Sem atraso, executar dblclick no botao 'Entrar'
    - expect: Observado: tambem 2 requisicoes; login conclui em /#/. Registrar como defeito de robustez (deveria desabilitar o botao durante o envio)

#### 3.2. 3.2 Redirecionamento com motivo de autenticacao

**File:** `tests/login/redirect-reason.spec.ts`

**Steps:**
  1. Sem login, abrir /#/checkout
    - expect: URL vira /#/login?reason=auth
    - expect: Texto 'Entre para continuar.' exibido no main
  2. Fazer login valido a partir desta tela
    - expect: Observado: redireciona para /#/ (Catalogo), NAO para /#/checkout; o destino original e perdido
    - expect: Mesmo resultado ao abrir diretamente /#/login?reason=auth ou apos ser redirecionado de /#/orders
    - expect: Registrar como possivel melhoria (retorno ao destino original)
  3. Apos o login, usar o botao Voltar
    - expect: Observado: volta para /#/login?reason=auth com formulario exibido e sessao ativa (cabecalho logado); mesma incoerencia do cenario 1.5

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
    - expect: /#/orders -> /#/login?reason=auth (corrigido; antes registrado como /#/login)
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

#### 4.5. 4.5 Token invalido ou ausente no sessionStorage

**File:** `tests/login/invalid-token.spec.ts`

**Steps:**
  1. Logar como cliente, definir sessionStorage.token = 'invalido' e recarregar em /#/
    - expect: Observado: cabecalho continua logado ('Olá, Cliente Teste', 'Sair'); o token nao e validado no carregamento
  2. Abrir /#/orders com o token invalido
    - expect: Observado: redireciona para /#/login?reason=auth e o sessionStorage e esvaziado (token e user removidos), indicando tratamento de 401 pela API
  3. Logar, remover somente sessionStorage.token, recarregar e abrir /#/orders
    - expect: Observado: em / o cabecalho ainda aparece logado (usa user); /#/orders redireciona para /#/login?reason=auth

#### 4.6. 4.6 Adulteracao de sessionStorage.user

**File:** `tests/login/tampered-user.spec.ts`

**Steps:**
  1. Logar como cliente, alterar sessionStorage.user para role 'admin' e name 'Hacker' e recarregar
    - expect: Observado: cabecalho exibe 'Olá, Hacker' (UI confia no user local); nao ha novos itens de menu nem rotas admin (/#/admin* segue 'Página não encontrada')
    - expect: Verificar que dados protegidos continuam dependendo do token (API) e registrar como observacao de seguranca de baixa gravidade

### 5. 5. Casos de borda e seguranca basica

**Seed:** `tests/seed.spec.ts`

#### 5.1. 5.1 E-mail em maiusculas

**File:** `tests/login/email-case.spec.ts`

**Steps:**
  1. Logar com TEST_ADMIN_EMAIL em maiusculas e senha correta
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
    - expect: Nenhum dialogo/script executado (0 dialogos); mensagem exibida como texto ('Informe e-mail e senha')

#### 5.5. 5.5 Injecao SQL

**File:** `tests/login/sqli.spec.ts`

**Steps:**
  1. E-mail "' OR '1'='1' --@x.com" e senha "' OR '1'='1"; repetir com e-mail "admin@qalab.com' --"
    - expect: Login recusado, sem erro 500 ou mensagem tecnica
    - expect: Observado: ambos os e-mails sao barrados no cliente com 'Informe e-mail e senha' (formato invalido) e nao chegam a API; para exercitar o backend, interceptar/enviar via API POST /api/auth/login com o payload e confirmar 401 sem 500

#### 5.6. 5.6 Credenciais fora da URL

**File:** `tests/login/credentials-exposure.spec.ts`

**Steps:**
  1. Enviar formulario e inspecionar URL, rede e storage
    - expect: Credenciais nao aparecem na URL; POST /api/auth/login com corpo JSON
    - expect: Senha nao fica em storage nem console

#### 5.7. 5.7 Falha do servidor, de rede e respostas anomalas

**File:** `tests/login/network-failure.spec.ts`

**Steps:**
  1. Interceptar /api/auth/login retornando 500
    - expect: #form-error mostra 'Erro inesperado'; sem sessao; formulario reutilizavel
  2. Abortar a requisicao (offline)
    - expect: Observado: '#form-error' mostra 'Failed to fetch' (mensagem tecnica em ingles, nao amigavel); registrar como melhoria
  3. Interceptar retornando 429 com JSON {"error":"Too many"}
    - expect: Observado: '#form-error' mostra 'Too many' (texto cru do servidor, sem mensagem tratada)
  4. Interceptar retornando 200 com corpo JSON malformado ('{')
    - expect: Observado: '#form-error' mostra a mensagem tecnica de JS "Cannot destructure property 'token' of ... is null." ou similar; registrar como defeito de tratamento de erro; sem sessao criada

#### 5.8. 5.8 Tentativas repetidas

**File:** `tests/login/rate-limit.spec.ts`

**Steps:**
  1. Enviar 12 tentativas invalidas seguidas para TEST_CLIENTE_EMAIL (senhas diferentes), medindo status e tempo
    - expect: Observado: as 12 respostas foram 401, cada uma em cerca de 30 a 90 ms; sem 429, sem bloqueio de conta e sem atraso progressivo
    - expect: App continua funcional: em seguida o login valido retorna 200 e redireciona para /#/
    - expect: Registrar como risco de seguranca: ausencia de rate limit/bloqueio contra forca bruta
