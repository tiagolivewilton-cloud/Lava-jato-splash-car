import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Truck, 
  Tractor, 
  Ship, 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  ChevronRight, 
  Zap, 
  MessageSquare, 
  X,
  Crown,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function JatoSplashCarApp() {
  // Simulação de Estabelecimento com/sem capacidade VIP (Supabase has_mobile_vip_unit)
  const [selectedBusinessId, setSelectedBusinessId] = useState('auto-spa');

  const businesses = {
    'auto-spa': { 
      id: 'auto-spa', 
      name: 'Auto Spa Ibiúna (Matriz)', 
      hasMobileVipUnit: true,
      address: 'Centro, Ibiúna - SP'
    },
    'jato-central': { 
      id: 'jato-central', 
      name: 'Jato Central (Posto)', 
      hasMobileVipUnit: false,
      address: 'Rod. Bunjiro Nakao - Ibiúna'
    }
  };

  const currentBusiness = businesses[selectedBusinessId];

  // Estados de seleção anônima
  const [selectedCategory, setSelectedCategory] = useState('sedan');
  const [selectedServices, setSelectedServices] = useState(['srv-1', 'srv-3']);
  const [fulfillmentType, setFulfillmentType] = useState('patio'); // 'patio' | 'valet' | 'vip_mobile'
  const [distanceKm, setDistanceKm] = useState(8);

  // Estados do Modal de Confirmação
  const [showModal, setShowModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Categorias de Veículos e multiplicadores
  const categories = [
    { 
      id: 'sedan', 
      name: 'Sedan / Passeio', 
      icon: Car, 
      multiplier: 1.0, 
      desc: 'Hatch, Sedan, Compactos', 
      badge: 'Popular' 
    },
    { 
      id: 'suv', 
      name: 'Pickup / SUV', 
      icon: Truck, 
      multiplier: 1.25, 
      desc: 'Hilux, SW4, Compass, Toro', 
      badge: 'Mais Pedido' 
    },
    { 
      id: 'trator', 
      name: 'Maquinário / Agrícola', 
      icon: Tractor, 
      multiplier: 2.0, 
      desc: 'Tratores, Colheitadeiras, UTVs', 
      badge: 'Rural' 
    },
    { 
      id: 'barco', 
      name: 'Náutico / Lancha', 
      icon: Ship, 
      multiplier: 2.5, 
      desc: 'Lanchas, Jetskis, Barcos', 
      badge: 'Náutico' 
    },
  ];

  // Serviços Base
  const servicesList = [
    { 
      id: 'srv-1', 
      title: 'Lavação Completa + Cera', 
      desc: 'Lavagem técnica de lataria, caixa de rodas e cera selante protetora.',
      basePrice: 90 
    },
    { 
      id: 'srv-2', 
      title: 'Higienização de Estofados & Ar', 
      desc: 'Limpeza profunda de bancos, higienização de ar e remoção de odores.',
      basePrice: 140 
    },
    { 
      id: 'srv-3', 
      title: 'Descontaminação de Lama / Chassi', 
      desc: 'Remoção pesada de resíduos de solo rural e proteção de chassi.',
      basePrice: 110 
    },
    { 
      id: 'srv-4', 
      title: 'Polimento Técnico de Pintura', 
      desc: 'Eliminação de riscos superficiais e restauração de brilho espelhado.',
      basePrice: 240 
    },
  ];

  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategory) || categories[0];
  }, [selectedCategory]);

  // Cálculos dinâmicos em tempo real
  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((acc, srvId) => {
      const srv = servicesList.find(s => s.id === srvId);
      return acc + (srv ? srv.basePrice * currentCategory.multiplier : 0);
    }, 0);
  }, [selectedServices, currentCategory]);

  // Cálculo da Taxa de Deslocamento
  const deliveryFee = useMemo(() => {
    if (fulfillmentType === 'patio') return 0;
    if (fulfillmentType === 'valet') {
      return 15 + (distanceKm * 3.50);
    }
    if (fulfillmentType === 'vip_mobile') {
      return 35 + (distanceKm * 4.50);
    }
    return 0;
  }, [fulfillmentType, distanceKm]);

  const grandTotal = useMemo(() => {
    return servicesTotal + deliveryFee;
  }, [servicesTotal, deliveryFee]);

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length === 1) return;
      setSelectedServices(selectedServices.filter(s => s.id !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!whatsappPhone) return;

    setShowModal(false);
    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Simulation Frame Container */}
      <div className="w-full max-w-md bg-[#0e0e11] border border-zinc-800/90 rounded-[2.5rem] shadow-2xl shadow-emerald-950/20 overflow-hidden flex flex-col relative my-auto min-h-[92vh]">
        
        {/* Notch / Dynamic Island Simulation */}
        <div className="w-full bg-[#141418] pt-3 pb-2 px-6 flex justify-between items-center text-[10px] text-zinc-400 font-mono border-b border-zinc-800/50">
          <span>17:28</span>
          <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center border border-zinc-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse"></div>
          </div>
          <span className="flex items-center gap-1">5G ⚡</span>
        </div>

        {/* Top Header */}
        <header className="bg-[#141418]/95 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#0e0e11] rounded-[0.9rem] flex items-center justify-center text-lg">
                  💦
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">JATO SPLASH CAR</span>
                </h1>
                <p className="text-[10px] text-zinc-400 font-medium">Estética Automotiva & VIP Móvel</p>
              </div>
            </div>

            {/* Badge de Navegação Anônima */}
            <div className="flex items-center space-x-1.5 bg-zinc-900/90 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Modo Anônimo</span>
            </div>
          </div>

          {/* SIMULADOR DE CAPACIDADE DO ESTABELECIMENTO */}
          <div className="bg-zinc-950/90 p-2.5 rounded-2xl border border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Lava-Rápido:
            </span>
            <select 
              value={selectedBusinessId} 
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-1 text-[11px] text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="auto-spa">Auto Spa Ibiúna (Possui VIP 👑)</option>
              <option value="jato-central">Jato Central (Sem VIP ⚠️)</option>
            </select>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1 pb-36">
          
          {/* Banner Didático */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 p-3.5 rounded-2xl border border-emerald-500/20 flex items-start space-x-3">
            <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white block mb-0.5">Orçamento instantâneo sem cadastro!</span>
              Escolha seu veículo, os serviços e veja o cálculo dinâmico na hora.
            </div>
          </div>

          {/* SEÇÃO 1: Categoria do Veículo */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                1. Selecione o Veículo
              </label>
              <span className="text-[10px] text-zinc-500">Grid Táctil</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50 scale-[1.01]'
                        : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    {cat.badge && (
                      <span className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {cat.badge}
                      </span>
                    )}

                    <div className={`p-2 rounded-xl mb-2 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/60 text-zinc-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-xs font-bold text-zinc-100 leading-tight">{cat.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 2: Serviços & Valores Dinâmicos */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                2. Serviços Disponíveis
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">
                {currentCategory.multiplier > 1.0 ? `Fator (${currentCategory.multiplier}x)` : 'Preço Base'}
              </span>
            </div>

            <div className="space-y-2">
              {servicesList.map((srv) => {
                const isChecked = selectedServices.includes(srv.id);
                const calculatedPrice = srv.basePrice * currentCategory.multiplier;

                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-emerald-500/60 bg-zinc-900/90 text-white shadow-md'
                        : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="text-xs font-bold text-white">{srv.title}</div>
                      <p className="text-[10px] text-zinc-500 leading-normal">{srv.desc}</p>
                      <div className="text-xs font-black text-emerald-400 pt-0.5">
                        R$ {calculatedPrice.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all ${
                      isChecked ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}>
                      {isChecked ? <CheckCircle2 className="w-3.5 h-3.5" /> : '+'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 3: Local de Execução (Regra de Negócio Crítica: OS VIP) */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                3. Local de Execução
              </label>
              <span className="text-[10px] text-zinc-500">Validação Server-Side</span>
            </div>

            <div className="space-y-2.5">
              {/* Opção Pátio Fixo */}
              <button
                type="button"
                onClick={() => setFulfillmentType('patio')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  fulfillmentType === 'patio'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50'
                    : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${fulfillmentType === 'patio' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">🏢 Atendimento no Pátio Fixo</div>
                    <div className="text-[10px] text-zinc-400">Você leva o veículo até o lava-rápido</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Sem Taxa
                </span>
              </button>

              {/* Opção Valet Leva e Traz */}
              <button
                type="button"
                onClick={() => setFulfillmentType('valet')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  fulfillmentType === 'valet'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50'
                    : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${fulfillmentType === 'valet' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">🚙 Leva e Traz (Valet)</div>
                    <div className="text-[10px] text-zinc-400">Buscamos no seu sítio/condomínio por KM</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Por KM
                </span>
              </button>

              {/* Opção 👑 OS VIP - Lavagem no Local (RECURSO ESTRUTURAL) */}
              <div 
                onClick={() => {
                  if (currentBusiness.hasMobileVipUnit) {
                    setFulfillmentType('vip_mobile');
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                  !currentBusiness.hasMobileVipUnit
                    ? 'border-zinc-800/80 bg-zinc-950/50 opacity-60 cursor-not-allowed'
                    : fulfillmentType === 'vip_mobile'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/30 cursor-pointer'
                      : 'border-amber-500/40 bg-zinc-900/60 text-zinc-300 hover:border-amber-500 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      currentBusiness.hasMobileVipUnit 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5 text-amber-400">
                        👑 OS VIP - Lavagem no Local
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 max-w-[200px]">
                        {currentBusiness.hasMobileVipUnit ? (
                          'Equipe móvel vai até seu sítio ou condomínio com gerador e reservatório'
                        ) : (
                          <span className="text-amber-400/90 font-medium flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            ⚠️ Unidade móvel indisponível neste lava-rápido. Escolha Pátio ou Valet.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black px-2 py-1 rounded shadow-sm shrink-0 ${
                    currentBusiness.hasMobileVipUnit
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {currentBusiness.hasMobileVipUnit ? 'VIP MÓVEL' : 'RECURSO AUSENTE'}
                  </span>
                </div>
              </div>

            </div>

            {/* Distância por KM quando for Valet ou VIP */}
            {fulfillmentType !== 'patio' && (
              <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Distância em Ibiúna:
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">{distanceKm} KM</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="30"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />

                <div className="flex justify-between items-center text-[10px] text-zinc-400 bg-zinc-900 p-2 rounded-xl border border-zinc-800/80">
                  <span>Taxa de Deslocamento ({fulfillmentType === 'vip_mobile' ? 'Móvel VIP' : 'Valet'}):</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    R$ {deliveryFee.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé Fixo de Resumo e Disparo de WhatsApp */}
        <div className="p-4 bg-[#141418]/95 backdrop-blur-md border-t border-zinc-800/80 absolute bottom-0 left-0 right-0 z-30 space-y-3">
          
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Serviços ({currentCategory.name}):</span>
              <span className="font-mono text-zinc-200">R$ {servicesTotal.toFixed(2).replace('.', ',')}</span>
            </div>

            {fulfillmentType !== 'patio' && (
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>{fulfillmentType === 'vip_mobile' ? 'Taxa OS VIP Móvel:' : 'Taxa Valet (KM):'}</span>
                <span className={`font-mono font-bold ${fulfillmentType === 'vip_mobile' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  R$ {deliveryFee.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-extrabold text-white pt-1 border-t border-zinc-800">
              <span>Total Estimado:</span>
              <span className="text-xl text-emerald-400 font-mono">
                R$ {grandTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs sm:text-sm flex items-center justify-center space-x-2 group"
          >
            <MessageSquare className="w-4 h-4 text-zinc-950 fill-current" />
            <span>CONFIRMAR AGENDAMENTO NO WHATSAPP</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Modal de Envio via WhatsApp */}
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#141418] border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative text-left">
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-emerald-400">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Salvar Orçamento no WhatsApp</h3>
              </div>

              <p className="text-xs text-zinc-400">
                Informe seu número para registrar a Ordem de Serviço (OS) no Supabase e receber a confirmação:
              </p>

              <form onSubmit={handleSendWhatsApp} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Seu Nome (Opcional):</label>
                  <input
                    type="text"
                    placeholder="Ex: Tiago"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Número do WhatsApp (*):</label>
                  <input
                    type="tel"
                    required
                    placeholder="(15) 99999-9999"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <label className="flex items-start space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(e) => setOptIn(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded mt-0.5"
                  />
                  <span className="text-[10px] text-zinc-400 leading-tight">
                    Concordo em receber atualizações e o comprovante da OS via WhatsApp API.
                  </span>
                </label>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Lava-Rápido:</span>
                    <span className="text-white font-semibold">{currentBusiness.name}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Modalidade:</span>
                    <span className="text-white font-semibold">
                      {fulfillmentType === 'patio' && 'Pátio Fixo'}
                      {fulfillmentType === 'valet' && 'Leva e Traz'}
                      {fulfillmentType === 'vip_mobile' && '👑 OS VIP no Local'}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Total OS:</span>
                    <span className="text-emerald-400 font-bold">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!whatsappPhone || !optIn}
                    className="w-1/2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                  >
                    Enviar OS 📲
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="absolute top-16 left-4 right-4 bg-emerald-500 text-zinc-950 p-3 rounded-2xl shadow-xl z-50 flex items-center space-x-3 text-xs font-bold animate-bounce">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Orçamento gerado e Ordem de Serviço enviada para o seu WhatsApp!</span>
          </div>
        )}

      </div>

    </div>
  );
}