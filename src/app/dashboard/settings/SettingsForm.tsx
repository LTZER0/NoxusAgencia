'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Link as LinkIcon, Phone, Save, CheckCircle, AlertCircle, MapPin, Building, Hash, Tag, Palette } from 'lucide-react';

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
  const [deliveryFee] = useState(initialStore?.delivery_fee?.toString() || '');
  const [storeCategory, setStoreCategory] = useState(initialStore?.store_category || 'lanchonete');
  const [themeMode, setThemeMode] = useState(initialStore?.theme_mode || 'branco');

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
          delivery_fee: deliveryFee,
          store_category: storeCategory,
          theme_mode: themeMode,
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
              <p className="text-sm font-medium text-red-800">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Nome do Negócio
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
                Link do Cardápio
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  https://ldam.vercel.app/
                </span>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="minha-lanchonete"
                />
              </div>
              {slug && (
                <p className="mt-2 text-sm text-gray-500">
                  Seu link público será: <strong className="text-indigo-600">https://ldam.vercel.app/{slug}</strong>
                </p>
              )}
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                Telefone (WhatsApp)
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
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="street" className="block text-sm font-medium leading-6 text-gray-900">
                Rua
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="street"
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Rua das Flores"
                />
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="block" className="block text-sm font-medium leading-6 text-gray-900">
                Quadra
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Building className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="block"
                  id="block"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Q. 12"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="lot" className="block text-sm font-medium leading-6 text-gray-900">
                Lote
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Hash className="h-4 w-4 mr-2" />
                </span>
                <input
                  type="text"
                  name="lot"
                  id="lot"
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="Lt. 5"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="neighborhood" className="block text-sm font-medium leading-6 text-gray-900">
                Bairro
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
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

            <div className="sm:col-span-3">
              <label htmlFor="storeCategory" className="block text-sm font-medium leading-6 text-gray-900">
                Categoria da Loja
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
                  className="block flex-1 border-0 bg-transparent py-2 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                >
                  <option value="restaurante">Restaurante</option>
                  <option value="hamburgueria">Hamburgueria</option>
                  <option value="pizzaria">Pizzaria</option>
                  <option value="acaiteria">Açaiteria</option>
                  <option value="lanchonete">Lanchonete</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="themeMode" className="block text-sm font-medium leading-6 text-gray-900">
                Tema do Cardápio
              </label>
              <div className="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                  <Palette className="h-4 w-4 mr-2" />
                </span>
                <select
                  id="themeMode"
                  name="themeMode"
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value)}
                  className="block flex-1 border-0 bg-transparent py-2 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                >
                  <option value="branco">Claro (branco)</option>
                  <option value="preto">Escuro (preto)</option>
                </select>
              </div>
            </div>

          </div>
        </div>
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50 rounded-b-xl">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
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
