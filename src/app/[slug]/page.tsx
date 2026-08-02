import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import StoreFrontClient from "./StoreFrontClient";
import { Store } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("name, logo_url")
    .eq("slug", params.slug)
    .single();

  if (!store) {
    return { title: "Loja não encontrada" };
  }

  return {
    title: store.name,
    icons: {
      icon: store.logo_url || "/icon.png",
    }
  };
}

export default async function StoreFrontPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  // Buscar a loja pelo slug
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (storeError || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lanchonete não encontrada</h1>
        <p className="text-gray-500 max-w-sm">
          Não conseguimos encontrar o cardápio digital que você está procurando. Verifique se o link está correto.
        </p>
      </div>
    );
  }

  // Buscar os produtos da loja
  const { data: products } = await supabase
    .from("products_services")
    .select("*")
    .eq("store_id", store.id);

  // Buscar as áreas de entrega
  const { data: deliveryZones } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("store_id", store.id)
    .order("neighborhood_name", { ascending: true });

  // Buscar as categorias independentes da loja
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: true });

  return (
    <StoreFrontClient 
      store={store} 
      products={products || []} 
      deliveryZones={deliveryZones || []}
      categories={categories || []}
      complementGroups={store.complement_groups || []}
    />
  );
}
