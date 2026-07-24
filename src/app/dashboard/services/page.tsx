import { Plus, PackageOpen } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Meus Serviços
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestão do seu catálogo de serviços.
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Serviço
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 mb-4">
          <PackageOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum serviço encontrado</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Você ainda não tem serviços cadastrados. Clique no botão acima para começar.
        </p>
      </div>
    </div>
  );
}
