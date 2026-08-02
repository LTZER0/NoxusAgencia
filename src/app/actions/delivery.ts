'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDeliveryZone(storeId: string, payload: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single()
    if (storeError || !store) return { error: 'Loja não encontrada ou acesso negado.' }

    const admin = getSupabaseAdmin()
    
    // 🔒 SEGURANÇA [BLUE TEAM]: Sanitização anti-Mass Assignment
    const sanitizedData = {
      neighborhood_name: payload.neighborhood_name,
      fee: payload.fee,
      store_id: storeId
    }

    const { data, error } = await admin
      .from('delivery_zones')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('[Action] Error creating delivery zone:', error)
      return { error: 'Erro ao criar área de entrega.' }
    }

    revalidatePath('/dashboard/delivery')
    return { data }
  } catch (err) {
    console.error('[Action] Unexpected error:', err)
    return { error: 'Erro interno ao criar área.' }
  }
}

export async function deleteDeliveryZone(zoneId: string, storeId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single()
    if (storeError || !store) return { error: 'Loja não encontrada ou acesso negado.' }

    const admin = getSupabaseAdmin()
    const { data: zone, error: checkError } = await admin
      .from('delivery_zones')
      .select('id')
      .eq('id', zoneId)
      .eq('store_id', storeId)
      .single()
      
    if (checkError || !zone) return { error: 'Área não encontrada na sua loja.' }

    const { error } = await admin
      .from('delivery_zones')
      .delete()
      .eq('id', zoneId)

    if (error) {
      console.error('[Action] Error deleting delivery zone:', error)
      return { error: 'Erro ao excluir área de entrega.' }
    }

    revalidatePath('/dashboard/delivery')
    return { success: true }
  } catch (err) {
    console.error('[Action] Unexpected error:', err)
    return { error: 'Erro interno ao excluir área.' }
  }
}
