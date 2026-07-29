import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-gray-500">Usuário não autenticado.</p>
      </div>
    );
  }

  // Check if store exists
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  let archivedOrders = [];
  if (store) {
    const { data } = await supabase
      .from('appointments_orders')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_archived', true)
      .order('created_at', { ascending: false });
      
    if (data) {
      archivedOrders = data;
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 text-purple-800 rounded-lg">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Configurações
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as informações da sua loja e o link do seu cardápio digital.
          </p>
        </div>
      </div>

      <SettingsForm initialStore={store} userId={user.id} archivedOrders={archivedOrders} />
    </div>
  );
}
