'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type RevenueData = {
  month: string;
  revenue: number;
};

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
        <p className="text-gray-500">Sem dados de faturamento suficientes para exibir o gráfico.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="h-[400px] w-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-bold text-gray-900">Evolução de Faturamento</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
              labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Bar 
              dataKey="revenue" 
              fill="#2563EB" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
