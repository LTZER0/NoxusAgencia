import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token inválido ou ausente.' }, { status: 400 });
    }

    // Instancia o cliente admin (Service Role) para conseguir ignorar RLS na tabela de tokens e deletar usuário
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Validar o token
    const { data: requestRecord, error: fetchError } = await supabaseAdmin
      .from('account_deletion_requests')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (fetchError || !requestRecord) {
      return NextResponse.json({ error: 'Token inválido, já utilizado ou expirado.' }, { status: 400 });
    }

    // 2. Verificar expiração
    if (new Date(requestRecord.expires_at) < new Date()) {
      // Atualizar para expirado
      await supabaseAdmin.from('account_deletion_requests').update({ status: 'expired' }).eq('id', requestRecord.id);
      return NextResponse.json({ error: 'O link de confirmação expirou. Solicite novamente.' }, { status: 400 });
    }

    const userId = requestRecord.user_id;

    // 3. Registrar Log de Auditoria
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action_type: 'ACCOUNT_HARD_DELETE',
        metadata: { source: 'email_confirmation' }
      });

    // 4. Marcar token como concluído
    await supabaseAdmin
      .from('account_deletion_requests')
      .update({ status: 'completed' })
      .eq('id', requestRecord.id);

    // 5. Excluir o usuário definitivamente (Hard Delete)
    // Devido ao "ON DELETE CASCADE" nas tabelas do banco associadas ao auth.users(id),
    // ao deletar o usuário via Admin Auth API, a store, categorias, produtos e pedidos serão deletados instantaneamente.
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting user from Auth:', deleteUserError);
      return NextResponse.json({ error: 'Erro ao deletar usuário do sistema de autenticação.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Execute deletion error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
