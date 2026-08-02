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
    const { data, error } = await admin
      .from('products_services')
      .insert({ ...payload, store_id: storeId })
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

    const { data, error } = await admin
      .from('products_services')
      .update(payload)
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
