import { createClient } from "@/lib/supabase/server";
import { MapPin } from "lucide-react";
import DeliveryClient from "./DeliveryClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DeliveryZonesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if store exists
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
        <MapPin className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loja não configurada</h2>
        <p className="text-gray-500 mb-6">
          Você precisa configurar as informações da sua loja antes de gerenciar as áreas de entrega.
        </p>
        <Link 
          href="/dashboard/settings" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Ir para Configurações
        </Link>
      </div>
    );
  }

  const { data: zones } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestão de Áreas de Entrega
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure as taxas de entrega para cada bairro que sua loja atende.
          </p>
        </div>
      </div>

      <DeliveryClient storeId={store.id} initialZones={zones || []} />
    </div>
  );
}
