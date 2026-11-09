import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Truck, 
  Tractor, 
  Ship, 
  Crown, 
  Building2, 
  Navigation, 
  MapPin, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  Clock, 
  Users, 
  RefreshCw, 
  Check, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Briefcase, 
  Calendar, 
  Settings, 
  Phone,
  Power,
  ChevronDown
} from 'lucide-react';

export default function App() {
  // ---------------------------------------------------------------------------
  // ESTADOS GLOBAIS DE NAVEGAÇÃO E DADOS
  // ---------------------------------------------------------------------------
  // Modos de Acesso: 'welcome' | 'client' | 'owner' | 'freelancer'
  const [currentMode, setCurrentMode] = useState('welcome');

  // Banco de Dados Simulados (Multi-Tenant / Estabelecimentos)
  const [businesses, setBusinesses] = useState({
    'auto-spa-ibiuna': {
      id: 'auto-spa-ibiuna',
      name: 'Auto Spa Ibiúna (Matriz)',
      address: 'Rod. Bunjiro Nakao, Km 62 - Ibiúna',
      hasVip: true,
      queueCount: 5,
      status: 'Movimentado',
      statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      estimatedWait: '~60 min',
      activeCars: [
        { id: 101, plate: 'ABC-1234', model: 'Hilux Prata', service: 'Lavagem + Chassi', stage: 'Em Lavagem', time: '25 min' },
        { id: 102, plate: 'XYZ-5678', model: 'Corolla Preto', service: 'Ducha Express', stage: 'Secagem', time: '10 min' },
        { id: 103, plate: 'DEF-9012', model: 'Jeep Compass', service: 'Higienização + Cera', stage: 'Fila de Espera', time: '--' }
      ]
    },
    'jato-central': {
      id: 'jato-central',
      name: 'Jato Central (Posto)',
      address: 'Av. São Sebastião, 450 - Centro',
      hasVip: false,
      queueCount: 1,
      status: 'Tranquilo',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      estimatedWait: '~20 min',
      activeCars: [
        { id: 201, plate: 'MNO-3456', model: 'Onix Vermelho', service: 'Lavagem Simples', stage: 'Em Enxágue', time: '15 min' }
      ]
    }
  });

  const [selectedBusinessId, setSelectedBusinessId] = useState('auto-spa-ibiuna');
  const currentBusiness = businesses[selectedBusinessId];

  // ---------------------------------------------------------------------------
  // ESTADOS DO MODO CLIENTE ANÔNIMO
  // ---------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState('sedan');
  const [selectedServices, setSelectedServices] = useState(['srv-1', 'srv-3']);
  const [fulfillmentType, setFulfillmentType] = useState('patio'); // 'patio' | 'valet' | 'vip'
  const [distanceKm, setDistanceKm] = useState(8);
  const [showModalWhatsApp, setShowModalWhatsApp] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // ---------------------------------------------------------------------------
  // ESTADOS DO MODO DONO DO LAVA-RÁPIDO (SaaS)
  // ---------------------------------------------------------------------------
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobPay, setNewJobPay] = useState('');

  // ---------------------------------------------------------------------------
  // ESTADOS DO MODO FREELANCER / VALET
  // ---------------------------------------------------------------------------
  const [jobOffers, setJobOffers] = useState([
    { id: 1, place: 'Auto Spa Ibiúna', role: 'Lavador / Polidor', pay: 'R$ 140,00', date: 'Hoje (Sábado)', status: 'Disponível' },
    { id: 2, place: 'Jato Central', role: 'Motorista Valet (Coleta)', pay: 'R$ 35,00 / rota', date: 'Turno Tarde', status: 'Disponível' }
  ]);

  // ---------------------------------------------------------------------------
  // TABELAS E CÁLCULOS DINÂMICOS
  // ---------------------------------------------------------------------------
  const categories = [
    { id: 'sedan', name: 'Sedan / Passeio', icon: Car, multiplier: 1.0, desc: 'Hatch, Sedan, Compactos' },
    { id: 'suv', name: 'Pickup / SUV', icon: Truck, multiplier: 1.3, desc: 'Hilux, SW4, Compass, Toro' },
    { id: 'trator', name: 'Maquinário Agrícola', icon: Tractor, multiplier: 2.2, desc: 'Tratores, Colheitadeiras, UTVs' },
    { id: 'barco', name: 'Náutico / Lancha', icon: Ship, multiplier: 2.5, desc: 'Lanchas, Jetskis, Barcos' },
  ];

  const servicesList = [
    { id: 'srv-1', title: 'Lavagem Completa + Cera', desc: 'Lavagem técnica de lataria, caixa de rodas e aspiração interna.', basePrice: 70 },
    { id: 'srv-2', title: 'Higienização de Estofados', desc: 'Limpeza profunda de bancos e higienização do sistema de ar.', basePrice: 130 },
    { id: 'srv-3', title: 'Descontaminação de Lama / Chassi', desc: 'Remoção intensiva de barro e sujeira pesada da região rural.', basePrice: 90 },
    { id: 'srv-4', title: 'Polimento Térmico de Pintura', desc: 'Abrilhantamento e eliminação de riscos superficiais.', basePrice: 200 }
  ];

  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategory) || categories[0];
  }, [selectedCategory]);

  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((acc, srvId) => {
      const srv = servicesList.find(s => s.id === srvId);
      return acc + (srv ? srv.basePrice * currentCategory.multiplier : 0);
    }, 0);
  }, [selectedServices, currentCategory]);

  const deliveryFee = useMemo(() => {
    if (fulfillmentType === 'patio') return 0;
    if (fulfillmentType === 'valet') return 15 + (distanceKm * 3.8);
    if (fulfillmentType === 'vip') return 45 + (distanceKm * 4.5);
    return 0;
  }, [fulfillmentType, distanceKm]);

  const grandTotal = useMemo(() => {
    return servicesTotal + deliveryFee;
  }, [servicesTotal, deliveryFee]);

  // Handler para alternar serviços
  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length === 1) return;
      setSelectedServices(selectedServices.filter(s => s.id !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // Switch do Dono (Ativar/Desativar Unidade Móvel VIP)
  const toggleVipCapacity = () => {
    const updatedStatus = !currentBusiness.hasVip;
    setBusinesses({
      ...businesses,
      [selectedBusinessId]: {
        ...currentBusiness,
        hasVip: updatedStatus
      }
    });

    // Se o cliente estava com VIP selecionado e o dono desativou, cai para pátio
    if (!updatedStatus && fulfillmentType === 'vip') {
      setFulfillmentType('patio');
    }

    showToast(updatedStatus ? '👑 Unidade Móvel VIP ativada!' : '⚠️ Unidade Móvel VIP pausada no sistema!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleFinishWhatsApp = (e) => {
    e.preventDefault();
    if (!whatsappPhone) return;
    setShowModalWhatsApp(false);
    showToast(`✅ OS gerada com sucesso! Enviada para o WhatsApp: ${whatsappPhone}`);
  };

  const handleAcceptJob = (jobId) => {
    setJobOffers(jobOffers.map(j => j.id === jobId ? { ...j, status: 'Turno Aceito ✔️' } : j));
    showToast('🎉 Turno aceito! O dono do lava-rápido foi notificado.');
  };

  const handleCreateJobOffer = (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobPay) return;
    const newOffer = {
      id: Date.now(),
      place: currentBusiness.name,
      role: newJobTitle,
      pay: `R$ ${newJobPay}`,
      date: 'Hoje',
      status: 'Disponível'
    };
    setJobOffers([newOffer, ...jobOffers]);
    setNewJobTitle('');
    setNewJobPay('');
    setShowNewJobModal(false);
    showToast('📢 Oferta de diária publicada no Mural dos Freelancers!');
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col items-center justify-start p-2 sm:p-4 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Toast Notificação Flutuante */}
      {toastMessage && (
        <div className="fixed top-4 z-50 bg-emerald-500 text-zinc-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOLDURA DO SMARTPHONE INTERATIVO */}
      <div className="w-full max-w-md bg-[#111113] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative my-auto min-h-[90vh]">
        
        {/* BARRA SUPERIOR DO APLICATIVO */}
        <header className="bg-[#161619] border-b border-zinc-800 p-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
              💦
            </div>
            <div>
              <h1 className="font-extrabold text-xs tracking-wider text-white">JATO SPLASH CAR</h1>
              <p className="text-[9px] text-zinc-500">Ibiúna & Região • Estética Automotiva</p>
            </div>
          </div>

          {/* Botão de Troca de Perfil quando já está dentro de algum modo */}
          {currentMode !== 'welcome' && (
            <button
              onClick={() => setCurrentMode('welcome')}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-zinc-700/80 flex items-center space-x-1 transition-all"
            >
              <RefreshCw className="w-3 h-3 text-emerald-400" />
              <span>Trocar Perfil</span>
            </button>
          )}
        </header>

        {/* =========================================================================
            1. TELA INICIAL (SPLASH / SELETOR DE PERFIL DE ENTRADA)
           ========================================================================= */}
        {currentMode === 'welcome' && (
          <div className="p-5 flex-1 flex flex-col justify-center space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-2xl">
                🧼
              </div>
              <h2 className="text-base font-bold text-white">Como deseja acessar hoje?</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Selecione o seu perfil para entrar direto no aplicativo sem cadastros burocráticos.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Opção A: Cliente Anônimo */}
              <button
                onClick={() => setCurrentMode('client')}
                className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 hover:border-emerald-500 flex items-center space-x-3 text-left transition-all group shadow-lg shadow-emerald-500/5 hover:scale-[1.01]"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    Sou Cliente • Modo Anônimo
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Calcule orçamentos rápidos, consulte filas do pátio e agende direto pelo WhatsApp.
                  </div>
                </div>
              </button>

              {/* Opção B: Dono do Lava-Rápido */}
              <button
                onClick={() => setCurrentMode('owner')}
                className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500 flex items-center space-x-3 text-left transition-all group hover:scale-[1.01]"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-400">
                    Sou Dono de Lava-Rápido
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Painel SaaS de controle de pátio, vagas ativas e chaveamento da Unidade Móvel VIP.
                  </div>
                </div>
              </button>

              {/* Opção C: Freelancer / Valet */}
              <button
                onClick={() => setCurrentMode('freelancer')}
                className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500 flex items-center space-x-3 text-left transition-all group hover:scale-[1.01]"
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-400">
                    Sou Freelancer / Valet
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Mural de ofertas de diárias em lava-rápidos da região e rotas de coleta.
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. MODO CLIENTE ANÔNIMO (FLUXO DE AGENDAMENTO)
           ========================================================================= */}
        {currentMode === 'client' && (
          <div className="flex-1 flex flex-col overflow-hidden pb-28">
            
            {/* TOP BAR DE ESTABELECIMENTO & TERMÔMETRO DE OCUPAÇÃO */}
            <div className="bg-zinc-950 p-3 border-b border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Estabelecimento:</span>
                <select 
                  value={selectedBusinessId} 
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-emerald-400 font-bold text-xs focus:outline-none"
                >
                  <option value="auto-spa-ibiuna">Auto Spa Ibiúna (Com VIP)</option>
                  <option value="jato-central">Jato Central (Sem VIP)</option>
                </select>
              </div>

              {/* TERMÔMETRO DE FILA EM TEMPO REAL */}
              <div className="flex items-center justify-between bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 text-xs">
                <div className="flex items-center space-x-1.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fila do Pátio:</span>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentBusiness.statusColor}`}>
                  {currentBusiness.status} ({currentBusiness.queueCount} carros • {currentBusiness.estimatedWait})
                </div>
              </div>
            </div>

            {/* CORPO DA TELA CLIENTE (SCROLLABLE) */}
            <div className="p-4 space-y-5 overflow-y-auto flex-1">
              
              {/* 1. SELEÇÃO DE CATEGORIA */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                  1. Categoria do Veículo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50'
                            : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg w-fit mb-1.5 ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-white">{cat.name}</div>
                        <div className="text-[9px] text-zinc-500 line-clamp-1">{cat.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SERVIÇOS DE ESTÉTICA */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    2. Escolha os Serviços
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Fator ({currentCategory.multiplier}x)
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
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'border-emerald-500/60 bg-zinc-900 text-white'
                            : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-bold text-white">{srv.title}</div>
                          <div className="text-[10px] text-zinc-500">{srv.desc}</div>
                          <div className="text-xs font-bold text-emerald-400">
                            R$ {calculatedPrice.toFixed(2).replace('.', ',')}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. MODALIDADE DE ATENDIMENTO (TRAVA REGRA DE NEGÓCIO VIP) */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                  3. Local de Execução
                </label>
                <div className="space-y-2">
                  
                  {/* Pátio Fixo */}
                  <div
                    onClick={() => setFulfillmentType('patio')}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      fulfillmentType === 'patio'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Atendimento no Pátio Fixo</div>
                        <div className="text-[10px] text-zinc-500">Você leva o veículo até a matriz</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Grátis
                    </span>
                  </div>

                  {/* Valet Leva e Traz */}
                  <div
                    onClick={() => setFulfillmentType('valet')}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      fulfillmentType === 'valet'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Navigation className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Leva e Traz / Valet</div>
                        <div className="text-[10px] text-zinc-500">Coletamos no seu sítio ({distanceKm} km)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      R$ {(15 + distanceKm * 3.8).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* 👑 OS VIP (No Local) - COM TRAVA INTELIGENTE */}
                  <div
                    onClick={() => {
                      if (currentBusiness.hasVip) {
                        setFulfillmentType('vip');
                      } else {
                        showToast('⚠️ Este lava-rápido não possui Unidade Móvel. Escolha Pátio ou Valet.');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !currentBusiness.hasVip
                        ? 'border-zinc-800/60 bg-zinc-950/20 opacity-50 cursor-not-allowed'
                        : fulfillmentType === 'vip'
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                          : 'border-amber-500/30 bg-zinc-900/60 text-zinc-300 hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Crown className={`w-4 h-4 ${currentBusiness.hasVip ? 'text-amber-400' : 'text-zinc-600'}`} />
                        <div>
                          <div className="text-xs font-bold text-amber-300">👑 OS VIP (Lavagem no Seu Local)</div>
                          <div className="text-[9px] text-zinc-400">
                            {currentBusiness.hasVip
                              ? 'Unidade móvel vai até sua chácara/sítio'
                              : '⚠️ Indisponível neste estabelecimento (Escolha Pátio ou Valet)'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${currentBusiness.hasVip ? 'text-amber-400' : 'text-zinc-600'}`}>
                        {currentBusiness.hasVip ? `R$ ${(45 + distanceKm * 4.5).toFixed(2).replace('.', ',')}` : 'Bloqueado'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* SLIDER DE DISTÂNCIA KM QUANDO FOR VALET OU VIP */}
                {fulfillmentType !== 'patio' && (
                  <div className="mt-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Distância do atendimento:</span>
                      <span className="font-bold text-emerald-400 font-mono">{distanceKm} KM</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* RESUMO FIXO E BOTÃO DE ATENDIMENTO */}
            <div className="p-4 bg-[#161619] border-t border-zinc-800 absolute bottom-0 left-0 right-0 space-y-2 z-30">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total Estimado da OS:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  R$ {grandTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                onClick={() => setShowModalWhatsApp(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>CONFIRMAR AGENDAMENTO NO WHATSAPP</span>
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            3. MODO DONO DO LAVA-RÁPIDO (PAINEL SAAS & PÁTIO)
           ========================================================================= */}
        {currentMode === 'owner' && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 text-xs text-blue-300 flex items-center justify-between">
              <div>
                <span className="font-bold block text-white">{currentBusiness.name}</span>
                <span className="text-[10px] text-blue-400">Painel de Gestão SaaS & Capacidade</span>
              </div>
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>

            {/* CHAVEAMENTO DE CAPACIDADE DA UNIDADE MÓVEL VIP */}
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Unidade Móvel VIP</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">Receber chamados para lavagem no local</div>
                </div>

                {/* BOTÃO SWITCH INTERATIVO */}
                <button
                  onClick={toggleVipCapacity}
                  className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${
                    currentBusiness.hasVip ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="text-[10px] text-zinc-400 border-t border-zinc-800 pt-2 flex items-center justify-between">
                <span>Status da Flag `has_mobile_vip_unit`:</span>
                <span className={`font-bold ${currentBusiness.hasVip ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {currentBusiness.hasVip ? 'ATIVADO (Recebendo OS)' : 'PAUSADO (Bloqueado)'}
                </span>
              </div>
            </div>

            {/* FILA DO PÁTIO EM TEMPO REAL */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-bold text-zinc-300">Quadro de Fila do Pátio</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {currentBusiness.activeCars.length} veículos em atendimento
                </span>
              </div>

              <div className="space-y-2">
                {currentBusiness.activeCars.map((car) => (
                  <div key={car.id} className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span>{car.model}</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                          {car.plate}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400">{car.service}</div>
                    </div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg font-bold">
                      {car.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÃO PUBLICAR DIÁRIA PARA FREELANCER */}
            <button
              onClick={() => setShowNewJobModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publicar Oferta de Diária no Mural</span>
            </button>

          </div>
        )}

        {/* =========================================================================
            4. MODO FREELANCER / VALET (MURAL DE DIÁRIAS)
           ========================================================================= */}
        {currentMode === 'freelancer' && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3 text-xs text-purple-300 flex items-center justify-between">
              <div>
                <span className="font-bold block text-white">Mural de Diárias & Turnos</span>
                <span className="text-[10px] text-purple-400">Lava-Rápidos parceiros em Ibiúna</span>
              </div>
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-3">
              {jobOffers.map((job) => (
                <div key={job.id} className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-white block">{job.place}</span>
                      <span className="text-[10px] text-zinc-400">{job.role}</span>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono text-xs">{job.pay}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                    <span>Data: {job.date}</span>
                    <span className={`font-bold ${job.status.includes('Aceito') ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {job.status}
                    </span>
                  </div>

                  {!job.status.includes('Aceito') && (
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-all mt-1"
                    >
                      Aceitar Este Turno
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          MODAIS AUXILIARES (WHATSAPP & PUBLICAR VAGA)
         ========================================================================= */}
      
      {/* Modal Captura de WhatsApp */}
      {showModalWhatsApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161619] border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowModalWhatsApp(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Gerar Protocolo de OS • WhatsApp</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Digite seu número para gravarmos o agendamento no banco de dados do Supabase e enviar a confirmação:
            </p>
            <form onSubmit={handleFinishWhatsApp} className="space-y-3">
              <input
                type="text"
                placeholder="Seu Nome (opcional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="tel"
                required
                placeholder="(15) 99999-9999"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Enviar Orçamento 📲
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Publicar Diária (Dono) */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161619] border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowNewJobModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-white">Publicar Oferta de Diária</h3>
            <form onSubmit={handleCreateJobOffer} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Função (ex: Lavador de Pátio)"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                required
                placeholder="Valor da Diária (ex: 150,00)"
                value={newJobPay}
                onChange={(e) => setNewJobPay(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-600/20"
              >
                Publicar no Mural
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}