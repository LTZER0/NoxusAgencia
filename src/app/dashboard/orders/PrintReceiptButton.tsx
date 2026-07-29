'use client';

import { Printer } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function PrintReceiptButton({ order, storeName }: { order: OrderData; storeName: string }) {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isPrinting) {
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100); // Give React time to render the receipt
    }
  }, [isPrinting]);

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

  // Calculate subtotal from items if available
  const cartItems = order.cart_items || [];
  const itemsTotal = cartItems.reduce((acc, item) => acc + (Number(item.unitPrice) * Number(item.quantity)), 0);
  const totalAmount = Number(order.total_amount || 0);
  const deliveryFee = totalAmount - itemsTotal;

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsPrinting(true)}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 mt-2"
      >
        <Printer className="w-4 h-4" />
        Imprimir Comanda
      </button>

      {isPrinting && (
        <div className="print-receipt-container fixed inset-0 bg-white z-[9999] p-4 text-black font-mono text-sm leading-tight max-w-[300px]">
          <div className="text-center mb-4">
            <h1 className="font-bold text-lg uppercase">{storeName}</h1>
            <p>================================</p>
            <h2 className="font-bold text-base mt-2">CUPOM NÃO FISCAL</h2>
            <p>================================</p>
          </div>

          <div className="mb-4">
            <p>Pedido: #{String(order.id).substring(0, 8)}</p>
            <p>Data: {formattedDate}</p>
            <p>Tipo: {order.order_type === 'delivery' ? 'DELIVERY' : order.order_type === 'retirada_comer' ? 'COMER NO LOCAL' : order.order_type === 'retirada_levar' ? 'RETIRADA' : (order.order_type || 'NÃO INFORMADO').toUpperCase()}</p>
          </div>

          <div className="mb-4">
            <p>--------------------------------</p>
            <p className="font-bold">DADOS DO CLIENTE</p>
            <p>Nome: {order.client_name || 'Não informado'}</p>
            {order.client_whatsapp && <p>Telefone: {order.client_whatsapp}</p>}
            {order.customer_cpf && <p>CPF: {order.customer_cpf}</p>}
            
            {order.order_type === 'delivery' && order.delivery_address && (
              <>
                <p className="mt-2 font-bold">ENDEREÇO DE ENTREGA</p>
                <p className="break-words">{order.delivery_address}</p>
              </>
            )}
            <p>--------------------------------</p>
          </div>

          <div className="mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black border-dashed">
                  <th className="pb-1">QTD</th>
                  <th className="pb-1">ITEM</th>
                  <th className="pb-1 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="pt-1">{item.quantity}x</td>
                    <td className="pt-1 break-words max-w-[150px]">
                      {item.product?.name || 'Item'}
                      {/* Legado */}
                      {((item.removedIngredients && item.removedIngredients.length > 0) || (item.extraIngredients && Object.keys(item.extraIngredients).length > 0)) && (
                        <div className="text-xs pl-1 mt-1">
                          {item.removedIngredients?.map((id: string) => {
                            const ing = item.product?.ingredients?.find((i: any, index: number) => (i.id || `ing-${index}`) === id);
                            return ing ? <div key={id}>- Sem: {ing.name}</div> : null;
                          })}
                          {item.extraIngredients && Object.entries(item.extraIngredients).map(([id, qty]) => {
                            const ing = item.product?.ingredients?.find((i: any, index: number) => (i.id || `ing-${index}`) === id);
                            return ing ? <div key={id}>+ {String(qty)}x {ing.name}</div> : null;
                          })}
                        </div>
                      )}
                      
                      {/* Novo */}
                      {item.selectedComplements && item.selectedComplements.length > 0 && (
                        <div className="text-xs pl-1 mt-1">
                          {item.selectedComplements.map((comp: any, cIdx: number) => (
                            <div key={cIdx}>
                              <div className="font-bold">{comp.groupName}:</div>
                              {comp.items.map((ci: any, ciIdx: number) => (
                                <div key={ciIdx}>+ {ci.quantity > 1 ? `${ci.quantity}x ` : ''}{ci.name}{ci.price > 0 ? ` R$${(ci.price * ci.quantity).toFixed(2)}` : ''}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.observations && (
                        <div className="text-xs pl-1 mt-1 italic">OBS: {item.observations}</div>
                      )}
                    </td>
                    <td className="pt-1 text-right">{formatCurrency(Number(item.unitPrice) * Number(item.quantity))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>--------------------------------</p>
          </div>

          <div className="mb-4 text-right">
            <p>Subtotal: {formatCurrency(itemsTotal)}</p>
            {deliveryFee > 0 && <p>Taxa de Entrega: {formatCurrency(deliveryFee)}</p>}
            <p className="font-bold text-lg mt-1">TOTAL: {formatCurrency(totalAmount)}</p>
          </div>

          <div className="mb-8">
            <p>--------------------------------</p>
            <p className="font-bold">PAGAMENTO</p>
            <p className="break-words">{order.payment_method ? order.payment_method.toUpperCase() : 'NÃO INFORMADO'}</p>
          </div>

          <div className="text-center mt-8 mb-12">
            <p>Obrigado pela preferência!</p>
            <p className="text-xs mt-2">LocalizaSaaS</p>
          </div>
        </div>
      )}
    </>
  );
}
