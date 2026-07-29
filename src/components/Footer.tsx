import Link from 'next/link';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Localiza<span className="text-blue-600">SaaS</span></span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              Democratizando a tecnologia para comércios locais. Venda mais com seu próprio cardápio digital, de forma simples e rápida.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Plataforma</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/register" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Criar Conta Grátis
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Acessar Painel
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Jurídico (LGPD)</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} LocalizaSaaS. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Protegido por Cloudflare Turnstile</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
