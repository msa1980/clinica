# Solução para o Erro: column "cpf" does not exist

## Problema
O erro `ERROR: 42703: column "cpf" does not exist` ocorre porque o código da aplicação está tentando usar a coluna `cpf` na tabela `patients`, mas essa coluna não existe no banco de dados atual.

## Causa
A tabela `patients` foi criada sem a coluna `cpf`, mas o código da aplicação (especialmente em `PatientManagementTab.tsx` e `NewPatientModal.tsx`) espera que essa coluna exista.

## Solução

### Opção 1: Executar via Supabase Dashboard (Recomendado)
1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor**
3. Execute o script `supabase/fix_cpf_column.sql`:

```sql
-- Adicionar coluna CPF à tabela patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);

-- Verificar se a coluna foi criada com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name = 'cpf';
```

### Opção 2: Via Migração (Se o Supabase CLI estiver instalado)
```bash
supabase db push
```

## Verificação
Após executar o script, você deve ver:
- A coluna `cpf` listada na consulta de verificação
- O erro não deve mais aparecer na aplicação
- Os formulários de pacientes devem funcionar normalmente

## Arquivos Afetados
- `src/components/PatientManagementTab.tsx` - Usa campo CPF
- `src/components/NewPatientModal.tsx` - Formulário com CPF
- `supabase/migrations/003_add_cpf_to_patients.sql` - Migração criada
- `supabase/fix_cpf_column.sql` - Script de correção rápida

## Próximos Passos
1. Execute o script SQL no Supabase Dashboard
2. Recarregue a aplicação
3. Teste o cadastro e edição de pacientes
4. Verifique se o erro não aparece mais

## Notas Importantes
- A coluna `cpf` aceita valores NULL inicialmente
- O formato esperado é VARCHAR(14) para suportar "000.000.000-00"
- Um índice foi criado para melhor performance nas consultas por CPF