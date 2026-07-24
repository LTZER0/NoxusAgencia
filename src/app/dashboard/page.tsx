export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo(a) ao painel da {storeName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe o desempenho do seu negócio e gerencie seus serviços.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Agendamentos de Hoje</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Serviços Cadastrados</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Faturamento</p>
              <p className="text-2xl font-semibold text-gray-900">R$ 0,00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
