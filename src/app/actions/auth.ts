'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function signInAction(payload: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
      options: {
        captchaToken: payload.captchaToken,
      },
    })

    if (error) {
      console.error('[Auth] SignIn error:', error)
      return { error: 'E-mail ou senha incorretos.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[Auth] Unexpected SignIn error:', err)
    return { error: 'Ocorreu um erro ao fazer login.' }
  }
}

export async function signUpAction(payload: any) {
  try {
    const supabase = await createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        captchaToken: payload.captchaToken,
        data: {
          full_name: payload.fullName,
          store_name: payload.storeName,
        },
      },
    })

    if (authError) {
      console.error('[Auth] SignUp error:', authError)
      return { error: authError.message }
    }

    if (data.user) {
      const baseSlug = payload.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 14)

      // Usando admin para forçar criação da loja via backend
      const admin = getSupabaseAdmin()
      const { error: storeError } = await admin.from('stores').insert({
        owner_id: data.user.id,
        name: payload.storeName,
        slug: slug,
        plan: 'plus',
        plan_expires_at: expiresAt.toISOString(),
        trial_used: true,
      })

      if (storeError) {
        console.error('[Auth] Erro ao criar loja (admin):', storeError)
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[Auth] Unexpected SignUp error:', err)
    return { error: 'Ocorreu um erro inesperado ao criar a conta.' }
  }
}

export async function resetPasswordAction(payload: any) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(payload.email, {
      redirectTo: payload.redirectTo,
      captchaToken: payload.captchaToken,
    })

    if (error) {
      console.error('[Auth] ResetPassword error:', error)
      return { error: 'Não foi possível enviar o e-mail de recuperação.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[Auth] Unexpected ResetPassword error:', err)
    return { error: 'Ocorreu um erro ao solicitar a recuperação.' }
  }
}

export async function updatePasswordAction(password: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('[Auth] UpdatePassword error:', error)
      return { error: 'Não foi possível atualizar a senha. O link pode ter expirado.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[Auth] Unexpected UpdatePassword error:', err)
    return { error: 'Ocorreu um erro ao atualizar a senha.' }
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch (err) {
    console.error('[Auth] SignOut error:', err)
    return { error: 'Erro ao fazer logout.' }
  }
}

export async function checkUserSessionData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { user: null }

    const { data: store } = await supabase
      .from('stores')
      .select('trial_used')
      .eq('owner_id', user.id)
      .single()

    return { 
      user: { email: user.email },
      trialUsed: store?.trial_used || false 
    }
  } catch (err) {
    return { user: null }
  }
}
