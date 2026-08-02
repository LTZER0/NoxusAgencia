'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { createCategory, deleteCategory } from '@/app/actions/categories';

export default function CategoriesClient({
  storeId,
  initialCategories
}: {
  storeId: string;
  initialCategories: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await createCategory(storeId, name.trim());

      if (response?.error) {
        throw new Error(response.error);
      }
      
      if (response?.data) {
        setCategories([...categories, response.data]);
        setName('');
        // Server action revalidates the path, but we can wrap a refresh if needed
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao adicionar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria? Os produtos vinculados a ela ficarão sem categoria.')) return;
    
    // Exclusão otimista para UI instantânea
    const previousCategories = [...categories];
    setCategories(categories.filter(c => c.id !== id));
    
    try {
      const response = await deleteCategory(id, storeId);

      if (response?.error) {
        throw new Error(response.error);
      }
      
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao excluir categoria.');
      // Reverter alteração otimista em caso de erro
      setCategories(previousCategories);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Formulário de adição */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Criar Nova Categoria</h2>
        
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

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Combos, Lanches, Bebidas, Sobremesas..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2.5 border"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || isPending || !name.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-800 text-white font-medium rounded-lg hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{loading ? 'Salvando...' : 'Adicionar'}</span>
          </motion.button>
        </form>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Categorias Cadastradas</h2>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
            <Tag className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium text-gray-800">Seu cardápio ainda não tem categorias.</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Que tal começar criando categorias como "Lanches", "Bebidas" ou "Combos" para organizar seus produtos?</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((category, index) => (
              <motion.li 
                key={category.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-800 rounded-lg">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
