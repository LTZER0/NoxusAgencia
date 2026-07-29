import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="max-w-3xl mx-auto px-4 py-16 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
        <div className="prose prose-blue text-gray-600">
          <p className="mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-4">
            Ao acessar e usar a plataforma LocalizaSaaS, você concorda em cumprir e ficar vinculado a estes Termos de Uso.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Serviço Oferecido</h2>
          <p className="mb-4">
            O LocalizaSaaS fornece uma plataforma de cardápio digital e gestão de pedidos para comércios locais. O lojista é inteiramente responsável pelos produtos, preços e entregas cadastrados na plataforma.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Responsabilidades do Usuário</h2>
          <p className="mb-4">
            Você é responsável por manter a confidencialidade das credenciais de sua conta e por todas as atividades que ocorram sob a mesma.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Cancelamento</h2>
          <p className="mb-4">
            Você pode cancelar sua conta a qualquer momento através do painel de configurações. O cancelamento pode resultar na exclusão imediata de todos os dados associados à conta.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
