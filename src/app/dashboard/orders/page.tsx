import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowRight,
  ClipboardList
} from "lucide-react";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-gray-500">Usuário não autenticado.</p>
      </div>
    );
  }

  // Obter a loja do usuário
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma loja encontrada</h2>
        <p className="text-gray-500 max-w-md">
          Você precisa ter uma loja configurada para gerenciar pedidos.
        </p>
      </div>
    );
  }

  // Obter pedidos da loja
  const { data: orders, error } = await supabase
    .from('appointments_orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos:", error);
  }

  const orderList = orders || [];

  // Server Action para atualizar o status do pedido
  async function updateOrderStatus(orderId: string, newStatus: string) {
    "use server";
    const supabaseServer = await createClient();
    
    await supabaseServer
      .from('appointments_orders')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    revalidatePath('/dashboard/orders');
  }

  // Função auxiliar para definir os detalhes de cada status
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Gestão de Pedidos
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhe e atualize o status dos pedidos da sua loja.
        </p>
      </div>

      {orderList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white mb-4 shadow-sm border border-gray-100">
            <ClipboardList className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum pedido ainda</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Quando seus clientes fizerem pedidos, eles aparecerão neste painel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orderList.map((order) => {
            const statusDetails = getStatusDetails(order.status);
            const StatusIcon = statusDetails.icon;

            // Format date
            const formattedDate = new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).format(new Date(order.created_at));

            return (
              <div 
                key={order.id} 
                className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
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

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Data:</span>
                      <span className="text-gray-900">{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {statusDetails.nextStatus && (
                  <div className="bg-gray-50 border-t border-gray-100 p-4">
                    <form action={updateOrderStatus.bind(null, order.id, statusDetails.nextStatus)}>
                      <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      >
                        {statusDetails.nextLabel}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
