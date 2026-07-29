"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function PlansPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Sua conta está inativa ou no período de teste
        </h1>
        <p className="text-lg text-slate-600">
          Escolha um de nossos planos abaixo para desbloquear todos os recursos e continuar vendendo sem interrupções.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Plus Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 p-8 rounded-3xl relative flex flex-col shadow-sm"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-500 mb-2 uppercase tracking-wide">Plano Plus</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">R$ 49,90</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>Nós montamos o seu primeiro cardápio</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>Link exclusivo para sua loja</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>Suporte de verdade via WhatsApp</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>2 atualizações de cardápio todo mês</span>
            </li>
          </ul>
          
          <button className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold transition-colors">
            Assinar Plano Plus
          </button>
        </motion.div>

        {/* Pro Plan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-2 border-purple-600 p-8 rounded-3xl relative flex flex-col shadow-2xl shadow-purple-100"
        >
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
            MAIS ESCOLHIDO
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-600 mb-2 uppercase tracking-wide">Plano PRO</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">R$ 99,90</span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-slate-900 font-semibold">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>Tudo que tem no plano Plus</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>1 atualização de cardápio POR SEMANA</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>Sistema de painel para controle dos pedidos</span>
            </li>
            <li className="flex items-start gap-3 text-slate-700">
              <CheckCircle2 className="w-6 h-6 text-purple-600 shrink-0" />
              <span>Gerenciamento de estoque em tempo real</span>
            </li>
          </ul>
          
          <button className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-purple-200">
            Assinar Plano PRO
          </button>
        </motion.div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/dashboard" className="text-slate-500 hover:text-purple-600 font-medium transition-colors">
          Voltar para Visão Geral
        </Link>
      </div>
    </div>
  );
}
