-- 1. Update stores table
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS store_category TEXT CHECK (store_category IN ('pizzaria', 'hamburgueria', 'lanchonete', 'acaiteria'));

-- 2. Update products_services table
ALTER TABLE products_services
ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb;

-- 3. Update appointments_orders table
ALTER TABLE appointments_orders
ADD COLUMN IF NOT EXISTS customer_cpf TEXT,
ADD COLUMN IF NOT EXISTS order_type TEXT CHECK (order_type IN ('delivery', 'retirada_comer', 'retirada_levar')),
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- 4. Update stores table for status and hours
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS opening_hours TEXT DEFAULT '08:00 às 23:00';

-- 5. Update products_services for promotional pricing
ALTER TABLE products_services
ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_promotional BOOLEAN DEFAULT false;
