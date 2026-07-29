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
    const clientDeliveryFee = Math.max(0, Number(body.deliveryFee) || 0);
    
    const cartItems = Array.isArray(body.cartItems) ? body.cartItems.slice(0, 50) : []; // Max 50 itens

    if (!isValidUUID(storeId)) {
      return NextResponse.json({ error: 'ID de loja inválido.' }, { status: 400 });
    }

    if (!clientName || cartItems.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // Server-Side Validation: Never trust client-side data.
    // Verify if the store exists, is open, and fetch complement groups
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

    // 🔒 SEGURANÇA [VULN-11]: Recalculando totalAmount no backend via Zero-Trust
    let totalAmount = 0;
    try {
      const productIds = Array.from(new Set(cartItems.map((item: any) => item.product?.id).filter(Boolean)));
      
      const { data: dbProducts, error: dbErr } = await supabase
        .from('products_services')
        .select('id, price, discount_price, is_promotional')
        .in('id', productIds)
        .eq('store_id', storeId);
        
      if (dbErr || !dbProducts) throw new Error("Erro ao buscar preços dos produtos");
      
      const productMap = new Map(dbProducts.map(p => [p.id, p]));
      
      const storeComplementGroups = store.complement_groups || [];
      const complementPriceMap = new Map();
      storeComplementGroups.forEach((group: any) => {
        if (Array.isArray(group.items)) {
          group.items.forEach((item: any) => {
             complementPriceMap.set(`${group.name}-${item.name}`, Number(item.price) || 0);
          });
        }
      });

      for (const item of cartItems) {
        const dbProduct = productMap.get(item.product?.id);
        if (!dbProduct) {
           return NextResponse.json({ error: `Produto inválido: ${item.product?.name}` }, { status: 400 });
        }
        
        let basePrice = dbProduct.is_promotional && dbProduct.discount_price !== null 
            ? Number(dbProduct.discount_price) 
            : Number(dbProduct.price);
            
        let complementsTotal = 0;
        if (Array.isArray(item.selectedComplements)) {
           item.selectedComplements.forEach((comp: any) => {
              if (Array.isArray(comp.items)) {
                 comp.items.forEach((cItem: any) => {
                    const priceKey = `${comp.groupName}-${cItem.name}`;
                    if (complementPriceMap.has(priceKey)) {
                       const actualPrice = complementPriceMap.get(priceKey);
                       complementsTotal += actualPrice * (Number(cItem.quantity) || 1);
                       cItem.price = actualPrice; // Atualiza para bater com o banco na comanda
                    }
                 });
              }
           });
        }
        
        const itemQuantity = Math.max(1, Number(item.quantity) || 1);
        const itemActualUnitPrice = basePrice + complementsTotal;
        item.unitPrice = itemActualUnitPrice; // Atualiza para bater com o banco na comanda
        
        totalAmount += itemActualUnitPrice * itemQuantity;
      }
      
      // Adiciona a taxa de entrega ao total calculado
      totalAmount += clientDeliveryFee;
      
    } catch (calcError) {
      console.error('Calculation error:', calcError);
      return NextResponse.json({ error: 'Erro ao validar valores do pedido.' }, { status: 500 });
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

