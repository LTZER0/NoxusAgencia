import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TrackingClient from "./TrackingClient";

export default async function RastreioPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const slug = params.slug;

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
