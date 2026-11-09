export type AppProfile = 'splash' | 'cliente' | 'dono' | 'freelancer';

export type VehicleCategory = 'sedan' | 'suv' | 'trator' | 'barco' | 'hatch' | 'picape' | string;

export type FulfillmentType = 'patio' | 'valet' | 'vip_mobile';

export type OrderStatus = 'pendente' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface FreelanceShift {
  id: string;
  business_id: string;
  business_name: string;
  role: 'valet' | 'lavador' | 'polidor';
  title: string;
  date: string;
  shift_time: string;
  pay_rate: number;
  location: string;
  status: 'aberta' | 'candidatado' | 'preenchida';
  requirements: string[];
}

export interface ValetDriver {
  id: string;
  name: string;
  cnh: string;
  whatsapp: string;
  status: 'ativo' | 'em_rota' | 'folga';
  vehiclePlate?: string;
}

export interface OwnerAccount {
  email: string;
  password?: string;
  businessId?: string;
  cnpjCpf: string;
  razaoSocial: string;
  fantasyName: string;
  phone: string;
  address: string;
  pixKey: string;
  isLoggedIn: boolean;
}

export interface FreelancerProfile {
  name: string;
  whatsapp: string;
  pixKey: string;
  localKey: string;
  specialty: string;
  isRegistered: boolean;
}


export interface Business {
  id: string;
  name: string;
  has_mobile_vip_unit: boolean;
  address?: string;
  phone?: string;
  created_at?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  popular?: boolean;
  // Prices per category
  prices: Record<VehicleCategory, number>;
}

export interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration_min: number;
  description?: string;
}

export interface ServiceOrder {
  id?: string;
  business_id: string;
  vehicle_category: VehicleCategory;
  services: SelectedService[];
  fulfillment_type: FulfillmentType;
  total_amount: number;
  customer_whatsapp: string;
  status: OrderStatus;
  created_at?: string;
  // Extra client-side context stored in services or extra metadata
  customer_name?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  address?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  notes?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
