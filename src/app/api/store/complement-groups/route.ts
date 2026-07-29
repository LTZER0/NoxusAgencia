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
    const { storeId, groups } = body;

    if (!storeId || !Array.isArray(groups)) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // Update existing store, validating owner
    const { error } = await supabase
      .from('stores')
      .update({ complement_groups: groups })
      .eq('id', storeId)
      .eq('owner_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving complement groups:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar grupos de complementos.' }, { status: 500 });
  }
}
