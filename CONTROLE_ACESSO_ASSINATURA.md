# 🔐 Sistema de Controle de Acesso por Assinatura

## Visão Geral

O sistema implementa um controle de acesso robusto baseado no status da mensalidade, garantindo que apenas usuários com assinaturas ativas possam acessar o painel administrativo.

## 🏗️ Arquitetura do Sistema

### Componentes Principais

#### 1. **Hook `useSubscription`**
- **Localização**: `src/hooks/useSubscription.ts`
- **Função**: Verifica o status da assinatura do usuário atual
- **Recursos**:
  - ✅ Verificação automática de validade
  - ✅ Sincronização com Asaas
  - ✅ Cache local de status
  - ✅ Detecção automática de expiração

#### 2. **Componente `SubscriptionRequired`**
- **Localização**: `src/components/SubscriptionRequired.tsx`
- **Função**: Tela de bloqueio para usuários sem acesso
- **Recursos**:
  - ✅ Interface amigável
  - ✅ Detalhes da última assinatura
  - ✅ **Botão de renovação direta**
  - ✅ **Geração automática de link de pagamento**
  - ✅ **Integração com Asaas para cobrança**
  - ✅ Instruções para renovação
  - ✅ Opções de logout

#### 3. **ProtectedRoute Atualizado**
- **Localização**: `src/components/ProtectedRoute.tsx`
- **Função**: Controle de acesso nas rotas protegidas
- **Fluxo**:
  1. Verifica autenticação
  2. Verifica status da assinatura
  3. Permite ou bloqueia acesso

#### 4. **Dashboard com Avisos**
- **Localização**: `src/pages/Dashboard.tsx`
- **Função**: Notificações sobre status da assinatura
- **Recursos**:
  - ✅ Avisos de vencimento próximo
  - ✅ Detalhes da mensalidade atual
  - ✅ Links para renovação

## 🗄️ Estrutura do Banco de Dados

### Tabela `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  monthly_fee_id UUID REFERENCES monthly_fees(id),
  status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED')),
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id) -- Uma assinatura ativa por usuário
);
```

### Relacionamentos
- **user_subscriptions** → **auth.users**: Usuário do sistema
- **user_subscriptions** → **monthly_fees**: Detalhes da mensalidade
- **monthly_fees** → **patients**: Paciente associado (opcional)

## 🔄 Fluxo de Funcionamento

### 1. **Criação de Mensalidade**
```
Usuário cria mensalidade no MonthlyFeeTab
    ↓
Sistema cria registro em monthly_fees
    ↓
Sistema associa automaticamente em user_subscriptions
    ↓
Usuário ganha acesso ao painel
```

### 2. **Verificação de Acesso**
```
Usuário tenta acessar /dashboard
    ↓
ProtectedRoute verifica autenticação
    ↓
useSubscription verifica status da assinatura
    ↓
Se válida → Acesso permitido
Se expirada → Tela de bloqueio
```

### 3. **Renovação de Assinatura**
```
Usuário clica "Renovar Assinatura"
    ↓
Sistema cria nova assinatura no Asaas
    ↓
Link de pagamento é gerado
    ↓
Usuário efetua pagamento
    ↓
Pagamento confirmado no Asaas
    ↓
Webhook atualiza status no Asaas
    ↓
useSubscription detecta mudança
    ↓
Acesso é restaurado automaticamente
```

## ⚙️ Configuração e Funcionamento

### Verificação Automática
- ✅ **Tempo real**: Status verificado a cada acesso
- ✅ **Cache inteligente**: Evita chamadas desnecessárias
- ✅ **Sincronização Asaas**: Status sempre atualizado
- ✅ **Detecção de expiração**: Assinaturas vencidas são marcadas automaticamente

### Estados da Assinatura
- **ACTIVE**: Assinatura válida, acesso liberado
- **INACTIVE**: Assinatura pausada, acesso bloqueado
- **CANCELLED**: Assinatura cancelada, acesso bloqueado
- **EXPIRED**: Assinatura vencida, acesso bloqueado

### Avisos no Dashboard
- ✅ **Vencimento próximo**: Avisos 7 dias antes
- ✅ **Detalhes da cobrança**: Valor e data de vencimento
- ✅ **Status visual**: Badges coloridos por status
- ✅ **Links de ação**: Acesso rápido à renovação

## 🔧 Manutenção e Monitoramento

### Logs de Acesso
```sql
-- Verificar tentativas de acesso bloqueadas
SELECT * FROM user_subscriptions
WHERE status != 'ACTIVE'
ORDER BY updated_at DESC;
```

### Sincronização Manual
```typescript
// Forçar atualização do status
const { refreshSubscription } = useSubscription(user);
refreshSubscription();
```

### Monitoramento de Expirações
```sql
-- Assinaturas que expiram nos próximos 7 dias
SELECT * FROM user_subscriptions us
JOIN monthly_fees mf ON us.monthly_fee_id = mf.id
WHERE us.status = 'ACTIVE'
AND mf.next_due_date <= NOW() + INTERVAL '7 days';
```

## 🛠️ Solução de Problemas

### Problema: "Acesso bloqueado indevidamente"
**Solução**:
1. Verificar status no Asaas
2. Executar sincronização manual
3. Verificar data de expiração
4. Checar configuração do webhook

### Problema: "Avisos não aparecem"
**Solução**:
1. Confirmar que há assinatura ativa
2. Verificar conexão com Supabase
3. Limpar cache do navegador
4. Checar logs do console

### Problema: "Assinatura não associada"
**Solução**:
1. Verificar se usuário está logado
2. Confirmar criação da mensalidade
3. Checar tabela user_subscriptions
4. Executar associação manual se necessário

## 📊 Relatórios e Analytics

### Métricas Disponíveis
- ✅ **Taxa de renovação**: Percentual de renovações
- ✅ **Tempo médio de assinatura**: Duração típica
- ✅ **Bloqueios por expiração**: Tentativas bloqueadas
- ✅ **Receita recorrente**: MRR (Monthly Recurring Revenue)

### Dashboards de Monitoramento
- **Painel de Assinaturas**: Visão geral do status
- **Relatório de Expirações**: Assinaturas próximas do vencimento
- **Análise de Churn**: Taxa de cancelamento
- **Previsão de Receita**: Projeções baseadas em renovações

## 🔒 Segurança

### Proteções Implementadas
- ✅ **Row Level Security**: Usuários só acessam suas próprias assinaturas
- ✅ **Autenticação obrigatória**: Acesso apenas para usuários logados
- ✅ **Validação de datas**: Prevenção de manipulação de vencimentos
- ✅ **Logs de auditoria**: Rastreamento de mudanças de status

### Prevenção de Fraudes
- ✅ **Verificação Asaas**: Status sempre confirmado com gateway
- ✅ **Single subscription**: Apenas uma assinatura ativa por usuário
- ✅ **Webhook validation**: Confirmação de pagamentos legítimos
- ✅ **Rate limiting**: Proteção contra tentativas excessivas

## 🚀 Próximas Melhorias

### Funcionalidades Planejadas
- [ ] **Notificações por email**: Avisos automáticos de vencimento
- [ ] **Renovação automática**: Cobrança recorrente sem intervenção
- [ ] **Planos múltiplos**: Diferentes níveis de acesso
- [ ] **Trial period**: Período de teste gratuito
- [ ] **Cupons de desconto**: Sistema de promoções
- [ ] **Relatórios avançados**: Analytics detalhados

### Melhorias Técnicas
- [ ] **Cache Redis**: Performance para alto volume
- [ ] **Webhook retry**: Robustez na sincronização
- [ ] **Multi-tenant**: Suporte a múltiplas clínicas
- [ ] **API rate limiting**: Proteção contra abuso
- [ ] **Backup automático**: Recuperação de dados

---

## 📞 Suporte

Para questões sobre o sistema de controle de acesso:
1. Verifique os logs da aplicação
2. Consulte a documentação do Asaas
3. Entre em contato com o time de desenvolvimento
4. Use os scripts de diagnóstico disponíveis

**🎯 O sistema garante que apenas usuários com mensalidades ativas tenham acesso ao painel administrativo, criando um modelo de negócio sustentável baseado em assinaturas.**