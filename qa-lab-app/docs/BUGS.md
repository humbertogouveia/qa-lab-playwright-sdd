# Catálogo de bugs propositais

Todos começam **desligados**. Servem para verificar se uma suíte de testes realmente falha quando o sistema tem defeito.

## Como ligar e desligar

```bash
# Ligar
curl -X POST http://localhost:3000/api/test/bugs \
  -H 'content-type: application/json' \
  -d '{"wrongTotal": true}'

# Ver o estado
curl http://localhost:3000/api/test/bugs

# Desligar tudo e restaurar os dados
curl -X POST http://localhost:3000/api/test/reset
```

Ou ao iniciar o servidor: `BUGS=wrongTotal,slowCatalog npm start`.

## Lista

| Bug | Onde aparece | Comportamento correto | Comportamento com o bug | O que o teste deve pegar |
| --- | --- | --- | --- | --- |
| `checkoutServerError` | `POST /api/orders` | Cria o pedido | Responde 500 e a tela mostra erro | Tratamento de erro no checkout; status 500 na API |
| `wrongTotal` | Total do pedido | `subtotal − desconto + frete` | O frete é ignorado | Cálculo de total com frete (ex.: R$ 89,90 com `QALAB10` deve dar R$ 110,81, mas dá R$ 80,91) |
| `cepValidationBroken` | Checkout | Rejeita CEP fora do formato `00000-000` | Aceita qualquer texto | Validação negativa de CEP |
| `slowCatalog` | `GET /api/products` | Resposta imediata | Demora 2 segundos | Limites de tempo; thresholds de performance no k6 |
| `couponAppliedTwice` | Desconto do pedido | Aplica o cupom uma vez | Dobra o desconto | Cálculo de desconto (QALAB10 sobre R$ 89,90 deve dar R$ 8,99, mas dá R$ 17,98) |
| `loginAcceptsAnyPassword` | `POST /api/auth/login` | Rejeita senha errada | Aceita qualquer senha de e-mail existente | Teste negativo de autenticação |

## Sugestão de uso

1. Rode a suíte com tudo desligado e confirme que passa.
2. Ligue um bug por vez e confirme que **pelo menos um teste falha**.
3. Se nenhum teste falhar, há uma lacuna de cobertura. Registre e corrija.
