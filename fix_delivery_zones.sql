DROP POLICY IF EXISTS "Gestão de visualização de zonas de entrega" ON delivery_zones;
CREATE POLICY "Gestão de visualização de zonas de entrega" ON delivery_zones
    FOR SELECT USING (true);
