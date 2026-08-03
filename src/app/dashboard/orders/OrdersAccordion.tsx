"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowRight,
  Archive,
  AlertCircle,
  Loader2
} from "lucide-react";
import PrintReceiptButton from "./PrintReceiptButton";
import ViewReceiptModal from "./ViewReceiptModal";

type Order = any; // Assuming 'any' or defining a loose type for now

export default function OrdersAccordion({
  title,
  orders,
  storeName,
  updateAction,
  archiveAction,
  archiveMultipleAction,
  defaultOpen = false
}: {
  title: string;
  orders: Order[];
  storeName: string;
  updateAction: (id: string, status: string) => Promise<{ success: boolean; error?: string } | void>;
  archiveAction: (id: string) => Promise<{ success: boolean; error?: string } | void>;
  archiveMultipleAction?: (ids: string[]) => Promise<{ success: boolean; error?: string } | void>;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isArchivingAll, setIsArchivingAll] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Record<string, string>>({}); // { orderId: 'actionType' }

  const handleActionClick = async (orderId: string, actionType: string, actionFn: () => Promise<any>) => {
    setProcessingIds(prev => ({ ...prev, [orderId]: actionType }));
    try {
      await actionFn();
    } finally {
      // In a real optimistic UI, the item might unmount before this runs. That's fine.
      setProcessingIds(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }
  };

  const getStatusDetails = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { 
          label: 'Novo', 
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Clock,
          nextStatus: 'confirmed',
          nextLabel: 'Confirmar'
        };
      case 'confirmed':
        return { 
          label: 'Confirmado', 
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Package,
          nextStatus: 'completed',
          nextLabel: 'Finalizar'
        };
      case 'completed':
        return { 
          label: 'Finalizado', 
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          nextStatus: null,
          nextLabel: null
        };
      case 'canceled':
        return { 
          label: 'Cancelado', 
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: Truck,
          nextStatus: null,
          nextLabel: null
        };
      case 'cancellation_requested':
        return { 
          label: 'Solicitação de Cancelamento', 
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: AlertCircle,
          nextStatus: 'canceled',
          nextLabel: 'Confirmar Cancelamento'
        };
      default:
        return { 
          label: status === 'novo' ? 'Novo' : status || 'Desconhecido', 
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: ShoppingBag,
          nextStatus: null,
          nextLabel: null
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
            {orders.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum pedido nesta categoria.</p>
              ) : (
                <>
                  {archiveMultipleAction && (
                    <div className="flex justify-end mb-4">
                      <button 
                        onClick={async () => {
                          if (confirm('Deseja realmente arquivar todos os pedidos desta categoria?')) {
                            setIsArchivingAll(true);
                            await archiveMultipleAction(orders.map((o: any) => o.id));
                            setIsArchivingAll(false);
                          }
                        }}
                        disabled={isArchivingAll}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg flex items-center gap-2 transition-colors font-medium disabled:opacity-50"
                      >
                        {isArchivingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                        {isArchivingAll ? 'Arquivando...' : 'Arquivar Todos'}
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map((order: any, index: number) => {
                    const statusDetails = getStatusDetails(order.status);
                    const StatusIcon = statusDetails.icon;

                    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(order.created_at));

                    return (
                      <motion.div 
                        key={order.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex flex-col bg-white rounded-xl border ${order.status === 'cancellation_requested' ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'} overflow-hidden shadow-sm hover:shadow-md transition-shadow relative`}
                      >
                        {order.status === 'cancellation_requested' && (
                           <div className="bg-orange-500 text-white text-xs font-bold text-center py-1 flex items-center justify-center gap-2">
                             <AlertCircle className="w-4 h-4" /> Cliente solicitou cancelamento
                           </div>
                        )}
                        <div className="p-5 flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Pedido #{String(order.id).substring(0, 8)}
                              </p>
                              <h3 className="text-base font-semibold text-gray-900">
                                {order.client_name || 'Cliente Não Identificado'}
                              </h3>
                              {order.client_whatsapp && (
                                <p className="text-sm text-gray-500 mt-1">
                                  WhatsApp: {order.client_whatsapp}
                                </p>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusDetails.color}`}>
                              <StatusIcon className="w-3.5 h-3.5 mr-1" />
                              {statusDetails.label}
                            </span>
                          </div>

                          <div className="space-y-2 mt-4 mb-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">Data:</span>
                              <span className="text-gray-900">{formattedDate}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <ViewReceiptModal order={order} storeName={storeName} />
                            <PrintReceiptButton order={order} storeName={storeName} />
                          </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-100 p-4 flex flex-col gap-2">
                          {statusDetails.nextStatus && (
                            <button 
                              onClick={() => handleActionClick(order.id, 'update', () => updateAction(order.id, statusDetails.nextStatus!))}
                              disabled={!!processingIds[order.id]}
                              className="w-full flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-900 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-800 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingIds[order.id] === 'update' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  {statusDetails.nextLabel}
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          )}
                          
                          {(order.status === 'completed' || order.status === 'canceled') && (
                            <button 
                              onClick={() => handleActionClick(order.id, 'archive', () => archiveAction(order.id))}
                              disabled={!!processingIds[order.id]}
                              className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingIds[order.id] === 'archive' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Archive className="w-4 h-4" />
                                  Arquivar Pedido (Limpar)
                                </>
                              )}
                            </button>
                          )}

                          {(order.status !== 'canceled' && order.status !== 'completed' && order.status !== 'cancellation_requested') && (
                            <button 
                              onClick={() => setOrderToCancel(order.id)}
                              disabled={!!processingIds[order.id]}
                              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancelar Pedido
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancelar Pedido</h3>
            <p className="text-sm text-gray-600 mb-6">Tem certeza que deseja cancelar este pedido? O cliente será notificado e esta ação não poderá ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setOrderToCancel(null)} 
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={() => { 
                  handleActionClick(orderToCancel, 'cancel', () => updateAction(orderToCancel, 'canceled')); 
                  setOrderToCancel(null); 
                }} 
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={processingIds[orderToCancel] === 'cancel'}
              >
                {processingIds[orderToCancel] === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sim, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
