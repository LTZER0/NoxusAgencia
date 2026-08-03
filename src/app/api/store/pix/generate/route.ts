import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { storeId, amount, customerName, customerEmail } = body;

    if (!storeId || !amount) {
      return NextResponse.json({ error: 'Faltam parâmetros obrigatórios.' }, { status: 400 });
    }

    // Buscar o token do Mercado Pago da loja
    const { data: store, error } = await supabase
      .from('stores')
      .select('mp_access_token')
      .eq('id', storeId)
      .single();

    if (error || !store || !store.mp_access_token) {
      return NextResponse.json({ error: 'Loja não configurada para Pix Automático.' }, { status: 400 });
    }

    // Gerar idempotency key para evitar pagamentos duplicados
    const idempotencyKey = crypto.randomUUID();

    // Chamada para a API do Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${store.mp_access_token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        payment_method_id: 'pix',
        description: `Pedido ${new Date().getTime()}`,
        payer: {
          email: customerEmail || 'cliente@noxus.com',
          first_name: customerName || 'Cliente',
        }
      })
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Erro Mercado Pago:', mpData);
      return NextResponse.json({ error: 'Erro ao gerar Pix no Mercado Pago.' }, { status: 500 });
    }

    const transactionData = mpData.point_of_interaction?.transaction_data;
    
    if (!transactionData) {
      return NextResponse.json({ error: 'Retorno inválido do Mercado Pago.' }, { status: 500 });
    }

    return NextResponse.json({
      qr_code: transactionData.qr_code,
      qr_code_base64: transactionData.qr_code_base64,
      payment_id: mpData.id,
    });

  } catch (error) {
    console.error('Erro na rota de geração de Pix:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
