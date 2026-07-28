'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Package, DollarSign, Calendar, BarChart2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  cart_items: Array<{
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      name: string;
    }
  }>;
};

export default function DashboardClient({ orders, store }: { orders: Order[], store: any }) {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all'>('month');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      // Exclude cancelled? Let's exclude canceled if we want real revenue, but maybe keep completed/pending.
      // Usually revenue is only 'completed', but pending might just mean not delivered yet.
      if (order.status === 'canceled') return false;

      const orderDate = new Date(order.created_at);
      
      if (timeFilter === 'day') {
        return orderDate.toDateString() === now.toDateString();
      }
      if (timeFilter === 'week') {
        const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= pastWeek;
      }
      if (timeFilter === 'month') {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, timeFilter]);

  const totalRevenue = filteredOrders.reduce((acc, order) => acc + (Number(order.total_amount) || 0), 0);
  const totalOrders = filteredOrders.length;

  const productStats = useMemo(() => {
    const stats: Record<string, { name: string, quantity: number, revenue: number }> = {};
    
    filteredOrders.forEach(order => {
      if (!order.cart_items) return;
      order.cart_items.forEach(item => {
        if (!item.product) return;
        const pid = item.product.id || item.product.name;
        if (!stats[pid]) {
          stats[pid] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        stats[pid].quantity += Number(item.quantity) || 0;
        stats[pid].revenue += (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      });
    });

    return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    // Group orders by date (for day, week, month)
    const groups: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      const d = new Date(order.created_at);
      let key = d.toLocaleDateString('pt-BR'); // default day
      
      if (timeFilter === 'day') {
        // Group by hour
        key = d.getHours() + 'h';
      } else if (timeFilter === 'week' || timeFilter === 'month') {
        key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }
      
      groups[key] = (groups[key] || 0) + (Number(order.total_amount) || 0);
    });

    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [filteredOrders, timeFilter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setTimeFilter('day')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Hoje
        </button>
        <button 
          onClick={() => setTimeFilter('week')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Últimos 7 dias
        </button>
        <button 
          onClick={() => setTimeFilter('month')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Este Mês
        </button>
        <button 
          onClick={() => setTimeFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Todo o período
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Faturamento</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pedidos Recebidos</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-gray-400" />
            Evolução de Faturamento
          </h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#4F46E5" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Sem dados para o período selecionado.
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Mais Vendidos</h3>
          
          <div className="space-y-4">
            {productStats.length > 0 ? (
              productStats.slice(0, 5).map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{stat.name}</p>
                      <p className="text-xs text-gray-500">{stat.quantity} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.revenue)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhuma venda no período.
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
