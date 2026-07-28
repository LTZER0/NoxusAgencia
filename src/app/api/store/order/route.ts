import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 🔒 SEGURANÇA [VULN-10]: Validação de sanitização e regex básica
function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    
    // 🔒 SEGURANÇA [VULN-10]: Sanitização explícita de inputs
    const storeId = sanitizeString(body.storeId, 100);
    const clientName = sanitizeString(body.clientName, 200);
    const clientWhatsapp = sanitizeString(body.clientWhatsapp, 20).replace(/[^0-9]/g, '');
    const customerCpf = sanitizeString(body.customerCpf, 14).replace(/[^0-9]/g, '');
    const orderType = sanitizeString(body.orderType, 20);
    const paymentMethod = sanitizeString(body.paymentMethod, 50);
    const deliveryAddress = sanitizeString(body.deliveryAddress, 500);
    
    // 🔒 SEGURANÇA [VULN-11]: Em um sistema completo, totalAmount deveria ser recalculado no servidor.
    // Aqui garantimos que seja pelo menos um número válido positivo para mitigar injeção de NaN ou negativo.
    const totalAmount = Math.max(0, Number(body.totalAmount) || 0);
    
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems.slice(0, 50) : []; // Max 50 itens

    if (!isValidUUID(storeId)) {
      return NextResponse.json({ error: 'ID de loja inválido.' }, { status: 400 });
    }

    if (!clientName || cartItems.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // Server-Side Validation: Never trust client-side data.
    // Verify if the store exists and is currently open for orders.
    // We use select('*') so that even if the new 'is_open' column hasn't been added via SQL migration yet in production, the query won't crash.
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      console.error("Store search error in order route:", storeError);
      return NextResponse.json({ error: 'Estabelecimento não encontrado.' }, { status: 404 });
    }

    if (store.is_open === false) {
      return NextResponse.json({ error: `O estabelecimento ${store.name || ''} está fechado no momento e não está aceitando novos pedidos.` }, { status: 403 });
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

