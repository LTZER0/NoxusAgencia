'use client';

import { useState } from 'react';
import { Eye, X, User, Phone, MapPin, CreditCard, Calendar, ShoppingBag, DollarSign, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type OrderData = {
  id: string;
  created_at: string;
  client_name: string;
  client_whatsapp: string;
  customer_cpf?: string;
  order_type?: string;
  delivery_address?: string;
  cart_items?: any[];
  total_amount?: number;
  payment_method?: string;
};

export default function ViewReceiptModal({ order, storeName }: { order: OrderData; storeName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(order.created_at));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cartItems = order.cart_items || [];
  const itemsTotal = cartItems.reduce((acc, item) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
  const totalAmount = Number(order.total_amount || 0);
  const deliveryFee = Math.max(0, totalAmount - itemsTotal);

  const getOrderTypeLabel = (type?: string) => {
    switch (type) {
      case 'delivery':
        return 'Delivery (Entrega em Domicílio)';
      case 'retirada_comer':
        return 'Comer no Local';
      case 'retirada_levar':
        return 'Retirada para Levar';
      default:
        return type || 'Não Informado';
    }
  };

  const handleWhatsAppClient = () => {
    if (!order.client_whatsapp) return;
    const numbers = order.client_whatsapp.replace(/\D/g, '');
    const waNumber = numbers.length <= 11 ? `55${numbers}` : numbers;
    const message = encodeURIComponent(`Olá ${order.client_name || ''}, aqui é da equipe do estabelecimento ${storeName}. Entramos em contato referente ao seu pedido no valor de ${formatCurrency(totalAmount)}... `);
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-1 mt-2 border border-purple-200"
      >
        <Eye className="w-4 h-4" />
        Ver Comanda Digital
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between border-b-4 border-purple-800">
                <div>
                  <span className="text-xs text-purple-400 font-mono font-bold uppercase tracking-wider">{storeName}</span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-400" />
                  Comanda Digital #{String(order.id).substring(0, 8)}
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700">
              
              {/* Informações Gerais */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Data/Hora</span>
                  <span className="font-semibold text-gray-800">{formattedDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5" /> Tipo</span>
                  <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {getOrderTypeLabel(order.order_type)}
                  </span>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5 text-gray-500">
                  <User className="w-4 h-4 text-purple-800" /> Dados do Cliente
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100">
                  <p><strong className="text-gray-900">Nome:</strong> {order.client_name || 'Não informado'}</p>
                  {order.client_whatsapp && (
                    <p className="flex items-center gap-1.5">
                      <strong className="text-gray-900">WhatsApp:</strong> 
                      <span className="text-purple-800 font-medium">{order.client_whatsapp}</span>
                    </p>
                  )}
                  {order.customer_cpf && <p><strong className="text-gray-900">CPF:</strong> {order.customer_cpf}</p>}
                </div>
              </div>

              {/* Endereço de Entrega */}
              {order.order_type === 'delivery' && order.delivery_address && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-red-500" /> Endereço de Entrega
                  </h4>
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 text-red-950">
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                </div>
              )}

              {/* Itens do Pedido */}
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider text-gray-500">
                  Itens do Pedido ({cartItems.length})
                </h4>
                <div className="space-y-3">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start font-semibold text-gray-900">
                        <span>{item.quantity}x {item.product?.name || 'Item'}</span>
                        <span className="text-purple-800">
                          {formatCurrency(Number(item.unitPrice) * Number(item.quantity))}
                        </span>
                      </div>
                      
                      {/* Adicionais e Remoções (Legado) */}
                      {((item.removedIngredients && item.removedIngredients.length > 0) || (item.extraIngredients && Object.keys(item.extraIngredients).length > 0)) && (
                        <div className="mt-2 text-xs space-y-1 pl-2 border-l-2 border-purple-200">
                          {item.removedIngredients?.map((id: string) => {
                            const ing = item.product?.ingredients?.find((i: any, index: number) => (i.id || `ing-${index}`) === id);
                            return ing ? <p key={id} className="text-red-600 font-medium">- Sem {ing.name}</p> : null;
                          })}
                          {item.extraIngredients && Object.entries(item.extraIngredients).map(([id, qty]) => {
                            const ing = item.product?.ingredients?.find((i: any, index: number) => (i.id || `ing-${index}`) === id);
                            return ing ? <p key={id} className="text-emerald-700 font-medium">+ {String(qty)}x {ing.name}</p> : null;
                          })}
                        </div>
                      )}
                      
                      {/* Complementos (Novo) */}
                      {item.selectedComplements && item.selectedComplements.length > 0 && (
                        <div className="mt-2 text-xs space-y-1 pl-2 border-l-2 border-purple-200">
                          {item.selectedComplements.map((comp: any, cIdx: number) => (
                            <div key={cIdx}>
                              <p className="font-semibold text-gray-600">{comp.groupName}:</p>
                              {comp.items.map((ci: any, ciIdx: number) => (
                                <p key={ciIdx} className="text-emerald-700 font-medium">
                                  + {ci.quantity > 1 ? `${ci.quantity}x ` : ''}{ci.name}{ci.price > 0 ? ` (+${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ci.price * ci.quantity)})` : ''}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.observations && (
                        <p className="mt-1 text-xs text-gray-500 italic">Obs: {item.observations}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal dos itens</span>
                  <span>{formatCurrency(itemsTotal)}</span>
                </div>
                {order.order_type === 'delivery' && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxa de entrega</span>
                    <span>{deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Valor Total</span>
                  <span className="text-purple-800 text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <span className="font-semibold text-gray-900">Forma de Pagamento</span>
                </div>
                <span className="font-bold text-purple-800 uppercase bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs">
                  {order.payment_method || 'Não Informado'}
                </span>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-3 flex-wrap">
              {order.client_whatsapp ? (
                <button
                  type="button"
                  onClick={handleWhatsAppClient}
                  className="px-4 py-2.5 bg-green-600 text-white font-medium text-sm rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Falar com Cliente
                </button>
              ) : (
                <div></div>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-xl hover:bg-gray-800 transition-colors"
              >
                Fechar Comanda
              </button>
            </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
