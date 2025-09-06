-- Create monthly_fees table
CREATE TABLE IF NOT EXISTS monthly_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  value DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  billing_type TEXT NOT NULL CHECK (billing_type IN ('BOLETO', 'CREDIT_CARD', 'PIX', 'UNDEFINED')),
  cycle TEXT NOT NULL CHECK (cycle IN ('MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED')),
  asaas_subscription_id TEXT,
  asaas_customer_id TEXT,
  next_due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_fees_patient_id ON monthly_fees(patient_id);
CREATE INDEX IF NOT EXISTS idx_monthly_fees_status ON monthly_fees(status);
CREATE INDEX IF NOT EXISTS idx_monthly_fees_next_due_date ON monthly_fees(next_due_date);

-- Enable RLS (Row Level Security)
ALTER TABLE monthly_fees ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access their clinic's data
CREATE POLICY "Users can access monthly fees for their clinic" ON monthly_fees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = monthly_fees.patient_id
      AND p.clinic_id IN (
        SELECT clinic_id FROM user_clinic_access WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_monthly_fees_updated_at
  BEFORE UPDATE ON monthly_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();