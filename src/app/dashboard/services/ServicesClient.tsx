'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertCircle, PackageOpen, X, Edit, Image as ImageIcon, Check, Tag, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/services';
import { useTransition } from 'react';



export default function ServicesClient({
  storeId,
  initialProducts,
  initialCategories = [],
  complementGroups = []
}: {
  storeId: string;
  initialProducts: any[];
  initialCategories?: any[];
  complementGroups?: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState(initialProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [isPromotional, setIsPromotional] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setIsPromotional(false);
    setImageUrl('');
    setCategory('');
    setSelectedGroupIds([]);
    setIsAvailable(true);
    setEditingId(null);
    setIsAdding(false);
    setError(null);
  };

  const handleEditProduct = (product: any) => {
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ? product.price.toString() : '');
    setDiscountPrice(product.discount_price ? product.discount_price.toString() : '');
    setIsPromotional(product.is_promotional || false);
    setImageUrl(product.image_url || '');
    setCategory(product.category || '');
    
    setSelectedGroupIds(product.complement_group_ids || []);
    setIsAvailable(product.is_available !== false); // default to true if undefined
    setEditingId(product.id);
    setIsAdding(true);
    setError(null);
  };



  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Nome e Preço Base são obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const parsedPrice = parseFloat(price);
      const parsedDiscountPrice = discountPrice ? parseFloat(discountPrice) : null;
      
      const payload: any = {
        store_id: storeId,
        name,
        description,
        price: parsedPrice,
        discount_price: parsedDiscountPrice,
        is_promotional: isPromotional,
        image_url: imageUrl,
        complement_group_ids: selectedGroupIds,
        is_available: isAvailable
      };

      if (category) {
        payload.category = category;
        const matchedCat = initialCategories.find(c => c.name === category);
        if (matchedCat) {
          payload.category_id = matchedCat.id;
        }
      } else {
        payload.category = null;
        payload.category_id = null;
      }

      if (editingId) {
        const response = await updateProduct(editingId, storeId, payload);
        if (response?.error) throw new Error(response.error);
        if (response?.data) {
          setProducts(products.map(p => p.id === editingId ? response.data : p));
        }
      } else {
        const response = await createProduct(storeId, payload);
        if (response?.error) throw new Error(response.error);
        if (response?.data) {
          setProducts([response.data, ...products]);
        }
      }

      resetForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      console.error("Save error:", err);
      setError(`Erro ao salvar: ${err.message || 'Verifique os campos.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    
    const previousProducts = [...products];
    setProducts(products.filter(p => p.id !== id));
    if (editingId === id) resetForm();

    try {
      const response = await deleteProduct(id, storeId);
      if (response?.error) throw new Error(response.error);
      
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao excluir produto.');
      setProducts(previousProducts);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestão de Produtos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre, edite e crie promoções para os itens do seu cardápio.
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
            Adicionar Produto
          </motion.button>
        )}
      </div>

      {/* Formulário de Adição/Edição */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-lg ${editingId ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-800'}`}>
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Produto' : 'Novo Produto'}
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
                    className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6"
                    placeholder="Ex: X-Tudo Burger"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6"
                      placeholder="25.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1 text-amber-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      Preço Promocional
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-amber-200 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 bg-amber-50/30"
                      placeholder="Ex: 19.90 (Opcional)"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-purple-600" />
                      Categoria
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={initialCategories.length === 0}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {initialCategories.length > 0 ? 'Selecione a categoria...' : 'Nenhuma categoria criada (Crie em Categorias)'}
                      </option>
                      {initialCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-6 pt-5">
                    <button
                      type="button"
                      onClick={() => setIsAvailable(!isAvailable)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className={`relative w-11 h-6 rounded-full transition-colors ${isAvailable ? 'bg-green-500' : 'bg-red-300'}`}>
                        <div className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full shadow-sm transition-transform ${isAvailable ? 'left-[22px]' : 'left-[2px]'}`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {isAvailable ? 'Ativo na Vitrine' : 'Pausado (Oculto)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPromotional(!isPromotional)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className={`relative w-11 h-6 rounded-full transition-colors ${isPromotional ? 'bg-amber-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full shadow-sm transition-transform ${isPromotional ? 'left-[22px]' : 'left-[2px]'}`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        Destaque Oferta
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Descrição do Produto
                  </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6 resize-none"
                      placeholder="Descreva os ingredientes, tamanho e sabor..."
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
                      className="block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-purple-800 sm:text-sm sm:leading-6"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                </div>
              </div>
            </div>

            {/* Seção de Grupos de Complemento */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Grupos de Complemento</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Selecione os grupos de opcionais/adicionais para este produto.</p>
                </div>
              </div>

              {complementGroups.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">Nenhum grupo de complemento criado. Crie em Complementos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {complementGroups.map((group) => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    return (
                      <label 
                        key={group.id} 
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? 'bg-purple-50/50 border-purple-200 ring-1 ring-purple-800' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroupIds([...selectedGroupIds, group.id]);
                              } else {
                                setSelectedGroupIds(selectedGroupIds.filter(id => id !== group.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-purple-800 focus:ring-purple-800"
                          />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                            {group.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            {group.is_mandatory ? (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">
                                Obrigatório
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                                Opcional
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {group.items?.length || 0} itens
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
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
                {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
            <p className="font-medium text-gray-900 mb-1">Sua vitrine está vazia.</p>
            <p className="text-sm">Que tal adicionar seu primeiro produto e começar a vender?</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {products.map((product, index) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={product.id} 
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 transition-colors gap-4"
              >
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
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      {product.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 uppercase tracking-wider">
                          {product.category}
                        </span>
                      )}
                      {(product.is_promotional || product.discount_price) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Promocional
                        </span>
                      )}
                      {product.is_available === false && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wider flex items-center gap-1">
                          Pausado
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {product.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-400 text-xs font-medium">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </span>
                          <span className="font-bold text-amber-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.discount_price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </span>
                      )}

                      {product.complement_group_ids && product.complement_group_ids.length > 0 && (
                        <span className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          {product.complement_group_ids.length} {product.complement_group_ids.length === 1 ? 'grupo' : 'grupos'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:self-center self-end">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-2.5 text-gray-400 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-all border border-transparent hover:border-purple-100"
                    title="Editar produto"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Excluir produto"
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
