-- Migration: Add Major Features (Store Status, Operating Hours, Product Promotions & Discounts)

-- 1. Update stores table: add open/closed toggle and operating hours
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS opening_hours TEXT DEFAULT '08:00 às 23:00';

-- 2. Update products_services table: add discount price and promotional flag
ALTER TABLE products_services
ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_promotional BOOLEAN DEFAULT false;
