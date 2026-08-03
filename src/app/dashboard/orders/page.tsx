import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowRight,
  ClipboardList,
  Archive
} from "lucide-react";
import PrintReceiptButton from "./PrintReceiptButton";
import ViewReceiptModal from "./ViewReceiptModal";
import { MotionDiv } from "@/components/MotionDiv";
import OrdersManager from "./OrdersManager";

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
    .select('id, name')
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

  // Obter pedidos não arquivados da loja
  const { data: orders, error } = await supabase
    .from('appointments_orders')
    .select('*')
    .eq('store_id', store.id)
    .or('is_archived.is.null,is_archived.eq.false')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar pedidos:", error);
  }

  const orderList = orders || [];

  // Categorizar pedidos
  const pendingOrders = orderList.filter(o => o.status === 'pending');
  const confirmedOrders = orderList.filter(o => o.status === 'confirmed');
  const completedOrders = orderList.filter(o => o.status === 'completed');
  // Include cancel_requested inside pending or canceled. The user asked for "cancellation_requested" to be visible.
  const canceledOrders = orderList.filter(o => o.status === 'canceled' || o.status === 'cancellation_requested');

  // Server Action para atualizar o status do pedido
  async function updateOrderStatus(orderId: string, newStatus: string) {
    "use server";
    try {
      const supabaseServer = await createClient();
      
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (!user) throw new Error('Não autorizado');

      const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'canceled', 'cancellation_requested'];
      if (!VALID_STATUSES.includes(newStatus)) {
        throw new Error('Status inválido');
      }

      const { data: storeOwner } = await supabaseServer
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!storeOwner) throw new Error('Loja não encontrada');

      const { error } = await supabaseServer
        .from('appointments_orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .eq('store_id', storeOwner.id);
        
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Erro ao atualizar' };
    }
  }

  // Server Action para arquivar o pedido
  async function archiveOrder(orderId: string) {
    "use server";
    try {
      const supabaseServer = await createClient();
      
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (!user) throw new Error('Não autorizado');

      const { data: storeOwner } = await supabaseServer
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!storeOwner) throw new Error('Loja não encontrada');

      const { error } = await supabaseServer
        .from('appointments_orders')
        .update({ is_archived: true })
        .eq('id', orderId)
        .eq('store_id', storeOwner.id);
        
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Erro ao arquivar' };
    }
  }

  // Server Action para arquivar múltiplos pedidos
  async function archiveMultipleOrders(orderIds: string[]) {
    "use server";
    if (!orderIds || orderIds.length === 0) return { success: true };
    try {
      const supabaseServer = await createClient();
      
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (!user) throw new Error('Não autorizado');

      const { data: storeOwner } = await supabaseServer
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!storeOwner) throw new Error('Loja não encontrada');

      const { error } = await supabaseServer
        .from('appointments_orders')
        .update({ is_archived: true })
        .in('id', orderIds)
        .eq('store_id', storeOwner.id);
        
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || 'Erro ao arquivar' };
    }
  }

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
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
          <h3 className="text-lg font-medium text-gray-900">Nenhum pedido na fila</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Assim que seus clientes começarem a comprar, os pedidos chegarão aqui em tempo real.
          </p>
        </div>
      ) : (
        <OrdersManager 
          initialOrders={orderList}
          storeName={store.name || ''}
          serverUpdateAction={updateOrderStatus}
          serverArchiveAction={archiveOrder}
          serverArchiveMultipleAction={archiveMultipleOrders}
        />
      )}
    </MotionDiv>
  );
}
