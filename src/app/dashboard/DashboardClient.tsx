'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Package, DollarSign, BarChart2, PieChart as PieChartIcon, CreditCard, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, LabelList
} from 'recharts';
import { motion } from 'motion/react';

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  cart_items: Array<{
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      name: string;
    }
  }>;
};

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export default function DashboardClient({ orders, store }: { orders: Order[], store: any }) {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all'>('month');
  
  // Specific month filter state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      // Exclude cancelled for revenue metrics
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
        const [year, month] = selectedMonth.split('-');
        return orderDate.getMonth() === parseInt(month) - 1 && orderDate.getFullYear() === parseInt(year);
      }
      return true;
    });
  }, [orders, timeFilter, selectedMonth]);

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

    return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const groups: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      const d = new Date(order.created_at);
      let key = d.toLocaleDateString('pt-BR'); 
      
      if (timeFilter === 'day') {
        key = d.getHours() + 'h';
      } else if (timeFilter === 'week' || timeFilter === 'month') {
        key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } else {
        key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      }
      
      groups[key] = (groups[key] || 0) + (Number(order.total_amount) || 0);
    });

    const data = Object.entries(groups).map(([name, value]) => ({ name, value }));
    // Se houver apenas 1 ponto no gráfico de evolução, a linha não aparece (precisa de 2 pontos)
    if (data.length === 1) {
      data.unshift({ name: 'Início', value: 0 });
    }
    return data;
  }, [filteredOrders, timeFilter]);

  const topProductsChartData = useMemo(() => {
    return productStats.slice(0, 5);
  }, [productStats]);

  const paymentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredOrders.forEach(order => {
      let method = order.payment_method || 'Não Informado';
      if (method.toLowerCase().includes('dinheiro')) {
        method = 'Dinheiro';
      } else {
        method = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
      }
      stats[method] = (stats[method] || 0) + (Number(order.total_amount) || 0);
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo(a), {store?.name || 'Lojista'}!</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhe o desempenho do seu negócio em tempo real.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setTimeFilter('day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'day' ? 'bg-white shadow-sm text-purple-900' : 'text-gray-500 hover:text-purple-900'}`}
          >
            Hoje
          </button>
          <button 
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'week' ? 'bg-white shadow-sm text-purple-900' : 'text-gray-500 hover:text-purple-900'}`}
          >
            Últimos 7 dias
          </button>
          <button 
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'month' ? 'bg-white shadow-sm text-purple-900' : 'text-gray-500 hover:text-purple-900'}`}
          >
            Mês Específico
          </button>
          <button 
            onClick={() => setTimeFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === 'all' ? 'bg-white shadow-sm text-purple-900' : 'text-gray-500 hover:text-purple-900'}`}
          >
            Todo o período
          </button>
        </div>

        {timeFilter === 'month' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center">
            <div className="absolute left-3 text-gray-500 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white shadow-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 cursor-pointer"
            />
          </motion.div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-transform">
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
        </motion.div>
        
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-transform">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pedidos Recebidos</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ y: -4 }} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-transform">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-800 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Evolution Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            Evolução de Faturamento
          </h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `R$ ${val}`} />
                  <Tooltip 
                    formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-gray-500 space-y-2">
                <BarChart2 className="w-10 h-10 text-gray-300" />
                <p>Nenhuma venda registrada neste período.</p>
                <p className="text-sm text-gray-400">Divulgue o seu link para começar a ver os gráficos!</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Mais Vendidos
          </h3>
          <div className="flex-1 min-h-[300px]">
            {topProductsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={100} />
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                    <LabelList 
                      dataKey="quantity" 
                      position="right" 
                      formatter={(val: number) => `${val}x`}
                      fill="#6B7280" 
                      fontSize={12} 
                      fontWeight={500}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-8 flex flex-col h-full items-center justify-center gap-2">
                <Package className="w-8 h-8 text-gray-300" />
                <p>O seu pódio está vazio.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Formas de Pagamento
          </h3>
          <div className="h-[250px] w-full">
            {paymentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-gray-500 space-y-2">
                <PieChartIcon className="w-10 h-10 text-gray-300" />
                <p>Sem dados de pagamento.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
