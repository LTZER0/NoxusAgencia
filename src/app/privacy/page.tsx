import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="max-w-3xl mx-auto px-4 py-16 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
        <div className="prose prose-blue text-gray-600">
          <p className="mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Coleta de Dados</h2>
          <p className="mb-4">
            Coletamos informações essenciais para o funcionamento da plataforma, incluindo nome, e-mail, telefone e dados de navegação, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Uso das Informações</h2>
          <p className="mb-4">
            As informações coletadas são utilizadas exclusivamente para autenticação, prestação do serviço (gerenciamento de cardápios e pedidos) e melhorias na segurança (ex: proteção contra bots via Cloudflare Turnstile).
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Compartilhamento de Dados</h2>
          <p className="mb-4">
            Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins publicitários. Dados podem ser processados por nossos parceiros de infraestrutura (como Supabase e Vercel) sob rígidas normas de segurança.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Seus Direitos (Direito ao Esquecimento)</h2>
          <p className="mb-4">
            Em conformidade com o Artigo 18 da LGPD, você tem o direito de solicitar a exclusão total dos seus dados. Disponibilizamos uma opção de "Excluir Conta" diretamente no seu painel de configurações, que apagará definitivamente todos os seus dados e de suas lojas de nossos servidores.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies</h2>
          <p className="mb-4">
            Utilizamos cookies estritamente necessários para manter sua sessão ativa e segura. O seu consentimento é solicitado para o uso de quaisquer outras categorias de cookies através do nosso banner de consentimento.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
