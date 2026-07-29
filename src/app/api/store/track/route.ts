import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 🔒 SEGURANÇA: Sanitização explícita
    const storeId = sanitizeString(body.storeId, 100);
    // Remove tudo que não for número do identificador (CPF ou WhatsApp)
    const identifier = sanitizeString(body.identifier, 20).replace(/[^0-9]/g, '');

    if (!isValidUUID(storeId)) {
      return NextResponse.json({ error: 'Loja inválida.' }, { status: 400 });
    }

    if (!identifier || identifier.length < 8) {
      return NextResponse.json({ error: 'Identificador muito curto ou inválido.' }, { status: 400 });
    }

    // 🔒 SEGURANÇA: Para buscar os pedidos ignorando o RLS com segurança, precisamos usar a Service Role Key.
    // Esta rota só é executada no servidor, então a chave secreta nunca vaza para o frontend.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local');
      return NextResponse.json({ error: 'Erro de configuração do servidor.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // 🔒 SEGURANÇA: Consulta blindada sem expor a tabela toda
    const { data: orders, error } = await supabaseAdmin
      .from('appointments_orders')
      .select('*')
      .eq('store_id', storeId)
      .or(`client_whatsapp.eq.${identifier},customer_cpf.eq.${identifier}`)
      .order('created_at', { ascending: false })
      .limit(20); // Impede retorno infinito se houver abuso

    if (error) {
      throw error;
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Erro no rastreio:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar pedidos.' }, { status: 500 });
  }
}
