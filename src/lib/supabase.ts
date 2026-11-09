import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Business, ServiceOrder } from '../types';
import { INITIAL_BUSINESSES } from '../data/mockData';

const STORAGE_KEY_URL = 'jato_splash_supabase_url';
const STORAGE_KEY_KEY = 'jato_splash_supabase_anon_key';
const LOCAL_ORDERS_KEY = 'jato_splash_local_service_orders';

// Default prompt placeholder values
export const DEFAULT_PLACEHOLDER_URL = 'COLE_SUA_URL_AQUI';
export const DEFAULT_PLACEHOLDER_KEY = 'COLE_SUA_CHAVE_ANON_AQUI';

export function getSupabaseCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  if (localUrl && localKey) {
    return { url: localUrl.trim(), anonKey: localKey.trim(), isCustom: true };
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url: envUrl || DEFAULT_PLACEHOLDER_URL,
    anonKey: envKey || DEFAULT_PLACEHOLDER_KEY,
    isCustom: false,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (!url || url === DEFAULT_PLACEHOLDER_URL) {
    localStorage.removeItem(STORAGE_KEY_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  }

  if (!anonKey || anonKey === DEFAULT_PLACEHOLDER_KEY) {
    localStorage.removeItem(STORAGE_KEY_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
}

export function isValidSupabaseUrl(url: string): boolean {
  if (!url || url === DEFAULT_PLACEHOLDER_URL) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!isValidSupabaseUrl(url) || !anonKey || anonKey === DEFAULT_PLACEHOLDER_KEY) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
}

// Local mock storage helpers
function getLocalOrders(): ServiceOrder[] {
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: ServiceOrder): ServiceOrder {
  const current = getLocalOrders();
  const newOrder: ServiceOrder = {
    ...order,
    id: order.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };
  const updated = [newOrder, ...current];
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  return newOrder;
}

// -------------------------------------------------------------
// Database Operations (with graceful fallback to mock/local)
// -------------------------------------------------------------

export async function fetchBusinesses(): Promise<{
  businesses: Business[];
  isLive: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      businesses: INITIAL_BUSINESSES,
      isLive: false,
    };
  }

  try {
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .order('name');

    if (error) {
      console.warn('Erro ao consultar tabela businesses no Supabase:', error.message);
      return {
        businesses: INITIAL_BUSINESSES,
        isLive: false,
        error: error.message,
      };
    }

    if (!data || data.length === 0) {
      // Table exists but is empty; auto-seed or show initial
      return {
        businesses: INITIAL_BUSINESSES,
        isLive: true,
      };
    }

    return {
      businesses: data as Business[],
      isLive: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha na conexão com Supabase';
    return {
      businesses: INITIAL_BUSINESSES,
      isLive: false,
      error: message,
    };
  }
}

export async function fetchBusinessById(id: string): Promise<{
  business: Business | null;
  isLive: boolean;
}> {
  const client = getSupabaseClient();

  if (!client) {
    const found = INITIAL_BUSINESSES.find((b) => b.id === id) || null;
    return { business: found, isLive: false };
  }

  try {
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      const fallback = INITIAL_BUSINESSES.find((b) => b.id === id) || null;
      return { business: fallback, isLive: false };
    }

    return { business: data as Business, isLive: true };
  } catch {
    const fallback = INITIAL_BUSINESSES.find((b) => b.id === id) || null;
    return { business: fallback, isLive: false };
  }
}

export async function insertServiceOrder(orderData: {
  business_id: string;
  vehicle_category: string;
  services: unknown;
  fulfillment_type: string;
  total_amount: number;
  customer_whatsapp: string;
  status: string;
  customer_name?: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  address?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  notes?: string;
}): Promise<{
  data: ServiceOrder | null;
  isLive: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    const localOrder = saveLocalOrder(orderData as ServiceOrder);
    return {
      data: localOrder,
      isLive: false,
    };
  }

  try {
    // Exact requested columns for table service_orders
    const payload = {
      business_id: orderData.business_id,
      vehicle_category: orderData.vehicle_category,
      services: orderData.services,
      fulfillment_type: orderData.fulfillment_type,
      total_amount: orderData.total_amount,
      customer_whatsapp: orderData.customer_whatsapp,
      status: orderData.status || 'pendente',
      // Optional extra fields if table columns exist
      customer_name: orderData.customer_name,
      vehicle_plate: orderData.vehicle_plate,
      vehicle_model: orderData.vehicle_model,
      address: orderData.address,
      scheduled_date: orderData.scheduled_date,
      scheduled_time: orderData.scheduled_time,
      notes: orderData.notes,
    };

    const { data, error } = await client
      .from('service_orders')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Erro ao gravar no Supabase, armazenando localmente:', error.message);
      // Fallback save to ensure user's order is never lost
      const localOrder = saveLocalOrder(orderData as ServiceOrder);
      return {
        data: localOrder,
        isLive: false,
        error: error.message,
      };
    }

    return {
      data: data as ServiceOrder,
      isLive: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar no banco';
    const localOrder = saveLocalOrder(orderData as ServiceOrder);
    return {
      data: localOrder,
      isLive: false,
      error: msg,
    };
  }
}

export async function fetchServiceOrders(businessId?: string): Promise<{
  orders: ServiceOrder[];
  isLive: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();

  if (!client) {
    const localOrders = getLocalOrders();
    const filtered = businessId
      ? localOrders.filter((o) => o.business_id === businessId)
      : localOrders;
    return { orders: filtered, isLive: false };
  }

  try {
    let query = client.from('service_orders').select('*').order('created_at', { ascending: false });
    if (businessId) {
      query = query.eq('business_id', businessId);
    }
    const { data, error } = await query;

    if (error) {
      const localOrders = getLocalOrders();
      return { orders: localOrders, isLive: false, error: error.message };
    }

    return { orders: (data as ServiceOrder[]) || [], isLive: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro de consulta';
    const localOrders = getLocalOrders();
    return { orders: localOrders, isLive: false, error: msg };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!client || orderId.startsWith('local-')) {
    const localOrders = getLocalOrders();
    const updated = localOrders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus as ServiceOrder['status'] } : o
    );
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    return { success: true };
  }

  try {
    const { error } = await client
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar' };
  }
}

export async function updateBusinessVipUnit(
  businessId: string,
  hasMobileVipUnit: boolean
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client
      .from('businesses')
      .update({ has_mobile_vip_unit: hasMobileVipUnit })
      .eq('id', businessId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar unidade VIP' };
  }
}

export async function seedBusinessesToSupabase(): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Configure a URL e Anon Key do Supabase primeiro.' };
  }
  if (INITIAL_BUSINESSES.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await client
      .from('businesses')
      .upsert(INITIAL_BUSINESSES, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao popular dados' };
  }
}


