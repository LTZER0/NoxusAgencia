'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'
import { motion } from 'motion/react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)
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

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRecoverySuccess(false)

    try {
      if (!captchaToken) {
        throw new Error('Por favor, confirme que você não é um robô.')
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
        captchaToken,
      })

      if (resetError) throw resetError

      setRecoverySuccess(true)
    } catch (err: any) {
      setError('Não foi possível enviar o e-mail de recuperação. Verifique se o endereço está correto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="mb-8 flex items-center justify-center">
        <img src="/noxus-logo.jpg" alt="NOXUS" className="h-24 w-auto mix-blend-multiply contrast-[1.1] brightness-[1.05]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{isRecovery ? 'Recuperar Senha' : 'Acesse sua conta'}</h1>
          <p className="text-gray-600 mt-2">
            {isRecovery 
              ? 'Enviaremos um link mágico para o seu e-mail para redefinir a senha.' 
              : 'Bem-vindo de volta ao seu painel administrativo.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {recoverySuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-bold mb-1">E-mail enviado com sucesso!</p>
              <p>Verifique sua caixa de entrada (e a pasta de spam) e clique no link para criar sua nova senha.</p>
            </div>
          </div>
        )}

        <form onSubmit={isRecovery ? handleRecovery : handleLogin} className="space-y-5">
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

          {!isRecovery && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-bold text-gray-700" htmlFor="password">
                  Senha
                </label>
                <button type="button" onClick={() => setIsRecovery(true)} className="text-sm text-purple-600 hover:underline font-semibold">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required={!isRecovery}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all bg-gray-50 font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-2 mb-4">
            <Turnstile 
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''} 
              onSuccess={(token) => setCaptchaToken(token)}
              options={{ theme: 'light' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken || (isRecovery && recoverySuccess)}
            className="w-full py-4 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-purple-200"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRecovery ? 'Enviar Link de Recuperação' : 'Entrar no Painel')}
          </button>
          
          {isRecovery && (
            <button
              type="button"
              onClick={() => {
                setIsRecovery(false);
                setRecoverySuccess(false);
                setError(null);
              }}
              className="w-full py-4 px-4 bg-white text-gray-700 hover:bg-gray-50 font-bold border border-gray-200 rounded-xl transition-colors flex items-center justify-center shadow-sm mt-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Login
            </button>
          )}
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
