'use client';

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ConfirmAndNotifyButton({ 
  orderId, 
  clientWhatsapp, 
  clientName, 
  updateAction 
}: { 
  orderId: string, 
  clientWhatsapp: string, 
  clientName: string, 
  updateAction: (id: string, status: string) => Promise<void> 
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConfirmAndNotify = async () => {
    setIsUpdating(true);
    await updateAction(orderId, 'confirmed');
    setIsUpdating(false);
    
    const numeroLimpo = clientWhatsapp?.replace(/\D/g, '') || '';
    if (numeroLimpo) {
       const shortId = String(orderId).substring(0, 8);
       const mensagem = `Olá, ${clientName || 'Cliente'}! Seu pedido #${shortId} foi confirmado e já está sendo preparado!`;
       const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
       window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button 
      type="button"
      onClick={handleConfirmAndNotify}
      disabled={isUpdating}
      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-70"
    >
      <CheckCircle2 className="w-4 h-4" />
      {isUpdating ? 'Confirmando...' : 'Confirmar e Avisar'}
    </button>
  );
}
