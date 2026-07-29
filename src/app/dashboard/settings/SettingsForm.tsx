'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Link as LinkIcon, Phone, Save, CheckCircle, AlertCircle, MapPin, Building, Hash, Tag, Image as ImageIcon, Layout, Clock, Power } from 'lucide-react';

export default function SettingsForm({ 
  initialStore, 
  userId 
}: { 
  initialStore: any, 
  userId: string 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialStore?.name || '');
  const [slug, setSlug] = useState(initialStore?.slug || '');
  const [phone, setPhone] = useState(initialStore?.phone || '');
  const [street, setStreet] = useState(initialStore?.street || '');
  const [block, setBlock] = useState(initialStore?.block || '');
  const [lot, setLot] = useState(initialStore?.lot || '');
  const [neighborhood, setNeighborhood] = useState(initialStore?.neighborhood || '');
  const [storeCategory, setStoreCategory] = useState(initialStore?.store_category || 'lanchonete');
  const [isOpen, setIsOpen] = useState<boolean>(initialStore?.is_open ?? true);
  const [openingHours, setOpeningHours] = useState(initialStore?.opening_hours || '08:00 às 23:00');
  const [logoUrl, setLogoUrl] = useState(initialStore?.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(initialStore?.cover_url || '');

  // Métodos de pagamento
  const [acceptsPix, setAcceptsPix] = useState<boolean>(initialStore?.accepts_pix ?? true);
  const [acceptsCard, setAcceptsCard] = useState<boolean>(initialStore?.accepts_card ?? true);
  const [acceptsCash, setAcceptsCash] = useState<boolean>(initialStore?.accepts_cash ?? true);
  const [pixKey, setPixKey] = useState(initialStore?.pix_key || '');
  const [pixReceiptPhone, setPixReceiptPhone] = useState(initialStore?.pix_receipt_phone || '');

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Apenas letras minúsculas, números e hífens
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/store/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name,
          slug,
          phone,
          street,
          block,
          lot,
          neighborhood,
          store_category: storeCategory,
          is_open: isOpen,
          opening_hours: openingHours,
          logo_url: logoUrl,
          cover_url: coverUrl,
          accepts_pix: acceptsPix,
          accepts_card: acceptsCard,
          accepts_cash: acceptsCash,
          pix_key: pixKey,
          pix_receipt_phone: pixReceiptPhone,
          isUpdate: !!initialStore
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar as configurações.');
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Configurações salvas com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
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

      {/* Seção de Status da Loja & Horários */}
      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100">
        <div className="border-b border-gray-100 px-4 py-5 sm:px-6 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold leading-6 text-gray-900">Operação da Loja</h2>
            <p className="mt-1 text-sm text-gray-500">Controle o status em tempo real e exiba seus horários de atendimento.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span className={`text-sm font-bold flex items-center gap-1.5 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
              <Power className="w-4 h-4" />
              {isOpen ? 'Loja Aberta' : 'Loja Fechada'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-md">
            <label htmlFor="openingHours" className="block text-sm font-medium leading-6 text-gray-900">
              Horário de Funcionamento
            </label>
            <p className="text-xs text-gray-500 mb-2">Será exibido na vitrine do seu cardápio para os clientes.</p>
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
              <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                <Clock className="h-4 w-4 mr-2 text-indigo-500" />
              </span>
              <input
                type="text"
                name="openingHours"
                id="openingHours"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="block flex-1 border-0 bg-transparent py-2 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="Ex: Terça a Domingo das 18:00 às 23:30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100">
        <div className="border-b border-gray-100 px-4 py-5 sm:px-6 bg-gray-50/50">
          <h2 className="text-base font-semibold leading-6 text-gray-900">Informações da Loja</h2>
          <p className="mt-1 text-sm text-gray-500">Dados básicos que aparecem no seu cardápio e nos pedidos.</p>
        </div>
        
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Nome do Estabelecimento *
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Store className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Minha Lanchonete"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="slug" className="block text-sm font-medium leading-6 text-gray-900">
                Link do Cardápio (URL) *
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  cardapio.com/
                </span>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 font-mono text-indigo-600 font-medium"
                  placeholder="minha-lanchonete"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Este será o endereço que seus clientes usarão para acessar o cardápio.</p>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                WhatsApp para Receber Pedidos *
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="11999999999 (somente números com DDD)"
                />
              </div>
            </div>



            <div className="sm:col-span-3">
              <label htmlFor="storeCategory" className="block text-sm font-medium leading-6 text-gray-900">
                Categoria do Estabelecimento (Cores)
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Tag className="h-4 w-4 mr-2" />
                </span>
                <select
                  id="storeCategory"
                  name="storeCategory"
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-2 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 font-medium"
                >
                  <option value="lanchonete">Lanchonete (Azul Índigo)</option>
                  <option value="acaiteria">Açaiteria (Roxo/Fúcsia)</option>
                  <option value="hamburgueria">Hamburgueria (Amarelo Âmbar)</option>
                  <option value="pizzaria">Pizzaria (Vermelho Tomate)</option>
                  <option value="restaurante">Restaurante (Marrom Âmbar)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="logoUrl" className="block text-sm font-medium leading-6 text-gray-900">
                Logo URL (Foto de Perfil)
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="logoUrl"
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="coverUrl" className="block text-sm font-medium leading-6 text-gray-900">
                Cover Banner URL (Capa do Topo)
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Layout className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="coverUrl"
                  id="coverUrl"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="https://exemplo.com/capa.png"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="sm:col-span-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Endereço do Estabelecimento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                <div className="sm:col-span-4">
                  <label htmlFor="street" className="block text-sm font-medium leading-6 text-gray-900">
                    Rua / Avenida
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <Building className="h-4 w-4 mr-2" />
                    </span>
                    <input
                      type="text"
                      name="street"
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Av. Principal"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="block" className="block text-sm font-medium leading-6 text-gray-900">
                    Quadra / Número
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <Hash className="h-4 w-4 mr-2" />
                    </span>
                    <input
                      type="text"
                      name="block"
                      id="block"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Qd. 10 / N 123"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lot" className="block text-sm font-medium leading-6 text-gray-900">
                    Lote / Complemento
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <input
                      type="text"
                      name="lot"
                      id="lot"
                      value={lot}
                      onChange={(e) => setLot(e.target.value)}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Lt. 5 / Apto 101"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="neighborhood" className="block text-sm font-medium leading-6 text-gray-900">
                    Bairro
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                    </span>
                    <input
                      type="text"
                      name="neighborhood"
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Centro"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900/10 px-4 py-6 sm:p-8 bg-white">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Métodos de Pagamento</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">Selecione quais formas de pagamento sua loja aceita.</p>
          
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-4 sm:max-w-md">
              <div>
                <label className="text-sm font-medium leading-6 text-gray-900 block">Aceita Pix?</label>
                <p className="text-sm text-gray-500">Ativar pagamento via Pix.</p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptsPix(!acceptsPix)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${acceptsPix ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${acceptsPix ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {acceptsPix && (
              <div className="space-y-4 pl-4 border-l-2 border-indigo-100 sm:max-w-md">
                <div>
                  <label htmlFor="pixKey" className="block text-sm font-medium leading-6 text-gray-900">
                    Chave Pix
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <input
                      type="text"
                      name="pixKey"
                      id="pixKey"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="email, cpf ou telefone"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="pixReceiptPhone" className="block text-sm font-medium leading-6 text-gray-900">
                    WhatsApp para envio do comprovante
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                      <Phone className="h-4 w-4 mr-2" />
                    </span>
                    <input
                      type="text"
                      name="pixReceiptPhone"
                      id="pixReceiptPhone"
                      value={pixReceiptPhone}
                      onChange={(e) => setPixReceiptPhone(e.target.value)}
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 sm:max-w-md">
              <div>
                <label className="text-sm font-medium leading-6 text-gray-900 block">Aceita Cartão?</label>
                <p className="text-sm text-gray-500">Pagamento com maquininha na entrega.</p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptsCard(!acceptsCard)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${acceptsCard ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${acceptsCard ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 sm:max-w-md">
              <div>
                <label className="text-sm font-medium leading-6 text-gray-900 block">Aceita Dinheiro?</label>
                <p className="text-sm text-gray-500">Pagamento em espécie na entrega.</p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptsCash(!acceptsCash)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${acceptsCash ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${acceptsCash ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50 rounded-b-xl">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? (
              'Salvando...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
