'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Store as StoreIcon, Check, MapPin, CreditCard, User, Phone, CheckCircle2 } from 'lucide-react';
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

export default function StoreFrontClient({ store, products, deliveryZones = [] }: { store: any; products: Product[]; deliveryZones?: any[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  
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

  const getThemeClasses = () => {
    const isDark = store.theme_mode === 'preto';

    switch (store.store_category) {
      case 'restaurante':
        return isDark ? {
          bg: 'bg-stone-900',
          text: 'text-stone-100',
          primaryBg: 'bg-amber-700',
          primaryHover: 'hover:bg-amber-600',
          primaryText: 'text-amber-500',
          secondaryBg: 'bg-stone-800',
          border: 'border-stone-800',
          mutedText: 'text-stone-400',
          cartBg: 'bg-stone-900 text-stone-100',
          inputBg: 'bg-stone-800 text-white border-stone-700',
        } : {
          bg: 'bg-amber-50/50',
          text: 'text-stone-900',
          primaryBg: 'bg-amber-800',
          primaryHover: 'hover:bg-amber-900',
          primaryText: 'text-amber-800',
          secondaryBg: 'bg-white',
          border: 'border-amber-200/60',
          mutedText: 'text-stone-600',
          cartBg: 'bg-white text-stone-900',
          inputBg: 'bg-white text-stone-900 border-amber-200',
        };
      case 'hamburgueria':
        return isDark ? {
          bg: 'bg-stone-900',
          text: 'text-stone-100',
          primaryBg: 'bg-amber-500',
          primaryHover: 'hover:bg-amber-600',
          primaryText: 'text-amber-500',
          secondaryBg: 'bg-stone-800',
          border: 'border-stone-800',
          mutedText: 'text-stone-400',
          cartBg: 'bg-stone-900 text-stone-100',
          inputBg: 'bg-stone-800 text-white border-stone-700',
        } : {
          bg: 'bg-amber-50',
          text: 'text-amber-950',
          primaryBg: 'bg-amber-500',
          primaryHover: 'hover:bg-amber-600',
          primaryText: 'text-amber-600',
          secondaryBg: 'bg-white',
          border: 'border-amber-200',
          mutedText: 'text-amber-800/70',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-white text-gray-900 border-amber-200',
        };
      case 'pizzaria':
        return isDark ? {
          bg: 'bg-stone-950',
          text: 'text-red-50',
          primaryBg: 'bg-red-600',
          primaryHover: 'hover:bg-red-700',
          primaryText: 'text-red-500',
          secondaryBg: 'bg-stone-900',
          border: 'border-stone-800',
          mutedText: 'text-stone-400',
          cartBg: 'bg-stone-900 text-stone-100',
          inputBg: 'bg-stone-800 text-white border-stone-700',
        } : {
          bg: 'bg-red-50',
          text: 'text-red-950',
          primaryBg: 'bg-red-600',
          primaryHover: 'hover:bg-red-700',
          primaryText: 'text-red-600',
          secondaryBg: 'bg-white',
          border: 'border-red-100',
          mutedText: 'text-red-700/70',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
      case 'acaiteria':
        return isDark ? {
          bg: 'bg-purple-950',
          text: 'text-white',
          primaryBg: 'bg-fuchsia-500',
          primaryHover: 'hover:bg-fuchsia-600',
          primaryText: 'text-fuchsia-400',
          secondaryBg: 'bg-purple-900',
          border: 'border-purple-800',
          mutedText: 'text-purple-300',
          cartBg: 'bg-purple-900 text-white',
          inputBg: 'bg-purple-900 text-white border-purple-800',
        } : {
          bg: 'bg-purple-50',
          text: 'text-purple-950',
          primaryBg: 'bg-fuchsia-600',
          primaryHover: 'hover:bg-fuchsia-700',
          primaryText: 'text-fuchsia-600',
          secondaryBg: 'bg-white',
          border: 'border-purple-100',
          mutedText: 'text-purple-700/70',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
      default: // lanchonete or fallback
        return isDark ? {
          bg: 'bg-slate-950',
          text: 'text-slate-100',
          primaryBg: 'bg-indigo-500',
          primaryHover: 'hover:bg-indigo-600',
          primaryText: 'text-indigo-400',
          secondaryBg: 'bg-slate-900',
          border: 'border-slate-800',
          mutedText: 'text-slate-400',
          cartBg: 'bg-slate-900 text-slate-100',
          inputBg: 'bg-slate-800 text-white border-slate-700',
        } : {
          bg: 'bg-gray-50',
          text: 'text-gray-900',
          primaryBg: 'bg-indigo-600',
          primaryHover: 'hover:bg-indigo-700',
          primaryText: 'text-indigo-600',
          secondaryBg: 'bg-white',
          border: 'border-gray-200',
          mutedText: 'text-gray-500',
          cartBg: 'bg-white text-gray-900',
          inputBg: 'bg-gray-50 text-gray-900 border-gray-200',
        };
    }
  };

  const theme = getThemeClasses();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setRemovedIngs([]);
    setExtraIngs({});
    setItemQuantity(1);
  };

  const currentItemPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let price = Number(selectedProduct.price);
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
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${theme.secondaryBg} border-b ${theme.border} sticky top-0 z-30 shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme.primaryBg} flex items-center justify-center text-white shadow-sm`}>
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{store.name}</h1>
              {store.description && <p className={`text-xs ${theme.mutedText} line-clamp-1`}>{store.description}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-2">Cardápio Digital</h2>
          <p className={theme.mutedText}>Escolha seus produtos e personalize do seu jeito.</p>
        </div>

        {products.length === 0 ? (
          <div className={`${theme.secondaryBg} rounded-2xl p-8 text-center border ${theme.border}`}>
            <p className={theme.mutedText}>Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <div 
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`${theme.secondaryBg} border ${theme.border} rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow group`}
              >
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-bold text-lg mb-1 group-hover:underline decoration-2 underline-offset-2">{product.name}</h3>
                  <p className={`text-sm ${theme.mutedText} line-clamp-2 mb-3 flex-1`}>{product.description}</p>
                  <div className="font-bold text-lg mt-auto">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </div>
                </div>
                {product.image_url ? (
                  <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center text-gray-300">
                    Sem foto
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-4 sm:px-0 z-20 flex justify-center animate-in slide-in-from-bottom-10">
          <button
            onClick={() => {
              setCheckoutStep('cart');
              setIsCartOpen(true);
            }}
            className={`w-full max-w-md ${theme.primaryBg} ${theme.primaryHover} text-white rounded-2xl shadow-xl py-4 px-5 flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Ver Pedido</span>
              <span className="font-bold ml-2 border-l border-white/20 pl-3">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotalValue)}
              </span>
            </div>
          </button>
        </div>
      )}

      {renderProductModal()}

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
                        <p className="text-sm text-gray-600 mb-4">Escaneie o QR Code ou copie a chave PIX abaixo.</p>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block mb-4">
                           {/* Placeholder for QR Code */}
                           <div className="w-32 h-32 bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 font-mono text-center">QR CODE<br/>PIX</div>
                        </div>
                        <div className="flex flex-col gap-2">
                           <div className="bg-gray-200 p-2 rounded text-xs font-mono break-all text-gray-700">
                             00020101021126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Nome da Loja6008S. Paulo62070503***63041D3D
                           </div>
                           <button 
                             onClick={(e) => {
                               navigator.clipboard.writeText("00020101021126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Nome da Loja6008S. Paulo62070503***63041D3D");
                               const target = e.currentTarget;
                               target.innerText = "Chave Copiada!";
                               setTimeout(() => { target.innerText = "Copiar Chave PIX" }, 2000);
                             }}
                             className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-semibold py-2 rounded-lg transition-colors mb-4`}
                           >
                             Copiar Chave PIX
                           </button>

                           <div className="border-t border-gray-200 pt-4 mt-2">
                             <p className="text-sm text-gray-600 mb-3 font-medium">Após realizar o pagamento, envie o comprovante pelo WhatsApp:</p>
                             <a 
                               href={`https://wa.me/55${(store.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Acabei de fazer um pedido na ${store.name}. Paguei via PIX e este é o meu comprovante:`)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                             >
                               <Phone className="w-5 h-5" /> Enviar Comprovante
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
                            <label className="block text-sm font-semibold mb-1">Bairro</label>
                            {deliveryZones.length > 0 ? (
                              <select 
                                required 
                                value={address.neighborhood} 
                                onChange={e => setAddress({...address, neighborhood: e.target.value})} 
                                className={`w-full rounded-xl p-3 ${theme.inputBg}`}
                              >
                                <option value="">Selecione um bairro</option>
                                {deliveryZones.map(zone => (
                                  <option key={zone.id} value={zone.neighborhood_name}>
                                    {zone.neighborhood_name} (+{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(zone.fee)})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input 
                                required 
                                type="text" 
                                value={address.neighborhood} 
                                onChange={e => setAddress({...address, neighborhood: e.target.value})} 
                                className={`w-full rounded-xl p-3 ${theme.inputBg}`} 
                              />
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
                          { id: 'pix', label: 'PIX (Automático)' },
                          { id: 'cartao', label: 'Cartão (pagar na entrega)' },
                          { id: 'dinheiro', label: 'Dinheiro' }
                        ].map(type => (
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
                      disabled={cart.length === 0}
                      onClick={() => setCheckoutStep('checkout')}
                      className={`w-full ${theme.primaryBg} ${theme.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg`}
                    >
                      Continuar para Pagamento
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isSubmitting}
                      className={`w-full ${theme.primaryBg} ${theme.primaryHover} disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg`}
                    >
                      {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
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
