CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    neighborhood_name TEXT NOT NULL,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestão de visualização de zonas de entrega" ON delivery_zones
    FOR SELECT
    USING (true);

CREATE POLICY "Gestão de inserção de zonas de entrega" ON delivery_zones
    FOR INSERT
    WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Gestão de atualização de zonas de entrega" ON delivery_zones
    FOR UPDATE
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "Gestão de exclusão de zonas de entrega" ON delivery_zones
    FOR DELETE
    USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));
