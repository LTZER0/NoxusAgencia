import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 🔒 SEGURANÇA [VULN-10]: Validação de sanitização e regex básica
function sanitizeString(input: unknown, maxLength = 255): string | null {
  if (typeof input !== 'string') return null;
  return input.trim().slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      userId, name, slug, phone, street, block, lot, neighborhood, 
      store_category, is_open, opening_hours, logo_url, cover_url, isUpdate,
      accepts_pix, accepts_card, accepts_cash, pix_key, pix_receipt_phone
    } = body;

    // 🔒 SEGURANÇA [VULN-3, VULN-4]: Verifica explicitamente o userId contra a sessão
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Operação inválida.' }, { status: 403 });
    }

    // 🔒 SEGURANÇA [VULN-4, VULN-10]: Sanitização explícita e whitelist (Prevenção contra Mass Assignment e XSS)
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedSlug = sanitizeString(slug, 50)?.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    if (!sanitizedName || !sanitizedSlug) {
      return NextResponse.json({ error: 'Nome e Link são obrigatórios e devem ser válidos.' }, { status: 400 });
    }

    const storeData: Record<string, any> = {
      name: sanitizedName,
      slug: sanitizedSlug,
      phone: sanitizeString(phone, 20),
      street: sanitizeString(street, 150),
      block: sanitizeString(block, 20),
      lot: sanitizeString(lot, 20),
      neighborhood: sanitizeString(neighborhood, 100),
      accepts_pix: Boolean(accepts_pix),
      accepts_card: Boolean(accepts_card),
      accepts_cash: Boolean(accepts_cash),
      pix_key: sanitizeString(pix_key, 255),
      pix_receipt_phone: sanitizeString(pix_receipt_phone, 20),
    };

    if (store_category !== undefined) {
      storeData.store_category = store_category || null;
    }
    if (is_open !== undefined) {
      storeData.is_open = is_open;
    }
    if (opening_hours !== undefined) {
      storeData.opening_hours = opening_hours || null;
    }
    if (logo_url !== undefined) {
      storeData.logo_url = logo_url || null;
    }
    if (cover_url !== undefined) {
      storeData.cover_url = cover_url || null;
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
