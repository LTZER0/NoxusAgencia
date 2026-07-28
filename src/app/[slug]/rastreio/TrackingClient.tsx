'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Clock, CheckCircle, Truck, MapPin, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_type: string;
  delivery_address: string | null;
  payment_method: string | null;
  cart_items: any[];
};

export default function TrackingClient({ store }: { store: any }) {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const savedPhone = localStorage.getItem('@delivery_client_whatsapp');
    if (savedPhone) {
      setIdentifier(savedPhone);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/store/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          identifier: identifier
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const { orders: data } = await response.json();
      
      if (data) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { label: 'Aguardando Confirmação', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
      case 'confirmed':
        return { label: 'Confirmado e Preparando', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
      case 'completed':
        return { label: 'Finalizado', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'canceled':
        return { label: 'Cancelado', icon: Search, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      default:
        return { label: status || 'Desconhecido', icon: Package, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 text-center">
          <Package className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acompanhe seu pedido</h2>
          <p className="text-gray-500 mb-6">
            Digite o número do seu WhatsApp ou CPF usado na compra para ver o andamento.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="(00) 00000-0000 ou CPF"
              className="flex-1 rounded-xl p-3 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? 'Buscando...' : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </form>
        </div>

        {hasSearched && !isLoading && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 px-2">Meus Pedidos Recentes</h3>
            
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
                <p className="text-gray-500">Nenhum pedido encontrado para o número informado.</p>
              </div>
            ) : (
              orders.map(order => {
                const status = getStatusDisplay(order.status);
                const Icon = status.icon;
                const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }).format(new Date(order.created_at));

                return (
                  <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Pedido #{String(order.id).substring(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400">{formattedDate}</p>
                      </div>
                      
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${status.color} ${status.bg} ${status.border}`}>
                        <Icon className="w-4 h-4" />
                        {status.label}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Itens do Pedido</p>
                      <div className="space-y-2">
                        {order.cart_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.product?.name}</span>
                            <span className="font-medium text-gray-900">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Pago / A Pagar</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                        </p>
                        {order.payment_method && (
                          <p className="text-xs text-gray-500 mt-1 capitalize">Via {order.payment_method}</p>
                        )}
                      </div>
                      
                      {order.order_type === 'delivery' && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Truck className="w-4 h-4 shrink-0" />
                          <span className="truncate max-w-[200px]">{order.delivery_address || 'Endereço não informado'}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Exibir o PIX se o método for PIX e estiver aguardando */}
                    {order.payment_method === 'pix' && order.status === 'pending' && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <p className="font-semibold text-gray-800 mb-2">Finalize seu pagamento via PIX</p>
                        <p className="text-xl font-bold text-gray-900 mb-2">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">Copie a chave abaixo para pagar e envie o comprovante.</p>
                        
                        <div className="flex flex-col gap-2">
                           <div className="bg-gray-200 p-3 rounded-lg text-sm font-mono break-all text-gray-800 text-center font-semibold">
                             {store.pix_key || 'Chave não configurada'}
                           </div>
                           <button 
                             onClick={(e) => {
                               navigator.clipboard.writeText(store.pix_key || '');
                               const target = e.currentTarget;
                               target.innerText = "Chave Copiada!";
                               setTimeout(() => { target.innerText = "Copiar Chave PIX" }, 2000);
                             }}
                             className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-3 rounded-lg transition-colors mb-4 text-sm"
                           >
                             Copiar Chave PIX
                           </button>

                           <div className="border-t border-gray-200 pt-4 mt-2">
                             <p className="text-sm text-gray-600 mb-3 font-medium">Após realizar o pagamento, envie o comprovante pelo WhatsApp:</p>
                             <a 
                               href={`https://wa.me/55${(store.pix_receipt_phone || store.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Acabei de fazer o pedido #${String(order.id).substring(0, 8)} na ${store.name}. Paguei via PIX e este é o meu comprovante:`)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                             >
                               <Phone className="w-5 h-5" />
                               Enviar Comprovante no WhatsApp
                             </a>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
