'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertCircle, PackageOpen, X, Edit, Image as ImageIcon, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Ingredient = {
  id: string;
  name: string;
  price: number;
  can_remove: boolean;
  can_add: boolean;
};

export default function ServicesClient({
  storeId,
  initialProducts
}: {
  storeId: string;
  initialProducts: any[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [products, setProducts] = useState(initialProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setCategory('');
    setIngredients([]);
    setIsAdding(false);
    setError(null);
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: Math.random().toString(36).substring(7),
        name: '',
        price: 0,
        can_remove: true,
        can_add: false,
      }
    ]);
  };

  const handleUpdateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Nome e Preço são obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const parsedPrice = parseFloat(price);
      
      const payload: any = {
        store_id: storeId,
        name,
        description,
        price: parsedPrice,
        image_url: imageUrl,
        ingredients: ingredients.map(({ id, ...rest }) => rest)
      };

      if (category) {
        payload.category = category;
      }

      const { data, error: insertError } = await supabase
        .from('products_services')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;
      
      setProducts([data, ...products]);
      resetForm();
      router.refresh();
    } catch (err: any) {
      console.error("Supabase insert error:", err);
      setError(`Erro ao salvar: ${err.message || err.details || 'Verifique os campos.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('products_services')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setProducts(products.filter(p => p.id !== id));
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao excluir produto.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestão de Produtos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre os produtos e ingredientes para o seu cardápio.
          </p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </button>
        )}
      </div>

      {/* Formulário de Adição */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Novo Produto</h2>
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

          <form onSubmit={handleSaveProduct} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Nome do Produto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Ex: X-Tudo Burger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Preço Base (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="25.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Ex: Lanches, Bebidas, Sobremesas"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 resize-none"
                    placeholder="Descreva os detalhes do produto..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Ingredientes */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Ingredientes e Adicionais</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Defina o que o cliente pode remover ou adicionar.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Novo Ingrediente
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">Nenhum ingrediente configurado. O produto será vendido sem opções de customização.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Nome (ex: Bacon)"
                            value={ingredient.name}
                            onChange={(e) => handleUpdateIngredient(ingredient.id, 'name', e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Preço extra (R$)"
                            value={ingredient.price || ''}
                            onChange={(e) => handleUpdateIngredient(ingredient.id, 'price', parseFloat(e.target.value) || 0)}
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-4 flex items-center gap-4 text-sm">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ingredient.can_remove}
                              onChange={(e) => handleUpdateIngredient(ingredient.id, 'can_remove', e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                            />
                            <span className="text-gray-700 font-medium">Pode remover?</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ingredient.can_add}
                              onChange={(e) => handleUpdateIngredient(ingredient.id, 'can_add', e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                            />
                            <span className="text-gray-700 font-medium">Extra?</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ingredient.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
                className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Catálogo Ativo</h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
            {products.length} {products.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
        
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Nenhum produto cadastrado.</p>
            <p className="text-sm">Clique em "Adicionar Produto" para começar a montar seu cardápio.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product) => (
              <li key={product.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 transition-colors gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {product.image_url ? (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-50 shrink-0 flex items-center justify-center border border-gray-100">
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      {product.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wider">
                          {product.category}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </span>
                      {product.ingredients && product.ingredients.length > 0 && (
                        <span className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          {product.ingredients.length} {product.ingredients.length === 1 ? 'ingrediente personalizável' : 'ingredientes personalizáveis'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:self-center self-end">
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
