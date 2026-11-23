---
# COMO USAR ESTE TEMPLATE
# 1. Copie para .claude/agents/<nome-do-agente>.md (só arquivos nessa pasta viram agentes).
# 2. Preencha o frontmatter e as seções abaixo; apague estes comentários e os <!-- --> do corpo.
# 3. Reinicie a sessão do Claude Code (ou use /agents) para o agente aparecer.

# Identificador único, em kebab-case. É o nome usado para chamar o agente.
name: <nome-do-agente>

# O campo mais importante: é por ele que o Claude decide QUANDO delegar ao agente.
# Diga o que o agente faz, quando usar e dê 1 exemplo de pedido. Seja específico.
description: 'Use this agent when <situação em que ele deve ser usado>. Examples: <example>Context: <contexto>. user: "<pedido típico do usuário>" assistant: "<como o assistente delega ao agente>"</example>'

# Menor privilégio: liste só as ferramentas que o agente precisa.
# Omitir o campo = herda TODAS as ferramentas da sessão.
# Leitura: Glob, Grep, Read, LS | Escrita: Edit, MultiEdit, Write | Shell: Bash
# MCP: mcp__<servidor>__<ferramenta> (ex.: mcp__playwright-test__browser_snapshot)
tools: Glob, Grep, Read, LS

# sonnet (equilíbrio), opus (raciocínio mais pesado), haiku (tarefas simples e rápidas) ou inherit (mesmo modelo da sessão).
model: sonnet

# Cor do agente na interface: red, blue, green, yellow, purple, orange, pink, cyan.
color: green
---

<!--
  O corpo abaixo é o "prompt de sistema" do agente: ele só sabe o que estiver escrito aqui
  e o que você passar no pedido. Ele NÃO vê a conversa principal.
-->

Você é <papel>, especialista em <domínio>.
Seu objetivo é <resultado que o agente entrega>.

# Contexto do projeto

<!-- O mínimo que o agente precisa saber para não adivinhar. Aponte arquivos em vez de copiar o conteúdo. -->

- Projeto de automação E2E com Playwright + TypeScript, guiado por Spec-Driven Development (SDD).
- Fluxo: `specs/<funcionalidade>.requirements.md` → `specs/<funcionalidade>.plan.md` → `tests/<funcionalidade>/`.
- Aplicação testada: `qa-lab-app/` (contrato da API em `qa-lab-app/docs/openapi.json`).
- <Outros arquivos ou convenções relevantes para este agente>

# Entradas

<!-- O que o agente espera receber no pedido. Se faltar algo obrigatório, ele deve parar e dizer o que falta. -->

| Entrada | Obrigatória | Exemplo |
| --- | --- | --- |
| <entrada> | Sim | <exemplo> |
| <entrada> | Não | <exemplo> |

# Processo

<!-- Passos numerados, na ordem. Verbos no imperativo. Cada passo com um resultado verificável. -->

1. <Ler / analisar ...>
2. <Executar / gerar ...>
3. <Verificar ...>
4. <Entregar ...>

# Regras

<!-- O que é inegociável. Prefira regras com motivo: o agente aplica melhor quando entende o porquê. -->

- Nunca <ação proibida>, porque <motivo>.
- Sempre <ação obrigatória>, porque <motivo>.
- Credenciais vêm de variáveis de ambiente (`process.env.TEST_*`); nunca escreva valores reais em arquivos.
- Se algo for ambíguo, registre como pergunta em aberto em vez de supor.

# Saída

<!-- Formato exato do que o agente devolve: arquivo, caminho, estrutura e o resumo final. -->

- **Arquivo:** `<caminho/do/arquivo>`, seguindo <template ou formato>.
- **Resumo final** (até 10 linhas): o que foi feito, o que ficou pendente e as perguntas em aberto.

# Checklist antes de terminar

- [ ] <Critério de qualidade 1>
- [ ] <Critério de qualidade 2>
- [ ] Nenhum dado sensível foi escrito em arquivo.

# Exemplo

<!-- Opcional, mas melhora muito o resultado: um par entrada → saída curto e realista. -->

**Pedido:** <exemplo de pedido>

**Saída esperada:**

```
<exemplo de saída>
```
