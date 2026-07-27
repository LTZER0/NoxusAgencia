import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StoreFrontClient from "./StoreFrontClient";

export default async function StoreFrontPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  // Buscar a loja pelo slug
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .eq("active", true)
    .single();

  if (storeError || !store) {
    notFound();
  }

  // Buscar os produtos da loja
  const { data: products } = await supabase
    .from("products_services")
    .select("*")
    .eq("store_id", store.id);

  return (
    <StoreFrontClient 
      store={store} 
      products={products || []} 
    />
  );
}
