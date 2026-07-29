import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import DashboardClient from "./DashboardClient";
import { isAdminEmail } from "@/lib/admins";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  
  const isAdmin = isAdminEmail(user.email);

  // Check if store exists
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
        <LayoutDashboard className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bem-vindo ao LocalizaSaaS!</h2>
        <p className="text-gray-500 mb-6">
          Para começar a vender e acompanhar seus resultados, configure sua loja.
        </p>
        <Link 
          href="/dashboard/settings" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Configurar Loja
        </Link>
      </div>
    );
  }

  // Fetch all orders for this store (for dashboard metrics)
  // In a real huge production app, we would paginate or summarize via SQL
  const { data: orders } = await supabase
    .from('appointments_orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-800 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Visão Geral
              </h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  <ShieldCheck className="w-4 h-4" />
                  Equipe Noxus
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe o desempenho das suas vendas e os produtos mais populares.
            </p>
          </div>
        </div>
      </div>

      <DashboardClient orders={orders || []} store={store} />
    </div>
  );
}
