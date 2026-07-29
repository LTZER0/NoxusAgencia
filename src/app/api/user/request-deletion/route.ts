import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { password, captchaToken, confirmText } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Senha não fornecida.' }, { status: 400 });
    }

    if (!captchaToken) {
      return NextResponse.json({ error: 'Validação de segurança pendente (CAPTCHA).' }, { status: 400 });
    }

    if (confirmText !== 'EXCLUIR') {
      return NextResponse.json({ error: 'Você precisa digitar a palavra EXCLUIR para confirmar.' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Obter usuário atual logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    // 2. Verificar a senha tentando fazer um login (verificação re-auth)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
      options: {
        captchaToken,
      }
    });

    if (signInError) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 403 });
    }

    // 3. Cliente Admin (Service Role) para deletar os dados do banco e autenticação
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Registrar Log de Auditoria antes de apagar
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action_type: 'ACCOUNT_HARD_DELETE_DIRECT',
        metadata: { email: user.email }
      });

    // 5. Excluir o usuário definitivamente (Hard Delete)
    // Devido ao ON DELETE CASCADE no banco, apaga loja, categorias, produtos e pedidos instantaneamente.
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Error deleting user from Auth:', deleteUserError);
      return NextResponse.json({ error: 'Erro ao deletar usuário do sistema.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Request deletion error:', error);
    return NextResponse.json({ error: 'Erro interno: ' + (error.message || String(error)) }, { status: 500 });
  }
}
