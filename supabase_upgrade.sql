-- 1. Update stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS store_category TEXT,
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'branco' CHECK (theme_mode IN ('branco', 'preto'));

ALTER TABLE stores DROP CONSTRAINT IF EXISTS stores_store_category_check;
ALTER TABLE stores ADD CONSTRAINT stores_store_category_check CHECK (store_category IN ('restaurante', 'hamburgueria', 'pizzaria', 'acaiteria', 'lanchonete'));

-- 2. Update products_services table
ALTER TABLE products_services
ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb;

-- 3. Update appointments_orders table
ALTER TABLE appointments_orders
ADD COLUMN IF NOT EXISTS customer_cpf TEXT,
ADD COLUMN IF NOT EXISTS order_type TEXT CHECK (order_type IN ('delivery', 'retirada_comer', 'retirada_levar')),
ADD COLUMN IF NOT EXISTS payment_method TEXT;
