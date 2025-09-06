-- Create patients table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Enable RLS (Row Level Security)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access patients
CREATE POLICY "Users can access patients" ON patients
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();