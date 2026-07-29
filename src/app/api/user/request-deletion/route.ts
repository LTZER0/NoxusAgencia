import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { password, captchaToken } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Senha não fornecida.' }, { status: 400 });
    }
    
    if (!captchaToken) {
      return NextResponse.json({ error: 'Validação de segurança pendente (CAPTCHA).' }, { status: 400 });
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

    // 3. Gerar token seguro (UUID v4 do postgres via insert)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    // Inserir na tabela de deleções usando a Service Role para ignorar RLS se necessário,
    // ou apenas com client normal se as regras RLS permitirem insert (não criamos policy de insert!).
    // Vamos usar o client normal, mas precisamos adicionar uma policy de INSERT para o usuário.
    // Ops, a policy que criamos no SQL não incluía INSERT para a tabela account_deletion_requests.
    // Como a API Server Action usa a role authenticated, ela precisa de permissão de INSERT.
    // Vamos usar a chave Service Role aqui para garantir.
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Gerar token manual UUID
    const token = crypto.randomUUID();

    const { error: insertError } = await supabaseAdmin
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Erro ao criar requisição de exclusão.' }, { status: 500 });
    }

    // 4. Enviar E-mail via Resend
    // Nota: Estamos usando o onboarding@resend.dev para enviar, 
    // mas o Resend de teste SÓ permite enviar para o mesmo e-mail cadastrado na conta do Resend.
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/confirm-deletion?token=${token}`;

    const { error: emailError } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: user.email!,
      subject: 'Confirmação de Exclusão de Conta - LocalizaSaaS',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Exclusão de Conta Solicitada</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para excluir definitivamente a sua conta no LocalizaSaaS. Se você confirmar esta ação, todos os seus dados, produtos e histórico de pedidos serão permanentemente apagados.</p>
          <p>Para confirmar a exclusão, clique no botão abaixo:</p>
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Confirmar Exclusão de Conta</a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou a exclusão, apenas ignore este e-mail.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Erro ao enviar e-mail de confirmação.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Request deletion error:', error);
    return NextResponse.json({ error: 'Erro interno: ' + (error.message || String(error)) }, { status: 500 });
  }
}
