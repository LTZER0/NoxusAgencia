'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(storeId: string, name: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado.' }
    }

    // Valida se o usuário é realmente dono da loja informada
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single()

    if (storeError || !store) {
      return { error: 'Loja não encontrada ou acesso negado.' }
    }

    // Instancia o admin client para contornar RLS de forma segura no backend
    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('categories')
      .insert({ store_id: storeId, name })
      .select()
      .single()

    if (error) {
      console.error('[Action] Error creating category:', error)
      return { error: 'Erro ao criar categoria.' }
    }

    // Invalida o cache da página de categorias para atualizar a UI
    revalidatePath('/dashboard/categories')
    return { data }
  } catch (err) {
    console.error('[Action] Unexpected error creating category:', err)
    return { error: 'Erro interno ao criar categoria.' }
  }
}

export async function deleteCategory(categoryId: string, storeId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado.' }
    }

    // Valida se o usuário é realmente dono da loja
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .single()

    if (storeError || !store) {
      return { error: 'Loja não encontrada ou acesso negado.' }
    }
    
    const admin = getSupabaseAdmin()
    
    // Valida se a categoria realmente pertence a esta loja
    const { data: category, error: catError } = await admin
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('store_id', storeId)
      .single()
      
    if (catError || !category) {
        return { error: 'Categoria não encontrada na sua loja.' }
    }

    // Executa o delete como admin
    const { error } = await admin
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      console.error('[Action] Error deleting category:', error)
      return { error: 'Erro ao excluir categoria.' }
    }

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (err) {
    console.error('[Action] Unexpected error deleting category:', err)
    return { error: 'Erro interno ao excluir categoria.' }
  }
}
