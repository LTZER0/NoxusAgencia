"use client";

import Link from "next/link";
import { Store, ArrowRight, CheckCircle2, Star, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
const proposals = [
  {
    title: "Açaiteria",
    color: "from-fuchsia-600 to-purple-800",
    shadow: "shadow-fuchsia-500/50",
    image: "/images/acaiteria.jpg",
    desc: "Cores vibrantes para combinar com o frescor e a energia do açaí. Personalização completa de adicionais."
  },
  {
    title: "Lanchonete",
    color: "from-indigo-500 to-blue-800",
    shadow: "shadow-indigo-500/50",
    image: "/images/lanchonete.jpg",
    desc: "Um ambiente dinâmico e rápido. Facilite o pedido do seu cliente de forma clara e objetiva."
  },
  {
    title: "Pizzaria",
    color: "from-red-600 to-rose-900",
    shadow: "shadow-red-500/50",
    image: "/images/pizzaria.jpg",
    desc: "Tons quentes que remetem ao calor do forno. Interface perfeita para montagem de pizzas meio a meio."
  },
  {
    title: "Hamburgueria",
    color: "from-amber-500 to-yellow-700",
    shadow: "shadow-amber-500/50",
    image: "/images/hamburgueria.jpg",
    desc: "Apetite e descontração para o melhor hambúrguer artesanal. Adicionais ilimitados e fáceis de escolher."
  },
  {
    title: "Restaurante",
    color: "from-orange-800 to-amber-950",
    shadow: "shadow-orange-700/50",
    image: "/images/restaurante.jpg",
    desc: "Elegância e aconchego. Layout sofisticado para valorizar pratos requintados e a tradição do seu local."
  }
];

const reviews = [
  { name: "Carlos Silva", role: "Dono de Hamburgueria", text: "O sistema da NOXUS revolucionou nossos pedidos. A interface é linda e super fácil de usar!" },
  { name: "Mariana Costa", role: "Proprietária de Açaiteria", text: "Meus clientes elogiam muito o cardápio digital. Além de rápido, as cores combinaram perfeitamente com minha marca." },
  { name: "Roberto Almeida", role: "Gerente de Pizzaria", text: "A facilidade de atualizar os preços e gerenciar o estoque nos salvou muito tempo. Recomendo o plano PRO!" }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-purple-600 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-purple-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Store className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-black tracking-tighter text-white">
                Agência <span className="text-purple-500">NOXUS</span>
              </span>
            </motion.div>
            
            {/* Desktop Nav */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-6"
            >
              <Link href="#solucoes" className="text-slate-300 hover:text-white font-medium transition-colors">Soluções</Link>
              <Link href="#avaliacoes" className="text-slate-300 hover:text-white font-medium transition-colors">Avaliações</Link>
              <Link href="#planos" className="text-slate-300 hover:text-white font-medium transition-colors">Planos</Link>
              <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors ml-4 border-l border-slate-700 pl-4">
                Entrar
              </Link>
              <Link href="/register" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-purple-600/30">
                Criar conta
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-300 hover:text-white">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-purple-900/50 p-4 absolute top-20 left-0 right-0 shadow-xl">
            <div className="flex flex-col gap-4">
              <Link href="#solucoes" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Soluções</Link>
              <Link href="#avaliacoes" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Avaliações</Link>
              <Link href="#planos" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Planos</Link>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Entrar</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-purple-600 text-center text-white px-4 py-3 rounded-xl font-bold">Criar conta</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 flex flex-col items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-950 to-slate-950 -z-10"></div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl"
          >
            A Presença Digital que o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Negócio Merece</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-2xl text-slate-400 max-w-2xl mb-12"
          >
            Sistemas incríveis, cardápios online maravilhosos e tudo pensado para o seu restaurante faturar mais com elegância e facilidade.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="#planos" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(147,51,234,0.7)] hover:shadow-[0_0_60px_-15px_rgba(147,51,234,0.9)] flex items-center justify-center gap-2">
              Ver Planos <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* Proposals Section */}
        <section id="solucoes" className="py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Identidade Visual Própria</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Adaptamos o design do seu sistema perfeitamente ao seu nicho. Cada detalhe importa para atrair os seus clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {proposals.map((prop, idx) => (
                <motion.div 
                  key={prop.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group relative overflow-hidden rounded-3xl ${prop.shadow} shadow-2xl transition-transform hover:-translate-y-2 border border-white/10`}
                >
                  <div className="absolute inset-0">
                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${prop.color} mix-blend-multiply opacity-80`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  </div>
                  
                  <div className="relative p-8 h-[320px] flex flex-col justify-end">
                    <h3 className="text-3xl font-black text-white mb-2">{prop.title}</h3>
                    <p className="text-slate-200 text-lg leading-relaxed">{prop.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="avaliacoes" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">O que dizem nossos parceiros</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Junte-se a centenas de negócios que já revolucionaram o seu delivery com a NOXUS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900 border border-purple-900/30 p-8 rounded-3xl hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex gap-1 mb-6 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-lg text-slate-300 italic mb-6">"{review.text}"</p>
                  <div>
                    <h4 className="font-bold text-white text-lg">{review.name}</h4>
                    <span className="text-purple-400 text-sm">{review.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-24 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Escolha o seu plano</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Sem taxas escondidas ou surpresas no fim do mês. Comece a crescer hoje mesmo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
              {/* Plus Plan */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl relative flex flex-col md:my-8"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">Plus</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">R$ 49,90</span>
                    <span className="text-slate-400">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                    <span>Primeiro cardápio montado por nós</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                    <span>URL própria exclusiva</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                    <span>Suporte direto via WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                    <span>2 atualizações de cardápio por mês</span>
                  </li>
                </ul>
                
                <Link href="/register" className="w-full block text-center bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold transition-colors">
                  Assinar Plus
                </Link>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-purple-900 to-slate-900 border-2 border-purple-500 p-8 md:p-10 rounded-3xl relative flex flex-col shadow-2xl shadow-purple-900/30 z-10"
              >
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                  RECOMENDADO
                </div>
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">PRO</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">R$ 99,90</span>
                    <span className="text-slate-400">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span className="font-semibold">Todos os benefícios do plano Plus</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-200">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>1 atualização completa POR SEMANA</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-200">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>Cardápio Online completo para Deliverys</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-200">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>Sistema de Controle de Estoque integrado</span>
                  </li>
                </ul>
                
                <Link href="/register" className="w-full block text-center bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-purple-600/30">
                  Assinar PRO
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-500" />
            <span className="text-xl font-black tracking-tighter text-white">
              Agência <span className="text-purple-500">NOXUS</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Agência NOXUS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
