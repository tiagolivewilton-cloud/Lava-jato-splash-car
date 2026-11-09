import { Business, ServiceItem, VehicleCategory } from '../types';

export const VEHICLE_CATEGORIES: Array<{
  id: VehicleCategory;
  name: string;
  example: string;
  icon: string;
}> = [
  { id: 'hatch', name: 'Hatch', example: 'ex: Onix, Gol, Polo, HB20', icon: '🚗' },
  { id: 'sedan', name: 'Sedan', example: 'ex: Corolla, Civic, Cruze, Virtus', icon: '🚘' },
  { id: 'suv', name: 'SUV / Crossover', example: 'ex: Compass, T-Cross, Renegade, Creta', icon: '🚙' },
  { id: 'picape', name: 'Picape / Camionete', example: 'ex: Hilux, Ranger, Toro, S10', icon: '🛻' },
  { id: 'moto', name: 'Motocicleta', example: 'ex: Honda CG, Yamaha MT, BMW GS', icon: '🏍️' },
  { id: 'van', name: 'Van / Utilitário', example: 'ex: Ducato, Sprinter, Fiorino', icon: '🚐' },
];

export const AVAILABLE_SERVICES: ServiceItem[] = [
  {
    id: 'lavagem_simples',
    name: 'Ducha Express Splash',
    description: 'Enxágue de alta pressão, shampoo biodegradável com cera de secagem rápida e pretinho nos pneus.',
    duration_min: 35,
    popular: false,
    prices: {
      moto: 35,
      hatch: 45,
      sedan: 55,
      suv: 65,
      picape: 75,
      van: 90,
    },
  },
  {
    id: 'lavagem_completa_carnauba',
    name: 'Lavagem Completa + Cera de Carnaúba',
    description: 'Limpeza minuciosa externa, aspiração interna profunda, limpeza de painel, cantos de portas e acabamento premium com cera de carnaúba.',
    duration_min: 60,
    popular: true,
    prices: {
      moto: 55,
      hatch: 75,
      sedan: 85,
      suv: 100,
      picape: 120,
      van: 150,
    },
  },
  {
    id: 'higienizacao_interna',
    name: 'Higienização Interna Detalhada',
    description: 'Lavagem técnica a seco dos bancos (tecido ou couro com hidratação), teto, carpetes, portas e remoção de manchas e odores.',
    duration_min: 120,
    popular: true,
    prices: {
      moto: 80,
      hatch: 160,
      sedan: 190,
      suv: 230,
      picape: 260,
      van: 320,
    },
  },
  {
    id: 'oxi_sanitizacao',
    name: 'Oxi-Sanitização com Gerador de Ozônio',
    description: 'Eliminação de ácaros, fungos, bactérias e odores de cigarro/animais no sistema de ar-condicionado e cabine.',
    duration_min: 30,
    popular: false,
    prices: {
      moto: 40,
      hatch: 70,
      sedan: 70,
      suv: 80,
      picape: 80,
      van: 100,
    },
  },
  {
    id: 'descontaminacao_selante',
    name: 'Descontaminação de Pintura + Selante Sintético',
    description: 'Remoção de contaminações ásperas da pintura (Clay Bar) e aplicação de selante de alto brilho e repelência (duração até 6 meses).',
    duration_min: 90,
    popular: false,
    prices: {
      moto: 90,
      hatch: 180,
      sedan: 210,
      suv: 250,
      picape: 290,
      van: 350,
    },
  },
  {
    id: 'cristalizacao_vidros',
    name: 'Cristalização de Vidros (Anti-Chuva)',
    description: 'Aplicação de película repelente nos vidros e para-brisas para máxima visibilidade e segurança em dias chuvosos.',
    duration_min: 40,
    popular: false,
    prices: {
      moto: 30,
      hatch: 60,
      sedan: 60,
      suv: 75,
      picape: 75,
      van: 90,
    },
  },
  {
    id: 'polimento_farois',
    name: 'Revitalização e Polimento de Faróis',
    description: 'Lixamento técnico e polimento para remoção do amarelado e opacidade, finalizado com proteção UV.',
    duration_min: 45,
    popular: false,
    prices: {
      moto: 45,
      hatch: 80,
      sedan: 80,
      suv: 90,
      picape: 90,
      van: 90,
    },
  },
];

export const INITIAL_BUSINESSES: Business[] = [];

export const SUPABASE_SQL_SETUP = `-- ==========================================================
-- JATO SPLASH CAR - ESTRUTURA DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- ==========================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de estabelecimentos (businesses)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    has_mobile_vip_unit BOOLEAN NOT NULL DEFAULT true,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de ordens de serviço (service_orders)
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    vehicle_category TEXT NOT NULL,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('patio', 'valet', 'vip_mobile')),
    total_amount NUMERIC(10,2) NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    customer_name TEXT,
    vehicle_plate TEXT,
    vehicle_model TEXT,
    address TEXT,
    scheduled_date TEXT,
    scheduled_time TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Habilitar Row Level Security (RLS) e Políticas Públicas de Acesso
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública dos estabelecimentos
CREATE POLICY "Permitir leitura de estabelecimentos"
ON public.businesses FOR SELECT
USING (true);

-- Permitir inserção pública de ordens de serviço (agendamento de clientes)
CREATE POLICY "Permitir cadastro de ordens de servico"
ON public.service_orders FOR INSERT
WITH CHECK (true);

-- Permitir leitura pública de ordens de serviço
CREATE POLICY "Permitir leitura de ordens de servico"
ON public.service_orders FOR SELECT
USING (true);

-- Permitir atualização de status de ordens de serviço
CREATE POLICY "Permitir atualizacao de ordens de servico"
ON public.service_orders FOR UPDATE
USING (true);
`;
