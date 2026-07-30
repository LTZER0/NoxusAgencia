'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertCircle, X, Edit, Check, Layers, PackageOpen } from 'lucide-react';
import { motion } from 'motion/react';

type ComplementItem = {
  name: string;
  price: number;
  is_available?: boolean;
};

type ComplementGroup = {
  id: string;
  name: string;
  is_mandatory: boolean;
  min_choices: number;
  max_choices: number;
  items: ComplementItem[];
};

export default function ComplementGroupsManager({
  storeId,
  initialGroups
}: {
  storeId: string;
  initialGroups: ComplementGroup[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState<ComplementGroup[]>(initialGroups);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário
  const [name, setName] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);
  const [minChoices, setMinChoices] = useState(1);
  const [maxChoices, setMaxChoices] = useState(1);
  const [items, setItems] = useState<ComplementItem[]>([]);

  const resetForm = () => {
    setName('');
    setIsMandatory(false);
    setMinChoices(1);
    setMaxChoices(1);
    setItems([]);
    setEditingId(null);
    setIsAdding(false);
    setError(null);
  };

  const handleEditGroup = (group: ComplementGroup) => {
    setName(group.name);
    setIsMandatory(group.is_mandatory);
    setMinChoices(group.min_choices);
    setMaxChoices(group.max_choices);
    setItems([...group.items]);
    setEditingId(group.id);
    setIsAdding(true);
    setError(null);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', price: 0, is_available: true }]);
  };

  const handleUpdateItem = (index: number, field: keyof ComplementItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Nome do grupo é obrigatório.');
      return;
    }
    if (items.length === 0) {
      setError('Adicione pelo menos um item ao grupo.');
      return;
    }
    for (const item of items) {
      if (!item.name) {
        setError('Todos os itens devem ter um nome.');
        return;
      }
    }
    if (maxChoices < minChoices) {
      setError('O número máximo de escolhas deve ser maior ou igual ao mínimo.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let updatedGroups = [...groups];
      if (editingId) {
        updatedGroups = updatedGroups.map(g => g.id === editingId ? {
          id: editingId,
          name,
          is_mandatory: isMandatory,
          min_choices: minChoices,
          max_choices: maxChoices,
          items
        } : g);
      } else {
        const newGroup = {
          id: crypto.randomUUID(),
          name,
          is_mandatory: isMandatory,
          min_choices: minChoices,
          max_choices: maxChoices,
          items
        };
        updatedGroups = [newGroup, ...groups];
      }

      const response = await fetch('/api/store/complement-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, groups: updatedGroups })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar grupos.');
      }

      setGroups(updatedGroups);
      resetForm();
      router.refresh();
    } catch (err: any) {
      setError(`Erro ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Deseja realmente excluir este grupo?')) return;
    
    setLoading(true);
    try {
      const updatedGroups = groups.filter(g => g.id !== id);
      const response = await fetch('/api/store/complement-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, groups: updatedGroups })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir grupo.');
      }

      setGroups(updatedGroups);
      if (editingId === id) resetForm();
      router.refresh();
    } catch (err: any) {
      alert(`Erro ao excluir grupo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-800" />
            Grupos de Complementos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie opções adicionais, obrigatórias ou opcionais para os seus produtos.
          </p>
        </div>
        {!isAdding && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-purple-800 text-white hover:bg-purple-900 h-10 px-4 py-2 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Grupo
          </motion.button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-lg ${editingId ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-800'}`}>
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Grupo' : 'Novo Grupo'}
              </h2>
            </div>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSaveGroup} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Nome do Grupo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6"
                  placeholder="Ex: Escolha sua bebida"
                />
              </div>

              <div className="flex flex-col justify-center pt-2">
                <label className="relative inline-flex items-center cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-800"></div>
                  <span className="text-sm font-semibold text-gray-900">
                    Obrigatório (O cliente deve escolher)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Mínimo de escolhas
                </label>
                <input
                  type="number"
                  min="0"
                  value={minChoices}
                  onChange={(e) => setMinChoices(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Máximo de escolhas
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxChoices}
                  onChange={(e) => setMaxChoices(parseInt(e.target.value) || 1)}
                  className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Itens do Grupo</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Adicione as opções que farão parte deste grupo.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm font-medium text-purple-800 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Novo Item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">Nenhum item configurado. Adicione opções ao grupo.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Nome (ex: Coca-Cola, Extra Bacon)"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Preço Adicional (R$ 0,00)"
                            value={item.price || ''}
                            onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-2 sm:pt-0 sm:pl-2 sm:border-l border-gray-200">
                        <label className="relative inline-flex items-center cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            checked={item.is_available !== false}
                            onChange={(e) => handleUpdateItem(index, 'is_available', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-red-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {item.is_available !== false ? 'Ativo' : 'Pausado'}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-xl bg-purple-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Grupo'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Grupos Criados</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
          </span>
        </div>
        
        {groups.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Seus produtos não possuem complementos.</p>
            <p className="text-sm">Ofereça escolhas adicionais como "Adicional de Bacon" ou "Tamanho da Bebida".</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {groups.map((group, index) => (
              <motion.li 
                key={group.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 transition-colors gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900">{group.name}</h3>
                    {group.is_mandatory ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                        Obrigatório
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">
                        Opcional
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Escolhas: Mín {group.min_choices} / Máx {group.max_choices}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {group.items && group.items.length > 0 && (
                      <span className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        {group.items.length} {group.items.length === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:self-center self-end">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2.5 text-gray-400 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100"
                    title="Editar grupo"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Excluir grupo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
