-- Migração para adicionar controle de assinaturas e trial na tabela stores

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false;
