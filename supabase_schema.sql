-- Step 1: Database Schema (Supabase SQL)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. stores
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    logo_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_categories_store_id ON categories(store_id);

-- 3. products_services
CREATE TABLE products_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_service BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_products_services_store_id ON products_services(store_id);

-- 4. appointments_orders
CREATE TABLE appointments_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products_services(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_whatsapp TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
    dynamic_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX idx_appointments_orders_store_id ON appointments_orders(store_id);

-- --------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments_orders ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON stores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments_orders TO authenticated;

-- Policies for stores
CREATE POLICY "Store owners can manage their own stores"
    ON stores
    FOR ALL
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Stores are publicly viewable"
    ON stores
    FOR SELECT
    TO public
    USING (active = true);

-- Policies for categories
CREATE POLICY "Store owners can manage their own categories"
    ON categories
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Categories are publicly viewable"
    ON categories
    FOR SELECT
    TO public
    USING (true);

-- Policies for products_services
CREATE POLICY "Store owners can manage their own products/services"
    ON products_services
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Products and services are publicly viewable"
    ON products_services
    FOR SELECT
    TO public
    USING (true);

-- Policies for appointments_orders
CREATE POLICY "Store owners can manage their own appointments/orders"
    ON appointments_orders
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Public can insert appointments/orders"
    ON appointments_orders
    FOR INSERT
    TO public
    WITH CHECK (true);
