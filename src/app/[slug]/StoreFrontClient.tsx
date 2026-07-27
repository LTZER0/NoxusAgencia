'use client';

import { useState } from 'react';
import { Store, ShoppingCart, ArrowRight, CheckCircle, Package } from 'lucide-react';

export default function StoreFrontClient({ 
  store, 
  products 
}: { 
  store: any; 
  products: any[];
}) {
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Selecione um produto ou serviço.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/store/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          productId: selectedProductId,
          clientName,
          clientWhatsapp
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar pedido.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Enviado!</h2>
          <p className="text-gray-500 mb-6">
            Sua solicitação foi recebida com sucesso. A equipe da loja entrará em contato com você em breve pelo WhatsApp.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedProductId(null);
              setClientName('');
              setClientWhatsapp('');
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-medium transition-colors"
          >
            Fazer novo pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header da Loja */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 text-center">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Faça seu pedido ou agendamento de forma rápida e prática.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Lista de Produtos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Produtos e Serviços
          </h2>
          
          {products.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
              Esta loja ainda não possui produtos cadastrados.
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div 
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`bg-white p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProductId === product.id 
                      ? 'border-indigo-600 shadow-md ring-1 ring-indigo-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="mt-2 font-semibold text-indigo-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Pedido */}
        <div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Finalizar Solicitação
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  placeholder="Como devemos lhe chamar?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu WhatsApp</label>
                <input
                  type="text"
                  required
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedProductId}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Enviando...' : (
                  <>
                    Enviar Pedido para a Loja
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              {!selectedProductId && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  Selecione um produto ao lado para continuar.
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
