"use client";

import { useState } from "react";
import OrdersAccordion from "./OrdersAccordion";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";

export default function OrdersManager({
  initialOrders,
  storeName,
  serverUpdateAction,
  serverArchiveAction,
  serverArchiveMultipleAction,
}: {
  initialOrders: any[];
  storeName: string;
  serverUpdateAction: (id: string, status: string) => Promise<{ success: boolean; error?: string }>;
  serverArchiveAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  serverArchiveMultipleAction: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showError = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const previousOrders = [...orders];
    
    // Optimistic Update: Atualiza localmente antes do servidor responder
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      const result = await serverUpdateAction(id, newStatus);
      if (!result?.success) {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (e: any) {
      // Revert in case of failure
      setOrders(previousOrders);
      showError(`Não foi possível atualizar o pedido: ${e.message}`);
    }
  };

  const handleArchive = async (id: string) => {
    const previousOrders = [...orders];
    
    // Optimistic Update
    setOrders(prev => prev.filter(o => o.id !== id));

    try {
      const result = await serverArchiveAction(id);
      if (!result?.success) {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (e: any) {
      // Revert
      setOrders(previousOrders);
      showError(`Não foi possível arquivar o pedido: ${e.message}`);
    }
  };

  const handleArchiveMultiple = async (ids: string[]) => {
    const previousOrders = [...orders];
    
    // Optimistic Update
    setOrders(prev => prev.filter(o => !ids.includes(o.id)));

    try {
      const result = await serverArchiveMultipleAction(ids);
      if (!result?.success) {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (e: any) {
      // Revert
      setOrders(previousOrders);
      showError(`Não foi possível arquivar os pedidos: ${e.message}`);
    }
  };

  // Categorize orders
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const canceledOrders = orders.filter(o => o.status === 'canceled' || o.status === 'cancellation_requested');

  return (
    <div className="flex flex-col gap-4 relative">
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed top-4 right-4 z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="bg-white rounded-xl p-4 shadow-2xl border border-red-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Atenção</h4>
                <p className="text-sm text-gray-600">{toastMessage}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OrdersAccordion 
        title="Pendentes e Novos" 
        orders={pendingOrders} 
        storeName={storeName} 
        updateAction={handleUpdateStatus} 
        archiveAction={handleArchive}
        archiveMultipleAction={handleArchiveMultiple}
        defaultOpen={true}
      />
      <OrdersAccordion 
        title="Confirmados / Em Preparo" 
        orders={confirmedOrders} 
        storeName={storeName} 
        updateAction={handleUpdateStatus} 
        archiveAction={handleArchive}
        archiveMultipleAction={handleArchiveMultiple}
        defaultOpen={true}
      />
      <OrdersAccordion 
        title="Finalizados / Entregues" 
        orders={completedOrders} 
        storeName={storeName} 
        updateAction={handleUpdateStatus} 
        archiveAction={handleArchive}
        archiveMultipleAction={handleArchiveMultiple}
        defaultOpen={false}
      />
      <OrdersAccordion 
        title="Cancelados" 
        orders={canceledOrders} 
        storeName={storeName} 
        updateAction={handleUpdateStatus} 
        archiveAction={handleArchive}
        archiveMultipleAction={handleArchiveMultiple}
        defaultOpen={false}
      />
    </div>
  );
}
