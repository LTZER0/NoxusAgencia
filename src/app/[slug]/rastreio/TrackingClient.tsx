'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Search, Truck, Phone, AlertCircle, LogOut, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isCanceling, setIsCanceling] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const savedPhone = localStorage.getItem(`@noxus_customer_${store.id}`);
    if (savedPhone) {
      setIdentifier(savedPhone);
      setIsLoggedIn(true);
      fetchOrders(savedPhone);
    }
  }, [store.id]);

  const fetchOrders = async (phone: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/store/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          identifier: phone
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const { orders: data } = await response.json();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    localStorage.setItem(`@noxus_customer_${store.id}`, identifier);
    setIsLoggedIn(true);
    fetchOrders(identifier);
  };

  const handleLogout = () => {
    localStorage.removeItem(`@noxus_customer_${store.id}`);
    setIsLoggedIn(false);
    setIdentifier('');
    setOrders([]);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Deseja realmente solicitar o cancelamento deste pedido?')) return;
    
    setIsCanceling(orderId);
    try {
      const response = await fetch('/api/store/order/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          orderId: orderId,
          phone: identifier
        })
      });

      if (response.ok) {
        // Redirect to WhatsApp
        const waText = encodeURIComponent(`Olá, gostaria de cancelar o meu pedido #${orderId.substring(0, 8)}.`);
        const phoneRaw = (store.phone || store.pix_receipt_phone || '').replace(/\D/g, '');
        window.open(`https://wa.me/55${phoneRaw}?text=${waText}`, '_blank');
        
        // Refresh orders
        fetchOrders(identifier);
      } else {
        alert('Erro ao solicitar cancelamento. Tente novamente.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setIsCanceling(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { label: 'Aguardando Confirmação', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
      case 'confirmed':
        return { label: 'Em Preparo', icon: Package, color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200' };
      case 'completed':
        return { label: 'Finalizado', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'canceled':
        return { label: 'Cancelado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      case 'cancellation_requested':
        return { label: 'Cancelamento Solicitado', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
      default:
        return { label: status || 'Desconhecido', icon: Package, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          {isLoggedIn && (
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md mx-auto text-center mt-10"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-purple-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Meus Pedidos</h2>
              <p className="text-gray-500 mb-8 text-sm">
                Faça login com seu número de WhatsApp para ver o andamento dos seus pedidos.
              </p>
              
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Seu WhatsApp (ex: 11999999999)"
                    className="w-full rounded-xl p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-center font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl px-6 py-4 font-bold transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                >
                  Entrar
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 px-2 mb-6">Meus Pedidos Recentes</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-500">Você ainda não fez nenhum pedido com este número.</p>
                </div>
              ) : (
                orders.map((order, idx) => {
                  const status = getStatusDisplay(order.status);
                  const Icon = status.icon;
                  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  }).format(new Date(order.created_at));

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={order.id} 
                      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Pedido #{String(order.id).substring(0, 8)}
                          </p>
                          <p className="text-xs text-gray-400">{formattedDate}</p>
                        </div>
                        
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${status.color} ${status.bg} ${status.border}`}>
                          <Icon className="w-4 h-4" />
                          {status.label}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider text-xs">Itens do Pedido</p>
                        <div className="space-y-3">
                          {order.cart_items?.map((item: any, itemIdx: number) => (
                            <div key={item.id || itemIdx} className="flex flex-col text-sm bg-gray-50 p-3 rounded-xl">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-900 font-bold">{item.quantity}x {item.product?.name}</span>
                                <span className="font-bold text-purple-700">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                                </span>
                              </div>
                              
                              {item.selectedComplements && item.selectedComplements.length > 0 && (
                                <div className="text-xs text-gray-600 mt-2 pl-3 border-l-2 border-purple-200">
                                  {item.selectedComplements.map((comp: any, cIdx: number) => (
                                    comp.items.map((ci: any, ciIdx: number) => (
                                      <span key={`${cIdx}-${ciIdx}`} className="block mb-1 font-medium">
                                        + {ci.quantity > 1 ? `${ci.quantity}x ` : ''}{ci.name}
                                      </span>
                                    ))
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Pago</p>
                          <p className="text-xl font-black text-gray-900 mt-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                          </p>
                        </div>
                        
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCanceling === order.id}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isCanceling === order.id ? 'Aguarde...' : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Cancelar Pedido
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      {order.payment_method === 'pix' && order.status === 'pending' && (
                        <div className="mt-6 bg-purple-50 p-5 rounded-2xl border border-purple-100">
                          <p className="font-bold text-purple-900 mb-2">Aguardando Pagamento PIX</p>
                          <p className="text-sm text-purple-700 mb-4">Copie a chave abaixo e envie o comprovante no WhatsApp da loja para prepararmos seu pedido.</p>
                          
                          <div className="flex flex-col gap-3">
                             <div className="bg-white p-3 rounded-xl text-sm font-mono break-all text-gray-900 text-center font-bold border border-purple-200 shadow-sm">
                               {store.pix_key || 'Chave não configurada'}
                             </div>
                             <button 
                               onClick={(e) => {
                                 navigator.clipboard.writeText(store.pix_key || '');
                                 const target = e.currentTarget;
                                 target.innerText = "Chave Copiada!";
                                 setTimeout(() => { target.innerText = "Copiar Chave PIX" }, 2000);
                               }}
                               className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md shadow-purple-200"
                             >
                               Copiar Chave PIX
                             </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
