'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Store as StoreIcon, Check, MapPin, CreditCard, User, Phone, CheckCircle2, Clock, Sparkles, Utensils, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Ingredient = {
  id: string;
  name: string;
  price: number;
  can_remove: boolean;
  can_add: boolean;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  is_promotional?: boolean;
  image_url: string;
  category: string;
  ingredients?: Ingredient[];
};

type CartItem = {
  id: string; // unique id for this cart item instance
  product: Product;
  quantity: number;
  removedIngredients: string[];
  extraIngredients: Record<string, number>; // ingredientId -> quantity
  unitPrice: number; // calculated base on extras
};

export default function StoreFrontClient({ 
  store, 
  products, 
  deliveryZones = [],
  categories = [] 
}: { 
  store: any; 
  products: Product[]; 
  deliveryZones?: any[]; 
  categories?: any[]; 
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Customization Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [removedIngs, setRemovedIngs] = useState<string[]>([]);
  const [extraIngs, setExtraIngs] = useState<Record<string, number>>({});
  const [itemQuantity, setItemQuantity] = useState(1);

  // Checkout Form State
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [orderType, setOrderType] = useState('delivery'); // delivery, retirada_comer, retirada_levar
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: '', complement: '' });
  const [changeFor, setChangeFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('@delivery_client_name');
    const savedPhone = localStorage.getItem('@delivery_client_whatsapp');
    if (savedName) setClientName(savedName);
    if (savedPhone) setClientWhatsapp(savedPhone);
  }, []);

  const getThemeClasses = () => {
    switch (store.store_category) {
      case 'acaiteria':
        return {
          bg: 'bg-gray-50/50',
          text: 'text-gray-900',
          primaryBg: 'bg-purple-600',
          primaryHover: 'hover:bg-purple-700',
          primaryText: 'text-purple-600',
          priceText: 'text-purple-600',
          hoverText: 'group-hover:text-purple-600',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          secondaryBg: 'bg-white',
          border: 'border-gray-200/80',
          mutedText: 'text-gray-500',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
      case 'hamburgueria':
        return {
          bg: 'bg-gray-50/50',
          text: 'text-gray-900',
          primaryBg: 'bg-amber-600',
          primaryHover: 'hover:bg-amber-700',
          primaryText: 'text-amber-600',
          priceText: 'text-amber-600',
          hoverText: 'group-hover:text-amber-600',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          secondaryBg: 'bg-white',
          border: 'border-gray-200/80',
          mutedText: 'text-gray-500',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
      case 'pizzaria':
        return {
          bg: 'bg-gray-50/50',
          text: 'text-gray-900',
          primaryBg: 'bg-red-600',
          primaryHover: 'hover:bg-red-700',
          primaryText: 'text-red-600',
          priceText: 'text-red-600',
          hoverText: 'group-hover:text-red-600',
          badgeBg: 'bg-red-50 text-red-700 border-red-200',
          secondaryBg: 'bg-white',
          border: 'border-gray-200/80',
          mutedText: 'text-gray-500',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
      case 'restaurante':
        return {
          bg: 'bg-gray-50/50',
          text: 'text-gray-900',
          primaryBg: 'bg-amber-800',
          primaryHover: 'hover:bg-amber-900',
          primaryText: 'text-amber-800',
          priceText: 'text-amber-800',
          hoverText: 'group-hover:text-amber-800',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          secondaryBg: 'bg-white',
          border: 'border-gray-200/80',
          mutedText: 'text-gray-500',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
      case 'lanchonete':
      default:
        return {
          bg: 'bg-gray-50/50',
          text: 'text-gray-900',
          primaryBg: 'bg-indigo-600',
          primaryHover: 'hover:bg-indigo-700',
          primaryText: 'text-indigo-600',
          priceText: 'text-indigo-600',
          hoverText: 'group-hover:text-indigo-600',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          secondaryBg: 'bg-white',
          border: 'border-gray-200/80',
          mutedText: 'text-gray-500',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
    }
  };

  const theme = getThemeClasses();

  const hasOffers = useMemo(() => {
    return products.some(p => p.is_promotional || (p.discount_price && Number(p.discount_price) > 0));
  }, [products]);

  const categoryTabs = useMemo(() => {
    const names: string[] = [];
    if (hasOffers) {
      names.push('🔥 Ofertas');
    }
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        if (c && c.name && !names.includes(c.name) && c.name !== '🔥 Ofertas') {
          names.push(c.name);
        }
      });
    }
    products.forEach(p => {
      const catName = p.category || 'Outros';
      if (!names.includes(catName) && catName !== '🔥 Ofertas') {
        names.push(catName);
      }
    });
    return names;
  }, [products, categories, hasOffers]);

  const handleProductClick = (product: Product) => {
    if (store.is_open === false) {
      alert(`O estabelecimento ${store.name} está fechado no momento e não está aceitando pedidos.`);
      return;
    }
    setSelectedProduct(product);
    setRemovedIngs([]);
    setExtraIngs({});
    setItemQuantity(1);
  };

  const currentItemPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let price = Number(selectedProduct.discount_price || selectedProduct.price);
    if (selectedProduct.ingredients) {
      Object.entries(extraIngs).forEach(([ingId, qty]) => {
        const ing = selectedProduct.ingredients?.find((i, idx) => (i.id || `ing-${idx}`) === ingId);
        if (ing && ing.price) {
          price += (Number(ing.price) * qty);
        }
      });
    }
    return price;
  }, [selectedProduct, extraIngs]);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(7),
      product: selectedProduct,
      quantity: itemQuantity,
      removedIngredients: removedIngs,
      extraIngredients: extraIngs,
      unitPrice: currentItemPrice
    };

    setCart([...cart, newItem]);
    setSelectedProduct(null);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalValue = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
  const deliveryFee = useMemo(() => {
    if (orderType !== 'delivery') return 0;
    if (deliveryZones.length > 0 && address.neighborhood) {
      const zone = deliveryZones.find(z => z.neighborhood_name === address.neighborhood);
      if (zone) return Number(zone.fee);
    }
    return 0;
  }, [orderType, address.neighborhood, deliveryZones]);

  const finalTotalValue = cartTotalValue + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (store.is_open === false) {
      alert(`O estabelecimento ${store.name} está fechado no momento e não está aceitando pedidos.`);
      return;
    }

    setIsSubmitting(true);

    let fullAddress = null;
    if (orderType === 'delivery') {
      fullAddress = `${address.street}, ${address.number} - ${address.neighborhood} ${address.complement ? `(${address.complement})` : ''}`;
    }

    // Include payment notes if paying with cash
    let paymentDetails = paymentMethod;
    if (paymentMethod === 'dinheiro' && changeFor) {
      paymentDetails = `dinheiro (Troco para R$ ${changeFor})`;
    }

    try {
      localStorage.setItem('@delivery_client_name', clientName);
      localStorage.setItem('@delivery_client_whatsapp', clientWhatsapp);

      const res = await fetch('/api/store/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          clientName,
          clientWhatsapp,
          customerCpf,
          orderType,
          paymentMethod: paymentDetails,
          cartItems: cart,
          totalAmount: finalTotalValue,
          deliveryAddress: fullAddress
        })
      });

      if (res.ok) {
        setCheckoutStep('success');
        setCart([]);
        // Optional: Reset payment method so next order doesn't default to PIX if they don't want it
        setPaymentMethod('');
        setChangeFor('');
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao processar pedido.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao enviar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
        <div className={`relative w-full max-w-lg ${theme.cartBg} rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}>
          <div className="relative h-48 sm:h-56 shrink-0 bg-gray-100 rounded-t-2xl overflow-hidden">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">Sem imagem</div>
            )}
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-1">{selectedProduct.name}</h2>
            <p className="text-sm opacity-70 mb-4">{selectedProduct.description}</p>
            
            {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
              <div className="space-y-5 border-t border-gray-200/20 pt-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">Customização</h3>
                
                {selectedProduct.ingredients.map((ing, idx) => {
                  const ingKey = ing.id || `ing-${idx}`;
                  return (
                  <div key={ingKey} className="flex flex-col gap-2 p-3 rounded-xl bg-gray-500/5">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ing.name}</span>
                      {ing.price > 0 && <span className="text-sm font-semibold opacity-70">+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ing.price)}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {ing.can_remove && (
                        <label className="flex items-center gap-2 text-sm cursor-pointer opacity-80 hover:opacity-100">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                            checked={removedIngs.includes(ingKey)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRemovedIngs([...removedIngs, ingKey]);
                                setExtraIngs({ ...extraIngs, [ingKey]: 0 }); // reset extra if removed
                              } else {
                                setRemovedIngs(removedIngs.filter(id => id !== ingKey));
                              }
                            }}
                          />
                          <span>Remover</span>
                        </label>
                      )}
                      
                      {ing.can_add && (
                        <div className="flex items-center gap-3 bg-gray-500/10 rounded-full px-2 py-1 ml-auto">
                          <button 
                            type="button"
                            disabled={!extraIngs[ingKey] || removedIngs.includes(ingKey)}
                            onClick={() => setExtraIngs({...extraIngs, [ingKey]: Math.max(0, (extraIngs[ingKey] || 0) - 1)})}
                            className="p-1 rounded-full hover:bg-gray-500/20 disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{extraIngs[ingKey] || 0}</span>
                          <button 
                            type="button"
                            disabled={removedIngs.includes(ingKey)}
                            onClick={() => setExtraIngs({...extraIngs, [ingKey]: (extraIngs[ingKey] || 0) + 1})}
                            className="p-1 rounded-full hover:bg-gray-500/20 disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
          
          <div className="p-5 border-t border-gray-200/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 bg-gray-500/10 rounded-full px-2 py-1.5">
                <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} className="p-1.5 rounded-full hover:bg-gray-500/20">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-6 text-center">{itemQuantity}</span>
                <button onClick={() => setItemQuantity(itemQuantity + 1)} className="p-1.5 rounded-full hover:bg-gray-500/20">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentItemPrice * itemQuantity)}
              </div>
            </div>
            <button 
              onClick={handleAddToCart}
              className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2`}
            >
              <ShoppingCart className="w-5 h-5" />
              Adicionar ao Pedido
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 pb-20`}>
      {/* 1. Cover & Store Header (Anota Aí style banner & logo) */}
      <div className="relative">
        <div className={`h-40 sm:h-48 w-full ${theme.primaryBg} bg-gradient-to-r from-black/40 via-transparent to-black/30 relative overflow-hidden flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
          {store.cover_url && (
            <img src={store.cover_url} alt={store.name} className="w-full h-full object-cover absolute inset-0 opacity-80" />
          )}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-14 sm:-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4 pb-4 border-b border-gray-200/10">
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ${theme.secondaryBg} p-1 shadow-xl border-4 ${theme.border} flex items-center justify-center overflow-hidden shrink-0 z-10`}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className={`w-full h-full ${theme.primaryBg} rounded-xl flex items-center justify-center text-white`}>
                <StoreIcon className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0 pt-2 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-1">{store.name}</h1>
                {store.description && <p className={`text-sm ${theme.mutedText} line-clamp-2 max-w-xl`}>{store.description}</p>}
              </div>
              <button 
                onClick={() => router.push(`/${store.slug}/rastreio`)}
                className={`inline-flex items-center justify-center gap-2 text-sm font-bold ${theme.primaryBg} text-white hover:opacity-90 px-4 py-2.5 rounded-xl shadow-md transition-all self-center sm:self-auto shrink-0`}
              >
                <User className="w-4 h-4" />
                <span>Meus Pedidos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational Info Bar */}
      <div className="bg-[#fcf8f5] border-b border-amber-900/10 px-4 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-3 text-gray-700 font-medium">
            <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-semibold text-[11px]">
              Apenas pedidos agendados, Faça já o seu!
            </span>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-gray-600">
              {store.opening_hours ? `Horários: ${store.opening_hours}` : 'Horários a partir das 18h'} • Sem pedido mínimo
            </span>
          </div>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="text-amber-800 font-bold hover:underline shrink-0 text-xs sm:text-sm flex items-center gap-1"
          >
            Perfil da loja
          </button>
        </div>
      </div>

      {store.is_open === false && (
        <div className="bg-red-50 border-y border-red-200 py-3 px-4 text-center">
          <p className="text-sm font-bold text-red-800 flex items-center justify-center gap-2">
            O estabelecimento está fechado para pedidos no momento. {store.opening_hours ? `Horário de atendimento: ${store.opening_hours}` : ''}
          </p>
        </div>
      )}

      {/* 3. Horizontal Category Tabs */}
      <div className={`sticky top-0 z-30 ${theme.secondaryBg}/95 backdrop-blur-md border-b ${theme.border} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'Todos'
                  ? `${theme.primaryBg} text-white shadow-md scale-105`
                  : `${theme.bg} ${theme.mutedText} hover:opacity-80 border ${theme.border}`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Todos</span>
            </button>
            {categoryTabs.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? `${theme.primaryBg} text-white shadow-md scale-105`
                    : `${theme.bg} ${theme.mutedText} hover:opacity-80 border ${theme.border}`
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Main Product Grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {products.length === 0 ? (
          <div className={`${theme.secondaryBg} rounded-2xl p-12 text-center border ${theme.border} my-8`}>
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className={`font-medium ${theme.mutedText}`}>Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {categoryTabs
              .filter(category => selectedCategory === 'Todos' || selectedCategory === category)
              .map(category => {
                const categoryProducts = category === '🔥 Ofertas'
                  ? products.filter(p => p.is_promotional || (p.discount_price && Number(p.discount_price) > 0))
                  : products.filter(p => (p.category || 'Outros') === category);

                if (categoryProducts.length === 0) return null;
                return (
                  <section key={category} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-200/15 pb-2">
                      <h3 className="text-xl font-extrabold tracking-tight">{category}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${theme.secondaryBg} ${theme.mutedText} border ${theme.border}`}>
                        {categoryProducts.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryProducts.map(product => (
                        <div 
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className={`${theme.secondaryBg} border ${theme.border} rounded-2xl p-4 flex justify-between gap-4 cursor-pointer hover:shadow-lg hover:border-gray-400/30 transition-all group relative overflow-hidden`}
                        >
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <h4 className={`font-bold text-base sm:text-lg ${theme.hoverText} transition-colors leading-snug`}>
                                  {product.name}
                                </h4>
                                {(product.is_promotional || product.discount_price) && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                    🔥 Oferta
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs sm:text-sm ${theme.mutedText} line-clamp-2 mb-3 leading-relaxed`}>
                                {product.description || 'Sem descrição.'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {product.discount_price ? (
                                <div className="flex items-center gap-2">
                                  <span className="line-through text-gray-400 text-xs font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                  </span>
                                  <span className="font-extrabold text-base sm:text-lg text-emerald-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.discount_price)}
                                  </span>
                                </div>
                              ) : (
                                <span className={`font-extrabold text-base sm:text-lg ${theme.priceText}`}>
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                </span>
                              )}
                              {product.ingredients && product.ingredients.length > 0 && (
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${theme.badgeBg}`}>
                                  Personalizável
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative group-hover:scale-[1.02] transition-transform">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-500/5 text-xs">
                                <Utensils className="w-6 h-6 mb-1 opacity-40" />
                                <span>Foto</span>
                              </div>
                            )}
                            <div className={`absolute bottom-1.5 right-1.5 ${theme.primaryBg} text-white p-1.5 rounded-lg shadow-md flex items-center justify-center`}>
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
          </div>
        )}
      </main>

      {/* 5. Mobile Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 ${theme.secondaryBg} border-t ${theme.border} px-6 py-2.5 flex items-center justify-around sm:hidden shadow-lg backdrop-blur-lg bg-opacity-95`}>
        <button 
          onClick={() => {
            setSelectedCategory('Todos');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 ${selectedCategory === 'Todos' ? theme.primaryText : theme.mutedText}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-bold">Início</span>
        </button>

        <button 
          onClick={() => {
            setCheckoutStep('cart');
            setIsCartOpen(true);
          }}
          className={`flex flex-col items-center gap-1 relative ${totalItems > 0 ? theme.primaryText : theme.mutedText}`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">Carrinho</span>
        </button>

        <button 
          onClick={() => router.push(`/${store.slug}/rastreio`)}
          className={`flex flex-col items-center gap-1 ${theme.mutedText} hover:opacity-80`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-bold">Pedidos</span>
        </button>
      </div>

      {/* Floating Cart Button for Desktop / Tablet */}
      {totalItems > 0 && !isCartOpen && (
        <div className="hidden sm:flex fixed bottom-6 left-0 right-0 px-4 sm:px-0 z-30 justify-center animate-in slide-in-from-bottom-10">
          <button
            onClick={() => {
              setCheckoutStep('cart');
              setIsCartOpen(true);
            }}
            className={`w-full max-w-md ${theme.primaryBg} ${theme.primaryHover} text-white rounded-2xl shadow-2xl py-4 px-6 flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/10`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-extrabold">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Ver Pedido</span>
              <span className="font-extrabold ml-2 border-l border-white/20 pl-3">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotalValue)}
              </span>
            </div>
          </button>
        </div>
      )}

      {renderProductModal()}

      {/* Modal / Tela de Perfil da Loja (Match idêntico aos 3 prints do Anota AI) */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-right duration-200">
          {/* Header com botão voltar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3.5 flex items-center gap-4 z-10">
            <button 
              onClick={() => setIsProfileOpen(false)} 
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowRight className="w-6 h-6 text-gray-700 rotate-180" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Perfil da loja</h1>
          </div>

          {/* Sub-header Banner */}
          <div className="bg-[#f7f0e7] p-4 text-center border-b border-amber-900/10">
            <p className="font-bold text-amber-950 text-sm mb-1">Apenas pedidos agendados, Faça já o seu!</p>
            <p className="text-xs text-amber-900/70 font-medium">
              {store.opening_hours ? `Horários: ${store.opening_hours}` : 'Horários a partir das 18h'} • Sem pedido mínimo
            </p>
          </div>

          <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 pb-16">
            
            {/* Horário de Atendimento */}
            <section>
              <h2 className="text-xl font-extrabold text-[#2d2926] mb-4">Horário de atendimento</h2>
              <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {[
                  { day: 'Domingo', hours: store.opening_hours || '18h às 23h' },
                  { day: 'Segunda-feira', hours: 'Fechado' },
                  { day: 'Terça-feira', hours: store.opening_hours || '18h às 23h' },
                  { day: 'Quarta-feira', hours: store.opening_hours || '18h às 23h' },
                  { day: 'Quinta-feira', hours: store.opening_hours || '18h às 23h' },
                  { day: 'Sexta-feira', hours: store.opening_hours || '18h às 23h' },
                  { day: 'Sábado', hours: store.opening_hours || '18h às 23h' }
                ].map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-800">{item.day}:</span>
                    <span className="text-gray-500 font-medium">{item.hours}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Formas de Pagamento */}
            <section className="space-y-6">
              <h2 className="text-xl font-extrabold text-[#2d2926]">Formas de pagamento</h2>

              {/* Online */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pagamento online</p>
                <div className="space-y-3">
                  {store.accepts_pix !== false && (
                    <div className="flex items-center gap-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">
                        ❖
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Pix</p>
                        <p className="text-xs text-gray-500">Pagamento online</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                      💳
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Cartão de crédito (Online)</p>
                      <p className="text-xs text-gray-500">Pagamento online</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Na Entrega */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pagamento na entrega</p>
                <div className="flex flex-wrap gap-2">
                  {['Mastercard Débito', 'Visa Crédito', 'American Express crédito', 'Mastercard Crédito', 'Elo Crédito', 'Elo Débito', 'Visa Débito', 'Hipercard débito', 'Dinners crédito', 'Hipercard crédito'].map((card, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 font-semibold text-xs px-3 py-2 rounded-xl border border-gray-200">
                      {card}
                    </span>
                  ))}
                  {store.accepts_cash !== false && (
                    <span className="bg-gray-100 text-gray-700 font-semibold text-xs px-3 py-2 rounded-xl border border-gray-200">
                      Dinheiro em espécie
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Endereço */}
            <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#2d2926]">Endereço</h2>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">
                  {store.street || 'Rua José Franco Pimentel, 57'}, {store.block ? `Qd. ${store.block}` : 'Centro'}, {store.neighborhood || 'Luziânia - GO'}, Brasil
                </p>
                <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
              </div>

              {/* Mapa Google Maps Embed */}
              <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100">
                <iframe
                  title="Mapa do Estabelecimento"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${store.street || ''} ${store.neighborhood || ''} ${store.name}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </section>

          </div>
        </div>
      )}

      {/* Slide-over Cart & Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => {
            setIsCartOpen(false);
            if (checkoutStep === 'success') setCheckoutStep('cart');
          }} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
            <div className={`w-full h-full ${theme.cartBg} shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-2xl sm:rounded-none overflow-hidden`}>
              
              <div className="px-5 py-4 border-b border-gray-200/20 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {checkoutStep === 'cart' && <ShoppingCart className={`w-5 h-5 ${theme.primaryText}`} />}
                  {checkoutStep === 'checkout' && <CreditCard className={`w-5 h-5 ${theme.primaryText}`} />}
                  {checkoutStep === 'cart' ? 'Seu Pedido' : 'Finalizar Pedido'}
                </h2>
                <button onClick={() => {
                  setIsCartOpen(false);
                  if (checkoutStep === 'success') setCheckoutStep('cart');
                }} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {checkoutStep === 'success' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <CheckCircle2 className="w-20 h-20 text-green-500" />
                    <h3 className="text-2xl font-bold">Pedido Enviado!</h3>
                    
                    {paymentMethod === 'pix' ? (
                      <div className="bg-gray-100 p-4 rounded-xl w-full">
                        <p className="font-semibold text-gray-800 mb-2">Finalize seu pagamento via PIX</p>
                        <p className="text-xl font-bold text-gray-900 mb-2">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotalValue)}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">Copie a chave PIX abaixo para pagar.</p>
                        <div className="flex flex-col gap-2">
                           <div className="bg-gray-200 p-3 rounded-lg text-sm font-mono break-all text-gray-800 text-center font-semibold">
                             {store.pix_key || 'Chave não configurada'}
                           </div>
                           <button 
                             onClick={(e) => {
                               navigator.clipboard.writeText(store.pix_key || '');
                               const target = e.currentTarget;
                               target.innerText = "Chave Copiada!";
                               setTimeout(() => { target.innerText = "Copiar Chave PIX" }, 2000);
                             }}
                             className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-semibold py-3 rounded-lg transition-colors mb-4`}
                           >
                             Copiar Chave PIX
                           </button>

                           <div className="border-t border-gray-200 pt-4 mt-2">
                             <p className="text-sm text-gray-600 mb-3 font-medium">Após realizar o pagamento, envie o comprovante pelo WhatsApp:</p>
                             <a 
                               href={`https://wa.me/55${(store.pix_receipt_phone || store.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Acabei de fazer um pedido na ${store.name}. Paguei via PIX e este é o meu comprovante:`)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                             >
                               <Phone className="w-5 h-5" /> Enviar Comprovante no WhatsApp
                             </a>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <p className="opacity-70 max-w-[250px]">O restaurante já recebeu seu pedido. Aguarde o contato ou acompanhe o status.</p>
                    )}
                    
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        setCheckoutStep('cart');
                      }}
                      className={`mt-4 px-6 py-3 rounded-xl ${theme.primaryBg} text-white font-semibold`}
                    >
                      Voltar ao Cardápio
                    </button>
                  </div>
                ) : checkoutStep === 'cart' ? (
                  <>
                    {cart.length === 0 ? (
                      <div className="text-center py-16 opacity-50">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-medium">Seu pedido está vazio.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex flex-col gap-3 p-4 bg-gray-500/5 rounded-2xl">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-bold flex-1">{item.quantity}x {item.product.name}</h4>
                              <p className="font-semibold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                              </p>
                            </div>
                            
                            {(item.removedIngredients.length > 0 || Object.keys(item.extraIngredients).length > 0) && (
                              <div className="text-sm opacity-70 space-y-1">
                                {item.removedIngredients.map(id => {
                                  const ing = item.product.ingredients?.find((i, idx) => (i.id || `ing-${idx}`) === id);
                                  return ing ? <p key={id}>Sem: {ing.name}</p> : null;
                                })}
                                {Object.entries(item.extraIngredients).map(([id, qty]) => {
                                  if (qty === 0) return null;
                                  const ing = item.product.ingredients?.find((i, idx) => (i.id || `ing-${idx}`) === id);
                                  return ing ? <p key={id}>Extra: {qty}x {ing.name}</p> : null;
                                })}
                              </div>
                            )}
                            
                            <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 self-start mt-2 font-medium">Remover item</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-bold border-b border-gray-200/20 pb-2">Seus Dados</h3>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Nome Completo</label>
                        <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} className={`w-full rounded-xl p-3 ${theme.inputBg} focus:ring-2 focus:ring-${theme.primaryText.split('-')[1]}-500`} placeholder="João Silva" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1">WhatsApp</label>
                          <input required type="tel" value={clientWhatsapp} onChange={e => setClientWhatsapp(e.target.value)} className={`w-full rounded-xl p-3 ${theme.inputBg} focus:ring-2 focus:ring-${theme.primaryText.split('-')[1]}-500`} placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">CPF (Opcional)</label>
                          <input type="text" value={customerCpf} onChange={e => setCustomerCpf(e.target.value)} className={`w-full rounded-xl p-3 ${theme.inputBg} focus:ring-2 focus:ring-${theme.primaryText.split('-')[1]}-500`} placeholder="000.000.000-00" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold border-b border-gray-200/20 pb-2">Tipo de Pedido</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'delivery', label: 'Delivery' },
                          { id: 'retirada_comer', label: 'Comer no Local' },
                          { id: 'retirada_levar', label: 'Para Levar' }
                        ].map(type => (
                          <label key={type.id} className={`cursor-pointer rounded-xl p-3 text-center text-sm font-semibold border-2 transition-colors ${orderType === type.id ? `border-${theme.primaryText.split('-')[1]}-500 bg-${theme.primaryText.split('-')[1]}-500/10` : 'border-transparent bg-gray-500/5 hover:bg-gray-500/10'}`}>
                            <input type="radio" name="orderType" value={type.id} checked={orderType === type.id} onChange={e => setOrderType(e.target.value)} className="sr-only" />
                            {type.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {orderType === 'delivery' && (
                      <div className="space-y-4 animate-in slide-in-from-top-4">
                        <h3 className="font-bold border-b border-gray-200/20 pb-2">Endereço de Entrega</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-3">
                            <label className="block text-sm font-semibold mb-1">Rua / Avenida</label>
                            <input required type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className={`w-full rounded-xl p-3 ${theme.inputBg}`} />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-sm font-semibold mb-1">Número</label>
                            <input required type="text" value={address.number} onChange={e => setAddress({...address, number: e.target.value})} className={`w-full rounded-xl p-3 ${theme.inputBg}`} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1">Bairro *</label>
                            {deliveryZones.length > 0 ? (
                              <select 
                                required 
                                value={address.neighborhood} 
                                onChange={e => setAddress({...address, neighborhood: e.target.value})} 
                                className={`w-full rounded-xl p-3 ${theme.inputBg}`}
                              >
                                <option value="">Selecione seu bairro...</option>
                                {deliveryZones.map(zone => (
                                  <option key={zone.id} value={zone.neighborhood_name}>
                                    {zone.neighborhood_name} (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(zone.fee)})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                                Entrega indisponível: Nenhuma taxa de bairro cadastrada nesta loja.
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-1">Complemento</label>
                            <input type="text" value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})} className={`w-full rounded-xl p-3 ${theme.inputBg}`} placeholder="Apto, Bloco..." />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-bold border-b border-gray-200/20 pb-2">Pagamento</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'pix', label: 'PIX (Automático)', active: store.accepts_pix !== false },
                          { id: 'cartao', label: 'Cartão (pagar na entrega)', active: store.accepts_card !== false },
                          { id: 'dinheiro', label: 'Dinheiro', active: store.accepts_cash !== false }
                        ].filter(t => t.active).map(type => (
                          <label key={type.id} className={`cursor-pointer rounded-xl p-3 text-center text-sm font-semibold border-2 transition-colors ${paymentMethod === type.id ? `border-${theme.primaryText.split('-')[1]}-500 bg-${theme.primaryText.split('-')[1]}-500/10` : 'border-transparent bg-gray-500/5 hover:bg-gray-500/10'}`}>
                            <input required type="radio" name="paymentMethod" value={type.id} checked={paymentMethod === type.id} onChange={e => setPaymentMethod(e.target.value)} className="sr-only" />
                            {type.label}
                          </label>
                        ))}
                      </div>

                      {paymentMethod === 'dinheiro' && (
                        <div className="animate-in slide-in-from-top-2 pt-2">
                          <label className="block text-sm font-semibold mb-1">Troco para quanto?</label>
                          <input 
                            type="text" 
                            value={changeFor} 
                            onChange={e => setChangeFor(e.target.value)} 
                            className={`w-full rounded-xl p-3 ${theme.inputBg} focus:ring-2 focus:ring-${theme.primaryText.split('-')[1]}-500`} 
                            placeholder="Ex: 50, 100, ou deixe em branco se não precisar" 
                          />
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {checkoutStep !== 'success' && (
                <div className="p-5 border-t border-gray-200/20 bg-black/5">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm opacity-80">
                      <span>Subtotal</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotalValue)}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-sm opacity-80">
                        <span>Taxa de Entrega</span>
                        <span>{deliveryFee === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deliveryFee)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200/20 flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotalValue)}</span>
                    </div>
                  </div>
                  
                  {checkoutStep === 'cart' ? (
                    <button
                      disabled={cart.length === 0 || store.is_open === false}
                      onClick={() => setCheckoutStep('checkout')}
                      className={`w-full ${theme.primaryBg} ${theme.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg`}
                    >
                      {store.is_open === false ? 'Loja Fechada para Pedidos' : 'Continuar para Pagamento'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isSubmitting || store.is_open === false}
                      className={`w-full ${theme.primaryBg} ${theme.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg`}
                    >
                      {isSubmitting ? 'Processando...' : store.is_open === false ? 'Loja Fechada' : 'Confirmar Pedido'}
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
