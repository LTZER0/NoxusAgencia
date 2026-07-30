"use client";

import Link from "next/link";
import { Store, ArrowRight, CheckCircle2, Star, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

const proposals = [
  {
    title: "Açaiteria",
    color: "text-purple-700",
    shadow: "shadow-purple-100",
    image: "/images/acaiteria.jpg",
    desc: "Visual fresco e vibrante. Seus clientes vão poder montar o copo com os adicionais que quiserem, sem confusão."
  },
  {
    title: "Lanchonete",
    color: "text-indigo-700",
    shadow: "shadow-indigo-100",
    image: "/images/lanchonete.jpg",
    desc: "Cardápio direto ao ponto para quem tem fome e pressa. Receba os pedidos rápidos e bem organizados."
  },
  {
    title: "Pizzaria",
    color: "text-red-700",
    shadow: "shadow-red-100",
    image: "/images/pizzaria.jpg",
    desc: "Cores quentes e um sistema inteligente para montar pizzas meio a meio com cálculo exato do preço."
  },
  {
    title: "Hamburgueria",
    color: "text-amber-600",
    shadow: "shadow-amber-100",
    image: "/images/hamburgueria.jpg",
    desc: "Deixe seu cliente com água na boca. Facilitamos a escolha de pontos da carne e acréscimos extras."
  },
  {
    title: "Restaurante",
    color: "text-orange-800",
    shadow: "shadow-orange-100",
    image: "/images/restaurante.jpg",
    desc: "Simples, elegante e prático. Mostre o prato do dia e venda mais marmitas no horário de pico."
  }
];

const reviews = [
  { name: "Carlos", role: "Hamburgueria do Carlão", text: "Cara, o sistema resolveu minha vida. Os pedidos chegam certinho no WhatsApp, não tem mais erro de anotação na correria." },
  { name: "Mariana", role: "Puro Açaí", text: "Eu achava que ia ser complicado, mas o cardápio ficou a nossa cara. As vendas até aumentaram porque ficou mais fácil pro cliente." },
  { name: "Beto", role: "Beto Pizzas", text: "Aquela parada de atualizar os preços sozinho salvou muito meu tempo. Recomendo demais o plano PRO." }
];

import { createClient } from '@/lib/supabase/client'
import { isAdminEmail } from '@/lib/admins'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    async function checkTrial() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        if (isAdminEmail(user.email)) {
          setIsAdmin(true);
        }

        const { data: store } = await supabase
          .from('stores')
          .select('trial_used')
          .eq('owner_id', user.id)
          .single();
        
        if (store && store.trial_used) {
          setTrialUsed(true);
        }
      }
    }
    checkTrial();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-600 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <Link href="/">
                  <img src="/noxus-logo.jpg" alt="Agência NOXUS" className="h-12 w-auto mix-blend-multiply" />
                </Link>
              </motion.div>
            
            {/* Desktop Nav */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-6"
            >
              <Link href="#solucoes" className="text-slate-600 hover:text-purple-600 font-medium transition-colors">Para seu negócio</Link>
              <Link href="#avaliacoes" className="text-slate-600 hover:text-purple-600 font-medium transition-colors">O que dizem</Link>
              <Link href="#planos" className="text-slate-600 hover:text-purple-600 font-medium transition-colors">Valores</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-purple-200">
                  Meu Painel
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-slate-600 hover:text-purple-600 font-medium transition-colors ml-4 border-l border-gray-200 pl-4">
                    Entrar
                  </Link>
                  <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-purple-200">
                    Criar minha conta
                  </Link>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-slate-600 hover:text-purple-600">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 p-4 absolute top-20 left-0 right-0 shadow-lg">
            <div className="flex flex-col gap-4">
              <Link href="#solucoes" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Para seu negócio</Link>
              <Link href="#avaliacoes" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">O que dizem</Link>
              <Link href="#planos" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Valores</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="bg-purple-600 text-center text-white px-4 py-3 rounded-xl font-bold">
                  Meu Painel
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Entrar</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-purple-600 text-center text-white px-4 py-3 rounded-xl font-bold">
                    Criar minha conta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 flex flex-col items-center justify-center text-center px-4 bg-slate-50">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl text-slate-900"
          >
            Venda mais no delivery sem pagar taxas absurdas
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10"
          >
            A gente cria o sistema e o cardápio digital do seu jeito. Chega de complicação: seu cliente pede fácil e você recebe tudo organizado no seu WhatsApp ou painel.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="#planos" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
              Quero conhecer <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* Proposals Section */}
        <section id="solucoes" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Feito para o <span className="text-purple-600">seu</span> negócio</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Não importa o que você vende. A gente adapta o cardápio pra ter a sua cara e as suas cores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {proposals.map((prop, idx) => (
                <motion.div 
                  key={prop.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl ${prop.shadow} transition-transform hover:-translate-y-1 flex flex-col`}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className={`text-2xl font-bold mb-3 ${prop.color}`}>{prop.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{prop.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="avaliacoes" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Quem usa, recomenda</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Várias lojas já saíram da dor de cabeça dos pedidos desorganizados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-gray-100 shadow-md p-8 rounded-3xl"
                >
                  <div className="flex gap-1 mb-6 text-purple-600">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-lg text-slate-700 italic mb-6">"{review.text}"</p>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{review.name}</h4>
                    <span className="text-purple-600 text-sm font-medium">{review.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Preço justo e sem surpresas</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Escolha o plano que cabe no seu bolso. Zero taxas escondidas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
              {/* Plus Plan */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 p-8 md:p-10 rounded-3xl relative flex flex-col shadow-sm md:my-8"
              >
                {!trialUsed && !isAdmin && (
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl text-lg font-black tracking-wide shadow-lg rotate-3">
                    14 DIAS GRÁTIS
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute -top-4 -right-4 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold tracking-wide shadow-lg">
                    EQUIPE
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-500 mb-2 uppercase tracking-wide">Plano Plus</h3>
                  <div className="flex flex-col gap-1">
                    {!trialUsed && !isAdmin ? (
                       <>
                         <span className="text-2xl font-bold text-slate-400 line-through decoration-red-500 decoration-2">R$ 49,90</span>
                         <div className="flex items-baseline gap-1">
                           <span className="text-4xl font-black text-green-600">R$ 0,00</span>
                           <span className="text-slate-500 font-medium">/14 dias</span>
                         </div>
                       </>
                    ) : (
                       <div className="flex items-baseline gap-1">
                         <span className="text-4xl font-black text-slate-900">R$ 49,90</span>
                         <span className="text-slate-500 font-medium">/mês</span>
                       </div>
                    )}
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
                
                <Link href={isAdmin || trialUsed ? "/dashboard/plans" : "/register"} className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-xl font-bold transition-colors border border-slate-300">
                  {isAdmin ? "Acesso Admin" : (trialUsed ? "Começar com o Plus" : "Começar teste Grátis")}
                </Link>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white border-2 border-purple-600 p-8 md:p-10 rounded-3xl relative flex flex-col shadow-2xl shadow-purple-100 z-10"
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
                
                <Link href="/register" className="w-full block text-center bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-purple-200">
                  Começar com o PRO
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img src="/noxus-logo.jpg" alt="Agência NOXUS" className="h-12 w-auto mix-blend-multiply" />
              </div>
              <p className="text-slate-500 max-w-sm mb-6">
                Simplificamos o delivery do seu negócio com tecnologia acessível e focada em resultados reais.
              </p>
              <Link href="/register" className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Criar uma conta
              </Link>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Links Úteis</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-slate-500 hover:text-purple-600 transition-colors">Entrar no painel</Link></li>
                <li><Link href="#solucoes" className="text-slate-500 hover:text-purple-600 transition-colors">Ver soluções</Link></li>
                <li><Link href="#planos" className="text-slate-500 hover:text-purple-600 transition-colors">Preços</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-slate-500 hover:text-purple-600 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="text-slate-500 hover:text-purple-600 transition-colors">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Agência NOXUS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
