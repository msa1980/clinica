# 🔧 Correção do Erro 406 - Tabela user_subscriptions

## ❌ Problema Identificado

O erro `406 (Not Acceptable)` nas consultas do Supabase indica que a tabela `user_subscriptions` não existe no banco de dados.

## ✅ Solução Imediata

### Passo 1: Acesse o Supabase Dashboard

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto **mfjbiegkkjdswvujscdq**

### Passo 2: Abra o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Execute o Script de Criação

Copie e cole o seguinte script SQL no editor:

```sql
-- Criar tabela user_subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_fee_id UUID NOT NULL REFERENCES monthly_fees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED')),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Uma assinatura ativa por usuário
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_monthly_fee_id ON user_subscriptions(monthly_fee_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários acessarem apenas suas próprias assinaturas (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_subscriptions' 
    AND policyname = 'Users can access their own subscriptions'
  ) THEN
    CREATE POLICY "Users can access their own subscriptions" ON user_subscriptions
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_subscriptions_updated_at' 
        AND event_object_table = 'user_subscriptions'
    ) THEN
        CREATE TRIGGER update_user_subscriptions_updated_at
            BEFORE UPDATE ON user_subscriptions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

### Passo 4: Executar o Script

1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde a execução completar
3. Você deve ver uma mensagem de sucesso

### Passo 5: Verificar se a Tabela foi Criada

Execute esta query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_subscriptions';
```

Você deve ver `user_subscriptions` listada no resultado.

## 🎯 Resultado Esperado

Após executar o script:

- ✅ Tabela `user_subscriptions` criada
- ✅ Índices criados para performance
- ✅ Políticas RLS configuradas
- ✅ Triggers para updated_at configurados
- ✅ Erro 406 corrigido
- ✅ Sistema de assinaturas funcionando

## 🚀 Teste a Correção

1. Volte para a aplicação (http://localhost:8084/)
2. Recarregue a página (F5)
3. Os erros 406 devem desaparecer
4. O sistema deve funcionar normalmente

## 📝 Notas Importantes

- O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar múltiplas vezes
- As políticas RLS garantem que usuários só acessem seus próprios dados
- Os índices melhoram a performance das consultas
- O trigger mantém o campo `updated_at` sempre atualizado

## 🆘 Se o Problema Persistir

Se após executar o script o erro continuar:

1. Verifique se você executou o script no projeto correto
2. Confirme se as variáveis de ambiente estão corretas no arquivo `.env`
3. Recarregue completamente a aplicação (Ctrl+F5)
4. Verifique o console do navegador para outros erros

---

**⚠️ IMPORTANTE**: Execute este script o mais rápido possível para corrigir os erros 406 e permitir que o sistema funcione corretamente.