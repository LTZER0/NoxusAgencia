'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

function ConfirmDeletionContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = async () => {
    if (!token) return;
    
    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/user/execute-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar a conta.');
      }

      setStatus('success');
      
      // Limpa dados locais se houver
      localStorage.removeItem('cookie_consent');
      
      // Redireciona para a home em 3 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Token Inválido</h1>
        <p className="text-gray-600 mb-6">Nenhum token de segurança foi fornecido na URL.</p>
        <Link href="/" className="text-blue-600 font-medium hover:underline">Voltar para a Home</Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conta Excluída com Sucesso</h1>
        <p className="text-gray-600 mb-6">Todos os seus dados foram permanentemente removidos dos nossos servidores de acordo com a LGPD. Sentiremos sua falta!</p>
        <p className="text-sm text-gray-400">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <div className="p-4 bg-red-100 text-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Último Aviso</h1>
      <p className="text-gray-600 mb-8">
        Você está prestes a excluir permanentemente a sua conta. Todos os dados da sua loja, produtos e histórico de pedidos serão completamente apagados. <strong>Esta ação é irreversível.</strong>
      </p>

      {status === 'error' && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm border border-red-100">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          SIM, QUERO DELETAR MINHA CONTA
        </button>
        <Link 
          href="/dashboard"
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cancelar e Voltar para a Loja
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
          <ConfirmDeletionContent />
        </Suspense>
      </div>
    </div>
  );
}
