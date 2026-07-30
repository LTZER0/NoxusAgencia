'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, Loader2, AlertCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { motion } from 'motion/react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!captchaToken) {
        throw new Error('Por favor, confirme que você não é um robô.')
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
        }
      })

      if (authError) throw authError

      router.push('/dashboard')
    } catch (err: any) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais e se seu e-mail já foi confirmado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="mb-8 flex items-center justify-center">
        <img src="/noxus-logo.jpg" alt="NOXUS" className="h-16 w-auto mix-blend-multiply" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Acesse sua conta</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta ao seu painel administrativo.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-gray-700" htmlFor="password">
                Senha
              </label>
              <Link href="#" className="text-sm text-purple-600 hover:underline font-semibold">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Ainda não tem conta?{' '}
          <Link href="/register" className="text-purple-600 hover:underline font-bold">
            Cadastre-se
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
