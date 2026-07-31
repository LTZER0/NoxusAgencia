'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Briefcase, Settings, Menu, X, LogOut, Store, ShoppingBag, MapPin, Tag, Layers, ShieldCheck, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Categorias', href: '/dashboard/categories', icon: Tag },
  { name: 'Meus Produtos', href: '/dashboard/services', icon: Briefcase },
  { name: 'Complementos', href: '/dashboard/complementos', icon: Layers },
  { name: 'Áreas de Entrega', href: '/dashboard/delivery', icon: MapPin },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export default function ClientShell({ children, hasActivePlan, isAdmin }: { children: React.ReactNode, hasActivePlan?: boolean, isAdmin?: boolean }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (hasActivePlan === false) {
      if (pathname !== '/dashboard' && pathname !== '/dashboard/plans') {
        router.push('/dashboard')
      }
    }
  }, [hasActivePlan, pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex py-5 shrink-0 items-center justify-center relative border-b border-gray-200">
          <div className="flex flex-shrink-0 items-center">
            <img src="/noxus-logo.png" alt="NOXUS" className="h-16 w-auto" />
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-900 absolute right-4"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {isAdmin && (
          <div className="px-4 py-3 border-b border-gray-100 bg-purple-50">
            <div className="flex items-center justify-center gap-2 text-purple-700">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Acesso Admin</span>
            </div>
          </div>
        )}

        <nav className="flex flex-1 flex-col px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== '/dashboard'
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-purple-50 text-purple-800' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-purple-800' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            )
          })}
          
          <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 transition-colors" />
              Menu Principal
            </Link>
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-600 transition-colors" />
              Sair da conta
            </button>
          </div>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 lg:hidden">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir menu</span>
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
