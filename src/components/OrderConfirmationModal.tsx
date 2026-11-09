import React from 'react';
import { CheckCircle2, MessageCircle, ExternalLink, Calendar, Car, ArrowRight, X } from 'lucide-react';
import { ServiceOrder } from '../types';

interface OrderConfirmationModalProps {
  order: ServiceOrder | null;
  whatsappUrl: string;
  onClose: () => void;
  onViewDashboard: () => void;
  isLive: boolean;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  whatsappUrl,
  onClose,
  onViewDashboard,
  isLive,
}) => {
  if (!order) return null;

  const protocol = order.id ? (order.id.startsWith('local-') ? order.id.slice(6, 14).toUpperCase() : order.id.slice(0, 8).toUpperCase()) : 'OS-JATO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden text-left space-y-5">
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Sucesso · Ordem Gravada
              </span>
              <h3 className="text-xl font-bold text-white">
                Agendamento Confirmado!
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protocol box */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Protocolo da OS:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm tracking-wider">
              #{protocol}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Banco de Dados:</span>
            <span className="text-slate-300 font-medium">
              {isLive ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  ✓ Gravado no Supabase (tabela: <code>service_orders</code>)
                </span>
              ) : (
                <span className="text-amber-300">
                  Salvo localmente (Demonstração)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Total a Pagar:</span>
            <span className="text-base font-extrabold text-white">
              R$ {order.total_amount.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Details preview */}
        <div className="space-y-1.5 text-xs text-slate-300 bg-slate-850/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span>Categoria: <strong className="text-white capitalize">{order.vehicle_category}</strong></span>
            {order.vehicle_model && <span>({order.vehicle_model})</span>}
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modalidade: <strong className="text-white uppercase">{order.fulfillment_type}</strong></span>
          </div>

          <div className="pt-2 text-slate-400">
            <span>Serviços ({order.services.length}): </span>
            <span className="text-slate-200">
              {order.services.map((s) => s.name).join(', ')}
            </span>
          </div>
        </div>

        {/* WhatsApp Action Button */}
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Abrir Conversa no WhatsApp Agora</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-[11px] text-center text-slate-400">
            Caso a janela do WhatsApp não tenha aberto automaticamente, clique no botão acima.
          </p>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Novo Agendamento
          </button>

          <button
            onClick={onViewDashboard}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Ver no Painel de OS
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
