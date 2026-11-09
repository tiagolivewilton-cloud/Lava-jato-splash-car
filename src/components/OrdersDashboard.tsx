import React, { useState } from 'react';
import { 
  Clock, 
  Car, 
  MessageCircle, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  Key, 
  MapPin, 
  Phone,
  Calendar,
  Search
} from 'lucide-react';
import { OrderStatus, ServiceOrder } from '../types';

interface OrdersDashboardProps {
  orders: ServiceOrder[];
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  isLive: boolean;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  pendente: {
    label: 'Pendente',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-800/60',
  },
  confirmado: {
    label: 'Confirmado',
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-800/60',
  },
  em_andamento: {
    label: 'Em Lavagem',
    bg: 'bg-purple-950/40',
    text: 'text-purple-400',
    border: 'border-purple-800/60',
  },
  concluido: {
    label: 'Concluído',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-800/60',
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    border: 'border-red-800/60',
  },
};

export const OrdersDashboard: React.FC<OrdersDashboardProps> = ({
  orders,
  isLoading,
  onRefresh,
  onUpdateStatus,
  isLive,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      (order.customer_whatsapp && order.customer_whatsapp.includes(searchTerm)) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.vehicle_plate && order.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const getFulfillmentBadge = (type: string) => {
    switch (type) {
      case 'vip_mobile':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
            <Crown className="w-3 h-3 text-cyan-300" /> OS VIP (No Local)
          </span>
        );
      case 'valet':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
            <Key className="w-3 h-3 text-amber-300" /> Valet Leva & Traz
          </span>
        );
      case 'patio':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
            <Car className="w-3 h-3 text-slate-400" /> Pátio
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Painel de Ordens de Serviço (OS)
            </h2>
            {isLive ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                <AlertCircle className="w-3 h-3" /> Armazenamento Local
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento em tempo real das ordens gravadas na tabela <code>service_orders</code>.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Atualizar Ordens</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todas as OS' },
            { id: 'pendente', label: 'Pendentes' },
            { id: 'confirmado', label: 'Confirmadas' },
            { id: 'em_andamento', label: 'Em Andamento' },
            { id: 'concluido', label: 'Concluídas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, fone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Nenhuma Ordem Encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filterStatus !== 'all' || searchTerm
              ? 'Tente ajustar os filtros ou o termo de busca.'
              : 'Faça um agendamento na aba "Novo Agendamento" para gerar sua primeira ordem de serviço!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pendente;
            const cleanPhone = order.customer_whatsapp.replace(/\D/g, '');
            const protocol = order.id
              ? order.id.startsWith('local-')
                ? order.id.slice(6, 14).toUpperCase()
                : order.id.slice(0, 8).toUpperCase()
              : 'OS-000';

            return (
              <div
                key={order.id || Math.random()}
                className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
                      #{protocol}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {order.customer_name || 'Cliente Sem Nome'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Veículo: <span className="text-slate-200 capitalize">{order.vehicle_category}</span>
                        {order.vehicle_model && ` · ${order.vehicle_model}`}
                        {order.vehicle_plate && ` (${order.vehicle_plate})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getFulfillmentBadge(order.fulfillment_type)}

                    {/* Status badge with change selector */}
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => order.id && handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                      >
                        <option value="pendente" className="bg-slate-950 text-amber-400">Pendente</option>
                        <option value="confirmado" className="bg-slate-950 text-blue-400">Confirmado</option>
                        <option value="em_andamento" className="bg-slate-950 text-purple-400">Em Lavagem</option>
                        <option value="concluido" className="bg-slate-950 text-emerald-400">Concluído</option>
                        <option value="cancelado" className="bg-slate-950 text-red-400">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Services list */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-wrap gap-2 text-xs">
                  {order.services && Array.isArray(order.services) && order.services.length > 0 ? (
                    order.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px]"
                      >
                        {s.name} <strong className="text-cyan-400">R$ {Number(s.price).toFixed(2).replace('.', ',')}</strong>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">Nenhum serviço listado</span>
                  )}
                </div>

                {/* Footer details: contact, address, total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`https://wa.me/55${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {order.customer_whatsapp}
                      <MessageCircle className="w-3 h-3 ml-0.5" />
                    </a>

                    {order.address && (
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {order.address}
                      </span>
                    )}

                    {order.created_at && (
                      <span className="text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 mr-2">Total:</span>
                    <strong className="text-base font-extrabold text-white">
                      R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
