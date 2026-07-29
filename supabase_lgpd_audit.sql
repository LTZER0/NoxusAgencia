-- Tabela para guardar LOGS DE AUDITORIA (Exclusão, alteração de configurações)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Sem CASCADE DELETE para preservar o log caso o usuário seja deletado
    action_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para gerenciar SOLICITAÇÕES DE DELEÇÃO DE CONTA (Processo 2-steps)
CREATE TABLE account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Segurança)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Regras para audit_logs
CREATE POLICY "Admins can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Users can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Regras para account_deletion_requests
CREATE POLICY "Users can view own deletion requests"
    ON account_deletion_requests
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all deletion requests"
    ON account_deletion_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
