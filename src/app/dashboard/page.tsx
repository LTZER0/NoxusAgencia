import { createClient } from "@/lib/supabase/server";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ServicesClient from "./services/ServicesClient";

export default async function ServicesPage() {
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
        <PackageOpen className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loja não configurada</h2>
        <p className="text-gray-500 mb-6">
          Você precisa configurar as informações da sua loja antes de gerenciar o catálogo.
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

  // Fetch existing products
  const { data: products } = await supabase
    .from('products_services')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto w-full">
      <ServicesClient storeId={store.id} initialProducts={products || []} />
    </div>
  );
}
