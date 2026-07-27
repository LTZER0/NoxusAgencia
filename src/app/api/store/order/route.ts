import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const body = await req.json();
    const { storeId, productId, clientName, clientWhatsapp } = body;

    if (!storeId || !clientName || !clientWhatsapp) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('appointments_orders')
      .insert({
        store_id: storeId,
        product_id: productId,
        client_name: clientName,
        client_whatsapp: clientWhatsapp,
        status: 'pending' // Estado inicial do pedido
      });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing order:', error);
    return NextResponse.json({ error: 'Erro interno ao processar pedido.' }, { status: 500 });
  }
}
