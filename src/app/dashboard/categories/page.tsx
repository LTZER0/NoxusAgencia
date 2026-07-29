import { createClient } from "@/lib/supabase/server";
import { Tag } from "lucide-react";
import CategoriesClient from "./CategoriesClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
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
        <Tag className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loja não configurada</h2>
        <p className="text-gray-500 mb-6">
          Você precisa configurar as informações da sua loja antes de gerenciar as categorias.
        </p>
        <Link 
          href="/dashboard/settings" 
          className="bg-purple-800 hover:bg-purple-900 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Ir para Configurações
        </Link>
      </div>
    );
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 text-purple-800 rounded-lg">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Categorias do Cardápio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie e organize as categorias de produtos que serão exibidas em abas no seu cardápio digital.
          </p>
        </div>
      </div>

      <CategoriesClient storeId={store.id} initialCategories={categories || []} />
    </div>
  );
}
