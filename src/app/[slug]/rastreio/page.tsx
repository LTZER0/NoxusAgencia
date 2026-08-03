import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import TrackingClient from "./TrackingClient";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("name, logo_url")
    .eq("slug", params.slug)
    .single();

  if (!store) {
    return { title: "Rastreio não encontrado" };
  }

  return {
    title: `Meus Pedidos - ${store.name}`,
    icons: {
      icon: store.logo_url || "/icon.png",
    }
  };
}
export default async function RastreioPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { slug } = await params;

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!store) {
    notFound();
  }

  return (
    <TrackingClient store={store} />
  );
}
