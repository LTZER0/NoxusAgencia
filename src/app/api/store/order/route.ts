import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    
    const { 
      storeId, 
      clientName, 
      clientWhatsapp, 
      customerCpf, 
      orderType, 
      paymentMethod, 
      cartItems, 
      totalAmount,
      deliveryAddress
    } = body;

    if (!storeId || !clientName || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // Server-Side Validation: Never trust client-side data.
    // Verify if the store exists and is currently open for orders.
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('is_open, name')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Estabelecimento não encontrado.' }, { status: 404 });
    }

    if (store.is_open === false) {
      return NextResponse.json({ error: `O estabelecimento ${store.name} está fechado no momento e não está aceitando novos pedidos.` }, { status: 403 });
    }

    // Insert order. Use the first product's ID for product_id if it's required by the schema,
    // but store the full cart in a JSON payload. We will serialize everything into the row.
    const { error } = await supabase
      .from('appointments_orders')
      .insert({
        store_id: storeId,
        product_id: cartItems[0]?.product?.id, // Fallback for the existing non-null constraint if any
        client_name: clientName,
        client_whatsapp: clientWhatsapp || '',
        customer_cpf: customerCpf,
        order_type: orderType,
        payment_method: paymentMethod,
        status: 'pending',
        // Assuming cart_items, total_amount, delivery_address columns were added or can be added
        cart_items: cartItems,
        total_amount: totalAmount,
        delivery_address: deliveryAddress
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

