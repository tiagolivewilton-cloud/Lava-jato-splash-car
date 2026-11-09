import React from 'react';
import { Send, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Business, FulfillmentType, SelectedService, VehicleCategory } from '../types';
import { FULFILLMENT_FEES } from './FulfillmentPicker';
import { VEHICLE_CATEGORIES } from '../data/mockData';

interface OrderSummaryProps {
  business: Business | null;
  vehicleCategory: VehicleCategory;
  selectedServices: SelectedService[];
  fulfillmentType: FulfillmentType;
  customerWhatsApp: string;
  customerName: string;
  address: string;
  isSubmitting: boolean;
  onSubmit: () => void;
  isSupabaseLive: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  business,
  vehicleCategory,
  selectedServices,
  fulfillmentType,
  customerWhatsApp,
  customerName,
  address,
  isSubmitting,
  onSubmit,
  isSupabaseLive,
}) => {
  const categoryInfo = VEHICLE_CATEGORIES.find((c) => c.id === vehicleCategory);
  const servicesSubtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const fulfillmentFee = FULFILLMENT_FEES[fulfillmentType] || 0;
  const totalAmount = servicesSubtotal + fulfillmentFee;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_min, 0);

  // Validation
  const hasServices = selectedServices.length > 0;
  const hasPhone = customerWhatsApp.replace(/\D/g, '').length >= 10;
  const hasRequiredAddress =
    fulfillmentType === 'patio' || (address && address.trim().length >= 5);

  const canSubmit = hasServices && hasPhone && hasRequiredAddress && !isSubmitting;

  const fulfillmentLabels: Record<FulfillmentType, { name: string; tag: string }> = {
    patio: { name: 'Pátio Presencial', tag: 'Leva e busca no local' },
    valet: { name: 'Valet Leva & Traz', tag: 'Com motorista segurado' },
    vip_mobile: { name: '👑 OS VIP (No Local)', tag: 'Unidade móvel em seu endereço' },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-24 space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-wide uppercase">
            Resumo do Pedido / OS
          </h3>
          <span className="text-xs text-cyan-400 font-semibold bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
            {categoryInfo?.name}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {business?.name || 'Estabelecimento não selecionado'}
        </p>
      </div>

      {/* Itemized Services List */}
      <div className="space-y-2 border-t border-b border-slate-800 py-3.5">
        {selectedServices.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Nenhum serviço selecionado ainda. Escolha os serviços na etapa 2.
          </p>
        ) : (
          selectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium truncate pr-2">
                {service.name}
              </span>
              <span className="text-slate-200 font-semibold whitespace-nowrap">
                R$ {service.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))
        )}

        {/* Fulfillment Type Row */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
          <div>
            <span className="text-slate-300 font-medium block">
              {fulfillmentLabels[fulfillmentType].name}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {fulfillmentLabels[fulfillmentType].tag}
            </span>
          </div>
          <span className={`font-semibold whitespace-nowrap ${fulfillmentFee === 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
            {fulfillmentFee === 0 ? 'Grátis' : `+ R$ ${fulfillmentFee.toFixed(2).replace('.', ',')}`}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2 text-xs">
        {totalDuration > 0 && (
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Tempo estimado de execução
            </span>
            <span className="font-semibold text-slate-200">~{totalDuration} minutos</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400">
          <span>Subtotal Serviços</span>
          <span className="text-slate-200">R$ {servicesSubtotal.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Taxa Deslocamento / Modalidade</span>
          <span className="text-slate-200">R$ {fulfillmentFee.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Total da Ordem
          </span>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-cyan-400 font-sans tracking-tight">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
            <span className="block text-[10px] text-slate-400">
              Pagamento na conclusão do serviço
            </span>
          </div>
        </div>
      </div>

      {/* Warnings if validation fails */}
      {!hasServices && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-950/40 border border-amber-900/60 rounded-xl text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Selecione pelo menos 1 serviço para agendar.</span>
        </div>
      )}

      {hasServices && !hasPhone && (
        <div className="flex items-center gap-2 p-2.5 bg-blue-950/40 border border-blue-900/60 rounded-xl text-blue-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Informe o WhatsApp para receber o protocolo da OS.</span>
        </div>
      )}

      {hasServices && hasPhone && !hasRequiredAddress && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-950/40 border border-amber-900/60 rounded-xl text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Preencha o endereço completo para a modalidade {fulfillmentLabels[fulfillmentType].name}.</span>
        </div>
      )}

      {/* Main Submit Button (Requirement #4) */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold text-sm py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/20 disabled:shadow-none transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Gravando Ordem no Supabase...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            <span>Confirmar no WhatsApp</span>
          </>
        )}
      </button>

      {/* Database & Security Guarantee */}
      <div className="pt-2 text-[11px] text-slate-400 space-y-1 text-center">
        <p className="flex items-center justify-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          {isSupabaseLive ? (
            <span>Conexão ativa com banco Supabase (tabela: <code>service_orders</code>)</span>
          ) : (
            <span>Ordem salva localmente & pronta para envio ao WhatsApp</span>
          )}
        </p>
        <p className="text-[10px] text-slate-400">
          Gera protocolo instantâneo de atendimento e envia mensagem pré-formatada.
        </p>
      </div>
    </div>
  );
};
