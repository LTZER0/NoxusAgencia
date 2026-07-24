import { ArrowRight, Calendar, CheckCircle2, Clock, Smartphone, Store, Utensils } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar/Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Localiza<span className="text-blue-600">SaaS</span></span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#quem-somos" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Quem Somos</Link>
            <Link href="#solucoes" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Soluções</Link>
            <Link href="#vantagens" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Vantagens</Link>
            <Link href="#precos" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Planos</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden md:block">
              Entrar
            </Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50">
              Cadastrar meu negócio
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-48 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none text-gray-900">
                  Modernize seu comércio em <span className="text-blue-600">Valparaíso de Goiás</span> e região
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl leading-relaxed">
                  A plataforma completa para barbearias, restaurantes e pequenas lojas físicas. 
                  Automatize agendamentos, crie cardápios digitais e pare de perder vendas no WhatsApp.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-base font-medium text-white shadow transition-colors hover:bg-blue-700">
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="#solucoes" className="inline-flex h-12 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-base font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900">
                  Conhecer Soluções
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quem Somos */}
        <section id="quem-somos" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Nossa Missão</h2>
                <p className="text-gray-600 md:text-lg leading-relaxed">
                  Somos uma equipe de três jovens desenvolvedores apaixonados por tecnologia, nascidos e criados em Valparaíso. 
                  Nossa missão é trazer a mesma tecnologia usada por grandes corporações para o pequeno comércio local, 
                  com um preço justo e um sistema fácil de usar.
                </p>
                <p className="text-gray-600 md:text-lg leading-relaxed">
                  Acreditamos que o dono do negócio deve focar no que faz de melhor: atender seus clientes. 
                  Nós cuidamos da tecnologia para que seu negócio cresça de forma organizada.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm rounded-xl bg-blue-50 p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Time Local</h3>
                <p className="text-gray-600">Suporte humano, rápido e feito por quem entende a realidade do comércio da região.</p>
              </div>
            </div>
          </div>
        </section>

        {/* O que fazemos */}
        <section id="solucoes" className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Soluções Sob Medida</h2>
              <p className="max-w-[700px] text-gray-600 md:text-lg">
                Ferramentas essenciais para digitalizar e organizar o seu negócio.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sistema de Agendamentos</h3>
                <p className="text-gray-600 flex-1">
                  Ideal para barbearias, salões de beleza e clínicas. Seus clientes agendam horários online 24h por dia, 
                  e você recebe tudo organizado em um calendário intuitivo, sem precisar responder mensagens no meio de um atendimento.
                </p>
              </div>
              <div className="flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cardápios Digitais</h3>
                <p className="text-gray-600 flex-1">
                  Perfeito para lanchonetes e restaurantes. Um link único para o seu cardápio, onde o cliente 
                  escolhe os itens, personaliza o pedido e você recebe os detalhes completos direto no sistema ou WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vantagens */}
        <section id="vantagens" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">Por que escolher nossa plataforma?</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-blue-50 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Economize Tempo</h3>
                <p className="text-gray-600">Automatize o atendimento e libere tempo para gerenciar o que realmente importa no seu comércio.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-blue-50 p-4 rounded-full">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Chega de perder pedidos</h3>
                <p className="text-gray-600">O cliente não precisa esperar você visualizar o WhatsApp para agendar ou pedir. O sistema trabalha 24/7.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-blue-50 p-4 rounded-full">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Imagem Profissional</h3>
                <p className="text-gray-600">Transmita credibilidade e confiança com uma página exclusiva e um processo de pedido organizado.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Preços */}
        <section id="precos" className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900 mb-4">Preço Justo e Transparente</h2>
            <p className="max-w-[600px] text-gray-600 md:text-lg mb-12">
              Sem taxas escondidas ou comissões por pedido. Um valor fixo mensal que cabe no bolso do pequeno empreendedor.
            </p>
            
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-blue-600 p-6 text-white">
                <h3 className="text-2xl font-bold">Plano Essencial</h3>
                <p className="text-blue-100 mt-2">Tudo o que seu negócio precisa</p>
                <div className="mt-4 flex items-baseline justify-center text-5xl font-extrabold">
                  R$ 39,90
                  <span className="text-xl font-medium text-blue-200 ml-1">/mês</span>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 text-left">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Link personalizado da sua loja</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Agendamentos ou Cardápio Ilimitados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Painel de controle gerencial</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Integração rápida com WhatsApp</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Suporte humanizado local</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register" className="w-full flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-base font-medium text-white shadow transition-colors hover:bg-blue-700">
                    Começar Agora
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-bold text-white">Localiza<span className="text-blue-500">SaaS</span></span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Feito com dedicação em Valparaíso de Goiás.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Termos</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacidade</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
