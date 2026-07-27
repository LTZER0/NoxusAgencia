import Link from "next/link";
import { Store, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Localiza<span className="text-blue-600">SaaS</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Entrar
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Cardápio Digital Inteligente para<br/>
          <span className="text-blue-600">Comércios Locais</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Digitalize seu negócio, receba pedidos online e gerencie entregas de forma simples. Tudo o que você precisa para vender mais.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2">
            Começar Grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cardápio Digital</h3>
            <p className="text-gray-600">Um link exclusivo com seus produtos, categorias e fotos para os clientes pedirem direto do celular.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Gestão de Pedidos</h3>
            <p className="text-gray-600">Acompanhe todos os pedidos em tempo real. Altere status e imprima comandas facilmente.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Áreas de Entrega</h3>
            <p className="text-gray-600">Configure taxas de entrega diferentes para cada bairro que você atende.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
