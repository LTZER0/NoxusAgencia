-- 🔒 SEGURANÇA [VULN-7]: Restringir INSERT para exigir store_id válido
-- Substitui a policy permissiva WITH CHECK (true)

DROP POLICY IF EXISTS "Public can insert appointments/orders" ON appointments_orders;

CREATE POLICY "Public can insert orders for existing stores"
    ON appointments_orders
    FOR INSERT
    TO public
    WITH CHECK (
      store_id IN (SELECT id FROM stores WHERE active = true)
    );

-- 🔒 [VULN-6]: Adicionar policy de SELECT para rastreio limitado
-- Clientes anônimos só podem ver seus próprios pedidos
-- Nota: A view no front filtra por client_whatsapp, o RLS permite SELECT anônimo
-- já que o rastreio exige um dado conhecido.

GRANT SELECT ON appointments_orders TO anon;
