'use client';

import { useState } from 'react';
import { AlertTriangle, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function DeleteAccountSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, digite sua senha.');
      return;
    }
    if (confirmText !== 'EXCLUIR') {
      setError('Você precisa digitar exatamente a palavra EXCLUIR.');
      return;
    }
    if (!captchaToken) {
      setError('Por favor, confirme que você não é um robô.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, captchaToken, confirmText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar conta. Verifique sua senha.');
      }

      setSuccess(true);
      
      // Apagar sessão e redirecionar para a Landing Page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-red-100 mt-8">
      <div className="border-b border-red-100 px-4 py-5 sm:px-6 bg-red-50/30 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <div>
          <h2 className="text-base font-semibold leading-6 text-red-900">Zona de Perigo (Exclusão de Conta)</h2>
          <p className="mt-1 text-sm text-red-500">Ações permanentes e destrutivas.</p>
        </div>
      </div>
      
      <div className="px-4 py-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Deletar minha conta e todos os dados</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Ao deletar sua conta, sua loja sairá do ar imediatamente. Todos os produtos, configurações e histórico de pedidos serão <strong>apagados para sempre</strong>. Esta ação não pode ser desfeita.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            Deletar Conta
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 text-red-600">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Conta Definitivamente</h3>
              </div>
              
              {!success ? (
                <form onSubmit={handleRequestDeletion}>
                  <p className="text-sm text-gray-600 mb-4">
                    Para confirmar a exclusão permanente de todos os seus dados e da sua loja, preencha as confirmações abaixo:
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Sua Senha Atual
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                        placeholder="Sua senha secreta"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Digite a palavra <span className="font-bold text-red-600">EXCLUIR</span>
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none text-sm font-bold tracking-wider uppercase"
                      placeholder="EXCLUIR"
                      required
                    />
                  </div>

                  <div className="flex justify-center mb-4">
                    <Turnstile 
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''} 
                      onSuccess={(token) => setCaptchaToken(token)}
                      options={{ theme: 'light' }}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !password || !captchaToken || confirmText !== 'EXCLUIR'}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Confirmar e Deletar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Conta Excluída!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Sua conta e todos os dados da sua loja foram permanentemente apagados dos nossos servidores.
                  </p>
                  <p className="text-xs text-gray-400">Redirecionando para a página inicial...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
