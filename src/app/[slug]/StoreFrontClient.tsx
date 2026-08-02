'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Store as StoreIcon, Check, CreditCard, User, Phone, CheckCircle2, Sparkles, Utensils, Home, Percent, ChevronDown, ChevronUp, AlertCircle, Edit, Trash2, Wallet, MapPin, Smartphone, DollarSign, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

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

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  is_promotional?: boolean;
  image_url: string;
  category: string;
  complement_group_ids?: string[];
  is_available?: boolean;
};

type SelectedComplement = {
  groupName: string;
  items: { name: string; price: number; quantity: number }[];
};

type CartItem = {
  id: string; // unique id for this cart item instance
  product: Product;
  quantity: number;
  selectedComplements: SelectedComplement[];
  observations: string;
  unitPrice: number; // calculated base on extras
};

export default function StoreFrontClient({ 
  store, 
  products, 
  deliveryZones = [],
  categories = [],
  complementGroups = []
}: { 
  store: any; 
  products: Product[]; 
  deliveryZones?: any[]; 
  categories?: any[]; 
  complementGroups?: ComplementGroup[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Customization Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // groupId -> { itemName -> quantity }
  const [selectedComplements, setSelectedComplements] = useState<Record<string, Record<string, number>>>({});
  const [observations, setObservations] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);

  // Checkout Form State
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [orderType, setOrderType] = useState('delivery'); // delivery, retirada_comer, retirada_levar
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: '', complement: '' });
  const [changeFor, setChangeFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(store.is_open !== false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      // Se fechado manualmente, prevalece
      if (store.is_open === false) {
        setIsStoreOpen(false);
        return;
      }
      
      let openDaysList = store.open_days;
      if (typeof openDaysList === 'string') {
        try { openDaysList = JSON.parse(openDaysList); } catch(e) {}
      }

      // Se possui configuração inteligente de dias e horários
      if (openDaysList && Array.isArray(openDaysList) && store.open_time && store.close_time) {
        const now = new Date();
        const currentDay = now.getDay();
        const yesterdayDay = currentDay === 0 ? 6 : currentDay - 1;
        
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const currentHourStr = `${h}:${m}`;
        
        const openTime = (store.open_time || '18:00').substring(0, 5);
        const closeTime = (store.close_time || '23:30').substring(0, 5);
        
        let isOpenNow = false;

        if (openTime <= closeTime) {
          // Horário comercial normal. Ex: 08:00 as 23:00 (mesmo dia)
          if (openDaysList.includes(currentDay)) {
            if (currentHourStr >= openTime && currentHourStr <= closeTime) {
              isOpenNow = true;
            }
          }
        } else {
          // Vira a madrugada. Ex: 18:00 as 02:00
          
          // Caso 1: Estamos antes da meia-noite (ex: 19:00). Pertence ao expediente de HOJE.
          if (currentHourStr >= openTime) {
            if (openDaysList.includes(currentDay)) {
              isOpenNow = true;
            }
          }
          // Caso 2: Estamos depois da meia-noite (ex: 01:00). Pertence ao expediente de ONTEM.
          else if (currentHourStr <= closeTime) {
            if (openDaysList.includes(yesterdayDay)) {
              isOpenNow = true;
            }
          }
        }

        setIsStoreOpen(isOpenNow);
      } else {
        // Sem configuração inteligente, usa o manual
        setIsStoreOpen(store.is_open !== false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [store.is_open, store.open_days, store.open_time, store.close_time]);

  // Derived values for UI
  const formatTimeStr = (t?: string) => t ? t.substring(0, 5) : '';
  const displayHours = (store.open_time && store.close_time) 
    ? `${formatTimeStr(store.open_time)} às ${formatTimeStr(store.close_time)}`
    : (store.opening_hours || '18:00 às 23:30');

  const daysOfWeek = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Segunda-feira' },
    { id: 2, name: 'Terça-feira' },
    { id: 3, name: 'Quarta-feira' },
    { id: 4, name: 'Quinta-feira' },
    { id: 5, name: 'Sexta-feira' },
    { id: 6, name: 'Sábado' },
  ];
  let openDaysArr = [0, 1, 2, 3, 4, 5, 6];
  if (store.open_days) {
    let arr = store.open_days;
    if (typeof arr === 'string') {
      try { arr = JSON.parse(arr); } catch(e) {}
    }
    if (Array.isArray(arr)) {
      openDaysArr = arr;
    }
  }

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
    return products.some(p => p.is_promotional && p.discount_price !== null);
  }, [products]);

  const categoryTabs = useMemo(() => {
    const names: string[] = [];
    if (hasOffers) {
      names.push('Ofertas');
    }
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        if (c && c.name && !names.includes(c.name) && c.name !== 'Ofertas') {
          names.push(c.name);
        }
      });
    }
    products.forEach(p => {
      const catName = p.category || 'Outros';
      if (!names.includes(catName) && catName !== 'Ofertas') {
        names.push(catName);
      }
    });
    return names;
  }, [products, categories, hasOffers]);

  const handleProductClick = (product: Product) => {
    if (!isStoreOpen) {
      setToastMessage(`O estabelecimento ${store.name} está fechado no momento e não está aceitando pedidos.`);
      return;
    }
    setSelectedProduct(product);
    setSelectedComplements({});
    setObservations('');
    setItemQuantity(1);
    
    // Initialize expanded groups (all open by default)
    if (product.complement_group_ids) {
      const initialExpanded: Record<string, boolean> = {};
      product.complement_group_ids.forEach(id => {
        initialExpanded[id] = true;
      });
      setExpandedGroups(initialExpanded);
    }
  };

  const productGroups = useMemo(() => {
    if (!selectedProduct || !selectedProduct.complement_group_ids) return [];
    return complementGroups.filter(g => selectedProduct.complement_group_ids!.includes(g.id));
  }, [selectedProduct, complementGroups]);

  const currentItemPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    
    let price = selectedProduct.is_promotional && selectedProduct.discount_price !== null 
      ? Number(selectedProduct.discount_price) 
      : Number(selectedProduct.price);
      
    Object.entries(selectedComplements).forEach(([groupId, items]) => {
      const group = productGroups.find(g => g.id === groupId);
      if (!group) return;
      
      Object.entries(items).forEach(([itemName, qty]) => {
        const item = group.items.find(i => i.name === itemName);
        if (item && item.price) {
          price += (Number(item.price) * qty);
        }
      });
    });
    
    return price;
  }, [selectedProduct, selectedComplements, productGroups]);

  const isAddToCartDisabled = useMemo(() => {
    if (!selectedProduct) return true;
    for (const group of productGroups) {
      if (group.is_mandatory) {
        const selectedInGroup = selectedComplements[group.id] || {};
        const totalSelected = Object.values(selectedInGroup).reduce((sum, qty) => sum + qty, 0);
        if (totalSelected < group.min_choices) {
          return true; // Missing mandatory selections
        }
      }
    }
    return false;
  }, [productGroups, selectedComplements, selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct || isAddToCartDisabled) return;
    
    // Format selected complements for the cart item
    const formattedComplements: SelectedComplement[] = [];
    Object.entries(selectedComplements).forEach(([groupId, items]) => {
      const group = productGroups.find(g => g.id === groupId);
      if (!group) return;
      
      const selectedItems = Object.entries(items)
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => {
          const item = group.items.find(i => i.name === name);
          return { name, price: Number(item?.price || 0), quantity: qty };
        });
        
      if (selectedItems.length > 0) {
        formattedComplements.push({
          groupName: group.name,
          items: selectedItems
        });
      }
    });
    
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(7),
      product: selectedProduct,
      quantity: itemQuantity,
      selectedComplements: formattedComplements,
      observations: observations,
      unitPrice: currentItemPrice
    };

    if (editingCartIndex !== null) {
      const newCart = [...cart];
      newCart[editingCartIndex] = newItem;
      setCart(newCart);
      setEditingCartIndex(null);
    } else {
      setCart([...cart, newItem]);
    }
    setSelectedProduct(null);
    setObservations('');
    setItemQuantity(1);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const handleEditCartItem = (index: number) => {
    const item = cart[index];
    
    // Reconstruct selectedComplements mapping from the formatted array
    const reconstructedComplements: Record<string, Record<string, number>> = {};
    const productGroups = (item.product.complement_group_ids || [])
      .map(id => complementGroups?.find(g => g.id === id))
      .filter(Boolean) as ComplementGroup[];

    item.selectedComplements.forEach(cartGroup => {
      const originalGroup = productGroups.find(g => g.name === cartGroup.groupName);
      if (originalGroup) {
        if (!reconstructedComplements[originalGroup.id]) {
          reconstructedComplements[originalGroup.id] = {};
        }
        cartGroup.items.forEach(cartItem => {
          reconstructedComplements[originalGroup.id][cartItem.name] = cartItem.quantity;
        });
      }
    });

    setEditingCartIndex(index);
    setSelectedComplements(reconstructedComplements);
    setItemQuantity(item.quantity);
    setObservations(item.observations || '');
    setSelectedProduct(item.product);
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
    
    if (!isStoreOpen) {
      setToastMessage(`O estabelecimento ${store.name} está fechado no momento e não está aceitando pedidos.`);
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
          deliveryFee: deliveryFee,
          deliveryNeighborhood: orderType === 'delivery' ? address.neighborhood : null,
          deliveryAddress: fullAddress
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCheckoutStep('success');
        setCart([]);
        // Optional: Reset payment method so next order doesn't default to PIX if they don't want it
        setPaymentMethod('');
        setChangeFor('');
      } else {
        if (data.error) {
          setToastMessage(data.error || 'Erro ao processar pedido.');
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      setToastMessage('Erro de conexão ao enviar pedido.');
      setIsSubmitting(false);
    }
  };

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedProduct(null); setEditingCartIndex(null); }} />
        <div className={`relative w-full max-w-lg ${theme.cartBg} rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}>
          <div className="relative h-48 sm:h-56 shrink-0 rounded-t-2xl overflow-hidden">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{
                backgroundColor: '#f5f4f2',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23e0ddd8' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'/%3E%3Cpath d='M7 2v20'/%3E%3Cpath d='M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'/%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px',
              }} />
            )}
            <button onClick={() => { setSelectedProduct(null); setEditingCartIndex(null); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-1">{selectedProduct.name}</h2>
            <p className="text-sm opacity-70 mb-4">{selectedProduct.description}</p>
            
            {productGroups.length > 0 && (
              <div className="space-y-4 border-t border-gray-200/20 pt-4">
                {productGroups.map((group) => {
                  const isExpanded = expandedGroups[group.id] !== false;
                  const groupSelections = selectedComplements[group.id] || {};
                  const totalSelected = Object.values(groupSelections).reduce((sum, qty) => sum + qty, 0);
                  const isSatisfied = group.is_mandatory ? totalSelected >= group.min_choices : true;

                  return (
                    <div key={group.id} className="border border-gray-200/20 rounded-xl overflow-hidden bg-gray-500/5">
                      <button 
                        onClick={() => setExpandedGroups({...expandedGroups, [group.id]: !isExpanded})}
                        className="w-full flex items-center justify-between p-4 bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <div className="flex flex-col items-start text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{group.name}</span>
                            {group.is_mandatory ? (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">
                                Obrigatório
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                                Opcional
                              </span>
                            )}
                          </div>
                          {group.max_choices < 99 && (
                            <span className="text-xs text-gray-500 mt-1">
                              {group.is_mandatory ? `Escolha de ${group.min_choices} até ${group.max_choices} opções` : `Escolha até ${group.max_choices} opções`}
                            </span>
                          )}
                          {group.max_choices >= 99 && group.is_mandatory && (
                            <span className="text-xs text-gray-500 mt-1">
                              Escolha pelo menos {group.min_choices} opções
                            </span>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                      </button>

                      {isExpanded && (
                        <div className="p-2 space-y-1">
                          {group.items.filter(item => item.is_available !== false).map((item, idx) => {
                            const qty = groupSelections[item.name] || 0;
                            const canAddMore = group.max_choices >= 99 || totalSelected < group.max_choices;
                            
                            return (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 transition-colors">
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm text-gray-900">{item.name}</span>
                                  {Number(item.price) > 0 && (
                                    <span className="text-xs text-gray-500 font-semibold mt-0.5">
                                      + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                    </span>
                                  )}
                                </div>
                                
                                {group.max_choices === 1 ? (
                                  <input 
                                    type="radio" 
                                    name={`group-${group.id}`}
                                    checked={qty > 0}
                                    onChange={() => {
                                      setSelectedComplements({
                                        ...selectedComplements,
                                        [group.id]: { [item.name]: 1 }
                                      });
                                    }}
                                    className="w-5 h-5 border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                  />
                                ) : qty === 0 ? (
                                  <button
                                    type="button"
                                    disabled={!canAddMore}
                                    onClick={() => {
                                      setSelectedComplements({
                                        ...selectedComplements,
                                        [group.id]: {
                                          ...groupSelections,
                                          [item.name]: 1
                                        }
                                      });
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                                  >
                                    <PlusCircle className="w-6 h-6" />
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-3 bg-gray-200/50 rounded-full px-2 py-1">
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setSelectedComplements({
                                          ...selectedComplements,
                                          [group.id]: {
                                            ...groupSelections,
                                            [item.name]: Math.max(0, qty - 1)
                                          }
                                        });
                                      }}
                                      className="p-1 rounded-full hover:bg-gray-300/50 transition-colors"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-sm font-medium w-4 text-center">{qty}</span>
                                    <button 
                                      type="button"
                                      disabled={!canAddMore}
                                      onClick={() => {
                                        setSelectedComplements({
                                          ...selectedComplements,
                                          [group.id]: {
                                            ...groupSelections,
                                            [item.name]: qty + 1
                                          }
                                        });
                                      }}
                                      className="p-1 rounded-full hover:bg-gray-300/50 disabled:opacity-30 transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2">Alguma observação?</label>
              <textarea 
                rows={3}
                placeholder="Ex: Tirar cebola, maionese à parte..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className={`w-full rounded-xl p-3 ${theme.inputBg} focus:ring-2 focus:ring-${theme.primaryText.split('-')[1]}-500 resize-none`}
              />
            </div>
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
              disabled={isAddToCartDisabled}
              className={`w-full ${isAddToCartDisabled ? 'bg-gray-300 cursor-not-allowed opacity-70 text-gray-500' : `${theme.primaryBg} ${theme.primaryHover} text-white`} py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddToCartDisabled ? 'Selecione os itens obrigatórios' : 'Adicionar ao Pedido'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 pb-20 relative`}>
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-purple-100 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 border border-purple-100">
                <AlertCircle className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Atenção</h3>
              <p className="text-gray-600 mb-6 font-medium">{toastMessage}</p>
              
              <button 
                onClick={() => setToastMessage(null)}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-purple-200 focus:outline-none"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
            {isStoreOpen ? (
              <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Loja Aberta
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Loja Fechada
              </span>
            )}
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-gray-600">
              Horários: {displayHours} • Sem pedido mínimo
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

      {!isStoreOpen && (
        <div className="bg-red-50 border-y border-red-200 py-3 px-4 text-center">
          <p className="text-sm font-bold text-red-800 flex items-center justify-center gap-2">
            O estabelecimento está fechado para pedidos no momento. Horário de atendimento: {displayHours}
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
                const categoryProducts = category === 'Ofertas'
                  ? products.filter(p => p.is_promotional && p.discount_price !== null && p.is_available !== false)
                  : products.filter(p => (p.category || 'Outros') === category && p.is_available !== false);

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
                                <h4 className={`font-bold text-base sm:text-lg ${theme.hoverText} transition-colors leading-snug`} style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                                  {product.name}
                                </h4>
                                {(product.is_promotional && product.discount_price !== null) && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center gap-0.5 uppercase tracking-wider shadow-sm">
                                    <Percent className="w-2.5 h-2.5" /> Oferta
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs sm:text-sm ${theme.mutedText} line-clamp-2 mb-3 leading-relaxed`} style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                                {product.description || 'Sem descrição.'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {(product.is_promotional && product.discount_price !== null) ? (
                                <div className="flex flex-col items-start">
                                  <span className="line-through text-gray-400 text-xs font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                  </span>
                                  <span className="font-extrabold text-base sm:text-lg text-black">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.discount_price))}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-extrabold text-base sm:text-lg text-black">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                </span>
                              )}

                            </div>
                          </div>
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 relative group-hover:scale-[1.02] transition-transform">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full" style={{
                                backgroundColor: '#f5f4f2',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23e0ddd8' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'/%3E%3Cpath d='M7 2v20'/%3E%3Cpath d='M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'/%3E%3C/svg%3E")`,
                                backgroundSize: '28px 28px',
                              }} />
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
            <p className={`font-bold text-sm mb-1 ${isStoreOpen ? 'text-green-800' : 'text-red-800'}`}>
              {isStoreOpen ? 'Loja aberta para pedidos!' : 'Loja fechada no momento'}
            </p>
            <p className="text-xs text-amber-900/70 font-medium">
              Horários: {displayHours} • Sem pedido mínimo
            </p>
          </div>

          <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8 pb-16">
            
            {/* Horário de Atendimento */}
            <section>
              <h2 className="text-xl font-extrabold text-[#2d2926] mb-4">Horário de atendimento</h2>
              <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {daysOfWeek.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-800">{item.name}:</span>
                    <span className={`font-medium ${openDaysArr.includes(item.id) ? 'text-gray-500' : 'text-red-500'}`}>
                      {openDaysArr.includes(item.id) ? displayHours : 'Fechado'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Telefone */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#2d2926] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-600" />
                Telefone
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white text-gray-700 font-semibold text-sm px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  {store.phone || store.pix_receipt_phone || 'Telefone não cadastrado'}
                </span>
              </div>
            </section>

            {/* Formas de Pagamento */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#2d2926] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                Pagamento
              </h2>
              <div className="flex flex-wrap gap-2">
                {store.accepts_cash !== false && (
                  <span className="bg-white text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-green-600" /> Dinheiro
                  </span>
                )}
                <span className="bg-white text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Cartão de Débito
                </span>
                <span className="bg-white text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Cartão de Crédito
                </span>
                {store.accepts_pix !== false && (
                  <span className="bg-white text-gray-700 font-semibold text-xs px-3 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 4.5l3.5 3.5-3.5 3.5m5-7l3.5 3.5-3.5 3.5M9.5 12.5l3.5 3.5-3.5 3.5m5-7l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Pix
                  </span>
                )}
              </div>
            </section>

            {/* Endereço */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#2d2926] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                Endereço
              </h2>
              <div className="bg-white border-b border-gray-100 pb-4">
                <p className="text-sm text-gray-600">
                  {store.street ? `${store.street}${store.number ? `, nº${store.number}` : ''} - ${store.block ? `Qd. ${store.block} - ` : ''}${store.neighborhood || 'Centro'}` : 'Rua Doutor João Teixeira nº86 - Centro'}
                </p>
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

            <div className="pt-8 pb-4 text-center">
              <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                <span className="text-xs text-gray-400 font-medium tracking-wide">Desenvolvido por</span>
                <a href="https://ldam.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80 transition-opacity">
                  <img src="/noxus-logo.png" alt="NOXUS" className="h-14 w-auto" />
                </a>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setIsProfileOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Fechar
              </button>
            </div>

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
                            
                            {item.selectedComplements && item.selectedComplements.length > 0 && (
                              <div className="text-xs opacity-80 space-y-1.5 mt-1 border-l-2 pl-2 border-current/20">
                                {item.selectedComplements.map((comp, cIdx) => (
                                  <div key={cIdx}>
                                    <p className="font-semibold">{comp.groupName}:</p>
                                    {comp.items.map((ci, ciIdx) => (
                                      <p key={ciIdx} className="ml-1 opacity-90">
                                        + {ci.quantity > 1 ? `${ci.quantity}x ` : ''}{ci.name}
                                        {ci.price > 0 && ` (+${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ci.price * ci.quantity)})`}
                                      </p>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.observations && (
                              <p className="text-xs italic opacity-70 mt-1">Obs: {item.observations}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <button onClick={() => {
                                const index = cart.findIndex(c => c.id === item.id);
                                if (index !== -1) handleEditCartItem(index);
                              }} className={`text-sm ${theme.primaryText} font-medium flex items-center gap-1`}>
                                <Edit className="w-4 h-4" /> Editar
                              </button>
                              <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 font-medium flex items-center gap-1">
                                <Trash2 className="w-4 h-4" /> Remover
                              </button>
                            </div>
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
                      disabled={cart.length === 0 || !isStoreOpen}
                      onClick={() => setCheckoutStep('checkout')}
                      className={`w-full ${theme.primaryBg} ${theme.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg`}
                    >
                      {!isStoreOpen ? 'Loja Fechada para Pedidos' : 'Continuar para Pagamento'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isSubmitting || !isStoreOpen}
                      className={`w-full ${theme.primaryBg} ${theme.primaryHover} disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-lg shadow-lg`}
                    >
                      {isSubmitting ? 'Processando...' : !isStoreOpen ? 'Loja Fechada' : 'Confirmar Pedido'}
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
