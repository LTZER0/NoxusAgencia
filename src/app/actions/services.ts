'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(storeId: string, payload: any) {
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
      name: payload.name,
      description: payload.description,
      price: payload.price,
      discount_price: payload.discount_price,
      is_promotional: payload.is_promotional,
      image_url: payload.image_url,
      category: payload.category,
      category_id: payload.category_id,
      complement_group_ids: payload.complement_group_ids,
      is_available: payload.is_available,
      store_id: storeId // Força o storeId validado contra spoofing
    }

    const { data, error } = await admin
      .from('products_services')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('[Action] Error creating product:', error)
      return { error: 'Erro ao criar produto.' }
    }

    revalidatePath('/dashboard/services')
    return { data }
  } catch (err) {
    console.error('[Action] Unexpected error creating product:', err)
    return { error: 'Erro interno ao criar produto.' }
  }
}

export async function updateProduct(productId: string, storeId: string, payload: any) {
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
    
    // Check if product belongs to this store
    const { data: product, error: checkError } = await admin
      .from('products_services')
      .select('id')
      .eq('id', productId)
      .eq('store_id', storeId)
      .single()
      
    if (checkError || !product) return { error: 'Produto não encontrado na sua loja.' }

    // 🔒 SEGURANÇA [BLUE TEAM]: Sanitização anti-Mass Assignment
    const sanitizedData = {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      discount_price: payload.discount_price,
      is_promotional: payload.is_promotional,
      image_url: payload.image_url,
      category: payload.category,
      category_id: payload.category_id,
      complement_group_ids: payload.complement_group_ids,
      is_available: payload.is_available,
      // Não permitimos que o store_id e id sejam atualizados
    }

    const { data, error } = await admin
      .from('products_services')
      .update(sanitizedData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('[Action] Error updating product:', error)
      return { error: 'Erro ao atualizar produto.' }
    }

    revalidatePath('/dashboard/services')
    return { data }
  } catch (err) {
    console.error('[Action] Unexpected error updating product:', err)
    return { error: 'Erro interno ao atualizar produto.' }
  }
}

export async function deleteProduct(productId: string, storeId: string) {
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
    
    // Check if product belongs to this store
    const { data: product, error: checkError } = await admin
      .from('products_services')
      .select('id')
      .eq('id', productId)
      .eq('store_id', storeId)
      .single()
      
    if (checkError || !product) return { error: 'Produto não encontrado na sua loja.' }

    const { error } = await admin
      .from('products_services')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('[Action] Error deleting product:', error)
      return { error: 'Erro ao excluir produto.' }
    }

    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (err) {
    console.error('[Action] Unexpected error deleting product:', err)
    return { error: 'Erro interno ao excluir produto.' }
  }
}
