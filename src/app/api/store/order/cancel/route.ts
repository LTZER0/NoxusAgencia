import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storeId = body.storeId;
    const orderId = body.orderId;
    const identifierRaw = body.phone;

    if (!storeId || !orderId || !identifierRaw) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const identifier = sanitizeString(identifierRaw, 20).replace(/[^0-9]/g, '');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local');
      return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Verify if the order belongs to this store and client phone or cpf
    const { data: order, error: orderError } = await supabaseAdmin
      .from('appointments_orders')
      .select('id, status, client_whatsapp, customer_cpf')
      .eq('id', orderId)
      .eq('store_id', storeId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const orderPhoneRaw = sanitizeString(order.client_whatsapp, 20).replace(/[^0-9]/g, '');
    const orderCpfRaw = sanitizeString(order.customer_cpf, 20).replace(/[^0-9]/g, '');

    if (orderPhoneRaw !== identifier && orderCpfRaw !== identifier) {
      return NextResponse.json(
        { error: 'Não autorizado a cancelar este pedido' },
        { status: 403 }
      );
    }

    // Only allow canceling if pending or confirmed
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Este pedido não pode mais ser cancelado' },
        { status: 400 }
      );
    }

    // Update status to cancellation_requested
    const { error: updateError } = await supabaseAdmin
      .from('appointments_orders')
      .update({ status: 'cancellation_requested' })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao cancelar pedido:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
