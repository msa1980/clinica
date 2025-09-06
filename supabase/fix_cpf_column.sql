-- Script para corrigir o erro: column "cpf" does not exist
-- Execute este script no Supabase Dashboard > SQL Editor

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