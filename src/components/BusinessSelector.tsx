import React from 'react';
import { Building2, Sparkles, AlertCircle, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';
import { Business } from '../types';

interface BusinessSelectorProps {
  businesses: Business[];
  selectedBusiness: Business | null;
  onSelectBusiness: (business: Business) => void;
  isLoading: boolean;
  onRefresh: () => void;
  isLive: boolean;
}

export const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  isLoading,
  onRefresh,
  isLive,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
              <span>Estabelecimento Selecionado (Tabela &apos;businesses&apos;)</span>
              {isLive ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Supabase
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-normal">
                  (Demonstração / Padrão)
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
              {selectedBusiness ? selectedBusiness.name : 'Carregando estabelecimento...'}
            </h2>

            {selectedBusiness && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                {selectedBusiness.address && <span>{selectedBusiness.address}</span>}
                {selectedBusiness.phone && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{selectedBusiness.phone}</span>
                  </>
                )}
                <span aria-hidden="true" className="text-slate-600">·</span>
                {/* Rule indicator badge */}
                {selectedBusiness.has_mobile_vip_unit ? (
                  <span className="inline-flex items-center gap-1 text-cyan-300 font-medium bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded text-[11px]">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    Possui Unidade Móvel VIP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-300 font-medium bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded text-[11px]">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    Apenas Pátio & Valet (Sem Unidade Móvel)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Switch / Branch selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="relative">
            <select
              value={selectedBusiness?.id || ''}
              onChange={(e) => {
                const found = businesses.find((b) => b.id === e.target.value);
                if (found) onSelectBusiness(found);
              }}
              disabled={isLoading || businesses.length === 0}
              className="appearance-none bg-slate-950 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-medium rounded-xl pl-3.5 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-950 text-white">
                  {b.name} {b.has_mobile_vip_unit ? '(VIP Ativo)' : '(Sem VIP)'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Recarregar estabelecimentos do Supabase"
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
