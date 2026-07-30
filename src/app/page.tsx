"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Menu, X, Monitor, Store, Headphones, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/admins';

const reviews = [
  { name: "Carlos", role: "Hamburgueria do Carlão", text: "Cara, o sistema resolveu minha vida. Os pedidos chegam certinho no WhatsApp, não tem mais erro de anotação na correria." },
  { name: "Mariana", role: "Puro Açaí", text: "Eu achava que ia ser complicado, mas o cardápio ficou a nossa cara. As vendas até aumentaram porque ficou mais fácil pro cliente." },
  { name: "Beto", role: "Beto Pizzas", text: "Aquela parada de atualizar os preços sozinho salvou muito meu tempo. Recomendo demais o plano PRO." }
];

const niches = [
  { name: "Pizzarias", color: "bg-red-500" },
  { name: "Hamburguerias", color: "bg-amber-500" },
  { name: "Temaquerias", color: "bg-emerald-500" },
  { name: "Marmitarias", color: "bg-orange-500" },
  { name: "Açaí e sorvetes", color: "bg-purple-500" },
  { name: "Docerias", color: "bg-pink-500" },
  { name: "Cafeterias", color: "bg-amber-700" }
];

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
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-600 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <Link href="/" className="flex items-center gap-3">
                <img src="/noxus-logo.jpg" alt="Agência NOXUS" className="h-12 w-auto mix-blend-multiply rounded-lg" />
                <span className="text-xl font-black tracking-tighter text-slate-900 hidden sm:inline">
                  Agência <span className="text-purple-600">NOXUS</span>
                </span>
              </Link>
            </motion.div>
            
            {/* Desktop Nav */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-8"
            >
              <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">Recursos</Link>
              <Link href="#solucoes" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">Soluções</Link>
              <Link href="#avaliacoes" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">Depoimentos</Link>
              <Link href="#planos" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">Planos</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-md shadow-purple-200/50 text-sm">
                  Meu Painel
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors">
                    Entrar
                  </Link>
                  <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl font-semibold transition-all shadow-md shadow-purple-200/50 text-sm">
                    Começar grátis
                  </Link>
                </div>
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
          <div className="md:hidden bg-white border-b border-gray-100 p-4 absolute top-20 left-0 right-0 shadow-2xl">
            <div className="flex flex-col gap-4">
              <Link href="#features" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Recursos</Link>
              <Link href="#solucoes" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Soluções</Link>
              <Link href="#avaliacoes" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Depoimentos</Link>
              <Link href="#planos" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium">Planos</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="bg-purple-600 text-center text-white px-4 py-3 rounded-2xl font-bold">
                  Meu Painel
                </Link>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="text-slate-600 font-medium py-2">Entrar</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-purple-600 text-center text-white px-4 py-3 rounded-2xl font-bold">
                    Começar grátis
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 flex flex-col items-center justify-center text-center px-4 bg-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-50/50 rounded-full blur-3xl -z-10"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600"><span className="text-lg">🚀</span> Mais pedidos</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600"><span className="text-lg">✅</span> Menos erros</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600"><span className="text-lg">💰</span> Mais lucro</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-slate-900 leading-tight"
          >
            Vamos automatizar e gerenciar os seus pedidos de <span className="text-purple-600">delivery, balcão e mesas</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 font-medium"
          >
            Com cardápio digital, gestor de pedidos, robô no WhatsApp e muito mais. Tudo integrado para o seu restaurante crescer sem limites.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-20"
          >
            <Link href="https://wa.me/suporte" target="_blank" className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-200/50 flex items-center justify-center gap-2">
              Falar com especialista <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center">
              Criar conta grátis
            </Link>
          </motion.div>

          {/* Hero Mockup Composition */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.4 }}
            className="relative w-full max-w-5xl mx-auto h-[400px] sm:h-[500px] perspective-1000"
          >
            {/* Tablet Mockup */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[350px] sm:h-[450px] bg-white rounded-t-3xl border-t-[8px] border-x-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10">
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-bold text-slate-400">Gestor de Pedidos</div>
              </div>
              <div className="p-6 bg-slate-50 flex-1 grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold mb-2">NOVOS (2)</div>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-purple-900">#1024</span>
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">Delivery</span>
                      </div>
                      <div className="text-xs text-slate-600">1x Pizza Calabresa, 1x Coca 2L</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold mb-2">PREPARANDO (1)</div>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-amber-900">#1023</span>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">Mesa 04</span>
                      </div>
                      <div className="text-xs text-slate-600">2x Hamburguer Duplo, 2x Fritas</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="text-xs text-slate-400 font-bold mb-2">PRONTOS (0)</div>
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <motion.div 
              initial={{ y: 50, x: 20 }}
              animate={{ y: 0, x: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute bottom-0 right-[5%] sm:right-[15%] w-48 sm:w-64 h-80 sm:h-96 bg-white rounded-t-3xl border-t-[10px] border-x-[10px] border-slate-800 shadow-2xl z-20 overflow-hidden flex flex-col"
            >
              <div className="bg-purple-600 p-4 text-white text-center pb-6 rounded-b-2xl shadow-sm z-10 relative">
                <div className="font-black text-lg">Pizzaria Noxus</div>
                <div className="text-[10px] opacity-80">Aberto até às 23:00</div>
              </div>
              <div className="flex-1 bg-slate-50 p-3 pt-6 -mt-4 overflow-hidden relative">
                <div className="text-xs font-bold text-slate-800 mb-2">Destaques</div>
                <div className="bg-white p-2 rounded-xl shadow-sm flex gap-3 items-center mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Pizza Calabresa</div>
                    <div className="text-xs text-purple-600 font-bold">R$ 45,90</div>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm flex gap-3 items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Pizza Marguerita</div>
                    <div className="text-xs text-purple-600 font-bold">R$ 42,90</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Niche Tags Section */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8"
            >
              Sistema perfeito para
            </motion.h2>
            <div className="flex flex-wrap justify-center gap-3">
              {niches.map((niche, idx) => (
                <motion.div
                  key={niche.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2 cursor-default transition-colors"
                >
                  <div className={\`w-2 h-2 rounded-full \${niche.color}\`}></div>
                  <span className="text-sm font-semibold text-slate-700">{niche.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="text-3xl md:text-5xl font-bold mb-4 text-slate-900"
              >
                Gestão completa <span className="text-purple-600 relative inline-block">em um único sistema
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-purple-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                  </svg>
                </span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <Monitor className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Gestor de pedidos</h3>
                <p className="text-slate-500 leading-relaxed">
                  Receba, aceite e gerencie os pedidos em tempo real. Tudo organizado em colunas intuitivas para sua cozinha não perder nenhum detalhe.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Delivery, balcão e mesas</h3>
                <p className="text-slate-500 leading-relaxed">
                  Controle total da sua operação. Atenda clientes no salão com QR Code nas mesas, no balcão e no delivery com a mesma facilidade.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.3 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <Headphones className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Suporte premium</h3>
                <p className="text-slate-500 leading-relaxed">
                  Nada de robôs na hora que você mais precisa. Atendimento humano via WhatsApp 7 dias por semana para ajudar sua loja a vender mais.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solucoes" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="text-3xl md:text-5xl font-bold mb-4 text-slate-900"
              >
                Soluções para <span className="text-purple-600 underline decoration-purple-200 underline-offset-4">Delivery</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-500 font-medium"
              >
                Cardápio digital, integrações e muito mais
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[400px]">
              {/* Card 1: Bento Large */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 }}
                className="md:col-span-8 bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative flex flex-col md:flex-row"
              >
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Cardápio digital próprio</h3>
                  <p className="text-slate-600 mb-6">Livre-se das taxas dos aplicativos. Tenha um cardápio com a cara da sua marca, super rápido e fácil de usar pelos clientes.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Sem taxas por pedido</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Cores e logo da sua marca</li>
                    <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Pix automatizado</li>
                  </ul>
                </div>
                <div className="relative md:w-1/2 h-full min-h-[250px] bg-purple-100 flex items-end justify-center overflow-hidden">
                  <div className="w-48 h-[90%] bg-white rounded-t-3xl border-t-[8px] border-x-[8px] border-slate-800 shadow-2xl flex flex-col">
                    <div className="bg-purple-600 h-16 w-full flex items-center justify-center text-white font-bold text-sm">
                      Pizzaria Noxus
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="w-1/2 h-3 bg-slate-200 rounded-full"></div>
                      <div className="flex gap-2">
                        <div className="w-12 h-12 bg-red-100 rounded-lg"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="w-full h-2 bg-slate-200 rounded-full"></div>
                          <div className="w-2/3 h-2 bg-slate-200 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="w-full h-2 bg-slate-200 rounded-full"></div>
                          <div className="w-2/3 h-2 bg-slate-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: WhatsApp */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.2 }}
                className="md:col-span-4 bg-gradient-to-br from-[#128C7E] to-[#075E54] rounded-3xl overflow-hidden p-8 flex flex-col text-white shadow-lg"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Integração com WhatsApp</h3>
                <p className="text-green-50 mb-auto">Receba os pedidos direto no seu WhatsApp, já formatados e com todos os dados do cliente e cálculo de troco.</p>
                <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-md">
                  <div className="text-sm font-semibold opacity-90 mb-1">Novo pedido #1024</div>
                  <div className="text-xs opacity-75">1x Pizza Calabresa G...</div>
                </div>
              </motion.div>

              {/* Card 3: Integrations */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.3 }}
                className="md:col-span-12 bg-slate-900 rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row items-center text-white"
              >
                <div className="md:w-1/2 mb-8 md:mb-0">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Super integradora</h3>
                  <p className="text-slate-400 mb-6 max-w-md">Conecte sua loja aos principais marketplaces e receba todos os pedidos em uma única tela. Fim do tablet de cada aplicativo apitando sem parar.</p>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-end gap-4 w-full">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <span className="font-bold text-sm">iFood</span>
                  </div>
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <span className="font-bold text-sm">Rappi</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="avaliacoes" className="py-24 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="text-3xl md:text-5xl font-bold mb-4 text-slate-900"
              >
                Quem usa, <span className="text-purple-600">recomenda</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-8 rounded-3xl flex flex-col"
                >
                  <div className="flex gap-1 mb-6 text-purple-600">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-lg text-slate-600 font-medium mb-8 flex-1 leading-relaxed">"{review.text}"</p>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{review.name}</h4>
                    <span className="text-purple-600 text-sm font-bold bg-purple-50 px-2 py-1 rounded-lg mt-1 inline-block">{review.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="text-3xl md:text-5xl font-bold mb-4 text-slate-900"
              >
                Preço justo e sem surpresas
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-500 font-medium"
              >
                Escolha o plano que cabe no seu bolso. Zero taxas escondidas.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
              {/* Plus Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-200 p-8 md:p-10 rounded-3xl relative flex flex-col shadow-lg shadow-slate-100 md:my-8"
              >
                {!trialUsed && !isAdmin && (
                  <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-sm font-black tracking-wide shadow-lg rotate-3 border-2 border-white">
                    14 DIAS GRÁTIS
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute -top-4 -right-4 bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm font-bold tracking-wide shadow-lg border-2 border-white">
                    EQUIPE
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-500 mb-2 tracking-tight">Plano Plus</h3>
                  <div className="flex flex-col gap-1">
                    {!trialUsed && !isAdmin ? (
                       <>
                         <span className="text-2xl font-bold text-slate-300 line-through decoration-red-500/50 decoration-2">R$ 49,90</span>
                         <div className="flex items-baseline gap-1">
                           <span className="text-5xl font-black text-emerald-600 tracking-tighter">R$ 0,00</span>
                           <span className="text-slate-500 font-medium">/14 dias</span>
                         </div>
                       </>
                    ) : (
                       <div className="flex items-baseline gap-1">
                         <span className="text-5xl font-black text-slate-900 tracking-tighter">R$ 49,90</span>
                         <span className="text-slate-500 font-medium">/mês</span>
                       </div>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span>Nós montamos o seu primeiro cardápio</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span>Link exclusivo para sua loja</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span>Suporte via WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span>2 atualizações de cardápio todo mês</span>
                  </li>
                </ul>
                
                <Link href={isAdmin || trialUsed ? "/dashboard/plans" : "/register"} className="w-full block text-center bg-slate-50 hover:bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold transition-colors border border-slate-200">
                  {isAdmin ? "Acesso Admin" : (trialUsed ? "Começar com o Plus" : "Começar teste Grátis")}
                </Link>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900 border-2 border-purple-500 p-8 md:p-10 rounded-3xl relative flex flex-col shadow-2xl shadow-purple-900/20 z-10"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-1.5 rounded-full text-sm font-black tracking-widest shadow-lg border-2 border-slate-900">
                  MAIS ESCOLHIDO
                </div>
                
                <div className="mb-8 mt-2">
                  <h3 className="text-xl font-bold text-purple-400 mb-2 tracking-tight">Plano PRO</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">R$ 99,90</span>
                    <span className="text-slate-400 font-medium">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-white font-bold">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>Tudo que tem no plano Plus</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>1 atualização de cardápio POR SEMANA</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>Sistema de painel para controle dos pedidos</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                    <span>Gerenciamento de estoque em tempo real</span>
                  </li>
                </ul>
                
                <Link href="/register" className="w-full block text-center bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-purple-900/50">
                  Começar com o PRO
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/noxus-logo.jpg" alt="Agência NOXUS" className="h-12 w-auto mix-blend-multiply rounded-lg" />
                <span className="text-xl font-black tracking-tighter text-slate-900">
                  Agência <span className="text-purple-600">NOXUS</span>
                </span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6 font-medium">
                Simplificamos o delivery do seu negócio com tecnologia acessível, design premium e focada em resultados reais.
              </p>
              <Link href="/register" className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                Criar uma conta
              </Link>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Links Úteis</h4>
              <ul className="space-y-3 font-medium">
                <li><Link href="/login" className="text-slate-500 hover:text-purple-600 transition-colors">Entrar no painel</Link></li>
                <li><Link href="#solucoes" className="text-slate-500 hover:text-purple-600 transition-colors">Ver soluções</Link></li>
                <li><Link href="#planos" className="text-slate-500 hover:text-purple-600 transition-colors">Preços</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3 font-medium">
                <li><Link href="/terms" className="text-slate-500 hover:text-purple-600 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="text-slate-500 hover:text-purple-600 transition-colors">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} Agência NOXUS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
