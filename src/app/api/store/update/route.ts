import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, name, slug, phone, street, block, lot, neighborhood, delivery_fee, store_category, theme_mode, isUpdate } = body;

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Operação inválida.' }, { status: 403 });
    }

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nome e Link são obrigatórios.' }, { status: 400 });
    }

    if (store_category && !['restaurante', 'hamburgueria', 'pizzaria', 'acaiteria', 'lanchonete'].includes(store_category)) {
      return NextResponse.json({ error: 'Categoria da loja inválida.' }, { status: 400 });
    }

    if (theme_mode && !['branco', 'preto'].includes(theme_mode)) {
      return NextResponse.json({ error: 'Tema da loja inválido.' }, { status: 400 });
    }

    const storeData: Record<string, any> = {
      name,
      slug,
      phone,
      street,
      block,
      lot,
      neighborhood,
      delivery_fee: delivery_fee ? parseFloat(delivery_fee) : 0,
    };

    if (store_category !== undefined) {
      storeData.store_category = store_category || null;
    }
    if (theme_mode !== undefined) {
      storeData.theme_mode = theme_mode || 'branco';
    }

    if (isUpdate) {
      // Update existing store
      const { error } = await supabase
        .from('stores')
        .update(storeData)
        .eq('owner_id', user.id);

      if (error) {
        if (error.code === '23505') { // unique violation
          return NextResponse.json({ error: 'Este link já está em uso por outra loja.' }, { status: 400 });
        }
        throw error;
      }
    } else {
      // Insert new store
      const { error } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          ...storeData
        });

      if (error) {
        if (error.code === '23505') { // unique violation
          return NextResponse.json({ error: 'Este link já está em uso por outra loja.' }, { status: 400 });
        }
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving store:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar configurações.' }, { status: 500 });
  }
}
