# 📋 Manual de Configuração - Sistema de Pagamentos Asaas

## Visão Geral

Este manual descreve como configurar o sistema de pagamentos integrado com o Asaas para o módulo de mensalidades do sistema administrativo da clínica.

## 📋 Pré-requisitos

- Conta ativa no [Asaas](https://www.asaas.com/)
- Acesso ao painel administrativo do Supabase
- Node.js e npm instalados
- Projeto Clinic-on-Cloud configurado

---

## 🔧 Passo 1: Configuração da Conta Asaas

### 1.1 Criar Conta no Asaas
1. Acesse [https://www.asaas.com/](https://www.asaas.com/)
2. Clique em "Criar Conta"
3. Preencha os dados da sua empresa/clínica
4. Complete a verificação de identidade
5. Aguarde a aprovação da conta

### 1.2 Obter Chave API
1. Faça login no painel do Asaas
2. Vá para **Configurações** > **Integração**
3. Na seção **Chaves de API**, clique em **Gerar Nova Chave**
4. **IMPORTANTE**: Copie a chave imediatamente (ela não será mostrada novamente)
5. Escolha o ambiente:
   - **Sandbox**: Para testes
   - **Produção**: Para uso real

### 1.3 Configurar Webhooks (Opcional)
Para notificações automáticas de pagamentos:
1. Vá para **Configurações** > **Integração** > **Webhooks**
2. Clique em **Novo Webhook**
3. Configure:
   - **URL**: `https://seusite.com/api/webhooks/asaas`
   - **Eventos**: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `SUBSCRIPTION_CANCELED`
4. Salve as configurações

---

## 🔧 Passo 2: Configuração do Ambiente

### 2.1 Arquivo .env
Edite o arquivo `.env` na raiz do projeto:

```env
# Configurações do Supabase (já existentes)
VITE_SUPABASE_PROJECT_ID="mfjbiegkkjdswvujscdq"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://mfjbiegkkjdswvujscdq.supabase.co"

# NOVAS CONFIGURAÇÕES - ASAAS
VITE_ASAAS_API_KEY="your_asaas_api_key_here"
VITE_ASAAS_ENVIRONMENT="sandbox"
```

**⚠️ ATENÇÃO:**
- Substitua `your_asaas_api_key_here` pela chave real obtida no Asaas
- Use `"sandbox"` para testes e `"production"` para produção
- Nunca commite este arquivo no Git (já está no .gitignore)

### 2.2 Verificar Dependências
Execute no terminal:
```bash
npm install axios
```

---

## 🔧 Passo 3: Configuração do Banco de Dados

### 3.1 Executar Migração

#### Opção 1: Via Supabase CLI (Recomendado)
1. Instale o Supabase CLI:
```bash
npm install -g supabase
```

2. Vincule o projeto:
```bash
npx supabase link --project-ref mfjbiegkkjdswvujscdq
```

3. Execute a migração:
```bash
npx supabase db push
```

#### Opção 2: Via Painel Supabase (Alternativa)
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Copie e execute o conteúdo do arquivo `supabase/migrations/monthly_fees_setup.sql`

**Nota**: A migração foi corrigida para usar uma política RLS simples baseada apenas na autenticação do usuário.

### 3.2 Verificar Tabela Criada
Acesse o painel do Supabase e confirme que a tabela `monthly_fees` foi criada com as seguintes colunas:
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key)
- `value` (Decimal)
- `description` (Text)
- `billing_type` (Text)
- `cycle` (Text)
- `status` (Text)
- `asaas_subscription_id` (Text)
- `asaas_customer_id` (Text)
- `next_due_date` (Date)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

---

## 🔧 Passo 4: Configuração de Segurança

### 4.1 Políticas RLS (Row Level Security)
As políticas já estão configuradas no arquivo de migração. Elas garantem que:
- Usuários só acessam mensalidades da sua clínica
- Dados são protegidos por autenticação

### 4.2 Variáveis de Ambiente
Certifique-se de que:
- O arquivo `.env` não está no controle de versão
- As chaves API estão protegidas
- O ambiente de produção usa chaves de produção

---

## 🔧 Passo 5: Testes e Validação

### 5.1 Executar o Sistema
```bash
npm run dev
```

### 5.2 Testar Funcionalidades
1. **Acesse o Dashboard**
   - Vá para http://localhost:8082
   - Faça login no sistema

2. **Teste a Aba Mensalidades**
   - Clique na aba "Mensalidades"
   - Verifique se a interface carrega corretamente

3. **Teste Criação de Mensalidade**
   - Clique em "Nova Mensalidade"
   - Preencha os campos obrigatórios
   - Selecione um paciente existente
   - Configure valor, ciclo e forma de pagamento
   - Clique em "Criar Mensalidade"

4. **Verificar Integração Asaas**
   - Acesse o painel do Asaas
   - Vá para **Assinaturas**
   - Confirme que a assinatura foi criada

### 5.3 Testar Sincronização
- Na lista de mensalidades, clique no ícone de refresh (🔄)
- Verifique se o status é atualizado com o Asaas

---

## 🔧 Passo 6: Configuração de Produção

### 6.1 Mudar para Produção
Quando estiver pronto para produção:

1. **Atualize o .env**:
```env
VITE_ASAAS_API_KEY="sua_chave_de_producao"
VITE_ASAAS_ENVIRONMENT="production"
```

2. **Rebuild da aplicação**:
```bash
npm run build
```

3. **Deploy**:
```bash
npm run preview
```

### 6.2 Configurar Webhooks de Produção
1. No painel Asaas, configure webhooks para o domínio de produção
2. Atualize a URL do webhook para o endereço real da aplicação

---

## 🐛 Solução de Problemas

### Problema: "Cannot find module 'axios'"
**Solução**: Execute `npm install axios`

### Problema: "Erro ao criar mensalidade"
**Possíveis causas**:
- Chave API Asaas inválida
- Conta Asaas não aprovada
- Paciente não encontrado no banco

### Problema: "Erro na integração com Asaas"
**Verificações**:
- Verificar se a chave API está correta
- Confirmar ambiente (sandbox/production)
- Verificar status da conta Asaas

### Problema: "Tabela monthly_fees não encontrada"
**Solução**: Execute `npx supabase db push` novamente ou use o SQL Editor do Supabase

### Problema: "relation 'user_clinic_access' does not exist"
**Solução**: Este erro foi corrigido na migração atualizada. Use a versão mais recente do arquivo `supabase/migrations/001_create_monthly_fees.sql` que usa uma política RLS simplificada.

### Problema: "Cannot find project ref. Have you run supabase link?"
**Solução**:
1. Instale o Supabase CLI: `npm install -g supabase`
2. Vincule o projeto: `npx supabase link --project-ref mfjbiegkkjdswvujscdq`
3. Execute novamente: `npx supabase db push`

---

## 📞 Suporte

Para suporte técnico:
1. Verifique os logs do console do navegador (F12)
2. Confirme as configurações no arquivo `.env`
3. Teste a API do Asaas diretamente via Postman
4. Consulte a [documentação do Asaas](https://docs.asaas.com/)

---

## ✅ Checklist de Configuração

- [ ] Conta Asaas criada e aprovada
- [ ] Chave API obtida
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install axios`)
- [ ] **Migração do banco executada** (arquivo corrigido sem erro `user_clinic_access`)
- [ ] Sistema testado localmente
- [ ] Configuração de produção realizada
- [ ] Webhooks configurados (opcional)
- [ ] **Controle de acesso por assinatura habilitado**
- [ ] **Bloqueio automático configurado**
- [ ] **Avisos no dashboard ativados**
- [ ] **Botão de renovação na tela de bloqueio**
- [ ] **Geração automática de links de pagamento**

**Nota**: O erro `user_clinic_access` foi corrigido na migração atualizada.

### 6.4 Renovação Direta de Assinaturas
A tela de bloqueio agora inclui um botão para renovação imediata:

- ✅ **Botão "Renovar Assinatura Agora"**: Gera link de pagamento automaticamente
- ✅ **Integração Asaas**: Cria nova cobrança sem intervenção manual
- ✅ **Link de pagamento**: Abre checkout do Asaas em nova aba
- ✅ **Restauração automática**: Acesso liberado após confirmação do pagamento
- ✅ **Fallback gracioso**: Sistema funciona mesmo sem webhooks configurados

### 6.3 Controle de Acesso por Assinatura
O sistema agora inclui controle de acesso baseado no status da mensalidade:

- ✅ **Bloqueio automático**: Usuários com assinatura expirada são impedidos de acessar o dashboard
- ✅ **Tela de bloqueio**: Interface amigável informando sobre assinatura expirada
- ✅ **Avisos no dashboard**: Notificações sobre vencimento próximo
- ✅ **Associação automática**: Quando uma mensalidade é criada, ela é automaticamente associada ao usuário atual

**🎉 Configuração concluída! O sistema de pagamentos está pronto para uso.**