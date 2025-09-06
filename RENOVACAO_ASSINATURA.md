# 🔄 Sistema de Renovação de Assinatura

## Visão Geral

O sistema de renovação permite que usuários com assinaturas expiradas renovem diretamente da tela de bloqueio, sem precisar contatar a administração.

## 🎯 Funcionalidades

### Botão "Renovar Assinatura Agora"
- **Localização**: Tela de bloqueio (`SubscriptionRequired`)
- **Função**: Gera automaticamente um novo link de pagamento
- **Integração**: Conecta diretamente com o Asaas

### Processo de Renovação

#### 1. **Geração do Link de Pagamento**
```
Usuário clica "Renovar Assinatura"
    ↓
Sistema verifica dados do usuário
    ↓
Cria/atualiza cliente no Asaas
    ↓
Gera nova assinatura (1 mês à frente)
    ↓
Retorna link de pagamento
```

#### 2. **Fluxo de Pagamento**
```
Link gerado com sucesso
    ↓
Botão "Pagar Agora" aparece
    ↓
Usuário clica e é redirecionado
    ↓
Pagamento efetuado no Asaas
    ↓
Confirmação automática
    ↓
Acesso restaurado
```

## 🔧 Implementação Técnica

### Componente `SubscriptionRequired`

#### Estados do Componente
```typescript
const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
```

#### Função `handleRenewSubscription`
```typescript
// 1. Obtém dados do usuário atual
const { data: { user } } = await supabase.auth.getUser();

// 2. Verifica/cria cliente no Asaas
let asaasCustomerId = await getOrCreateAsaasCustomer(user);

// 3. Calcula próxima data de vencimento
const nextDueDate = new Date();
nextDueDate.setMonth(nextDueDate.getMonth() + 1);

// 4. Cria assinatura no Asaas
const asaasSubscription = await AsaasService.createSubscription({
  customer: asaasCustomerId,
  billingType: subscription.monthly_fee.billing_type,
  value: subscription.monthly_fee.value,
  nextDueDate: nextDueDate.toISOString().split('T')[0],
  description: `Renovação: ${subscription.monthly_fee.description}`,
  cycle: 'MONTHLY'
});

// 5. Salva link de pagamento
setPaymentUrl(asaasSubscription.paymentLink);
```

### Interface do Usuário

#### Estado Inicial (Sem Link)
```
┌─────────────────────────────────────┐
│        🔒 Assinatura Expirada       │
│                                     │
│  [🔄 Renovar Assinatura Agora]      │
│                                     │
│  [🔍 Verificar Status] [🚪 Sair]    │
└─────────────────────────────────────┘
```

#### Estado com Link Gerado
```
┌─────────────────────────────────────┐
│        🔒 Assinatura Expirada       │
│                                     │
│  [💳 Pagar Agora - Abrir Link]      │
│                                     │
│  [🔍 Verificar Status] [🚪 Sair]    │
└─────────────────────────────────────┘
```

## 🔗 Integração com Asaas

### Criação de Cliente
```typescript
const asaasCustomer = await AsaasService.createCustomer({
  name: user.user_metadata?.full_name || user.email?.split('@')[0],
  email: user.email,
  cpfCnpj: "00000000000", // Deve ser coletado no cadastro
  personType: 'FISICA'
});
```

### Criação de Assinatura
```typescript
const asaasSubscription = await AsaasService.createSubscription({
  customer: asaasCustomerId,
  billingType: 'BOLETO', // ou PIX, CREDIT_CARD
  value: subscription.monthly_fee.value,
  nextDueDate: nextDueDate.toISOString().split('T')[0],
  description: `Renovação: ${subscription.monthly_fee.description}`,
  cycle: 'MONTHLY'
});
```

### Link de Pagamento
- **Disponível**: `asaasSubscription.paymentLink`
- **Abrir em**: Nova aba/janela
- **Redirecionamento**: Para checkout do Asaas

## 📊 Fluxo Completo

### Renovação Bem-Sucedida
```
1. Usuário clica "Renovar"
2. Loading: "Gerando Link de Pagamento..."
3. Asaas processa solicitação
4. Link gerado com sucesso
5. Botão "Pagar Agora" aparece
6. Usuário efetua pagamento
7. Asaas confirma pagamento
8. Status atualizado automaticamente
9. Acesso restaurado
```

### Tratamento de Erros
```typescript
try {
  // Processo de renovação
} catch (error) {
  toast({
    title: "Erro na renovação",
    description: "Não foi possível processar. Tente novamente.",
    variant: "destructive",
  });
}
```

## 🔄 Sincronização de Status

### Atualização Automática
- **Webhook Asaas**: Confirmação de pagamento
- **Hook `useSubscription`**: Detecção de mudanças
- **Cache local**: Evita chamadas desnecessárias

### Verificação Manual
- **Botão "Verificar Status"**: Força atualização
- **Recarregamento de página**: Última opção

## 💰 Modelos de Cobrança

### Suportados
- ✅ **Boleto**: Link para download/impressão
- ✅ **PIX**: QR Code e chave
- ✅ **Cartão de Crédito**: Checkout integrado

### Próximas datas de vencimento
- **Imediata**: Mês atual + 1
- **Calculada**: Baseada na data atual
- **Flexível**: Pode ser ajustada conforme necessidade

## 🛠️ Configuração e Testes

### Ambiente de Testes
```bash
# Configurar variáveis
VITE_ASAAS_API_KEY="chave_sandbox"
VITE_ASAAS_ENVIRONMENT="sandbox"
```

### Testes Recomendados
1. ✅ Criar assinatura ativa
2. ✅ Aguardar expiração
3. ✅ Testar botão de renovação
4. ✅ Verificar link gerado
5. ✅ Simular pagamento
6. ✅ Confirmar restauração de acesso

## 📈 Métricas e Analytics

### Dados Coletados
- **Taxa de Renovação**: Percentual de renovações bem-sucedidas
- **Tempo Médio**: Entre bloqueio e renovação
- **Método de Pagamento**: Preferência dos usuários
- **Valor Médio**: Receita por renovação

### Relatórios Disponíveis
- **Dashboard de Renovação**: Visão geral das renovações
- **Análise de Churn**: Padrões de cancelamento
- **Previsão de Receita**: Baseada em renovações

## 🔧 Manutenção

### Limpeza de Dados
```sql
-- Remover assinaturas antigas (opcional)
DELETE FROM user_subscriptions
WHERE status = 'EXPIRED'
AND updated_at < NOW() - INTERVAL '1 year';
```

### Monitoramento
```sql
-- Verificar renovações pendentes
SELECT * FROM user_subscriptions
WHERE status = 'ACTIVE'
AND payment_url IS NOT NULL
AND updated_at > NOW() - INTERVAL '1 hour';
```

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas
- [ ] **Renovação automática**: Cobrança recorrente
- [ ] **Lembretes por email**: Avisos automáticos
- [ ] **Descontos progressivos**: Incentivos para renovação
- [ ] **Múltiplas formas**: Escolha do método de pagamento
- [ ] **Parcelamento**: Opção de dividir o pagamento

### Melhorias Técnicas
- [ ] **Webhook robusto**: Confirmação garantida
- [ ] **Retry automático**: Tentativas de cobrança
- [ ] **Notificações push**: Alertas em tempo real
- [ ] **Analytics avançado**: Machine learning para churn

---

## 📞 Suporte

Para questões sobre renovação:
1. Verificar logs do Asaas
2. Confirmar configuração da API
3. Testar em ambiente sandbox
4. Consultar documentação do Asaas

**🎯 A renovação direta transforma usuários bloqueados em oportunidades de receita, criando um fluxo de cobrança eficiente e automatizado.**