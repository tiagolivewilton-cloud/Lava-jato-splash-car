import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  ChevronDown,
  Database,
  DollarSign,
  Tag,
  Trash2,
  Save,
  UserCheck,
  CreditCard,
  Sliders,
  Sparkles,
  Lock,
  Mail,
  FileText,
  BadgeCheck,
  Key,
  LogOut,
  UserPlus,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  fetchBusinesses, 
  insertServiceOrder, 
  updateBusinessVipUnit,
  fetchServiceOrders,
  updateOrderStatus
} from './lib/supabase';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { 
  ValetDriver, 
  OwnerAccount, 
  FreelancerProfile,
  ServiceOrder,
  OrderStatus
} from './types';

// Protocolo curto e legível do pedido (ex: #A1B2C3)
const getOrderProtocol = (id?: string) => {
  if (!id) return '------';
  const clean = id.replace(/^local-/, '').replace(/[^a-zA-Z0-9]/g, '');
  return clean.slice(-6).toUpperCase();
};

// Telefone brasileiro: DDD + 8 ou 9 dígitos, com ou sem +55
const normalizeBrPhone = (value: string): string | null => {
  let digits = (value || '').replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  return digits;
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: 'Novo pedido',
  confirmado: 'Confirmado',
  em_andamento: 'Em andamento',
  concluido: 'Pronto',
  cancelado: 'Cancelado',
};

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pendente: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  confirmado: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  em_andamento: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  concluido: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  cancelado: 'bg-zinc-800 text-zinc-500 border-zinc-700',
};

const FULFILLMENT_LABEL: Record<string, string> = {
  patio: 'Pátio',
  valet: 'Leva e traz',
  vip_mobile: 'VIP no local',
};

// Respostas rápidas que o dono manda ao cliente com um toque
interface QuickReply {
  id: string;
  label: string;
  status: OrderStatus;
  onlyFor?: string[];
  text: (bizName: string, protocol: string) => string;
}

const QUICK_REPLIES: QuickReply[] = [
  {
    id: 'confirmado',
    label: '✅ Pedido confirmado',
    status: 'confirmado',
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. Seu pedido #${prot} está confirmado. Qualquer dúvida é só chamar por aqui. 🚗✨`,
  },
  {
    id: 'buscando',
    label: '🚙 Estou indo buscar',
    status: 'em_andamento',
    onlyFor: ['valet'],
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. Nosso motorista está indo buscar seu veículo agora (pedido #${prot}).`,
  },
  {
    id: 'a_caminho_vip',
    label: '👑 Estou a caminho',
    status: 'em_andamento',
    onlyFor: ['vip_mobile'],
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. Nossa equipe está a caminho do seu endereço para a lavagem (pedido #${prot}).`,
  },
  {
    id: 'lavando',
    label: '🧽 Começamos a lavagem',
    status: 'em_andamento',
    onlyFor: ['patio', 'valet'],
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. Seu veículo já está em lavagem (pedido #${prot}). Avisamos assim que ficar pronto.`,
  },
  {
    id: 'pronto_retirar',
    label: '🏁 Pronto, pode vir retirar',
    status: 'concluido',
    onlyFor: ['patio'],
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. Seu veículo está *PRONTO*! Já pode vir retirar no pátio. (pedido #${prot}) Obrigado pela preferência! 🚗✨`,
  },
  {
    id: 'pronto_levando',
    label: '🏁 Pronto, estou indo levar',
    status: 'concluido',
    onlyFor: ['valet'],
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. Seu veículo está *PRONTO* e nosso motorista já está indo levar até você. (pedido #${prot}) Obrigado pela preferência! 🚗✨`,
  },
  {
    id: 'pronto_vip',
    label: '🏁 Lavagem concluída',
    status: 'concluido',
    onlyFor: ['vip_mobile'],
    text: (biz, prot) => `Olá! Aqui é do *${biz}*. A lavagem do seu veículo foi *concluída*! (pedido #${prot}) Obrigado pela preferência! 🚗✨`,
  },
];

interface ServiceItemDef {
  id: string;
  title: string;
  desc: string;
  basePrice: number;
  active: boolean;
}

interface CategoryDef {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  multiplier: number;
  desc: string;
}

interface BusinessItem {
  id: string;
  name: string;
  phone: string;
  address: string;
  hours: string;
  pixKey: string;
  hasVip: boolean;
  queueCount: number;
  status: string;
  statusColor: string;
  estimatedWait: string;
  valetBaseFee: number;
  valetPerKm: number;
  vipBaseFee: number;
  vipPerKm: number;
  activeCars: Array<{
    id: number;
    plate: string;
    model: string;
    service: string;
    stage: string;
    time: string;
  }>;
}

const LOCAL_STORAGE_SERVICES = 'jato_splash_provider_services';
const LOCAL_STORAGE_BUSINESS = 'jato_splash_provider_business';
const LOCAL_STORAGE_CATEGORIES = 'jato_splash_provider_categories';
const LOCAL_STORAGE_OWNER = 'jato_splash_owner_account';
const LOCAL_STORAGE_VALET_TEAM = 'jato_splash_valet_team';
const LOCAL_STORAGE_FREELANCER = 'jato_splash_freelancer_profile';

export default function App() {
  // ---------------------------------------------------------------------------
  // 1. NAVEGAÇÃO GLOBAL: 'welcome' | 'client' | 'owner' | 'freelancer'
  // ---------------------------------------------------------------------------
  const [currentMode, setCurrentMode] = useState<'welcome' | 'client' | 'owner' | 'freelancer'>('welcome');
  
  // Sub-abas do Painel do Dono do Lava-Rápido: 'credenciais' | 'precos' | 'patio' | 'diarias'
  const [ownerSubTab, setOwnerSubTab] = useState<'credenciais' | 'precos' | 'patio' | 'diarias'>('credenciais');
  const [ownerAuthMode, setOwnerAuthMode] = useState<'login' | 'register'>('register');

  // ---------------------------------------------------------------------------
  // 2. CONTA & CREDENCIAIS DO DONO DO LAVA-RÁPIDO (SaaS)
  // ---------------------------------------------------------------------------
  const [ownerAccount, setOwnerAccount] = useState<OwnerAccount>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_OWNER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isLoggedIn: parsed.isLoggedIn === true ? true : false
        };
      } catch {}
    }
    return {
      email: '',
      password: '',
      cnpjCpf: '',
      razaoSocial: '',
      fantasyName: '',
      phone: '',
      address: '',
      pixKey: '',
      isLoggedIn: false // Inicia na tela de Criar Conta
    };
  });

  // Equipe de Motoristas Valet vinculados diretamente ao Lava-Rápido (apenas dados reais cadastrados)
  const [valetDrivers, setValetDrivers] = useState<ValetDriver[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_VALET_TEAM);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((d: ValetDriver) => !d.name.includes('Carlos Santana') && !d.name.includes('Marcos Vinicius'));
      } catch {}
    }
    return [];
  });

  // Modal para cadastrar novo motorista valet na equipe do lava-rápido
  const [showAddValetModal, setShowAddValetModal] = useState(false);
  const [newValetName, setNewValetName] = useState('');
  const [newValetCnh, setNewValetCnh] = useState('');
  const [newValetPhone, setNewValetPhone] = useState('');

  // ---------------------------------------------------------------------------
  // 3. PERFIL SIMPLIFICADO DO FREELANCER (MÃO DE OBRA TEMPORÁRIA)
  // ---------------------------------------------------------------------------
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfile>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_FREELANCER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.name?.includes('Rodrigo Alves')) {
          return parsed;
        }
      } catch {}
    }
    return {
      name: '',
      whatsapp: '',
      pixKey: '',
      localKey: '',
      specialty: '',
      isRegistered: false
    };
  });

  // ---------------------------------------------------------------------------
  // 4. ESTABELECIMENTOS & PÁTIO (APENAS ESTABELECIMENTOS REAIS)
  // ---------------------------------------------------------------------------
  const [businesses, setBusinesses] = useState<Record<string, BusinessItem>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_BUSINESS);
    let loaded: Record<string, BusinessItem> = {};
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        delete parsed['auto-spa-ibiuna'];
        delete parsed['jato-central'];
        loaded = parsed;
      } catch {}
    }

    // Se o dono já cadastrou uma conta real (ex: Lava Jato Cars), carrega como estabelecimento oficial
    const savedOwner = localStorage.getItem(LOCAL_STORAGE_OWNER);
    if (savedOwner) {
      try {
        const owner = JSON.parse(savedOwner);

        // Limpeza dos duplicados criados pelo bug antigo (um estabelecimento por letra digitada).
        // Estabelecimentos que vieram do Supabase têm id UUID real e nunca são removidos aqui.
        // Dos criados só neste navegador (id "uuid-..."), mantém apenas o do dono.
        const ownerSlugKey = owner.fantasyName?.trim()
          ? 'biz-' + owner.fantasyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
          : '';
        const keepKey = owner.businessId && loaded[owner.businessId] ? owner.businessId : ownerSlugKey;
        if (keepKey && loaded[keepKey]) {
          Object.keys(loaded).forEach((key) => {
            const isLocalOnly = String(loaded[key]?.id || '').startsWith('uuid-');
            if (isLocalOnly && key !== keepKey) {
              delete loaded[key];
            }
          });
          localStorage.setItem(LOCAL_STORAGE_BUSINESS, JSON.stringify(loaded));
        }

        if (owner.fantasyName && owner.fantasyName.trim() && !owner.fantasyName.includes('Auto Spa')) {
          const fantasy = owner.fantasyName.trim();
          const bizKey = owner.businessId || ('biz-' + fantasy.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
          if (!loaded[bizKey]) {
            loaded[bizKey] = {
              id: `uuid-${Date.now()}`,
              name: fantasy,
              phone: owner.phone?.trim() || '',
              address: owner.address?.trim() || '',
              hours: 'Seg a Sáb: 08h às 18h',
              pixKey: owner.cnpjCpf?.trim() || owner.phone?.trim() || '',
              hasVip: true,
              queueCount: 0,
              status: 'Disponível',
              statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              estimatedWait: '~0 min',
              valetBaseFee: 15,
              valetPerKm: 3.5,
              vipBaseFee: 40,
              vipPerKm: 4.0,
              activeCars: []
            };
          }
        }
      } catch {}
    }

    return loaded;
  });

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(() => {
    if (ownerAccount.businessId && businesses[ownerAccount.businessId]) {
      return ownerAccount.businessId;
    }
    const keys = Object.keys(businesses);
    return keys.length > 0 ? keys[0] : '';
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const businessKeys = Object.keys(businesses);
  const currentBusiness: BusinessItem = (selectedBusinessId && businesses[selectedBusinessId]) || (businessKeys.length > 0 ? businesses[businessKeys[0]] : {
    id: '',
    name: 'Nenhum Estabelecimento Cadastrado',
    phone: '',
    address: 'Cadastre seu lava-rápido no perfil Dono',
    hours: '08h às 18h',
    pixKey: '',
    hasVip: false,
    queueCount: 0,
    status: 'Sem atendimento',
    statusColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    estimatedWait: '--',
    valetBaseFee: 0,
    valetPerKm: 0,
    vipBaseFee: 0,
    vipPerKm: 0,
    activeCars: []
  });

  // ---------------------------------------------------------------------------
  // 5. TABELA DE PREÇOS & SERVIÇOS (DO DONO DO LAVA-RÁPIDO)
  // ---------------------------------------------------------------------------
  const [servicesList, setServicesList] = useState<ServiceItemDef[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_SERVICES);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 'srv-1', title: 'Lavagem Completa + Cera', desc: 'Lavagem técnica de lataria, caixa de rodas e aspiração interna.', basePrice: 70, active: true },
      { id: 'srv-2', title: 'Higienização de Estofados', desc: 'Limpeza profunda de bancos e higienização do sistema de ar.', basePrice: 130, active: true },
      { id: 'srv-3', title: 'Descontaminação de Lama / Chassi', desc: 'Remoção intensiva de barro e sujeira pesada da região rural.', basePrice: 90, active: true },
      { id: 'srv-4', title: 'Polimento Técnico de Pintura', desc: 'Abrilhantamento e eliminação de riscos superficiais.', basePrice: 200, active: true }
    ];
  });

  const [categories, setCategories] = useState<CategoryDef[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [
          { id: 'sedan', name: 'Sedan / Passeio', icon: Car, multiplier: parsed.sedan || 1.0, desc: 'Hatch, Sedan, Compactos' },
          { id: 'suv', name: 'Pickup / SUV', icon: Truck, multiplier: parsed.suv || 1.3, desc: 'Hilux, SW4, Compass, Toro' },
          { id: 'trator', name: 'Maquinário Agrícola', icon: Tractor, multiplier: parsed.trator || 2.2, desc: 'Tratores, Colheitadeiras, UTVs' },
          { id: 'barco', name: 'Náutico / Lancha', icon: Ship, multiplier: parsed.barco || 2.5, desc: 'Lanchas, Jetskis, Barcos' },
        ];
      } catch {}
    }
    return [
      { id: 'sedan', name: 'Sedan / Passeio', icon: Car, multiplier: 1.0, desc: 'Hatch, Sedan, Compactos' },
      { id: 'suv', name: 'Pickup / SUV', icon: Truck, multiplier: 1.3, desc: 'Hilux, SW4, Compass, Toro' },
      { id: 'trator', name: 'Maquinário Agrícola', icon: Tractor, multiplier: 2.2, desc: 'Tratores, Colheitadeiras, UTVs' },
      { id: 'barco', name: 'Náutico / Lancha', icon: Ship, multiplier: 2.5, desc: 'Lanchas, Jetskis, Barcos' },
    ];
  });

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [showMultiplierHelpModal, setShowMultiplierHelpModal] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 6. CLIENTE FINAL (100% ANÔNIMO)
  // ---------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState<string>('sedan');
  const [selectedServices, setSelectedServices] = useState<string[]>(['srv-1', 'srv-3']);
  const [fulfillmentType, setFulfillmentType] = useState<'patio' | 'valet' | 'vip'>('patio');
  const [distanceKm, setDistanceKm] = useState<number>(8);

  // Pedidos que aparecem no Pátio do dono
  const [patioOrders, setPatioOrders] = useState<ServiceOrder[]>([]);
  const [patioLoading, setPatioLoading] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 7. MURAL DE DIÁRIAS (FREELANCER)
  // ---------------------------------------------------------------------------
  const [showNewJobModal, setShowNewJobModal] = useState<boolean>(false);
  const [newJobTitle, setNewJobTitle] = useState<string>('');
  const [newJobPay, setNewJobPay] = useState<string>('');
  const [jobOffers, setJobOffers] = useState<Array<{ id: number; place: string; role: string; pay: string; date: string; status: string }>>([]);

  // Sincronização Supabase (apenas registros reais)
  const syncSupabase = useCallback(async () => {
    try {
      const res = await fetchBusinesses();
      setIsSupabaseLive(res.isLive);
      if (res.isLive && res.businesses && res.businesses.length > 0) {
        setBusinesses(prev => {
          const updated = { ...prev };
          res.businesses.forEach(b => {
            const key = 'biz-' + b.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            if (!updated[key]) {
              updated[key] = {
                id: b.id,
                name: b.name,
                phone: b.phone || '',
                address: b.address || '',
                hours: 'Seg a Sáb: 08h às 18h',
                pixKey: b.phone || '',
                hasVip: b.has_mobile_vip_unit,
                queueCount: 0,
                status: 'Disponível',
                statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                estimatedWait: '~0 min',
                valetBaseFee: 15,
                valetPerKm: 3.5,
                vipBaseFee: 40,
                vipPerKm: 4.0,
                activeCars: []
              };
            }
          });
          localStorage.setItem(LOCAL_STORAGE_BUSINESS, JSON.stringify(updated));
          return updated;
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    syncSupabase();
  }, [syncSupabase]);

  // O estabelecimento do dono só é criado/atualizado ao confirmar (handleOwnerRegister /
  // handleSaveCredentials). Antes havia um efeito aqui que rodava a cada tecla digitada no
  // "Nome Fantasia" e criava um estabelecimento novo para cada prefixo ("L", "La", "Lav"...).

  // Cálculos dinâmicos
  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategory) || categories[0];
  }, [selectedCategory, categories]);

  const activeServicesList = useMemo(() => {
    return servicesList.filter(s => s.active);
  }, [servicesList]);

  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((acc, srvId) => {
      const srv = servicesList.find(s => s.id === srvId && s.active);
      return acc + (srv ? srv.basePrice * currentCategory.multiplier : 0);
    }, 0);
  }, [selectedServices, servicesList, currentCategory]);

  const deliveryFee = useMemo(() => {
    if (fulfillmentType === 'patio') return 0;
    if (fulfillmentType === 'valet') return currentBusiness.valetBaseFee + (distanceKm * currentBusiness.valetPerKm);
    if (fulfillmentType === 'vip') return currentBusiness.vipBaseFee + (distanceKm * currentBusiness.vipPerKm);
    return 0;
  }, [fulfillmentType, distanceKm, currentBusiness]);

  const grandTotal = useMemo(() => {
    return servicesTotal + deliveryFee;
  }, [servicesTotal, deliveryFee]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ---------------------------------------------------------------------------
  // OPERAÇÕES DO DONO DO LAVA-RÁPIDO & CREDENCIAIS
  // ---------------------------------------------------------------------------

  const handleOwnerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerAccount.email?.trim() || !ownerAccount.password?.trim()) {
      showToast('⚠️ Preencha e-mail e senha para criar sua conta!');
      return;
    }

    const fantasy = ownerAccount.fantasyName?.trim() || 'Meu Lava-Rápido';
    const bizKey = 'biz-' + fantasy.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const bizPhone = ownerAccount.phone?.trim() || '(15) 99999-8888';
    const bizAddress = ownerAccount.address?.trim() || 'Endereço Comercial';
    const bizCnpj = ownerAccount.cnpjCpf?.trim() || '00.000.000/0001-00';
    const bizRazao = ownerAccount.razaoSocial?.trim() || fantasy;

    const newBusinessItem: BusinessItem = {
      id: `uuid-${Date.now()}`,
      name: fantasy,
      phone: bizPhone,
      address: bizAddress,
      hours: 'Seg a Sáb: 08h às 18h',
      pixKey: bizCnpj || bizPhone,
      hasVip: true,
      queueCount: 0,
      status: 'Disponível',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      estimatedWait: '~0 min',
      valetBaseFee: 15,
      valetPerKm: 3.5,
      vipBaseFee: 40,
      vipPerKm: 4.0,
      activeCars: []
    };

    const updatedBusinesses = {
      ...businesses,
      [bizKey]: newBusinessItem
    };

    setBusinesses(updatedBusinesses);
    localStorage.setItem(LOCAL_STORAGE_BUSINESS, JSON.stringify(updatedBusinesses));
    setSelectedBusinessId(bizKey);

    const updated: OwnerAccount = {
      ...ownerAccount,
      businessId: bizKey,
      fantasyName: fantasy,
      razaoSocial: bizRazao,
      cnpjCpf: bizCnpj,
      phone: bizPhone,
      isLoggedIn: true
    };
    setOwnerAccount(updated);
    localStorage.setItem(LOCAL_STORAGE_OWNER, JSON.stringify(updated));

    showToast(`🎉 Conta criada! "${fantasy}" já está disponível na lista de lava-rápidos.`);
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerAccount.email?.trim() || !ownerAccount.password?.trim()) {
      showToast('⚠️ Digite seu e-mail e senha de acesso!');
      return;
    }
    const updated = { ...ownerAccount, isLoggedIn: true };
    setOwnerAccount(updated);
    localStorage.setItem(LOCAL_STORAGE_OWNER, JSON.stringify(updated));
    if (ownerAccount.businessId && businesses[ownerAccount.businessId]) {
      setSelectedBusinessId(ownerAccount.businessId);
    }
    showToast('🔑 Login efetuado com sucesso no painel corporativo!');
  };

  const handleOwnerLogout = () => {
    const updated = { ...ownerAccount, isLoggedIn: false };
    setOwnerAccount(updated);
    setOwnerAuthMode('register');
    localStorage.setItem(LOCAL_STORAGE_OWNER, JSON.stringify(updated));
    showToast('Sessão encerrada com sucesso.');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const fantasy = ownerAccount.fantasyName?.trim() || 'Meu Lava-Rápido';
    const targetBizId = ownerAccount.businessId || selectedBusinessId;

    const updatedOwner: OwnerAccount = {
      ...ownerAccount,
      businessId: targetBizId,
      fantasyName: fantasy
    };
    setOwnerAccount(updatedOwner);
    localStorage.setItem(LOCAL_STORAGE_OWNER, JSON.stringify(updatedOwner));

    setBusinesses(prev => {
      const existing = prev[targetBizId] || {
        id: `uuid-${Date.now()}`,
        name: fantasy,
        phone: ownerAccount.phone?.trim() || '(15) 99999-8888',
        address: ownerAccount.address?.trim() || 'Endereço Comercial',
        hours: 'Seg a Sáb: 08h às 18h',
        pixKey: ownerAccount.cnpjCpf?.trim() || 'PIX',
        hasVip: true,
        queueCount: 0,
        status: 'Disponível',
        statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        estimatedWait: '~0 min',
        valetBaseFee: 15,
        valetPerKm: 3.5,
        vipBaseFee: 40,
        vipPerKm: 4.0,
        activeCars: []
      };

      const updatedItem: BusinessItem = {
        ...existing,
        name: fantasy,
        phone: ownerAccount.phone?.trim() || existing.phone,
        address: ownerAccount.address?.trim() || existing.address,
        pixKey: ownerAccount.cnpjCpf?.trim() || existing.pixKey
      };

      const next = {
        ...prev,
        [targetBizId]: updatedItem
      };
      localStorage.setItem(LOCAL_STORAGE_BUSINESS, JSON.stringify(next));
      return next;
    });

    showToast(`💾 Dados salvos! "${fantasy}" atualizado na lista de lava-rápidos.`);
  };

  const handleAddValetDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValetName || !newValetCnh) return;
    const newDriver: ValetDriver = {
      id: `valet-${Date.now()}`,
      name: newValetName.trim(),
      cnh: newValetCnh.trim(),
      whatsapp: newValetPhone.trim() || ownerAccount.phone,
      status: 'ativo'
    };
    const updated = [...valetDrivers, newDriver];
    setValetDrivers(updated);
    localStorage.setItem(LOCAL_STORAGE_VALET_TEAM, JSON.stringify(updated));
    setNewValetName('');
    setNewValetCnh('');
    setNewValetPhone('');
    setShowAddValetModal(false);
    showToast(`✅ Motorista Valet "${newDriver.name}" vinculado à equipe do lava-rápido!`);
  };

  const handleRemoveValetDriver = (id: string) => {
    const updated = valetDrivers.filter(d => d.id !== id);
    setValetDrivers(updated);
    localStorage.setItem(LOCAL_STORAGE_VALET_TEAM, JSON.stringify(updated));
    showToast('Motorista removido da equipe.');
  };

  // Preços
  const handleUpdatePrice = (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    const updated = servicesList.map(s => s.id === id ? { ...s, basePrice: newPrice } : s);
    setServicesList(updated);
    localStorage.setItem(LOCAL_STORAGE_SERVICES, JSON.stringify(updated));
  };

  const handleUpdateServiceInfo = (id: string, field: 'title' | 'desc', val: string) => {
    const updated = servicesList.map(s => s.id === id ? { ...s, [field]: val } : s);
    setServicesList(updated);
    localStorage.setItem(LOCAL_STORAGE_SERVICES, JSON.stringify(updated));
  };

  const handleToggleServiceActive = (id: string) => {
    const updated = servicesList.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setServicesList(updated);
    localStorage.setItem(LOCAL_STORAGE_SERVICES, JSON.stringify(updated));
    showToast('Tabela de serviços atualizada!');
  };

  const handleDeleteService = (id: string) => {
    if (servicesList.length <= 1) {
      showToast('⚠️ Mantenha pelo menos 1 serviço cadastrado!');
      return;
    }
    const updated = servicesList.filter(s => s.id !== id);
    setServicesList(updated);
    localStorage.setItem(LOCAL_STORAGE_SERVICES, JSON.stringify(updated));
    setSelectedServices(prev => prev.filter(sId => sId !== id));
    showToast('Serviço removido com sucesso!');
  };

  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const priceNum = parseFloat(newServicePrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Informe um preço válido para o serviço!');
      return;
    }

    const newSrv: ServiceItemDef = {
      id: `srv-${Date.now()}`,
      title: newServiceName.trim(),
      desc: newServiceDesc.trim() || 'Serviço profissional de estética automotiva.',
      basePrice: priceNum,
      active: true,
    };

    const updated = [...servicesList, newSrv];
    setServicesList(updated);
    localStorage.setItem(LOCAL_STORAGE_SERVICES, JSON.stringify(updated));

    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice('');
    setShowAddServiceForm(false);
    showToast(`✅ Serviço "${newSrv.title}" adicionado à tabela de preços!`);
  };

  const handleUpdateMultiplier = (catId: string, val: number) => {
    const updated = categories.map(c => c.id === catId ? { ...c, multiplier: val } : c);
    setCategories(updated);
    const savedObj = updated.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.multiplier }), {});
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(savedObj));
  };

  const handleUpdateBusinessField = (field: keyof BusinessItem, val: any) => {
    const updated = {
      ...businesses,
      [selectedBusinessId]: {
        ...currentBusiness,
        [field]: val
      }
    };
    setBusinesses(updated);
    localStorage.setItem(LOCAL_STORAGE_BUSINESS, JSON.stringify(updated));
  };

  const toggleVipCapacity = async () => {
    const updatedStatus = !currentBusiness.hasVip;
    handleUpdateBusinessField('hasVip', updatedStatus);

    if (!updatedStatus && fulfillmentType === 'vip') {
      setFulfillmentType('patio');
    }

    try {
      await updateBusinessVipUnit(currentBusiness.id, updatedStatus);
    } catch {}

    showToast(updatedStatus ? '👑 Unidade Móvel VIP ativada!' : '⚠️ Unidade Móvel VIP pausada!');
  };

  const handleCreateJobOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobPay.trim()) return;
    const newOffer = {
      id: Date.now(),
      place: currentBusiness.name || 'Jato Splash Car',
      role: newJobTitle.trim(),
      pay: newJobPay.startsWith('R$') ? newJobPay.trim() : `R$ ${newJobPay.trim()}`,
      date: 'Turno Aberto',
      status: 'Disponível'
    };
    setJobOffers(prev => [newOffer, ...prev]);
    setNewJobTitle('');
    setNewJobPay('');
    setShowNewJobModal(false);
    showToast('📢 Oferta de diária publicada no mural dos freelancers!');
  };

  // ---------------------------------------------------------------------------
  // OPERAÇÕES DO CLIENTE (ANÔNIMO)
  // ---------------------------------------------------------------------------
  const toggleClientService = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length === 1) return;
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  // O cliente toca em "Confirmar agendamento no WhatsApp": o pedido é registrado e o
  // WhatsApp do lava-rápido abre direto com o orçamento completo. O número do cliente
  // chega ao dono pela própria conversa do WhatsApp, por isso não pedimos nada aqui.
  const handleFinishWhatsApp = async () => {
    const providerPhone = normalizeBrPhone(currentBusiness.phone || '');
    if (!providerPhone) {
      showToast(`⚠️ ${currentBusiness.name} ainda não cadastrou o WhatsApp. Tente outro lava-rápido.`);
      return;
    }

    // Abre a janela já no clique (evita bloqueio de pop-up) e preenche o link depois
    let waWindow: Window | null = null;
    try {
      waWindow = window.open('', '_blank');
    } catch {}

    const selectedServiceObjects = selectedServices.map((id) => {
      const srv = servicesList.find((s) => s.id === id);
      return {
        id,
        name: srv ? srv.title : id,
        price: srv ? srv.basePrice * currentCategory.multiplier : 0,
        duration_min: 60,
      };
    });

    const needsTrip = fulfillmentType !== 'patio';
    const orderPayload = {
      business_id: currentBusiness.id,
      vehicle_category: selectedCategory,
      services: selectedServiceObjects,
      fulfillment_type: fulfillmentType === 'vip' ? 'vip_mobile' : fulfillmentType,
      total_amount: grandTotal,
      customer_whatsapp: '',
      status: 'pendente',
      notes: needsTrip ? `Distância: ${distanceKm} KM` : undefined,
    };

    let protocol = getOrderProtocol(`local-${Date.now()}`);
    try {
      const res = await insertServiceOrder(orderPayload);
      if (res.data?.id) {
        protocol = getOrderProtocol(res.data.id);
      }
    } catch {}

    const fulfillmentLabel =
      fulfillmentType === 'vip'
        ? '👑 VIP (lavagem no meu endereço)'
        : fulfillmentType === 'valet'
        ? '🚙 Leva e traz (buscar e devolver o carro)'
        : '🏢 Levo o carro até o pátio';

    const servicesText = selectedServiceObjects
      .map((s) => `  • ${s.name} (R$ ${s.price.toFixed(2).replace('.', ',')})`)
      .join('\n');

    const message =
`*PEDIDO DE LAVAGEM - JATO SPLASH CAR* 🚗✨
Olá, ${currentBusiness.name}! Montei este orçamento no app:

📋 *Pedido:* #${protocol}
🚘 *Veículo:* ${currentCategory.name}
📍 *Atendimento:* ${fulfillmentLabel}
${needsTrip ? `🛣️ *Distância aproximada:* ${distanceKm} KM\n` : ''}
*SERVIÇOS:*
${servicesText}
${needsTrip ? `Taxa de deslocamento: R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n` : ''}
💰 *TOTAL ESTIMADO:* R$ ${grandTotal.toFixed(2).replace('.', ',')}

Qual o melhor dia e horário?${needsTrip ? ' Te passo o endereço por aqui.' : ''}`;

    const waLink = `https://wa.me/55${providerPhone}?text=${encodeURIComponent(message)}`;
    if (waWindow) {
      waWindow.location.href = waLink;
    } else {
      window.location.href = waLink;
    }

    showToast(`✅ Pedido #${protocol} enviado para o WhatsApp de ${currentBusiness.name}!`);
  };

  // ---------------------------------------------------------------------------
  // PÁTIO DO DONO: PEDIDOS, STATUS E RESPOSTAS RÁPIDAS
  // ---------------------------------------------------------------------------
  const loadPatioOrders = useCallback(async () => {
    if (!currentBusiness.id) {
      setPatioOrders([]);
      return;
    }
    setPatioLoading(true);
    try {
      const res = await fetchServiceOrders(currentBusiness.id);
      setPatioOrders(res.orders);
    } catch {
      setPatioOrders([]);
    }
    setPatioLoading(false);
  }, [currentBusiness.id]);

  useEffect(() => {
    if (currentMode === 'owner' && ownerSubTab === 'patio') {
      loadPatioOrders();
    }
  }, [currentMode, ownerSubTab, loadPatioOrders]);

  const handleChangeOrderStatus = async (order: ServiceOrder, status: OrderStatus) => {
    if (!order.id) return false;
    const res = await updateOrderStatus(order.id, status);
    if (!res.success) {
      showToast(`⚠️ Não foi possível atualizar o pedido: ${res.error || 'erro desconhecido'}`);
      return false;
    }
    setPatioOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status } : o)));
    return true;
  };

  // Abre o WhatsApp com a mensagem pronta. Sem o número do cliente salvo, o WhatsApp
  // abre a lista de conversas para o dono escolher a do cliente (a do pedido).
  const handleQuickReply = (order: ServiceOrder, reply: QuickReply) => {
    const text = reply.text(currentBusiness.name, getOrderProtocol(order.id));
    const phone = normalizeBrPhone(order.customer_whatsapp || '');
    const link = phone
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    try {
      window.open(link, '_blank');
    } catch {}
    handleChangeOrderStatus(order, reply.status);
    showToast(`Pedido #${getOrderProtocol(order.id)}: ${ORDER_STATUS_LABEL[reply.status]}`);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col items-center justify-start p-2 sm:p-4 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed top-4 z-50 bg-emerald-500 text-zinc-950 font-bold px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SMARTPHONE FRAME CONTAINER */}
      <div className="w-full max-w-md bg-[#111113] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative my-auto min-h-[92vh]">
        
        {/* BARRA SUPERIOR DO APLICATIVO */}
        <header className="bg-[#161619] border-b border-zinc-800 p-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
              💦
            </div>
            <div>
              <h1 className="font-extrabold text-xs tracking-wider text-white">JATO SPLASH CAR</h1>
              <p className="text-[9px] text-zinc-500">{currentBusiness.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowConfigModal(true)}
              title="Configurações Supabase"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`} />
            </button>

            {currentMode !== 'welcome' && (
              <button
                onClick={() => setCurrentMode('welcome')}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2.5 py-1.5 rounded-full border border-zinc-700/80 flex items-center space-x-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-emerald-400" />
                <span>Trocar Perfil</span>
              </button>
            )}
          </div>
        </header>

        {/* =========================================================================
            1. TELA INICIAL: REFATORAÇÃO DOS PERFIS DE ENTRADA
           ========================================================================= */}
        {currentMode === 'welcome' && (
          <div className="p-5 flex-1 flex flex-col justify-center space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-2xl">
                🧼
              </div>
              <h2 className="text-base font-bold text-white">Como deseja acessar hoje?</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Selecione seu perfil. Cada perfil possui acesso específico às ferramentas do sistema.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              
              {/* PERFIL 1: DONO DO LAVA-RÁPIDO (COM CREDENCIAIS & SAAS) */}
              <button
                onClick={() => {
                  setCurrentMode('owner');
                  if (!ownerAccount.isLoggedIn) {
                    setOwnerAuthMode('register');
                  }
                  setOwnerSubTab('credenciais');
                }}
                className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-blue-500/40 hover:border-blue-400 flex items-center space-x-3 text-left transition-all group shadow-lg shadow-blue-500/5 hover:scale-[1.01] cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-blue-400 flex items-center justify-between">
                    <span>SOU DONO DE LAVA-RÁPIDO</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                      {ownerAccount.isLoggedIn ? 'Painel Ativo' : 'Criar Conta'}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-300 mt-0.5">
                    Cadastre seu lava-rápido ou faça login. Gestão completa de pátio, preços e equipe de Valet.
                  </div>
                </div>
              </button>

              {/* PERFIL 2: FREELANCER (MÃO DE OBRA TEMPORÁRIA) */}
              <button
                onClick={() => setCurrentMode('freelancer')}
                className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500 flex items-center space-x-3 text-left transition-all group hover:scale-[1.01] cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
                    <span>SOU FREELANCER</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                      Cadastro Rápido
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Cadastro simplificado (Nome, WhatsApp e PIX) para aceitar diárias e turnos do pátio.
                  </div>
                </div>
              </button>

              {/* PERFIL 3: CLIENTE FINAL (100% ANÔNIMO) */}
              <button
                onClick={() => setCurrentMode('client')}
                className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500 flex items-center space-x-3 text-left transition-all group hover:scale-[1.01] cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                    <span>SOU CLIENTE</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      100% Anônimo
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Sem cadastro. Escolha seu veículo, calcule orçamentos e agende direto no WhatsApp.
                  </div>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* =========================================================================
            2. MODO DONO DO LAVA-RÁPIDO (COM LOGIN/CADASTRO E CREDENCIAIS)
           ========================================================================= */}
        {currentMode === 'owner' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Se o Dono não estiver autenticado, exibe a tela de Cadastro / Login */}
            {!ownerAccount.isLoggedIn ? (
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center space-y-4 overflow-y-auto animate-fadeIn max-w-md mx-auto w-full">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {ownerAuthMode === 'register' ? 'Cadastro do Lava-Rápido' : 'Login do Dono do Lava-Rápido'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {ownerAuthMode === 'register' 
                      ? 'Preencha os dados do seu estabelecimento para criar a conta e acessar o painel SaaS.' 
                      : 'Entre com seu e-mail e senha cadastrados para gerenciar seu pátio.'}
                  </p>
                </div>

                {/* SELETOR DE MODO: CRIAR CONTA (PADRÃO) vs JÁ TENHO CONTA */}
                <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setOwnerAuthMode('register')}
                    className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                      ownerAuthMode === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ✨ Criar Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerAuthMode('login')}
                    className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
                      ownerAuthMode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    🔑 Já Tenho Conta
                  </button>
                </div>

                <form onSubmit={ownerAuthMode === 'register' ? handleOwnerRegister : handleOwnerLogin} className="space-y-3 text-xs">
                  {ownerAuthMode === 'register' ? (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Nome Fantasia do Lava-Rápido:</label>
                        <div className="relative">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="Ex: Lava Jato Splash Express"
                            value={ownerAccount.fantasyName}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, fantasyName: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">E-mail Corporativo:</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="contato@lavajato.com"
                            value={ownerAccount.email || ''}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, email: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-zinc-300">
                            Senha de Acesso: <span className="text-red-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showPassword ? 'Ocultar' : 'Ver senha'}</span>
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Digite sua senha de acesso..."
                            value={ownerAccount.password || ''}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, password: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-9 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                            title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">CNPJ ou CPF:</label>
                          <input
                            type="text"
                            required
                            placeholder="00.000.000/0001-00"
                            value={ownerAccount.cnpjCpf || ''}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, cnpjCpf: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-[11px] font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-zinc-300 block mb-1">WhatsApp do Lava-Rápido:</label>
                          <input
                            type="tel"
                            required
                            placeholder="(15) 99999-8888"
                            value={ownerAccount.phone || ''}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, phone: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-[11px] focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Razão Social / Nome da Empresa:</label>
                        <input
                          type="text"
                          required
                          placeholder="Lava Rápido Express LTDA"
                          value={ownerAccount.razaoSocial || ''}
                          onChange={(e) => setOwnerAccount({ ...ownerAccount, razaoSocial: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">E-mail Corporativo:</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="gerencia@seulavarapido.com.br"
                            value={ownerAccount.email || ''}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, email: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-zinc-300">Senha de Acesso:</label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showPassword ? 'Ocultar' : 'Ver senha'}</span>
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={ownerAccount.password || ''}
                            onChange={(e) => setOwnerAccount({ ...ownerAccount, password: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-9 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {ownerAuthMode === 'register' ? '🚀 Criar Conta do Lava-Rápido & Acessar Painel' : '🔑 Acessar Painel Administrativo'}
                  </button>
                </form>
              </div>
            ) : (
              /* PAINEL DO DONO AUTENTICADO */
              <>
                {/* SUB-HEADER: NAVEGAÇÃO DE ABAS DO DONO */}
                <div className="bg-[#141417] p-2.5 border-b border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1 font-bold text-white">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      {ownerAccount.fantasyName || currentBusiness.name}
                    </span>
                    <button
                      onClick={handleOwnerLogout}
                      className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Sair do painel"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sair</span>
                    </button>
                  </div>

                  {/* 4 ABAS COM DESTAQUE PARA CREDENCIAIS & CONTA */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-[10px]">
                    <button
                      onClick={() => setOwnerSubTab('credenciais')}
                      className={`py-1.5 font-bold rounded-lg transition-all flex flex-col items-center cursor-pointer ${
                        ownerSubTab === 'credenciais'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Conta & Valet</span>
                    </button>

                    <button
                      onClick={() => setOwnerSubTab('precos')}
                      className={`py-1.5 font-bold rounded-lg transition-all flex flex-col items-center cursor-pointer ${
                        ownerSubTab === 'precos'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Preços</span>
                    </button>

                    <button
                      onClick={() => setOwnerSubTab('patio')}
                      className={`py-1.5 font-bold rounded-lg transition-all flex flex-col items-center cursor-pointer ${
                        ownerSubTab === 'patio'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Pátio</span>
                    </button>

                    <button
                      onClick={() => setOwnerSubTab('diarias')}
                      className={`py-1.5 font-bold rounded-lg transition-all flex flex-col items-center cursor-pointer ${
                        ownerSubTab === 'diarias'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Diárias</span>
                    </button>
                  </div>
                </div>

                {/* CONTEÚDO DAS ABAS DO DONO */}
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  
                  {/* ABA 1: CREDENCIAIS & CONTA CORPORATIVA DO DONO */}
                  {ownerSubTab === 'credenciais' && (
                    <div className="space-y-4">
                      
                      {/* DADOS DE AUTENTICAÇÃO E CONTA SAAS */}
                      <form onSubmit={handleSaveCredentials} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                              <ShieldCheck className="w-4 h-4 text-blue-400" />
                              Credenciais & Identificação Fiscal
                            </h3>
                            <p className="text-[10px] text-zinc-400">
                              Dados oficiais do administrador do lava-rápido.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Conta Ativa
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">E-mail Corporativo:</label>
                            <input
                              type="email"
                              required
                              value={ownerAccount.email || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, email: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-semibold text-zinc-400">Senha de Acesso:</label>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[9px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                {showPassword ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                              </button>
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={ownerAccount.password || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, password: e.target.value })}
                              placeholder="Definir nova senha..."
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">CNPJ ou CPF Fiscal:</label>
                            <input
                              type="text"
                              required
                              value={ownerAccount.cnpjCpf || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, cnpjCpf: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Nome Fantasia (Pátio):</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Lava Jato Cars"
                              value={ownerAccount.fantasyName || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, fantasyName: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-blue-500 font-bold"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Razão Social Oficial:</label>
                            <input
                              type="text"
                              required
                              value={ownerAccount.razaoSocial || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, razaoSocial: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">WhatsApp Principal do Pátio:</label>
                            <input
                              type="tel"
                              required
                              value={ownerAccount.phone || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, phone: e.target.value })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-[11px] focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Endereço Comercial:</label>
                            <input
                              type="text"
                              value={ownerAccount.address || ''}
                              onChange={(e) => setOwnerAccount({ ...ownerAccount, address: e.target.value })}
                              placeholder="Rua, Número, Bairro, Cidade"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Atualizar Credenciais Corporativas</span>
                        </button>
                      </form>

                      {/* VINCULAÇÃO DA EQUIPE DE MOTORISTAS VALET (SUBORDINADOS DIRETAMENTE AO LAVA-RÁPIDO) */}
                      <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                              <Navigation className="w-4 h-4 text-emerald-400" />
                              Equipe de Valet Subordinada ao Lava-Rápido
                            </h3>
                            <p className="text-[10px] text-zinc-400">
                              Motoristas contratados da sua frota que realizam as coletas e entregas.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowAddValetModal(true)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>+ Vincular Valet</span>
                          </button>
                        </div>

                        {/* LISTA DE MOTORISTAS VALET VINCULADOS */}
                        <div className="space-y-2">
                          {valetDrivers.map((driver) => (
                            <div
                              key={driver.id}
                              className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{driver.name}</span>
                                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                                    {driver.cnh}
                                  </span>
                                </div>
                                <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                                  <span>WhatsApp: <strong className="text-zinc-300">{driver.whatsapp}</strong></span>
                                  {driver.vehiclePlate && <span>· {driver.vehiclePlate}</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  driver.status === 'em_rota'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {driver.status === 'em_rota' ? 'Em Rota 🚙' : 'Disponível'}
                                </span>

                                <button
                                  onClick={() => handleRemoveValetDriver(driver.id)}
                                  className="text-zinc-600 hover:text-red-400 p-1"
                                  title="Desvincular motorista"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ABA 2: PREÇOS & SERVIÇOS */}
                  {ownerSubTab === 'precos' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                            <Tag className="w-4 h-4 text-emerald-400" />
                            Tabela de Preços dos Serviços
                          </h3>
                          <p className="text-[10px] text-zinc-400">
                            Ajuste os valores cobrados por cada lavagem e serviço técnico.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowAddServiceForm(!showAddServiceForm)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Novo Serviço</span>
                        </button>
                      </div>

                      {/* CADASTRO DE NOVO SERVIÇO */}
                      {showAddServiceForm && (
                        <form onSubmit={handleAddNewService} className="p-3 bg-zinc-950 border border-emerald-500/40 rounded-2xl space-y-2.5 animate-fadeIn">
                          <input
                            type="text"
                            required
                            placeholder="Nome do Serviço (ex: Vitrificação de Pintura)"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />

                          <input
                            type="text"
                            placeholder="Descrição curta do que está incluso"
                            value={newServiceDesc}
                            onChange={(e) => setNewServiceDesc(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />

                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">R$</span>
                              <input
                                type="text"
                                required
                                placeholder="Preço Base (ex: 85,00)"
                                value={newServicePrice}
                                onChange={(e) => setNewServicePrice(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                            >
                              Salvar
                            </button>
                          </div>
                        </form>
                      )}

                      {/* LISTA DE SERVIÇOS COM PREÇOS EDITÁVEIS */}
                      <div className="space-y-2">
                        {servicesList.map((srv) => (
                          <div
                            key={srv.id}
                            className={`p-3 rounded-2xl border transition-all ${
                              srv.active ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-950/40 border-zinc-900 opacity-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 flex-1">
                                <input
                                  type="text"
                                  value={srv.title}
                                  onChange={(e) => handleUpdateServiceInfo(srv.id, 'title', e.target.value)}
                                  className="w-full bg-transparent font-bold text-xs text-white border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={srv.desc}
                                  onChange={(e) => handleUpdateServiceInfo(srv.id, 'desc', e.target.value)}
                                  className="w-full bg-transparent text-[10px] text-zinc-400 border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-1">
                                  <span className="text-[10px] font-bold text-emerald-400 mr-1">R$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={srv.basePrice}
                                    onChange={(e) => handleUpdatePrice(srv.id, parseFloat(e.target.value))}
                                    className="w-16 bg-transparent text-xs font-mono font-bold text-emerald-400 focus:outline-none text-right"
                                  />
                                </div>

                                <button
                                  onClick={() => handleDeleteService(srv.id)}
                                  className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Remover serviço"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* MULTIPLICADORES POR CATEGORIA */}
                      <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200">Multiplicadores por Tipo de Veículo</span>
                            <button
                              type="button"
                              onClick={() => setShowMultiplierHelpModal(true)}
                              className="w-5 h-5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center justify-center transition-all cursor-pointer group shadow-sm shadow-emerald-500/20"
                              title="Clique para entender o que são os multiplicadores"
                              aria-label="Como funcionam os multiplicadores?"
                            >
                              <HelpCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMultiplierHelpModal(true)}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                          >
                            <span>O que é isso?</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400">
                          <span>Fator de cálculo automático sobre o preço base.</span>
                          <button
                            type="button"
                            onClick={() => setShowMultiplierHelpModal(true)}
                            className="text-emerald-400 hover:underline font-bold text-[10px] cursor-pointer ml-1"
                          >
                            Ver exemplos (?)
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {categories.map((cat) => (
                            <div key={cat.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-zinc-700 transition">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-medium text-zinc-200">{cat.name}:</span>
                                <span className="text-[9px] text-zinc-500">{cat.desc}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="1"
                                  max="4"
                                  value={cat.multiplier}
                                  onChange={(e) => handleUpdateMultiplier(cat.id, parseFloat(e.target.value))}
                                  className="w-12 bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded px-1 text-center font-mono font-bold text-emerald-400 text-xs focus:outline-none"
                                />
                                <span className="text-[10px] text-zinc-500 font-bold">x</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          localStorage.setItem(LOCAL_STORAGE_SERVICES, JSON.stringify(servicesList));
                          showToast('💾 Tabela de preços atualizada com sucesso!');
                        }}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar Tabela de Preços</span>
                      </button>
                    </div>
                  )}

                  {/* ABA 3: PÁTIO E FILA */}
                  {ownerSubTab === 'patio' && (
                    <div className="space-y-4">
                      
                      {/* CHAVEAMENTO VIP MÓVEL */}
                      <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span>Unidade Móvel VIP</span>
                          </div>
                          <div className="text-[10px] text-zinc-400">Receber chamados para lavagem a domicílio</div>
                        </div>

                        <button
                          type="button"
                          onClick={toggleVipCapacity}
                          className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                            currentBusiness.hasVip ? 'bg-amber-500 justify-end' : 'bg-zinc-700 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-300">Pedidos dos Clientes</span>
                        <button
                          type="button"
                          onClick={loadPatioOrders}
                          className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${patioLoading ? 'animate-spin' : ''}`} />
                          Atualizar
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 -mt-2">
                        Toque numa resposta rápida: o WhatsApp abre com a mensagem pronta para o cliente e o pedido muda de etapa.
                      </p>

                      {(() => {
                        const active = patioOrders.filter(o => o.status !== 'concluido' && o.status !== 'cancelado');
                        const done = patioOrders.filter(o => o.status === 'concluido');
                        const renderOrder = (order: ServiceOrder) => {
                          const status = (order.status || 'pendente') as OrderStatus;
                          const services = Array.isArray(order.services) ? order.services.map(s => s.name).join(', ') : '';
                          const replies = QUICK_REPLIES.filter(r => !r.onlyFor || r.onlyFor.includes(order.fulfillment_type));
                          const created = order.created_at ? new Date(order.created_at) : null;
                          return (
                            <div key={order.id} className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl space-y-2 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-bold text-white">
                                    Pedido #{getOrderProtocol(order.id)}
                                    {order.customer_name ? ` • ${order.customer_name}` : ''}
                                  </div>
                                  <div className="text-[10px] text-zinc-400">
                                    {FULFILLMENT_LABEL[order.fulfillment_type] || order.fulfillment_type}
                                    {created ? ` • ${created.toLocaleDateString('pt-BR')} ${created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                                  </div>
                                </div>
                                <span className={`text-[10px] border px-2 py-1 rounded-lg font-bold shrink-0 ${ORDER_STATUS_STYLE[status]}`}>
                                  {ORDER_STATUS_LABEL[status]}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400 space-y-0.5">
                                {services && <div>🧽 {services}</div>}
                                {order.notes && <div>🛣️ {order.notes}</div>}
                                <div>💰 R$ {Number(order.total_amount || 0).toFixed(2).replace('.', ',')}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {replies.map(reply => (
                                  <button
                                    key={reply.id}
                                    type="button"
                                    onClick={() => handleQuickReply(order, reply)}
                                    className={`text-left px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border ${
                                      reply.status === 'concluido'
                                        ? 'bg-emerald-500 text-zinc-950 border-emerald-500 hover:bg-emerald-400'
                                        : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                                    }`}
                                  >
                                    {reply.label}
                                  </button>
                                ))}
                              </div>
                              {(status === 'pendente' || status === 'confirmado') && (
                                <button
                                  type="button"
                                  onClick={() => handleChangeOrderStatus(order, 'cancelado')}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                >
                                  Cancelar pedido
                                </button>
                              )}
                            </div>
                          );
                        };
                        return (
                          <div className="space-y-2">
                            {active.length === 0 && (
                              <div className="text-[11px] text-zinc-500 text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
                                Nenhum pedido em aberto. Os pedidos feitos no app aparecem aqui.
                              </div>
                            )}
                            {active.map(renderOrder)}
                            {done.length > 0 && (
                              <>
                                <div className="text-[10px] font-bold text-zinc-500 pt-2">Prontos ({done.length})</div>
                                {done.slice(0, 10).map(renderOrder)}
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ABA 4: DIÁRIAS & FREELANCERS */}
                  {ownerSubTab === 'diarias' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-300">Vagas Publicadas para Freelancers</span>
                        <button
                          onClick={() => setShowNewJobModal(true)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nova Diária</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {jobOffers.map((job) => (
                          <div key={job.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-white block">{job.role}</span>
                              <span className="text-[10px] text-zinc-400">{job.date} · {job.place}</span>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold">{job.pay}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}

          </div>
        )}

        {/* =========================================================================
            3. MODO FREELANCER (CADASTRO SIMPLIFICADO & MURAL)
           ========================================================================= */}
        {currentMode === 'freelancer' && (
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            
            {/* CARD DE CADASTRO SIMPLIFICADO DO FREELANCER */}
            <div className="p-3.5 bg-zinc-950 border border-purple-500/30 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  Cadastro Simplificado do Freelancer
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verificado Ibiúna
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-zinc-500 text-[9px] block">Nome:</label>
                  <input
                    type="text"
                    value={freelancerProfile.name}
                    onChange={(e) => setFreelancerProfile({ ...freelancerProfile, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 text-[9px] block">WhatsApp:</label>
                  <input
                    type="text"
                    value={freelancerProfile.whatsapp}
                    onChange={(e) => setFreelancerProfile({ ...freelancerProfile, whatsapp: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 text-[9px] block">Chave PIX:</label>
                  <input
                    type="text"
                    value={freelancerProfile.pixKey}
                    onChange={(e) => setFreelancerProfile({ ...freelancerProfile, pixKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 text-[9px] block">Especialidade:</label>
                  <input
                    type="text"
                    value={freelancerProfile.specialty}
                    onChange={(e) => setFreelancerProfile({ ...freelancerProfile, specialty: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(LOCAL_STORAGE_FREELANCER, JSON.stringify(freelancerProfile));
                  showToast('Cadastro de freelancer atualizado!');
                }}
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
              >
                Salvar Meu Perfil de Freelancer
              </button>
            </div>

            {/* MURAL DE OFERTAS */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">Mural de Diárias Disponíveis</span>
              {jobOffers.length === 0 ? (
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto text-lg">
                    📅
                  </div>
                  <p className="text-xs font-medium text-zinc-300">Nenhum chamado de diária aberto no momento</p>
                  <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
                    Os donos de lava-rápido publicam turnos reais de reforço diretamente no painel administrativo quando precisam de equipe.
                  </p>
                </div>
              ) : (
                jobOffers.map((job) => (
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
                        onClick={() => {
                          setJobOffers(jobOffers.map(j => j.id === job.id ? { ...j, status: 'Turno Aceito ✔️' } : j));
                          showToast(`🎉 Turno aceito! O dono do ${job.place} foi notificado.`);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition-all mt-1 cursor-pointer"
                      >
                        Aceitar Este Turno
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            4. MODO CLIENTE FINAL (100% ANÔNIMO - APENAS LAVA-RÁPIDOS REAIS)
           ========================================================================= */}
        {currentMode === 'client' && (
          <div className="flex-1 flex flex-col overflow-hidden pb-28">
            {businessKeys.length === 0 ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4 animate-fadeIn my-auto">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/10">
                  🏢
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-sm font-bold text-white">Nenhum Lava-Rápido Cadastrado</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Apenas estabelecimentos reais aparecem aqui. Acesse o perfil de dono para cadastrar seu lava-rápido com nome, telefone e preços reais.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentMode('owner');
                    setOwnerAuthMode('register');
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Cadastrar Meu Lava-Rápido</span>
                </button>
              </div>
            ) : (
              <>
                {/* TOP BAR DE ESTABELECIMENTO */}
                <div className="bg-zinc-950 p-3 border-b border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Estabelecimento:</span>
                    <select 
                      value={selectedBusinessId} 
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer max-w-[210px] truncate"
                    >
                      {Object.entries(businesses).map(([id, b]) => (
                        <option key={id} value={id}>
                          {b.name} {b.hasVip ? '(Com VIP 👑)' : '(Sem VIP)'}
                        </option>
                      ))}
                    </select>
                  </div>

              {/* Fila em Tempo Real */}
              <div className="flex items-center justify-between bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 text-xs">
                <div className="flex items-center space-x-1.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fila do Pátio:</span>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentBusiness.statusColor}`}>
                  {currentBusiness.status} ({currentBusiness.activeCars.length} carros • {currentBusiness.estimatedWait})
                </div>
              </div>
            </div>

            {/* CORPO DO CLIENTE */}
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
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
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

              {/* 2. ESCOLHA OS SERVIÇOS (COM PREÇOS DO PRESTADOR) */}
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
                  {activeServicesList.map((srv) => {
                    const isChecked = selectedServices.includes(srv.id);
                    const calculatedPrice = srv.basePrice * currentCategory.multiplier;

                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleClientService(srv.id)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'border-emerald-500/60 bg-zinc-900 text-white'
                            : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-bold text-white">{srv.title}</div>
                          <div className="text-[10px] text-zinc-500">{srv.desc}</div>
                          <div className="text-xs font-bold text-emerald-400 font-mono">
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

              {/* 3. MODALIDADE DE ATENDIMENTO (COM VALET VINCULADO À EQUIPE) */}
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
                        <div className="text-[10px] text-zinc-500">{currentBusiness.address}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Grátis
                    </span>
                  </div>

                  {/* Valet Leva e Traz (Equipe do Lava-Rápido) */}
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
                        <div className="text-[10px] text-zinc-500">
                          Coletado pela equipe oficial de motoristas ({distanceKm} km)
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      R$ {(currentBusiness.valetBaseFee + distanceKm * currentBusiness.valetPerKm).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* OS VIP (Lavagem no Local) */}
                  <div
                    onClick={() => {
                      if (currentBusiness.hasVip) {
                        setFulfillmentType('vip');
                      } else {
                        showToast(`⚠️ ${currentBusiness.name} não possui Unidade Móvel VIP ativa. Escolha Pátio ou Valet.`);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !currentBusiness.hasVip
                        ? 'border-zinc-800/60 bg-zinc-950/20 opacity-50 cursor-not-allowed'
                        : fulfillmentType === 'vip'
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50 cursor-pointer'
                          : 'border-amber-500/30 bg-zinc-900/60 text-zinc-300 hover:border-amber-500 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Crown className={`w-4 h-4 ${currentBusiness.hasVip ? 'text-amber-400' : 'text-zinc-600'}`} />
                        <div>
                          <div className="text-xs font-bold text-amber-300">👑 OS VIP (Lavagem no Seu Local)</div>
                          <div className="text-[9px] text-zinc-400">
                            {currentBusiness.hasVip
                              ? 'Van móvel com água e gerador próprio vai até sua chácara/sítio'
                              : '⚠️ Indisponível neste estabelecimento (Escolha Pátio ou Valet)'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono ${currentBusiness.hasVip ? 'text-amber-400' : 'text-zinc-600'}`}>
                        {currentBusiness.hasVip ? `R$ ${(currentBusiness.vipBaseFee + distanceKm * currentBusiness.vipPerKm).toFixed(2).replace('.', ',')}` : 'Bloqueado'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* SLIDER DE DISTÂNCIA KM */}
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

            {/* BARRA FIXA DE RESUMO DO CLIENTE */}
            <div className="p-4 bg-[#161619] border-t border-zinc-800 absolute bottom-0 left-0 right-0 space-y-2 z-30">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-zinc-400 block">Total Estimado da OS:</span>
                  <span className="text-[10px] text-zinc-500">Enviar para: {currentBusiness.name}</span>
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  R$ {grandTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                onClick={handleFinishWhatsApp}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>CONFIRMAR AGENDAMENTO NO WHATSAPP</span>
              </button>
            </div>
              </>
            )}

          </div>
        )}

      </div>

      {/* =========================================================================
          MODAIS AUXILIARES
         ========================================================================= */}
      
      {/* Modal Vincular Novo Motorista Valet (Dono) */}
      {showAddValetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161619] border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl relative text-left">
            <button onClick={() => setShowAddValetModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Vincular Motorista de Valet à Frota</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              O motorista será adicionado à equipe oficial deste lava-rápido para atender as ordens de Valet Leva & Traz.
            </p>

            <form onSubmit={handleAddValetDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Nome Completo do Motorista:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nome do Motorista"
                  value={newValetName}
                  onChange={(e) => setNewValetName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Número da CNH / Categoria:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 05489218201 (Cat. B)"
                  value={newValetCnh}
                  onChange={(e) => setNewValetCnh(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">WhatsApp para Contato / Rota:</label>
                <input
                  type="text"
                  placeholder="(15) 99999-9999"
                  value={newValetPhone}
                  onChange={(e) => setNewValetPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Cadastrar na Equipe Valet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Publicar Diária (Dono) */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161619] border border-zinc-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowNewJobModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
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
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Publicar no Mural
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Explicativo: O que são os Multiplicadores? (Dono do Lava-Rápido) */}
      {showMultiplierHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141416] border border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            {/* Botão Fechar */}
            <button
              onClick={() => setShowMultiplierHelpModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 p-1.5 rounded-full cursor-pointer transition"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md shadow-emerald-500/10">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  O que são os Multiplicadores?
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Como funciona o cálculo automático por porte do veículo
                </p>
              </div>
            </div>

            {/* Explicação Principal */}
            <div className="space-y-2.5 text-xs text-zinc-300 bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80 leading-relaxed">
              <p>
                <strong className="text-emerald-400">💡 Economize tempo no cadastro:</strong> Você não precisa criar uma tabela de preços separada para cada tipo de veículo!
              </p>
              <p>
                Você cadastra apenas o <strong className="text-white">Preço Base</strong> do serviço (referente a um carro de passeio comum como Sedan ou Hatch, cujo multiplicador padrão é <strong className="text-emerald-400">1.0x</strong>).
              </p>
              <p>
                Quando o cliente seleciona um veículo maior no aplicativo, o sistema multiplica automaticamente o preço base de cada serviço pelo fator correspondente:
              </p>
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-[11px] text-emerald-400 text-center font-bold">
                Preço Final = Preço Base do Serviço × Multiplicador
              </div>
            </div>

            {/* Exemplos Práticos */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Exemplo com uma Lavagem Base de R$ 50,00:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block text-[11px]">🚗 Sedan / Hatch (1.0x)</span>
                    <span className="text-[10px] text-zinc-500">R$ 50,00 × 1.0 (Base)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">R$ 50,00</span>
                </div>

                <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block text-[11px]">🛻 SUV / Pickup (1.3x)</span>
                    <span className="text-[10px] text-zinc-500">+30% de área (R$ 50 × 1.3)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">R$ 65,00</span>
                </div>

                <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block text-[11px]">🚜 Trator / Máquina (2.2x)</span>
                    <span className="text-[10px] text-zinc-500">+120% lama/tempo (R$ 50 × 2.2)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">R$ 110,00</span>
                </div>

                <div className="p-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block text-[11px]">🚤 Barco / Náutico (2.5x)</span>
                    <span className="text-[10px] text-zinc-500">+150% gelcoat (R$ 50 × 2.5)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">R$ 125,00</span>
                </div>
              </div>
            </div>

            {/* Dica para o Dono */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl text-[11px] text-blue-300 leading-relaxed">
              <strong>✨ Você tem controle total:</strong> Edite os números dos multiplicadores livremente (ex: se quiser cobrar 1.4x para SUVs ou 2.0x para maquinários). Ao salvar, os clientes verão instantaneamente os novos valores orçados.
            </div>

            {/* Botão de Fechar */}
            <button
              onClick={() => setShowMultiplierHelpModal(false)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Entendi! Fechar e Voltar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Configuração do Supabase */}
      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onCredentialsUpdated={syncSupabase}
        isLive={isSupabaseLive}
      />

    </div>
  );
}
