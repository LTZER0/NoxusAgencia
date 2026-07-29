import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { storeId, orderId, phone } = await request.json();

    if (!storeId || !orderId || !phone) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify if the order belongs to this store and client phone
    const { data: order, error: orderError } = await supabase
      .from('appointments_orders')
      .select('id, status, client_whatsapp')
      .eq('id', orderId)
      .eq('store_id', storeId)
      .eq('client_whatsapp', phone)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado ou não autorizado' },
        { status: 404 }
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
    const { error: updateError } = await supabase
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
