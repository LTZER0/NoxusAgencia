'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Trash2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function DeliveryClient({
  storeId,
  initialZones
}: {
  storeId: string;
  initialZones: any[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [zones, setZones] = useState(initialZones);
  const [neighborhood, setNeighborhood] = useState('');
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!neighborhood || !fee) return;
    setLoading(true);
    setError(null);

    try {
      const parsedFee = parseFloat(fee);
      
      const { data, error: insertError } = await supabase
        .from('delivery_zones')
        .insert({
          store_id: storeId,
          neighborhood_name: neighborhood,
          fee: parsedFee
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      setZones([data, ...zones]);
      setNeighborhood('');
      setFee('');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError('Erro ao adicionar área de entrega.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('delivery_zones')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setZones(zones.filter(z => z.id !== id));
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao excluir área de entrega.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulário de adição */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Nova Área</h2>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAddZone} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Bairro
            </label>
            <input
              type="text"
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="Ex: Centro"
              required
            />
          </div>
          
          <div className="md:col-span-4">
            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Entrega (R$)
            </label>
            <input
              type="number"
              id="fee"
              step="0.01"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="5.00"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Áreas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Áreas de Entrega Ativas</h2>
        </div>
        
        {zones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Nenhuma área de entrega cadastrada.</p>
            <p className="text-sm mt-1">Adicione os bairros onde você realiza entregas.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {zones.map((zone) => (
              <li key={zone.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{zone.neighborhood_name}</h3>
                    <p className="text-sm text-gray-500">
                      Taxa: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(zone.fee)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(zone.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Excluir área"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
