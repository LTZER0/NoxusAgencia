'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Store, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { motion } from 'motion/react'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!captchaToken) {
        throw new Error('Por favor, confirme que você não é um robô.')
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: {
            full_name: fullName,
            store_name: storeName
          }
        }
      })

      if (authError) throw authError

      if (data.user) {
        const baseSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`

        // 14 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        const { error: storeError } = await supabase.from('stores').insert({
          owner_id: data.user.id,
          name: storeName,
          slug: slug,
          plan: 'plus',
          plan_expires_at: expiresAt.toISOString(),
          trial_used: true
        })

        if (storeError) {
          console.error("Erro ao criar a loja:", storeError)
        }
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cadastro realizado com sucesso!</h2>
          <p className="text-gray-600">
            Enviamos um link de confirmação para <strong>{email}</strong>. 
            Por favor, verifique sua caixa de entrada para confirmar sua conta.
          </p>
          <Link href="/login" className="inline-block w-full py-4 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-colors shadow-md shadow-purple-200">
            Ir para o Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Store className="h-8 w-8 text-purple-600" />
        <span className="text-2xl font-bold text-gray-900">Agência <span className="text-purple-600">Noxus</span></span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-600 mt-2">Comece a modernizar seu negócio hoje mesmo.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
              Nome Completo
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-gray-50 font-medium"
              placeholder="João da Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="storeName">
              Nome do Negócio
            </label>
            <input
              id="storeName"
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-gray-50 font-medium"
              placeholder="Minha Barbearia"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-gray-50 font-medium"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-gray-50 font-medium"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-center mt-2 mb-4">
            <Turnstile 
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''} 
              onSuccess={(token) => setCaptchaToken(token)}
              options={{ theme: 'light' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full py-4 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-purple-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cadastrar meu negócio'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-purple-600 hover:underline font-bold">
            Entre aqui
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
