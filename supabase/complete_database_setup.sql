-- Complete Database Setup Script
-- Execute this script in the Supabase SQL Editor to create all necessary tables

-- 1. Create patients table first (referenced by monthly_fees)
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  cpf VARCHAR(14),
  birth_date DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create monthly_fees table
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

-- 3. Create user_subscriptions table (the missing table causing the error)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_fee_id UUID NOT NULL REFERENCES monthly_fees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED')),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One active subscription per user
);

-- Create indexes for better performance
-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Monthly fees indexes
CREATE INDEX IF NOT EXISTS idx_monthly_fees_patient_id ON monthly_fees(patient_id);
CREATE INDEX IF NOT EXISTS idx_monthly_fees_status ON monthly_fees(status);
CREATE INDEX IF NOT EXISTS idx_monthly_fees_next_due_date ON monthly_fees(next_due_date);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_monthly_fee_id ON user_subscriptions(monthly_fee_id);

-- Enable RLS (Row Level Security) for all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can access patients" ON patients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can access monthly fees" ON monthly_fees
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can access their own subscriptions" ON user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_fees_updated_at
  BEFORE UPDATE ON monthly_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- Uncomment the lines below if you want to add test data

/*
-- Sample patient
INSERT INTO patients (name, email, phone, cpf) 
VALUES ('João Silva', 'joao@email.com', '(11) 99999-9999', '123.456.789-00')
ON CONFLICT DO NOTHING;

-- Sample monthly fee
INSERT INTO monthly_fees (patient_id, value, description, billing_type, cycle, next_due_date)
SELECT p.id, 150.00, 'Plano Básico', 'CREDIT_CARD', 'MONTHLY', CURRENT_DATE + INTERVAL '1 month'
FROM patients p WHERE p.email = 'joao@email.com'
ON CONFLICT DO NOTHING;
*/