import { Plus, MessageCircle, PackageOpen } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Meus Serviços
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestão do seu catálogo de serviços.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Serviço
        </button>
      </div>

      {/* Concierge Banner */}
      <div className="relative overflow-hidden rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Vamos montar o seu catálogo juntos?
            </h2>
            <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base">
              Nossa equipe cadastra os seus primeiros serviços e produtos para você não perder tempo. Chame no WhatsApp e nós cuidamos de tudo.
            </p>
          </div>
          <a
            href="https://wa.me/5561999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 bg-[#25D366] text-white hover:bg-[#20bd5a] h-11 px-6 py-2 shadow-sm"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Chamar equipe no WhatsApp
          </a>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 py-24 text-center mt-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <PackageOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum serviço cadastrado ainda</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Adicione seu primeiro serviço manualmente ou conte com a nossa ajuda pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}