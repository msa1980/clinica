-- Migration: Add CPF column to patients table
-- This fixes the error: column "cpf" does not exist

-- Add CPF column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

-- Create index for CPF column for better performance
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);

-- Add comment to the column
COMMENT ON COLUMN patients.cpf IS 'CPF do paciente (formato: 000.000.000-00)';

-- Update RLS policy to include CPF in allowed columns (if needed)
-- The existing RLS policies should automatically include the new column

COMMIT;